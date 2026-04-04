import {
  Bot,
  MoreVertical,
  RotateCcw,
  FileText,
  Link2,
  Unlink,
  ExternalLink,
  Check,
  Circle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { useI18n } from "../../lib/i18n";
import { useResponsiveDensity } from "../../hooks/useMediaQuery";
import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";

export type AIModel = "deepseek-chat" | "qwen-plus" | "qwen-max";

export interface DesktopChatHeaderProps {
  onClear?: () => void;
  cvBadge?: ReactNode;
  cvProfile?: { id: string; fullName: string } | null;
  onNavigateToProfile?: () => void;
  onUnlinkCv?: () => void;
  selectedModel?: AIModel;
  isAuthenticated?: boolean;
  onModelChange?: (model: AIModel) => void;
}

const fontInter = "'Inter', sans-serif";

const labelStyle: React.CSSProperties = {
  fontFamily: fontInter,
  fontSize: "var(--font-size-caption)",
  fontWeight: "var(--font-weight-semibold)" as unknown as number,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  opacity: 0.6,
  padding: "var(--spacing-xs) var(--spacing-sm)",
  margin: 0,
  lineHeight: 1.5,
};

const itemBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-xs)",
  padding: "var(--spacing-xs) var(--spacing-sm)",
  borderRadius: "var(--radius)",
  cursor: "pointer",
  fontFamily: fontInter,
  fontSize: "var(--font-size-small)",
  fontWeight: "var(--font-weight-normal)" as unknown as number,
  lineHeight: 1.5,
  border: "none",
  background: "transparent",
  width: "100%",
  textAlign: "left",
  color: "inherit",
  outline: "none",
};

export function DesktopChatHeader({
  onClear,
  cvBadge,
  cvProfile,
  onNavigateToProfile,
  onUnlinkCv,
  selectedModel = "deepseek-chat",
  isAuthenticated = false,
  onModelChange,
}: DesktopChatHeaderProps) {
  const { t } = useI18n();
  const density = useResponsiveDensity();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentWidth =
    density === "expanded" ? "1040px" : density === "compact" ? "860px" : "920px";
  const shellPadding =
    density === "compact" ? "var(--spacing-lg)" : "var(--spacing-xl)";

  const modelOptions: { value: AIModel; label: string; desc: string }[] = [
    {
      value: "deepseek-chat",
      label: t.chat.modelTurbo,
      desc: t.chat.modelTurboDesc,
    },
    {
      value: "qwen-plus",
      label: t.chat.modelPlus,
      desc: t.chat.modelPlusDesc,
    },
    {
      value: "qwen-max",
      label: t.chat.modelMax,
      desc: t.chat.modelMaxDesc,
    },
  ];

  const selectedModelMeta =
    modelOptions.find((opt) => opt.value === selectedModel) ?? modelOptions[0];

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target as Node) &&
      triggerRef.current &&
      !triggerRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, handleClickOutside, handleEscape]);

  const act = (fn?: () => void) => {
    fn?.();
    setOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-20 shrink-0"
      style={{
        paddingTop: "var(--spacing-lg)",
        paddingLeft: shellPadding,
        paddingRight: shellPadding,
      }}
    >
      <div
        className="mx-auto flex items-center w-full"
        style={{
          maxWidth: contentWidth,
          gap: "var(--spacing-sm)",
          padding: "var(--spacing-sm) var(--spacing-md)",
          borderRadius: "20px",
          background: "var(--background)",
          boxShadow: "0 14px 32px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Avatar
          className="size-10 shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--secondary), color-mix(in srgb, var(--primary) 60%, var(--secondary)))",
          }}
        >
          <AvatarFallback
            style={{
              background:
                "linear-gradient(135deg, var(--secondary), color-mix(in srgb, var(--primary) 60%, var(--secondary)))",
              color: "var(--secondary-foreground)",
            }}
          >
            <Bot className="size-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap" style={{ gap: "var(--spacing-xs)" }}>
            <p
              className="text-foreground"
              style={{
                fontFamily: fontInter,
                fontSize: "1.05rem",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                lineHeight: 1.3,
                margin: 0,
              }}
            >
              {t.common.aiName}
            </p>
            <span
              className="text-muted-foreground"
              style={{
                fontFamily: fontInter,
                fontSize: "var(--font-size-small)",
                fontWeight: "var(--font-weight-medium)" as unknown as number,
              }}
            >
              {selectedModelMeta.label}
            </span>
          </div>

          <div className="flex items-center flex-wrap" style={{ gap: "8px", marginTop: "4px" }}>
            <span className="relative flex shrink-0" style={{ width: "8px", height: "8px" }}>
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: "var(--color-success)",
                  opacity: 0.35,
                }}
              />
              <span
                className="relative block size-2 rounded-full"
                style={{ backgroundColor: "var(--color-success)" }}
              />
            </span>
            <span
              className="text-muted-foreground"
              style={{
                fontFamily: fontInter,
                fontSize: "var(--font-size-small)",
                fontWeight: "var(--font-weight-normal)" as unknown as number,
              }}
            >
              {t.chat.onlineStatus}
            </span>
          </div>
        </div>

        {cvBadge && <div className="hidden lg:block shrink-0">{cvBadge}</div>}

        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground rounded-full"
            style={{
              gap: "var(--spacing-xs)",
              height: "40px",
              paddingLeft: "0.95rem",
              paddingRight: "0.95rem",
              background: "var(--muted)",
            }}
          >
            <RotateCcw className="size-4" />
            <span
              style={{
                fontFamily: fontInter,
                fontSize: "var(--font-size-small)",
                fontWeight: "var(--font-weight-normal)" as unknown as number,
              }}
            >
              {t.chat.clearChat}
            </span>
          </Button>
        )}

        <div className="relative">
          <Button
            ref={triggerRef}
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 rounded-full text-muted-foreground hover:text-foreground"
            style={{
              background: "var(--muted)",
            }}
            aria-label={t.chat.options}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <MoreVertical className="size-4" />
          </Button>

          {open && (
            <div
              ref={menuRef}
              role="menu"
              className="absolute right-0 bg-background border border-border text-foreground"
              style={{
                top: "calc(100% + var(--spacing-sm))",
                minWidth: "240px",
                borderRadius: "16px",
                padding: "var(--spacing-2xs)",
                fontFamily: fontInter,
                boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
                zIndex: 9999,
              }}
            >
              <p style={labelStyle}>{t.chat.menuCvSection}</p>

              {cvProfile ? (
                <>
                  <div
                    style={{
                      ...itemBase,
                      cursor: "default",
                      opacity: 1,
                    }}
                  >
                    <FileText
                      style={{
                        width: "16px",
                        height: "16px",
                        flexShrink: 0,
                        color: "var(--secondary)",
                      }}
                    />
                    <div className="flex flex-col min-w-0" style={{ gap: "1px" }}>
                      <span
                        style={{
                          fontFamily: fontInter,
                          fontSize: "var(--font-size-small)",
                          fontWeight: "var(--font-weight-medium)" as unknown as number,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cvProfile.fullName}
                      </span>
                      <span
                        style={{
                          fontFamily: fontInter,
                          fontSize: "var(--font-size-caption)",
                          fontWeight: "var(--font-weight-normal)" as unknown as number,
                          color: "var(--secondary)",
                        }}
                      >
                        {t.chat.menuCvConnected}
                      </span>
                    </div>
                    <Check
                      style={{
                        width: "14px",
                        height: "14px",
                        flexShrink: 0,
                        marginLeft: "auto",
                        color: "var(--secondary)",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    style={itemBase}
                    className="hover:bg-accent hover:text-accent-foreground"
                    onClick={() => act(onNavigateToProfile)}
                  >
                    <ExternalLink style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                    {t.chat.menuGoToProfile}
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    style={{ ...itemBase, color: "var(--destructive)" }}
                    className="hover:bg-destructive/10"
                    onClick={() => act(onUnlinkCv)}
                  >
                    <Unlink style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                    {t.chat.menuUnlinkCv}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  style={itemBase}
                  className="hover:bg-accent hover:text-accent-foreground"
                  onClick={() => act(onNavigateToProfile)}
                >
                  <Link2 style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                  {t.chat.menuLinkCv}
                </button>
              )}

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border)",
                  margin: "var(--spacing-2xs) 0",
                }}
              />

              <p style={labelStyle}>{t.chat.menuAiModel}</p>

              {modelOptions.map((opt) => {
                const isSelected = selectedModel === opt.value;
                const isPlus = opt.value === "qwen-plus";
                const isMax = opt.value === "qwen-max";
                const isDisabled = isMax || (isPlus && !isAuthenticated);
                const extraHint =
                  isPlus && !isAuthenticated ? t.chat.modelPlusLocked : undefined;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    aria-disabled={isDisabled}
                    disabled={isDisabled}
                    style={{
                      ...itemBase,
                      paddingLeft: "var(--spacing-xl)",
                      position: "relative",
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.45 : 1,
                    }}
                    className={
                      isDisabled ? "" : "hover:bg-accent hover:text-accent-foreground"
                    }
                    title={extraHint ?? opt.desc}
                    onClick={() => {
                      if (isDisabled) return;
                      onModelChange?.(opt.value);
                      setOpen(false);
                    }}
                  >
                    {isSelected && (
                      <Circle
                        style={{
                          position: "absolute",
                          left: "var(--spacing-xs)",
                          width: "8px",
                          height: "8px",
                          fill: "currentColor",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div className="flex flex-col" style={{ gap: "1px" }}>
                      <span
                        style={{
                          fontFamily: fontInter,
                          fontSize: "var(--font-size-small)",
                          fontWeight: "var(--font-weight-medium)" as unknown as number,
                        }}
                      >
                        {opt.label}
                      </span>
                      <span
                        style={{
                          fontFamily: fontInter,
                          fontSize: "var(--font-size-caption)",
                          fontWeight: "var(--font-weight-normal)" as unknown as number,
                          opacity: 0.6,
                        }}
                      >
                        {opt.desc}
                      </span>
                      {extraHint && (
                        <span
                          style={{
                            fontFamily: fontInter,
                            fontSize: "var(--font-size-caption)",
                            fontWeight: "var(--font-weight-normal)" as unknown as number,
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {extraHint}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
