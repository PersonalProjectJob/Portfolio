import { motion } from "motion/react";
import { FileSearch, FileText, GraduationCap, DollarSign, Sparkles } from "lucide-react";
import { cn } from "../ui/utils";
import { useResponsiveDensity } from "../../hooks/useMediaQuery";

const FONT = "'Inter', sans-serif";

const SUGGESTION_ICONS = [
  Sparkles,
  FileSearch,
  FileText,
  GraduationCap,
  DollarSign,
];

export interface DesktopQuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  visible?: boolean;
}

export function DesktopQuickSuggestions({
  suggestions,
  onSelect,
  visible = true,
}: DesktopQuickSuggestionsProps) {
  if (!visible) return null;

  const density = useResponsiveDensity();
  const contentWidth =
    density === "expanded" ? "1040px" : density === "compact" ? "860px" : "920px";
  const shellPadding =
    density === "compact" ? "var(--spacing-lg)" : "var(--spacing-xl)";

  const iconOffset = suggestions.length >= 5 ? 0 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="shrink-0"
    style={{
      paddingLeft: shellPadding,
      paddingRight: shellPadding,
      paddingBottom: "var(--spacing-sm)",
    }}
  >
    <div
      className="flex flex-wrap mx-auto w-full"
      style={{
        maxWidth: contentWidth,
        gap: "var(--spacing-sm)",
      }}
    >
        {suggestions.map((suggestion, index) => {
          const Icon = SUGGESTION_ICONS[index + iconOffset] || Sparkles;
          return (
            <motion.button
              key={suggestion}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: index * 0.07,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => onSelect(suggestion)}
              className={cn(
                "bg-background text-foreground",
                "text-foreground",
                "active:scale-[0.98]",
                "transition-all duration-200",
                "cursor-pointer",
                "flex items-center text-left",
              )}
              style={{
                gap: "var(--spacing-xs)",
                padding: "0.7rem 0.95rem",
                borderRadius: "999px",
                fontFamily: FONT,
                fontSize: "var(--font-size-small)",
                fontWeight: "var(--font-weight-medium)" as unknown as number,
                boxShadow: "0 6px 16px rgba(15, 23, 42, 0.05)",
              }}
              whileHover={{
                boxShadow: "0 10px 22px rgba(15, 23, 42, 0.08)",
                y: -1,
              }}
            >
              <span
                className="flex items-center justify-center shrink-0"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "color-mix(in srgb, var(--secondary) 10%, var(--background))",
                }}
              >
                <Icon
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "var(--secondary)",
                  }}
                />
              </span>
              <span
                style={{
                  lineHeight: 1.45,
                  whiteSpace: "nowrap",
                }}
              >
                {suggestion}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
