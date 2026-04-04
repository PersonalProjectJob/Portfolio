/**
 * Email domain allowlist validation.
 *
 * Configurable via ALLOWED_EMAIL_DOMAINS env var (comma-separated).
 * Falls back to a built-in default list of major providers.
 */

const DEFAULT_ALLOWED_DOMAINS: readonly string[] = [
  // Google
  "gmail.com",
  "googlemail.com",
  // Microsoft
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  // Yahoo
  "yahoo.com",
  "ymail.com",
  // Apple
  "icloud.com",
  "me.com",
  "mac.com",
  // Others
  "aol.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  // Test / disposable (intentionally allowed)
  "mailinator.com",
];

let _cachedSet: Set<string> | null = null;

function getAllowedDomains(): Set<string> {
  if (_cachedSet) return _cachedSet;

  const envRaw = (typeof Deno !== "undefined"
    ? Deno.env.get("ALLOWED_EMAIL_DOMAINS")
    : undefined) ?? "";

  if (envRaw.trim()) {
    _cachedSet = new Set(
      envRaw
        .split(",")
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean),
    );
  } else {
    _cachedSet = new Set(DEFAULT_ALLOWED_DOMAINS);
  }

  return _cachedSet;
}

/**
 * Returns true if the email's domain is in the allowlist.
 * Expects a trimmed, lowercase email.
 */
export function isEmailDomainAllowed(email: string): boolean {
  const atIdx = email.lastIndexOf("@");
  if (atIdx < 1) return false;
  const domain = email.slice(atIdx + 1).toLowerCase();
  return getAllowedDomains().has(domain);
}

/** Exported for frontend to share the same default list. */
export { DEFAULT_ALLOWED_DOMAINS };
