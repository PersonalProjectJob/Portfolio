import { MessageCircle, Briefcase, UserCircle } from "lucide-react";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";

export interface MobileBottomNavProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function MobileBottomNav({
  activeTab = "chat",
  onTabChange,
}: MobileBottomNavProps) {
  const { t } = useI18n();

  const navItems = [
    { id: "chat", label: t.nav.chat, icon: <MessageCircle className="size-5" />, path: "/chat" },
    { id: "jobs", label: t.nav.jobs, icon: <Briefcase className="size-5" />, path: "/chat/jobs" },
    { id: "profile", label: t.nav.profile, icon: <UserCircle className="size-5" />, path: "/chat/profile" },
  ];

  return (
    <nav
      className="sticky bottom-0 z-20 bg-background"
      style={{
        borderTop: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.05), 0 -1px 4px rgba(0,0,0,0.03)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        className="flex items-stretch justify-around px-[var(--spacing-2xs)]"
        style={{ paddingTop: "var(--spacing-2xs)" }}
      >
        {navItems.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 relative",
                "min-h-[var(--touch-target-min)] py-[var(--spacing-xs)]",
                "transition-colors duration-150 bg-transparent border-0 cursor-pointer",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              style={{ gap: "var(--spacing-2xs)" }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "25%",
                    right: "25%",
                    height: "3px",
                    borderRadius: "0 0 3px 3px",
                    background: "linear-gradient(90deg, var(--secondary), var(--primary))",
                  }}
                />
              )}
              {item.icon}
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-caption)",
                  fontWeight: isActive
                    ? ("var(--font-weight-semibold)" as unknown as number)
                    : ("var(--font-weight-normal)" as unknown as number),
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
