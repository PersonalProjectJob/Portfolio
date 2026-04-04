/**
 * CVUploadModal - Modal upload CV with drag-and-drop support and consent gating.
 *
 * Features:
 * - Large drag-and-drop upload zone inside the modal
 * - Consent checkbox cached per scope
 * - Links to Privacy Policy and Terms of Service
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle, Shield, Upload, X } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { AuthModal } from "./AuthModal";
import { getParseQuotaSummary } from "../../lib/parseQuota";
import {
  buildSessionHeaders,
  getGuestSessionId,
  scopeStorageKey,
  useSessionIdentity,
} from "../../lib/sessionScope";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { projectId, publicAnonKey } from "/utils/supabase/info";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d`;
const CONSENT_URL = `${BASE}/consent`;
const CONSENT_DOC_VERSION = "1.0";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

const CONSENT_CACHE_KEY = "careerai-consent-accepted-v2";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getCachedConsent(scopeKey: string): boolean {
  try {
    return localStorage.getItem(scopeStorageKey(CONSENT_CACHE_KEY, scopeKey)) === "true";
  } catch {
    return false;
  }
}

function setCachedConsent(accepted: boolean, scopeKey: string): void {
  try {
    localStorage.setItem(
      scopeStorageKey(CONSENT_CACHE_KEY, scopeKey),
      accepted ? "true" : "false",
    );
  } catch {
    /* ignore */
  }
}

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function isImageFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  return file.type.startsWith("image/") || IMAGE_EXTENSIONS.includes(ext);
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface CVUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when user selects a document file (PDF/DOCX/DOC/TXT) */
  onUploadDocument: (file: File) => void;
  /** Called when user selects an image file (JPG/PNG/WEBP) */
  onUploadImage: (file: File) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function CVUploadModal({
  open,
  onOpenChange,
  onUploadDocument,
  onUploadImage,
}: CVUploadModalProps) {
  const { t, locale } = useI18n();
  const identity = useSessionIdentity();

  const docInputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);

  const [isConsented, setIsConsented] = useState(() =>
    getCachedConsent(identity.scopeKey),
  );
  const [isSavingConsent, setIsSavingConsent] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [, setQuotaTick] = useState(0);

  useEffect(() => {
    if (!open) return;

    setIsConsented(getCachedConsent(identity.scopeKey));
    dragDepthRef.current = 0;
    setIsDragging(false);
  }, [open, identity.scopeKey]);

  useEffect(() => {
    const sync = () => setQuotaTick((tick) => tick + 1);

    window.addEventListener("storage", sync);
    window.addEventListener("careerai-parse-quota-updated", sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("careerai-parse-quota-updated", sync as EventListener);
    };
  }, []);

  const saveConsent = useCallback(async () => {
    try {
      setIsSavingConsent(true);
      const identifier =
        identity.mode === "account" && identity.userId
          ? identity.userId
          : getGuestSessionId();

      await fetch(CONSENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          ...buildSessionHeaders(identity),
        },
        body: JSON.stringify({
          identifier,
          identifierType: identity.mode === "account" ? "user" : "guest",
          consentTypes: ["privacy_policy", "terms_of_service"],
          docVersion: CONSENT_DOC_VERSION,
        }),
      });

      setCachedConsent(true, identity.scopeKey);
      console.log("[CVUploadModal] Consent saved for scope:", identity.scopeKey);
    } catch (err) {
      console.error("[CVUploadModal] Failed to save consent:", err);
      // Non-blocking - still allow upload
    } finally {
      setIsSavingConsent(false);
    }
  }, [identity]);

  const handlePickedFile = useCallback(
    async (file: File) => {
      if (!file) return;

      // 🔒 REQUIRE AUTH: Must have account to upload CV
      if (!identity.isAuthenticated || !identity.userId) {
        console.log("[CVUploadModal] User not authenticated - showing auth modal");
        setShowAuthModal(true);
        return;
      }

      // FIX H-03: Require explicit consent - do NOT auto-save
      if (!getCachedConsent(identity.scopeKey)) {
        console.log("[CVUploadModal] User has not consented - blocking upload");
        return; // Block upload until user checks the consent checkbox
      }

      onOpenChange(false);

      if (isImageFile(file)) {
        onUploadImage(file);
        return;
      }

      onUploadDocument(file);
    },
    [identity, onOpenChange, onUploadDocument, onUploadImage],
  );

  const handleDocFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      await handlePickedFile(file);
    },
    [handlePickedFile],
  );

  const handleConsentChange = useCallback(
    async (checked: boolean | "indeterminate") => {
      const val = checked === true;
      setIsConsented(val);
      // FIX H-03: Only save consent when user actively checks the checkbox
      if (val) {
        setCachedConsent(true, identity.scopeKey);
        // Also save to server for audit trail
        await saveConsent();
      }
    },
    [identity.scopeKey, saveConsent],
  );

  // 🔒 REQUIRE AUTH: Guest users cannot upload
  const requiresAuth = !identity.isAuthenticated || !identity.userId;
  const canUpload = !requiresAuth && isConsented && !isSavingConsent;
  const buttonsDisabled = !isConsented || isSavingConsent;
  const showSignupLink = !identity.isAuthenticated;

  const openDocumentPicker = useCallback(() => {
    if (requiresAuth || buttonsDisabled) return;
    docInputRef.current?.click();
  }, [buttonsDisabled, requiresAuth]);

  const handleDropzoneKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (requiresAuth || buttonsDisabled) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      openDocumentPicker();
    },
    [buttonsDisabled, openDocumentPicker, requiresAuth],
  );

  const handleAuthButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setShowAuthModal(true);
    },
    [],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (buttonsDisabled) return;
      dragDepthRef.current += 1;
      setIsDragging(true);
    },
    [buttonsDisabled],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (buttonsDisabled) return;
      e.dataTransfer.dropEffect = "copy";
      setIsDragging(true);
    },
    [buttonsDisabled],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (buttonsDisabled) return;
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDragging(false);
      }
    },
    [buttonsDisabled],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragDepthRef.current = 0;
      setIsDragging(false);
      if (buttonsDisabled) return;

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      void handlePickedFile(file);
    },
    [buttonsDisabled, handlePickedFile],
  );

  const dropzoneTitle =
    locale === "vi" ? "Kéo thả file CV vào đây" : "Drag and drop your CV here";
  const dropzoneSubtitle =
    locale === "vi"
      ? "Hỗ trợ PDF, DOC, DOCX, TXT, JPG, PNG, WEBP. Tối đa 10MB."
      : "Supports PDF, DOC, DOCX, TXT, JPG, PNG, WEBP. Max 10MB.";
  const dropzoneHint =
    locale === "vi"
      ? "Nhấn vào vùng này để chọn file PDF/DOCX."
      : "Click this area to choose a PDF/DOCX file.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="flex flex-col gap-0"
        style={{
          maxWidth: "min(540px, calc(100vw - 2rem))",
          maxHeight: "min(85vh, 680px)",
          padding: 0,
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <DialogHeader
          className="border-b border-border"
          style={{
            paddingTop: "var(--spacing-md)",
            paddingBottom: 0,
            paddingLeft: "var(--spacing-lg)",
            paddingRight: "var(--spacing-lg)",
          }}
        >
          <div className="flex min-h-[40px] items-center justify-between" style={{ gap: "var(--spacing-md)" }}>
            <div className="flex min-w-0 items-center" style={{ gap: "var(--spacing-xs)" }}>
              <div
                className="flex items-center justify-center rounded-full bg-secondary/10"
                style={{ width: "32px", height: "32px", flexShrink: 0 }}
              >
                <Shield
                  className="text-secondary"
                  style={{ width: "16px", height: "16px" }}
                />
              </div>
              <DialogTitle
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-body)",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {t.legal.uploadModalTitle}
              </DialogTitle>
            </div>

            <DialogClose
              className="flex shrink-0 items-center justify-center rounded-xs text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden"
              aria-label="Close"
              style={{ width: "24px", height: "24px" }}
            >
              <X style={{ width: "18px", height: "18px" }} />
            </DialogClose>
          </div>
        </DialogHeader>


        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ padding: "var(--spacing-md) var(--spacing-lg)" }}
        >
          <div
            role={requiresAuth ? undefined : "button"}
            tabIndex={requiresAuth || buttonsDisabled ? -1 : 0}
            aria-disabled={requiresAuth || buttonsDisabled}
            onClick={openDocumentPicker}
            onKeyDown={handleDropzoneKeyDown}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex min-h-[240px] w-full flex-col items-center justify-center text-center transition-all duration-200 relative"
            style={{
              borderRadius: "var(--radius-card)",
              border: isDragging
                ? "1.5px solid color-mix(in srgb, var(--secondary) 70%, var(--border))"
                : "1.5px dashed var(--border)",
              background: isDragging
                ? "color-mix(in srgb, var(--secondary) 8%, var(--background))"
                : "var(--muted)",
              boxShadow: isDragging
                ? "inset 0 0 0 1px color-mix(in srgb, var(--secondary) 15%, transparent)"
                : "inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 3px rgba(0,0,0,0.04)",
              padding: "var(--spacing-xl)",
              gap: "var(--spacing-sm)",
              marginBottom: "var(--spacing-sm)",
              opacity: buttonsDisabled ? 0.65 : 1,
              cursor:
                requiresAuth || buttonsDisabled ? "default" : "pointer",
            }}
          >
            {/* Guest Overlay */}
            {requiresAuth && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-card"
                style={{
                  zIndex: 10,
                  padding: "var(--spacing-xl)",
                  pointerEvents: "none", // Allow clicks to pass through container
                }}
              >
                <div
                  className="flex items-center justify-center mb-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, var(--background)), color-mix(in srgb, var(--secondary) 10%, var(--background)))",
                    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <Shield
                    className="text-primary"
                    style={{ width: "32px", height: "32px" }}
                  />
                </div>

                <h3
                  className="text-foreground mb-2"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-body)",
                    fontWeight: "var(--font-weight-semibold)" as unknown as number,
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {locale === "vi" ? "Đăng nhập để upload CV" : "Login to Upload CV"}
                </h3>

                <p
                  className="text-muted-foreground text-center mb-4"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                    fontWeight: "var(--font-weight-normal)" as unknown as number,
                    lineHeight: 1.6,
                    margin: 0,
                    maxWidth: "400px",
                  }}
                >
                  {locale === "vi" 
                    ? "Tạo tài khoản miễn phí để lưu trữ CV, nhận 2 lượt phân tích AI OCR và quản lý CV theo thiết bị."
                    : "Create a free account to store CVs, get 2 AI OCR analysis credits, and manage CVs by device."}
                </p>

                <div
                  style={{
                    pointerEvents: "auto", // Re-enable clicks for content
                  }}
                >
                  <button
                    type="button"
                    onClick={handleAuthButtonClick}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-md text-primary-foreground transition-colors"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "var(--font-size-body)",
                      fontWeight: "var(--font-weight-medium)" as unknown as number,
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {locale === "vi" ? "Đăng nhập / Đăng ký" : "Login / Sign Up"}
                    <svg
                      className="ml-2"
                      style={{ width: "16px", height: "16px" }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            <div
              className="flex items-center justify-center"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: isDragging
                  ? "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 20%, var(--background)), color-mix(in srgb, var(--primary) 10%, var(--background)))"
                  : "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 12%, var(--background)), color-mix(in srgb, var(--primary) 8%, var(--background)))",
                boxShadow: "0 8px 22px rgba(15, 23, 42, 0.08)",
                flexShrink: 0,
              }}
            >
              <Upload
                className="text-secondary"
                style={{ width: "28px", height: "28px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xs)" }}>
              <h3
                className="text-foreground"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-body)",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {dropzoneTitle}
              </h3>
              <p
                className="text-muted-foreground"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-small)",
                  fontWeight: "var(--font-weight-normal)" as unknown as number,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {dropzoneSubtitle}
              </p>
              <p
                className="text-muted-foreground"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-caption)",
                  fontWeight: "var(--font-weight-normal)" as unknown as number,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {dropzoneHint}
              </p>
            </div>

            <div
              className="flex flex-wrap items-center justify-center"
              style={{ gap: "var(--spacing-2xs)", marginTop: "var(--spacing-xs)" }}
            >
              <span
                className="rounded-full border border-border bg-background text-foreground"
                style={{
                  padding: "var(--spacing-2xs) var(--spacing-sm)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-caption)",
                  fontWeight: "var(--font-weight-medium)" as unknown as number,
                }}
              >
                {t.legal.uploadPdf}
              </span>
              <span
                className="rounded-full border border-border bg-background text-foreground"
                style={{
                  padding: "var(--spacing-2xs) var(--spacing-sm)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-caption)",
                  fontWeight: "var(--font-weight-medium)" as unknown as number,
                }}
              >
                {t.legal.uploadImage}
              </span>
            </div>
          </div>
        </div>

        <div
          className="border-t border-border"
          style={{
            padding: "var(--spacing-md) var(--spacing-lg)",
          }}
        >
          <div className="flex items-start" style={{ gap: "var(--spacing-xs)" }}>
            <Checkbox
              id="cv-consent"
              checked={isConsented}
              onCheckedChange={handleConsentChange}
              style={{ marginTop: "2px" }}
            />
            <label
              htmlFor="cv-consent"
              className="cursor-pointer"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "var(--font-size-caption)",
                fontWeight: "var(--font-weight-normal)" as unknown as number,
                lineHeight: 1.5,
                color: "var(--muted-foreground)",
              }}
            >
              {t.legal.consentNote}{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary underline"
                style={{
                  fontWeight: "var(--font-weight-medium)" as unknown as number,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {t.legal.consentPrivacy}
              </a>{" "}
              {t.legal.consentAnd}{" "}
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary underline"
                style={{
                  fontWeight: "var(--font-weight-medium)" as unknown as number,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {t.legal.consentTerms}
              </a>{" "}
              {t.legal.consentOfOurs}
            </label>
          </div>

          {!isConsented && (
            <p
              className="text-destructive"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "var(--font-size-caption)",
                fontWeight: "var(--font-weight-normal)" as unknown as number,
                margin: 0,
                marginTop: "var(--spacing-xs)",
                marginLeft: "calc(16px + var(--spacing-xs))",
              }}
            >
              {t.legal.mustAccept}
            </p>
          )}
        </div>

        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp"
          onChange={handleDocFileChange}
          className="hidden"
        />
      </DialogContent>
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        initialMode="register"
        feature="cv-upload"
      />
    </Dialog>
  );
}
