export type AnalyticsParameters = Record<
  string,
  string | number | boolean | undefined
>;

export type GA4EventName =
  | 'exp_variant_impression'
  | 'page_view_custom'
  | 'project_view'
  | 'project_drag'
  | 'filter_click'
  | 'cv_action'
  | 'contact_click'
  | 'language_toggle'
  | 'theme_toggle'
  | 'chapter_view';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: 'event' | 'config' | 'js' | 'set',
      targetIdOrEventName: string | Date | 'user_properties',
      parameters?: Record<string, unknown>
    ) => void;
  }
}

export function trackEvent(
  eventName: GA4EventName | string,
  parameters: AnalyticsParameters = {}
): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Visual telemetry logger in DEV
  if (import.meta.env.DEV) {
    console.log(
      `%c[GA4 Analytics] 📊 ${eventName}`,
      'color: #00E5FF; font-weight: bold; background: #071A24; padding: 2px 6px; border-radius: 4px;',
      parameters
    );
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, parameters);
  }
}

export function trackPageView(pagePath: string, variant: 'A' | 'B', language: 'vi' | 'en'): void {
  trackEvent('page_view_custom', {
    page_path: pagePath,
    page_location: typeof window !== 'undefined' ? window.location.href : pagePath,
    landing_variant: variant,
    language: language,
  });
}

export function trackProjectView(projectId: string, title: string, variant: 'A' | 'B', interactionType = 'click'): void {
  trackEvent('project_view', {
    project_id: projectId,
    project_title: title,
    source_variant: variant,
    interaction_type: interactionType,
  });
}

export function trackCVAction(action: 'view' | 'download', variant: 'A' | 'B', language: 'vi' | 'en'): void {
  trackEvent('cv_action', {
    action_type: action,
    landing_variant: variant,
    language: language,
  });
}

export function trackContactClick(method: 'email' | 'linkedin' | 'telegram' | 'github', location: string, variant: 'A' | 'B'): void {
  trackEvent('contact_click', {
    contact_method: method,
    contact_location: location,
    landing_variant: variant,
  });
}

