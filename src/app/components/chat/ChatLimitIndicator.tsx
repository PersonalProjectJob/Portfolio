import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";
import type { ChatLimitInfo } from "../../hooks/useChat";

export interface ChatLimitIndicatorProps {
  limitInfo: ChatLimitInfo;
  onClear?: () => void;
  /** Compact mode for mobile */
  compact?: boolean;
}

/**
 * Shows remaining message count with progressive visual feedback:
 * - Normal (>5 remaining): subtle muted counter
 * - Warning (1-5 remaining): amber/orange tone
 * - Limit reached (0): full block with CTA to reset
 */
export function ChatLimitIndicator({
  limitInfo,
  onClear,
  compact = false,
}: ChatLimitIndicatorProps) {
  const { t } = useI18n();
  const { remaining, used, max, isWarning, isLimitReached } = limitInfo;

  /* ---- Limit reached: full overlay message ---- */
  if (isLimitReached) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center justify-center bg-muted border-t border-border"
        style={{
          paddingTop: "var(--spacing-lg)",
          paddingBottom: "var(--spacing-lg)",
          paddingLeft: "var(--spacing-md)",
          paddingRight: "var(--spacing-md)",
          gap: "var(--spacing-sm)",
        }}
      >
        <div
          className="flex items-center"
          style={{ gap: "var(--spacing-xs)" }}
        >
          <MessageCircle
            className="text-muted-foreground"
            style={{ width: "16px", height: "16px" }}
          />
          <span
            className="text-foreground"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-small)",
              fontWeight: "var(--font-weight-semibold)" as unknown as number,
              lineHeight: 1.4,
            }}
          >
            {t.chatLimit.limitReachedTitle}
          </span>
        </div>

        <p
          className="text-muted-foreground text-center"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "var(--font-size-caption)",
            fontWeight: "var(--font-weight-normal)" as unknown as number,
            lineHeight: 1.5,
            margin: 0,
            maxWidth: "360px",
          }}
        >
          {t.chatLimit.limitReachedDesc}
        </p>

        {onClear && (
          <Button
            variant="outline"
            size={compact ? "lg" : "sm"}
            onClick={onClear}
            className="rounded-[var(--radius-button)]"
            style={{
              gap: "var(--spacing-xs)",
              marginTop: "var(--spacing-2xs)",
            }}
          >
            <RotateCcw style={{ width: "14px", height: "14px" }} />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "var(--font-size-small)",
                fontWeight: "var(--font-weight-medium)" as unknown as number,
              }}
            >
              {t.chatLimit.startNewChat}
            </span>
          </Button>
        )}
      </motion.div>
    );
  }

  /* ---- Don't show counter when no messages sent yet ---- */
  if (used === 0) return null;

  /* ---- Normal / Warning counter ---- */
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center"
        style={{
          paddingTop: "var(--spacing-2xs)",
          paddingBottom: "var(--spacing-2xs)",
          gap: "var(--spacing-2xs)",
        }}
      >
        {/* Dot indicator */}
        <span
          className={cn(
            "block shrink-0 rounded-full",
            isWarning ? "bg-warning" : "bg-border",
          )}
          style={{ width: "5px", height: "5px" }}
        />

        <span
          className={cn(
            isWarning ? "text-warning" : "text-muted-foreground/50",
          )}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: compact ? "11px" : "var(--font-size-caption)",
            fontWeight: isWarning
              ? ("var(--font-weight-medium)" as unknown as number)
              : ("var(--font-weight-normal)" as unknown as number),
            lineHeight: 1.3,
          }}
        >
          {isWarning
            ? t.chatLimit.warningCount
                .replace("{remaining}", String(remaining))
                .replace("{max}", String(max))
            : t.chatLimit.normalCount
                .replace("{used}", String(used))
                .replace("{max}", String(max))}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
