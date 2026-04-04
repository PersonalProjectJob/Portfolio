/**
 * Rate Limiting for Supabase Edge Functions
 *
 * This file provides utilities to implement rate limiting
 * to prevent DDoS attacks and API abuse.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  retryAfter?: number;
}

// Default rate limit configurations
export const RATE_LIMITS = {
  // General API calls: 100 requests per hour
  general: { maxRequests: 100, windowMinutes: 60 } as RateLimitConfig,

  // CV parsing: 10 requests per hour (expensive operation)
  cvParser: { maxRequests: 10, windowMinutes: 60 } as RateLimitConfig,

  // Job recommendations: 3 requests per 5 hours (server-side window)
  jobRecommendations: { maxRequests: 3, windowMinutes: 300 } as RateLimitConfig,

  // Chat messages: 60 requests per hour
  chat: { maxRequests: 60, windowMinutes: 60 } as RateLimitConfig,

  // Authentication: 5 attempts per 15 minutes
  auth: { maxRequests: 5, windowMinutes: 15 } as RateLimitConfig,

  // File uploads: 20 per hour
  uploads: { maxRequests: 20, windowMinutes: 60 } as RateLimitConfig,
};

/**
 * Check rate limit for a user/endpoint combination
 *
 * Uses database-backed rate limiting with automatic cleanup.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to rate limit
 * @param endpoint - Endpoint identifier
 * @param config - Rate limit configuration
 * @param isUnlimited - If true, bypass rate limit (unlimited account)
 * @returns RateLimitResult with allowed status
 *
 * @example
 * ```typescript
 * const result = await checkRateLimit(supabase, userId, 'cv-parser', RATE_LIMITS.cvParser, false);
 * if (!result.allowed) {
 *   return new Response(
 *     JSON.stringify({
 *       error: 'Rate limit exceeded',
 *       retryAfter: result.retryAfter
 *     }),
 *     { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
 *   );
 * }
 * ```
 */
function isPostgresUniqueViolation(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as { code?: string }).code === '23505';
  }
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('23505') || msg.includes('duplicate key');
}

export async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.general,
  isUnlimited = false,  // NEW: Bypass rate limit for unlimited accounts
): Promise<RateLimitResult> {
  // NEW: Bypass rate limit for unlimited accounts
  if (isUnlimited) {
    return {
      allowed: true,
      remaining: 999,  // Show "unlimited" as 999
      resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }

  const maxRaceRetries = 6;

  for (let attempt = 0; attempt < maxRaceRetries; attempt++) {
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMinutes * 60 * 1000);

    try {
      const { data: rows, error: selectError } = await supabase
        .from('rate_limits')
        .select('request_count, window_start')
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())
        .order('window_start', { ascending: false })
        .limit(1);

      if (selectError) throw selectError;

      const existing = rows?.[0] ?? null;

      if (!existing) {
        const { error: insertError } = await supabase
          .from('rate_limits')
          .insert({
            user_id: userId,
            endpoint,
            request_count: 1,
            window_start: now.toISOString(),
          });

        if (insertError) {
          if (isPostgresUniqueViolation(insertError)) {
            continue;
          }
          throw insertError;
        }

        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetAt: new Date(now.getTime() + config.windowMinutes * 60 * 1000).toISOString(),
        };
      }

      const count = existing.request_count || 0;
      const windowStartTime = new Date(existing.window_start);

      if (count >= config.maxRequests) {
        const resetTime = new Date(windowStartTime.getTime() + config.windowMinutes * 60 * 1000);
        const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetAt: resetTime.toISOString(),
          retryAfter,
        };
      }

      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({ request_count: count + 1 })
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .eq('window_start', existing.window_start);

      if (updateError) throw updateError;

      const resetTime = new Date(windowStartTime.getTime() + config.windowMinutes * 60 * 1000);

      return {
        allowed: true,
        remaining: config.maxRequests - count - 1,
        resetAt: resetTime.toISOString(),
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(Date.now() + 60_000).toISOString(),
        retryAfter: 60,
      };
    }
  }

  console.error('Error checking rate limit: exhausted retries after concurrent insert conflicts');
  return {
    allowed: false,
    remaining: 0,
    resetAt: new Date(Date.now() + 60_000).toISOString(),
    retryAfter: 60,
  };
}

/**
 * Check rate limit using RPC function (more efficient)
 *
 * This uses a database function for atomic operations.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to rate limit
 * @param endpoint - Endpoint identifier
 * @param maxRequests - Maximum requests allowed
 * @param windowMinutes - Time window in minutes
 * @returns RateLimitResult
 */
export async function checkRateLimitRPC(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  endpoint: string,
  maxRequests: number = 100,
  windowMinutes: number = 60,
): Promise<RateLimitResult> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes,
    });

    if (error) throw error;

    const result = data[0];

    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: result.reset_at,
      retryAfter: result.allowed ? undefined : Math.ceil((new Date(result.reset_at).getTime() - Date.now()) / 1000),
    };
  } catch (error) {
    console.error('Error checking rate limit via RPC:', error);
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + 60_000).toISOString(),
      retryAfter: 60,
    };
  }
}

/**
 * Create rate limit headers for response
 *
 * @param result - Rate limit result
 * @returns Headers object with rate limit info
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt,
  };

  if (!result.allowed && result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter);
  }

  return headers;
}

/**
 * Middleware to enforce rate limiting
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param endpoint - Endpoint identifier
 * @param config - Rate limit configuration
 * @returns Error Response if rate limited, null otherwise
 */
export function rateLimitMiddleware(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.general,
): Promise<Response | null> {
  return checkRateLimit(supabase, userId, endpoint, config).then((result) => {
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${new Date(result.resetAt).toLocaleTimeString()}`,
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(result),
          },
        },
      );
    }
    return null;
  });
}

/**
 * Get rate limit usage statistics for a user
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param endpoint - Endpoint identifier (optional)
 * @returns Usage statistics
 */
export async function getRateLimitUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  endpoint?: string,
): Promise<Array<{ endpoint: string; requestCount: number; windowStart: string }>> {
  try {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    let query = supabase
      .from('rate_limits')
      .select('endpoint, request_count, window_start')
      .eq('user_id', userId)
      .gte('window_start', hourAgo.toISOString())
      .order('window_start', { ascending: false });

    if (endpoint) {
      query = query.eq('endpoint', endpoint);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting rate limit usage:', error);
    return [];
  }
}

/**
 * Clean up old rate limit records
 *
 * Call this periodically (e.g., daily cron job) to remove expired records.
 *
 * @param supabase - Supabase client instance
 * @param olderThanMinutes - Delete records older than this many minutes
 * @returns Success status
 */
export async function cleanupRateLimits(
  supabase: ReturnType<typeof createClient>,
  olderThanMinutes: number = 1440, // 24 hours
): Promise<boolean> {
  try {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);

    const { error } = await supabase
      .from('rate_limits')
      .delete()
      .lt('window_start', cutoff.toISOString());

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error cleaning up rate limits:', error);
    return false;
  }
}
