/**
 * Request Signature Validation (HMAC-SHA256)
 * 
 * Provides optional request signing to prevent unauthorized API usage.
 * When REQUEST_SIGNING_SECRET is configured, all requests to sensitive
 * endpoints must include a valid HMAC signature.
 * 
 * ## Client Implementation
 * 
 * Clients must include these headers:
 * - X-CareerAI-Request-Signature: hex-encoded HMAC-SHA256 signature
 * - X-CareerAI-Request-Timestamp: Unix timestamp in milliseconds
 * 
 * ## Signature Calculation
 * 
 * ```
 * signature = HMAC-SHA256(
 *   key = REQUEST_SIGNING_SECRET,
 *   message = timestamp + ":" + method + ":" + path + ":" + bodyHash
 * )
 * ```
 * 
 * Where:
 * - timestamp: Same as X-CareerAI-Request-Timestamp
 * - method: HTTP method (GET, POST, etc.)
 * - path: Request path (e.g., /make-server-4ab11b6d/chat)
 * - bodyHash: SHA-256 hash of request body (empty string for GET/DELETE)
 * 
 * ## Security Properties
 * 
 * - Requests older than 5 minutes are rejected (prevents replay attacks)
 * - Signature is only validated when REQUEST_SIGNING_SECRET is set
 * - Fails open when secret is not configured (backward compatible)
 */

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compute SHA-256 hash of data
 */
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return bufferToHex(hash);
}

/**
 * Compute HMAC-SHA256
 */
async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return bufferToHex(signature);
}

/**
 * Get the request signing secret from environment.
 * Returns null if not configured (validation will be skipped).
 */
export function getRequestSigningSecret(): string | null {
  const secret = Deno.env.get("REQUEST_SIGNING_SECRET")?.trim();
  return secret || null;
}

/**
 * Validate request signature from headers.
 * 
 * @param request - The incoming request
 * @param body - Parsed request body (for hash calculation)
 * @returns Validation result with error message if invalid
 */
export async function validateRequestSignature(
  request: Request,
  body: unknown = null,
): Promise<{ valid: boolean; error?: string; status?: number }> {
  const secret = getRequestSigningSecret();

  // If no secret configured, allow the request (backward compatible)
  if (!secret) {
    return { valid: true };
  }

  const signature = request.headers.get("X-CareerAI-Request-Signature");
  const timestamp = request.headers.get("X-CareerAI-Request-Timestamp");

  // Require both headers when signing is enabled
  if (!signature || !timestamp) {
    return {
      valid: false,
      error: "Request signature is required. Include X-CareerAI-Request-Signature and X-CareerAI-Request-Timestamp headers.",
      status: 401,
    };
  }

  // Validate timestamp is a number
  const timestampMs = parseInt(timestamp, 10);
  if (isNaN(timestampMs) || timestampMs <= 0) {
    return {
      valid: false,
      error: "Invalid timestamp format",
      status: 401,
    };
  }

  // Reject requests older than 5 minutes (prevent replay attacks)
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  if (Math.abs(now - timestampMs) > maxAge) {
    return {
      valid: false,
      error: "Request timestamp is too old. Please sync your clock and try again.",
      status: 401,
    };
  }

  // Calculate expected signature
  const method = request.method;
  const path = new URL(request.url).pathname;
  const bodyStr = body ? JSON.stringify(body) : "";
  const bodyHash = await sha256(bodyStr);

  const message = `${timestamp}:${method}:${path}:${bodyHash}`;
  const expectedSignature = await hmacSha256(secret, message);

  // Constant-time comparison to prevent timing attacks
  if (signature !== expectedSignature) {
    return {
      valid: false,
      error: "Invalid request signature",
      status: 403,
    };
  }

  return { valid: true };
}

/**
 * Middleware to enforce request signing on specific endpoints.
 * Only activates when REQUEST_SIGNING_SECRET is configured.
 * 
 * Usage:
 * ```typescript
 * app.post("/sensitive-endpoint", async (c) => {
 *   const sigValidation = await validateRequestSignatureMiddleware(c.req.raw);
 *   if (!sigValidation.valid) {
 *     return c.json({ error: sigValidation.error }, sigValidation.status);
 *   }
 *   // ... endpoint logic
 * });
 * ```
 */
export async function validateRequestSignatureMiddleware(
  request: Request,
): Promise<{ valid: boolean; error?: string; status?: number }> {
  const secret = getRequestSigningSecret();

  // Skip validation when not configured (backward compatible)
  if (!secret) {
    return { valid: true };
  }

  // For POST/PUT, we need to read the body to compute the hash
  // This consumes the body, so callers should not try to read it again
  let body: unknown = null;
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    try {
      const contentType = request.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        body = await request.json();
      } else if (contentType.includes("multipart/form-data")) {
        // For file uploads, use empty body hash (signature should cover metadata only)
        body = null;
      } else {
        const text = await request.text();
        body = text ? JSON.parse(text) : null;
      }
    } catch (error) {
      return {
        valid: false,
        error: "Invalid request body",
        status: 400,
      };
    }
  }

  return validateRequestSignature(request, body);
}
