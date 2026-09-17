import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { TrackingLink } from '../types/cms.types';
import { UTM_PRESETS } from '../../lib/utm';

const STORAGE_KEY = 'portfolio_tracking_links_cache';
export const EVENTS_STORAGE_KEY = 'portfolio_tracking_events_cache';

export interface ClickEvent {
  id: string;
  slug: string;
  destination_path: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign?: string | null;
  utm_content?: string | null;
  timestamp: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  referrer?: string;
  user_agent?: string;
}

export const DEFAULT_TRACKING_LINKS: TrackingLink[] = Object.entries(UTM_PRESETS).map(
  ([key, preset]) => ({
    id: `trk-preset-${key}`,
    slug: key,
    destination_path: '/',
    utm_source: preset.source,
    utm_medium: preset.medium,
    utm_campaign: preset.defaultCampaign || 'portfolio',
    utm_content: preset.defaultContent || 'link',
    clicks_count: 0,
    is_active: true,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  })
);

/**
 * Detect client device category
 */
export function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined' || !window.navigator) return 'desktop';
  const ua = window.navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Reads locally cached click events.
 */
export function getLocalClickEvents(): ClickEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[trackingRepository] Failed to read local click events:', err);
    return [];
  }
}

/**
 * Saves a new click event to local cache (capped at 500 recent events).
 */
export function recordClickEvent(event: ClickEvent): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalClickEvents();
    const updated = [event, ...current].slice(0, 500);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[trackingRepository] Failed to record click event:', err);
  }
}

/**
 * Clears all click events from local cache.
 */
export function clearLocalClickEvents(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(EVENTS_STORAGE_KEY);
  } catch (err) {
    console.warn('[trackingRepository] Failed to clear click events:', err);
  }
}

/**
 * Reads locally cached tracking links or defaults with zero-mock migration.
 */
export function getLocalCachedTrackingLinks(): TrackingLink[] {
  if (typeof window === 'undefined') return [...DEFAULT_TRACKING_LINKS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TRACKING_LINKS));
      return [...DEFAULT_TRACKING_LINKS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Auto-migrate legacy mock clicks [48, 35, 29, 21, 14] if no real events exist
      const hasLegacyMock = parsed.some(
        (l) => l.id?.startsWith('trk-preset-') && (l.clicks_count === 48 || l.clicks_count === 35 || l.clicks_count === 29)
      );
      const events = getLocalClickEvents();
      if (hasLegacyMock && events.length === 0) {
        const sanitized = parsed.map((l) => (l.id?.startsWith('trk-preset-') ? { ...l, clicks_count: 0 } : l));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        return sanitized;
      }
      return parsed;
    }
    return [...DEFAULT_TRACKING_LINKS];
  } catch (err) {
    console.warn('[trackingRepository] Failed to read local tracking cache:', err);
    return [...DEFAULT_TRACKING_LINKS];
  }
}

/**
 * Persists tracking links to local cache.
 */
export function saveLocalCachedTrackingLinks(links: TrackingLink[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch (err) {
    console.warn('[trackingRepository] Failed to save local tracking cache:', err);
  }
}

/**
 * Fetches all tracking links ordered by created_at DESC.
 */
export async function fetchTrackingLinks(): Promise<TrackingLink[]> {
  const localList = getLocalCachedTrackingLinks();

  if (!isSupabaseConfigured) {
    return localList.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });
  }

  try {
    const { data, error } = await supabase
      .from('tracking_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[trackingRepository] Supabase query warning, returning local cache:', error.message);
      return localList;
    }

    if (data && data.length > 0) {
      const formatted = data as unknown as TrackingLink[];
      saveLocalCachedTrackingLinks(formatted);
      return formatted;
    }

    return localList;
  } catch (err) {
    console.warn('[trackingRepository] Supabase query failed:', err);
    return localList;
  }
}

/**
 * Creates a new tracking link in Supabase or local cache.
 */
export async function createTrackingLink(
  link: Omit<TrackingLink, 'id' | 'clicks_count' | 'created_at' | 'updated_at'> & {
    id?: string;
    clicks_count?: number;
  }
): Promise<TrackingLink> {
  const timestamp = new Date().toISOString();
  const id = link.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `trk-${Date.now()}`);

  const newLink: TrackingLink = {
    id,
    slug: link.slug.trim(),
    destination_path: link.destination_path || '/',
    utm_source: link.utm_source.trim(),
    utm_medium: link.utm_medium.trim(),
    utm_campaign: link.utm_campaign?.trim() || null,
    utm_content: link.utm_content?.trim() || null,
    clicks_count: link.clicks_count ?? 0,
    is_active: link.is_active ?? true,
    created_at: timestamp,
    updated_at: timestamp,
  };

  const localList = getLocalCachedTrackingLinks();
  const updatedList = [newLink, ...localList.filter((l) => l.id !== newLink.id)];
  saveLocalCachedTrackingLinks(updatedList);

  if (!isSupabaseConfigured) {
    return newLink;
  }

  try {
    const { data, error } = await supabase
      .from('tracking_links')
      .insert({
        id: newLink.id,
        slug: newLink.slug,
        destination_path: newLink.destination_path,
        utm_source: newLink.utm_source,
        utm_medium: newLink.utm_medium,
        utm_campaign: newLink.utm_campaign,
        utm_content: newLink.utm_content,
        clicks_count: newLink.clicks_count,
        is_active: newLink.is_active,
        created_at: newLink.created_at,
        updated_at: newLink.updated_at,
      })
      .select()
      .single();

    if (error) {
      console.warn('[trackingRepository] Supabase insert warning, saved locally:', error.message);
      return newLink;
    }

    if (data) {
      const result = data as unknown as TrackingLink;
      saveLocalCachedTrackingLinks([result, ...localList.filter((l) => l.id !== result.id)]);
      return result;
    }

    return newLink;
  } catch (err) {
    console.warn('[trackingRepository] Supabase insert error, saved locally:', err);
    return newLink;
  }
}

/**
 * Updates an existing tracking link (e.g. toggles active, updates campaign / content).
 */
export async function updateTrackingLink(
  id: string,
  updates: Partial<TrackingLink>
): Promise<TrackingLink> {
  const localList = getLocalCachedTrackingLinks();
  const existing = localList.find((l) => l.id === id);

  if (!existing) {
    throw new Error(`Tracking link with ID "${id}" not found.`);
  }

  const updatedLink: TrackingLink = {
    ...existing,
    ...updates,
    id: existing.id,
    updated_at: new Date().toISOString(),
  };

  const updatedList = localList.map((l) => (l.id === id ? updatedLink : l));
  saveLocalCachedTrackingLinks(updatedList);

  if (!isSupabaseConfigured) {
    return updatedLink;
  }

  try {
    const { data, error } = await supabase
      .from('tracking_links')
      .update({
        slug: updatedLink.slug,
        destination_path: updatedLink.destination_path,
        utm_source: updatedLink.utm_source,
        utm_medium: updatedLink.utm_medium,
        utm_campaign: updatedLink.utm_campaign,
        utm_content: updatedLink.utm_content,
        clicks_count: updatedLink.clicks_count,
        is_active: updatedLink.is_active,
        updated_at: updatedLink.updated_at,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('[trackingRepository] Supabase update warning, saved locally:', error.message);
      return updatedLink;
    }

    if (data) {
      const result = data as unknown as TrackingLink;
      saveLocalCachedTrackingLinks(localList.map((l) => (l.id === id ? result : l)));
      return result;
    }

    return updatedLink;
  } catch (err) {
    console.warn('[trackingRepository] Supabase update error, saved locally:', err);
    return updatedLink;
  }
}

/**
 * Deletes a tracking link by ID.
 */
export async function deleteTrackingLink(id: string): Promise<boolean> {
  const localList = getLocalCachedTrackingLinks();
  const updatedList = localList.filter((l) => l.id !== id);
  saveLocalCachedTrackingLinks(updatedList);

  if (!isSupabaseConfigured) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('tracking_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[trackingRepository] Supabase delete warning:', error.message);
      return true;
    }

    return true;
  } catch (err) {
    console.warn('[trackingRepository] Supabase delete error:', err);
    return true;
  }
}

/**
 * Increments the click counter for a tracking link (used during redirects).
 */
export async function incrementTrackingClick(
  slug: string,
  extraMeta?: { referrer?: string; userAgent?: string; deviceType?: 'desktop' | 'mobile' | 'tablet' }
): Promise<number> {
  const localList = getLocalCachedTrackingLinks();
  const link = localList.find((l) => l.slug.toLowerCase() === slug.toLowerCase());
  const timestamp = new Date().toISOString();
  const device = extraMeta?.deviceType || detectDeviceType();

  if (link) {
    link.clicks_count = (link.clicks_count || 0) + 1;
    link.updated_at = timestamp;
    saveLocalCachedTrackingLinks(localList);

    // Save individual click event for deep analytics
    const event: ClickEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      slug: link.slug,
      destination_path: link.destination_path,
      utm_source: link.utm_source,
      utm_medium: link.utm_medium,
      utm_campaign: link.utm_campaign,
      utm_content: link.utm_content,
      timestamp,
      device_type: device,
      referrer: extraMeta?.referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
      user_agent: extraMeta?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
    };
    recordClickEvent(event);
  }

  if (!isSupabaseConfigured) {
    return link?.clicks_count || 0;
  }

  try {
    const { data } = await (supabase.rpc as any)('increment_tracking_click', { p_slug: slug });
    return typeof data === 'number' ? data : (link?.clicks_count || 0);
  } catch {
    return link?.clicks_count || 0;
  }
}

/**
 * Resets all tracking stats and clears click events (used by Admin reset action).
 */
export async function resetAllTrackingStats(): Promise<boolean> {
  const localList = getLocalCachedTrackingLinks();
  const resetList = localList.map((l) => ({
    ...l,
    clicks_count: 0,
    updated_at: new Date().toISOString(),
  }));
  saveLocalCachedTrackingLinks(resetList);
  clearLocalClickEvents();

  if (!isSupabaseConfigured) {
    return true;
  }

  try {
    await supabase.from('tracking_links').update({ clicks_count: 0, updated_at: new Date().toISOString() }).neq('id', '0');
    return true;
  } catch (err) {
    console.warn('[trackingRepository] Supabase reset warning:', err);
    return true;
  }
}

