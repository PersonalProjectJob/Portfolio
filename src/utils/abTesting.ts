import { trackEvent } from './analytics';

export type LandingVariant = 'A' | 'B';

const STORAGE_KEY = 'portfolio_ab_variant';
const EXPERIMENT_ID = 'landing_hero_ab_v1';

/**
 * Resolves the active Landing Variant based on:
 * 1. Query parameter override: ?v=a|b or ?variant=a|b
 * 2. Direct route override: /kage -> B, /profile -> A
 * 3. Persisted visitor assignment in localStorage
 * 4. Deterministic 50/50 randomized split for new visitors
 */
export function getOrAssignVariant(): LandingVariant {
  if (typeof window === 'undefined') return 'A';

  try {
    const params = new URLSearchParams(window.location.search);
    const paramVariant = (params.get('v') || params.get('variant') || '').toUpperCase();
    if (paramVariant === 'A' || paramVariant === 'B') {
      localStorage.setItem(STORAGE_KEY, paramVariant);
      return paramVariant as LandingVariant;
    }

    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/kage' || path === '/project/kage') {
      localStorage.setItem(STORAGE_KEY, 'B');
      return 'B';
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'A' || saved === 'B') {
      return saved as LandingVariant;
    }

    // 50/50 randomized split for new unique visitors
    const assigned: LandingVariant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(STORAGE_KEY, assigned);
    return assigned;
  } catch {
    return 'A';
  }
}

/**
 * Initializes GA4 experiment attribution and user properties
 */
export function initABExperiment(variant: LandingVariant): void {
  if (typeof window === 'undefined') return;

  // Set persistent GA4 user property
  if (typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', {
      landing_variant: variant,
      experiment_id: EXPERIMENT_ID,
    });
  }

  // Send experiment impression event
  trackEvent('exp_variant_impression', {
    experiment_id: EXPERIMENT_ID,
    variant_id: variant,
    page_path: window.location.pathname,
    referrer: document.referrer || 'direct',
  });
}
