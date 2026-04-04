import { createClient } from "npm:@supabase/supabase-js@2";
import { getClientIP } from "./shared.ts";

type SupabaseAdmin = ReturnType<typeof createClient>;

export type ChatTokenScopeIdentity = {
  mode: "guest" | "account";
  scopeKey: string;
  userId: string | null;
  /** X-CareerAI-Browser-Fingerprint — stable per browser profile when sent from real clients */
  browserFingerprint?: string;
};

export type GuestChatEnforcementKeys = {
  /** Weekly tokens + primary chat rate limit */
  primary: string;
  /** Secondary cap: all guest chat from this IP (any fingerprint) */
  ipCapKey: string;
  /** When true, enforce `chat-guest-ip` in addition to `chat` on `primary` */
  applyIpCap: boolean;
};

function sanitizeIpForKey(ip: string): string {
  return ip.replace(/[^a-fA-F0-9.:]/g, "_");
}

export function isValidClientFingerprint(raw: string | undefined | null): boolean {
  const fp = raw?.trim() ?? "";
  if (fp.length < 4 || fp.length > 40) return false;
  const fpNorm = fp.toLowerCase();
  if (fpNorm === "unknown" || fpNorm === "0") return false;
  return /^[a-z0-9]+$/i.test(fp);
}

/**
 * Guest: prefer device fingerprint bucket (`gfpt:`) so changing IP alone does not reset quota.
 * Also returns an IP bucket for a second rate limit (flood across many fingerprints from one IP).
 * Account: single `account:…` key, no IP cap on chat.
 */
export function guestChatEnforcementKeys(
  identity: ChatTokenScopeIdentity,
  request: Request,
): GuestChatEnforcementKeys {
  const ip = getClientIP(request);
  const ipSan = ip && ip !== "unknown" ? sanitizeIpForKey(ip) : "";
  const ipCapKey = ipSan ? `gip:${ipSan}` : "gip:unknown";

  if (identity.mode === "account") {
    return { primary: identity.scopeKey, ipCapKey, applyIpCap: false };
  }

  if (isValidClientFingerprint(identity.browserFingerprint)) {
    const fp = identity.browserFingerprint!.trim();
    return {
      primary: `gfpt:${fp.slice(0, 40).toLowerCase()}`,
      ipCapKey,
      applyIpCap: true,
    };
  }

  return { primary: ipCapKey, ipCapKey, applyIpCap: false };
}

type AppRole = "user" | "tester" | "admin" | "owner";

const DEFAULT_ROLE: AppRole = "user";

function normalizeUserRole(value: unknown): AppRole {
  switch (value) {
    case "user":
    case "tester":
    case "admin":
    case "owner":
      return value;
    default:
      return DEFAULT_ROLE;
  }
}

function hasUnlimitedRoleQuota(role: AppRole): boolean {
  return role === "tester" || role === "admin" || role === "owner";
}

/** Align with src/app/lib/tokenUsage.ts TOKEN_LIMITS */
export const CHAT_TOKEN_WEEKLY_LIMIT_GUEST = 18_000;
export const CHAT_TOKEN_WEEKLY_LIMIT_ACCOUNT = 50_000;

/** UTC Monday (date only), same boundary logic as ISO week start for consistency on server. */
export function utcMondayDateString(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const day = now.getUTCDate();
  const dow = now.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(Date.UTC(y, m, day + offset));
  const yy = monday.getUTCFullYear();
  const mm = `${monday.getUTCMonth() + 1}`.padStart(2, "0");
  const dd = `${monday.getUTCDate()}`.padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function estimateChatReserveTokens(
  messages: Array<{ content?: unknown }>,
): number {
  let chars = 0;
  for (const msg of messages) {
    const c = msg.content;
    chars += typeof c === "string" ? c.length : 0;
  }
  const fromChars = Math.ceil(chars / 3.5);
  const completionHeadroom = 1536;
  const floor = 512;
  return Math.max(floor, Math.min(fromChars + completionHeadroom, 120_000));
}

async function isSubscriptionUnlimited(
  supabase: SupabaseAdmin,
  userId: string,
): Promise<boolean> {
  try {
    const { data: row } = await supabase
      .from("user_subscriptions")
      .select("plan_type, is_unlimited")
      .eq("user_id", userId)
      .maybeSingle();
    if (!row) return false;
    return (
      row.is_unlimited === true ||
      row.plan_type === "unlimited" ||
      row.plan_type === "premium"
    );
  } catch {
    return false;
  }
}

export async function resolveChatTokenPolicy(
  supabase: SupabaseAdmin,
  identity: ChatTokenScopeIdentity,
): Promise<{ enforce: boolean; weeklyLimit: number }> {
  if (identity.mode === "guest") {
    return {
      enforce: true,
      weeklyLimit: CHAT_TOKEN_WEEKLY_LIMIT_GUEST,
    };
  }

  if (!identity.userId) {
    return {
      enforce: true,
      weeklyLimit: CHAT_TOKEN_WEEKLY_LIMIT_ACCOUNT,
    };
  }

  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", identity.userId)
    .maybeSingle();

  const role = normalizeUserRole(user?.role);
  if (hasUnlimitedRoleQuota(role)) {
    return { enforce: false, weeklyLimit: CHAT_TOKEN_WEEKLY_LIMIT_ACCOUNT };
  }

  if (await isSubscriptionUnlimited(supabase, identity.userId)) {
    return { enforce: false, weeklyLimit: CHAT_TOKEN_WEEKLY_LIMIT_ACCOUNT };
  }

  return {
    enforce: true,
    weeklyLimit: CHAT_TOKEN_WEEKLY_LIMIT_ACCOUNT,
  };
}

export async function reserveChatWeeklyTokens(
  supabase: SupabaseAdmin,
  scopeKey: string,
  weekStart: string,
  reserve: number,
  weeklyLimit: number,
): Promise<{ ok: boolean; message?: string }> {
  const rounded = Math.max(0, Math.round(reserve));
  const { data, error } = await supabase.rpc("chat_token_reserve", {
    p_scope_key: scopeKey,
    p_week_start: weekStart,
    p_reserve: rounded,
    p_weekly_limit: weeklyLimit,
  });

  if (error) {
    console.log(`[chat-token] reserve RPC error: ${error.message}`);
    return { ok: false, message: "Token quota check failed" };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const ok = row && typeof row === "object" && (row as { ok?: boolean }).ok === true;
  if (!ok) {
    return {
      ok: false,
      message: "Weekly AI token quota exceeded. Try again next week or sign in for a higher limit.",
    };
  }
  return { ok: true };
}

export async function adjustChatWeeklyTokens(
  supabase: SupabaseAdmin,
  scopeKey: string,
  weekStart: string,
  delta: number,
): Promise<void> {
  const rounded = Math.round(delta);
  if (rounded === 0) return;

  const { error } = await supabase.rpc("chat_token_adjust", {
    p_scope_key: scopeKey,
    p_week_start: weekStart,
    p_delta: rounded,
  });

  if (error) {
    console.log(`[chat-token] adjust RPC error: ${error.message}`);
  }
}
