export type AnalyticsParameters = Record<
  string,
  string | number | boolean | undefined
>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "event" | "config" | "js",
      targetIdOrEventName: string | Date,
      parameters?: Record<string, unknown>
    ) => void;
  }
}

export function trackEvent(
  eventName: string,
  parameters: AnalyticsParameters = {}
): void {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.gtag !== "function") {
    if (import.meta.env.DEV) {
      console.warn(`[GA4] gtag is not ready: ${eventName}`);
    }
    return;
  }

  window.gtag("event", eventName, parameters);
}
