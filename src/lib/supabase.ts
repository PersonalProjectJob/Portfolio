import { createClient } from '@supabase/supabase-js';
import type {
  ContentEntry,
  MediaAsset,
  TrackingLink,
  SiteSettings,
} from '../cms/types/cms.types';

// Environment variable extraction with safe fallback handling for Vite, Node & SSR
const rawUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
const rawAnonKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawAnonKey &&
  !rawUrl.includes('mock-portfolio') &&
  !rawUrl.includes('placeholder')
);

// Fallback credentials to prevent initialization errors in offline/hybrid mode
const fallbackUrl = 'https://mock-portfolio.supabase.co';
const fallbackAnonKey = 'mock-anon-key-placeholder-for-dev';

export const supabaseUrl = isSupabaseConfigured ? rawUrl! : fallbackUrl;
export const supabaseAnonKey = isSupabaseConfigured ? rawAnonKey! : fallbackAnonKey;

// Supabase client instance with universal table access
export const supabase = createClient<any>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Re-export common types for convenience
export type { ContentEntry, MediaAsset, TrackingLink, SiteSettings };
