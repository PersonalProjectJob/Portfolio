import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  extractTextFromFile,
  parseWithQwen,
  parseImageWithQwen,
  type ParsedCVProfile,
} from "./cv-parser.tsx";
import {
  getAiProviderHealth,
  createAiAttempts,
  DEEPSEEK_CHAT_MODEL,
  mergeTokenUsage,
  normalizeTokenUsage,
  requestCompatibleCompletionWithFallback,
} from "./ai-provider.ts";
import {
  adjustChatWeeklyTokens,
  estimateChatReserveTokens,
  guestChatEnforcementKeys,
  isValidClientFingerprint,
  reserveChatWeeklyTokens,
  resolveChatTokenPolicy,
  utcMondayDateString,
} from "./chatTokenBudget.ts";
import {
  buildJobRecommendations,
  scoreAndFilterJobMatches,
  sliceJobsForGuestBrowse,
  type JobRecommendationResponse,
  type JobMatchResult,
  type Locale,
} from "./job-matcher.tsx";

// Import AI guard — blocks anonymous/guest from AI endpoints
import {
  checkAiAccess,
  type AiGuardIdentity,
  type AiEndpoint,
} from "./ai-guard.ts";
import {
  sendVerificationEmail,
  validateVerificationToken,
  consumeVerificationToken,
  markEmailVerified,
  isEmailVerified,
  canResendVerification,
} from "./email-verify.ts";
import { isEmailDomainAllowed } from "./email-domain.ts";

// Import security utilities
import {
  handleCors,
  buildCorsHeaders,
  createJsonResponse,
  createErrorResponse,
  validateRequest,
  sanitizeInput,
  isValidScopeKey,
  authenticateRequest,
  getClientIP,
  getUserAgent,
  escapeTelegramMarkdown,
  lookupIpLocationSummary,
  checkRateLimit,
  RATE_LIMITS,
  createRateLimitHeaders,
  verifyRecaptchaToken,
} from "./shared.ts";

/**
 * Escape SQL LIKE/ILIKE wildcards to prevent wildcard injection attacks.
 * FIX C-02: Prevents users from using % and _ to match arbitrary records.
 */
function escapeILike(str: string): string {
  return str.replace(/%/g, '\\%').replace(/_/g, '\\_');
}

const app = new Hono();

// Enable logger with security notes
app.use('*', (ctx, next) => {
  console.log(`[🔒 Security] ${ctx.req.method} ${ctx.req.path} from ${ctx.req.header('X-Forwarded-For') || 'unknown'}`);
  return next();
});

// Enhanced CORS with dynamic origin allowlist
app.use("/*", async (c, next) => {
  // Handle preflight
  const preflight = handleCors(c.req.raw);
  if (preflight) return preflight;

  // Add CORS headers to response
  await next();
  const origin = c.req.raw.headers.get("Origin");
  const corsHeaders = buildCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    c.res.headers.set(key, value);
  });
});

// Security headers middleware - FIXED for Hono v4
app.use('*', async (c, next) => {
  // Add security headers to all responses
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Continue to next middleware/route
  await next();
});

// Health check endpoint with rate limiting (10 req/min per IP)
app.get("/make-server-4ab11b6d/health", async (c) => {
  const ip = getClientIP(c.req.raw);
  if (ip && ip !== "unknown") {
    const healthRateKey = `health:${ip.replace(/[^a-fA-F0-9.:]/g, "_")}`;
    const healthRateLimit = await checkRateLimit(
      supabaseAdmin,
      healthRateKey,
      "health-check",
      { maxRequests: 10, windowMinutes: 1 },
    );
    if (!healthRateLimit.allowed) {
      return c.json(
        { error: "Rate limit exceeded", retryAfter: healthRateLimit.retryAfter },
        429,
        { headers: createRateLimitHeaders(healthRateLimit) },
      );
    }
  }

  return c.json({ status: "ok", deployedAt: "2026-03-12" });
});

// FIX H-04: Restrict AI provider health check to owner-only access
app.get("/make-server-4ab11b6d/health-ai", async (c) => {
  const auth = await requireOwnerAccess(c);
  if (!auth.ok) return auth.response;

  const checks = getAiProviderHealth();
  const ready = checks.dashscope.ok || checks.deepseek.ok;
  return c.json({
    status: ready ? "ready" : "issues_found",
    checks,
  });
});

type AppRole = "user" | "tester" | "admin" | "owner";

function getOwnerEmail(): string {
  const configured = Deno.env.get("OWNER_EMAIL")?.trim();
  if (!configured) {
    throw new Error(
      "OWNER_EMAIL environment variable is required. Set it in Supabase secrets.",
    );
  }
  return configured;
}

function getOwnerPassword(): string {
  const configured = Deno.env.get("OWNER_PASSWORD")?.trim();
  if (!configured) {
    throw new Error(
      "OWNER_PASSWORD environment variable is required. Set it in Supabase secrets.",
    );
  }
  return configured;
}

function getOwnerDisplayName(): string {
  return Deno.env.get("OWNER_DISPLAY_NAME")?.trim() || "Job360 Owner";
}
const DEFAULT_USER_ROLE: AppRole = "user";
const ROLE_HIERARCHY: AppRole[] = ["user", "tester", "admin", "owner"];
const ASSIGNABLE_ROLES: AppRole[] = ["user", "tester", "admin"];
const ADMIN_PANEL_ROLES = new Set<AppRole>(["admin", "owner"]);

function getRoleRank(role: AppRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

function normalizeUserRole(value: unknown): AppRole {
  switch (value) {
    case "user":
    case "tester":
    case "admin":
    case "owner":
      return value;
    default:
      return DEFAULT_USER_ROLE;
  }
}

function hasAdminPanelAccess(role: AppRole): boolean {
  return ADMIN_PANEL_ROLES.has(role);
}

function hasUnlimitedRoleQuota(role: AppRole): boolean {
  return role === "tester" || role === "admin" || role === "owner";
}

function getAssignableRolesForActor(actorRole: AppRole): AppRole[] {
  return ASSIGNABLE_ROLES.filter((role) => getRoleRank(actorRole) > getRoleRank(role));
}

function buildAuthUserResponse(user: AuthUserRow) {
  const role = normalizeUserRole(user.role);
  return {
    id: user.id,
    userId: user.user_id,
    email: user.email,
    displayName: user.display_name,
    scopeKey: user.scope_key,
    role,
    status: user.status ?? "active",
    loginCount: user.login_count ?? 0,
    lastLoginAt: user.last_login_at,
  };
}

app.post("/make-server-4ab11b6d/auth/register", async (c) => {
  try {
    await ensureOwnerAccountSeeded();

    const body = await c.req.json().catch(() => ({}));
    const captchaToken = typeof body?.captchaToken === "string" ? body.captchaToken : "";
    const captchaAction = typeof body?.captchaAction === "string" ? body.captchaAction : "auth-register";

    // Registration must always pass server-side reCAPTCHA. The previous "burst then captcha"
    // path allowed up to 3 signups per IP per second without any token, and skipped limits when
    // client IP was unknown — trivial for bots to abuse.
    const captchaResult = await verifyRecaptchaToken(c.req.raw, captchaToken, {
      expectedAction: captchaAction,
    });
    if (!captchaResult.allowed) {
      const status = captchaResult.status ?? 403;
      const payload: Record<string, unknown> = {
        error: captchaResult.error,
        errorCodes: captchaResult.errorCodes,
      };
      if (status === 400 && !captchaToken.trim()) {
        payload.captchaRequired = true;
        payload.captchaReason = "required";
      }
      return c.json(payload, status);
    }

    const registerIp = getClientIP(c.req.raw);
    const registerIpRateKey = `reg:${registerIp.replace(/[^a-fA-F0-9.:]/g, "_")}`;
    const registerIpRl = await checkRateLimit(
      supabaseAdmin,
      registerIpRateKey,
      "auth-register-ip",
      RATE_LIMITS.authRegisterIp,
    );
    if (!registerIpRl.allowed) {
      return c.json(
        {
          error: "Rate limit exceeded",
          message: `Too many registrations from this network. Try again after ${new Date(registerIpRl.resetAt).toLocaleTimeString()}`,
          retryAfter: registerIpRl.retryAfter,
        },
        429,
        { headers: createRateLimitHeaders(registerIpRl) },
      );
    }

    const registerFpRaw = c.req.raw.headers.get("X-CareerAI-Browser-Fingerprint");
    if (isValidClientFingerprint(registerFpRaw)) {
      const registerFpKey = `regfp:${registerFpRaw!.trim().toLowerCase().slice(0, 40)}`;
      const registerFpRl = await checkRateLimit(
        supabaseAdmin,
        registerFpKey,
        "auth-register-fp",
        RATE_LIMITS.authRegisterIp,
      );
      if (!registerFpRl.allowed) {
        return c.json(
          {
            error: "Rate limit exceeded",
            message: `Too many registrations from this device. Try again after ${new Date(registerFpRl.resetAt).toLocaleTimeString()}`,
            retryAfter: registerFpRl.retryAfter,
          },
          429,
          { headers: createRateLimitHeaders(registerFpRl) },
        );
      }
    }

    const validation = validateRequest(c.req.raw, { requireAuth: false, allowedMethods: ["POST"] });
    if (!validation.valid) {
      return c.json({ error: validation.error }, 401);
    }

    const name = typeof body?.name === "string" ? body.name : "";
    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return c.json({ error: "Invalid email address" }, 400);
    }

    if (!isEmailDomainAllowed(normalizedEmail)) {
      return c.json({ error: "This email domain is not currently supported.", code: "DOMAIN_NOT_ALLOWED" }, 400);
    }

    if (password.trim().length < 8) {
      return c.json({ error: "Password must be at least 8 characters long" }, 400);
    }

    const existingUser = await fetchAuthUserByEmail(normalizedEmail);
    if (existingUser) {
      await recordAuthAttempt(
        existingUser.user_id,
        existingUser.scope_key,
        false,
        c.req.raw,
      );
      return c.json({ error: "Email already exists" }, 409);
    }

    const userId = crypto.randomUUID();
    const scopeKey = `account:${userId}`;
    const displayName = buildDisplayName(name, normalizedEmail);
    const passwordHash = await hashPassword(password.trim());
    const now = new Date().toISOString();
    const clientIP = getClientIP(c.req.raw);
    const userAgent = getUserAgent(c.req.raw);

    const { data: insertedUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        user_id: userId,
        email: normalizedEmail,
        display_name: displayName,
        scope_key: scopeKey,
        role: DEFAULT_USER_ROLE,
        password_hash: passwordHash,
        status: "active",
        login_count: 0,
        failed_login_count: 0,
        last_login_at: now,
        last_login_ip: clientIP,
        last_login_user_agent: userAgent,
        created_at: now,
        updated_at: now,
      })
      .select("id, user_id, email, display_name, scope_key, role, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent")
      .single();

    if (insertError || !insertedUser) {
      console.log(`[auth-register] Insert error: ${insertError?.message || "unknown"}`);
      return c.json({ error: "Failed to create account" }, 500);
    }

    // Do NOT create a session — user must verify email first.

    await recordAuthAttempt(
      userId,
      scopeKey,
      true,
      c.req.raw,
    );

    // Send Telegram notification for new user registration (best-effort)
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID");
    const telegramMessageThreadId = Deno.env.get("TELEGRAM_MESSAGE_THREAD_ID");
    if (telegramBotToken && telegramChatId) {
      try {
        const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
        const adminUrl = `https://xjtiokkxuqukatjdcqzd.supabase.co/dashboard/project/xjtiokkxuqukatjdcqzd/auth/users`;
        const ipForMsg = (clientIP || "unknown").replace(/`/g, "'");
        const locationLabel = await lookupIpLocationSummary(clientIP);
        const ipLocationBlock =
          `\n\ud83c\udf10 *IP:* \`${ipForMsg}\`\n\ud83d\udccd *Location:* ${escapeTelegramMarkdown(locationLabel)}`;

        // Send to "New Register" topic
        await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
              chat_id: telegramChatId,
              message_thread_id: telegramMessageThreadId ? parseInt(telegramMessageThreadId) : undefined,
              text: `\ud83d\ude80 *New Register*\n\n\ud83d\udc64 *Display Name:* ${displayName}\n\ud83d\udce7 *Email:* ${normalizedEmail}\n\ud83d\udccc *Feature:* account-registration${ipLocationBlock}\n\ud83d\udd50 *Date:* ${now}`,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "\ud83d\udc41\ufe0f View in Admin Panel",
                      url: adminUrl,
                    },
                  ],
                ],
              },
            }),
          },
        );
      } catch (tgErr) {
        console.log(`[auth-register] Telegram error (non-blocking): ${tgErr}`);
      }
    }

    // FIX H-02: Record user consent during registration (GDPR compliance)
    try {
      await supabaseAdmin.from("user_consents").insert({
        user_id: userId,
        identifier: normalizedEmail,
        identifier_type: "user",
        consent_types: ["privacy_policy", "terms_of_service"],
        accepted: true,
        accepted_at: new Date().toISOString(),
        ip_address: clientIP,
        user_agent: userAgent,
        doc_version: "1.0",
      });
      console.log(`[auth-register] Consent recorded for user ${userId}`);
    } catch (consentErr) {
      console.log(`[auth-register] Consent recording error (non-blocking): ${consentErr}`);
      // Don't fail registration if consent recording fails
    }

    // Send verification email — blocking for register flow so user gets clear feedback
    const siteUrl = c.req.header("Origin") || c.req.header("Referer")?.replace(/\/[^/]*$/, "") || "https://careerai.vn";
    let emailSent = false;
    try {
      const emailResult = await sendVerificationEmail(normalizedEmail, userId, displayName, siteUrl);
      emailSent = emailResult.success;
    } catch (err) {
      console.log(`[auth-register] Verification email error: ${err}`);
    }

    return c.json({
      success: true,
      code: "REGISTRATION_PENDING_VERIFICATION",
      emailSent,
      email: normalizedEmail,
    });
  } catch (err) {
    // FIX C-03: Log detailed error server-side, return generic message to client
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    console.error(`[auth-register] Registration failed: ${errorMessage}`);
    if (err instanceof Error && err.stack) {
      console.error(`[auth-register] Stack trace: ${err.stack}`);
    }
    return c.json({ error: "Registration failed. Please try again." }, 500);
  }
});

async function verifyOwnerCredentialsFromSecrets(email: string, password: string): Promise<{ isOwner: boolean; ownerEmail?: string; ownerPassword?: string }> {
  try {
    const ownerEmail = Deno.env.get("OWNER_EMAIL")?.trim();
    const ownerPassword = Deno.env.get("OWNER_PASSWORD")?.trim();
    
    if (!ownerEmail || !ownerPassword) {
      return { isOwner: false };
    }
    
    const normalizedSecretEmail = normalizeEmail(ownerEmail);
    const normalizedInputEmail = normalizeEmail(email);
    
    if (normalizedInputEmail === normalizedSecretEmail) {
      const passwordValid = await verifyPassword(password.trim(), await hashPassword(ownerPassword));
      if (passwordValid) {
        return { isOwner: true, ownerEmail: normalizedSecretEmail, ownerPassword };
      }
    }
    
    return { isOwner: false };
  } catch (error) {
    console.warn(`[owner-auth] Error checking owner credentials: ${error}`);
    return { isOwner: false };
  }
}

app.post("/make-server-4ab11b6d/auth/login", async (c) => {
  try {
    await ensureOwnerAccountSeeded();

    const body = await c.req.json().catch(() => ({}));
    const captchaToken = typeof body?.captchaToken === "string" ? body.captchaToken : "";
    const captchaAction = typeof body?.captchaAction === "string" ? body.captchaAction : "auth-login";

    if (!captchaToken) {
      const burstLimit = await checkAuthBurstCaptcha(c.req.raw, "auth-login-burst");
      if (burstLimit && !burstLimit.allowed) {
        return c.json(
          {
            error: "Captcha required",
            captchaRequired: true,
            captchaReason: "burst",
            retryAfter: burstLimit.retryAfter,
          },
          429,
          { headers: createRateLimitHeaders(burstLimit) },
        );
      }
    } else {
      const captchaResult = await verifyRecaptchaToken(c.req.raw, captchaToken, {
        expectedAction: captchaAction,
      });
      if (!captchaResult.allowed) {
        return c.json(
          {
            error: captchaResult.error,
            errorCodes: captchaResult.errorCodes,
          },
          captchaResult.status ?? 403,
        );
      }
    }

    const validation = validateRequest(c.req.raw, { requireAuth: false, allowedMethods: ["POST"] });
    if (!validation.valid) {
      return c.json({ error: validation.error }, 401);
    }

    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return c.json({ error: "Invalid email address" }, 400);
    }

    if (!password.trim()) {
      return c.json({ error: "Password is required" }, 400);
    }

    // Check if credentials match owner secrets directly (bypass database check)
    const ownerCheck = await verifyOwnerCredentialsFromSecrets(normalizedEmail, password);
    let user: AuthUserRow | null = null;
    
    if (ownerCheck.isOwner) {
      console.log(`[auth-login] Owner credentials matched from secrets`);
      // Fetch owner user from database to get user_id and other fields
      user = await fetchAuthUserByEmail(normalizedEmail);
      
      // If owner not in database yet, create session with minimal info
      if (!user) {
        console.log(`[auth-login] Owner not found in database, creating temporary session`);
        const now = new Date().toISOString();
        const clientIP = getClientIP(c.req.raw);
        const userAgent = getUserAgent(c.req.raw);
        const ownerUserId = crypto.randomUUID();
        const scopeKey = `account:${ownerUserId}`;
        
        // Create owner user in database
        const { data: insertedOwner, error: insertError } = await supabaseAdmin
          .from("users")
          .insert({
            user_id: ownerUserId,
            email: normalizedEmail,
            display_name: getOwnerDisplayName(),
            scope_key: scopeKey,
            role: "owner",
            password_hash: await hashPassword(ownerCheck.ownerPassword!),
            status: "active",
            login_count: 1,
            failed_login_count: 0,
            last_login_at: now,
            last_login_ip: clientIP,
            last_login_user_agent: userAgent,
            created_at: now,
            updated_at: now,
          })
          .select("id, user_id, email, display_name, scope_key, role, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent")
          .single();
        
        if (insertError || !insertedOwner) {
          console.error(`[auth-login] Failed to create owner user: ${insertError?.message}`);
          return c.json({ error: "Login failed" }, 500);
        }
        
        user = insertedOwner;
      }
    } else {
      // Normal user login - fetch from database
      user = await fetchAuthUserByEmail(normalizedEmail);
    }
    console.log(`[auth-login] User found: ${!!user}, status: ${user?.status || 'N/A'}, isOwnerFromSecrets: ${ownerCheck.isOwner}`);
    if (!user || user.status === "disabled") {
      await recordAuthAttempt(
        `email:${normalizedEmail}`,
        validation.scopeKey || "guest:unknown",
        false,
        c.req.raw,
      );
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Skip email verification check for owner accounts authenticated via secrets
    if (!ownerCheck.isOwner) {
      // Block login for users who haven't verified their email yet
      const loginEmailVerified = await isEmailVerified(user.user_id);
      if (!loginEmailVerified) {
        // Verify password first so we don't leak account existence
        const pwValid = await verifyPassword(password.trim(), user.password_hash);
        if (!pwValid) {
          return c.json({ error: "Invalid email or password" }, 401);
        }
        return c.json({
          error: "Email not verified",
          code: "EMAIL_NOT_VERIFIED",
          email: normalizedEmail,
        }, 403);
      }
    } else {
      console.log(`[auth-login] Skipping email verification for owner account`);
    }

    if (!captchaToken && (user.failed_login_count ?? 0) >= AUTH_FAILED_LOGIN_CAPTCHA_THRESHOLD) {
      return createCaptchaRequiredResponse(c, "failed_login_attempts");
    }

    // Skip password verification for owner accounts (already verified from secrets)
    let passwordValid = ownerCheck.isOwner;
    if (!passwordValid) {
      console.log(`[auth-login] Verifying password for user: ${user.user_id}`);
      passwordValid = await verifyPassword(password.trim(), user.password_hash);
      console.log(`[auth-login] Password valid: ${passwordValid}`);
    } else {
      console.log(`[auth-login] Owner password already verified from secrets`);
    }
    
    if (!passwordValid) {
      const failedCount = (user.failed_login_count ?? 0) + 1;
      await supabaseAdmin
        .from("users")
        .update({
          failed_login_count: failedCount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.user_id);

      await recordAuthAttempt(
        user.user_id,
        user.scope_key,
        false,
        c.req.raw,
      );
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const now = new Date().toISOString();
    const clientIP = getClientIP(c.req.raw);
    const userAgent = getUserAgent(c.req.raw);
    const nextLoginCount = (user.login_count ?? 0) + 1;
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        login_count: nextLoginCount,
        failed_login_count: 0,
        last_login_at: now,
        last_login_ip: clientIP,
        last_login_user_agent: userAgent,
        updated_at: now,
      })
      .eq("user_id", user.user_id)
      .select("id, user_id, email, display_name, scope_key, role, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent")
      .single();

    if (updateError || !updatedUser) {
      console.log(`[auth-login] Update error: ${updateError?.message || "unknown"}`);
      return c.json({ error: "Failed to update login state" }, 500);
    }

    const sessionToken = await createAuthSession(updatedUser as AuthUserRow, c.req.raw);

    await recordAuthAttempt(
      user.user_id,
      user.scope_key,
      true,
      c.req.raw,
    );

    // Check email verification status
    const verified = await isEmailVerified(updatedUser.user_id);

    return c.json({
      success: true,
      user: buildAuthUserResponse(updatedUser as AuthUserRow),
      sessionToken,
      emailVerified: verified,
    });
  } catch (err) {
    // FIX C-03: Log detailed error server-side, return generic message to client
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    console.error(`[auth-login] Login failed: ${errorMessage}`);
    if (err instanceof Error && err.stack) {
      console.error(`[auth-login] Stack trace: ${err.stack}`);
    }
    return c.json({ error: "Login failed. Please try again." }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  Email verification endpoints                                       */
/* ------------------------------------------------------------------ */

app.post("/make-server-4ab11b6d/auth/verify-email", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!token) {
      return c.json({ error: "Missing verification token" }, 400);
    }

    const result = await validateVerificationToken(token);
    if (!result.valid) {
      return c.json({
        error: "Verification failed",
        message: result.reason,
        state: "INVALID_TOKEN",
      }, 400);
    }

    // Mark user as verified
    await markEmailVerified(result.userId);
    await consumeVerificationToken(token);

    console.log(`[auth-verify] Email verified for user ${result.userId} (${result.email})`);

    return c.json({
      success: true,
      emailVerified: true,
      userId: result.userId,
    });
  } catch (err) {
    console.log(`[auth-verify] Error: ${err}`);
    return c.json({ error: "Verification failed" }, 500);
  }
});

app.post("/make-server-4ab11b6d/auth/resend-verification", async (c) => {
  try {
    const identity = await resolveRequestIdentity(c.req.raw.headers);
    if (identity.mode !== "account" || !identity.userId || !identity.authVerified) {
      return c.json({ error: "Authentication required" }, 401);
    }

    // Already verified?
    if (await isEmailVerified(identity.userId)) {
      return c.json({ success: true, emailVerified: true, message: "Email already verified" });
    }

    // Check cooldown
    if (!(await canResendVerification(identity.userId))) {
      return c.json({
        error: "Please wait before requesting another verification email",
        cooldown: true,
      }, 429);
    }

    // Load user email
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("email, display_name")
      .eq("user_id", identity.userId)
      .maybeSingle();

    if (!user?.email) {
      return c.json({ error: "User not found" }, 404);
    }

    const siteUrl = c.req.header("Origin") || "https://careerai.vn";
    const result = await sendVerificationEmail(user.email, identity.userId, user.display_name || "", siteUrl);

    if (!result.success) {
      return c.json({ error: result.error || "Failed to send email" }, 500);
    }

    return c.json({ success: true, message: "Verification email sent" });
  } catch (err) {
    console.log(`[auth-resend-verify] Error: ${err}`);
    return c.json({ error: "Failed to send verification email" }, 500);
  }
});

// Unauthenticated resend — for users who registered but can't login yet
app.post("/make-server-4ab11b6d/auth/resend-verification-email", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    if (!email || !isValidEmail(email)) {
      return c.json({ error: "Invalid email address" }, 400);
    }

    // Rate limit by email
    const rlKey = `resend-pub:${email.replace(/[^a-zA-Z0-9@.]/g, "_")}`;
    const rl = await checkRateLimit(supabaseAdmin, rlKey, "resend-pub", {
      maxRequests: 3,
      windowMinutes: 10, // 3 per 10 min
    });
    if (!rl.allowed) {
      return c.json({ error: "Please wait before requesting another email", cooldown: true }, 429);
    }

    const user = await fetchAuthUserByEmail(email);
    // Don't reveal whether user exists — always return success
    if (!user || user.status === "disabled") {
      return c.json({ success: true, message: "If the email is registered, a verification email has been sent." });
    }

    if (await isEmailVerified(user.user_id)) {
      // Already verified — just tell them to login
      return c.json({ success: true, alreadyVerified: true, message: "Email already verified. Please login." });
    }

    const siteUrl = c.req.header("Origin") || "https://careerai.vn";
    await sendVerificationEmail(email, user.user_id, user.display_name || "", siteUrl);

    return c.json({ success: true, message: "Verification email sent" });
  } catch (err) {
    console.log(`[auth-resend-pub] Error: ${err}`);
    return c.json({ error: "Failed to send verification email" }, 500);
  }
});

app.get("/make-server-4ab11b6d/auth/verification-status", async (c) => {
  try {
    const identity = await resolveRequestIdentity(c.req.raw.headers);
    if (identity.mode !== "account" || !identity.userId || !identity.authVerified) {
      return c.json({ emailVerified: false });
    }

    const verified = await isEmailVerified(identity.userId);
    return c.json({ emailVerified: verified });
  } catch (err) {
    console.log(`[auth-verify-status] Error: ${err}`);
    return c.json({ emailVerified: false });
  }
});

/* ------------------------------------------------------------------ */
/*  Cloudinary helpers — parse CLOUDINARY_URL                          */
/*  Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME                */
/* ------------------------------------------------------------------ */
function parseCloudinaryUrl(url: string) {
  const trimmed = url.trim();
  const match = trimmed.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (!match) throw new Error("Invalid CLOUDINARY_URL format. Expected: cloudinary://API_KEY:API_SECRET@CLOUD_NAME");
  return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] };
}

/** Detect Cloudinary resource_type based on file extension */
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "svg"]);
// PDF uploaded as "image" type so Cloudinary can render pages as images (for Vision OCR fallback)
const IMAGE_UPLOAD_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, "pdf"]);

function getCloudinaryResourceType(fileName: string): "image" | "raw" {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return IMAGE_UPLOAD_EXTENSIONS.has(ext) ? "image" : "raw";
}

/** Check if file is a native image (not PDF) */
function isNativeImage(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return IMAGE_EXTENSIONS.has(ext);
}

async function sha1Hex(data: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const PARSE_CV_LIMIT = {
  maxRequests: 1,
  windowMinutes: 60 * 24 * 365 * 20,
} as const;
const PARSE_CV_GUEST_ENDPOINT = "parse-cv-guest";
const PARSE_CV_ACCOUNT_ENDPOINT = "parse-cv-account";

function getParseQuotaEndpoint(mode: RequestSessionMode): string {
  return mode === "account" ? PARSE_CV_ACCOUNT_ENDPOINT : PARSE_CV_GUEST_ENDPOINT;
}

function getParseQuotaUserId(identity: RequestSessionIdentity): string {
  return identity.guestSessionId;
}

async function shouldBypassParseQuota(
  identity: RequestSessionIdentity,
): Promise<boolean> {
  if (identity.mode !== "account" || !identity.userId) {
    return false;
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("user_id", identity.userId)
    .maybeSingle();

  if (error) {
    console.log(`[parse-quota] Failed to resolve role for ${identity.userId}: ${error.message}`);
    return false;
  }

  return hasUnlimitedRoleQuota(normalizeUserRole(user?.role));
}

type RequestSessionMode = "guest" | "account";

interface RequestSessionIdentity {
  mode: RequestSessionMode;
  scopeKey: string;
  guestSessionId: string;
  userId: string | null;
  sessionToken: string | null;
  authVerified: boolean;
  authError?: string;
  authStatus?: number;
}

const LEGACY_GUEST_SCOPE_KEY = "guest:legacy";
const AUTH_SESSION_HEADER = "X-CareerAI-Auth-Token";

function headerValue(headers: Headers, key: string): string | null {
  const value = headers.get(key)?.trim();
  return value ? value : null;
}

function sanitizeScopeSegment(scopeKey: string): string {
  return scopeKey.replace(/[^a-zA-Z0-9_-]/g, "_");
}

interface RequestSessionIdentity {
  mode: "guest" | "account";
  scopeKey: string;
  guestSessionId: string;
  userId: string | null;
  sessionToken: string | null;
  authVerified: boolean;
  browserFingerprint?: string;
}

async function resolveRequestIdentity(headers: Headers): Promise<RequestSessionIdentity> {
  const scopeKeyHeader = headerValue(headers, "X-CareerAI-Scope-Key");
  const scopeModeHeader = headerValue(headers, "X-CareerAI-Scope-Mode")?.toLowerCase();
  const guestSessionIdHeader = headerValue(headers, "X-CareerAI-Guest-Session-Id");
  const userIdHeader = headerValue(headers, "X-CareerAI-User-Id");
  const authTokenHeader = headerValue(headers, AUTH_SESSION_HEADER);
  const browserFingerprintHeader = headerValue(headers, "X-CareerAI-Browser-Fingerprint");
  const guestSessionId = guestSessionIdHeader || LEGACY_GUEST_SCOPE_KEY.slice("guest:".length);

  const makeGuestIdentity = (): RequestSessionIdentity => ({
    mode: "guest",
    scopeKey: `guest:${guestSessionId}`,
    guestSessionId,
    userId: null,
    sessionToken: null,
    authVerified: false,
    browserFingerprint: browserFingerprintHeader || undefined,
  });

  const requestedAccountId =
    userIdHeader ||
    (scopeKeyHeader?.startsWith("account:")
      ? scopeKeyHeader.slice("account:".length).trim()
      : null) ||
    null;

  if (requestedAccountId || scopeModeHeader === "account" || authTokenHeader) {
    if (!authTokenHeader) {
      return {
        ...makeGuestIdentity(),
        authError: "Missing auth session token for account scope",
        authStatus: 401,
      };
    }

    const session = await loadVerifiedSessionFromToken(authTokenHeader);
    if (!session) {
      return {
        ...makeGuestIdentity(),
        authError: "Invalid or expired login session",
        authStatus: 401,
      };
    }

    if (requestedAccountId && requestedAccountId !== session.userId) {
      return {
        ...makeGuestIdentity(),
        authError: "Session does not match the requested account scope",
        authStatus: 403,
      };
    }

    return {
      mode: "account",
      scopeKey: `account:${session.userId}`,
      guestSessionId,
      userId: session.userId,
      sessionToken: authTokenHeader,
      authVerified: true,
      browserFingerprint: browserFingerprintHeader || undefined,
    };
  }

  if (scopeKeyHeader?.startsWith("guest:")) {
    return {
      mode: "guest",
      scopeKey: `guest:${guestSessionId}`,
      guestSessionId,
      userId: null,
      sessionToken: null,
      authVerified: false,
      browserFingerprint: browserFingerprintHeader || undefined,
    };
  }

  return makeGuestIdentity();
}

/* ------------------------------------------------------------------ */
/*  Supabase client — for SQL tables (cv_profiles, cv_positions,       */
/*  cv_education) created by user via Supabase Dashboard               */
/* ------------------------------------------------------------------ */

/**
 * Service-role client with scope headers attached (logging / future DB hooks).
 * IMPORTANT: Supabase bypasses RLS for the service role — every SELECT/DELETE
 * on user-owned tables MUST include `.eq("scope_key", identity.scopeKey)` in app code.
 */
function createScopedSupabaseClient(identity: RequestSessionIdentity) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      global: {
        headers: {
          'X-CareerAI-Scope-Key': identity.scopeKey,
          'X-CareerAI-Scope-Mode': identity.mode,
          'X-CareerAI-Guest-Session-Id': identity.guestSessionId,
          ...(identity.userId && { 'X-CareerAI-User-Id': identity.userId }),
          ...(identity.sessionToken && { 'X-CareerAI-Auth-Token': identity.sessionToken }),
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Base client without scope (for admin operations if needed)
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/* ------------------------------------------------------------------ */
/*  Auth helpers                                                       */
/* ------------------------------------------------------------------ */

interface AuthUserRow {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  scope_key: string;
  role: string | null;
  password_hash: string;
  status: string | null;
  login_count: number | null;
  failed_login_count: number | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  last_login_user_agent: string | null;
}

interface AuthSessionRecord {
  userId: string;
  scopeKey: string;
  role: AppRole;
  status: string | null;
}

const PASSWORD_HASH_ITERATIONS = 210000;
const PASSWORD_SALT_BYTES = 16;
const AUTH_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const AUTH_CAPTCHA_BURST_LIMIT = {
  maxRequests: 3,
  windowMinutes: 1 / 60,
};
const AUTH_FAILED_LOGIN_CAPTCHA_THRESHOLD = 5;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = `${normalized}${"=".repeat((4 - (normalized.length % 4)) % 4)}`;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i] ^ right[i];
  }
  return diff === 0;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function buildDisplayName(name: string | undefined, email: string): string {
  const sanitized = sanitizeInput(name || "");
  if (sanitized) return sanitized;

  const emailPrefix = email.split("@")[0]?.trim();
  return sanitizeInput(emailPrefix || "User") || "User";
}

let ownerSeedPromise: Promise<void> | null = null;

async function ensureOwnerAccountSeeded(): Promise<void> {
  if (!ownerSeedPromise) {
    ownerSeedPromise = (async () => {
      let ownerEmail: string;
      let ownerPassword: string;
      try {
        ownerEmail = getOwnerEmail();
        ownerPassword = getOwnerPassword();
      } catch (error) {
        console.warn(`[owner-seed] ${error instanceof Error ? error.message : "Unknown error"}`);
        return;
      }

      const normalizedEmail = normalizeEmail(ownerEmail);
      const { data: existingOwner, error: existingOwnerError } = await supabaseAdmin
        .from("users")
        .select("user_id, email, role")
        .eq("role", "owner")
        .maybeSingle();

      if (existingOwnerError && existingOwnerError.code !== "PGRST116") {
        throw existingOwnerError;
      }

      if (existingOwner) {
        if (normalizeEmail(existingOwner.email) !== normalizedEmail) {
          console.log("[owner-seed] Existing owner email differs from configured owner. Leaving record untouched.");
        }
        return;
      }

      const { data: existingUserByEmail, error: existingUserByEmailError } = await supabaseAdmin
        .from("users")
        .select("id, user_id, email, display_name, scope_key")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (existingUserByEmailError && existingUserByEmailError.code !== "PGRST116") {
        throw existingUserByEmailError;
      }

      const now = new Date().toISOString();
      const passwordHash = await hashPassword(ownerPassword);
      const ownerDisplayName = getOwnerDisplayName();

      if (existingUserByEmail) {
        const { error } = await supabaseAdmin
          .from("users")
          .update({
            display_name: existingUserByEmail.display_name || ownerDisplayName,
            scope_key: existingUserByEmail.scope_key || `account:${existingUserByEmail.user_id}`,
            role: "owner",
            status: "active",
            password_hash: passwordHash,
            updated_at: now,
          })
          .eq("user_id", existingUserByEmail.user_id);

        if (error) throw error;
        console.log("[owner-seed] Promoted existing account to owner.");
        return;
      }

      const ownerUserId = crypto.randomUUID();
      const { error } = await supabaseAdmin.from("users").insert({
        user_id: ownerUserId,
        email: normalizedEmail,
        display_name: ownerDisplayName,
        scope_key: `account:${ownerUserId}`,
        role: "owner",
        password_hash: passwordHash,
        status: "active",
        login_count: 0,
        failed_login_count: 0,
        created_at: now,
        updated_at: now,
      });

      if (error) throw error;
      console.log("[owner-seed] Owner account seeded.");
    })().catch((error) => {
      ownerSeedPromise = null;
      throw error;
    });
  }

  return ownerSeedPromise;
}

function canManageTargetRole(actorRole: AppRole, targetRole: AppRole): boolean {
  return getRoleRank(actorRole) > getRoleRank(targetRole);
}

function canAssignRole(actorRole: AppRole, nextRole: AppRole): boolean {
  return nextRole !== "owner" && getRoleRank(actorRole) > getRoleRank(nextRole);
}

function coerceRoleInput(value: unknown): AppRole | null {
  if (typeof value !== "string") return null;
  const normalized = normalizeUserRole(value.trim());
  return value.trim() === normalized ? normalized : null;
}

async function hashPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_BYTES))): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PASSWORD_HASH_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  return [
    "pbkdf2_sha256",
    PASSWORD_HASH_ITERATIONS,
    bytesToBase64Url(salt),
    bytesToBase64Url(new Uint8Array(derivedBits)),
  ].join("$");
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algo, iterationsValue, saltValue, hashValue] = storedHash.split("$");
  if (algo !== "pbkdf2_sha256") return false;

  const iterations = Number(iterationsValue);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const salt = base64UrlToBytes(saltValue);
  const expectedHash = base64UrlToBytes(hashValue);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    expectedHash.length * 8,
  );

  return timingSafeEqual(new Uint8Array(derivedBits), expectedHash);
}

async function hashSessionToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return bytesToBase64Url(new Uint8Array(digest));
}

function createSessionToken(): string {
  return `sess_${bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)))}`;
}

async function fetchAuthUserByEmail(email: string): Promise<AuthUserRow | null> {
  await ensureOwnerAccountSeeded();

  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, user_id, email, display_name, scope_key, role, password_hash, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent",
    )
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as AuthUserRow;
}

async function fetchAuthUserBySessionToken(token: string): Promise<AuthUserRow | null> {
  await ensureOwnerAccountSeeded();

  const tokenHash = await hashSessionToken(token);
  const now = new Date().toISOString();

  const { data: session, error: sessionError } = await supabaseAdmin
    .from("auth_sessions")
    .select("user_id, scope_key, expires_at, revoked_at")
    .eq("session_token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", now)
    .maybeSingle();

  if (sessionError || !session) {
    return null;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select(
      "id, user_id, email, display_name, scope_key, role, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent",
    )
    .eq("user_id", session.user_id)
    .maybeSingle();

  if (userError || !user || user.status === "disabled") {
    return null;
  }

  await supabaseAdmin
    .from("auth_sessions")
    .update({ last_seen_at: now })
    .eq("session_token_hash", tokenHash);

  return user as AuthUserRow;
}

async function recordAuthAttempt(
  userId: string,
  scopeKey: string,
  success: boolean,
  request: Request,
): Promise<void> {
  try {
    await supabaseAdmin.from("auth_logs").insert({
      user_id: userId,
      scope_key: scopeKey,
      success,
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
      attempted_at: new Date().toISOString(),
    });
  } catch (error) {
    console.log(`[auth] Failed to record auth attempt: ${error}`);
  }
}

async function createAuthSession(
  user: AuthUserRow,
  request: Request,
): Promise<string> {
  const sessionToken = createSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + AUTH_SESSION_TTL_MS);
  const tokenHash = await hashSessionToken(sessionToken);

  const { error } = await supabaseAdmin.from("auth_sessions").insert({
    user_id: user.user_id,
    scope_key: user.scope_key,
    session_token_hash: tokenHash,
    created_at: now.toISOString(),
    last_seen_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    ip_address: getClientIP(request),
    user_agent: getUserAgent(request),
  });

  if (error) {
    console.log(`[createAuthSession] Failed to insert session: ${error.message}`);
    throw error;
  }

  return sessionToken;
}

async function loadVerifiedSessionFromToken(
  token: string,
): Promise<AuthSessionRecord | null> {
  const user = await fetchAuthUserBySessionToken(token);
  if (!user) return null;

  return {
    userId: user.user_id,
    scopeKey: user.scope_key,
    role: normalizeUserRole(user.role),
    status: user.status,
  };
}

interface AdminRequestContext {
  session: AuthSessionRecord;
  user: AuthUserRow;
  role: AppRole;
}

function parsePaginationParam(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.min(Math.round(parsed), max);
}

function parseBooleanFilter(value: string | undefined): boolean | null {
  if (value == null || value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function createCaptchaRequiredResponse(
  c: any,
  reason: "burst" | "failed_login_attempts",
  retryAfter?: number,
) {
  const payload: Record<string, unknown> = {
    error: "Captcha required",
    captchaRequired: true,
    captchaReason: reason,
  };

  if (typeof retryAfter === "number") {
    payload.retryAfter = retryAfter;
  }

  return c.json(payload, 429);
}

async function checkAuthBurstCaptcha(
  request: Request,
  endpoint: string,
) {
  const clientIP = getClientIP(request);
  if (!clientIP || clientIP === "unknown") {
    const now = new Date();
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(now.getTime() + 60_000).toISOString(),
      retryAfter: 60,
    };
  }

  const burstResult = await checkRateLimit(
    supabaseAdmin,
    `auth-burst:${clientIP}`,
    endpoint,
    AUTH_CAPTCHA_BURST_LIMIT,
  );

  return burstResult.allowed ? null : burstResult;
}

function createAdminUserView(user: AuthUserRow, sessionCount = 0) {
  const role = normalizeUserRole(user.role);
  return {
    id: user.id,
    userId: user.user_id,
    email: user.email,
    displayName: user.display_name,
    scopeKey: user.scope_key,
    role,
    status: user.status ?? "active",
    loginCount: user.login_count ?? 0,
    failedLoginCount: user.failed_login_count ?? 0,
    lastLoginAt: user.last_login_at,
    lastLoginIp: user.last_login_ip,
    lastLoginUserAgent: user.last_login_user_agent,
    sessionCount,
    canAccessAdmin: hasAdminPanelAccess(role),
    hasUnlimitedQuota: hasUnlimitedRoleQuota(role),
  };
}

async function fetchAdminUserMap(userIds: string[]): Promise<Record<string, AuthUserRow>> {
  if (userIds.length === 0) return {};

  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, user_id, email, display_name, scope_key, role, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent",
    )
    .in("user_id", userIds);

  if (error || !data) return {};

  return Object.fromEntries(
    (data as AuthUserRow[]).map((row) => [row.user_id, row]),
  );
}

async function requireAdminAccess(c: any): Promise<
  { ok: true; context: AdminRequestContext } |
  { ok: false; response: Response }
> {
  const validation = validateRequest(c.req.raw, { requireAuth: false });
  if (!validation.valid) {
    return { ok: false, response: c.json({ error: validation.error }, 401) };
  }

  const sessionToken = headerValue(c.req.raw.headers, AUTH_SESSION_HEADER);
  if (!sessionToken) {
    return { ok: false, response: c.json({ error: "Missing auth session token" }, 401) };
  }

  const session = await loadVerifiedSessionFromToken(sessionToken);
  if (!session) {
    return { ok: false, response: c.json({ error: "Invalid or expired login session" }, 401) };
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, user_id, email, display_name, scope_key, role, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent",
    )
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error || !user || user.status === "disabled") {
    return { ok: false, response: c.json({ error: "Account is unavailable" }, 401) };
  }

  const role = normalizeUserRole(user.role);
  if (!hasAdminPanelAccess(role)) {
    return { ok: false, response: c.json({ error: "Admin access required" }, 403) };
  }

  return {
    ok: true,
    context: {
      session,
      user: user as AuthUserRow,
      role,
    },
  };
}

/**
 * FIX H-04: Require owner role to access sensitive endpoints (AI provider keys, etc.)
 */
async function requireOwnerAccess(c: any): Promise<
  { ok: true; context: AdminRequestContext } |
  { ok: false; response: Response }
> {
  const validation = validateRequest(c.req.raw, { requireAuth: false });
  if (!validation.valid) {
    return { ok: false, response: c.json({ error: validation.error }, 401) };
  }

  const sessionToken = headerValue(c.req.raw.headers, AUTH_SESSION_HEADER);
  if (!sessionToken) {
    return { ok: false, response: c.json({ error: "Missing auth session token" }, 401) };
  }

  const session = await loadVerifiedSessionFromToken(sessionToken);
  if (!session) {
    return { ok: false, response: c.json({ error: "Invalid or expired login session" }, 401) };
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, user_id, email, display_name, scope_key, role, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent",
    )
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error || !user || user.status === "disabled") {
    return { ok: false, response: c.json({ error: "Account is unavailable" }, 401) };
  }

  const role = normalizeUserRole(user.role);
  // FIX H-04: Only owner role can access
  if (role !== "owner") {
    return { ok: false, response: c.json({ error: "Owner access required" }, 403) };
  }

  return {
    ok: true,
    context: {
      session,
      user: user as AuthUserRow,
      role,
    },
  };
}

async function buildAdminSystemHealth() {
  const checks: Record<string, { ok: boolean; detail: string }> = {};
  const aiHealth = getAiProviderHealth();

  checks.dashscope = aiHealth.dashscope;
  checks.deepseek = aiHealth.deepseek;
  checks.fallback = aiHealth.fallback;

  try {
    const { count, error } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });
    checks.users = error
      ? { ok: false, detail: `users query error: ${error.message}` }
      : { ok: true, detail: `${count ?? 0} account(s)` };
  } catch (error) {
    checks.users = { ok: false, detail: `users error: ${error}` };
  }

  try {
    const { count, error } = await supabaseAdmin
      .from("auth_sessions")
      .select("*", { count: "exact", head: true })
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString());
    checks.sessions = error
      ? { ok: false, detail: `auth_sessions query error: ${error.message}` }
      : { ok: true, detail: `${count ?? 0} active session(s)` };
  } catch (error) {
    checks.sessions = { ok: false, detail: `auth_sessions error: ${error}` };
  }

  try {
    const { count, error } = await supabaseAdmin
      .from("cv_profiles")
      .select("*", { count: "exact", head: true });
    checks.cvProfiles = error
      ? { ok: false, detail: `cv_profiles query error: ${error.message}` }
      : { ok: true, detail: `${count ?? 0} CV profile(s)` };
  } catch (error) {
    checks.cvProfiles = { ok: false, detail: `cv_profiles error: ${error}` };
  }

  try {
    const { count, error } = await supabaseAdmin
      .from("legal_documents")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    checks.legalDocuments = error
      ? { ok: false, detail: `legal_documents query error: ${error.message}` }
      : { ok: true, detail: `${count ?? 0} active legal document(s)` };
  } catch (error) {
    checks.legalDocuments = { ok: false, detail: `legal_documents error: ${error}` };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("jobs_import")
      .select(`timestamp,error,warning`)
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      checks.jobsImport = { ok: false, detail: `jobs_import query error: ${error.message}` };
    } else if (!data?.timestamp) {
      checks.jobsImport = { ok: false, detail: "No jobs_import data found" };
    } else {
      checks.jobsImport = { ok: true, detail: `Latest import: ${data.timestamp}` };
    }
  } catch (error) {
    checks.jobsImport = { ok: false, detail: `jobs_import error: ${error}` };
  }

  try {
    const { count, error } = await supabaseAdmin
      .from("user_consents")
      .select("*", { count: "exact", head: true });
    checks.userConsents = error
      ? { ok: false, detail: `user_consents query error: ${error.message}` }
      : { ok: true, detail: `${count ?? 0} consent record(s)` };
  } catch (error) {
    checks.userConsents = { ok: false, detail: `user_consents error: ${error}` };
  }

  const status = Object.values(checks).every((check) => check.ok)
    ? "ready"
    : "issues_found";

  return { status, checks };
}

app.get("/make-server-4ab11b6d/admin/me", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  return c.json({
    user: buildAuthUserResponse(auth.context.user),
    permissions: {
      canManageAdmins: auth.context.role === "owner",
      canAssignRoles: getAssignableRolesForActor(auth.context.role),
    },
  });
});

app.get("/make-server-4ab11b6d/admin/summary", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const nowIso = new Date().toISOString();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const { data: usersData, error: usersError } = await supabaseAdmin
    .from("users")
    .select("role,status,last_login_at");

  if (usersError) {
    return c.json({ error: `Failed to load users summary: ${usersError.message}` }, 500);
  }

  const roleCounts: Record<AppRole, number> = {
    user: 0,
    tester: 0,
    admin: 0,
    owner: 0,
  };
  let disabledUsers = 0;
  for (const row of usersData || []) {
    const role = normalizeUserRole((row as Record<string, unknown>).role);
    roleCounts[role] += 1;
    if ((row as Record<string, unknown>).status === "disabled") {
      disabledUsers += 1;
    }
  }

  const { count: activeSessions, error: activeSessionsError } = await supabaseAdmin
    .from("auth_sessions")
    .select("*", { count: "exact", head: true })
    .is("revoked_at", null)
    .gt("expires_at", nowIso);

  if (activeSessionsError) {
    return c.json({ error: `Failed to load session summary: ${activeSessionsError.message}` }, 500);
  }

  const { count: failedLogins24h, error: failedLoginsError } = await supabaseAdmin
    .from("auth_logs")
    .select("*", { count: "exact", head: true })
    .eq("success", false)
    .gte("attempted_at", since24h);

  if (failedLoginsError) {
    return c.json({ error: `Failed to load auth summary: ${failedLoginsError.message}` }, 500);
  }

  const { data: legalDocuments, error: legalDocumentsError } = await supabaseAdmin
    .from("legal_documents")
    .select("id,doc_type,version,effective_date,created_at")
    .eq("is_active", true)
    .order("doc_type", { ascending: true })
    .order("created_at", { ascending: false });

  if (legalDocumentsError) {
    return c.json({ error: `Failed to load legal summary: ${legalDocumentsError.message}` }, 500);
  }

  const { data: latestJobsImport, error: latestJobsImportError } = await supabaseAdmin
    .from("jobs_import")
    .select("timestamp,error,warning")
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestJobsImportError) {
    return c.json({ error: `Failed to load jobs summary: ${latestJobsImportError.message}` }, 500);
  }

  const systemHealth = await buildAdminSystemHealth();
  const alerts: Array<{ level: "info" | "warning" | "critical"; message: string }> = [];

  if ((failedLogins24h ?? 0) >= 10) {
    alerts.push({
      level: "warning",
      message: `${failedLogins24h} failed login attempts were recorded in the last 24 hours.`,
    });
  }

  const activeDocTypes = new Set((legalDocuments || []).map((doc) => doc.doc_type));
  if (!activeDocTypes.has("privacy_policy") || !activeDocTypes.has("terms_of_service")) {
    alerts.push({
      level: "critical",
      message: "One or more required legal documents are missing an active version.",
    });
  }

  if (latestJobsImport?.timestamp) {
    const latestImportTime = new Date(latestJobsImport.timestamp).getTime();
    if (Number.isFinite(latestImportTime) && latestImportTime < sevenDaysAgo) {
      alerts.push({
        level: "warning",
        message: "Jobs import data is older than 7 days.",
      });
    }
  } else {
    alerts.push({
      level: "warning",
      message: "No jobs import data is available yet.",
    });
  }

  if (systemHealth.status !== "ready") {
    alerts.push({
      level: "critical",
      message: "System health checks reported configuration or data issues.",
    });
  }

  return c.json({
    summary: {
      totalAccounts: usersData?.length ?? 0,
      roleCounts,
      disabledUsers,
      activeSessions: activeSessions ?? 0,
      failedLogins24h: failedLogins24h ?? 0,
      activeLegalDocuments: legalDocuments?.length ?? 0,
      latestJobsImportAt: latestJobsImport?.timestamp ?? null,
    },
    activeLegalDocuments: legalDocuments || [],
    alerts,
    systemHealth,
  });
});

app.get("/make-server-4ab11b6d/admin/users", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const search = sanitizeInput(c.req.query("search") || "");
  const requestedRole = c.req.query("role");
  const roleFilter = requestedRole ? coerceRoleInput(requestedRole) : null;
  const statusFilter = c.req.query("status");
  const limit = parsePaginationParam(c.req.query("limit"), 25, 100);
  const offset = parsePaginationParam(c.req.query("offset"), 0, 100000);

  if (requestedRole && !roleFilter) {
    return c.json({ error: "Invalid role filter" }, 400);
  }

  if (statusFilter && statusFilter !== "active" && statusFilter !== "disabled") {
    return c.json({ error: "Invalid status filter" }, 400);
  }

  let query = supabaseAdmin
    .from("users")
    .select(
      "id, user_id, email, display_name, scope_key, role, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    // FIX C-02: Escape ILIKE wildcards to prevent injection
    const safeSearch = escapeILike(search);
    query = query.or(`email.ilike.%${safeSearch}%,display_name.ilike.%${safeSearch}%`);
  }
  if (roleFilter) {
    query = query.eq("role", roleFilter);
  }
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error, count } = await query;
  if (error) {
    return c.json({ error: `Failed to load users: ${error.message}` }, 500);
  }

  const userIds = (data || []).map((user) => user.user_id);
  const sessionCounts: Record<string, number> = {};
  if (userIds.length > 0) {
    const { data: sessions } = await supabaseAdmin
      .from("auth_sessions")
      .select("user_id")
      .in("user_id", userIds)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString());

    for (const session of sessions || []) {
      sessionCounts[session.user_id] = (sessionCounts[session.user_id] ?? 0) + 1;
    }
  }

  return c.json({
    items: (data || []).map((user) => createAdminUserView(user as AuthUserRow, sessionCounts[user.user_id] ?? 0)),
    total: count ?? 0,
    limit,
    offset,
  });
});

app.get("/make-server-4ab11b6d/admin/users/:userId", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const userId = c.req.param("userId");
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, user_id, email, display_name, scope_key, role, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return c.json({ error: `Failed to load user: ${error.message}` }, 500);
  }

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const { data: sessions } = await supabaseAdmin
    .from("auth_sessions")
    .select("id,created_at,last_seen_at,expires_at,revoked_at,ip_address,user_agent")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: recentAuthLogs } = await supabaseAdmin
    .from("auth_logs")
    .select("id,success,ip_address,user_agent,attempted_at")
    .eq("user_id", userId)
    .order("attempted_at", { ascending: false })
    .limit(10);

  return c.json({
    user: createAdminUserView(user as AuthUserRow, (sessions || []).filter((session) => !session.revoked_at).length),
    sessions: sessions || [],
    recentAuthLogs: recentAuthLogs || [],
  });
});

app.put("/make-server-4ab11b6d/admin/users/:userId", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const userId = c.req.param("userId");
  const body = await c.req.json().catch(() => ({}));
  const { data: targetUser, error: targetUserError } = await supabaseAdmin
    .from("users")
    .select(
      "id, user_id, email, display_name, scope_key, role, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (targetUserError) {
    return c.json({ error: `Failed to load target user: ${targetUserError.message}` }, 500);
  }
  if (!targetUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const targetRole = normalizeUserRole(targetUser.role);
  if (!canManageTargetRole(auth.context.role, targetRole)) {
    return c.json({ error: "You cannot modify this account" }, 403);
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (Object.prototype.hasOwnProperty.call(body, "role")) {
    const nextRole = coerceRoleInput(body.role);
    if (!nextRole || !canAssignRole(auth.context.role, nextRole)) {
      return c.json({ error: "You cannot assign the requested role" }, 403);
    }
    updates.role = nextRole;
  }

  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    if (body.status !== "active" && body.status !== "disabled") {
      return c.json({ error: "Invalid status value" }, 400);
    }
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 1) {
    return c.json({ error: "No supported updates provided" }, 400);
  }

  const { data: updatedUser, error: updateError } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("user_id", userId)
    .select(
      "id, user_id, email, display_name, scope_key, role, status, login_count, failed_login_count, last_login_at, last_login_ip, last_login_user_agent",
    )
    .single();

  if (updateError || !updatedUser) {
    return c.json({ error: `Failed to update user: ${updateError?.message || "unknown error"}` }, 500);
  }

  return c.json({ user: createAdminUserView(updatedUser as AuthUserRow) });
});

app.post("/make-server-4ab11b6d/admin/users/:userId/revoke-sessions", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const userId = c.req.param("userId");
  const { data: targetUser, error: targetUserError } = await supabaseAdmin
    .from("users")
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (targetUserError) {
    return c.json({ error: `Failed to load target user: ${targetUserError.message}` }, 500);
  }
  if (!targetUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const targetRole = normalizeUserRole(targetUser.role);
  if (!canManageTargetRole(auth.context.role, targetRole)) {
    return c.json({ error: "You cannot revoke sessions for this account" }, 403);
  }

  const nowIso = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("auth_sessions")
    .update({ revoked_at: nowIso })
    .eq("user_id", userId)
    .is("revoked_at", null);

  if (error) {
    return c.json({ error: `Failed to revoke sessions: ${error.message}` }, 500);
  }

  return c.json({ success: true, revokedAt: nowIso });
});

app.get("/make-server-4ab11b6d/admin/sessions", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const userId = c.req.query("userId");
  const activeOnly = parseBooleanFilter(c.req.query("activeOnly"));
  const limit = parsePaginationParam(c.req.query("limit"), 25, 100);
  const offset = parsePaginationParam(c.req.query("offset"), 0, 100000);

  let query = supabaseAdmin
    .from("auth_sessions")
    .select("id,user_id,scope_key,created_at,last_seen_at,expires_at,revoked_at,ip_address,user_agent", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (userId) {
    query = query.eq("user_id", userId);
  }
  if (activeOnly === true) {
    query = query.is("revoked_at", null).gt("expires_at", new Date().toISOString());
  }
  if (activeOnly === false) {
    query = query.not("revoked_at", "is", null);
  }

  const { data, error, count } = await query;
  if (error) {
    return c.json({ error: `Failed to load sessions: ${error.message}` }, 500);
  }

  const userMap = await fetchAdminUserMap(Array.from(new Set((data || []).map((row) => row.user_id))));

  return c.json({
    items: (data || []).map((session) => {
      const user = userMap[session.user_id];
      const targetRole = normalizeUserRole(user?.role);
      return {
        ...session,
        user: user
          ? {
              userId: user.user_id,
              email: user.email,
              displayName: user.display_name,
              role: targetRole,
              status: user.status ?? "active",
            }
          : null,
        canRevoke: canManageTargetRole(auth.context.role, targetRole),
      };
    }),
    total: count ?? 0,
    limit,
    offset,
  });
});

app.post("/make-server-4ab11b6d/admin/sessions/:sessionId/revoke", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const sessionId = c.req.param("sessionId");
  const { data: session, error: sessionError } = await supabaseAdmin
    .from("auth_sessions")
    .select("id,user_id,revoked_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    return c.json({ error: `Failed to load session: ${sessionError.message}` }, 500);
  }
  if (!session) {
    return c.json({ error: "Session not found" }, 404);
  }

  const { data: targetUser } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("user_id", session.user_id)
    .maybeSingle();

  const targetRole = normalizeUserRole(targetUser?.role);
  if (!canManageTargetRole(auth.context.role, targetRole)) {
    return c.json({ error: "You cannot revoke this session" }, 403);
  }

  const revokedAt = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("auth_sessions")
    .update({ revoked_at: revokedAt })
    .eq("id", sessionId);

  if (error) {
    return c.json({ error: `Failed to revoke session: ${error.message}` }, 500);
  }

  return c.json({ success: true, revokedAt });
});

app.get("/make-server-4ab11b6d/admin/auth-logs", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const userId = c.req.query("userId");
  const successFilter = parseBooleanFilter(c.req.query("success"));
  const limit = parsePaginationParam(c.req.query("limit"), 25, 100);
  const offset = parsePaginationParam(c.req.query("offset"), 0, 100000);

  let query = supabaseAdmin
    .from("auth_logs")
    .select("id,user_id,scope_key,success,ip_address,user_agent,attempted_at", { count: "exact" })
    .order("attempted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (userId) {
    query = query.eq("user_id", userId);
  }
  if (successFilter != null) {
    query = query.eq("success", successFilter);
  }

  const { data, error, count } = await query;
  if (error) {
    return c.json({ error: `Failed to load auth logs: ${error.message}` }, 500);
  }

  const userMap = await fetchAdminUserMap(Array.from(new Set((data || []).map((row) => row.user_id))));

  return c.json({
    items: (data || []).map((row) => {
      const user = userMap[row.user_id];
      return {
        ...row,
        user: user
          ? {
              userId: user.user_id,
              email: user.email,
              displayName: user.display_name,
              role: normalizeUserRole(user.role),
            }
          : null,
      };
    }),
    total: count ?? 0,
    limit,
    offset,
  });
});

app.get("/make-server-4ab11b6d/admin/audit-logs", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const userId = c.req.query("userId");
  const action = c.req.query("action");
  const tableName = c.req.query("tableName");
  const limit = parsePaginationParam(c.req.query("limit"), 25, 100);
  const offset = parsePaginationParam(c.req.query("offset"), 0, 100000);

  let query = supabaseAdmin
    .from("audit_logs")
    .select("id,user_id,scope_key,action,table_name,record_id,old_value,new_value,ip_address,user_agent,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (userId) {
    query = query.eq("user_id", userId);
  }
  if (action) {
    query = query.eq("action", action);
  }
  if (tableName) {
    query = query.eq("table_name", tableName);
  }

  const { data, error, count } = await query;
  if (error) {
    return c.json({ error: `Failed to load audit logs: ${error.message}` }, 500);
  }

  const userMap = await fetchAdminUserMap(Array.from(new Set((data || []).map((row) => row.user_id))));

  return c.json({
    items: (data || []).map((row) => {
      const user = userMap[row.user_id];
      return {
        ...row,
        user: user
          ? {
              userId: user.user_id,
              email: user.email,
              displayName: user.display_name,
              role: normalizeUserRole(user.role),
            }
          : null,
      };
    }),
    total: count ?? 0,
    limit,
    offset,
  });
});

app.get("/make-server-4ab11b6d/admin/legal-documents", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const docType = c.req.query("docType");
  let query = supabaseAdmin
    .from("legal_documents")
    .select("id,doc_type,version,title_vi,title_en,content_vi,content_en,effective_date,is_active,created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (docType) {
    query = query.eq("doc_type", docType);
  }

  const { data, error, count } = await query;
  if (error) {
    return c.json({ error: `Failed to load legal documents: ${error.message}` }, 500);
  }

  return c.json({
    items: data || [],
    total: count ?? (data || []).length,
  });
});

app.post("/make-server-4ab11b6d/admin/legal-documents", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const body = await c.req.json().catch(() => ({}));
  const docType = sanitizeInput(typeof body.docType === "string" ? body.docType : "");
  const version = sanitizeInput(typeof body.version === "string" ? body.version : "");
  const titleVi = typeof body.titleVi === "string" ? body.titleVi.trim() : "";
  const titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() : "";
  const contentVi = typeof body.contentVi === "string" ? body.contentVi.trim() : "";
  const contentEn = typeof body.contentEn === "string" ? body.contentEn.trim() : "";
  const effectiveDate = typeof body.effectiveDate === "string" ? body.effectiveDate : "";
  const isActive = body.isActive === true;

  if (!docType || !version || !titleVi || !titleEn || !contentVi || !contentEn || !effectiveDate) {
    return c.json({ error: "Missing required legal document fields" }, 400);
  }

  if (isActive) {
    await supabaseAdmin
      .from("legal_documents")
      .update({ is_active: false })
      .eq("doc_type", docType);
  }

  const { data, error } = await supabaseAdmin
    .from("legal_documents")
    .insert({
      doc_type: docType,
      version,
      title_vi: titleVi,
      title_en: titleEn,
      content_vi: contentVi,
      content_en: contentEn,
      effective_date: effectiveDate,
      is_active: isActive,
      scope_key: "global:legal",
      created_at: new Date().toISOString(),
    })
    .select("id,doc_type,version,title_vi,title_en,content_vi,content_en,effective_date,is_active,created_at")
    .single();

  if (error || !data) {
    return c.json({ error: `Failed to create legal document: ${error?.message || "unknown error"}` }, 500);
  }

  return c.json({ document: data });
});

app.put("/make-server-4ab11b6d/admin/legal-documents/:id", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (typeof body.version === "string") updates.version = sanitizeInput(body.version);
  if (typeof body.titleVi === "string") updates.title_vi = body.titleVi.trim();
  if (typeof body.titleEn === "string") updates.title_en = body.titleEn.trim();
  if (typeof body.contentVi === "string") updates.content_vi = body.contentVi.trim();
  if (typeof body.contentEn === "string") updates.content_en = body.contentEn.trim();
  if (typeof body.effectiveDate === "string") updates.effective_date = body.effectiveDate;
  if (typeof body.isActive === "boolean") updates.is_active = body.isActive;

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("legal_documents")
    .select("id,doc_type")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return c.json({ error: `Failed to load legal document: ${existingError.message}` }, 500);
  }
  if (!existing) {
    return c.json({ error: "Legal document not found" }, 404);
  }

  if (updates.is_active === true) {
    await supabaseAdmin
      .from("legal_documents")
      .update({ is_active: false })
      .eq("doc_type", existing.doc_type)
      .neq("id", id);
  }

  const { data, error } = await supabaseAdmin
    .from("legal_documents")
    .update(updates)
    .eq("id", id)
    .select("id,doc_type,version,title_vi,title_en,content_vi,content_en,effective_date,is_active,created_at")
    .single();

  if (error || !data) {
    return c.json({ error: `Failed to update legal document: ${error?.message || "unknown error"}` }, 500);
  }

  return c.json({ document: data });
});

app.post("/make-server-4ab11b6d/admin/legal-documents/:id/activate", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const id = c.req.param("id");
  const { data: existing, error: existingError } = await supabaseAdmin
    .from("legal_documents")
    .select("id,doc_type")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return c.json({ error: `Failed to load legal document: ${existingError.message}` }, 500);
  }
  if (!existing) {
    return c.json({ error: "Legal document not found" }, 404);
  }

  await supabaseAdmin
    .from("legal_documents")
    .update({ is_active: false })
    .eq("doc_type", existing.doc_type);

  const { data, error } = await supabaseAdmin
    .from("legal_documents")
    .update({ is_active: true })
    .eq("id", id)
    .select("id,doc_type,version,title_vi,title_en,content_vi,content_en,effective_date,is_active,created_at")
    .single();

  if (error || !data) {
    return c.json({ error: `Failed to activate legal document: ${error?.message || "unknown error"}` }, 500);
  }

  return c.json({ document: data });
});

app.get("/make-server-4ab11b6d/admin/user-consents", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const identifier = sanitizeInput(c.req.query("identifier") || "");
  const consentType = sanitizeInput(c.req.query("consentType") || "");
  const limit = parsePaginationParam(c.req.query("limit"), 25, 100);
  const offset = parsePaginationParam(c.req.query("offset"), 0, 100000);

  let query = supabaseAdmin
    .from("user_consents")
    .select("id,identifier,identifier_type,consent_type,accepted,accepted_at,ip_address,user_agent,doc_version,created_at", { count: "exact" })
    .order("accepted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (identifier) {
    query = query.eq("identifier", identifier);
  }
  if (consentType) {
    query = query.eq("consent_type", consentType);
  }

  const { data, error, count } = await query;
  if (error) {
    return c.json({ error: `Failed to load user consents: ${error.message}` }, 500);
  }

  return c.json({
    items: data || [],
    total: count ?? 0,
    limit,
    offset,
  });
});

app.get("/make-server-4ab11b6d/admin/jobs-import", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  const search = sanitizeInput(c.req.query("search") || "");
  const hasErrors = parseBooleanFilter(c.req.query("hasErrors"));
  const limit = parsePaginationParam(c.req.query("limit"), 25, 100);
  const offset = parsePaginationParam(c.req.query("offset"), 0, 100000);

  let query = supabaseAdmin
    .from("jobs_import")
    .select("url,job_title,company_name,job_location,error,warning,timestamp,apply_link", { count: "exact" })
    .order("timestamp", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    // FIX C-02: Escape ILIKE wildcards to prevent injection
    const safeSearch = escapeILike(search);
    query = query.or(`job_title.ilike.%${safeSearch}%,company_name.ilike.%${safeSearch}%,url.ilike.%${safeSearch}%`);
  }
  if (hasErrors === true) {
    query = query.not("error", "is", null);
  }
  if (hasErrors === false) {
    query = query.is("error", null);
  }

  const { data, error, count } = await query;
  if (error) {
    return c.json({ error: `Failed to load jobs import records: ${error.message}` }, 500);
  }

  return c.json({
    items: data || [],
    total: count ?? 0,
    limit,
    offset,
  });
});

app.get("/make-server-4ab11b6d/admin/system-health", async (c) => {
  const auth = await requireAdminAccess(c);
  if (!auth.ok) return auth.response;

  return c.json(await buildAdminSystemHealth());
});

/* ------------------------------------------------------------------ */
/*  SQL-based CV profile storage helpers                                */
/*                                                                     */
/*  Tables (created by user in Supabase Dashboard):                    */
/*    cv_profiles   — main profile row                                 */
/*    cv_positions  — work history (FK → cv_profiles.id)              */
/*    cv_education  — education    (FK → cv_profiles.id)              */
/* ------------------------------------------------------------------ */

/** Profile summary for list view (snake_case matches SQL columns) */
interface CVProfileSummary {
  id: string;
  full_name: string;
  job_title: string;
  file_name: string;
  parsed_at: string;
  file_url: string;
}

/** Result from saving a profile — includes warnings for partial failures */
interface SaveProfileResult {
  id: string;
  warnings: string[];
}

/** Save a parsed CV profile to SQL tables */
async function saveProfileToSQL(
  profile: ParsedCVProfile,
  identity: RequestSessionIdentity,
): Promise<SaveProfileResult> {
  const warnings: string[] = [];

  // 1. Insert into cv_profiles with scoped client
  const scopedSupabase = createScopedSupabaseClient(identity);
  
  const { data: inserted, error: profileErr } = await scopedSupabase
    .from("cv_profiles")
    .insert({
      scope_key: identity.scopeKey,
      full_name: profile.fullName || "",
      job_title: profile.jobTitle || "",
      experience_summary: profile.experienceSummary || "",
      raw_text_length: profile.rawTextLength || 0,
      parsed_at: profile.parsedAt || new Date().toISOString(),
      file_url: profile.fileUrl || "",
      file_name: profile.fileName || "",
    })
    .select("id")
    .single();

  if (profileErr || !inserted) {
    console.log(`[sql-cv] Error inserting cv_profiles: ${JSON.stringify(profileErr)}`);
    throw new Error(`Failed to insert cv_profiles: ${profileErr?.message} (code: ${profileErr?.code}, details: ${profileErr?.details}, hint: ${profileErr?.hint})`);
  }

  const profileId = inserted.id;
  console.log(`[sql-cv] Inserted cv_profiles id=${profileId} (${profile.fullName || "unknown"})`);

  // 2. Insert positions into cv_positions with same scope_key
  if (profile.recentPositions && profile.recentPositions.length > 0) {
    const positionRows = profile.recentPositions.map((pos, idx) => ({
      cv_profile_id: profileId,
      scope_key: identity.scopeKey,  // Inherit from parent
      company: pos.company || "",
      role: pos.role || "",
      period: pos.period || "",
      highlights: pos.highlights || "",
      sort_order: idx,
    }));

    console.log(`[sql-cv] Attempting to insert ${positionRows.length} positions. Sample row: ${JSON.stringify(positionRows[0])}`);

    const { error: posErr } = await scopedSupabase
      .from("cv_positions")
      .insert(positionRows);

    if (posErr) {
      const detail = `cv_positions INSERT failed: ${posErr.message} (code: ${posErr.code}, details: ${posErr.details}, hint: ${posErr.hint})`;
      console.log(`[sql-cv] ${detail}`);
      warnings.push(detail);
    } else {
      console.log(`[sql-cv] Inserted ${positionRows.length} positions for profile ${profileId}`);
    }
  } else {
    console.log(`[sql-cv] No positions to insert (recentPositions is empty)`);
    warnings.push("No positions data extracted from CV");
  }

  // 3. Insert education into cv_education with same scope_key
  if (profile.education && profile.education.length > 0) {
    const eduRows = profile.education.map((edu, idx) => ({
      cv_profile_id: profileId,
      scope_key: identity.scopeKey,  // Inherit from parent
      institution: edu.institution || "",
      degree: edu.degree || "",
      year: edu.year || "",
    }));

    console.log(`[sql-cv] Attempting to insert ${eduRows.length} education rows. Sample row: ${JSON.stringify(eduRows[0])}`);

    const { error: eduErr } = await scopedSupabase
      .from("cv_education")
      .insert(eduRows);

    if (eduErr) {
      const detail = `cv_education INSERT failed: ${eduErr.message} (code: ${eduErr.code}, details: ${eduErr.details}, hint: ${eduErr.hint})`;
      console.log(`[sql-cv] ${detail}`);
      warnings.push(detail);
    } else {
      console.log(`[sql-cv] Inserted ${eduRows.length} education rows for profile ${profileId}`);
    }
  } else {
    console.log(`[sql-cv] No education to insert (education is empty)`);
    warnings.push("No education data extracted from CV");
  }

  // 4. Insert skills into cv_skills with same scope_key
  if (profile.skills && profile.skills.length > 0) {
    const skillRows = profile.skills.map((skill, idx) => ({
      cv_profile_id: profileId,
      scope_key: identity.scopeKey,
      skill: skill.trim(),
      sort_order: idx,
    }));

    console.log(`[sql-cv] Attempting to insert ${skillRows.length} skills. Sample: ${skillRows[0].skill}`);

    const { error: skillErr } = await scopedSupabase
      .from("cv_skills")
      .insert(skillRows);

    if (skillErr) {
      const detail = `cv_skills INSERT failed: ${skillErr.message} (code: ${skillErr.code}, details: ${skillErr.details}, hint: ${skillErr.hint})`;
      console.log(`[sql-cv] ${detail}`);
      warnings.push(detail);
    } else {
      console.log(`[sql-cv] Inserted ${skillRows.length} skills for profile ${profileId}`);
    }
  } else {
    console.log(`[sql-cv] No skills to insert`);
  }

  // 5. Insert tools into cv_tools with same scope_key
  if (profile.tools && profile.tools.length > 0) {
    const toolRows = profile.tools.map((tool, idx) => ({
      cv_profile_id: profileId,
      scope_key: identity.scopeKey,
      tool: tool.trim(),
      sort_order: idx,
    }));

    console.log(`[sql-cv] Attempting to insert ${toolRows.length} tools. Sample: ${toolRows[0].tool}`);

    const { error: toolErr } = await scopedSupabase
      .from("cv_tools")
      .insert(toolRows);

    if (toolErr) {
      const detail = `cv_tools INSERT failed: ${toolErr.message} (code: ${toolErr.code}, details: ${toolErr.details}, hint: ${toolErr.hint})`;
      console.log(`[sql-cv] ${detail}`);
      warnings.push(detail);
    } else {
      console.log(`[sql-cv] Inserted ${toolRows.length} tools for profile ${profileId}`);
    }
  } else {
    console.log(`[sql-cv] No tools to insert`);
  }

  // 6. Insert languages into cv_languages with same scope_key
  if (profile.languages && profile.languages.length > 0) {
    const langRows = profile.languages.map((lang, idx) => {
      // Parse "Language - Proficiency" format if present
      const parts = lang.split(" - ");
      const languageName = parts[0]?.trim() || lang;
      const proficiency = parts[1]?.trim() || "";
      
      return {
        cv_profile_id: profileId,
        scope_key: identity.scopeKey,
        language: languageName,
        proficiency,
        sort_order: idx,
      };
    });

    console.log(`[sql-cv] Attempting to insert ${langRows.length} languages. Sample: ${langRows[0].language}`);

    const { error: langErr } = await scopedSupabase
      .from("cv_languages")
      .insert(langRows);

    if (langErr) {
      const detail = `cv_languages INSERT failed: ${langErr.message} (code: ${langErr.code}, details: ${langErr.details}, hint: ${langErr.hint})`;
      console.log(`[sql-cv] ${detail}`);
      warnings.push(detail);
    } else {
      console.log(`[sql-cv] Inserted ${langRows.length} languages for profile ${profileId}`);
    }
  } else {
    console.log(`[sql-cv] No languages to insert`);
  }

  // 7. Insert certifications into cv_certifications with same scope_key
  if (profile.certifications && profile.certifications.length > 0) {
    const certRows = profile.certifications.map((cert, idx) => ({
      cv_profile_id: profileId,
      scope_key: identity.scopeKey,
      name: cert.name || "",
      issuer: cert.issuer || "",
      year: cert.year || "",
      sort_order: idx,
    }));

    console.log(`[sql-cv] Attempting to insert ${certRows.length} certifications. Sample: ${certRows[0].name}`);

    const { error: certErr } = await scopedSupabase
      .from("cv_certifications")
      .insert(certRows);

    if (certErr) {
      const detail = `cv_certifications INSERT failed: ${certErr.message} (code: ${certErr.code}, details: ${certErr.details}, hint: ${certErr.hint})`;
      console.log(`[sql-cv] ${detail}`);
      warnings.push(detail);
    } else {
      console.log(`[sql-cv] Inserted ${certRows.length} certifications for profile ${profileId}`);
    }
  } else {
    console.log(`[sql-cv] No certifications to insert`);
  }

  // 8. Insert projects into cv_projects with same scope_key
  if (profile.projects && profile.projects.length > 0) {
    const projectRows = profile.projects.map((proj, idx) => ({
      cv_profile_id: profileId,
      scope_key: identity.scopeKey,
      name: proj.name || "",
      description: proj.description || "",
      technologies: proj.technologies || "",
      sort_order: idx,
    }));

    console.log(`[sql-cv] Attempting to insert ${projectRows.length} projects. Sample: ${projectRows[0].name}`);

    const { error: projErr } = await scopedSupabase
      .from("cv_projects")
      .insert(projectRows);

    if (projErr) {
      const detail = `cv_projects INSERT failed: ${projErr.message} (code: ${projErr.code}, details: ${projErr.details}, hint: ${projErr.hint})`;
      console.log(`[sql-cv] ${detail}`);
      warnings.push(detail);
    } else {
      console.log(`[sql-cv] Inserted ${projectRows.length} projects for profile ${profileId}`);
    }
  } else {
    console.log(`[sql-cv] No projects to insert`);
  }

  return { id: profileId, warnings };
}

/** Load a full profile with positions & education from SQL */
async function loadProfileFromSQL(
  id: string,
  scopeKey?: string,
): Promise<(ParsedCVProfile & { id: string }) | null> {
  if (!scopeKey?.trim()) {
    console.log(`[sql-cv] loadProfileFromSQL: missing scopeKey`);
    return null;
  }

  // Service role bypasses RLS — must filter by scope_key explicitly
  const { data: row, error: profileErr } = await supabaseAdmin
    .from("cv_profiles")
    .select("*")
    .eq("id", id)
    .eq("scope_key", scopeKey)
    .single();

  if (profileErr || !row) {
    console.log(`[sql-cv] Profile ${id} not found for scope: ${profileErr?.message}`);
    return null;
  }

  const { data: positions } = await supabaseAdmin
    .from("cv_positions")
    .select("*")
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey)
    .order("sort_order", { ascending: true });

  const { data: education } = await supabaseAdmin
    .from("cv_education")
    .select("*")
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey)
    .order("created_at", { ascending: true });

  const { data: skills } = await supabaseAdmin
    .from("cv_skills")
    .select("*")
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey)
    .order("sort_order", { ascending: true });

  const { data: tools } = await supabaseAdmin
    .from("cv_tools")
    .select("*")
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey)
    .order("sort_order", { ascending: true });

  const { data: languages } = await supabaseAdmin
    .from("cv_languages")
    .select("*")
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey)
    .order("sort_order", { ascending: true });

  const { data: certifications } = await supabaseAdmin
    .from("cv_certifications")
    .select("*")
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey)
    .order("sort_order", { ascending: true });

  const { data: projects } = await supabaseAdmin
    .from("cv_projects")
    .select("*")
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey)
    .order("sort_order", { ascending: true });

  // 4. Map to camelCase (matches frontend ParsedCVProfile interface)
  return {
    id: row.id,
    fullName: row.full_name || "",
    jobTitle: row.job_title || "",
    experienceSummary: row.experience_summary || "",
    recentPositions: (positions || []).map((p: Record<string, string>) => ({
      company: p.company || "",
      role: p.role || "",
      period: p.period || "",
      highlights: p.highlights || "",
    })),
    education: (education || []).map((e: Record<string, string>) => ({
      institution: e.institution || "",
      degree: e.degree || "",
      year: e.year || "",
    })),
    skills: (skills || []).map((s: Record<string, string>) => s.skill || "").filter((s: string) => s),
    tools: (tools || []).map((t: Record<string, string>) => t.tool || "").filter((t: string) => t),
    languages: (languages || [])
      .map((l: Record<string, string>) => {
        const lang = l.language || "";
        const prof = l.proficiency || "";
        return prof ? `${lang} - ${prof}` : lang;
      })
      .filter((l: string) => l),
    certifications: (certifications || []).map((c: Record<string, string>) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      year: c.year || "",
    })),
    projects: (projects || []).map((p: Record<string, string>) => ({
      name: p.name || "",
      description: p.description || "",
      technologies: p.technologies || "",
    })),
    rawTextLength: row.raw_text_length || 0,
    parsedAt: row.parsed_at || "",
    fileUrl: row.file_url || "",
    fileName: row.file_name || "",
  };
}

/** Delete a profile and its related positions/education from SQL */
async function deleteProfileFromSQL(id: string, scopeKey?: string): Promise<boolean> {
  if (!scopeKey) {
    console.log(`[sql-cv] Missing scopeKey for delete operation`);
    return false;
  }

  // Create scoped client for RLS
  // Service role bypasses RLS — scope_key required on every delete
  const { error: posErr } = await supabaseAdmin
    .from("cv_positions")
    .delete()
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey);
  if (posErr) console.log(`[sql-cv] Error deleting positions for ${id}: ${posErr.message}`);

  const { error: eduErr } = await supabaseAdmin
    .from("cv_education")
    .delete()
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey);
  if (eduErr) console.log(`[sql-cv] Error deleting education for ${id}: ${eduErr.message}`);

  const { error: skillErr } = await supabaseAdmin
    .from("cv_skills")
    .delete()
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey);
  if (skillErr) console.log(`[sql-cv] Error deleting skills for ${id}: ${skillErr.message}`);

  const { error: toolErr } = await supabaseAdmin
    .from("cv_tools")
    .delete()
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey);
  if (toolErr) console.log(`[sql-cv] Error deleting tools for ${id}: ${toolErr.message}`);

  const { error: langErr } = await supabaseAdmin
    .from("cv_languages")
    .delete()
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey);
  if (langErr) console.log(`[sql-cv] Error deleting languages for ${id}: ${langErr.message}`);

  const { error: certErr } = await supabaseAdmin
    .from("cv_certifications")
    .delete()
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey);
  if (certErr) console.log(`[sql-cv] Error deleting certifications for ${id}: ${certErr.message}`);

  const { error: projErr } = await supabaseAdmin
    .from("cv_projects")
    .delete()
    .eq("cv_profile_id", id)
    .eq("scope_key", scopeKey);
  if (projErr) console.log(`[sql-cv] Error deleting projects for ${id}: ${projErr.message}`);

  const { error: profileErr } = await supabaseAdmin
    .from("cv_profiles")
    .delete()
    .eq("id", id)
    .eq("scope_key", scopeKey);

  if (profileErr) {
    console.log(`[sql-cv] Error deleting profile ${id}: ${profileErr.message}`);
    return false;
  }

  console.log(`[sql-cv] Deleted profile ${id} and all related rows`);
  return true;
}

async function loadLatestProfileFromSQL(
  scopeKey: string,
): Promise<(ParsedCVProfile & { id: string }) | null> {
  if (!scopeKey?.trim()) return null;

  const { data: rows, error } = await supabaseAdmin
    .from("cv_profiles")
    .select("id")
    .eq("scope_key", scopeKey)
    .order("parsed_at", { ascending: false })
    .limit(1);

  if (error) {
    console.log(`[sql-cv] Latest profile query failed for ${scopeKey}: ${error.message}`);
    return null;
  }

  if (!rows || rows.length === 0) {
    return null;
  }

  return loadProfileFromSQL(rows[0].id, scopeKey);
}

/* ------------------------------------------------------------------ */
/*  Format CV profile as structured text for chat context               */
/* ------------------------------------------------------------------ */
function formatCVProfileForChat(profile: ParsedCVProfile & { id: string }): string {
  const sections: string[] = [];

  sections.push(`Hồ sơ CV của ứng viên (đã được phân tích từ file "${profile.fileName || "CV"}"):`);
  sections.push(`- Họ tên: ${profile.fullName}`);
  if (profile.jobTitle) sections.push(`- Vị trí hiện tại / Mục tiêu: ${profile.jobTitle}`);
  if (profile.experienceSummary) sections.push(`- Tổng quan kinh nghiệm: ${profile.experienceSummary}`);

  if (profile.recentPositions.length > 0) {
    sections.push(`\nKinh nghiệm làm việc (${profile.recentPositions.length} vị trí gần nhất):`);
    profile.recentPositions.forEach((pos, i) => {
      sections.push(`  ${i + 1}. ${pos.role} tại ${pos.company}${pos.period ? ` (${pos.period})` : ""}`);
      if (pos.highlights) sections.push(`     Thành tích: ${pos.highlights}`);
    });
  }

  if (profile.education.length > 0) {
    sections.push(`\nHọc vấn:`);
    profile.education.forEach((edu) => {
      sections.push(`  - ${edu.degree} — ${edu.institution}${edu.year ? ` (${edu.year})` : ""}`);
    });
  }

  if (profile.skills.length > 0) {
    sections.push(`\nKỹ năng chuyên môn: ${profile.skills.join(", ")}`);
  }

  if (profile.tools.length > 0) {
    sections.push(`\nCông cụ & Công nghệ: ${profile.tools.join(", ")}`);
  }

  if (profile.languages.length > 0) {
    sections.push(`\nNgôn ngữ: ${profile.languages.join(", ")}`);
  }

  if (profile.certifications.length > 0) {
    sections.push(`\nChứng chỉ & Giải thưởng:`);
    profile.certifications.forEach((cert) => {
      sections.push(`  - ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ""}${cert.year ? ` - ${cert.year}` : ""}`);
    });
  }

  if (profile.projects.length > 0) {
    sections.push(`\nDự án nổi bật:`);
    profile.projects.forEach((proj) => {
      sections.push(`  - ${proj.name}: ${proj.description}${proj.technologies ? ` [${proj.technologies}]` : ""}`);
    });
  }

  return sections.join("\n");
}

/* ------------------------------------------------------------------ */
/*  CV Health Diagnostic — tests Cloudinary, DashScope, SQL tables     */
/*  GET /make-server-4ab11b6d/health-cv                               */
/* ------------------------------------------------------------------ */
app.get("/make-server-4ab11b6d/health-cv", async (c) => {
  const results: Record<string, { ok: boolean; detail: string }> = {};

  // 1. Check CLOUDINARY_URL
  const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
  if (!cloudinaryUrl) {
    results.cloudinary = { ok: false, detail: "CLOUDINARY_URL not set. Please add this secret." };
  } else {
    try {
      const { cloudName } = parseCloudinaryUrl(cloudinaryUrl);
      results.cloudinary = { ok: true, detail: `Cloud: ${cloudName}` };
    } catch (e) {
      results.cloudinary = { ok: false, detail: `Invalid format: ${e}` };
    }
  }

  // 2. Check AI provider keys
  const aiHealth = getAiProviderHealth();
  results.dashscope = aiHealth.dashscope;
  results.deepseek = aiHealth.deepseek;
  results.fallback = aiHealth.fallback;

  // 3. Check SQL tables connectivity
  try {
    const { count, error } = await supabase
      .from("cv_profiles")
      .select("*", { count: "exact", head: true });
    if (error) {
      results.database = { ok: false, detail: `cv_profiles query error: ${error.message}` };
    } else {
      results.database = { ok: true, detail: `cv_profiles table OK, ${count ?? 0} profile(s)` };
    }
  } catch (e) {
    results.database = { ok: false, detail: `Database connection error: ${e}` };
  }

  // 4. Check cv_positions table
  try {
    const { error } = await supabase
      .from("cv_positions")
      .select("*", { count: "exact", head: true });
    if (error) {
      results.positionsTable = { ok: false, detail: `cv_positions query error: ${error.message}` };
    } else {
      results.positionsTable = { ok: true, detail: "cv_positions table OK" };
    }
  } catch (e) {
    results.positionsTable = { ok: false, detail: `cv_positions error: ${e}` };
  }

  // 5. Check cv_education table
  try {
    const { error } = await supabase
      .from("cv_education")
      .select("*", { count: "exact", head: true });
    if (error) {
      results.educationTable = { ok: false, detail: `cv_education query error: ${error.message}` };
    } else {
      results.educationTable = { ok: true, detail: "cv_education table OK" };
    }
  } catch (e) {
    results.educationTable = { ok: false, detail: `cv_education error: ${e}` };
  }

  // 6. Check jobs_import table
  try {
    const { count, error } = await supabase
      .from("jobs_import")
      .select("*", { count: "exact", head: true });
    if (error) {
      results.jobsImport = { ok: false, detail: `saved jobs query error: ${error.message}` };
    } else {
      results.jobsImport = { ok: true, detail: `saved jobs table OK, ${count ?? 0} job(s)` };
    }
  } catch (e) {
    results.jobsImport = { ok: false, detail: `saved jobs error: ${e}` };
  }

  // 7. Check legal_documents table
  try {
    const { count, error } = await supabase
      .from("legal_documents")
      .select("*", { count: "exact", head: true });
    if (error) {
      results.legalDocuments = { ok: false, detail: `legal_documents query error: ${error.message}` };
    } else {
      results.legalDocuments = { ok: true, detail: `legal_documents table OK, ${count ?? 0} document(s)` };
    }
  } catch (e) {
    results.legalDocuments = { ok: false, detail: `legal_documents error: ${e}` };
  }

  // 8. Check user_consents table
  try {
    const { count, error } = await supabase
      .from("user_consents")
      .select("*", { count: "exact", head: true });
    if (error) {
      results.userConsents = { ok: false, detail: `user_consents query error: ${error.message}` };
    } else {
      results.userConsents = { ok: true, detail: `user_consents table OK, ${count ?? 0} consent(s)` };
    }
  } catch (e) {
    results.userConsents = { ok: false, detail: `user_consents error: ${e}` };
  }

  const allOk =
    results.cloudinary?.ok === true &&
    results.dashscope?.ok === true &&
    results.database?.ok === true &&
    results.positionsTable?.ok === true &&
    results.educationTable?.ok === true &&
    results.jobsImport?.ok === true &&
    results.legalDocuments?.ok === true &&
    results.userConsents?.ok === true;
  console.log(`[health-cv] Diagnostic complete: ${allOk ? "ALL OK" : "ISSUES FOUND"}`);

  return c.json({ status: allOk ? "ready" : "issues_found", checks: results });
});

/* ------------------------------------------------------------------ */
/*  Search endpoint — proxies to n8n webhook with KV cache             */
/*  POST /make-server-4ab11b6d/search                                  */
/*  Body: { query: string, filters?: Record<string, string> }         */
/* ------------------------------------------------------------------ */
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const JOB_RECOMMENDATION_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function hasJobUrl(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const typed = payload as {
    bestMatch?: { job?: { url?: unknown } | null } | null;
    matches?: Array<{ job?: { url?: unknown } | null } | null> | null;
  };

  const bestMatchUrl = typed.bestMatch?.job?.url;
  if (typeof bestMatchUrl === "string" && bestMatchUrl.trim()) {
    return true;
  }

  return Array.isArray(typed.matches)
    && typed.matches.some((match) => {
      const url = match?.job?.url;
      return typeof url === "string" && url.trim().length > 0;
    });
}

app.post("/make-server-4ab11b6d/search", async (c) => {
  try {
    const body = await c.req.json();
    const { query, filters } = body as {
      query?: string;
      filters?: Record<string, string>;
    };

    if (!query || typeof query !== "string" || !query.trim()) {
      return c.json({ error: "Missing or empty 'query' field" }, 400);
    }

    const trimmedQuery = query.trim().toLowerCase();

    /* ---- Cache check ---- */
    const cacheKey = `search:${trimmedQuery}:${JSON.stringify(filters ?? {})}`;
    const cached = await kv.get(cacheKey);

    if (cached) {
      try {
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        if (parsed._cachedAt && Date.now() - parsed._cachedAt < SEARCH_CACHE_TTL_MS) {
          console.log(`[search] Cache HIT for key="${cacheKey}"`);
          return c.json({ results: parsed.results, cached: true });
        }
      } catch {
        // Cache parse error — proceed to n8n
      }
    }

    /* ---- Forward to n8n webhook ---- */
    const webhookUrl = Deno.env.get("N8N_WEBHOOK_URL");

    if (!webhookUrl) {
      console.log("[search] N8N_WEBHOOK_URL not configured — returning empty results");
      return c.json({
        results: [],
        message: "Search backend not configured yet. Please set N8N_WEBHOOK_URL.",
        cached: false,
      });
    }

    console.log(`[search] Forwarding query="${trimmedQuery}" to n8n webhook`);

    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trimmedQuery, filters: filters ?? {} }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.log(`[search] n8n webhook error: ${n8nResponse.status} ${errorText}`);
      return c.json(
        { error: `n8n webhook returned ${n8nResponse.status}: ${errorText}` },
        502,
      );
    }

    const n8nData = await n8nResponse.json();

    /* ---- Cache the result ---- */
    const cachePayload = {
      results: n8nData,
      _cachedAt: Date.now(),
    };
    await kv.set(cacheKey, cachePayload);
    console.log(`[search] Cached results for key="${cacheKey}"`);

    return c.json({ results: n8nData, cached: false });
  } catch (err) {
    console.log(`[search] Unexpected error: ${err}`);
    return c.json(
      { error: `Search endpoint error: ${err}` },
      500,
    );
  }
});

/* ------------------------------------------------------------------ */
/*  Job import query + chat job-intent (shared seniority helper)        */
/* ------------------------------------------------------------------ */
function detectSeniorityFromTitle(title: string): string | null {
  const normalized = title.toLowerCase();
  if (/(intern|thuc tap)/.test(normalized)) return "Internship";
  if (/(fresher|junior|entry level)/.test(normalized)) return "Entry level";
  if (/(mid|middle|intermediate)/.test(normalized)) return "Mid-Senior level";
  if (/(senior|sr|lead|principal)/.test(normalized)) return "Senior level";
  if (/(manager|head|director|vp)/.test(normalized)) return "Director";
  return null;
}

async function fetchJobsImportForMatching(
  profile: (ParsedCVProfile & { id: string }) | null,
  limit: number,
  excludeJobIds: string[],
): Promise<{ rows: Record<string, unknown>[]; error: string | null }> {
  let query = supabaseAdmin.from("jobs_import").select("*");
  query = query.is("error", null);
  query = query.eq("application_availability", true);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  query = query.gte("timestamp", thirtyDaysAgo.toISOString());
  if (profile?.jobTitle) {
    const seniorityLevel = detectSeniorityFromTitle(profile.jobTitle);
    if (seniorityLevel) {
      query = query.eq("job_seniority_level", seniorityLevel);
    }
  }
  query = query.or("job_num_applicants.is.null,job_num_applicants.lte.100");
  if (excludeJobIds.length > 0) {
    const numericExcludeIds = excludeJobIds.filter((id) => /^\d+$/.test(id));
    if (numericExcludeIds.length > 0) {
      query = query.not("job_posting_id", "in", `(${numericExcludeIds.join(",")})`);
    }
  }
  const { data: jobRows, error: jobErr } = await query
    .order("timestamp", { ascending: false })
    .order("job_num_applicants", { ascending: true, nullsFirst: true })
    .limit(limit);
  if (jobErr) {
    return { rows: [], error: jobErr.message };
  }
  return { rows: jobRows || [], error: null };
}

function userMessageRequestsJobSuggestions(text: string): boolean {
  const t = text.trim();
  if (t.length < 8) return false;
  const s = t.toLowerCase();
  const vi =
    /tìm việc|tim viec|việc làm|viec lam|gợi ý việc|goi y viec|đề xuất việc|de xuat viec|gợi ý job|job phù hợp|viec phù hợp|việc nào phù hợp|con việc phù hợp|có job|có việc|đang tìm việc/i;
  const en =
    /find (me |a |some )?jobs?|job(s)? (for me|recommend|suggestion|suggestions|match|opportunit|opening)|recommend(ations?)? (for )?jobs?|suggest (me |some )?jobs?|vacancies|open positions|job hunt|looking for (a |)job/i;
  return vi.test(t) || en.test(s);
}

/** Đủ dữ liệu hồ sơ để chấm điểm job (user đã đăng nhập + có CV trên SQL). */
function profileHasMatchableData(profile: (ParsedCVProfile & { id: string }) | null): boolean {
  if (!profile) return false;
  if (profile.fullName?.trim()) return true;
  if (profile.jobTitle?.trim()) return true;
  if (profile.recentPositions?.length) return true;
  if (profile.experienceSummary?.trim()) return true;
  if (profile.skills?.length) return true;
  if (profile.tools?.length) return true;
  return false;
}

function formatGuestJobBrowseForChat(
  jobs: Record<string, unknown>[],
  locale: Locale,
  metaFlow: "guest_explore" | "user_no_cv",
): string {
  const items = sliceJobsForGuestBrowse(jobs, 12);
  const meta =
    metaFlow === "guest_explore"
      ? (locale === "vi"
        ? "[META] flow=guest_explore — Khách (chưa đăng nhập), không có hồ sơ CV trên hệ thống. Đây là việc làm tham khảo từ kho dữ liệu, KHÔNG cá nhân hóa. Gợi ý đăng ký/đăng nhập và thêm CV để nhận gợi ý phù hợp."
        : "[META] flow=guest_explore — Guest (not logged in), no saved profile. Exploratory listings only, NOT personalized. Suggest signing in and adding a CV.")
      : (locale === "vi"
        ? "[META] flow=user_no_cv — Đã đăng nhập nhưng chưa có hồ sơ CV đủ để chấm điểm. Danh sách tham khảo từ kho việc làm; khuyên upload/phân tích CV tại mục Hồ sơ để gợi ý đúng hơn."
        : "[META] flow=user_no_cv — Logged in without a saved CV for matching. Reference listings only; suggest uploading a CV in Profile.");

  if (items.length === 0) {
    const empty =
      locale === "vi"
        ? "(Hiện không lấy được việc làm từ kho dữ liệu.)"
        : "(Could not load jobs from the database.)";
    return `\n\n[JOB_SUGGESTIONS_START]\n${meta}\n${empty}\n[JOB_SUGGESTIONS_END]`;
  }
  const header =
    locale === "vi"
      ? "Việc làm tham khảo (từ server, chưa khớp CV):"
      : "Reference jobs from the server (not CV-matched):";
  const lines = items.map((j, i) => {
    const loc =
      j.location &&
      (locale === "vi" ? `\n   Địa điểm: ${j.location}` : `\n   Location: ${j.location}`);
    const url = j.url ? `\n   URL: ${j.url}` : "";
    const lvl = j.level
      ? (locale === "vi" ? `\n   Cấp: ${j.level}` : `\n   Level: ${j.level}`)
      : "";
    return `${i + 1}. ${j.title || "—"} | ${j.company || "—"}${lvl}${loc || ""}${url}`;
  });
  return `\n\n[JOB_SUGGESTIONS_START]\n${meta}\n${header}\n\n${lines.join("\n\n")}\n[JOB_SUGGESTIONS_END]`;
}

function formatJobMatchesForChat(matches: JobMatchResult[], locale: Locale): string {
  const meta =
    locale === "vi"
      ? "[META] flow=user_with_cv — User đã đăng nhập và có hồ sơ CV; điểm dưới đây khớp hồ sơ đã lưu."
      : "[META] flow=user_with_cv — Logged-in user with a saved profile; scores reflect that CV.";

  if (matches.length === 0) {
    const msg =
      locale === "vi"
        ? "(Chưa có việc làm trong kho đạt điểm khớp hồ sơ > 5. Người dùng có thể mở mục Việc làm trên app để xem thêm.)"
        : "(No jobs in the database scored above 5 for this profile. The user can open the Jobs section for more.)";
    return `\n\n[JOB_SUGGESTIONS_START]\n${meta}\n${msg}\n[JOB_SUGGESTIONS_END]`;
  }
  const header =
    locale === "vi"
      ? "Dữ liệu việc làm gợi ý từ server (đã chấm điểm khớp hồ sơ / CV trong hệ thống):"
      : "Job suggestions from the server (scored against the saved profile):";
  const lines = matches.map((m, i) => {
    const j = m.job;
    const loc =
      j.location &&
      (locale === "vi" ? `\n   Địa điểm: ${j.location}` : `\n   Location: ${j.location}`);
    const url = j.url ? `\n   URL: ${j.url}` : "";
    const note = locale === "vi" ? "Gợi ý khớp" : "Fit note";
    return `${i + 1}. ${j.title || "—"} | ${j.company || "—"} | ${locale === "vi" ? "Điểm" : "Score"}: ${m.overallScore}/10${loc || ""}${url}\n   ${note}: ${m.finalRecommendation}`;
  });
  return `\n\n[JOB_SUGGESTIONS_START]\n${meta}\n${header}\n\n${lines.join("\n\n")}\n[JOB_SUGGESTIONS_END]`;
}

/* ------------------------------------------------------------------ */
/*  Chat endpoint — proxies to Qwen (Alibaba Cloud) with streaming     */
/*  POST /make-server-4ab11b6d/chat                                    */
/*  Body: { messages: Array<{role, content}> }                         */
/* ------------------------------------------------------------------ */
/** Client-supplied messages only (before CV/job injection). Limits API abuse / token burn. */
const CHAT_MAX_MESSAGES_PER_REQUEST = 24;
const CHAT_MAX_CLIENT_CONTENT_CHARS = 64_000;

const SYSTEM_PROMPT = `Bạn là AI Career Advisor — trợ lý tư vấn nghề nghiệp chuyên nghiệp cho nền tảng CareerAI (Job360).

Chuyên môn của bạn:
1. **Tư vấn tìm việc làm**: Gợi ý vị trí phù hợp, phân tích JD (Job Description), so sánh với CV ứng viên.
2. **Tư vấn viết CV**: Hướng dẫn cấu trúc CV hiệu quả, tối ưu từ khóa ATS, viết bullet points theo STAR format.
3. **Chuẩn bị phỏng vấn**: Câu hỏi phỏng vấn kỹ thuật và hành vi, chiến lược trả lời, mock interview.
4. **Tham khảo lương và thương lượng**: Mức lương theo vị trí, kinh nghiệm, khu vực. Dữ liệu tham khảo tại https://uxfoundation.vn/ux-map-2025 cho các vị trí UX/Digital.

Quy tắc:
- Trả lời bằng tiếng Việt nếu người dùng hỏi bằng tiếng Việt, bằng tiếng Anh nếu hỏi bằng tiếng Anh.
- Phong cách: chuyên nghiệp, thân thiện, dễ hiểu.
- LUÔN kết thúc mỗi câu trả lời bằng 1 câu hỏi gợi mở để tiếp tục cuộc trò chuyện.
- Sử dụng markdown formatting (bold, list, headers) để dễ đọc.
- Đưa ra lời khuyên cụ thể, actionable, có số liệu khi có thể.
- CHỈ tư vấn các chủ đề liên quan đến nghề nghiệp/tìm việc. Nếu được hỏi chủ đề khác, lịch sự từ chối và gợi ý quay lại chủ đề career.
- Khi tư vấn lương cho các vị trí UX/Digital, có thể tham chiếu dữ liệu từ UX Map 2025 (https://uxfoundation.vn/ux-map-2025).
- Nếu người dùng đính kèm file CV (có thông tin [CV_CONTENT_START]...[CV_CONTENT_END]), hãy phân tích nội dung CV đó một cách chi tiết. Đánh giá cấu trúc, nội dung, và đưa ra lời khuyên cải thiện cụ thể. TUYỆT ĐỐI KHÔNG hiển thị hay tiết lộ bất kỳ URL, link, đường dẫn file nào (Cloudinary, Supabase, hay bất kỳ domain nào). Chỉ nêu tên file khi cần.
- Nếu có hồ sơ CV đã phân tích (trong [CV_PROFILE_START]...[CV_PROFILE_END]), bạn CÓ THỂ truy cập trực tiếp dữ liệu CV đó. Hãy sử dụng thông tin này để tư vấn cá nhân hóa. KHÔNG nói rằng bạn không thể đọc CV — bạn ĐÃ có dữ liệu CV của người dùng. Hãy phân tích chi tiết: đánh giá cấu trúc, nội dung, điểm mạnh/yếu, và đưa ra lời khuyên cụ thể.
- Nếu có nội dung CV trong ngữ cảnh (dù là từ file đính kèm hay hồ sơ đã phân tích), hãy tận dụng nó để tư vấn cá nhân hóa. Đây là ưu tiên hàng đầu.
- Nếu có khối [JOB_SUGGESTIONS_START]...[JOB_SUGGESTIONS_END], đọc dòng [META] flow=... trước: **guest_explore** / **user_no_cv** (danh sách tham khảo, chưa cá nhân hóa theo CV) — giải thích và khuyên đăng nhập/thêm CV khi phù hợp; **user_with_cv** — điểm số là khớp hồ sơ đã lưu, trình bày gợi ý rõ, ưu tiên điểm cao. Có thể đưa URL apply nếu có trong khối (chỉ URL job từ dữ liệu này).`;

app.post("/make-server-4ab11b6d/chat", async (c) => {
  /** Set when server-side weekly token reservation succeeds; refunded on hard errors before stream completes. */
  let chatTokenBudget: { weekStart: string; reserve: number } | null = null;
  /** Rate limit + weekly tokens: account uses scopeKey; guest uses IP (`gip:…`) so headers cannot mint new buckets. */
  let chatServerLimitKey = "";

  try {
    const identity = await resolveRequestIdentity(c.req.raw.headers);

    // ===== AI GUARD: Tiered quota check — BEFORE any LLM call =====
    const aiGuard = await checkAiAccess(supabaseAdmin, identity as AiGuardIdentity, c.req.raw, "chat");
    if (!aiGuard.allowed) {
      return c.json(aiGuard.body ?? { state: aiGuard.state }, aiGuard.status ?? 403,
        aiGuard.headers ? { headers: aiGuard.headers } : undefined);
    }
    // ===== END AI GUARD =====

    const chatEnforceKeys = guestChatEnforcementKeys(
      {
        mode: identity.mode,
        scopeKey: identity.scopeKey,
        userId: identity.userId,
        browserFingerprint: identity.browserFingerprint,
      },
      c.req.raw,
    );
    chatServerLimitKey = chatEnforceKeys.primary;
    const body = await c.req.json();
    const {
      messages,
      attachment,
      cvProfileId,
      model: requestedModel,
      locale: bodyLocale,
      captchaToken,
    } = body as {
      messages?: Array<{ role: string; content: string }>;
      attachment?: { url: string; name: string; isImage?: boolean };
      cvProfileId?: string;
      model?: string;
      locale?: string;
      captchaToken?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return c.json({ error: "Missing or empty 'messages' array" }, 400);
    }

    if (messages.length > CHAT_MAX_MESSAGES_PER_REQUEST) {
      return c.json(
        {
          error: "Too many messages",
          message: `Send at most ${CHAT_MAX_MESSAGES_PER_REQUEST} messages per request.`,
        },
        400,
      );
    }

    let clientContentChars = 0;
    for (const m of messages) {
      const text = typeof m.content === "string" ? m.content : "";
      clientContentChars += text.length;
    }
    if (clientContentChars > CHAT_MAX_CLIENT_CONTENT_CHARS) {
      return c.json(
        {
          error: "Payload too large",
          message: "Conversation text in this request exceeds the allowed size. Shorten messages or start a new chat.",
        },
        413,
      );
    }

    const validation = validateRequest(c.req.raw, {
      requireAuth: false,
      allowedMethods: ["POST"],
    });
    if (!validation.valid) {
      return c.json({ error: validation.error }, 401);
    }
    if (!isValidScopeKey(identity.scopeKey)) {
      return c.json({ error: "Invalid scope key format" }, 400);
    }

    // Guest captcha check removed — guests are now fully blocked by AI guard above.
    // Authenticated users don't need captcha for chat.

    const chatRateLimitConfig = RATE_LIMITS.chat;

    const chatRateLimitResult = await checkRateLimit(
      supabaseAdmin,
      chatEnforceKeys.primary,
      "chat",
      chatRateLimitConfig,
    );
    if (!chatRateLimitResult.allowed) {
      console.log(`[chat] Rate limit exceeded for ${chatEnforceKeys.primary}`);
      return c.json(
        {
          error: "Rate limit exceeded",
          message: `Too many chat requests. Try again after ${new Date(chatRateLimitResult.resetAt).toLocaleTimeString()}`,
          retryAfter: chatRateLimitResult.retryAfter,
        },
        429,
        { headers: createRateLimitHeaders(chatRateLimitResult) },
      );
    }

    if (chatEnforceKeys.applyIpCap) {
      const ipCapResult = await checkRateLimit(
        supabaseAdmin,
        chatEnforceKeys.ipCapKey,
        "chat-guest-ip",
        RATE_LIMITS.chatGuestIpCap,
      );
      if (!ipCapResult.allowed) {
        console.log(`[chat] Guest IP cap exceeded for ${chatEnforceKeys.ipCapKey}`);
        return c.json(
          {
            error: "Rate limit exceeded",
            message: `Too many guest requests from this network. Try again after ${new Date(ipCapResult.resetAt).toLocaleTimeString()}`,
            retryAfter: ipCapResult.retryAfter,
          },
          429,
          { headers: createRateLimitHeaders(ipCapResult) },
        );
      }
    }

    const chatLocale: Locale = bodyLocale === "en" ? "en" : "vi";
    const lastUserRaw = [...messages].reverse().find((m) => m.role === "user");
    const rawUserText = (lastUserRaw?.content ?? "").trim();
    const wantsJobSuggestions = userMessageRequestsJobSuggestions(rawUserText);

    // Validate model — DeepSeek default, Qwen chat models optional
    const ALLOWED_MODELS = [DEEPSEEK_CHAT_MODEL, "qwen-turbo", "qwen-plus"];
    const chatModel = (requestedModel && ALLOWED_MODELS.includes(requestedModel))
      ? requestedModel
      : DEEPSEEK_CHAT_MODEL;
    const attempts = createAiAttempts({
      purpose: "chat",
      requestedModel: chatModel,
    });

    if (attempts.length === 0) {
      console.log("[chat] No AI provider configured");
      return c.json(
        {
          error:
            "No AI provider configured. Please set a primary and/or backup API key in Supabase secrets.",
        },
        500,
      );
    }

    // If there's a file attachment, extract its text content and inject into context
    let cvTextContext = "";
    let loadedSqlProfile: (ParsedCVProfile & { id: string }) | null = null;

    // ── Load parsed CV profile from SQL (for chat context + job matching) ──
    if (!attachment) {
      try {
        loadedSqlProfile = cvProfileId
          ? await loadProfileFromSQL(cvProfileId, identity.scopeKey)
          : await loadLatestProfileFromSQL(identity.scopeKey);
        if (loadedSqlProfile && loadedSqlProfile.fullName) {
          const profileText = formatCVProfileForChat(loadedSqlProfile);
          cvTextContext = `\n\n[CV_PROFILE_START]\n${profileText}\n[CV_PROFILE_END]`;
          console.log(`[chat] Injected parsed CV profile for ${identity.scopeKey}: "${loadedSqlProfile.fullName}" (${profileText.length} chars)`);
        } else {
          console.log(`[chat] No CV profile found for scope ${identity.scopeKey}${cvProfileId ? ` (requested ${cvProfileId})` : ""}`);
        }
      } catch (loadErr) {
        console.log(`[chat] Error loading CV profile for scope ${identity.scopeKey}: ${loadErr}`);
        // Non-blocking — continue without CV data
      }
    } else if (wantsJobSuggestions) {
      try {
        loadedSqlProfile = cvProfileId
          ? await loadProfileFromSQL(cvProfileId, identity.scopeKey)
          : await loadLatestProfileFromSQL(identity.scopeKey);
      } catch (loadErr) {
        console.log(`[chat] Error loading CV profile for job suggestions: ${loadErr}`);
      }
    }

    if (attachment?.url && attachment?.name) {
      try {
        console.log(`[chat] Extracting text from attached file: "${attachment.name}" (${attachment.url.substring(0, 60)}...)`);

        if (attachment.isImage) {
          // For image files, we can't extract text here — tell AI about the image
          cvTextContext = `\n\n[CV_CONTENT_START]\n(File "${attachment.name}" là ảnh CV. Nội dung đã được gửi để phân tích. Hãy hướng dẫn người dùng vào mục "Hồ sơ" để xem kết quả phân tích chi tiết.)\n[CV_CONTENT_END]`;
        } else {
          // Download and extract text from document
          const fileResponse = await fetch(attachment.url);
          if (fileResponse.ok) {
            const buffer = await fileResponse.arrayBuffer();
            const extractedText = await extractTextFromFile(buffer, attachment.name);
            if (extractedText && extractedText.length >= 20) {
              // Truncate to ~4000 chars to avoid token overflow
              const truncated = extractedText.length > 4000
                ? extractedText.substring(0, 4000) + "\n...(nội dung bị cắt bớt do quá dài)"
                : extractedText;
              cvTextContext = `\n\n[CV_CONTENT_START]\nNội dung CV từ file "${attachment.name}":\n${truncated}\n[CV_CONTENT_END]`;
              console.log(`[chat] Extracted ${extractedText.length} chars from "${attachment.name}" (injected ${truncated.length} chars)`);
            } else {
              console.log(`[chat] Extracted text too short (${extractedText?.length || 0} chars) from "${attachment.name}"`);
              cvTextContext = `\n\n[File "${attachment.name}" đã được đính kèm nhưng không trích xuất được nội dung. Hướng dẫn người dùng vào mục "Hồ sơ" để upload và phân tích CV.]`;
            }
          } else {
            console.log(`[chat] Failed to download attachment: ${fileResponse.status}`);
          }
        }
      } catch (extractErr) {
        console.log(`[chat] Error extracting text from attachment: ${extractErr}`);
        // Non-blocking — continue without CV content
      }
    }

    let jobSuggestionsContext = "";
    if (wantsJobSuggestions) {
      try {
        const isGuest = identity.mode === "guest";
        const hasCv = profileHasMatchableData(loadedSqlProfile);
        // Guest hoặc user chưa có CV đủ dữ liệu → query job rộng (không lọc seniority theo CV) + danh sách tham khảo
        const profileForJobQuery = isGuest || !hasCv ? null : loadedSqlProfile;

        const { rows, error: jobQErr } = await fetchJobsImportForMatching(profileForJobQuery, 50, []);
        if (jobQErr) {
          console.log(`[chat] job suggestions jobs_import error: ${jobQErr}`);
        } else if (isGuest || !hasCv) {
          const browseMeta = isGuest ? "guest_explore" : "user_no_cv";
          jobSuggestionsContext = formatGuestJobBrowseForChat(rows, chatLocale, browseMeta);
          console.log(
            `[chat] Job-intent browse (${browseMeta}): ${rows.length} rows → guest-style list (${chatLocale})`,
          );
        } else {
          const matches = scoreAndFilterJobMatches({
            profile: loadedSqlProfile,
            jobs: rows,
            minScore: 5,
            maxMatches: 10,
          });
          jobSuggestionsContext = formatJobMatchesForChat(matches, chatLocale);
          console.log(
            `[chat] Job-intent scored (user_with_cv): ${matches.length} matches from ${rows.length} rows (${chatLocale})`,
          );
        }
      } catch (jobErr) {
        console.log(`[chat] Job suggestions failed: ${jobErr}`);
      }
    }

    // Inject CV + job suggestion context into the last user message
    const contextSuffix = cvTextContext + jobSuggestionsContext;
    const processedMessages = [...messages];
    if (contextSuffix && processedMessages.length > 0) {
      const lastMsg = processedMessages[processedMessages.length - 1];
      if (lastMsg.role === "user") {
        processedMessages[processedMessages.length - 1] = {
          ...lastMsg,
          content: lastMsg.content + contextSuffix,
        };
      }
    }

    // Prepend system prompt
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...processedMessages,
    ];

    const tokenPolicy = await resolveChatTokenPolicy(supabaseAdmin, identity);
    if (tokenPolicy.enforce) {
      const weekStart = utcMondayDateString();
      const reserveTokens = estimateChatReserveTokens(fullMessages);
      if (reserveTokens > tokenPolicy.weeklyLimit) {
        return c.json(
          {
            error: "Weekly quota exceeded",
            message:
              "This request is too large for your remaining weekly AI token budget. Shorten the conversation or try again next week.",
          },
          413,
        );
      }
      const reserved = await reserveChatWeeklyTokens(
        supabaseAdmin,
        chatServerLimitKey,
        weekStart,
        reserveTokens,
        tokenPolicy.weeklyLimit,
      );
      if (!reserved.ok) {
        return c.json(
          {
            error: "Weekly token quota exceeded",
            message: reserved.message ?? "Try again next week or sign in for a higher limit.",
          },
          429,
        );
      }
      chatTokenBudget = { weekStart, reserve: reserveTokens };
    }

    const contextFlags = [
      cvTextContext ? "CV" : null,
      jobSuggestionsContext ? "jobs" : null,
    ]
      .filter(Boolean)
      .join("+");
    console.log(
      `[chat] Sending ${processedMessages.length} messages via ${attempts.map((attempt) => attempt.label).join(" -> ")} (${chatModel}, streaming)${contextFlags ? ` [${contextFlags}]` : ""}`,
    );

    const { response: aiResponse, provider: usedProvider, fallbackUsed } = await requestCompatibleCompletionWithFallback(
      attempts,
      () => ({
        messages: fullMessages,
        stream: true,
        stream_options: {
          include_usage: true,
        },
        temperature: 0.7,
        max_tokens: identity.mode === "guest" ? 768 : 1024,
      }),
      c.req.raw.signal,
    );

    console.log(
      `[chat] Using ${usedProvider.label} (${usedProvider.model})${fallbackUsed ? " after fallback" : ""}`,
    );

    // Stream the SSE response back to the client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process the Qwen SSE stream in background (OpenAI-compatible format)
    (async () => {
      let usagePayload: unknown = null;
      try {
        const reader = aiResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let usageSent = false;

        const writeUsageIfNeeded = async () => {
          if (usageSent || !usagePayload) return;
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ usage: usagePayload })}\n\n`),
          );
          usageSent = true;
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.usage) {
                const normalizedUsage = normalizeTokenUsage(parsed.usage);
                if (normalizedUsage) {
                  usagePayload = normalizedUsage;
                }
              }
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                );
              }
            } catch {
              // Skip malformed JSON chunks
            }
          }
        }

        await writeUsageIfNeeded();
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.log(`[chat] Stream processing error: ${err}`);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
        );
      } finally {
        if (tokenPolicy.enforce && chatTokenBudget) {
          const normalized = usagePayload ? normalizeTokenUsage(usagePayload) : null;
          const actual = normalized?.totalTokens ?? chatTokenBudget.reserve;
          await adjustChatWeeklyTokens(
            supabaseAdmin,
            chatServerLimitKey,
            chatTokenBudget.weekStart,
            actual - chatTokenBudget.reserve,
          );
        }
        await writer.close();
      }
    })();

    const origin = c.req.raw.headers.get("Origin");
    const corsHeaders = buildCorsHeaders(origin);

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        ...corsHeaders,
      },
    });
  } catch (err) {
    if (chatTokenBudget && chatServerLimitKey) {
      await adjustChatWeeklyTokens(
        supabaseAdmin,
        chatServerLimitKey,
        chatTokenBudget.weekStart,
        -chatTokenBudget.reserve,
      );
    }
    console.log(`[chat] Unexpected error: ${err}`);
    return c.json(
      { error: `Chat endpoint error: ${err}` },
      500,
    );
  }
});

/* ------------------------------------------------------------------ */
/*  Upload CV to Cloudinary                                            */
/*  POST /make-server-4ab11b6d/upload-cv                              */
/*  Body: FormData with 'file' field                                  */
/* ------------------------------------------------------------------ */
app.post("/make-server-4ab11b6d/upload-cv", async (c) => {
  try {
    const identity = await resolveRequestIdentity(c.req.raw.headers);
    
    // 🔒 SECURITY: Require authentication for CV upload
    if (identity.mode !== "account" || !identity.userId) {
      console.log(`[🔒 upload-cv] Upload requires account - guest mode not allowed`);
      return c.json({ 
        error: "Authentication required",
        message: "Please create an account to upload CV. This ensures your data is private and secure."
      }, 401);
    }
    
    // 🔒 SECURITY: Validate request
    const validation = validateRequest(c.req.raw, { requireAuth: true });
    if (!validation.valid) {
      console.log(`[🔒 upload-cv] Validation failed: ${validation.error}`);
      return c.json({ error: validation.error }, 401);
    }

    // 🔒 SECURITY: Validate scope key
    if (!isValidScopeKey(identity.scopeKey)) {
      console.log(`[🔒 upload-cv] Invalid scope key: ${identity.scopeKey}`);
      return c.json({ error: "Invalid scope key format" }, 400);
    }

    // 🔒 SECURITY: Rate limiting
    const rateLimitResult = await checkRateLimit(
      supabaseAdmin,
      validation.userId!,
      'upload-cv',
      RATE_LIMITS.uploads
    );

    if (!rateLimitResult.allowed) {
      console.log(`[🔒 upload-cv] Rate limit exceeded for ${validation.userId}`);
      return c.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many upload requests. Try again after ${new Date(rateLimitResult.resetAt).toLocaleTimeString()}`,
          retryAfter: rateLimitResult.retryAfter,
        },
        429,
        {
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
    if (!cloudinaryUrl) {
      console.log("[upload-cv] CLOUDINARY_URL not configured");
      return c.json({ error: "CLOUDINARY_URL not configured. Please set CLOUDINARY_URL secret." }, 500);
    }

    const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl(cloudinaryUrl);

    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return c.json({ error: "No file provided in request body" }, 400);
    }

    // 🔒 SECURITY: Validate file type
    const allowedFileTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const isAllowedExtension = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'webp'].includes(fileExtension);
    
    if (!allowedFileTypes.includes(file.type) && !isAllowedExtension) {
      console.log(`[🔒 upload-cv] Invalid file type: ${file.type}`);
      return c.json({ error: "Invalid file type. Only PDF, DOC, DOCX, TXT, JPG, PNG, and WEBP are allowed." }, 400);
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: "File too large. Maximum size is 10MB." }, 400);
    }

    // 🔒 SECURITY: Log upload attempt
    const clientIP = getClientIP(c.req.raw);
    const userAgent = getUserAgent(c.req.raw);
    console.log(`[🔒 upload-cv] Upload attempt by ${validation.userId} from ${clientIP} - File: ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    const timestamp = Math.floor(Date.now() / 1000);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Simple folder structure: mode/userId or mode/guestSessionId
    const folder = identity.mode === "account"
      ? `Job360/${identity.mode}/${identity.userId}/${today}`
      : `Job360/${identity.mode}/${identity.guestSessionId}/${today}`;

    // Auto-detect resource type: images → /image/upload, documents → /raw/upload
    const resourceType = getCloudinaryResourceType(file.name);

    // Build signed params (MUST be sorted alphabetically for Cloudinary signature)
    const paramsEntries: [string, string][] = [
      ["folder", folder],
      ["timestamp", String(timestamp)],
    ];

    if (resourceType === "image") {
      const eagerTransformForBody = isNativeImage(file.name)
        ? "c_limit,w_2048,h_2048,q_auto,f_auto"
        : "pg_1,c_limit,w_2048,h_2048,q_auto,f_jpg";
      paramsEntries.push(
        ["eager", eagerTransformForBody],
        ["eager_async", "true"],
      );
    }

    // Sort alphabetically for signature
    paramsEntries.sort((a, b) => a[0].localeCompare(b[0]));
    const paramsToSign = paramsEntries.map(([k, v]) => `${k}=${v}`).join("&");
    const signature = await sha1Hex(paramsToSign + apiSecret);

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("api_key", apiKey);
    uploadData.append("timestamp", String(timestamp));
    uploadData.append("signature", signature);
    uploadData.append("folder", folder);

    if (resourceType === "image") {
      const eagerTransformForBody = isNativeImage(file.name)
        ? "c_limit,w_2048,h_2048,q_auto,f_auto"
        : "pg_1,c_limit,w_2048,h_2048,q_auto,f_jpg";
      uploadData.append("eager", eagerTransformForBody);
      uploadData.append("eager_async", "true");
    }

    console.log(`[upload-cv] Uploading "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB, ${resourceType}) to folder ${folder} for ${identity.scopeKey}`);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      { method: "POST", body: uploadData },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.log(`[upload-cv] Cloudinary error: ${res.status} ${errText}`);
      return c.json({ error: `Cloudinary upload failed (${res.status}): ${errText}` }, 502);
    }

    const result = await res.json();
    console.log(`[upload-cv] Uploaded successfully: ${result.public_id} (resource_type=${resourceType})`);

    // Build URLs for frontend
    let optimizedUrl = result.secure_url;
    let imagePreviewUrl = "";
    if (resourceType === "image" && result.secure_url) {
      if (isNativeImage(file.name)) {
        optimizedUrl = result.secure_url.replace(
          "/upload/",
          "/upload/c_limit,w_2048,h_2048,q_auto,f_auto/",
        );
        imagePreviewUrl = optimizedUrl;
      } else {
        // PDF: keep original URL, create separate image preview (pg_1 renders page 1)
        optimizedUrl = result.secure_url;
        imagePreviewUrl = result.secure_url.replace(
          "/upload/",
          "/upload/pg_1,c_limit,w_2048,h_2048,q_auto,f_jpg/",
        );
      }
    }

    return c.json({
      url: optimizedUrl,
      imagePreviewUrl,
      originalUrl: result.secure_url,
      publicId: result.public_id,
      resourceType,
      name: file.name,
      size: file.size,
      format: result.format,
      pages: result.pages || 1,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.log(`[upload-cv] Unexpected error: ${err}`);
    return c.json({ error: `Upload CV error: ${err}` }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  Delete CV(s) from Cloudinary — silent cleanup                      */
/*  POST /make-server-4ab11b6d/delete-cv                              */
/*  Body: { publicIds: string[] }                                     */
/* ------------------------------------------------------------------ */
app.post("/make-server-4ab11b6d/delete-cv", async (c) => {
  try {
    // FIX C-01: Add authentication check
    const auth = await authenticateRequest(c.req.raw);
    if (!auth.success) {
      console.log("[delete-cv] Unauthorized access attempt");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { userId } = auth.context!;
    console.log(`[delete-cv] Delete request from user: ${userId}`);

    const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
    if (!cloudinaryUrl) {
      console.log("[delete-cv] CLOUDINARY_URL not configured — skipping cleanup");
      return c.json({ success: true });
    }

    const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl(cloudinaryUrl);

    const { publicIds } = await c.req.json() as { publicIds?: string[] };
    if (!publicIds || publicIds.length === 0) {
      return c.json({ success: true });
    }

    // FIX C-01: Verify user owns the files being deleted
    const mode = auth.context!.role === "anon" ? "guest" : "account";
    const sessionIdentifier = mode === "account" ? userId : auth.context!.guestSessionId;
    
    const authorizedPublicIds = publicIds.filter(publicId => {
      // Check if publicId contains user's identifier
      return publicId.includes(sessionIdentifier);
    });

    if (authorizedPublicIds.length !== publicIds.length) {
      console.log(`[delete-cv] User ${userId} attempted to delete files they don't own`);
      return c.json({ error: "Unauthorized: cannot delete files owned by other users" }, 403);
    }

    console.log(`[delete-cv] Deleting ${publicIds.length} file(s) from Cloudinary`);

    const results = [];
    for (const publicId of publicIds) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
        const sig = await sha1Hex(paramsToSign + apiSecret);

        let deleteResult = "not found";
        for (const resType of ["raw", "image"] as const) {
          const fd = new FormData();
          fd.append("public_id", publicId);
          fd.append("api_key", apiKey);
          fd.append("timestamp", String(timestamp));
          fd.append("signature", sig);

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resType}/destroy`,
            { method: "POST", body: fd },
          );

          const result = await res.json();
          if (result.result === "ok") {
            deleteResult = "ok";
            console.log(`[delete-cv] Deleted ${publicId} as ${resType}: ok`);
            break;
          }
        }

        results.push({ publicId, result: deleteResult });
      } catch (err) {
        console.log(`[delete-cv] Error deleting ${publicId}: ${err}`);
        results.push({ publicId, result: "error" });
      }
    }

    // FIX C-01: Log deletion for audit trail
    console.log(`[delete-cv] User ${userId} deleted ${results.length} file(s)`);

    return c.json({ success: true, results });
  } catch (err) {
    console.log(`[delete-cv] Unexpected error: ${err}`);
    return c.json({ error: `Delete CV error: ${err}` }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  Waitlist — register name/email, send Resend confirmation           */
/*  POST /make-server-4ab11b6d/waitlist                               */
/*  Body: { name: string, email: string, feature?: string,            */
/*          captchaToken?: string, captchaAction?: string }           */
/* ------------------------------------------------------------------ */
const WAITLIST_RATE_LIMIT = { maxRequests: 10, windowMinutes: 60 } as const;

app.post("/make-server-4ab11b6d/waitlist", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { name, email, feature } = body as {
      name?: string;
      email?: string;
      feature?: string;
      captchaToken?: string;
      captchaAction?: string;
    };

    if (!name?.trim() || !email?.trim()) {
      return c.json({ error: "Name and email are required" }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return c.json({ error: "Invalid email format" }, 400);
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const captchaToken = typeof body?.captchaToken === "string" ? body.captchaToken : "";
    const captchaAction = typeof body?.captchaAction === "string" ? body.captchaAction : "waitlist";
    const captchaResult = await verifyRecaptchaToken(c.req.raw, captchaToken, {
      expectedAction: captchaAction,
    });

    if (!captchaResult.allowed) {
      return c.json(
        {
          error: captchaResult.error,
          errorCodes: captchaResult.errorCodes,
        },
        captchaResult.status ?? 403,
      );
    }

    const waitlistRateLimitKey = `waitlist:${getClientIP(c.req.raw)}`;
    const waitlistRateLimit = await checkRateLimit(
      supabaseAdmin,
      waitlistRateLimitKey,
      "waitlist",
      WAITLIST_RATE_LIMIT,
    );

    if (!waitlistRateLimit.allowed) {
      return c.json(
        {
          error: "Rate limit exceeded",
          message: `Too many attempts. Try again after ${new Date(waitlistRateLimit.resetAt).toLocaleTimeString()}`,
          retryAfter: waitlistRateLimit.retryAfter,
        },
        429,
        { headers: createRateLimitHeaders(waitlistRateLimit) },
      );
    }

    const kvKey = `waitlist:${trimmedEmail}`;
    const existing = await kv.get(kvKey);

    if (existing) {
      console.log(`[waitlist] Already registered: ${trimmedEmail}`);
      return c.json({ success: true, message: "Already registered" });
    }

    await kv.set(
      kvKey,
      JSON.stringify({
        name: trimmedName,
        email: trimmedEmail,
        feature: feature || "general",
        registeredAt: new Date().toISOString(),
      }),
    );

    console.log(`[waitlist] Registered: ${trimmedEmail} (${trimmedName}) for feature: ${feature || "general"}`);

    // Send confirmation email via Resend (best-effort)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Job360 <onboarding@resend.dev>",
            to: [trimmedEmail],
            subject: "Job360 \u2014 C\u1EA3m \u01A1n b\u1EA1n \u0111\u00E3 \u0111\u0103ng k\u00FD!",
            html: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #0B2545; font-size: 24px; margin-bottom: 8px;">Job360</h1>
                <p style="color: #414651; font-size: 16px; line-height: 1.6;">Xin ch\u00E0o <strong>${trimmedName}</strong>,</p>
                <p style="color: #414651; font-size: 16px; line-height: 1.6;">C\u1EA3m \u01A1n b\u1EA1n \u0111\u00E3 \u0111\u0103ng k\u00FD!</p>
                <hr style="border: none; border-top: 1px solid #D5D7DA; margin: 24px 0;" />
                <p style="color: #888; font-size: 12px;">\u00A9 2026 Job360</p>
              </div>
            `,
          }),
        });
        if (!emailRes.ok) {
          console.log(`[waitlist] Resend error: ${emailRes.status}`);
        }
      } catch (emailErr) {
        console.log(`[waitlist] Email error (non-blocking): ${emailErr}`);
      }
    }

    // Send Telegram notification (best-effort)
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID");
    const telegramMessageThreadId = Deno.env.get("TELEGRAM_MESSAGE_THREAD_ID"); // Topic ID for "New Register"
    if (telegramBotToken && telegramChatId) {
      try {
        const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
        const adminUrl = `https://xjtiokkxuqukatjdcqzd.supabase.co/dashboard/project/xjtiokkxuqukatjdcqzd/auth/users`;
        const waitlistIp = getClientIP(c.req.raw);
        const ipForMsg = (waitlistIp || "unknown").replace(/`/g, "'");
        const locationLabel = await lookupIpLocationSummary(waitlistIp);
        const ipLocationBlock =
          `\n\ud83c\udf10 *IP:* \`${ipForMsg}\`\n\ud83d\udccd *Location:* ${escapeTelegramMarkdown(locationLabel)}`;

        // Send to "New Register" topic
        await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
              chat_id: telegramChatId,
              message_thread_id: telegramMessageThreadId ? parseInt(telegramMessageThreadId) : undefined,
              text: `\ud83d\ude80 *New Register*\n\n\ud83d\udc64 *Display Name:* ${trimmedName}\n\ud83d\udce7 *Email:* ${trimmedEmail}\n\ud83d\udccc *Feature:* ${feature || "general"}${ipLocationBlock}\n\ud83d\udd50 *Date:* ${now}`,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "\ud83d\udc41\ufe0f View in Admin Panel",
                      url: adminUrl,
                    },
                  ],
                ],
              },
            }),
          },
        );
      } catch (tgErr) {
        console.log(`[waitlist] Telegram error (non-blocking): ${tgErr}`);
      }
    }

    return c.json({ success: true });
  } catch (err) {
    console.log(`[waitlist] Unexpected error: ${err}`);
    return c.json({ error: `Waitlist error: ${err}` }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  Parse CV — extract text from uploaded file, Qwen parse             */
/*  POST /make-server-4ab11b6d/parse-cv                               */
/*  Body: FormData with 'file' + 'fileUrl' + 'imagePreviewUrl'       */
/*  Storage: SQL tables (cv_profiles, cv_positions, cv_education)      */
/* ------------------------------------------------------------------ */
app.post("/make-server-4ab11b6d/parse-cv", async (c) => {
  try {
    const identity = await resolveRequestIdentity(c.req.raw.headers);

    // ===== AI GUARD: Tiered quota check — BEFORE any LLM call =====
    const aiGuard = await checkAiAccess(supabaseAdmin, identity as AiGuardIdentity, c.req.raw, "parse-cv");
    if (!aiGuard.allowed) {
      return c.json(aiGuard.body ?? { state: aiGuard.state }, aiGuard.status ?? 403,
        aiGuard.headers ? { headers: aiGuard.headers } : undefined);
    }
    // ===== END AI GUARD =====
    const bypassParseQuota = await shouldBypassParseQuota(identity);

    let parseQuotaCounted = false;
    const dashscopeApiKey = Deno.env.get("DASHSCOPE_API_KEY") || "";
    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY") || "";
    if (!dashscopeApiKey && !deepseekApiKey) {
      console.log("[parse-cv] No AI provider configured");
      return c.json({
        error: "No AI provider configured. Please set a primary and/or backup API key in Supabase secrets.",
      }, 500);
    }

    // 🔒 ANTI-SPAM: Track AI OCR requests per userId + browser fingerprint
    // Only apply to account users (guests already have separate quota)
    if (!bypassParseQuota && identity.mode === "account" && identity.userId && identity.browserFingerprint) {
      const aiOcrRateLimitKey = `ai-ocr:${identity.userId}:${identity.browserFingerprint}`;
      const AI_OCR_DAILY_LIMIT = 2; // 2 AI OCR requests per device per day
      
      console.log(`[parse-cv] Checking AI OCR rate limit for user ${identity.userId} on device ${identity.browserFingerprint}`);
      
      const aiOcrResult = await checkRateLimit(
        supabaseAdmin,
        aiOcrRateLimitKey,
        'ai-ocr-parse',
        { maxRequests: AI_OCR_DAILY_LIMIT, windowMinutes: 24 * 60 },
      );

      if (!aiOcrResult.allowed) {
        console.log(`[parse-cv] AI OCR daily limit exceeded for ${identity.userId} on device ${identity.browserFingerprint}`);
        return c.json(
          {
            error: "Daily AI OCR limit exceeded",
            message: `You have used your ${AI_OCR_DAILY_LIMIT} AI OCR analysis credits for this device today. Limit resets in ${Math.floor(aiOcrResult.retryAfter / 60)} minutes.`,
            retryAfter: aiOcrResult.retryAfter,
            quotaCounted: false,
          },
          429,
          {
            headers: createRateLimitHeaders(aiOcrResult),
          },
        );
      }
      
      console.log(`[parse-cv] AI OCR rate limit check passed for ${identity.userId}:${identity.browserFingerprint}`);
      // AI OCR rate limit passed, mark as counted
      parseQuotaCounted = true;
    }

    // Existing quota check for other cases
    if (!bypassParseQuota && !parseQuotaCounted) {
      const parseQuotaResult = await checkRateLimit(
        supabaseAdmin,
        getParseQuotaUserId(identity),
        getParseQuotaEndpoint(identity.mode),
        PARSE_CV_LIMIT,
      );

      if (!parseQuotaResult.allowed) {
        console.log(`[parse-cv] Parse quota exceeded for ${identity.guestSessionId} (${identity.mode})`);
        return c.json(
          {
            error: "Parse quota exceeded",
            message: identity.mode === "account"
              ? "You have used the signed-in parse quota on this device."
              : "You have used the guest parse quota on this device. Log in to unlock one more parse.",
            retryAfter: parseQuotaResult.retryAfter,
            quotaCounted: false,
          },
          429,
          {
            headers: createRateLimitHeaders(parseQuotaResult),
          },
        );
      }

      parseQuotaCounted = true;
    }

    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const fileUrl = formData.get("fileUrl") as string | null;
    const imagePreviewUrl = formData.get("imagePreviewUrl") as string | null;
    const fileName = file?.name || formData.get("fileName") as string || "unknown";
    const pageCount = parseInt(formData.get("pageCount") as string || "1", 10) || 1;

    if (!file) {
      return c.json({ error: "Missing file in form data", quotaCounted: parseQuotaCounted }, 400);
    }

    console.log(`[parse-cv] Starting parse for "${fileName}" (${(file.size / 1024).toFixed(1)} KB)`);

    // 1. Read file buffer directly from uploaded file
    const buffer = await file.arrayBuffer();
    console.log(`[parse-cv] Read ${buffer.byteLength} bytes from uploaded file`);

    // 2. Extract text
    let extractedText = "";
    try {
      extractedText = await extractTextFromFile(buffer, fileName);
      console.log(`[parse-cv] Text extraction result: ${extractedText.length} chars`);
    } catch (extractErr) {
      console.log(`[parse-cv] Text extraction failed: ${extractErr}`);
    }

    let profile: ParsedCVProfile | null = null;
    let totalUsage: ReturnType<typeof normalizeTokenUsage> = null;
    let lastParseError: string | null = null;

    const addUsage = (usage: unknown) => {
      totalUsage = mergeTokenUsage(totalUsage, normalizeTokenUsage(usage));
    };

    if (extractedText && extractedText.length >= 20) {
      // 3a. Text extraction succeeded → parse with Qwen text model (qwen-max)
      console.log(`[parse-cv] Using Qwen text parsing (${extractedText.length} chars extracted)`);
      try {
        const textResult = await parseWithQwen(extractedText, dashscopeApiKey);
        addUsage(textResult.usage);
        profile = textResult.profile;
        if (textResult.error && !profile) {
          console.log(`[parse-cv] Text parse returned no profile: ${textResult.error}`);
          lastParseError = textResult.error;
        }
      } catch (parseErr) {
        console.log(`[parse-cv] Qwen text parsing failed: ${parseErr}`);
        addUsage((parseErr as { usage?: unknown })?.usage);
        lastParseError = `AI text parsing failed: ${parseErr}`;
        // Don't return error yet — try Vision OCR fallback if URL available
        if (imagePreviewUrl || fileUrl) {
          console.log(`[parse-cv] Falling back to Vision OCR after text parse failure`);
        } else {
          return c.json({
            error: `AI text parsing failed: ${parseErr}`,
            usage: totalUsage ?? undefined,
            quotaCounted: parseQuotaCounted,
          }, 502);
        }
      }
    }

    // 3b. Vision OCR fallback (if text parsing failed, returned empty name, or insufficient text)
    if ((!profile || !profile.fullName) && (imagePreviewUrl || fileUrl)) {
      // Build multi-page image URLs for PDFs using Cloudinary pg_N transforms
      const baseUrl = fileUrl || imagePreviewUrl!;
      const isPdf = fileName.toLowerCase().endsWith(".pdf") && baseUrl.includes("/upload/");
      const visionUrls: string[] = [];

      if (isPdf && pageCount > 1) {
        // Generate URLs for all pages (capped at 8)
        const maxPages = Math.min(pageCount, 8);
        for (let pg = 1; pg <= maxPages; pg++) {
          visionUrls.push(
            baseUrl.replace("/upload/", `/upload/pg_${pg},c_limit,w_2048,h_2048,q_auto,f_jpg/`)
          );
        }
        console.log(`[parse-cv] Built ${visionUrls.length} page URLs for Vision OCR (total pages: ${pageCount})`);
      } else if (imagePreviewUrl) {
        visionUrls.push(imagePreviewUrl);
      } else {
        visionUrls.push(baseUrl);
      }

      console.log(`[parse-cv] Using Qwen Vision OCR fallback (${!profile ? "no profile" : "empty fullName"}) with ${visionUrls.length} page(s)`);
      try {
        const visionResult = await parseImageWithQwen(
          visionUrls.length === 1 ? visionUrls[0] : visionUrls,
          dashscopeApiKey,
          { usePrivilegedVisionModel: bypassParseQuota },
        );
        addUsage(visionResult.usage);
        const visionProfile = visionResult.profile;
        if (visionProfile && visionProfile.fullName) {
          // Vision succeeded with a name — use it (or merge with text-parsed data)
          profile = visionProfile;
          console.log(`[parse-cv] Vision OCR succeeded: "${visionProfile.fullName}"`);
        } else if (!profile) {
          // Use vision result even without name if we have nothing else
          profile = visionProfile;
          if (visionResult.error) {
            console.log(`[parse-cv] Vision OCR returned no usable profile: ${visionResult.error}`);
            lastParseError = visionResult.error;
          }
        }
      } catch (visionErr) {
        console.log(`[parse-cv] Qwen Vision fallback also failed: ${visionErr}`);
        addUsage((visionErr as { usage?: unknown })?.usage);
        lastParseError = `Both text extraction and Vision OCR failed for "${fileName}". Error: ${visionErr}`;
        if (!profile) {
          return c.json({
            error: lastParseError,
            usage: totalUsage ?? undefined,
            quotaCounted: parseQuotaCounted,
          }, 422);
        }
        // If we have a text-parsed profile (even with empty name), continue with it
        console.log(`[parse-cv] Continuing with text-parsed profile despite Vision failure`);
      }
    }

    if (!profile) {
      console.log(`[parse-cv] No profile produced — no text and no Vision URL`);
      return c.json({
        error: lastParseError ?? "Could not extract text from file and no URL available for Vision OCR. Please try uploading as an image.",
        usage: totalUsage ?? undefined,
        quotaCounted: parseQuotaCounted,
      }, 422);
    }

    // Attach file info
    profile.fileUrl = fileUrl || "";
    profile.fileName = fileName;

    // 4. Save to SQL tables
    console.log(`[parse-cv] Saving profile to SQL: "${profile.fullName || "unknown"}" / "${profile.jobTitle || "no title"}"`);
    let saveResult: SaveProfileResult;
    try {
      saveResult = await saveProfileToSQL(profile, identity);
    } catch (saveErr) {
      console.log(`[parse-cv] SQL save error: ${saveErr}`);
      return c.json({ error: `Failed to save profile to database: ${saveErr}`, quotaCounted: parseQuotaCounted }, 500);
    }

    if (saveResult.warnings.length > 0) {
      console.log(`[parse-cv] Save warnings: ${JSON.stringify(saveResult.warnings)}`);
    }
    console.log(`[parse-cv] Success! Profile ID: ${saveResult.id}`);
    return c.json({
      success: true,
      profile: { ...profile, id: saveResult.id },
      usage: totalUsage ?? undefined,
      warnings: saveResult.warnings.length > 0 ? saveResult.warnings : undefined,
      quotaCounted: parseQuotaCounted,
    });
  } catch (err) {
    console.log(`[parse-cv] Unexpected error: ${err}`);
    return c.json({ error: `Parse CV error: ${err}`, quotaCounted: parseQuotaCounted }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  Parse CV Image — OCR+parse via Qwen Vision                        */
/*  POST /make-server-4ab11b6d/parse-cv-image                        */
/*  Body: { imageUrl: string, fileName: string }                      */
/*  Storage: SQL tables (cv_profiles, cv_positions, cv_education)      */
/* ------------------------------------------------------------------ */
app.post("/make-server-4ab11b6d/parse-cv-image", async (c) => {
  try {
    const identity = await resolveRequestIdentity(c.req.raw.headers);

    // ===== AI GUARD: Tiered quota check — BEFORE any LLM call =====
    const aiGuard = await checkAiAccess(supabaseAdmin, identity as AiGuardIdentity, c.req.raw, "parse-cv-image");
    if (!aiGuard.allowed) {
      return c.json(aiGuard.body ?? { state: aiGuard.state }, aiGuard.status ?? 403,
        aiGuard.headers ? { headers: aiGuard.headers } : undefined);
    }
    // ===== END AI GUARD =====
    const bypassParseQuota = await shouldBypassParseQuota(identity);

    let parseQuotaCounted = false;
    const apiKey = Deno.env.get("DASHSCOPE_API_KEY");
    if (!apiKey) {
      console.log("[parse-cv-image] DASHSCOPE_API_KEY not configured");
      return c.json({ error: "DASHSCOPE_API_KEY not configured. Please add this secret." }, 500);
    }

    if (!bypassParseQuota) {
      const parseQuotaResult = await checkRateLimit(
        supabaseAdmin,
        getParseQuotaUserId(identity),
        getParseQuotaEndpoint(identity.mode),
        PARSE_CV_LIMIT,
      );

      if (!parseQuotaResult.allowed) {
        console.log(`[parse-cv-image] Parse quota exceeded for ${identity.guestSessionId} (${identity.mode})`);
        return c.json(
          {
            error: "Parse quota exceeded",
            message: identity.mode === "account"
              ? "You have used the signed-in parse quota on this device."
              : "You have used the guest parse quota on this device. Log in to unlock one more parse.",
            retryAfter: parseQuotaResult.retryAfter,
            quotaCounted: false,
          },
          429,
          {
            headers: createRateLimitHeaders(parseQuotaResult),
          },
        );
      }

      parseQuotaCounted = true;
    }

    const body = await c.req.json();
    const { imageUrl, fileName, pageCount, baseUrl } = body as {
      imageUrl?: string;
      fileName?: string;
      pageCount?: number;
      baseUrl?: string;
    };

    if (!imageUrl || !fileName) {
      return c.json({ error: "Missing imageUrl or fileName", quotaCounted: parseQuotaCounted }, 400);
    }

    console.log(`[parse-cv-image] Starting vision parse for "${fileName}" from ${imageUrl.substring(0, 80)}...`);

    // Build multi-page URLs if pageCount > 1 and we have a base Cloudinary URL
    let visionInput: string | string[] = imageUrl;
    const isPdf = fileName.toLowerCase().endsWith(".pdf");
    const pdfBaseUrl = baseUrl || imageUrl;

    if (isPdf && pageCount && pageCount > 1 && pdfBaseUrl.includes("/upload/")) {
      // Strip any existing pg_N transform from the base URL to get a clean base
      const cleanBase = pdfBaseUrl.replace(/\/upload\/pg_\d+[^/]*\//, "/upload/");
      const maxPages = Math.min(pageCount, 8);
      const pageUrls: string[] = [];
      for (let pg = 1; pg <= maxPages; pg++) {
        pageUrls.push(
          cleanBase.replace("/upload/", `/upload/pg_${pg},c_limit,w_2048,h_2048,q_auto,f_jpg/`)
        );
      }
      visionInput = pageUrls;
      console.log(`[parse-cv-image] Built ${pageUrls.length} page URLs for multi-page Vision OCR (total pages: ${pageCount})`);
    }

    // Parse image with Qwen Vision
    let profile: ParsedCVProfile | null;
    let totalUsage: ReturnType<typeof normalizeTokenUsage> = null;
    let lastParseError: string | null = null;
    try {
      const visionResult = await parseImageWithQwen(
        visionInput,
        apiKey,
        { usePrivilegedVisionModel: bypassParseQuota },
      );
      totalUsage = mergeTokenUsage(totalUsage, normalizeTokenUsage(visionResult.usage));
      profile = visionResult.profile;
      if (visionResult.error) {
        console.log(`[parse-cv-image] Vision parse returned no profile: ${visionResult.error}`);
        lastParseError = visionResult.error;
      }
    } catch (parseErr) {
      console.log(`[parse-cv-image] Qwen Vision parsing failed: ${parseErr}`);
      totalUsage = mergeTokenUsage(totalUsage, normalizeTokenUsage((parseErr as { usage?: unknown })?.usage));
      return c.json({
        error: `AI Vision parsing failed: ${parseErr}`,
        usage: totalUsage ?? undefined,
        quotaCounted: parseQuotaCounted,
      }, 502);
    }

    if (!profile) {
      return c.json({
        error: lastParseError ?? "AI could not parse the CV image. Please ensure the image is clear and readable.",
        usage: totalUsage ?? undefined,
        quotaCounted: parseQuotaCounted,
      }, 422);
    }

    // Attach file info
    profile.fileUrl = imageUrl;
    profile.fileName = fileName;

    // Save to SQL tables
    console.log(`[parse-cv-image] Saving profile to SQL: "${profile.fullName || "unknown"}" / "${profile.jobTitle || "no title"}"`);
    let saveResult: SaveProfileResult;
    try {
      saveResult = await saveProfileToSQL(profile, identity);
    } catch (saveErr) {
      console.log(`[parse-cv-image] SQL save error: ${saveErr}`);
      return c.json({ error: `Failed to save profile to database: ${saveErr}`, quotaCounted: parseQuotaCounted }, 500);
    }

    if (saveResult.warnings.length > 0) {
      console.log(`[parse-cv-image] Save warnings: ${JSON.stringify(saveResult.warnings)}`);
    }
    console.log(`[parse-cv-image] Success! Profile ID: ${saveResult.id}`);
    return c.json({
      success: true,
      profile: { ...profile, id: saveResult.id },
      usage: totalUsage ?? undefined,
      warnings: saveResult.warnings.length > 0 ? saveResult.warnings : undefined,
      quotaCounted: parseQuotaCounted,
    });
  } catch (err) {
    console.log(`[parse-cv-image] Unexpected error: ${err}`);
    return c.json({ error: `Parse CV image error: ${err}`, quotaCounted: parseQuotaCounted }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  List all CV profiles (summary)                                     */
/*  GET /make-server-4ab11b6d/cv-profiles                             */
/*  Storage: SQL tables (cv_profiles)                                 */
/* ------------------------------------------------------------------ */
app.get("/make-server-4ab11b6d/cv-profiles", async (c) => {
  try {
    const identity = await resolveRequestIdentity(c.req.raw.headers);

    const { data: rows, error } = await supabaseAdmin
      .from("cv_profiles")
      .select("*")
      .eq("scope_key", identity.scopeKey)
      .order("parsed_at", { ascending: false });

    if (error) {
      console.log(`[cv-profiles] SQL query error: ${error.message}`);
      return c.json({ error: `List profiles error: ${error.message}` }, 500);
    }

    const index: CVProfileSummary[] = (rows || []).map(row => ({
      id: row.id,
      full_name: row.full_name || "",
      job_title: row.job_title || "",
      file_name: row.file_name || "",
      parsed_at: row.parsed_at || new Date().toISOString(),
      file_url: row.file_url || "",
    }));

    console.log(`[cv-profiles] Returning ${index.length} profiles from SQL for ${identity.scopeKey}`);
    return c.json({ profiles: index });
  } catch (err) {
    console.log(`[cv-profiles] Unexpected error: ${err}`);
    return c.json({ error: `List profiles error: ${err}` }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  Get single CV profile with positions & education                    */
/*  GET /make-server-4ab11b6d/cv-profile?id=<uuid>                    */
/*  Storage: SQL tables (cv_profiles, cv_positions, cv_education)     */
/* ------------------------------------------------------------------ */
app.get("/make-server-4ab11b6d/cv-profile", async (c) => {
  try {
    const identity = await resolveRequestIdentity(c.req.raw.headers);
    const profileId = c.req.query("id");

    if (!profileId) {
      const profile = await loadLatestProfileFromSQL(identity.scopeKey);
      return c.json({ profile });
    }

    const profile = await loadProfileFromSQL(profileId, identity.scopeKey);
    if (!profile) {
      console.log(`[cv-profile] Profile ${profileId} not found in SQL for scope ${identity.scopeKey}`);
      return c.json({ profile: null });
    }

    console.log(`[cv-profile] Loaded profile ${profileId} for ${identity.scopeKey}: "${profile.fullName || "unknown"}"`);
    return c.json({ profile });
  } catch (err) {
    console.log(`[cv-profile] Error fetching profile: ${err}`);
    return c.json({ error: `CV profile error: ${err}` }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  Job recommendations from SQL CV + jobs_import                      */
/*  GET /make-server-4ab11b6d/job-recommendations                      */
/* ------------------------------------------------------------------ */

// Helper function to check unlimited access
async function checkUnlimitedAccess(supabase: ReturnType<typeof createClient>, userId: string): Promise<boolean> {
  try {
    // Check if user has unlimited flag in auth.users metadata or a separate subscriptions table
    const { data: user } = await supabase
      .from('user_subscriptions')  // Or your subscriptions table
      .select('plan_type, is_unlimited')
      .eq('user_id', userId)
      .single();

    if (!user) return false;
    
    // Check for unlimited plan or explicit unlimited flag
    return user.is_unlimited === true || user.plan_type === 'unlimited' || user.plan_type === 'premium';
  } catch (error) {
    console.log(`[checkUnlimitedAccess] Error: ${error}`);
    return false;  // Default to limited if check fails
  }
}

app.get("/make-server-4ab11b6d/job-recommendations", async (c) => {
  try {
    const identity = await resolveRequestIdentity(c.req.raw.headers);

    // ===== AI GUARD: Tiered quota check — BEFORE any LLM call =====
    const aiGuard = await checkAiAccess(supabaseAdmin, identity as AiGuardIdentity, c.req.raw, "job-recommendations");
    if (!aiGuard.allowed) {
      return c.json(aiGuard.body ?? { state: aiGuard.state }, aiGuard.status ?? 403,
        aiGuard.headers ? { headers: aiGuard.headers } : undefined);
    }
    // ===== END AI GUARD =====

    // 🔒 SECURITY: Validate request
    const validation = validateRequest(c.req.raw, { requireAuth: false });
    if (!validation.valid) {
      console.log(`[🔒 job-recommendations] Validation failed: ${validation.error}`);
      return c.json({ error: validation.error }, 401);
    }

    // 🔒 SECURITY: Validate scope key
    if (!isValidScopeKey(identity.scopeKey)) {
      console.log(`[🔒 job-recommendations] Invalid scope key: ${identity.scopeKey}`);
      return c.json({ error: "Invalid scope key format" }, 400);
    }

    // 🔒 SECURITY: Rate limiting (existing, kept as additional layer)
    const rateLimitResult = await checkRateLimit(
      supabaseAdmin,
      identity.userId || "unknown",
      'job-recommendations',
      RATE_LIMITS.jobRecommendations,
    );

    if (!rateLimitResult.allowed) {
      console.log(`[🔒 job-recommendations] Rate limit exceeded for ${identity.userId}`);
      return c.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again after ${new Date(rateLimitResult.resetAt).toLocaleTimeString()}`,
          retryAfter: rateLimitResult.retryAfter,
        },
        429,
        {
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const requestedProfileId = c.req.query("cvProfileId") || undefined;
    const limitParam = Number(c.req.query("limit") || "50");
    const limit = Math.min(100, Math.max(1, Number.isFinite(limitParam) ? limitParam : 50));
    const locale = (c.req.query("locale") === "en" ? "en" : "vi") as Locale;
    const forceRefresh = ["1", "true", "yes"].includes((c.req.query("forceRefresh") || "").toLowerCase());
    const excludeMatchedJobIds = c.req.query("excludeJobIds")?.split(",").filter(id => id.trim()) || [];  // NEW: Job IDs to exclude

    // 🔒 SECURITY: Log access
    const clientIP = getClientIP(c.req.raw);
    console.log(`[🔒 job-recommendations] Request by ${validation.userId} from ${clientIP} - Profile: ${requestedProfileId || 'latest'}, Locale: ${locale}, Exclude IDs: ${excludeMatchedJobIds.length}`);

    let profile: (ParsedCVProfile & { id: string }) | null = null;
    if (requestedProfileId) {
      profile = await loadProfileFromSQL(requestedProfileId, identity.scopeKey);
    } else {
      profile = await loadLatestProfileFromSQL(identity.scopeKey);
    }

    const cacheKey = `job-recommendations:v6:${identity.scopeKey}:${profile?.id || "latest"}:${limit}:${locale}`;
    if (!forceRefresh) {
      try {
        const cached = await kv.get(cacheKey);
        if (cached && typeof cached === "object" && cached !== null && "_cachedAt" in cached) {
          const cachedAt = Number((cached as Record<string, unknown>)._cachedAt || 0);
          if (Date.now() - cachedAt < JOB_RECOMMENDATION_CACHE_TTL_MS && hasJobUrl(cached)) {
            return c.json({
              ...cached,
              cacheHit: true,
            });
          }
        }
      } catch (cacheErr) {
        console.log(`[job-recommendations] Cache read error: ${cacheErr}`);
      }
    }

    const { rows: jobRows, error: jobFetchErr } = await fetchJobsImportForMatching(
      profile,
      limit,
      excludeMatchedJobIds,
    );

    if (jobFetchErr) {
      console.log(`[job-recommendations] jobs_import query error: ${jobFetchErr}`);
      return c.json({ error: `Job recommendation error: ${jobFetchErr}` }, 500);
    }

    const result = await buildJobRecommendations({
      profile,
      jobs: jobRows,
      locale,
    });

    // NEW: Filter matches with score > 5
    const filteredMatches = result.matches.filter(match => match.overallScore > 5);

    // Re-calculate best match and summary
    const bestMatch = filteredMatches[0] ?? null;
    const noRecommendationSummary = locale === "vi"
      ? "Đã hiển thị hết các job phù hợp với bạn."
      : "All matching jobs have been shown.";
    const overallSummary = bestMatch
      ? (locale === "vi"
          ? `Phù hợp nhất: ${bestMatch.job.title || "Chưa có tiêu đề"}${bestMatch.job.company ? ` tại ${bestMatch.job.company}` : ""} (${bestMatch.overallScore}/10).`
          : `Best fit: ${bestMatch.job.title || "Untitled"}${bestMatch.job.company ? ` at ${bestMatch.job.company}` : ""} (${bestMatch.overallScore}/10).`)
      : (locale === "vi" 
          ? "Không tìm thấy job phù hợp với điểm > 5." 
          : "No matching jobs with score above 5 were found.");

    const responseSummary = bestMatch ? overallSummary : noRecommendationSummary;
    const responseAnalysisMarkdown = filteredMatches.length > 0 ? result.analysisMarkdown : "";

    const payload = {
      ...result,
      matches: filteredMatches,  // Only matches with score > 5
      bestMatch,
      overallSummary: responseSummary,
      analysisMarkdown: responseAnalysisMarkdown,
      _cachedAt: Date.now(),
      cacheHit: false,
    };

    try {
      await kv.set(cacheKey, payload);
    } catch (cacheErr) {
      console.log(`[job-recommendations] Cache write error: ${cacheErr}`);
    }

    console.log(`[job-recommendations] Returning ${filteredMatches.length} matches (score > 5) from ${result.totalJobsAnalyzed} jobs for ${identity.scopeKey}`);
    return c.json(payload);
  } catch (err) {
    console.log(`[job-recommendations] Unexpected error: ${err}`);
    return c.json({ error: `Job recommendation error: ${err}` }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  Delete CV profile                                                  */
/*  DELETE /make-server-4ab11b6d/cv-profile?id=<uuid>                 */
/*  Storage: SQL tables (cv_profiles, cv_positions, cv_education)     */
/* ------------------------------------------------------------------ */
app.delete("/make-server-4ab11b6d/cv-profile", async (c) => {
  try {
    const identity = await resolveRequestIdentity(c.req.raw.headers);
    const profileId = c.req.query("id");

    if (!profileId) {
      return c.json({ error: "Missing 'id' query parameter" }, 400);
    }

    const deleted = await deleteProfileFromSQL(profileId, identity.scopeKey);
    if (!deleted) {
      return c.json({ error: "Profile not found" }, 404);
    }

    console.log(`[cv-profile] Profile ${profileId} deleted from SQL for ${identity.scopeKey}`);
    return c.json({ success: true });
  } catch (err) {
    console.log(`[cv-profile] Delete error: ${err}`);
    return c.json({ error: `Delete profile error: ${err}` }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  Import guest data into account scope                                */
/*  POST /make-server-4ab11b6d/import-guest-data                      */
/*  Body: { fromScopeKey?: string, toScopeKey?: string }             */
/* ------------------------------------------------------------------ */
app.post("/make-server-4ab11b6d/import-guest-data", async (c) => {
  try {
    const identity = await resolveRequestIdentity(c.req.raw.headers);
    if (identity.mode !== "account" || !identity.userId) {
      return c.json({ error: "Guest import requires an account scope" }, 400);
    }

    const body = await c.req.json().catch(() => ({}));
    const { fromScopeKey, toScopeKey } = body as {
      fromScopeKey?: string;
      toScopeKey?: string;
    };

    const sourceScopeKey = fromScopeKey?.trim() || `guest:${identity.guestSessionId}`;
    const targetScopeKey = toScopeKey?.trim() || identity.scopeKey;

    if (targetScopeKey !== identity.scopeKey) {
      return c.json({ error: "Target scope does not match the current account" }, 400);
    }

    if (!sourceScopeKey.startsWith("guest:")) {
      return c.json({ error: "Only guest scopes can be imported" }, 400);
    }

    if (sourceScopeKey === targetScopeKey) {
      return c.json({ success: true, imported: 0, skipped: true });
    }

    const { data: sourceRows, error } = await supabaseAdmin
      .from("cv_profiles")
      .select("id")
      .eq("scope_key", sourceScopeKey)
      .order("parsed_at", { ascending: false });

    if (error) {
      console.log(`[import-guest-data] Source query failed: ${error.message}`);
      return c.json({ error: `Import query error: ${error.message}` }, 500);
    }

    let imported = 0;
    for (const row of sourceRows || []) {
      const profile = await loadProfileFromSQL(row.id, sourceScopeKey);
      if (!profile) continue;

      await saveProfileToSQL(profile, {
        mode: "account",
        scopeKey: targetScopeKey,
        guestSessionId: identity.guestSessionId,
        userId: identity.userId,
      });
      imported += 1;
    }

    console.log(`[import-guest-data] Imported ${imported} profile(s) from ${sourceScopeKey} to ${targetScopeKey}`);
    return c.json({ success: true, imported });
  } catch (err) {
    console.log(`[import-guest-data] Unexpected error: ${err}`);
    return c.json({ error: `Import guest data error: ${err}` }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  Legal Documents — fetch active document by type                    */
/*  GET /make-server-4ab11b6d/legal/:docType                          */
/*  docType: 'privacy_policy' | 'terms_of_service'                    */
/* ------------------------------------------------------------------ */
app.get("/make-server-4ab11b6d/legal/:docType", async (c) => {
  try {
    const docType = c.req.param("docType");
    const version = c.req.query("version");

    const ALLOWED_TYPES = ["privacy_policy", "terms_of_service"];
    if (!ALLOWED_TYPES.includes(docType)) {
      return c.json({ error: `Invalid doc_type. Allowed: ${ALLOWED_TYPES.join(", ")}` }, 400);
    }

    let query = supabaseAdmin
      .from("legal_documents")
      .select("*")
      .eq("doc_type", docType);

    if (version) {
      query = query.eq("version", version);
    } else {
      query = query.eq("is_active", true);
    }

    const { data: rows, error } = await query.order("created_at", { ascending: false }).limit(1);

    if (error) {
      console.log(`[legal] SQL query error for ${docType}: ${error.message}`);
      return c.json({ error: `Legal document query error: ${error.message}` }, 500);
    }

    if (!rows || rows.length === 0) {
      console.log(`[legal] No active document found for type: ${docType}`);
      return c.json({ document: null });
    }

    const doc = rows[0];
    console.log(`[legal] Returning ${docType} v${doc.version} (${doc.id})`);
    return c.json({
      document: {
        id: doc.id,
        docType: doc.doc_type,
        version: doc.version,
        titleVi: doc.title_vi,
        titleEn: doc.title_en,
        contentVi: doc.content_vi,
        contentEn: doc.content_en,
        effectiveDate: doc.effective_date,
      },
    });
  } catch (err) {
    console.log(`[legal] Unexpected error: ${err}`);
    return c.json({ error: `Legal document error: ${err}` }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  User Consent — save consent record                                 */
/*  POST /make-server-4ab11b6d/consent                                */
/*  Body: { identifier, identifierType, consentTypes, docVersion }    */
/* ------------------------------------------------------------------ */
app.post("/make-server-4ab11b6d/consent", async (c) => {
  try {
    const body = await c.req.json();
    const { identifier, identifierType, consentTypes, docVersion } = body as {
      identifier?: string;
      identifierType?: string;
      consentTypes?: string[];
      docVersion?: string;
    };

    if (!identifier || !identifierType) {
      return c.json({ error: "Missing identifier or identifierType" }, 400);
    }

    const ALLOWED_ID_TYPES = ["guest", "user"];
    if (!ALLOWED_ID_TYPES.includes(identifierType)) {
      return c.json({ error: `Invalid identifierType. Allowed: ${ALLOWED_ID_TYPES.join(", ")}` }, 400);
    }

    const types = consentTypes || ["privacy_policy", "terms_of_service"];
    const version = docVersion || "1.0";
    const userAgent = c.req.header("User-Agent") || "";
    const ip = c.req.header("X-Forwarded-For") || c.req.header("CF-Connecting-IP") || "";

    console.log(`[consent] Saving consent for ${identifierType}:${identifier} — types: ${types.join(", ")}`);

    const rows = types.map((ct) => ({
      identifier,
      identifier_type: identifierType,
      consent_type: ct,
      accepted: true,
      accepted_at: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
      doc_version: version,
    }));

    // Upsert — if consent already exists for same identifier+type+version, update it
    const { error } = await supabaseAdmin
      .from("user_consents")
      .upsert(rows, { onConflict: "identifier,consent_type,doc_version" });

    if (error) {
      console.log(`[consent] SQL upsert error: ${error.message} (code: ${error.code}, details: ${error.details})`);
      return c.json({ error: `Consent save error: ${error.message}` }, 500);
    }

    console.log(`[consent] Saved ${types.length} consent(s) for ${identifier}`);
    return c.json({ success: true });
  } catch (err) {
    console.log(`[consent] Unexpected error: ${err}`);
    return c.json({ error: `Consent error: ${err}` }, 500);
  }
});

/* ------------------------------------------------------------------ */
/*  User Consent — check consent status                                */
/*  GET /make-server-4ab11b6d/consent?identifier=xxx&type=xxx         */
/* ------------------------------------------------------------------ */
app.get("/make-server-4ab11b6d/consent", async (c) => {
  try {
    const identifier = c.req.query("identifier");
    const consentType = c.req.query("type");

    if (!identifier) {
      return c.json({ error: "Missing 'identifier' query parameter" }, 400);
    }

    let query = supabaseAdmin
      .from("user_consents")
      .select("*")
      .eq("identifier", identifier)
      .eq("accepted", true);

    if (consentType) {
      query = query.eq("consent_type", consentType);
    }

    const { data: rows, error } = await query.order("accepted_at", { ascending: false });

    if (error) {
      console.log(`[consent] SQL query error: ${error.message}`);
      return c.json({ error: `Consent query error: ${error.message}` }, 500);
    }

    const consents: Record<string, boolean> = {};
    (rows || []).forEach((row: Record<string, unknown>) => {
      consents[row.consent_type as string] = true;
    });

    console.log(`[consent] Consent status for ${identifier}: ${JSON.stringify(consents)}`);
    return c.json({ consents });
  } catch (err) {
    console.log(`[consent] Unexpected error: ${err}`);
    return c.json({ error: `Consent check error: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);
