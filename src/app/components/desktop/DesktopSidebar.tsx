import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  MessageCircle,
  Briefcase,
  UserCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageSquareDashed,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";
import type { ConversationMeta } from "../../lib/chatStorage";
import { SidebarTokenUsage } from "./SidebarTokenUsage";

const LOGO_URL =
  "https://res.cloudinary.com/dp6ctjvbv/image/upload/v1771260933/ChatGPT_Image_20_34_50_16_thg_2_2026_1_copy_ymaxby.png";
const Settings = (_props: Record<string, unknown>) => null;

/* ------------------------------------------------------------------ */
/*  Consistent sidebar padding token (expanded vs collapsed)           */
/*  Expanded  → --spacing-sm (12px) outer, items get --spacing-sm inner*/
/*  Collapsed → --spacing-xs (8px) both                                */
/* ------------------------------------------------------------------ */
const SIDEBAR_PX_EXPANDED = "px-[var(--spacing-sm)]";
const SIDEBAR_PX_COLLAPSED = "px-[var(--spacing-xs)]";

/* ------------------------------------------------------------------ */
/*  Relative time helper                                                */
/* ------------------------------------------------------------------ */
function getDateGroup(
  ts: number,
): "today" | "yesterday" | "week" | "older" {
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86_400_000;
  const startOfWeek = startOfToday - 6 * 86_400_000;

  if (ts >= startOfToday) return "today";
  if (ts >= startOfYesterday) return "yesterday";
  if (ts >= startOfWeek) return "week";
  return "older";
}

const DATE_GROUP_LABELS: Record<string, Record<string, string>> = {
  vi: {
    today: "Hôm nay",
    yesterday: "Hôm qua",
    week: "7 ngày trước",
    older: "Trước đó",
  },
  en: {
    today: "Today",
    yesterday: "Yesterday",
    week: "Previous 7 days",
    older: "Older",
  },
};

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
export interface DesktopSidebarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onNewChat?: () => void;
  conversations?: ConversationMeta[];
  activeConversationId?: string;
  onSwitchConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  mobileMode?: boolean;
  onRequestClose?: () => void;
}

export function DesktopSidebar({
  activeTab = "chat",
  onTabChange,
  onNewChat,
  conversations = [],
  activeConversationId,
  onSwitchConversation,
  onDeleteConversation,
  mobileMode = false,
  onRequestClose,
}: DesktopSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { t, locale } = useI18n();

  const NAV_ITEMS = [
    { id: "chat", label: t.nav.chat, icon: MessageCircle },
    { id: "jobs", label: t.nav.jobs, icon: Briefcase },
    { id: "profile", label: t.nav.profile, icon: UserCircle },
  ];

  const px = mobileMode ? SIDEBAR_PX_EXPANDED : isCollapsed ? SIDEBAR_PX_COLLAPSED : SIDEBAR_PX_EXPANDED;

  /* ---------------------------------------------------------------- */
  /*  Group conversations by date                                      */
  /* ---------------------------------------------------------------- */
  const groupedConversations = useMemo(() => {
    const groups: { label: string; items: ConversationMeta[] }[] = [];
    const labels = DATE_GROUP_LABELS[locale] || DATE_GROUP_LABELS.vi;
    const buckets: Record<string, ConversationMeta[]> = {
      today: [],
      yesterday: [],
      week: [],
      older: [],
    };

    for (const conv of conversations) {
      const group = getDateGroup(conv.u);
      buckets[group].push(conv);
    }

    const order: Array<"today" | "yesterday" | "week" | "older"> = [
      "today",
      "yesterday",
      "week",
      "older",
    ];
    for (const key of order) {
      if (buckets[key].length > 0) {
        groups.push({ label: labels[key], items: buckets[key] });
      }
    }
    return groups;
  }, [conversations, locale]);

  const hasConversations = conversations.length > 0;
  const isSettingsActive = false;

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-muted overflow-hidden",
        "transition-[width] duration-200 ease-in-out shrink-0",
        mobileMode ? "w-full" : isCollapsed ? "w-[68px]" : "w-[260px]",
      )}
    >
      {/* ── Header: Logo + Collapse ── */}
      <div
        className={cn(
          "flex shrink-0",
          isCollapsed
            ? "flex-col items-center py-[var(--spacing-sm)] gap-[var(--spacing-xs)]"
            : "flex-row items-center py-[var(--spacing-sm)]",
          px,
        )}
        style={{ borderBottom: "1px solid color-mix(in srgb, var(--border) 50%, transparent)" }}
      >
        {/* Logo — click to go home */}
        <button
          onClick={() => {
            navigate("/");
            onRequestClose?.();
          }}
          className="shrink-0 cursor-pointer bg-transparent border-none p-0 flex items-center"
          style={{
            paddingLeft: isCollapsed ? undefined : "var(--spacing-xs)",
          }}
          aria-label={t.common.backToHome}
          title={t.common.backToHome}
        >
          <img
            src={LOGO_URL}
            alt="CareerAI"
            style={{
              height: isCollapsed ? "32px" : "36px",
              width: "auto",
              display: "block",
            }}
          />
        </button>

        {!mobileMode && !isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
            style={{ marginLeft: "auto" }}
            aria-label={t.chat.collapseSidebar}
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}

        {!mobileMode && isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
            aria-label={t.chat.expandSidebar}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        )}
      </div>

      {/* ── New Chat Button ── */}
      <div
        className={cn("shrink-0 pt-[var(--spacing-sm)]", px)}
      >
        <Button
          onClick={() => {
            onNewChat?.();
            onRequestClose?.();
          }}
          className={cn(
            "w-full text-primary-foreground hover:opacity-90",
            "rounded-[var(--radius-button)]",
            "gap-[var(--spacing-xs)]",
            isCollapsed && "px-0 justify-center",
          )}
          size="default"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "var(--font-size-small)",
            fontWeight: "var(--font-weight-medium)" as unknown as number,
            background: "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, var(--secondary)))",
            boxShadow: "0 2px 8px color-mix(in srgb, var(--primary) 25%, transparent)",
          }}
        >
          <Plus className="size-4 shrink-0" />
          {!isCollapsed && t.chat.newConversation}
        </Button>
      </div>

      {/* ── Navigation ── */}
      <nav
        className={cn("shrink-0 pt-[var(--spacing-sm)]", px)}
      >
        <div className="flex flex-col" style={{ gap: "2px" }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange?.(item.id);
                  onRequestClose?.();
                }}
                className={cn(
                  "flex items-center",
                  "rounded-[var(--radius)] transition-colors duration-150",
                  isActive
                    ? "bg-sidebar-accent/10 text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-muted",
                  isCollapsed
                    ? "justify-center px-[var(--spacing-xs)] py-[var(--spacing-xs)]"
                    : "gap-[var(--spacing-sm)] px-[var(--spacing-sm)] py-[var(--spacing-xs)]",
                )}
                style={{ minHeight: "36px" }}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-[18px] shrink-0" />
                {!isCollapsed && (
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "var(--font-size-small)",
                      fontWeight: isActive
                        ? ("var(--font-weight-semibold)" as unknown as number)
                        : ("var(--font-weight-normal)" as unknown as number),
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
      {/* ── Conversation History ── */}
      {((!mobileMode && !isCollapsed && activeTab === "chat") || mobileMode) && (
        <ScrollArea className="flex-1 min-h-0">
          <div
            className={px}
            style={{ paddingTop: "var(--spacing-md)" }}
          >
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "var(--font-size-caption)",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                margin: 0,
                paddingLeft: "var(--spacing-sm)",
                paddingBottom: "var(--spacing-xs)",
              }}
            >
              {t.chat.conversationHistory}
            </p>

            {!hasConversations ? (
              /* Empty state */
              <div
                className="flex flex-col items-center justify-center text-center"
                style={{
                  paddingTop: "var(--spacing-xl)",
                  paddingBottom: "var(--spacing-xl)",
                  paddingLeft: "var(--spacing-sm)",
                  paddingRight: "var(--spacing-sm)",
                  gap: "var(--spacing-xs)",
                }}
              >
                <MessageSquareDashed
                  className="text-muted-foreground/30"
                  style={{ width: "28px", height: "28px" }}
                />
                <p
                  className="text-muted-foreground/60"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                    fontWeight: "var(--font-weight-medium)" as unknown as number,
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {t.sidebar.emptyHistory}
                </p>
                <p
                  className="text-muted-foreground/40"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-caption)",
                    fontWeight: "var(--font-weight-normal)" as unknown as number,
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  {t.sidebar.emptyHistoryHint}
                </p>
              </div>
            ) : (
              /* Grouped conversation list */
              <div style={{ paddingBottom: "var(--spacing-sm)" }}>
                {groupedConversations.map((group) => (
                  <div key={group.label} style={{ marginBottom: "var(--spacing-xs)" }}>
                    {/* Group label */}
                    <p
                      className="text-muted-foreground/50"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "var(--font-size-caption)",
                        fontWeight: "var(--font-weight-medium)" as unknown as number,
                        margin: 0,
                        paddingLeft: "var(--spacing-sm)",
                        paddingTop: "var(--spacing-xs)",
                        paddingBottom: "var(--spacing-2xs)",
                      }}
                    >
                      {group.label}
                    </p>

                    {/* Conversation items */}
                    <div className="flex flex-col" style={{ gap: "1px" }}>
                      {group.items.map((conv) => {
                        const isActive = conv.id === activeConversationId;
                        return (
                          <div
                            key={conv.id}
                            className={cn(
                              "group flex items-center overflow-hidden",
                              "rounded-[var(--radius)] transition-colors duration-150 cursor-pointer",
                              isActive
                                ? "bg-sidebar-accent/10 text-sidebar-primary"
                                : "text-sidebar-foreground hover:bg-muted",
                            )}
                            style={{
                              paddingLeft: "var(--spacing-sm)",
                              paddingRight: "var(--spacing-2xs)",
                              paddingTop: "var(--spacing-xs)",
                              paddingBottom: "var(--spacing-xs)",
                              minHeight: "36px",
                            }}
                            onClick={() => {
                              onSwitchConversation?.(conv.id);
                              onRequestClose?.();
                            }}
                          >
                            <MessageCircle
                              className="shrink-0 text-muted-foreground/50"
                              style={{ width: "14px", height: "14px" }}
                            />
                            <span
                              className="flex-1 min-w-0"
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "var(--font-size-small)",
                                fontWeight: isActive
                                  ? ("var(--font-weight-medium)" as unknown as number)
                                  : ("var(--font-weight-normal)" as unknown as number),
                                marginLeft: "var(--spacing-xs)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                              }}
                            >
                              {conv.title}
                            </span>
                            {/* Delete button — visible on hover */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConversation?.(conv.id);
                              }}
                              className={cn(
                                "shrink-0",
                                mobileMode ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                                "transition-opacity duration-150",
                                "flex items-center justify-center",
                                "rounded-[var(--radius)] text-muted-foreground hover:text-destructive",
                                "bg-transparent border-none cursor-pointer",
                              )}
                              style={{
                                width: "24px",
                                height: "24px",
                                padding: 0,
                              }}
                              aria-label={
                                locale === "vi"
                                  ? "Xoá cuộc trò chuyện"
                                  : "Delete conversation"
                              }
                            >
                              <Trash2 style={{ width: "13px", height: "13px" }} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Spacer when collapsed or not on chat tab */}
      {(!mobileMode && (isCollapsed || activeTab !== "chat")) && (
        <div className="flex-1" />
      )}

      <SidebarTokenUsage
        isSidebarCollapsed={mobileMode ? false : isCollapsed}
        locale={locale}
      />

      {/* ── Footer: Settings ── */}
      <div
        className={cn(
          "shrink-0 py-[var(--spacing-sm)]",
          px,
        )}
        style={{ display: "none" }}
      >
        <button
          className={cn(
            "flex items-center w-full",
            "rounded-[var(--radius)] transition-colors duration-150",
            isSettingsActive
              ? "bg-sidebar-accent/10 text-sidebar-primary"
              : "text-sidebar-foreground hover:bg-muted",
            isCollapsed
              ? "justify-center px-[var(--spacing-xs)] py-[var(--spacing-xs)]"
              : "gap-[var(--spacing-sm)] px-[var(--spacing-sm)] py-[var(--spacing-xs)]",
          )}
          style={{ minHeight: "36px" }}
          onClick={() => onTabChange?.("settings")}
          aria-current={isSettingsActive ? "page" : undefined}
        >
          <Settings className="size-[18px] shrink-0" />
          {!isCollapsed && (
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "var(--font-size-small)",
                fontWeight: "var(--font-weight-normal)" as unknown as number,
              }}
            >
              {t.nav.settings}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
