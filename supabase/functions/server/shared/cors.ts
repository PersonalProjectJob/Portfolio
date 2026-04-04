/**
 * CORS Configuration for Supabase Edge Functions
 *
 * This file defines the allowed origins, methods, and headers for cross-origin requests.
 * Uses an environment variable ALLOWED_ORIGINS (comma-separated) for production.
 * Falls back to localhost origins for development when not configured.
 */

/**
 * Get the allowed origins list from environment variables.
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
 */
function validateOrigin(origin: string | null): string | null {
  if (!origin) return null;

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  for (const allowed of allowedOrigins) {
    if (allowed.startsWith("*.")) {
      const suffix = allowed.slice(1);
      if (origin.endsWith(suffix) && origin.startsWith("http")) {
        return origin;
      }
    }
  }

  return null;
}

/**
 * Build CORS headers with validated origin.
 */
export function buildCorsHeaders(origin: string | null): Record<string, string> {
  const validatedOrigin = validateOrigin(origin);

  return {
    "Access-Control-Allow-Origin": validatedOrigin || "null",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, X-CareerAI-Scope-Key, X-CareerAI-Scope-Mode, X-CareerAI-Guest-Session-Id, X-CareerAI-User-Id, X-CareerAI-Auth-Token, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "false",
    "Vary": "Origin",
  };
}

/**
 * Handle CORS preflight requests
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
