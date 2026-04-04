/**
 * Google reCAPTCHA configuration
 *
 * Create keys as **reCAPTCHA v2 → Invisible** in the Google admin (not “I'm not a robot” checkbox).
 * Checkbox keys still work but show a large widget; invisible keys match this app’s `size: "invisible"` flow.
 *
 * Put your public site key here if your hosting platform cannot inject env vars.
 * The secret key must stay on the server (Supabase secrets) and is not stored here.
 */

// Public site key used by the browser challenge.
// Leave this empty if you prefer to provide VITE_RECAPTCHA_SITE_KEY via env.
export const publicRecaptchaSiteKey = "6LcRVJ8sAAAAAF-2Al8_GeciwZIbmxExOblRSI-B";
