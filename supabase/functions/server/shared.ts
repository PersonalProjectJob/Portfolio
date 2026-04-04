import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Get the allowed origins list from environment variables.
 * Format: comma-separated URLs (e.g., "https://app.example.com,https://www.example.com")
 * Development defaults to localhost origins if not configured.
 */
function getAllowedOrigins(): string[] {
  const configured = Deno.env.get("ALLOWED_ORIGINS")?.trim();
  if (configured) {
    return configured.split(",").map((origin) => origin.trim()).filter(Boolean);
  }

  // Production defaults
  return [
    "https://tnsthao94.online",
    "https://www.tnsthao94.online",
  ];
}

/**
 * Validate and return the appropriate CORS origin for a request.
 * Returns the matching allowed origin if valid, or null if not allowed.
 */
function validateOrigin(origin: string | null): string | null {
  if (!origin) return null;

  const allowedOrigins = getAllowedOrigins();

  // Check for exact match
  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  // Support wildcard subdomains in allowed origins (e.g., "*.example.com")
  for (const allowed of allowedOrigins) {
    if (allowed.startsWith("*.")) {
      const suffix = allowed.slice(1); // ".example.com"
      if (origin.endsWith(suffix) && origin.startsWith("http")) {
        return origin;
      }
    }
  }

  return null;
}

/**
 * Build CORS headers with validated origin.
 */
export function buildCorsHeaders(origin: string | null): Record<string, string> {
  const validatedOrigin = validateOrigin(origin);

  return {
    "Access-Control-Allow-Origin": validatedOrigin || "null",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, X-CareerAI-Scope-Key, X-CareerAI-Scope-Mode, X-CareerAI-Guest-Session-Id, X-CareerAI-User-Id, X-CareerAI-Auth-Token, X-CareerAI-Browser-Fingerprint, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "false",
    "Vary": "Origin",
  };
}

export function handleCors(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("Origin");
    return new Response(null, {
      status: 204,
      headers: buildCorsHeaders(origin),
    });
  }
  return null;
}

export function createJsonResponse(data: unknown, status = 200, request?: Request): Response {
  const origin = request?.headers.get("Origin") ?? null;
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...buildCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

export function createErrorResponse(
  message: string,
  status = 400,
  details?: Record<string, unknown>,
  request?: Request,
): Response {
  return createJsonResponse(
    {
      error: message,
      ...(details && { details }),
    },
    status,
    request,
  );
}

export function validateRequest(
  request: Request,
  options: {
    requireAuth?: boolean;
    allowedMethods?: string[];
  } = {},
): {
  valid: boolean;
  error?: string;
  userId?: string;
  scopeKey?: string;
  email?: string;
} {
  const { requireAuth = true, allowedMethods = ["GET", "POST", "PUT", "DELETE"] } = options;

  if (!allowedMethods.includes(request.method)) {
    return {
      valid: false,
      error: `Method ${request.method} not allowed. Allowed: ${allowedMethods.join(", ")}`,
    };
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    if (requireAuth) {
      return {
        valid: false,
        error: "Missing Authorization header",
      };
    }
    const guestSessionId = request.headers.get("X-CareerAI-Guest-Session-Id");
    if (!guestSessionId) {
      return {
        valid: false,
        error: "Missing guest session ID for anonymous access",
      };
    }
    return {
      valid: true,
      userId: `guest_${guestSessionId}`,
      scopeKey: `guest:${guestSessionId}`,
    };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      valid: false,
      error: "Invalid Authorization header format. Expected: Bearer <token>",
    };
  }

  const token = authHeader.substring(7);

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return {
        valid: false,
        error: "Invalid JWT token structure",
      };
    }

    const payload = JSON.parse(atob(parts[1]));

    if (payload.exp && payload.exp < Date.now() / 1000) {
      return {
        valid: false,
        error: "Token expired",
      };
    }

    const scopeKey = request.headers.get("X-CareerAI-Scope-Key");
    if (!scopeKey) {
      return {
        valid: false,
        error: "Missing X-CareerAI-Scope-Key header",
      };
    }

    if (!/^(guest|account):[a-zA-Z0-9_-]+$/.test(scopeKey)) {
      return {
        valid: false,
        error: "Invalid scope key format",
      };
    }

    return {
      valid: true,
      userId: payload.sub || `guest_${request.headers.get("X-CareerAI-Guest-Session-Id")}`,
      scopeKey,
      email: payload.email,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid token: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/[<>]/g, "")
    .replace(/['";\\]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

export function isValidScopeKey(scopeKey: string): boolean {
  return /^(guest|account):[a-zA-Z0-9_-]+$/.test(scopeKey.trim());
}

export async function authenticateRequest(request: Request): Promise<{
  success: boolean;
  context?: {
    userId: string;
    email?: string;
    role: "anon" | "authenticated" | "service";
    scopeKey: string;
    guestSessionId?: string;
  };
  error?: string;
  status?: number;
}> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    const guestSessionId = request.headers.get("X-CareerAI-Guest-Session-Id");
    if (!guestSessionId) {
      return {
        success: false,
        error: "Missing Authorization header or guest session ID",
        status: 401,
      };
    }

    const scopeKey = request.headers.get("X-CareerAI-Scope-Key");
    if (!scopeKey || !scopeKey.startsWith("guest:")) {
      return {
        success: false,
        error: "Invalid guest scope key",
        status: 400,
      };
    }

    return {
      success: true,
      context: {
        userId: `guest_${guestSessionId}`,
        role: "anon",
        scopeKey,
        guestSessionId,
      },
    };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      error: "Invalid Authorization header format",
      status: 401,
    };
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      success: false,
      error: "Invalid or expired token",
      status: 401,
    };
  }

  const scopeKey = request.headers.get("X-CareerAI-Scope-Key");
  if (!scopeKey) {
    return {
      success: false,
      error: "Missing X-CareerAI-Scope-Key header",
      status: 400,
    };
  }

  if (!/^(guest|account):[a-zA-Z0-9_-]+$/.test(scopeKey)) {
    return {
      success: false,
      error: "Invalid scope key format",
      status: 400,
    };
  }

  if (scopeKey.startsWith("account:")) {
    const expectedUserId = scopeKey.replace("account:", "");
    if (expectedUserId !== user.id) {
      return {
        success: false,
        error: "User does not have access to this scope",
        status: 403,
      };
    }
  }

  return {
    success: true,
    context: {
      userId: user.id,
      email: user.email,
      role: "authenticated",
      scopeKey,
    },
  };
}

/**
 * Validate if a string is a valid IPv4 or IPv6 address.
 */
function isValidIPAddress(ip: string): boolean {
  // IPv4 regex
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (ipv4Pattern.test(ip)) {
    const parts = ip.split(".").map(Number);
    return parts.every((part) => part >= 0 && part <= 255);
  }

  // IPv6 regex (simplified - covers most common cases)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  if (ipv6Pattern.test(ip)) {
    return true;
  }

  return false;
}

/**
 * Extract and validate client IP from request headers.
 * Validates IP format to prevent header injection and spoofing.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("X-Forwarded-For");
  if (forwarded) {
    // Take the first (client) IP from the chain
    const firstIp = forwarded.split(",")[0].trim();

    // Validate it's a proper IP address
    if (firstIp && isValidIPAddress(firstIp)) {
      return firstIp;
    }

    // If invalid, log warning and fall through to other headers
    if (firstIp && firstIp !== "unknown") {
      console.warn(`[security] Invalid IP in X-Forwarded-For: "${firstIp}" - possible spoofing attempt`);
    }
  }

  const realIP = request.headers.get("X-Real-IP");
  if (realIP) {
    const trimmed = realIP.trim();
    if (isValidIPAddress(trimmed)) {
      return trimmed;
    }

    console.warn(`[security] Invalid IP in X-Real-IP: "${trimmed}" - possible spoofing attempt`);
  }

  return "unknown";
}

export function getUserAgent(request: Request): string {
  return request.headers.get("User-Agent") || "unknown";
}

/** Escape dynamic text for Telegram Bot API parse_mode "Markdown" (legacy). */
export function escapeTelegramMarkdown(text: string): string {
  return text.replace(/[_*[\]`]/g, (ch) => `\\${ch}`);
}

/**
 * Best-effort city/region/country label for an IP (HTTPS, no API key).
 * Used for admin notifications only; failures return a short Vietnamese hint.
 */
function isPrivateOrLoopbackIpv4(host: string): boolean {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return false;
  const p = host.split(".").map((x) => Number(x));
  if (p.some((n) => n > 255)) return false;
  if (p[0] === 10) return true;
  if (p[0] === 127) return true;
  if (p[0] === 192 && p[1] === 168) return true;
  if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
  return false;
}

export async function lookupIpLocationSummary(ip: string): Promise<string> {
  const trimmed = ip?.trim() ?? "";
  if (!trimmed || trimmed === "unknown") {
    return "Không xác định (không có IP)";
  }
  if (trimmed === "::1" || isPrivateOrLoopbackIpv4(trimmed)) {
    return "Mạng nội bộ / localhost";
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(trimmed)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return "Không tra cứu được";

    const data = (await res.json()) as Record<string, unknown>;
    if (data.success === false) {
      const msg = typeof data.message === "string" ? data.message : "";
      return msg || "Không tra cứu được";
    }

    const city = typeof data.city === "string" ? data.city : "";
    const region = typeof data.region === "string" ? data.region : "";
    const country = typeof data.country === "string" ? data.country : "";
    const parts = [city, region, country].filter((p) => p.length > 0);
    if (parts.length === 0) return "Không có dữ liệu vị trí";
    return parts.join(", ");
  } catch {
    return "Lỗi tra cứu vị trí";
  }
}

const RECAPTCHA_TEST_SECRET_KEY = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";

function isLocalCaptchaFallbackAllowed(): boolean {
  return !Deno.env.get("DENO_DEPLOYMENT_ID");
}

/**
 * Get the reCAPTCHA secret key from environment variables.
 * FIX C-05: Throws error if key is not configured to prevent accidental bypass of captcha.
 */
export function getRecaptchaSecretKey(): string {
  const configuredKey = Deno.env.get("RECAPTCHA_SECRET_KEY")?.trim();
  if (!configuredKey) {
    // FIX C-05: Throw error instead of falling back to test key
    throw new Error(
      "RECAPTCHA_SECRET_KEY is not configured. This is required for production. " +
      "Please set the environment variable before deploying."
    );
  }
  return configuredKey;
}

export interface RecaptchaVerificationResult {
  allowed: boolean;
  error?: string;
  errorCodes?: string[];
  hostname?: string;
  challengeTs?: string;
  status?: number;
}

export async function verifyRecaptchaToken(
  request: Request,
  token: string | null | undefined,
  options: {
    expectedAction?: string;
    minScore?: number;
  } = {},
): Promise<RecaptchaVerificationResult> {
  const secretKey = getRecaptchaSecretKey();
  if (!secretKey) {
    return {
      allowed: false,
      error: "Captcha is not configured on the server. Set RECAPTCHA_SECRET_KEY in Supabase secrets.",
      status: 500,
    };
  }

  const trimmedToken = token?.trim() ?? "";
  if (!trimmedToken) {
    return {
      allowed: false,
      error: "Captcha verification is required.",
      status: 400,
    };
  }

  try {
    const formData = new URLSearchParams({
      secret: secretKey,
      response: trimmedToken,
    });

    const clientIP = getClientIP(request);
    if (clientIP && clientIP !== "unknown") {
      formData.set("remoteip", clientIP);
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      return {
        allowed: false,
        error: "Unable to verify captcha right now. Please try again.",
        status: 502,
      };
    }

    const payload = await response.json().catch(() => ({} as Record<string, unknown>));
    const success = payload?.success === true;
    const errorCodes = Array.isArray(payload?.["error-codes"])
      ? payload["error-codes"].filter((code): code is string => typeof code === "string")
      : [];

    if (!success) {
      return {
        allowed: false,
        error: "Captcha verification failed.",
        errorCodes,
        status: 403,
      };
    }

    const action = typeof payload?.action === "string" ? payload.action : undefined;
    if (options.expectedAction && action && action !== options.expectedAction) {
      return {
        allowed: false,
        error: "Captcha action mismatch.",
        errorCodes,
        status: 403,
      };
    }

    const score = typeof payload?.score === "number" ? payload.score : undefined;
    if (
      typeof options.minScore === "number" &&
      typeof score === "number" &&
      score < options.minScore
    ) {
      return {
        allowed: false,
        error: "Captcha score is too low.",
        errorCodes,
        status: 403,
      };
    }

    return {
      allowed: true,
      errorCodes,
      hostname: typeof payload?.hostname === "string" ? payload.hostname : undefined,
      challengeTs: typeof payload?.challenge_ts === "string" ? payload.challenge_ts : undefined,
    };
  } catch (error) {
    console.error("Error verifying captcha:", error);
    return {
      allowed: false,
      error: "Unable to verify captcha right now. Please try again.",
      status: 502,
    };
  }
}

export const RATE_LIMITS = {
  general: { maxRequests: 100, windowMinutes: 60 },
  cvParser: { maxRequests: 5, windowMinutes: 60 },
  jobRecommendations: { maxRequests: 15, windowMinutes: 60 },
  /** Logged-in users: chat requests per scope key per hour. */
  chat: { maxRequests: 40, windowMinutes: 60 },
  /** Guests: blocked by AI guard; this is a safety fallback only. */
  chatGuest: { maxRequests: 0, windowMinutes: 60 },
  auth: { maxRequests: 5, windowMinutes: 15 },
  uploads: { maxRequests: 10, windowMinutes: 60 },
  /** New account registrations per client IP per hour — tightened from 8. */
  authRegisterIp: { maxRequests: 3, windowMinutes: 60 },
  /**
   * Guest chat: fully blocked by AI guard. Kept at 0 as defense-in-depth.
   */
  chatGuestIpCap: { maxRequests: 0, windowMinutes: 60 },
} as const;

function isPostgresUniqueViolation(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    return (error as { code?: string }).code === "23505";
  }
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("23505") || msg.includes("duplicate key");
}

export async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  endpoint: string,
  config = RATE_LIMITS.general,
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: string;
  retryAfter?: number;
}> {
  const maxRaceRetries = 6;

  for (let attempt = 0; attempt < maxRaceRetries; attempt++) {
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMinutes * 60 * 1000);

    try {
      const { data: rows, error: selectError } = await supabase
        .from("rate_limits")
        .select("request_count, window_start")
        .eq("user_id", userId)
        .eq("endpoint", endpoint)
        .gte("window_start", windowStart.toISOString())
        .order("window_start", { ascending: false })
        .limit(1);

      if (selectError) throw selectError;

      const existing = rows?.[0] ?? null;

      if (!existing) {
        const { error: insertError } = await supabase.from("rate_limits").insert({
          user_id: userId,
          endpoint,
          request_count: 1,
          window_start: now.toISOString(),
        });

        if (insertError) {
          if (isPostgresUniqueViolation(insertError)) {
            continue;
          }
          throw insertError;
        }

        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetAt: new Date(now.getTime() + config.windowMinutes * 60 * 1000).toISOString(),
        };
      }

      const count = existing.request_count || 0;
      const windowStartTime = new Date(existing.window_start);

      if (count >= config.maxRequests) {
        const resetTime = new Date(windowStartTime.getTime() + config.windowMinutes * 60 * 1000);
        const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetAt: resetTime.toISOString(),
          retryAfter,
        };
      }

      const { error: updateError } = await supabase
        .from("rate_limits")
        .update({ request_count: count + 1 })
        .eq("user_id", userId)
        .eq("endpoint", endpoint)
        .eq("window_start", existing.window_start);

      if (updateError) throw updateError;

      const resetTime = new Date(windowStartTime.getTime() + config.windowMinutes * 60 * 1000);

      return {
        allowed: true,
        remaining: config.maxRequests - count - 1,
        resetAt: resetTime.toISOString(),
      };
    } catch (error) {
      console.error("Error checking rate limit:", error);
      // Fail closed: previously returned allowed:true here, which let spam through whenever the DB
      // errored (including duplicate-key races that hit the catch before this fix).
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(Date.now() + 60_000).toISOString(),
        retryAfter: 60,
      };
    }
  }

  console.error("Error checking rate limit: exhausted retries after concurrent insert conflicts");
  return {
    allowed: false,
    remaining: 0,
    resetAt: new Date(Date.now() + 60_000).toISOString(),
    retryAfter: 60,
  };
}

export function createRateLimitHeaders(result: {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  retryAfter?: number;
}): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": result.resetAt,
  };

  if (!result.allowed && result.retryAfter) {
    headers["Retry-After"] = String(result.retryAfter);
  }

  return headers;
}
