export type LandingVariant = 'A' | 'B'; // 'B' = 3D (default), 'A' = 2D (opt-in)

const VIEW_MODE_KEY = 'portfolio_view_mode';
const LEGACY_STORAGE_KEY = 'portfolio_ab_variant';

/**
 * Resolves the active View Mode:
 * Default is ALWAYS 'B' (3D WebGL Kage View) for public visitors.
 * 'A' (2D Workspace) is only enabled when explicitly toggled or routed.
 *
 * 1. Query parameter override: ?view=2d|3d, ?v=2d|3d|a|b, ?mode=2d|3d
 * 2. Direct route override: /2d -> 'A', /kage or /project/kage -> 'B'
 * 3. User opt-in saved preference in localStorage ('portfolio_view_mode')
 * 4. Default: 'B' (3D View) — Zero randomized A/B split.
 */
export function getOrAssignVariant(): LandingVariant {
  if (typeof window === 'undefined') return 'B';

  try {
    // Clean up retired A/B testing storage key so returning visitors are not stuck in 2D
    if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }

    const params = new URLSearchParams(window.location.search);
    const rawParam = (params.get('view') || params.get('v') || params.get('mode') || params.get('variant') || '').toLowerCase();
    
    if (rawParam === '2d' || rawParam === 'a') {
      localStorage.setItem(VIEW_MODE_KEY, '2d');
      return 'A';
    }
    if (rawParam === '3d' || rawParam === 'b') {
      localStorage.setItem(VIEW_MODE_KEY, '3d');
      return 'B';
    }

    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/2d') {
      localStorage.setItem(VIEW_MODE_KEY, '2d');
      return 'A';
    }
    if (path === '/kage' || path === '/project/kage') {
      localStorage.setItem(VIEW_MODE_KEY, '3d');
      return 'B';
    }

    const savedMode = localStorage.getItem(VIEW_MODE_KEY);
    if (savedMode === '2d') {
      return 'A';
    }
    if (savedMode === '3d') {
      return 'B';
    }

    // Default for 100% of public visitors is 3D View
    return 'B';
  } catch {
    return 'B';
  }
}

/**
 * Persists user preference for 2D or 3D view mode
 */
export function setViewModePreference(variant: LandingVariant): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VIEW_MODE_KEY, variant === 'A' ? '2d' : '3d');
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Sets GA4 user property for active view mode (A/B testing retired)
 */
export function initABExperiment(variant: LandingVariant): void {
  if (typeof window === 'undefined') return;

  if (typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', {
      landing_variant: variant,
      view_mode: variant === 'B' ? '3d' : '2d',
    });
  }
}
