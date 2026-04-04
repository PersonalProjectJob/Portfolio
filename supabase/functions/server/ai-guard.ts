/**
 * AI Guard — Tiered quota enforcement for AI/LLM endpoints.
 *
 * ## Tiers
 *
 * | Tier       | Chat/day | CV parse/day | Burst/min | Notes                      |
 * |------------|----------|--------------|-----------|----------------------------|
 * | Guest      | 3 total  | 0            | 1         | Lifetime cap per device+IP |
 * | Unverified | 10       | 2            | 3         | Email not confirmed yet    |
 * | Verified   | 50       | 5            | 8         | Email confirmed            |
 * | Privileged | ∞        | ∞            | 30        | tester / admin / owner     |
 *
 * ## Response states (never exposes internal thresholds)
 *
 * - ALLOW                     → proceed to LLM
 * - GUEST_LIMIT_REACHED       → trial used up, prompt sign-in
 * - AUTH_REQUIRED              → no valid session / token
 * - UNVERIFIED_LIMIT_REACHED  → registered-user daily cap hit
 * - VERIFICATION_REQUIRED     → needs email verification for more
 * - DAILY_LIMIT_REACHED       → verified-user daily cap hit
 * - RATE_LIMITED              → burst / IP flood
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { getClientIP, checkRateLimit, createRateLimitHeaders } from "./shared.ts";
import { isEmailVerified } from "./email-verify.ts";
import { validateRequestSignature } from "./request-signature.ts";

type SupabaseAdmin = ReturnType<typeof createClient>;

// ── Public types ──────────────────────────────────────────────────────

export type AiResponseState =
  | "ALLOW"
  | "GUEST_LIMIT_REACHED"
  | "AUTH_REQUIRED"
  | "UNVERIFIED_LIMIT_REACHED"
  | "VERIFICATION_REQUIRED"
  | "DAILY_LIMIT_REACHED"
  | "RATE_LIMITED";

export interface AiGuardIdentity {
  mode: "guest" | "account";
  scopeKey: string;
  guestSessionId: string;
  userId: string | null;
  sessionToken: string | null;
  authVerified: boolean;
  authError?: string;
  authStatus?: number;
  browserFingerprint?: string;
}

export interface AiGuardResult {
  allowed: boolean;
  state: AiResponseState;
  /** HTTP status code when blocked */
  status?: number;
  /** Sanitized response body — no internal details */
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

// ── Internal tier definitions (NEVER exposed to client) ───────────────

type AccountTier = "guest" | "unverified" | "verified" | "privileged";

interface TierLimits {
  chatDaily: number;        // 0 = blocked, -1 = unlimited
  cvParseDaily: number;
  burstPerMinute: number;
  /** For guests: lifetime cap instead of daily */
  guestLifetimeCap?: number;
}

const TIER_LIMITS: Record<AccountTier, TierLimits> = {
  guest: {
    chatDaily: 0,           // use guestLifetimeCap instead
    cvParseDaily: 0,
    burstPerMinute: 1,
    guestLifetimeCap: 3,
  },
  unverified: {
    chatDaily: 10,
    cvParseDaily: 2,
    burstPerMinute: 3,
  },
  verified: {
    chatDaily: 50,
    cvParseDaily: 5,
    burstPerMinute: 8,
  },
  privileged: {
    chatDaily: -1,
    cvParseDaily: -1,
    burstPerMinute: 30,
  },
};

/** IP-level flood protection — applies to all tiers */
const IP_HOURLY_CAP = { maxRequests: 80, windowMinutes: 60 };

// ── Tier resolution ───────────────────────────────────────────────────

type AppRole = "user" | "tester" | "admin" | "owner";

function normalizeUserRole(value: unknown): AppRole {
  switch (value) {
    case "user": case "tester": case "admin": case "owner":
      return value;
    default:
      return "user";
  }
}

function isPrivilegedRole(role: AppRole): boolean {
  return role === "tester" || role === "admin" || role === "owner";
}

/**
 * Resolve account tier from DB state.  Backend is the single source of truth.
 */
async function resolveAccountTier(
  supabase: SupabaseAdmin,
  identity: AiGuardIdentity,
): Promise<AccountTier> {
  if (identity.mode !== "account" || !identity.userId) {
    return "guest";
  }

  // Load user row
  const { data: user } = await supabase
    .from("users")
    .select("role, status")
    .eq("user_id", identity.userId)
    .maybeSingle();

  if (!user || user.status === "disabled") {
    return "guest"; // treat disabled accounts as guest
  }

  const role = normalizeUserRole(user.role);
  if (isPrivilegedRole(role)) {
    return "privileged";
  }

  // Check email verification via SQL table
  const verifiedFlag = await isEmailVerified(identity.userId);
  if (verifiedFlag) {
    return "verified";
  }

  // Check subscription
  try {
    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("plan_type, is_unlimited")
      .eq("user_id", identity.userId)
      .maybeSingle();
    if (sub?.is_unlimited === true || sub?.plan_type === "unlimited" || sub?.plan_type === "premium") {
      return "privileged";
    }
  } catch { /* table may not exist */ }

  return "unverified";
}

// ── Guard helpers ─────────────────────────────────────────────────────

function makeBlockedResult(
  state: AiResponseState,
  status: number,
  headers?: Record<string, string>,
): AiGuardResult {
  // Product-friendly messages only — never mention exact limits, IPs, or rules
  const messages: Record<AiResponseState, string> = {
    ALLOW: "",
    GUEST_LIMIT_REACHED:
      "Bạn đã dùng hết lượt trải nghiệm AI miễn phí. Đăng ký tài khoản để tiếp tục sử dụng!",
    AUTH_REQUIRED:
      "Vui lòng đăng nhập hoặc tạo tài khoản để sử dụng tính năng AI.",
    UNVERIFIED_LIMIT_REACHED:
      "Bạn đã đạt giới hạn sử dụng AI hôm nay. Xác minh email để được tăng giới hạn!",
    VERIFICATION_REQUIRED:
      "Xác minh email để mở khóa thêm lượt sử dụng AI.",
    DAILY_LIMIT_REACHED:
      "Bạn đã đạt giới hạn AI trong ngày. Quay lại vào ngày mai nhé!",
    RATE_LIMITED:
      "Bạn đang gửi yêu cầu quá nhanh. Vui lòng đợi một chút.",
  };

  return {
    allowed: false,
    state,
    status,
    body: {
      state,
      message: messages[state],
    },
    headers,
  };
}

// ── Guest lifetime cap (KV-backed) ───────────────────────────────────

/**
 * Combine device fingerprint + IP into a single guest bucket key.
 * This prevents rotating either dimension alone from resetting the cap.
 */
function guestBucketKey(identity: AiGuardIdentity, ip: string): string {
  const fp = identity.browserFingerprint?.trim().toLowerCase().slice(0, 40) || "nofp";
  const ipSan = ip.replace(/[^a-fA-F0-9.:]/g, "_").slice(0, 45) || "noip";
  return `guest_ai:${fp}:${ipSan}`;
}

async function checkGuestLifetimeCap(
  identity: AiGuardIdentity,
  ip: string,
  cap: number,
  endpoint: string,
): Promise<{ allowed: boolean }> {
  const key = `${guestBucketKey(identity, ip)}:${endpoint}`;
  const raw = await kv.get(key);
  const used = raw ? parseInt(raw, 10) : 0;
  if (!Number.isFinite(used) || used >= cap) {
    console.log(`[ai-guard] Guest lifetime cap reached: ${key} = ${used}/${cap}`);
    return { allowed: false };
  }
  // Increment
  await kv.set(key, String(used + 1));
  return { allowed: true };
}

// ── Main entry point ──────────────────────────────────────────────────

export type AiEndpoint = "chat" | "parse-cv" | "parse-cv-image" | "job-recommendations";

/**
 * Full AI access check.  Call at the top of every AI endpoint, BEFORE any LLM call.
 *
 * Returns `{ allowed: true, state: "ALLOW" }` or a blocked result with
 * a sanitized response body ready to send to the client.
 */
export async function checkAiAccess(
  supabase: SupabaseAdmin,
  identity: AiGuardIdentity,
  request: Request,
  endpoint: AiEndpoint,
): Promise<AiGuardResult> {
  const ip = getClientIP(request);

  // ── Step 0: Auth error propagation ──
  if (identity.authError) {
    console.log(`[ai-guard] ${endpoint} auth error: ${identity.authError}`);
    return makeBlockedResult("AUTH_REQUIRED", identity.authStatus ?? 401);
  }

  // ── Step 0.5: Request signature validation (optional, only when configured) ──
  const sigResult = await validateRequestSignature(request);
  if (!sigResult.valid) {
    console.log(`[ai-guard] ${endpoint} signature validation failed: ${sigResult.error}`);
    return makeBlockedResult("AUTH_REQUIRED", sigResult.status ?? 401);
  }

  // ── Step 1: IP flood protection (all tiers) ──
  if (ip && ip !== "unknown") {
    const ipKey = `ai-ip:${ip.replace(/[^a-fA-F0-9.:]/g, "_")}`;
    const ipResult = await checkRateLimit(supabase, ipKey, `ai-ip:${endpoint}`, IP_HOURLY_CAP);
    if (!ipResult.allowed) {
      console.log(`[ai-guard] ${endpoint} IP flood: ${ip}`);
      return makeBlockedResult("RATE_LIMITED", 429, createRateLimitHeaders(ipResult));
    }
  } else {
    // Unknown IP = suspicious, block
    console.log(`[ai-guard] ${endpoint} blocked — unknown IP`);
    return makeBlockedResult("RATE_LIMITED", 429);
  }

  // ── Step 2: Resolve tier ──
  const tier = await resolveAccountTier(supabase, identity);
  const limits = TIER_LIMITS[tier];
  console.log(`[ai-guard] ${endpoint} tier=${tier} userId=${identity.userId ?? "guest"} ip=${ip}`);

  // ── Step 3: Burst limit (per-minute, all tiers) ──
  const burstKey = tier === "guest"
    ? guestBucketKey(identity, ip)
    : identity.userId!;
  const burstResult = await checkRateLimit(
    supabase,
    burstKey,
    `ai-burst:${endpoint}`,
    { maxRequests: limits.burstPerMinute, windowMinutes: 1 },
  );
  if (!burstResult.allowed) {
    console.log(`[ai-guard] ${endpoint} burst limit: tier=${tier} key=${burstKey}`);
    return makeBlockedResult("RATE_LIMITED", 429, createRateLimitHeaders(burstResult));
  }

  // ── Step 4: Tier-specific quota ──

  if (tier === "privileged") {
    return { allowed: true, state: "ALLOW" };
  }

  if (tier === "guest") {
    // Guest: lifetime cap check
    const cap = endpoint === "chat"
      ? (limits.guestLifetimeCap ?? 3)
      : 0; // CV parse / job-rec not available for guests

    if (cap <= 0) {
      return makeBlockedResult("AUTH_REQUIRED", 401);
    }

    const guestCheck = await checkGuestLifetimeCap(identity, ip, cap, endpoint);
    if (!guestCheck.allowed) {
      return makeBlockedResult("GUEST_LIMIT_REACHED", 403);
    }

    return { allowed: true, state: "ALLOW" };
  }

  // Account tiers (unverified / verified)
  const dailyLimit = endpoint === "chat" || endpoint === "job-recommendations"
    ? limits.chatDaily
    : limits.cvParseDaily;

  if (dailyLimit === 0) {
    // This tier has no access to this endpoint
    return makeBlockedResult(
      tier === "unverified" ? "VERIFICATION_REQUIRED" : "AUTH_REQUIRED",
      403,
    );
  }

  if (dailyLimit === -1) {
    // Unlimited
    return { allowed: true, state: "ALLOW" };
  }

  // Enforce daily cap
  const dailyResult = await checkRateLimit(
    supabase,
    identity.userId!,
    `ai-daily:${endpoint}`,
    { maxRequests: dailyLimit, windowMinutes: 24 * 60 },
  );
  if (!dailyResult.allowed) {
    const state: AiResponseState = tier === "unverified"
      ? "UNVERIFIED_LIMIT_REACHED"
      : "DAILY_LIMIT_REACHED";
    console.log(`[ai-guard] ${endpoint} daily limit: tier=${tier} userId=${identity.userId}`);
    return makeBlockedResult(state, 429, createRateLimitHeaders(dailyResult));
  }

  return { allowed: true, state: "ALLOW" };
}
