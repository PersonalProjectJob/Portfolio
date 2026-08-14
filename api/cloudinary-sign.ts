import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

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
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
