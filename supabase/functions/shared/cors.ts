/**
 * CORS Configuration for Supabase Edge Functions
 *
 * This file defines the allowed origins, methods, and headers for cross-origin requests.
 * Uses an environment variable ALLOWED_ORIGINS (comma-separated) for production.
 * Falls back to localhost origins for development when not configured.
 */

/**
 * Get the allowed origins list from environment variables.
 * Format: comma-separated URLs (e.g., "https://app.example.com,https://www.example.com")
 * Development defaults to localhost origins if not configured.
 */
function getAllowedOrigins(): string[] {
  const configured = Deno.env.get("ALLOWED_ORIGINS")?.trim();
  if (configured) {
    return configured.split(",").map((origin) => origin.trim()).filter(Boolean);
  }

  // Production defaults
  return [
    "https://tnsthao94.online",
    "https://www.tnsthao94.online",
  ];
}

/**
 * Validate and return the appropriate CORS origin for a request.
 * Returns the matching allowed origin if valid, or null if not allowed.
 */
function validateOrigin(origin: string | null): string | null {
  if (!origin) return null;

  const allowedOrigins = getAllowedOrigins();

  // Check for exact match
  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  // Support wildcard subdomains in allowed origins (e.g., "*.example.com")
  for (const allowed of allowedOrigins) {
    if (allowed.startsWith("*.")) {
      const suffix = allowed.slice(1); // ".example.com"
      if (origin.endsWith(suffix) && origin.startsWith("http")) {
        return origin;
      }
    }
  }

  return null;
}

/**
 * Build CORS headers with validated origin.
 * Returns headers object with the appropriate Access-Control-Allow-Origin value.
 */
export function buildCorsHeaders(origin: string | null): Record<string, string> {
  const validatedOrigin = validateOrigin(origin);

  return {
    "Access-Control-Allow-Origin": validatedOrigin || "null",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, X-CareerAI-Scope-Key, X-CareerAI-Scope-Mode, X-CareerAI-Guest-Session-Id, X-CareerAI-User-Id, X-Requested-With",
    "Access-Control-Max-Age": "86400", // 24 hours
    "Access-Control-Allow-Credentials": "false",
    "Vary": "Origin", // Important for caching with multiple origins
  };
}

/**
 * Handle CORS preflight requests
 *
 * Call this function at the start of each Edge Function to handle OPTIONS requests.
 * Returns a Response if it's a preflight request, null otherwise.
 *
 * @param request - The incoming Request object
 * @returns Response for preflight requests, null for actual requests
 *
 * @example
 * ```typescript
 * Deno.serve(async (req) => {
 *   const corsResponse = handleCors(req);
 *   if (corsResponse) return corsResponse;
 *
 *   // Your actual request handling logic here
 * });
 * ```
 */
export function handleCors(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("Origin");
    return new Response(null, {
      status: 204,
      headers: buildCorsHeaders(origin),
    });
  }
  return null;
}

/**
 * Apply CORS headers to a Response object
 *
 * @param response - The Response object to modify
 * @param request - The original Request object (to extract Origin header)
 * @returns New Response with CORS headers added
 *
 * @example
 * ```typescript
 * const response = new Response(JSON.stringify(data));
 * return applyCorsHeaders(response, request);
 * ```
 */
export function applyCorsHeaders(response: Response, request?: Request): Response {
  const origin = request?.headers.get("Origin") ?? null;
  const corsHeaders = buildCorsHeaders(origin);

  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Create a JSON response with CORS headers
 *
 * @param data - The data to stringify as JSON
 * @param status - HTTP status code (default: 200)
 * @param request - The original Request object (to extract Origin header)
 * @returns Response with JSON body and CORS headers
 */
export function createJsonResponse(
  data: unknown,
  status: number = 200,
  request?: Request,
): Response {
  const origin = request?.headers.get("Origin") ?? null;
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...buildCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

/**
 * Create an error response with CORS headers
 *
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @param details - Optional additional error details
 * @param request - The original Request object (to extract Origin header)
 * @returns Response with error JSON and CORS headers
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>,
  request?: Request,
): Response {
  return createJsonResponse(
    {
      error: message,
      ...(details && { details }),
    },
    status,
    request,
  );
}
