/**
 * UTM Engine & Parameter Management Utilities
 * Designed for distribution tracking across CV, Social, Messaging, Email, and QR channels.
 */

export interface UtmParams {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface UtmPreset {
  name: string;
  source: string;
  medium: string;
  defaultCampaign?: string;
  defaultContent?: string;
  description?: string;
}

export type UtmPresetKey = 'linkedin' | 'zalo' | 'recruiter_email' | 'cv' | 'qr';

export const UTM_PRESETS: Record<UtmPresetKey, UtmPreset> = {
  linkedin: {
    name: 'LinkedIn Profile / Post',
    source: 'linkedin',
    medium: 'social',
    defaultCampaign: 'portfolio',
    defaultContent: 'profile',
    description: 'Shared in LinkedIn bio, post, or direct message'
  },
  zalo: {
    name: 'Zalo Direct Chat',
    source: 'zalo',
    medium: 'message',
    defaultCampaign: 'portfolio',
    defaultContent: 'shared_link',
    description: 'Direct 1-on-1 or group chat message on Zalo'
  },
  recruiter_email: {
    name: 'Recruiter Email Pitch',
    source: 'recruiter_email',
    medium: 'email',
    defaultCampaign: 'job_application',
    defaultContent: 'portfolio_link',
    description: 'Outbound email sent to recruiters or hiring leads'
  },
  cv: {
    name: 'CV / Resume Document',
    source: 'cv',
    medium: 'document',
    defaultCampaign: 'job_application',
    defaultContent: 'cv_pdf',
    description: 'Embedded inside PDF resume / CV or portfolio deck'
  },
  qr: {
    name: 'Offline QR Code',
    source: 'qr',
    medium: 'offline',
    defaultCampaign: 'meetup_networking',
    defaultContent: 'namecard_qr',
    description: 'Physical namecard, meetups, or print portfolio QR'
  }
};

/**
 * Builds a clean destination URL appended with standard UTM parameters.
 * Handles both relative paths (e.g., '/case-study/cryptomap') and absolute URLs.
 */
export function buildUtmUrl(
  destinationPath: string,
  params: {
    source: string;
    medium: string;
    campaign?: string;
    content?: string;
    term?: string;
  }
): string {
  if (!destinationPath) {
    destinationPath = '/';
  }

  // Determine if destination is full URL or relative path
  const isAbsolute = /^https?:\/\//i.test(destinationPath);
  const dummyBase = 'https://portfolio.local';
  const urlObj = new URL(isAbsolute ? destinationPath : `${dummyBase}${destinationPath.startsWith('/') ? '' : '/'}${destinationPath}`);

  if (params.source) urlObj.searchParams.set('utm_source', params.source);
  if (params.medium) urlObj.searchParams.set('utm_medium', params.medium);
  if (params.campaign) urlObj.searchParams.set('utm_campaign', params.campaign);
  if (params.content) urlObj.searchParams.set('utm_content', params.content);
  if (params.term) urlObj.searchParams.set('utm_term', params.term);

  if (isAbsolute) {
    return urlObj.toString();
  }

  // Return pathname + search + hash
  return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
}

/**
 * Generates a URL-safe, compact short slug for tracking links.
 * Uses an unambiguous character set (excludes 0, O, I, l, etc.).
 */
export function generateShortSlug(length = 6): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  const bytes = new Uint8Array(length);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return result;
}

/**
 * Parses UTM parameters from any URL or search string.
 */
export function parseUtmFromUrl(url: string): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  hasUtm: boolean;
} {
  try {
    const isAbsolute = /^https?:\/\//i.test(url);
    const searchParams = isAbsolute
      ? new URL(url).searchParams
      : new URLSearchParams(url.includes('?') ? url.split('?')[1] : url);

    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');
    const utm_content = searchParams.get('utm_content');
    const utm_term = searchParams.get('utm_term');

    const hasUtm = Boolean(utm_source || utm_medium || utm_campaign || utm_content || utm_term);

    return {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      hasUtm
    };
  } catch {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      hasUtm: false
    };
  }
}
