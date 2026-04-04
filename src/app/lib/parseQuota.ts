/**
 * CLIENT-SIDE parse quota tracking for UI display only.
 * 
 * ⚠️ IMPORTANT: This is NOT a security boundary. Server-side enforcement
 * is done in the CV parse endpoints using database rate limits with
 * 20-year windows (effectively lifetime caps per guest session).
 * 
 * This localStorage-based tracking is only for showing quota status in the UI
 * and can be bypassed by clearing browser data. Do NOT rely on this for
 * access control - always check server responses for actual quota status.
 */
import { getLocalMachineId, resolveSessionIdentity, scopeStorageKey, type SessionIdentity } from "./sessionScope";

const PARSE_QUOTA_KEY = "careerai-parse-quota-v1";
const PARSE_QUOTA_UPDATED_EVENT = "careerai-parse-quota-updated";

interface ParseQuotaStore {
  guestUsedAt?: string;
  accountUsedAt?: string;
}

export interface ParseQuotaSummary {
  mode: SessionIdentity["mode"];
  isAuthenticated: boolean;
  isUnlimited: boolean;
  guestRemaining: number;
  accountRemaining: number;
  currentRemaining: number;
  canParse: boolean;
  guestUsed: boolean;
  accountUsed: boolean;
  upgradeAvailable: boolean;
}

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function getMachineScopeKey(): string {
  return `machine:${getLocalMachineId()}`;
}

function getStorageKey(): string {
  return scopeStorageKey(PARSE_QUOTA_KEY, getMachineScopeKey());
}

function readStore(): ParseQuotaStore {
  if (!canUseStorage()) return {};

  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Partial<ParseQuotaStore> | null;
    if (!parsed || typeof parsed !== "object") return {};

    return {
      guestUsedAt: typeof parsed.guestUsedAt === "string" ? parsed.guestUsedAt : undefined,
      accountUsedAt: typeof parsed.accountUsedAt === "string" ? parsed.accountUsedAt : undefined,
    };
  } catch {
    return {};
  }
}

function writeStore(store: ParseQuotaStore): void {
  if (!canUseStorage()) return;

  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(store));
    window.dispatchEvent(new Event(PARSE_QUOTA_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function getParseQuotaSummary(
  identity: SessionIdentity = resolveSessionIdentity(),
): ParseQuotaSummary {
  const isUnlimited = identity.hasUnlimitedQuota;
  const store = readStore();
  const guestUsed = Boolean(store.guestUsedAt);
  const accountUsed = Boolean(store.accountUsedAt);

  const guestRemaining = guestUsed ? 0 : 1;
  const accountRemaining = accountUsed ? 0 : 1;
  const currentRemaining = isUnlimited
    ? Number.MAX_SAFE_INTEGER
    : identity.mode === "account"
      ? accountRemaining
      : guestRemaining;

  return {
    mode: identity.mode,
    isAuthenticated: identity.isAuthenticated,
    isUnlimited,
    guestRemaining,
    accountRemaining,
    currentRemaining,
    canParse: isUnlimited || currentRemaining > 0,
    guestUsed,
    accountUsed,
    upgradeAvailable: !identity.isAuthenticated && guestRemaining === 0 && accountRemaining > 0,
  };
}

export function recordParseQuotaUsage(
  identity: SessionIdentity = resolveSessionIdentity(),
  date = new Date(),
): void {
  if (!canUseStorage()) return;

  const store = readStore();
  const nextValue = date.toISOString();

  if (identity.mode === "account") {
    if (!store.accountUsedAt) {
      store.accountUsedAt = nextValue;
    }
  } else if (!store.guestUsedAt) {
    store.guestUsedAt = nextValue;
  }

  writeStore(store);
}

export function clearParseQuotaUsage(): void {
  if (!canUseStorage()) return;

  try {
    localStorage.removeItem(getStorageKey());
    window.dispatchEvent(new Event(PARSE_QUOTA_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function useParseQuotaStorageEventName(): string {
  return PARSE_QUOTA_UPDATED_EVENT;
}
