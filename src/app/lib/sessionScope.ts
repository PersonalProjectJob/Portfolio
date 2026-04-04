import { useEffect, useState } from "react";
import {
  hasAdminAccess,
  hasUnlimitedQuota,
  normalizeAppRole,
  type AppRole,
} from "./authRoles";

export type SessionMode = "guest" | "account";
export type AccountStatus = "active" | "disabled";

export interface SessionIdentity {
  mode: SessionMode;
  scopeKey: string;
  guestSessionId: string;
  userId: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  role: AppRole | null;
  status: AccountStatus | null;
  canAccessAdmin: boolean;
  hasUnlimitedQuota: boolean;
  emailVerified: boolean;
}

const GUEST_SESSION_ID_KEY = "careerai-guest-session-id";
const LEGACY_GUEST_SESSION_ID_KEY = "careerai-device-id";
const USER_ID_KEY = "careerai-user-id";
const USER_EMAIL_KEY = "careerai-user-email";
const USER_ROLE_KEY = "careerai-user-role";
const USER_STATUS_KEY = "careerai-user-status";
const AUTHENTICATED_KEY = "careerai-authenticated";
const AUTH_SESSION_TOKEN_KEY = "careerai-auth-token";
const AUTH_TOKEN_HINT = "auth-token";
const SESSION_CHANGE_EVENT = "careerai-session-identity-updated";
const EMAIL_VERIFIED_KEY = "careerai-email-verified";

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function readStorageItem(key: string): string | null {
  if (!canUseStorage()) return null;

  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageItem(key: string, value: string): void {
  if (!canUseStorage()) return;

  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function removeStorageItem(key: string): void {
  if (!canUseStorage()) return;

  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function randomGuestSessionId(): string {
  const suffix = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `guest_${suffix}`;
}

export function getGuestSessionId(): string {
  const existing = readStorageItem(GUEST_SESSION_ID_KEY) || readStorageItem(LEGACY_GUEST_SESSION_ID_KEY);
  if (existing) {
    if (!readStorageItem(GUEST_SESSION_ID_KEY)) {
      writeStorageItem(GUEST_SESSION_ID_KEY, existing);
    }
    if (!readStorageItem(LEGACY_GUEST_SESSION_ID_KEY)) {
      writeStorageItem(LEGACY_GUEST_SESSION_ID_KEY, existing);
    }
    return existing;
  }

  const nextId = randomGuestSessionId();
  writeStorageItem(GUEST_SESSION_ID_KEY, nextId);
  writeStorageItem(LEGACY_GUEST_SESSION_ID_KEY, nextId);
  return nextId;
}

/**
 * Generate a browser fingerprint based on navigator properties
 * This creates a unique identifier for the specific browser/device
 */
function generateBrowserFingerprint(): string {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  // Collect browser properties that are stable for the same browser
  const fingerprintData = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    navigator.hardwareConcurrency || 0,
    // @ts-ignore - deviceMemory is experimental but widely supported
    navigator.deviceMemory || 0,
    new Date().getTimezoneOffset().toString(),
    // Add screen properties
    typeof screen !== "undefined" ? `${screen.width}x${screen.height}x${screen.colorDepth}` : "",
  ].join("|");

  // Simple hash function to create a short fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprintData.length; i++) {
    const char = fingerprintData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
}

export function getLocalMachineId(): string {
  // Reuse the stable local browser id so guest and account sessions on the
  // same device share one token quota bucket.
  return getGuestSessionId();
}

export function getBrowserFingerprint(): string {
  const storedFingerprint = readStorageItem("careerai-browser-fingerprint-v2");
  if (storedFingerprint) {
    return storedFingerprint;
  }

  const newFingerprint = generateBrowserFingerprint();
  writeStorageItem("careerai-browser-fingerprint-v2", newFingerprint);
  return newFingerprint;
}

function getUserId(): string | null {
  const userId = readStorageItem(USER_ID_KEY)?.trim();
  return userId ? userId : null;
}

function getUserEmail(): string | null {
  const email = readStorageItem(USER_EMAIL_KEY)?.trim();
  return email ? email : null;
}

function getUserRole(): AppRole | null {
  return normalizeAppRole(readStorageItem(USER_ROLE_KEY)?.trim());
}

function getUserStatus(): AccountStatus | null {
  const status = readStorageItem(USER_STATUS_KEY)?.trim();
  return status === "active" || status === "disabled" ? status : null;
}

function getAuthToken(): string | null {
  const token = readStorageItem(AUTH_SESSION_TOKEN_KEY)?.trim();
  return token ? token : null;
}

export function resolveAuthenticatedState(): boolean {
  if (!canUseStorage()) return false;

  try {
    const userId = getUserId();
    const authToken = getAuthToken();
    if (!userId || !authToken) return false;

    if (localStorage.getItem(AUTHENTICATED_KEY) === "true") return true;

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.includes(AUTH_TOKEN_HINT)) continue;
      const value = localStorage.getItem(key);
      if (value && value !== "{}" && value !== "null") return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function resolveSessionIdentity(): SessionIdentity {
  const guestSessionId = getGuestSessionId();
  const userId = getUserId();
  const userEmail = getUserEmail();
  const role = getUserRole();
  const status = getUserStatus();
  const authToken = getAuthToken();
  const isAuthenticated = Boolean(userId && authToken && resolveAuthenticatedState());
  const mode: SessionMode = isAuthenticated ? "account" : "guest";

  return {
    mode,
    scopeKey: mode === "account" && userId ? `account:${userId}` : `guest:${guestSessionId}`,
    guestSessionId,
    userId: mode === "account" ? userId : null,
    userEmail: mode === "account" ? userEmail : null,
    isAuthenticated,
    role: mode === "account" ? role : null,
    status: mode === "account" ? status : null,
    canAccessAdmin: mode === "account" ? hasAdminAccess(role) : false,
    hasUnlimitedQuota: mode === "account" ? hasUnlimitedQuota(role) : false,
    emailVerified: mode === "account" ? readStorageItem(EMAIL_VERIFIED_KEY) === "true" : false,
  };
}

export interface PersistedAuthSession {
  userId: string;
  userEmail?: string | null;
  sessionToken: string;
  role?: AppRole | null;
  status?: AccountStatus | null;
  emailVerified?: boolean;
}

export function persistAuthenticatedSession(session: PersistedAuthSession): SessionIdentity {
  writeStorageItem(USER_ID_KEY, session.userId);
  if (session.userEmail) {
    writeStorageItem(USER_EMAIL_KEY, session.userEmail);
  } else {
    removeStorageItem(USER_EMAIL_KEY);
  }
  writeStorageItem(AUTH_SESSION_TOKEN_KEY, session.sessionToken);
  if (session.role) {
    writeStorageItem(USER_ROLE_KEY, session.role);
  } else {
    removeStorageItem(USER_ROLE_KEY);
  }
  if (session.status) {
    writeStorageItem(USER_STATUS_KEY, session.status);
  } else {
    removeStorageItem(USER_STATUS_KEY);
  }
  writeStorageItem(AUTHENTICATED_KEY, "true");
  if (session.emailVerified !== undefined) {
    writeStorageItem(EMAIL_VERIFIED_KEY, session.emailVerified ? "true" : "false");
  } else {
    removeStorageItem(EMAIL_VERIFIED_KEY);
  }
  dispatchSessionIdentityUpdate();
  return resolveSessionIdentity();
}

export function clearAuthenticatedSession(): void {
  removeStorageItem(USER_ID_KEY);
  removeStorageItem(USER_EMAIL_KEY);
  removeStorageItem(AUTH_SESSION_TOKEN_KEY);
  removeStorageItem(USER_ROLE_KEY);
  removeStorageItem(USER_STATUS_KEY);
  removeStorageItem(AUTHENTICATED_KEY);
  removeStorageItem(EMAIL_VERIFIED_KEY);
  dispatchSessionIdentityUpdate();
}

export function useSessionIdentity(): SessionIdentity {
  const [identity, setIdentity] = useState<SessionIdentity>(() => resolveSessionIdentity());

  useEffect(() => {
    const sync = () => {
      setIdentity(resolveSessionIdentity());
    };

    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener(SESSION_CHANGE_EVENT, sync as EventListener);

    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener(SESSION_CHANGE_EVENT, sync as EventListener);
    };
  }, []);

  return identity;
}

export function buildSessionHeaders(identity = resolveSessionIdentity()): Record<string, string> {
  const headers: Record<string, string> = {
    "X-CareerAI-Scope-Key": identity.scopeKey,
    "X-CareerAI-Scope-Mode": identity.mode,
    "X-CareerAI-Guest-Session-Id": identity.guestSessionId,
    "X-CareerAI-Browser-Fingerprint": getBrowserFingerprint(),
  };

  if (identity.userId) {
    headers["X-CareerAI-User-Id"] = identity.userId;
  }

  const authToken = getAuthToken();
  if (identity.mode === "account" && authToken) {
    headers["X-CareerAI-Auth-Token"] = authToken;
  }

  return headers;
}

export function scopeStorageKey(baseKey: string, scopeKey = resolveSessionIdentity().scopeKey): string {
  return `${baseKey}:${scopeKey}`;
}

export function sanitizeScopeSegment(scopeKey: string): string {
  return scopeKey.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function copyScopedStorageEntries(
  fromScopeKey: string,
  toScopeKey: string,
  prefixes: string[],
): number {
  if (!canUseStorage() || fromScopeKey === toScopeKey) return 0;

  const sourceMarker = `:${fromScopeKey}`;
  const targetMarker = `:${toScopeKey}`;
  const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
    (key): key is string => !!key,
  );

  let copied = 0;
  for (const key of keys) {
    if (!prefixes.some((prefix) => key.startsWith(prefix))) continue;
    if (!key.includes(sourceMarker)) continue;

    const nextKey = key.replace(sourceMarker, targetMarker);
    try {
      const value = localStorage.getItem(key);
      if (value != null) {
        localStorage.setItem(nextKey, value);
        copied += 1;
      }
    } catch {
      /* ignore */
    }
  }

  return copied;
}

export function dispatchSessionIdentityUpdate(): void {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}