import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Gauge, LogIn, LogOut, User } from "lucide-react";
import { Button } from "../ui/button";
import { AuthModal } from "../chat/AuthModal";
import { useAuthenticatedState } from "../../hooks/useAuthenticatedState";
import {
  formatCompactTokenCount,
  getTokenUsageSummary,
} from "../../lib/tokenUsage";
import { clearAuthenticatedSession, useSessionIdentity } from "../../lib/sessionScope";

interface SidebarTokenUsageProps {
  isSidebarCollapsed: boolean;
  locale: string;
}

export function SidebarTokenUsage({
  isSidebarCollapsed,
  locale,
}: SidebarTokenUsageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [, setRefreshTick] = useState(0);
  const isAuthenticated = useAuthenticatedState();
  const identity = useSessionIdentity();

  useEffect(() => {
    if (isSidebarCollapsed) {
      setIsExpanded(false);
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const sync = () => {
      setRefreshTick((tick) => tick + 1);
    };

    window.addEventListener("storage", sync);
    window.addEventListener("careerai-token-usage-updated", sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("careerai-token-usage-updated", sync as EventListener);
    };
  }, []);

  const usage = getTokenUsageSummary();
  const remainingPercent = usage.isUnlimited ? 100 : Math.round(usage.remainingRatio * 100);
  const usageLabel = usage.isUnlimited
    ? locale === "vi"
      ? `${formatCompactTokenCount(usage.usedThisWeek)} / Không giới hạn`
      : `${formatCompactTokenCount(usage.usedThisWeek)} / Unlimited`
    : `${formatCompactTokenCount(usage.usedThisWeek)} / ${formatCompactTokenCount(usage.weeklyLimit)}`;
  const weekdayFormatter = new Intl.DateTimeFormat(
    locale === "vi" ? "vi-VN" : "en-US",
    { weekday: "short" },
  );
  const maxDayTokens = Math.max(...usage.days.map((day) => day.tokens), 1);

  const labels =
    locale === "vi"
      ? {
          title: "Credits",
          expand: "Mở chi tiết",
          collapse: "Thu gọn",
          loginTitle: "Đăng nhập để mở khóa 50k token",
          loginDescription:
            "Đăng ký hoặc đăng nhập trên máy này để nâng quota từ 30k lên 50k.",
          loginButton: "Đăng nhập",
          logoutButton: "Đăng xuất",
          loggedInAs: "Đăng nhập với",
        }
      : {
          title: "Credits",
          expand: "Expand details",
          collapse: "Collapse",
          loginTitle: "Log in to unlock 50k tokens",
          loginDescription:
            "Create an account or sign in on this device to raise the quota from 30k to 50k.",
          loginButton: "Log in",
          logoutButton: "Log out",
          loggedInAs: "Logged in as",
        };

  if (isSidebarCollapsed) {
    return (
      <div
        className="shrink-0 px-[var(--spacing-xs)] pb-[var(--spacing-sm)]"
        title={`${labels.title}: ${remainingPercent}% • ${usageLabel}`}
      >
        <div
          className="flex flex-col items-center"
          style={{
            gap: "var(--spacing-xs)",
            padding: "var(--spacing-sm) var(--spacing-2xs)",
            borderRadius: "14px",
            background: "var(--background)",
            boxShadow: "0 6px 16px rgba(15, 23, 42, 0.05)",
          }}
        >
          <span
            className="text-foreground"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-caption)",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {remainingPercent}%
          </span>
          <div
            aria-hidden
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "999px",
              background: "color-mix(in srgb, var(--border) 60%, transparent)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${remainingPercent}%`,
                height: "100%",
                borderRadius: "999px",
                background: "var(--secondary)",
              }}
            />
          </div>
          <span
            className="text-muted-foreground"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-caption)",
              fontWeight: "var(--font-weight-medium)" as unknown as number,
              lineHeight: 1.2,
            }}
          >
            {usageLabel}
          </span>
        </div>

        {!isAuthenticated && (
          <div className="mt-2 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 rounded-full border-border/70 bg-background text-secondary shadow-sm"
              onClick={() => setShowAuthModal(true)}
              aria-label={labels.loginTitle}
              title={labels.loginTitle}
            >
              <LogIn className="size-3.5" />
            </Button>
          </div>
        )}

        {isAuthenticated && (
          <div className="mt-2 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 rounded-full border-border/70 bg-background text-destructive shadow-sm"
              onClick={() => clearAuthenticatedSession()}
              aria-label={labels.logoutButton}
              title={labels.logoutButton}
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        )}

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          initialMode="login"
          feature="sidebar-login"
        />
      </div>
    );
  }

  return (
    <div className="shrink-0 px-[var(--spacing-sm)] pb-[var(--spacing-sm)]">
      <div
        style={{
          padding: "var(--spacing-sm)",
          borderRadius: "16px",
          background: "var(--background)",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div className="flex items-start justify-between" style={{ gap: "var(--spacing-xs)" }}>
          <div className="min-w-0">
            <div className="flex items-center" style={{ gap: "var(--spacing-xs)" }}>
              <Gauge className="size-4 text-secondary shrink-0" />
              <p
                className="text-foreground"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-small)",
                  fontWeight: 600,
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {labels.title}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
            aria-label={isExpanded ? labels.collapse : labels.expand}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>

        <div style={{ marginTop: "var(--spacing-sm)" }}>
          <span
            className="text-foreground"
            style={{
              display: "block",
              fontFamily: "'Inter', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {remainingPercent}%
          </span>

          <div
            aria-hidden
            style={{
              marginTop: "var(--spacing-xs)",
              height: "8px",
              borderRadius: "999px",
              background: "color-mix(in srgb, var(--border) 60%, transparent)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${remainingPercent}%`,
                height: "100%",
                borderRadius: "999px",
                background:
                  "linear-gradient(90deg, var(--secondary), color-mix(in srgb, var(--secondary) 70%, var(--primary)))",
              }}
            />
          </div>

          <div
            className="flex items-center justify-between"
            style={{ marginTop: "var(--spacing-xs)", gap: "var(--spacing-xs)" }}
          >
            <span
              className="text-muted-foreground"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "var(--font-size-caption)",
                fontWeight: "var(--font-weight-medium)" as unknown as number,
              }}
            >
              {usageLabel}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div style={{ marginTop: "var(--spacing-sm)", display: "grid", gap: "var(--spacing-xs)" }}>
            {usage.days.map((day) => {
              const rowRatio = day.tokens > 0 ? Math.max(day.tokens / maxDayTokens, 0.08) : 0;

              return (
                <div
                  key={day.dateKey}
                  className="grid items-center"
                  style={{
                    gridTemplateColumns: "40px 1fr auto",
                    gap: "var(--spacing-xs)",
                  }}
                >
                  <span
                    className={day.isToday ? "text-foreground" : "text-muted-foreground"}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "var(--font-size-caption)",
                      fontWeight: day.isToday ? 600 : 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {weekdayFormatter.format(day.date)}
                  </span>
                  <div
                    aria-hidden
                    style={{
                      height: "6px",
                      borderRadius: "999px",
                      background: "color-mix(in srgb, var(--border) 56%, transparent)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.round(rowRatio * 100)}%`,
                        height: "100%",
                        borderRadius: "999px",
                        background: day.isToday ? "var(--primary)" : "var(--secondary)",
                        opacity: day.tokens > 0 ? 1 : 0,
                      }}
                    />
                  </div>
                  <span
                    className={day.isToday ? "text-foreground" : "text-muted-foreground"}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "var(--font-size-caption)",
                      fontWeight: day.isToday ? 600 : 500,
                    }}
                  >
                    {formatCompactTokenCount(day.tokens)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {!isAuthenticated && (
          <div
            className="mt-3 rounded-[14px] border border-border/60 bg-background/90 p-3"
            style={{
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div className="flex items-start gap-[var(--spacing-xs)]">
              <div
                className="flex shrink-0 items-center justify-center rounded-full"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "color-mix(in srgb, var(--secondary) 12%, var(--background))",
                }}
              >
                <LogIn className="size-4 text-secondary" />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="text-foreground"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                    fontWeight: "var(--font-weight-semibold)" as unknown as number,
                    lineHeight: 1.35,
                    margin: 0,
                  }}
                >
                  {labels.loginTitle}
                </p>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-caption)",
                    lineHeight: 1.55,
                    margin: 0,
                    marginTop: "var(--spacing-2xs)",
                  }}
                >
                  {labels.loginDescription}
                </p>

                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  className="mt-3 w-full rounded-[var(--radius-button)]"
                  onClick={() => setShowAuthModal(true)}
                  style={{ fontSize: "var(--font-size-small)", gap: "var(--spacing-xs)" }}
                >
                  <LogIn className="size-4" />
                  <span>{labels.loginButton}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {isAuthenticated && identity.userEmail && (
          <div
            className="mt-3 rounded-[14px] border border-border/60 bg-background/90 p-3"
            style={{
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div className="flex items-start gap-[var(--spacing-xs)]">
              <div
                className="flex shrink-0 items-center justify-center rounded-full"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "color-mix(in srgb, var(--secondary) 12%, var(--background))",
                }}
              >
                <User className="size-4 text-secondary" />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="text-foreground"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                    fontWeight: "var(--font-weight-semibold)" as unknown as number,
                    lineHeight: 1.35,
                    margin: 0,
                  }}
                >
                  {labels.loggedInAs}
                </p>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-caption)",
                    lineHeight: 1.55,
                    margin: 0,
                    marginTop: "var(--spacing-2xs)",
                    wordBreak: "break-all",
                  }}
                >
                  {identity.userEmail}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="mt-3 w-full rounded-[var(--radius-button)] text-destructive hover:text-destructive"
                  onClick={() => clearAuthenticatedSession()}
                  style={{ fontSize: 'var(--font-size-small)', gap: 'var(--spacing-xs)' }}
                >
                  <LogOut className="size-4" />
                  <span>{labels.logoutButton}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        initialMode="login"
        feature="sidebar-login"
      />
    </div>
  );
}
