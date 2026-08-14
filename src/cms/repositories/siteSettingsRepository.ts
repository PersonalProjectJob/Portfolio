import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { SiteSettings } from '../types/cms.types';
import { DEFAULT_SITE_SETTINGS } from '../../content/legacy/defaultSiteSettings';

const STORAGE_KEY = 'portfolio_site_settings_cache';
const SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Get locally cached settings or default fallback
 */
export function getLocalCachedSettings(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SITE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...parsed,
      profile: { ...DEFAULT_SITE_SETTINGS.profile, ...(parsed.profile || {}) },
      skills: { ...DEFAULT_SITE_SETTINGS.skills, ...(parsed.skills || {}) },
      experience: parsed.experience || DEFAULT_SITE_SETTINGS.experience,
      process: parsed.process || DEFAULT_SITE_SETTINGS.process,
      seo_defaults: { ...DEFAULT_SITE_SETTINGS.seo_defaults, ...(parsed.seo_defaults || {}) },
    };
  } catch (err) {
    console.warn('[siteSettingsRepository] Failed to read local cache:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Save settings to local cache
 */
export function saveLocalCachedSettings(settings: SiteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('[siteSettingsRepository] Failed to save to local cache:', err);
  }
}

/**
 * Fetch singleton site settings from Supabase with resilient fallback to local storage / defaults.
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const fallback = getLocalCachedSettings();

  if (!isSupabaseConfigured) {
    return fallback;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[siteSettingsRepository] Supabase query warning:', error.message);
      return fallback;
    }

    if (data) {
      const merged: SiteSettings = {
        id: data.id || SINGLETON_ID,
        profile: { ...DEFAULT_SITE_SETTINGS.profile, ...(data.profile as SiteSettings['profile']) },
        skills: { ...DEFAULT_SITE_SETTINGS.skills, ...(data.skills as SiteSettings['skills']) },
        experience: (data.experience as SiteSettings['experience']) || DEFAULT_SITE_SETTINGS.experience,
        process: (data.process as SiteSettings['process']) || DEFAULT_SITE_SETTINGS.process,
        seo_defaults: { ...DEFAULT_SITE_SETTINGS.seo_defaults, ...(data.seo_defaults as SiteSettings['seo_defaults']) },
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      saveLocalCachedSettings(merged);
      return merged;
    }

    return fallback;
  } catch (err) {
    console.warn('[siteSettingsRepository] Network error falling back to local cache:', err);
    return fallback;
  }
}

/**
 * Upsert site settings to Supabase and refresh local cache fallback.
 */
export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = getLocalCachedSettings();
  const updated: SiteSettings = {
    ...current,
    ...settings,
    id: current.id || SINGLETON_ID,
    profile: {
      ...current.profile,
      ...(settings.profile || {}),
    },
    skills: {
      ...current.skills,
      ...(settings.skills || {}),
    },
    experience: settings.experience !== undefined ? settings.experience : current.experience,
    process: settings.process !== undefined ? settings.process : current.process,
    seo_defaults: {
      ...current.seo_defaults,
      ...(settings.seo_defaults || {}),
    },
    updated_at: new Date().toISOString(),
  };

  // Always update local cache for resilience
  saveLocalCachedSettings(updated);

  if (!isSupabaseConfigured) {
    return updated;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        id: updated.id || SINGLETON_ID,
        profile: updated.profile,
        skills: updated.skills,
        experience: updated.experience,
        process: updated.process,
        seo_defaults: updated.seo_defaults,
        updated_at: updated.updated_at,
      })
      .select()
      .single();

    if (error) {
      console.warn('[siteSettingsRepository] Supabase upsert error:', error.message);
      return updated;
    }

    const result: SiteSettings = {
      id: data.id,
      profile: data.profile as SiteSettings['profile'],
      skills: data.skills as SiteSettings['skills'],
      experience: data.experience as SiteSettings['experience'],
      process: data.process as SiteSettings['process'],
      seo_defaults: data.seo_defaults as SiteSettings['seo_defaults'],
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    saveLocalCachedSettings(result);
    return result;
  } catch (err) {
    console.warn('[siteSettingsRepository] Update error, saved locally:', err);
    return updated;
  }
}
