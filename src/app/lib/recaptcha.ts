import { publicRecaptchaSiteKey } from "../../utils/recaptcha/info";

const DEV_TEST_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
const RECAPTCHA_SCRIPT_ID = "careerai-google-recaptcha";
const RECAPTCHA_SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?render=explicit";
const FALLBACK_HOST_ID = "careerai-recaptcha-fallback-host";
/** Set on the mount node via `data-recaptcha-inline="true"` so the widget stays inside the form. */
const INLINE_DATA_ATTR = "data-recaptcha-inline";

let loadPromise: Promise<void> | null = null;

function getOrCreateFallbackHost(): HTMLElement {
  let el = document.getElementById(FALLBACK_HOST_ID) as HTMLElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = FALLBACK_HOST_ID;
    el.setAttribute("role", "region");
    el.setAttribute("aria-label", "Security verification");
    Object.assign(el.style, {
      position: "fixed",
      left: "50%",
      bottom: "max(12px, env(safe-area-inset-bottom, 0px))",
      transform: "translateX(-50%)",
      zIndex: "2147483646",
      maxWidth: "calc(100vw - 24px)",
      minWidth: "min(304px, calc(100vw - 24px))",
      minHeight: "78px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "auto",
      padding: "8px",
      boxSizing: "border-box",
    });
    document.body.appendChild(el);
  }
  return el;
}

export interface RecaptchaApi {
  render(
    container: HTMLElement,
    options: {
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      hl?: string;
      sitekey: string;
      size?: "invisible";
      theme?: "light" | "dark";
      tabindex?: number;
    },
  ): number;
  execute(widgetId?: number): void;
  reset(widgetId?: number): void;
  getResponse(widgetId?: number): string;
  ready(callback: () => void): void;
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

function isDevelopmentFallbackAllowed(): boolean {
  return import.meta.env.DEV;
}

export function getRecaptchaSiteKey(): string {
  const fileConfiguredKey = publicRecaptchaSiteKey.trim();
  if (fileConfiguredKey) {
    return fileConfiguredKey;
  }

  const configuredKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "").trim();
  if (configuredKey) {
    return configuredKey;
  }

  return isDevelopmentFallbackAllowed() ? DEV_TEST_SITE_KEY : "";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function waitForRecaptchaReady(timeoutMs = 10_000): Promise<void> {
  const startedAt = Date.now();

  while (!window.grecaptcha?.render) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("Timed out while loading Google reCAPTCHA.");
    }

    await sleep(50);
  }
}

export async function loadRecaptchaScript(siteKey = getRecaptchaSiteKey()): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (window.grecaptcha?.render) {
    return;
  }

  if (!siteKey) {
    return;
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      if (!document.getElementById(RECAPTCHA_SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = RECAPTCHA_SCRIPT_ID;
        script.src = RECAPTCHA_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      await waitForRecaptchaReady();
    })().catch((error) => {
      loadPromise = null;
      throw error;
    });
  }

  await loadPromise;
}

export async function requestRecaptchaToken(
  siteKey = getRecaptchaSiteKey(),
  mountNode?: HTMLElement | null,
): Promise<string> {
  if (!siteKey) {
    throw new Error("Captcha is not configured on this system.");
  }

  await loadRecaptchaScript(siteKey);

  if (!window.grecaptcha?.render || !window.grecaptcha?.execute || !window.grecaptcha?.ready) {
    throw new Error("Google reCAPTCHA is not available.");
  }

  return await new Promise<string>((resolve, reject) => {
    const inlineHost =
      mountNode != null &&
      mountNode.isConnected &&
      mountNode.getAttribute(INLINE_DATA_ATTR) === "true";

    const host = inlineHost ? mountNode : getOrCreateFallbackHost();

    const container = document.createElement("div");
    container.setAttribute("aria-hidden", "true");
    Object.assign(container.style, {
      position: "relative",
      width: "100%",
      minHeight: inlineHost ? "72px" : "78px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "visible",
      pointerEvents: "auto",
    });

    host.appendChild(container);

    let widgetId: number | null = null;
    let settled = false;

    const cleanup = () => {
      if (settled) return;
      settled = true;

      if (widgetId != null && window.grecaptcha?.reset) {
        try {
          window.grecaptcha.reset(widgetId);
        } catch {
          // Ignore cleanup failures.
        }
      }

      const parent = container.parentElement;
      container.remove();
      if (parent?.id === FALLBACK_HOST_ID && parent.childElementCount === 0) {
        parent.remove();
      }
    };

    const fail = (error: unknown) => {
      cleanup();
      reject(error instanceof Error ? error : new Error("Unable to load captcha. Please try again."));
    };

    try {
      widgetId = window.grecaptcha.render(container, {
        sitekey: siteKey,
        size: "invisible",
        callback: (token: string) => {
          cleanup();
          resolve(token);
        },
        "expired-callback": () => {
          fail(new Error("Captcha expired. Please try again."));
        },
        "error-callback": () => {
          fail(new Error("Unable to load captcha. Please try again."));
        },
      });
    } catch (error) {
      fail(error);
      return;
    }

    window.grecaptcha.ready(() => {
      try {
        window.grecaptcha!.execute(widgetId ?? undefined);
      } catch (error) {
        fail(error);
      }
    });
  });
}
