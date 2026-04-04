import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import {
  buildSessionHeaders,
  resolveSessionIdentity,
  dispatchSessionIdentityUpdate,
} from "../lib/sessionScope";

const VERIFY_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d/auth/verify-email`;

type VerifyState = "loading" | "success" | "error";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerifyState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    if (type !== "email_verify" || !token) {
      setState("error");
      setErrorMessage("Link không hợp lệ.");
      return;
    }

    (async () => {
      try {
        const identity = resolveSessionIdentity();
        const response = await fetch(VERIFY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
            ...buildSessionHeaders(identity),
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
          // Update local session with verified status
          // Write directly to localStorage to avoid overwriting auth token
          try {
            localStorage.setItem("careerai-email-verified", "true");
          } catch { /* ignore */ }
          dispatchSessionIdentityUpdate();
          setState("success");
        } else {
          setState("error");
          setErrorMessage(data.message || "Xác minh không thành công. Link có thể đã hết hạn.");
        }
      } catch (err) {
        console.error("[auth-callback] Error:", err);
        setState("error");
        setErrorMessage("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    })();
  }, [searchParams]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      style={{ padding: "var(--spacing-xl)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex w-full max-w-[400px] flex-col items-center gap-[var(--spacing-lg)] text-center"
        style={{
          padding: "var(--spacing-xl)",
          borderRadius: "var(--radius-card)",
          background: "var(--card)",
          boxShadow: "var(--elevation-sm)",
        }}
      >
        {state === "loading" && (
          <>
            <Loader2
              className="size-12 animate-spin"
              style={{ color: "var(--secondary)" }}
            />
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "var(--font-size-body)",
                margin: 0,
              }}
            >
              Đang xác minh email...
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: "72px",
                height: "72px",
                background: "color-mix(in srgb, var(--secondary) 14%, var(--background))",
              }}
            >
              <CheckCircle2
                className="size-10"
                style={{ color: "var(--secondary)" }}
              />
            </div>
            <div className="flex flex-col gap-[var(--spacing-xs)]">
              <h1
                className="text-foreground"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-h2)",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  margin: 0,
                }}
              >
                Email đã xác minh!
              </h1>
              <p
                className="text-muted-foreground"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-small)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Tài khoản của bạn đã được xác minh. Giờ bạn có thể sử dụng đầy đủ tính năng AI!
              </p>
            </div>
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate("/chat", { replace: true })}
              style={{ fontSize: "var(--font-size-body)" }}
            >
              Bắt đầu trò chuyện
            </Button>
          </>
        )}

        {state === "error" && (
          <>
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: "72px",
                height: "72px",
                background: "color-mix(in srgb, var(--destructive) 12%, var(--background))",
              }}
            >
              <XCircle
                className="size-10"
                style={{ color: "var(--destructive)" }}
              />
            </div>
            <div className="flex flex-col gap-[var(--spacing-xs)]">
              <h1
                className="text-foreground"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-h2)",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  margin: 0,
                }}
              >
                Xác minh thất bại
              </h1>
              <p
                className="text-muted-foreground"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-small)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {errorMessage}
              </p>
            </div>
            <div className="flex gap-[var(--spacing-sm)]">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/", { replace: true })}
              >
                Về trang chủ
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate("/chat", { replace: true })}
              >
                Mở chat
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}