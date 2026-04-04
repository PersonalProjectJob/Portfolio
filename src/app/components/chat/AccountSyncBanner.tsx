import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CirclePlus, Download, X } from "lucide-react";
import { Button } from "../ui/button";
import { useI18n } from "../../lib/i18n";
import { scopeStorageKey, type SessionMode } from "../../lib/sessionScope";

const BANNER_KEY = "careerai-account-sync-banner-dismissed-v1";

interface AccountSyncBannerProps {
  visible: boolean;
  mode: SessionMode;
  scopeKey: string;
  guestSessionId: string;
  userId: string | null;
  onCreateAccount: () => void;
  onContinueAsGuest: () => void;
  onImportGuestData?: () => Promise<number | void> | number | void;
}

function readDismissed(scopeKey: string): boolean {
  try {
    return localStorage.getItem(scopeStorageKey(BANNER_KEY, scopeKey)) === "true";
  } catch {
    return false;
  }
}

function writeDismissed(scopeKey: string, dismissed: boolean): void {
  try {
    localStorage.setItem(scopeStorageKey(BANNER_KEY, scopeKey), dismissed ? "true" : "false");
  } catch {
    /* ignore */
  }
}

export function AccountSyncBanner({
  visible,
  mode,
  scopeKey,
  guestSessionId,
  userId,
  onCreateAccount,
  onContinueAsGuest,
  onImportGuestData,
}: AccountSyncBannerProps) {
  const { locale } = useI18n();
  const [dismissed, setDismissed] = useState(() => readDismissed(scopeKey));
  const [status, setStatus] = useState<"idle" | "importing" | "done" | "error">("idle");

  useEffect(() => {
    setDismissed(readDismissed(scopeKey));
    setStatus("idle");
  }, [scopeKey]);

  const labels = useMemo(() => {
    if (locale === "vi") {
      return {
        guestTitle: "Tạo tài khoản để đồng bộ",
        guestDesc:
          "Dữ liệu CV và chat sẽ tiếp tục hoạt động dưới session ẩn. Tạo tài khoản chỉ khi bạn muốn đồng bộ và giữ riêng từng phiên.",
        guestPrimary: "Tạo tài khoản để đồng bộ",
        guestSecondary: "Tiếp tục với guest",
        accountTitle: "Nhập dữ liệu guest",
        accountDesc:
          "Nếu bạn đã dùng session ẩn trước đó, hãy nhập dữ liệu đó vào tài khoản hiện tại theo yêu cầu của bạn. Dữ liệu guest sẽ không tự động gộp.",
        accountPrimary: "Nhập dữ liệu guest",
        accountSecondary: "Giữ riêng",
        imported: "Đã nhập dữ liệu guest.",
        failed: "Không thể nhập dữ liệu guest.",
      };
    }

    return {
      guestTitle: "Create account to sync",
      guestDesc:
        "Your CV and chat still work in the hidden guest session. Create an account only when you want to sync and keep future data under a user account.",
      guestPrimary: "Create account to sync",
      guestSecondary: "Continue as guest",
      accountTitle: "Import guest data",
      accountDesc:
        "If you used a hidden guest session before, you can import that data into the current account on demand. Nothing merges automatically.",
      accountPrimary: "Import guest data",
      accountSecondary: "Keep separate",
      imported: "Guest data imported.",
      failed: "Could not import guest data.",
    };
  }, [locale]);

  const handleDismiss = () => {
    setDismissed(true);
    writeDismissed(scopeKey, true);
    onContinueAsGuest();
  };

  const handleImport = async () => {
    if (!onImportGuestData) return;

    try {
      setStatus("importing");
      await onImportGuestData();
      setStatus("done");
      setDismissed(true);
      writeDismissed(scopeKey, true);
    } catch {
      setStatus("error");
    }
  };

  if (!visible || dismissed) return null;

  const isGuestMode = mode === "guest";

  return (
    <div
      className="relative w-full min-w-0 overflow-hidden rounded-[24px] border border-border/70"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 12%, var(--background)), color-mix(in srgb, var(--primary) 6%, var(--background)))",
        boxShadow: "0 18px 44px color-mix(in srgb, var(--foreground) 8%, transparent)",
      }}
    >
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={locale === "vi" ? "Đóng" : "Dismiss"}
        className="absolute right-3 top-3 rounded-full border border-border/60 bg-background/80 p-1.5 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>

      <div className="flex flex-col gap-[var(--spacing-md)] p-[var(--spacing-lg)] sm:p-[var(--spacing-xl)]">
        <div className="flex items-start gap-[var(--spacing-sm)]">
          <div
            className="flex shrink-0 items-center justify-center rounded-full"
            style={{
              width: "44px",
              height: "44px",
              background: "color-mix(in srgb, var(--secondary) 14%, var(--background))",
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.55)",
            }}
          >
            {isGuestMode ? (
              <CirclePlus className="text-secondary" style={{ width: "20px", height: "20px" }} />
            ) : (
              <Download className="text-secondary" style={{ width: "20px", height: "20px" }} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="text-foreground"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "var(--font-size-body)",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                lineHeight: 1.35,
                margin: 0,
              }}
            >
              {isGuestMode ? labels.guestTitle : labels.accountTitle}
            </p>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "var(--font-size-small)",
                lineHeight: 1.6,
                margin: 0,
                marginTop: "var(--spacing-2xs)",
              }}
            >
              {isGuestMode ? labels.guestDesc : labels.accountDesc}
            </p>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "var(--font-size-caption)",
                lineHeight: 1.6,
                margin: 0,
                marginTop: "var(--spacing-2xs)",
              }}
            >
              {isGuestMode
                ? locale === "vi"
                  ? `Guest session: ${guestSessionId.slice(0, 8)}…`
                  : `Guest session: ${guestSessionId.slice(0, 8)}…`
                : locale === "vi"
                  ? `Tài khoản: ${userId ?? scopeKey}`
                  : `Account: ${userId ?? scopeKey}`}
            </p>
          </div>
        </div>

        {status === "done" && (
          <div
            className="rounded-[16px] border border-border/60 bg-background/70 px-4 py-3"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-small)",
              fontWeight: "var(--font-weight-medium)" as unknown as number,
            }}
          >
            {labels.imported}
          </div>
        )}

        {status === "error" && (
          <div
            className="rounded-[16px] border border-destructive/30 bg-destructive/8 px-4 py-3 text-destructive"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-small)",
              fontWeight: "var(--font-weight-medium)" as unknown as number,
            }}
          >
            {labels.failed}
          </div>
        )}

        <div className="flex flex-col gap-[var(--spacing-sm)] sm:flex-row">
          {isGuestMode ? (
            <>
              <Button
                type="button"
                size="lg"
                className="w-full sm:w-auto"
                onClick={onCreateAccount}
                style={{
                  fontSize: "var(--font-size-small)",
                  gap: "var(--spacing-xs)",
                }}
              >
                {labels.guestPrimary}
                <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleDismiss}
                style={{
                  fontSize: "var(--font-size-small)",
                }}
              >
                {labels.guestSecondary}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleImport}
                disabled={status === "importing" || !onImportGuestData}
                style={{
                  fontSize: "var(--font-size-small)",
                  gap: "var(--spacing-xs)",
                }}
              >
                {labels.accountPrimary}
                <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleDismiss}
                style={{
                  fontSize: "var(--font-size-small)",
                }}
              >
                {labels.accountSecondary}
              </Button>
            </>
          )}
        </div>

        {status === "importing" && (
          <p
            className="text-muted-foreground"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-caption)",
              margin: 0,
            }}
          >
            {locale === "vi" ? "Đang nhập dữ liệu guest..." : "Importing guest data..."}
          </p>
        )}
      </div>
    </div>
  );
}
