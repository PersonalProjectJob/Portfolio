/**
 * Email verification — token-based email confirmation flow.
 *
 * Storage: SQL table `email_verifications` (migrated from KV store).
 *   - `token` column stores the verification token
 *   - `verified` column tracks verification status
 *   - `token_expires` column tracks token expiry
 *   - `last_sent_at` column tracks resend cooldown
 *
 * Flow:
 *   1. User registers → server calls `sendVerificationEmail()`
 *   2. Email contains link: `{siteUrl}/auth/callback?token={token}&type=email_verify`
 *   3. Frontend opens that route, calls `POST /auth/verify-email` with the token
 *   4. Backend validates token, marks user as verified in SQL table
 */

import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between resends

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

interface VerifyTokenPayload {
  userId: string;
  email: string;
  expiresAt: string;
}

// ── Token management ──────────────────────────────────────────────────

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createVerificationToken(
  userId: string,
  email: string,
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS).toISOString();
  
  const supabase = getSupabaseAdmin();
  
  // Upsert: if a record exists for this user_id + email, update the token
  const { error } = await supabase
    .from("email_verifications")
    .upsert({
      user_id: userId,
      email,
      token,
      token_expires: expiresAt,
      verified: false,
      last_sent_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,email",
    });
  
  if (error) {
    throw new Error(`Failed to create verification token: ${error.message}`);
  }
  
  return token;
}

export async function validateVerificationToken(
  token: string,
): Promise<{ valid: true; userId: string; email: string } | { valid: false; reason: string }> {
  if (!token || token.length < 32) {
    return { valid: false, reason: "Invalid token format" };
  }

  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("email_verifications")
    .select("user_id, email, token_expires, verified")
    .eq("token", token)
    .maybeSingle();
  
  if (error) {
    console.error(`[email-verify] DB error: ${error.message}`);
    return { valid: false, reason: "Database error" };
  }
  
  if (!data) {
    return { valid: false, reason: "Token not found or already used" };
  }
  
  if (data.verified) {
    return { valid: false, reason: "Token already used" };
  }
  
  if (new Date(data.token_expires).getTime() < Date.now()) {
    return { valid: false, reason: "Token has expired" };
  }

  return { valid: true, userId: data.user_id, email: data.email };
}

export async function consumeVerificationToken(token: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  // Invalidate the token by setting it to NULL
  const { error } = await supabase
    .from("email_verifications")
    .update({ token: null })
    .eq("token", token);
  
  if (error) {
    console.error(`[email-verify] Failed to consume token: ${error.message}`);
  }
}

// ── Verified status ───────────────────────────────────────────────────

export async function markEmailVerified(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase
    .from("email_verifications")
    .update({ 
      verified: true, 
      verified_at: new Date().toISOString(),
      token: null // Invalidate any remaining tokens
    })
    .eq("user_id", userId);
  
  if (error) {
    console.error(`[email-verify] Failed to mark email verified: ${error.message}`);
  }
}

export async function isEmailVerified(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("email_verifications")
    .select("verified")
    .eq("user_id", userId)
    .eq("verified", true)
    .maybeSingle();
  
  if (error) {
    console.error(`[email-verify] DB error: ${error.message}`);
    return false;
  }
  
  return !!data?.verified;
}

// ── Resend cooldown ───────────────────────────────────────────────────

export async function canResendVerification(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("email_verifications")
    .select("last_sent_at")
    .eq("user_id", userId)
    .maybeSingle();
  
  if (error) {
    console.error(`[email-verify] DB error: ${error.message}`);
    return true; // Allow if we can't check
  }
  
  if (!data?.last_sent_at) return true;
  
  const lastSent = new Date(data.last_sent_at).getTime();
  return Date.now() - lastSent > RESEND_COOLDOWN_MS;
}

export async function markVerificationSent(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase
    .from("email_verifications")
    .update({ last_sent_at: new Date().toISOString() })
    .eq("user_id", userId);
  
  if (error) {
    console.error(`[email-verify] Failed to mark verification sent: ${error.message}`);
  }
}

// ── Email sending via Resend ──────────────────────────────────────────

export async function sendVerificationEmail(
  email: string,
  userId: string,
  displayName: string,
  siteUrl: string,
): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.log("[email-verify] RESEND_API_KEY not configured — skipping email");
    return { success: false, error: "Email service not configured" };
  }

  // Check cooldown
  if (!(await canResendVerification(userId))) {
    return { success: false, error: "Please wait before requesting another verification email" };
  }

  const token = await createVerificationToken(userId, email);
  const verifyUrl = `${siteUrl}/auth/callback?token=${token}&type=email_verify`;
  const greeting = displayName || email.split("@")[0];

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "CareerAI <noreply@tnsthao94.online>",
        to: [email],
        subject: "Xác minh email CareerAI của bạn",
        html: `
          <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; font-weight: 600; color: #0B2545; margin: 0;">CareerAI</h1>
            </div>
            <p style="font-size: 16px; color: #334155; margin: 0 0 16px;">
              Xin chào <strong>${greeting}</strong>,
            </p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px;">
              Cảm ơn bạn đã đăng ký CareerAI! Nhấn nút bên dưới để xác minh email và mở khóa đầy đủ tính năng AI.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyUrl}" 
                 style="display: inline-block; padding: 14px 32px; background: #0B2545; color: #fff; 
                        font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                Xác minh email
              </a>
            </div>
            <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 24px 0 0;">
              Link xác minh có hiệu lực trong 24 giờ. Nếu bạn không tạo tài khoản CareerAI, hãy bỏ qua email này.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => "Unknown error");
      console.log(`[email-verify] Resend API error: ${response.status} ${err}`);
      return { success: false, error: "Failed to send verification email" };
    }

    await markVerificationSent(userId);
    console.log(`[email-verify] Verification email sent to ${email} for user ${userId}`);
    return { success: true };
  } catch (err) {
    console.log(`[email-verify] Send error: ${err}`);
    return { success: false, error: "Failed to send verification email" };
  }
}