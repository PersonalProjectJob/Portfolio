/**
 * Input Validation and Sanitization for Supabase Edge Functions
 *
 * This file provides utilities to validate and sanitize user input
 * to prevent SQL injection, XSS attacks, and other security vulnerabilities.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  userId?: string;
  scopeKey?: string;
  email?: string;
}

/**
 * Validate request headers and authentication
 *
 * @param request - The incoming Request object
 * @param options - Validation options
 * @returns ValidationResult with user info if valid
 */
export function validateRequest(
  request: Request,
  options: {
    requireAuth?: boolean;
    allowedMethods?: string[];
  } = {},
): ValidationResult {
  const { requireAuth = true, allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'] } = options;

  // Check HTTP method
  if (!allowedMethods.includes(request.method)) {
    return {
      valid: false,
      error: `Method ${request.method} not allowed. Allowed: ${allowedMethods.join(', ')}`,
    };
  }

  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    if (requireAuth) {
      return {
        valid: false,
        error: 'Missing Authorization header',
      };
    }
    // Allow anonymous access with guest session
    const guestSessionId = request.headers.get('X-CareerAI-Guest-Session-Id');
    if (!guestSessionId) {
      return {
        valid: false,
        error: 'Missing guest session ID for anonymous access',
      };
    }
    return {
      valid: true,
      userId: `guest_${guestSessionId}`,
      scopeKey: `guest:${guestSessionId}`,
    };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return {
      valid: false,
      error: 'Invalid Authorization header format. Expected: Bearer <token>',
    };
  }

  const token = authHeader.substring(7);

  // Validate JWT token structure
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        valid: false,
        error: 'Invalid JWT token structure',
      };
    }

    // Decode payload (don't verify signature here - Supabase will do that)
    const payload = JSON.parse(atob(parts[1]));

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return {
        valid: false,
        error: 'Token expired',
      };
    }

    // Get scope key from header
    const scopeKey = request.headers.get('X-CareerAI-Scope-Key');
    if (!scopeKey) {
      return {
        valid: false,
        error: 'Missing X-CareerAI-Scope-Key header',
      };
    }

    // Validate scope key format
    if (!/^(guest|account):[a-zA-Z0-9_-]+$/.test(scopeKey)) {
      return {
        valid: false,
        error: 'Invalid scope key format',
      };
    }

    return {
      valid: true,
      userId: payload.sub || `guest_${request.headers.get('X-CareerAI-Guest-Session-Id')}`,
      scopeKey,
      email: payload.email,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Sanitize string input to prevent SQL injection and XSS
 *
 * @param input - The input string to sanitize
 * @returns Sanitized string
 *
 * @example
 * ```typescript
 * const cleanName = sanitizeInput(req.body.name);
 * ```
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove HTML tags to prevent XSS
    .replace(/['";\\]/g, '') // Remove SQL special characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
}

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate UUID format (v4)
 *
 * @param uuid - UUID string to validate
 * @returns true if valid UUID v4 format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
}

/**
 * Validate scope key format
 *
 * @param scopeKey - Scope key to validate
 * @returns true if valid format
 */
export function isValidScopeKey(scopeKey: string): boolean {
  const scopeRegex = /^(guest|account):[a-zA-Z0-9_-]+$/;
  return scopeRegex.test(scopeKey.trim());
}

/**
 * Sanitize and validate object properties
 *
 * @param obj - Object with string values to sanitize
 * @param allowedKeys - Array of allowed keys (optional)
 * @returns Sanitized object
 *
 * @example
 * ```typescript
 * const cleanData = sanitizeObject(req.body, ['name', 'email']);
 * ```
 */
export function sanitizeObject(
  obj: Record<string, unknown>,
  allowedKeys?: string[],
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip if not in allowed keys
    if (allowedKeys && !allowedKeys.includes(key)) {
      continue;
    }

    // Skip non-string values
    if (typeof value !== 'string') {
      continue;
    }

    result[key] = sanitizeInput(value);
  }

  return result;
}

/**
 * Validate request body schema
 *
 * @param body - Request body to validate
 * @param schema - Schema definition with required and optional fields
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const validation = validateBody(req.body, {
 *   required: ['name', 'email'],
 *   optional: ['phone', 'address']
 * });
 * ```
 */
export function validateBody(
  body: unknown,
  schema: {
    required?: string[];
    optional?: string[];
  },
): { valid: boolean; error?: string; data?: Record<string, unknown> } {
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: 'Request body must be a valid JSON object',
    };
  }

  const data = body as Record<string, unknown>;
  const errors: string[] = [];

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  // Filter to only allowed fields
  const allowedFields = [...(schema.required || []), ...(schema.optional || [])];
  const filteredData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      filteredData[key] = value;
    } else {
      console.warn(`Ignoring unexpected field: ${key}`);
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: errors.join('; '),
    };
  }

  return {
    valid: true,
    data: filteredData,
  };
}

/**
 * Validate file upload
 *
 * @param file - File object from FormData
 * @param options - File validation options
 * @returns Validation result
 */
export function validateFile(
  file: File | null,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {},
): { valid: boolean; error?: string } {
  const { maxSizeMB = 10, allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'] } = options;

  if (!file) {
    return {
      valid: false,
      error: 'No file provided',
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSizeMB}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  return {
    valid: true,
  };
}

/**
 * Rate limit validation helper
 *
 * @param requestCount - Current request count
 * @param maxRequests - Maximum allowed requests
 * @returns true if within limit
 */
export function isWithinRateLimit(requestCount: number, maxRequests: number): boolean {
  return requestCount < maxRequests;
}
