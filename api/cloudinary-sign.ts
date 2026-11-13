import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * Parses CLOUDINARY_URL environment variable:
 * Format: cloudinary://<api_key>:<api_secret>@<cloud_name>
 */
function parseCloudinaryUrl(urlStr?: string) {
  if (!urlStr) return null;
  try {
    const url = new URL(urlStr);
    const apiKey = url.username;
    const apiSecret = url.password;
    const cloudName = url.hostname;
    if (apiKey && apiSecret && cloudName) {
      return { apiKey, apiSecret, cloudName };
    }
  } catch (err) {
    console.warn('[Cloudinary Sign] Error parsing CLOUDINARY_URL:', err);
  }
  return null;
}

/**
 * Cloudinary Signature Generator for Signed Uploads & Access Security
 * Generates secure HMAC SHA-1 / SHA-256 signature on the server side
 * so API_SECRET is NEVER exposed in client bundle.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration with domain whitelist
  const origin = req.headers.origin as string | undefined;
  const isAllowedOrigin =
    !origin ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.endsWith('tnsthao94.online') ||
    origin.endsWith('.vercel.app');

  if (origin && isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://tnsthao94.online');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Auth verification when Supabase is configured in production
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && process.env.NODE_ENV === 'production') {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        });
        const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !user) {
          return res.status(401).json({ error: 'Unauthorized: Invalid admin token.' });
        }
      } catch {
        return res.status(401).json({ error: 'Unauthorized: Verification failure.' });
      }
    }
  }

  // Extract credentials from CLOUDINARY_URL or individual env variables
  const parsedFromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || parsedFromUrl?.cloudName || 'dbnyy6zmo';
  const apiKey = process.env.CLOUDINARY_API_KEY || parsedFromUrl?.apiKey;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || parsedFromUrl?.apiSecret;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({
      error: 'Missing Cloudinary API Key or Secret on server environment.',
      hint: 'Please set CLOUDINARY_URL or CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on Vercel environment variables.',
      cloudName,
    });
  }

  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const timestamp = Math.round(Date.now() / 1000);
    const folder = body?.folder || 'portfolio/documents';
    const accessMode = body?.access_mode || 'public'; // 'public' | 'authenticated'

    // Parameters that need to be signed according to Cloudinary documentation
    // Note: Parameter names must be sorted alphabetically before hashing
    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
    };

    if (body?.transformation) {
      paramsToSign.transformation = body.transformation;
    }
    if (accessMode === 'authenticated') {
      paramsToSign.type = 'authenticated';
    }

    // Sort params alphabetically and create serialized query string
    const sortedKeys = Object.keys(paramsToSign).sort();
    const serializedParams = sortedKeys
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&');

    // Generate SHA-1 or SHA-256 signature using api_secret
    const stringToSign = `${serializedParams}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    return res.status(200).json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      accessMode,
      endpoint: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown signing error';
    return res.status(500).json({ error: msg });
  }
}
