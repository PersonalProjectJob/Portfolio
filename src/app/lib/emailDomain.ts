/**
 * Email domain allowlist — frontend mirror.
 * Must stay in sync with /supabase/functions/server/email-domain.ts
 */

const ALLOWED_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "mailinator.com",
]);

export function isEmailDomainAllowed(email: string): boolean {
  const atIdx = email.lastIndexOf("@");
  if (atIdx < 1) return false;
  const domain = email.slice(atIdx + 1).toLowerCase();
  return ALLOWED_DOMAINS.has(domain);
}
