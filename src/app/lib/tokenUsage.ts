import {
  getLocalMachineId,
  resolveAuthenticatedState,
  resolveSessionIdentity,
  scopeStorageKey,
} from "./sessionScope";

const TOKEN_USAGE_KEY = "careerai-token-usage-v3";
const LEGACY_TOKEN_USAGE_KEY = "careerai-token-usage-v1";
const LEGACY_TOKEN_USAGE_PREFIX = "careerai-token-usage-v2";
const MAX_STORED_DAYS = 56;

export const TOKEN_LIMITS = {
  guest: 18_000,
  authenticated: 50_000,
} as const;

interface TokenUsageStore {
  daily: Record<string, number>;
}

export interface TokenUsageDay {
  date: Date;
  dateKey: string;
  tokens: number;
  isToday: boolean;
}

export interface TokenUsageSummary {
  isAuthenticated: boolean;
  isUnlimited: boolean;
  weeklyLimit: number;
  usedThisWeek: number;
  remaining: number;
  remainingRatio: number;
  usedRatio: number;
  days: TokenUsageDay[];
}

function getUsageScopeKey(): string {
  return `machine:${getLocalMachineId()}`;
}

function parseStore(raw: string): TokenUsageStore | null {
  try {
    const parsed = JSON.parse(raw) as Partial<TokenUsageStore> | null;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.daily || typeof parsed.daily !== "object") return { daily: {} };
    return { daily: parsed.daily as Record<string, number> };
  } catch {
    return null;
  }
}

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function mergeStore(target: TokenUsageStore, source: TokenUsageStore): TokenUsageStore {
  const nextDaily: Record<string, number> = { ...target.daily };
  for (const [dateKey, tokens] of Object.entries(source.daily)) {
    const nextTokens = Number.isFinite(tokens) ? tokens : 0;
    nextDaily[dateKey] = (nextDaily[dateKey] ?? 0) + Math.round(nextTokens);
  }
  return { daily: nextDaily };
}

function readLegacyStore(): TokenUsageStore {
  if (!canUseStorage()) return { daily: {} };

  let merged: TokenUsageStore = { daily: {} };
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
      (key): key is string => !!key,
    );

    for (const key of keys) {
      if (key !== LEGACY_TOKEN_USAGE_KEY && !key.startsWith(`${LEGACY_TOKEN_USAGE_PREFIX}:`)) {
        continue;
      }

      const parsed = parseStore(localStorage.getItem(key) || "");
      if (parsed) {
        merged = mergeStore(merged, parsed);
      }
    }
  } catch {
    /* ignore */
  }

  return merged;
}

function readStore(now = new Date()): TokenUsageStore {
  if (!canUseStorage()) return { daily: {} };

  const scopedKey = scopeStorageKey(TOKEN_USAGE_KEY, getUsageScopeKey());

  try {
    const raw = localStorage.getItem(scopedKey);
    if (raw) {
      const parsed = parseStore(raw);
      if (parsed) {
        const hasCurrentUsage = Object.keys(parsed.daily).length > 0;
        if (hasCurrentUsage) {
          return pruneStore(parsed, now);
        }

        const legacy = readLegacyStore();
        if (Object.keys(legacy.daily).length > 0) {
          return pruneStore(mergeStore(parsed, legacy), now);
        }

        return pruneStore(parsed, now);
      }
    }

    const legacy = readLegacyStore();
    if (Object.keys(legacy.daily).length > 0) {
      return pruneStore(legacy, now);
    }
  } catch {
    /* ignore */
  }

  return { daily: {} };
}

function writeStore(store: TokenUsageStore, now = new Date()): void {
  if (!canUseStorage()) return;

  const scopedKey = scopeStorageKey(TOKEN_USAGE_KEY, getUsageScopeKey());
  const nextStore = pruneStore(store, now);

  try {
    localStorage.setItem(scopedKey, JSON.stringify(nextStore));
    window.dispatchEvent(new Event("careerai-token-usage-updated"));
  } catch {
    /* ignore */
  }
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

function getWeekStart(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
}

function getWeekDates(reference = new Date()): Date[] {
  const start = getWeekStart(reference);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
}

function pruneStore(store: TokenUsageStore, now = new Date()): TokenUsageStore {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - MAX_STORED_DAYS);

  const nextDaily = Object.fromEntries(
    Object.entries(store.daily).filter(([dateKey]) => fromDateKey(dateKey) >= cutoff),
  );

  return { daily: nextDaily };
}

export function estimateTokenCount(text: string): number {
  const normalized = text.trim();
  if (!normalized) return 0;

  const chars = [...normalized].length;
  const words = normalized.split(/\s+/).filter(Boolean).length;
  return Math.max(words, Math.ceil(chars / 3.5));
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getCombinedUsageTotal(record: Record<string, unknown>): number | null {
  const promptTokens = toFiniteNumber(
    record.promptTokens ??
      record.prompt_tokens ??
      record.input_tokens ??
      record.inputTokens,
  );
  const completionTokens = toFiniteNumber(
    record.completionTokens ??
      record.completion_tokens ??
      record.output_tokens ??
      record.outputTokens,
  );

  if (promptTokens != null && completionTokens != null) {
    return promptTokens + completionTokens;
  }

  const totalTokens = toFiniteNumber(record.totalTokens ?? record.total_tokens);
  return totalTokens;
}

export function getTotalTokenUsage(usage: unknown): number | null {
  if (!usage || typeof usage !== "object") return null;

  const record = usage as Record<string, unknown>;
  const nestedUsageMetadata = record.usage_metadata;
  if (nestedUsageMetadata && typeof nestedUsageMetadata === "object") {
    const nestedTotal = getCombinedUsageTotal(
      nestedUsageMetadata as Record<string, unknown>,
    );
    if (nestedTotal != null) return nestedTotal;
  }

  const nestedResponseMetadata = record.response_metadata;
  if (nestedResponseMetadata && typeof nestedResponseMetadata === "object") {
    const responseRecord = nestedResponseMetadata as Record<string, unknown>;
    const tokenUsage = responseRecord.token_usage;
    if (tokenUsage && typeof tokenUsage === "object") {
      const total = getCombinedUsageTotal(tokenUsage as Record<string, unknown>);
      if (total != null) return total;
    }
  }

  return getCombinedUsageTotal(record);
}

export function recordTokenUsage(
  tokens: number,
  date = new Date(),
  _scopeKey?: string,
): void {
  if (!Number.isFinite(tokens) || tokens <= 0) return;

  const store = readStore(date);
  const dateKey = toDateKey(date);
  store.daily[dateKey] = (store.daily[dateKey] ?? 0) + Math.round(tokens);
  writeStore(store, date);
}

export function recordTokenUsageFromUsage(
  usage: unknown,
  date = new Date(),
  _scopeKey?: string,
): number | null {
  const total = getTotalTokenUsage(usage);
  if (total == null || total <= 0) return null;

  recordTokenUsage(total, date);
  return total;
}

export function getTokenUsageSummary(now = new Date()): TokenUsageSummary {
  const store = readStore(now);
  const identity = resolveSessionIdentity();
  const authState = resolveAuthenticatedState();
  const isUnlimited = identity.hasUnlimitedQuota;
  const weeklyLimit = authState
    ? TOKEN_LIMITS.authenticated
    : TOKEN_LIMITS.guest;
  const todayKey = toDateKey(now);

  const days = getWeekDates(now).map((date) => {
    const dateKey = toDateKey(date);
    return {
      date,
      dateKey,
      tokens: store.daily[dateKey] ?? 0,
      isToday: dateKey === todayKey,
    };
  });

  const usedThisWeek = days.reduce((sum, day) => sum + day.tokens, 0);
  const remaining = isUnlimited ? weeklyLimit : Math.max(0, weeklyLimit - usedThisWeek);
  const remainingRatio = isUnlimited ? 1 : weeklyLimit > 0 ? remaining / weeklyLimit : 0;
  const usedRatio = isUnlimited ? 0 : weeklyLimit > 0 ? Math.min(1, usedThisWeek / weeklyLimit) : 0;

  return {
    isAuthenticated: authState,
    isUnlimited,
    weeklyLimit,
    usedThisWeek,
    remaining,
    remainingRatio,
    usedRatio,
    days,
  };
}

export function formatCompactTokenCount(value: number): string {
  if (value >= 1000) {
    const compact = value / 1000;
    return `${compact % 1 === 0 ? compact.toFixed(0) : compact.toFixed(1)}k`;
  }
  return `${value}`;
}
