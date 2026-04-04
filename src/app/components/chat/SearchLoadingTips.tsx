import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb } from "lucide-react";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";

/**
 * SearchLoadingTips — rotating career tips shown during search/AI loading.
 * Keeps user engaged while waiting for response.
 */
export function SearchLoadingTips({ visible }: { visible: boolean }) {
  const { t } = useI18n();
  const tips = t.search.loadingTips;
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const rotateTip = useCallback(() => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  }, [tips.length]);

  useEffect(() => {
    if (!visible) {
      setCurrentTipIndex(0);
      return;
    }
    const interval = setInterval(rotateTip, 4000);
    return () => clearInterval(interval);
  }, [visible, rotateTip]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "w-full overflow-hidden",
        "bg-secondary/8 border border-secondary/20",
        "rounded-[var(--radius-card)]",
      )}
      style={{
        padding: "var(--spacing-sm) var(--spacing-base)",
        marginBottom: "var(--spacing-sm)",
      }}
    >
      {/* Label row */}
      <div
        className="flex items-center gap-[var(--spacing-xs)]"
        style={{ marginBottom: "var(--spacing-xs)" }}
      >
        <Lightbulb
          className="text-secondary shrink-0"
          style={{ width: "14px", height: "14px" }}
        />
        <span
          className="text-secondary"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "var(--font-size-caption)",
            fontWeight: "var(--font-weight-semibold)" as unknown as number,
            letterSpacing: "0.02em",
          }}
        >
          {t.search.loadingTipLabel}
        </span>

        {/* Dot indicators */}
        <div
          className="flex items-center"
          style={{ marginLeft: "auto", gap: "4px" }}
        >
          {tips.map((_, i) => (
            <span
              key={i}
              className={cn(
                "block rounded-full transition-all duration-300",
                i === currentTipIndex
                  ? "bg-secondary"
                  : "bg-secondary/25",
              )}
              style={{
                width: i === currentTipIndex ? "12px" : "4px",
                height: "4px",
              }}
            />
          ))}
        </div>
      </div>

      {/* Tip text — animated swap */}
      <div style={{ minHeight: "20px" }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentTipIndex}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="text-foreground"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-small)",
              fontWeight: "var(--font-weight-normal)" as unknown as number,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {tips[currentTipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
