export type AnalyticsParameters = Record<
  string,
  string | number | boolean | undefined
>;

export type GA4EventName =
  | 'exp_variant_impression'
  | 'view_mode_toggle'
  | 'ab_variant_toggle'
  | 'page_view_custom'
  | 'project_view'
  | 'project_drag'
  | 'filter_click'
  | 'cv_action'
  | 'contact_click'
  | 'language_toggle'
  | 'theme_toggle'
  | 'chapter_view'
  | 'shotgun_option_select'
  | 'shotgun_image_zoom'
  | 'shotgun_compare_toggle'
  | 'shotgun_prompt_copy'
  | 'shotgun_feedback_vote'
  | 'shotgun_cta_click'
  | 'handoff_pdf_view'
  | 'handoff_pdf_download'
  | 'handoff_share_click'
  | 'handoff_image_zoom'
  | 'handoff_drill_toggle'
  | 'handoff_assumption_expand';

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

/**
 * Canonical Project Name mapping for Google Analytics 4
 * Maps project slug / id to the custom dimension 'Project name' value.
 */
export const PROJECT_NAME_MAP: Record<string, string> = {
  'agent-handoff': 'Agent Handoff',
  'nexora': 'NEXORA',
  'dispatch': 'Dispatch',
  'agent-rules': 'Agent Rules',
  'sync-task-badge': 'Status Report',
  'cryptomap': 'CryptoMap360',
  'handoff': 'Handoff',
  'ai-process': 'AI Process',
  'vlinkpay': 'VLINKPAY',
  'nailhub': 'NailHub',
};

export function getProjectName(projectId: string): string | undefined {
  return PROJECT_NAME_MAP[projectId];
}

export function trackPageView(
  pagePath: string,
  variant: 'A' | 'B',
  language: 'vi' | 'en',
  projectName?: string
): void {
  trackEvent('page_view_custom', {
    page_path: pagePath,
    page_location: typeof window !== 'undefined' ? window.location.href : pagePath,
    landing_variant: variant,
    language: language,
    ...(projectName ? { project_name: projectName } : {}),
  });
}

export function trackProjectView(
  projectId: string,
  title?: string,
  variant: 'A' | 'B' = 'B',
  interactionType = 'click'
): void {
  const projectName = title || PROJECT_NAME_MAP[projectId] || projectId;

  // Custom event project_view with project_name parameter
  trackEvent('project_view', {
    project_id: projectId,
    project_name: projectName,
    project_title: projectName,
    source_variant: variant,
    interaction_type: interactionType,
  });

  // Recommended GA4 event select_content with project_name parameter
  trackEvent('select_content', {
    content_type: 'portfolio_project',
    content_id: projectId,
    project_name: projectName,
    source_variant: variant,
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

export function trackShotgunOptionSelect(optionId: string, optionTitle: string): void {
  trackEvent('shotgun_option_select', {
    option_id: optionId,
    option_title: optionTitle,
    timestamp: Date.now(),
  });
}

export function trackShotgunImageZoom(imageName: string, section: string): void {
  trackEvent('shotgun_image_zoom', {
    image_name: imageName,
    section_name: section,
    timestamp: Date.now(),
  });
}

export function trackShotgunCompareToggle(mode: 'before' | 'after' | 'split'): void {
  trackEvent('shotgun_compare_toggle', {
    compare_mode: mode,
    timestamp: Date.now(),
  });
}

export function trackShotgunPromptCopy(optionId: string): void {
  trackEvent('shotgun_prompt_copy', {
    option_id: optionId,
    timestamp: Date.now(),
  });
}

export function trackShotgunVote(optionId: string, voteType: 'like' | 'favorite' | 'feedback'): void {
  trackEvent('shotgun_feedback_vote', {
    option_id: optionId,
    vote_type: voteType,
    timestamp: Date.now(),
  });
}

export function trackShotgunCtaClick(ctaName: string, destination: string): void {
  trackEvent('shotgun_cta_click', {
    cta_name: ctaName,
    destination: destination,
    timestamp: Date.now(),
  });
}

export function trackHandoffPdfView(source: string): void {
  trackEvent('handoff_pdf_view', {
    source,
    project_id: 'agent-handoff',
    project_name: 'Agent Handoff',
    timestamp: Date.now(),
  });
}

export function trackHandoffPdfDownload(): void {
  trackEvent('handoff_pdf_download', {
    file_name: 'agent-handoff.pdf',
    project_id: 'agent-handoff',
    project_name: 'Agent Handoff',
    timestamp: Date.now(),
  });
}

export function trackHandoffShareClick(): void {
  trackEvent('handoff_share_click', {
    project_id: 'agent-handoff',
    project_name: 'Agent Handoff',
    timestamp: Date.now(),
  });
}

export function trackHandoffImageZoom(imageName: string, section: string): void {
  trackEvent('handoff_image_zoom', {
    image_name: imageName,
    section_name: section,
    project_id: 'agent-handoff',
    project_name: 'Agent Handoff',
    timestamp: Date.now(),
  });
}

export function trackHandoffDrillToggle(drillStep: number, drillTitle: string): void {
  trackEvent('handoff_drill_toggle', {
    drill_step: drillStep,
    drill_title: drillTitle,
    project_id: 'agent-handoff',
    project_name: 'Agent Handoff',
    timestamp: Date.now(),
  });
}

export function trackHandoffAssumptionExpand(assumptionIndex: number, title: string): void {
  trackEvent('handoff_assumption_expand', {
    assumption_index: assumptionIndex,
    title,
    project_id: 'agent-handoff',
    project_name: 'Agent Handoff',
    timestamp: Date.now(),
  });
}


