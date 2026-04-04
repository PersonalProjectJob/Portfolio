import {
  Bot,
  MoreVertical,
  Link2,
  Unlink,
  ExternalLink,
  RotateCcw,
  FileText,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { useI18n } from "../../lib/i18n";
import type { ReactNode } from "react";
import type { AIModel } from "../desktop/DesktopChatHeader";
import { MobileSidebarButton } from "./MobileSidebarButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const FONT = "'Inter', sans-serif";

export interface MobileChatHeaderProps {
  onClear?: () => void;
  cvBadge?: ReactNode;
  cvProfile?: { id: string; fullName: string } | null;
  onNavigateToProfile?: () => void;
  onUnlinkCv?: () => void;
  selectedModel?: AIModel;
  isAuthenticated?: boolean;
  onModelChange?: (model: AIModel) => void;
}

export function MobileChatHeader({
  onClear,
  cvBadge,
  cvProfile,
  onNavigateToProfile,
  onUnlinkCv,
  selectedModel = "deepseek-chat",
  isAuthenticated = false,
  onModelChange,
}: MobileChatHeaderProps) {
  const { t } = useI18n();
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

  return (
    <header
      className="sticky top-0 z-20 shrink-0"
      style={{
        paddingLeft: "var(--spacing-sm)",
        paddingRight: "var(--spacing-sm)",
        paddingTop: "calc(var(--spacing-sm) + env(safe-area-inset-top))",
      }}
    >
      <div
        className="flex flex-col"
        style={{
          paddingLeft: "var(--spacing-sm)",
          paddingRight: "var(--spacing-sm)",
          paddingTop: "var(--spacing-sm)",
          paddingBottom: "var(--spacing-sm)",
          gap: "var(--spacing-xs)",
          borderRadius: "18px",
          background: "var(--background)",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div
          className="flex items-center"
          style={{
            minHeight: "var(--touch-target-min)",
            gap: "var(--spacing-xs)",
          }}
        >
          <MobileSidebarButton />

          <Avatar
            className="size-9 shrink-0"
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
            <p
              className="text-foreground truncate"
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-body)",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {t.common.aiName}
            </p>
            <div className="flex items-center" style={{ gap: "6px" }}>
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
                  fontFamily: FONT,
                  fontSize: "var(--font-size-caption)",
                  fontWeight: "var(--font-weight-normal)" as unknown as number,
                }}
              >
                {t.common.online}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="touch"
                className="rounded-full text-muted-foreground hover:text-foreground"
                aria-label={t.chat.options}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-64 rounded-[16px] border border-border/60 p-1 shadow-[0_14px_32px_rgba(15,23,42,0.12)]"
            >
              <DropdownMenuLabel className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                {t.chat.menuCvSection}
              </DropdownMenuLabel>

              {cvProfile ? (
                <>
                  <div
                    className="flex items-center gap-2 rounded-[12px] px-3 py-2.5 text-sm"
                    style={{ color: "var(--foreground)" }}
                  >
                    <FileText className="size-4 shrink-0 text-secondary" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium text-foreground">
                        {cvProfile.fullName || t.chat.menuCvConnected}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t.chat.menuCvConnected}
                      </span>
                    </span>
                    <Check className="size-3.5 shrink-0 text-secondary" />
                  </div>

                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-sm"
                    onSelect={() => onNavigateToProfile?.()}
                  >
                    <ExternalLink className="size-4 shrink-0 text-secondary" />
                    <span>{t.chat.menuGoToProfile}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onSelect={() => onUnlinkCv?.()}
                  >
                    <Unlink className="size-4 shrink-0" />
                    <span>{t.chat.menuUnlinkCv}</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-sm"
                  onSelect={() => onNavigateToProfile?.()}
                >
                  <Link2 className="size-4 shrink-0 text-secondary" />
                  <span>{t.chat.menuLinkCv}</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuLabel className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                {t.chat.menuAiModel}
              </DropdownMenuLabel>

              <DropdownMenuRadioGroup
                value={selectedModel}
                onValueChange={(value) => onModelChange?.(value as AIModel)}
              >
                {modelOptions.map((opt) => {
                  const isPlus = opt.value === "qwen-plus";
                  const isMax = opt.value === "qwen-max";
                  const isDisabled = isMax || (isPlus && !isAuthenticated);
                  const extraHint =
                    isPlus && !isAuthenticated ? t.chat.modelPlusLocked : undefined;

                  return (
                    <DropdownMenuRadioItem
                      key={opt.value}
                      value={opt.value}
                      disabled={isDisabled}
                      className="items-start gap-2 rounded-[12px] py-2.5 pr-3 text-sm"
                      title={extraHint ?? opt.desc}
                      style={{
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.45 : 1,
                      }}
                    >
                      <span className="flex min-w-0 flex-1 flex-col" style={{ gap: "1px" }}>
                        <span
                          className="font-medium text-foreground"
                          style={{
                            fontFamily: FONT,
                            fontSize: "var(--font-size-small)",
                          }}
                        >
                          {opt.label}
                        </span>
                        <span
                          className="text-muted-foreground"
                          style={{
                            fontFamily: FONT,
                            fontSize: "var(--font-size-caption)",
                            fontWeight: "var(--font-weight-normal)" as unknown as number,
                          }}
                        >
                          {opt.desc}
                        </span>
                        {extraHint && (
                          <span
                            className="text-muted-foreground"
                            style={{
                              fontFamily: FONT,
                              fontSize: "var(--font-size-caption)",
                              fontWeight: "var(--font-weight-normal)" as unknown as number,
                            }}
                          >
                            {extraHint}
                          </span>
                        )}
                      </span>
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>

              {onClear && (
                <>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-sm"
                    onSelect={() => onClear?.()}
                  >
                    <RotateCcw className="size-4 shrink-0 text-secondary" />
                    <span>{t.chat.clearConversation}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {cvBadge && <div className="w-full min-w-0 overflow-hidden">{cvBadge}</div>}
      </div>
    </header>
  );
}
