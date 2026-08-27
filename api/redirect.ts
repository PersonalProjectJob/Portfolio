/// <reference types="node" />

declare const process: {
  env: Record<string, string | undefined>;
};

export const config = {
  runtime: 'edge',
};

const FALLBACK_ROUTES: Record<string, string> = {
  linkedin: '/?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio&utm_content=profile',
  'cv-link': '/?utm_source=cv&utm_medium=document&utm_campaign=job_application&utm_content=cv_pdf',
  recruiter: '/?utm_source=recruiter_email&utm_medium=email&utm_campaign=job_application&utm_content=portfolio_link',
  zalo: '/?utm_source=zalo&utm_medium=message&utm_campaign=portfolio&utm_content=shared_link',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const slugParam = url.searchParams.get('slug');
  const pathParts = url.pathname.replace(/^\/r\/?/, '').split('/');
  const rawSlug = slugParam || pathParts[0] || '';
  const slug = rawSlug.trim().toLowerCase();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  // 1. Try Supabase lookup via native REST API if configured
  if (supabaseUrl && supabaseKey && slug) {
    try {
      const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/tracking_links?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&select=id,slug,destination_path,utm_source,utm_medium,utm_campaign,utm_content,clicks_count,is_active&limit=1`;
      const res = await fetch(endpoint, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const rows = (await res.json()) as Array<{
          id: string;
          slug: string;
          destination_path?: string;
          utm_source?: string;
          utm_medium?: string;
          utm_campaign?: string;
          utm_content?: string;
          clicks_count?: number;
        }>;

        if (rows && rows.length > 0) {
          const data = rows[0];
          // Non-blocking click increment
          const updatePromise = fetch(
            `${supabaseUrl.replace(/\/$/, '')}/rest/v1/tracking_links?id=eq.${encodeURIComponent(data.id)}`,
            {
              method: 'PATCH',
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
              },
              body: JSON.stringify({ clicks_count: (data.clicks_count || 0) + 1 }),
            }
          ).catch(() => {});

          const ctx = req as unknown as { waitUntil?: (p: Promise<unknown>) => void };
          if (typeof ctx.waitUntil === 'function') {
            ctx.waitUntil(updatePromise);
          }

          // Build target destination with UTMs
          const dest = data.destination_path || '/';
          const isAbsolute = /^https?:\/\//i.test(dest);
          const targetUrl = new URL(dest, url.origin);

          if (data.utm_source) targetUrl.searchParams.set('utm_source', data.utm_source);
          if (data.utm_medium) targetUrl.searchParams.set('utm_medium', data.utm_medium);
          if (data.utm_campaign) targetUrl.searchParams.set('utm_campaign', data.utm_campaign);
          if (data.utm_content) targetUrl.searchParams.set('utm_content', data.utm_content);

          const location = isAbsolute ? targetUrl.toString() : `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
          return Response.redirect(location, 302);
        }
      }
    } catch (err) {
      console.error('Error querying tracking_links:', err);
    }
  }

  // 2. Check Static / Fallback Legacy Routes
  if (slug && FALLBACK_ROUTES[slug]) {
    const fallbackTarget = new URL(FALLBACK_ROUTES[slug], url.origin);
    return Response.redirect(fallbackTarget.toString(), 302);
  }

  // 3. Fallback to homepage
  return Response.redirect(new URL('/', url.origin).toString(), 302);
}
