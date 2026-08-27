export const config = {
  runtime: 'edge',
};

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

async function sha1Hex(str: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuf = await crypto.subtle.digest('SHA-1', data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Cloudinary Signature Generator for Signed Uploads & Access Security
 * Generates secure SHA-1 signature on the server side using Web Crypto
 * so API_SECRET is NEVER exposed in client bundle.
 */
export default async function handler(req: Request) {
  // CORS configuration
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Extract credentials from CLOUDINARY_URL or individual env variables
  const envUrl = process.env.CLOUDINARY_URL || (typeof process !== 'undefined' ? process.env?.CLOUDINARY_URL : '');
  const parsedFromUrl = parseCloudinaryUrl(envUrl);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || parsedFromUrl?.cloudName || 'dbnyy6zmo';
  const apiKey = process.env.CLOUDINARY_API_KEY || parsedFromUrl?.apiKey;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || parsedFromUrl?.apiSecret;

  if (!apiKey || !apiSecret) {
    return new Response(
      JSON.stringify({
        error: 'Missing Cloudinary API Key or Secret on server environment.',
        hint: 'Please set CLOUDINARY_URL or CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on Vercel environment variables.',
        cloudName,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    let body: Record<string, any> = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    } else {
      const url = new URL(req.url);
      url.searchParams.forEach((val, key) => {
        body[key] = val;
      });
    }

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

    // Generate SHA-1 signature using api_secret
    const stringToSign = `${serializedParams}${apiSecret}`;
    const signature = await sha1Hex(stringToSign);

    return new Response(
      JSON.stringify({
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
        accessMode,
        endpoint: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown signing error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
