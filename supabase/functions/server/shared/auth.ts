/**
 * Authentication and Authorization for Supabase Edge Functions
 *
 * This file provides utilities to authenticate users and validate
 * their access to resources based on scope keys and user IDs.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthContext {
  userId: string;
  email?: string;
  role: 'anon' | 'authenticated' | 'service';
  scopeKey: string;
  guestSessionId?: string;
}

export interface AuthResult {
  success: boolean;
  context?: AuthContext;
  error?: string;
  status?: number;
}

/**
 * Authenticate request and return user context
 *
 * This function validates the JWT token and extracts user information.
 * It supports both authenticated users and anonymous guest sessions.
 *
 * @param request - The incoming Request object
 * @returns AuthResult with context if successful
 *
 * @example
 * ```typescript
 * const auth = await authenticateRequest(req);
 * if (!auth.success) {
 *   return createErrorResponse(auth.error!, 401);
 * }
 * const { userId, scopeKey } = auth.context!;
 * ```
 */
export async function authenticateRequest(request: Request): Promise<AuthResult> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Get Authorization header
  const authHeader = request.headers.get('Authorization');

  // If no auth header, try guest session
  if (!authHeader) {
    const guestSessionId = request.headers.get('X-CareerAI-Guest-Session-Id');
    if (!guestSessionId) {
      return {
        success: false,
        error: 'Missing Authorization header or guest session ID',
        status: 401,
      };
    }

    const scopeKey = request.headers.get('X-CareerAI-Scope-Key');
    if (!scopeKey || !scopeKey.startsWith('guest:')) {
      return {
        success: false,
        error: 'Invalid guest scope key',
        status: 400,
      };
    }

    return {
      success: true,
      context: {
        userId: `guest_${guestSessionId}`,
        role: 'anon',
        scopeKey,
        guestSessionId,
      },
    };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'Invalid Authorization header format',
      status: 401,
    };
  }

  const token = authHeader.substring(7);

  // Verify JWT with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      success: false,
      error: 'Invalid or expired token',
      status: 401,
    };
  }

  // Get scope key from header
  const scopeKey = request.headers.get('X-CareerAI-Scope-Key');
  if (!scopeKey) {
    return {
      success: false,
      error: 'Missing X-CareerAI-Scope-Key header',
      status: 400,
    };
  }

  // Validate scope key format
  if (!/^(guest|account):[a-zA-Z0-9_-]+$/.test(scopeKey)) {
    return {
      success: false,
      error: 'Invalid scope key format',
      status: 400,
    };
  }

  // If account scope, verify user owns it
  if (scopeKey.startsWith('account:')) {
    const expectedUserId = scopeKey.replace('account:', '');
    if (expectedUserId !== user.id) {
      return {
        success: false,
        error: 'User does not have access to this scope',
        status: 403,
      };
    }
  }

  return {
    success: true,
    context: {
      userId: user.id,
      email: user.email,
      role: 'authenticated',
      scopeKey,
    },
  };
}

/**
 * Check if user has access to a specific scope
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to check
 * @param scopeKey - Scope key to validate
 * @returns true if user has access
 */
export async function checkScopeAccess(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  scopeKey: string,
): Promise<boolean> {
  try {
    // For guest scopes, just verify the session exists
    if (scopeKey.startsWith('guest:')) {
      const guestSessionId = scopeKey.replace('guest:', '');
      return guestSessionId.length > 0;
    }

    // For account scopes, verify user ownership
    if (scopeKey.startsWith('account:')) {
      const expectedUserId = scopeKey.replace('account:', '');
      return userId === expectedUserId;
    }

    return false;
  } catch (error) {
    console.error('Error checking scope access:', error);
    return false;
  }
}

/**
 * Get user profile from database with scope validation
 *
 * @param supabase - Supabase client instance
 * @param scopeKey - Scope key to query
 * @returns User profile data or null
 */
export async function getUserProfile(
  supabase: ReturnType<typeof createClient>,
  scopeKey: string,
): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, scope_key, created_at')
      .eq('scope_key', scopeKey)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Record<string, unknown>;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Create a new user record with scope
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param scopeKey - Scope key
 * @param email - User email (optional)
 * @returns Success status
 */
export async function createUserRecord(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  scopeKey: string,
  email?: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        scope_key: scopeKey,
        email: email,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating user record:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating user record:', error);
    return false;
  }
}

/**
 * Log authentication attempt for audit purposes
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param scopeKey - Scope key
 * @param success - Whether authentication succeeded
 * @param ipAddress - Client IP address
 * @param userAgent - Client user agent
 */
export async function logAuthAttempt(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  scopeKey: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    await supabase.from('auth_logs').insert({
      user_id: userId,
      scope_key: scopeKey,
      success,
      ip_address: ipAddress,
      user_agent: userAgent,
      attempted_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging auth attempt:', error);
    // Don't throw - logging failure shouldn't break auth flow
  }
}

/**
 * Extract client IP from request headers
 *
 * @param request - The incoming Request object
 * @returns IP address string or 'unknown'
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('X-Real-IP');
  if (realIP) {
    return realIP.trim();
  }

  return 'unknown';
}

/**
 * Extract user agent from request
 *
 * @param request - The incoming Request object
 * @returns User agent string
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('User-Agent') || 'unknown';
}
