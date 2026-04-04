/*import { useEffect, useRef, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { loadRecaptchaScript } from "../../lib/recaptcha";

type RecaptchaStatus = "idle" | "loading" | "ready" | "error";

interface RecaptchaChallengeProps {
  errorText: string;
  loadingText: string;
  onTokenChange: (token: string | null) => void;
  siteKey: string;
}

export function RecaptchaChallenge({
  errorText,
  loadingText,
  onTokenChange,
  siteKey,
}: RecaptchaChallengeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [status, setStatus] = useState<RecaptchaStatus>("idle");

  useEffect(() => {
    if (!siteKey) {
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");
    onTokenChange(null);

    const mountWidget = async () => {
      try {
        await loadRecaptchaScript();

        if (cancelled || !containerRef.current || !window.grecaptcha?.render) {
          return;
        }

        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback: (token: string) => {
            if (cancelled) return;
            onTokenChange(token);
          },
          "expired-callback": () => {
            if (cancelled) return;
            onTokenChange(null);
          },
          "error-callback": () => {
            if (cancelled) return;
            onTokenChange(null);
            setStatus("error");
          },
        });

        if (!cancelled) {
          setStatus("ready");
        }
      } catch (error) {
        console.error("[RecaptchaChallenge] Failed to load captcha:", error);
        if (cancelled) {
          return;
        }
        onTokenChange(null);
        setStatus("error");
      }
    };

    void mountWidget();

    return () => {
      cancelled = true;
      onTokenChange(null);

      if (widgetIdRef.current != null && window.grecaptcha?.reset) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch {
          // Ignore cleanup failures.
        }
      }

      widgetIdRef.current = null;
    };
  }, [onTokenChange, siteKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="flex min-h-[82px] justify-center overflow-hidden rounded-lg border border-border/60 bg-background px-2 py-3"
      />

      {status === "loading" && (
        <p
          className="flex items-center gap-2 text-muted-foreground"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "var(--font-size-caption)",
            margin: 0,
          }}
        >
          <Loader2 className="size-3.5 animate-spin" />
          {loadingText}
        </p>
      )}

      {status === "error" && (
        <p
          className="flex items-center gap-2 text-destructive"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "var(--font-size-caption)",
            margin: 0,
          }}
        >
          <TriangleAlert className="size-3.5" />
          {errorText}
        </p>
      )}
    </div>
  );
}
*/