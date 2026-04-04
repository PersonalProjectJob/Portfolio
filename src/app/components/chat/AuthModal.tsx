import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useI18n } from "../../lib/i18n";
import {
  buildSessionHeaders,
  persistAuthenticatedSession,
  useSessionIdentity,
} from "../../lib/sessionScope";
import { getRecaptchaSiteKey, requestRecaptchaToken } from "../../lib/recaptcha";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { isEmailDomainAllowed } from "../../lib/emailDomain";

const AUTH_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d/auth`;

type AuthMode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  initialMode?: AuthMode;
}

function getErrorMessage(
  status: number,
  mode: AuthMode,
  fallback: string,
  t: ReturnType<typeof useI18n>["t"],
): string {
  if (status === 409 && mode === "register") {
    return t.waitlist.errorEmailInUse;
  }

  if (status === 401 && mode === "login") {
    return t.waitlist.errorInvalidCredentials;
  }

  return fallback;
}

function normalizeCaptchaError(message: string, t: ReturnType<typeof useI18n>["t"]): string {
  const lower = message.toLowerCase();

  if (lower.includes("not configured")) {
    return t.waitlist.captchaUnavailable;
  }

  if (
    lower.includes("captcha") ||
    lower.includes("recaptcha") ||
    lower.includes("domain")
  ) {
    return t.waitlist.captchaError;
  }

  return message || t.waitlist.error;
}

export function AuthModal({ open, onOpenChange, initialMode = "register" }: AuthModalProps) {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const identity = useSessionIdentity();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Pending email verification state (after register or login with unverified account)
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const captchaSiteKey = getRecaptchaSiteKey();
  const captchaHostRef = useRef<HTMLDivElement | null>(null);

  const resetState = () => {
    setMode(initialMode);
    setDisplayName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
    setPendingVerification(false);
    setPendingEmail("");
    setIsResending(false);
    setResendMessage(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    window.setTimeout(resetState, 250);
  };

  useEffect(() => {
    if (!isSuccess) return undefined;

    const timer = window.setTimeout(() => {
      handleClose();
    }, 900);

    return () => window.clearTimeout(timer);
    // handleClose intentionally excluded to avoid rearming the timer when the
    // dialog closes and re-opens quickly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    if (!open) {
      window.setTimeout(resetState, 250);
    }
  }, [open]);

  const canSubmit = useMemo(() => {
    const trimmedEmail = email.trim();
    const trimmedName = displayName.trim();

    if (!trimmedEmail || !password.trim()) return false;
    if (mode === "register") {
      if (!trimmedName) return false;
      if (trimmedEmail.includes("@") && !isEmailDomainAllowed(trimmedEmail.toLowerCase())) return false;
      if (password !== confirmPassword) return false;
    }

    return true;
  }, [confirmPassword, displayName, email, mode, password]);

  const validateField = (fieldName: string, value: string) => {
    if (!value.trim()) {
      if (fieldName === "displayName" && mode === "register") {
        setError(t.waitlist.errorNameRequired);
      }
      return false;
    }

    if (fieldName === "email" && mode === "register" && value.includes("@") && !isEmailDomainAllowed(value.trim().toLowerCase())) {
      setError(t.waitlist.errorDomainNotAllowed);
      return false;
    }

    if (fieldName === "confirmPassword" && mode === "register" && value !== password) {
      setError(t.waitlist.errorPasswordMismatch);
      return false;
    }

    return true;
  };

  const handleInputBlur = (fieldName: string, value: string) => {
    validateField(fieldName, value);
  };

  const handleKeyDown = (event: React.KeyboardEvent, fieldName: string, value: string) => {
    if (event.key === "Enter") {
      event.preventDefault();
      validateField(fieldName, value);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = displayName.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) return;

    if (mode === "register") {
      if (!trimmedName) {
        setError(t.waitlist.errorNameRequired);
        return;
      }
      if (!isEmailDomainAllowed(trimmedEmail)) {
        setError(t.waitlist.errorDomainNotAllowed);
        return;
      }
      if (trimmedPassword !== confirmPassword) {
        setError(t.waitlist.errorPasswordMismatch);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitAuthRequest = async (captchaToken?: string) => {
        const response = await fetch(`${AUTH_BASE}/${mode}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
            ...buildSessionHeaders(identity),
          },
          body: JSON.stringify({
            name: mode === "register" ? trimmedName : undefined,
            email: trimmedEmail,
            password: trimmedPassword,
            ...(captchaToken
              ? {
                  captchaToken,
                  captchaAction: `auth-${mode}`,
                }
              : {}),
          }),
        });

        const payload = await response.json().catch(() => ({}));
        return { payload, response };
      };

      let payload: Record<string, unknown>;
      let response: Response;

      if (mode === "register") {
        if (!captchaSiteKey) {
          setError(t.waitlist.captchaUnavailable);
          return;
        }
        const registerCaptcha = await requestRecaptchaToken(captchaSiteKey, captchaHostRef.current);
        ({ payload, response } = await submitAuthRequest(registerCaptcha));
      } else {
        ({ payload, response } = await submitAuthRequest());
        if (!response.ok && payload?.captchaRequired) {
          if (!captchaSiteKey) {
            setError(t.waitlist.captchaUnavailable);
            return;
          }

          const captchaToken = await requestRecaptchaToken(captchaSiteKey, captchaHostRef.current);
          ({ payload, response } = await submitAuthRequest(captchaToken));
        }
      }

      if (!response.ok) {
        if (payload?.code === "DOMAIN_NOT_ALLOWED") {
          setError(t.waitlist.errorDomainNotAllowed);
          return;
        }
        // Login blocked because email not verified
        if (payload?.code === "EMAIL_NOT_VERIFIED") {
          setPendingEmail(typeof payload.email === "string" ? payload.email : trimmedEmail);
          setPendingVerification(true);
          setError(null);
          return;
        }
        if (mode === "register" && response.status === 409) {
          setMode("login");
          setPassword("");
          setConfirmPassword("");
          setError(getErrorMessage(response.status, mode, payload.error || t.waitlist.error, t));
          return;
        }

        setError(getErrorMessage(response.status, mode, payload.error || t.waitlist.error, t));
        return;
      }

      // Registration success — show pending verification screen (no session created)
      if (mode === "register" && payload?.code === "REGISTRATION_PENDING_VERIFICATION") {
        setPendingEmail(typeof payload.email === "string" ? payload.email : trimmedEmail);
        setPendingVerification(true);
        setError(null);
        return;
      }

      // Login success — proceed with session
      const userId = payload?.user?.userId || payload?.user?.user_id || payload?.user?.id;
      const userEmail = payload?.user?.email || payload?.email;
      const sessionToken = payload?.sessionToken || payload?.session_token;

      if (!userId || !sessionToken) {
        throw new Error("Invalid auth response");
      }

      persistAuthenticatedSession({
        userId,
        userEmail,
        sessionToken,
        role: payload?.user?.role,
        status: payload?.user?.status,
        emailVerified: payload?.emailVerified === true,
      });

      if (payload?.user?.role === "owner" && location.pathname !== "/admin") {
        onOpenChange(false);
        navigate("/admin", { replace: true });
        return;
      }

      setIsSuccess(true);
      setError(null);
    } catch (submitError) {
      console.error("[AuthModal] Error:", submitError);
      const submitErrorMessage = submitError instanceof Error ? submitError.message : "";
      setError(normalizeCaptchaError(submitErrorMessage, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (isResending || !pendingEmail) return;
    setIsResending(true);
    setResendMessage(null);
    try {
      const res = await fetch(`${AUTH_BASE}/resend-verification-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.alreadyVerified) {
        setResendMessage(t.waitlist.alreadyVerified);
        // Switch to login after a moment
        window.setTimeout(() => {
          setPendingVerification(false);
          setMode("login");
          setResendMessage(null);
        }, 2000);
      } else if (res.ok) {
        setResendMessage(t.waitlist.resendVerificationSent);
      } else if (data?.cooldown) {
        setResendMessage(t.waitlist.resendVerificationCooldown);
      } else {
        setResendMessage(t.waitlist.error);
      }
    } catch {
      setResendMessage(t.waitlist.error);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    setPendingVerification(false);
    setPendingEmail("");
    setResendMessage(null);
    setMode("login");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const submitLabel = mode === "login" ? t.waitlist.submitLogin : t.waitlist.submitRegister;
  const submittingLabel = mode === "login" ? t.waitlist.submittingLogin : t.waitlist.submittingRegister;
  const successLabel = mode === "login" ? t.waitlist.successLogin : t.waitlist.successRegister;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        overlayClassName="z-[70]"
        className="z-[71] max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[560px] overflow-x-hidden overflow-y-auto p-4 sm:p-6"
        style={{
          borderRadius: "var(--radius-card)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--secondary) 8%, var(--background)), var(--background))",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[4px]"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in srgb, var(--secondary) 80%, var(--primary)), var(--primary), color-mix(in srgb, var(--secondary) 60%, var(--primary)))",
          }}
        />

        <AnimatePresence mode="wait">
          {pendingVerification ? (
            <motion.div
              key="pending-verification"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="flex flex-col items-center gap-[var(--spacing-md)] py-[var(--spacing-lg)]"
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: "68px",
                  height: "68px",
                  background:
                    "color-mix(in srgb, var(--secondary) 14%, var(--background))",
                  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.7)",
                }}
              >
                <Mail
                  className="size-8"
                  style={{ color: "var(--secondary)" }}
                />
              </div>
              <div className="flex flex-col items-center gap-[var(--spacing-xs)] text-center">
                <p
                  className="text-foreground"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-body)",
                    fontWeight: "var(--font-weight-semibold)" as unknown as number,
                    margin: 0,
                  }}
                >
                  {t.waitlist.registerPendingTitle}
                </p>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {t.waitlist.registerPendingMessage.replace("{email}", pendingEmail)}
                </p>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-caption)",
                    margin: 0,
                  }}
                >
                  {t.waitlist.registerPendingHint}
                </p>
              </div>

              {resendMessage && (
                <p
                  className="text-secondary"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-caption)",
                    fontWeight: "var(--font-weight-medium)" as unknown as number,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {resendMessage}
                </p>
              )}

              <div className="flex flex-col gap-[var(--spacing-xs)] w-full">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  style={{ fontSize: "var(--font-size-small)" }}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>{t.waitlist.resendVerification}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-4" />
                      <span>{t.waitlist.resendVerification}</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleBackToLogin}
                  style={{ fontSize: "var(--font-size-body)" }}
                >
                  {t.waitlist.submitLogin}
                </Button>
              </div>
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="flex flex-col items-center gap-[var(--spacing-md)] py-[var(--spacing-lg)]"
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: "68px",
                  height: "68px",
                  background:
                    "color-mix(in srgb, var(--secondary) 14%, var(--background))",
                  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.7)",
                }}
              >
                <CheckCircle2
                  className="size-8 text-secondary"
                  style={{ color: "var(--secondary)" }}
                />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p
                  className="text-foreground"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-body)",
                    fontWeight: "var(--font-weight-semibold)" as unknown as number,
                    margin: 0,
                  }}
                >
                  {successLabel}
                </p>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                    margin: 0,
                  }}
                >
                  {t.waitlist.securityHint}
                </p>
              </div>
              <Button variant="outline" size="lg" onClick={handleClose}>
                {t.waitlist.close}
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="auth-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="relative flex flex-col gap-[var(--spacing-md)] pt-[var(--spacing-xs)]"
            >
              <DialogHeader className="items-start text-left">
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: "52px",
                    height: "52px",
                    background:
                      "color-mix(in srgb, var(--secondary) 12%, var(--background))",
                    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.7)",
                  }}
                >
                  <LockKeyhole
                    className="size-5"
                    style={{ color: "var(--secondary)" }}
                  />
                </div>
                <DialogTitle
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-h2)",
                    fontWeight: "var(--font-weight-semibold)" as unknown as number,
                    marginTop: "var(--spacing-xs)",
                  }}
                  className="text-foreground"
                >
                  {t.waitlist.title}
                </DialogTitle>
                <DialogDescription
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                    lineHeight: 1.6,
                  }}
                >
                  {t.waitlist.subtitle}
                </DialogDescription>
              </DialogHeader>

              <Tabs
                value={mode}
                onValueChange={(value) => {
                  setMode(value as AuthMode);
                  setError(null);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-secondary/20 p-1 rounded-lg">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    {t.waitlist.loginTab}
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    {t.waitlist.registerTab}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col gap-[var(--spacing-sm)]">
                {mode === "register" && (
                  <div className="flex flex-col gap-[var(--spacing-xs)]">
                    <Label
                      htmlFor="auth-name"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "var(--font-size-small)",
                        fontWeight: "var(--font-weight-medium)" as unknown as number,
                      }}
                    >
                      {t.waitlist.nameLabel}
                    </Label>
                    <Input
                      id="auth-name"
                      value={displayName}
                      onChange={(event) => {
                        setDisplayName(event.target.value);
                        if (error) setError(null);
                      }}
                      onBlur={() => handleInputBlur("displayName", displayName)}
                      onKeyDown={(event) => handleKeyDown(event, "displayName", displayName)}
                      placeholder={t.waitlist.namePlaceholder}
                      autoComplete="name"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                )}

                <div className="flex flex-col gap-[var(--spacing-xs)]">
                  <Label
                    htmlFor="auth-email"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "var(--font-size-small)",
                      fontWeight: "var(--font-weight-medium)" as unknown as number,
                    }}
                  >
                    {t.waitlist.emailLabel}
                  </Label>
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError(null);
                    }}
                    onBlur={() => handleInputBlur("email", email)}
                    onKeyDown={(event) => handleKeyDown(event, "email", email)}
                    placeholder={t.waitlist.emailPlaceholder}
                    autoComplete="email"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="flex flex-col gap-[var(--spacing-xs)]">
                  <Label
                    htmlFor="auth-password"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "var(--font-size-small)",
                      fontWeight: "var(--font-weight-medium)" as unknown as number,
                    }}
                  >
                    {t.waitlist.passwordLabel}
                  </Label>
                  <div className="relative">
                    <Input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (error) setError(null);
                      }}
                      onBlur={() => handleInputBlur("password", password)}
                      onKeyDown={(event) => handleKeyDown(event, "password", password)}
                      placeholder={t.waitlist.passwordPlaceholder}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      disabled={isSubmitting}
                      required
                      className="pr-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? t.waitlist.hidePassword : t.waitlist.showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {mode === "register" && (
                  <div className="flex flex-col gap-[var(--spacing-xs)]">
                    <Label
                      htmlFor="auth-confirm-password"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "var(--font-size-small)",
                        fontWeight: "var(--font-weight-medium)" as unknown as number,
                      }}
                    >
                      {t.waitlist.confirmPasswordLabel}
                    </Label>
                    <Input
                      id="auth-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        if (error) setError(null);
                      }}
                      onBlur={() => handleInputBlur("confirmPassword", confirmPassword)}
                      onKeyDown={(event) => handleKeyDown(event, "confirmPassword", confirmPassword)}
                      placeholder={t.waitlist.confirmPasswordPlaceholder}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                )}
              </div>

              <div
                ref={captchaHostRef}
                data-recaptcha-inline={captchaSiteKey && mode === "register" ? "true" : undefined}
                className={
                  captchaSiteKey && mode === "register"
                    ? "flex w-full justify-center empty:hidden [&_iframe]:max-w-full"
                    : "sr-only h-px w-px overflow-hidden p-0 -m-px"
                }
              />

              {error && (
                <p
                  className="text-destructive"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-caption)",
                    fontWeight: "var(--font-weight-medium)" as unknown as number,
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              )}

              {/* FIX H-02: GDPR-compliant consent note for registration */}
              {mode === "register" && (
                <p
                  className="text-muted-foreground text-center"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-caption)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Bằng việc nhấn "Đăng ký", bạn đã đồng ý với{" "}
                  <a
                    href="/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Chính sách bảo mật
                  </a>
                  {" "}và{" "}
                  <a
                    href="/legal/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Điều khoản sử dụng
                  </a>
                  {" "}của chúng tôi.
                </p>
              )}

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                disabled={isSubmitting || !canSubmit}
                style={{ fontSize: "var(--font-size-body)" }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{submittingLabel}</span>
                  </>
                ) : (
                  <span>{submitLabel}</span>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode((current) => (current === "login" ? "register" : "login"));
                    setError(null);
                  }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                  }}
                >
                  {mode === "login" ? (
                    <>
                      {t.waitlist.toggleToRegister.split("?")[0]}?{" "}
                      <span className="text-primary font-medium">{t.waitlist.toggleToRegister.split("?")[1]}</span>
                    </>
                  ) : (
                    <>
                      {t.waitlist.toggleToLogin.split("?")[0]}?{" "}
                      <span className="text-primary font-medium">{t.waitlist.toggleToLogin.split("?")[1]}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}