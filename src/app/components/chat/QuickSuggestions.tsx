import { motion } from "motion/react";
import { FileSearch, FileText, GraduationCap, DollarSign, Sparkles } from "lucide-react";
import { cn } from "../ui/utils";

const FONT = "'Inter', sans-serif";

const SUGGESTION_ICONS = [
  Sparkles,      // CV review (when present)
  FileSearch,    // Analyze JD
  FileText,      // CV Tips
  GraduationCap, // Interview Prep
  DollarSign,    // Salary
];

export interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  visible?: boolean;
}

export function QuickSuggestions({
  suggestions,
  onSelect,
  visible = true,
}: QuickSuggestionsProps) {
  if (!visible) return null;

  // If 5 suggestions (CV review added), use all icons; otherwise skip first
  const iconOffset = suggestions.length >= 5 ? 0 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="flex w-full min-w-0 flex-wrap"
      style={{
        gap: "var(--spacing-xs)",
        paddingLeft: "var(--spacing-xs)",
        paddingRight: "var(--spacing-xs)",
        paddingBottom: "var(--spacing-sm)",
        boxSizing: "border-box",
      }}
    >
      {suggestions.map((suggestion, index) => {
        const Icon = SUGGESTION_ICONS[index + iconOffset] || Sparkles;
        return (
          <motion.button
            key={suggestion}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: index * 0.06,
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={() => onSelect(suggestion)}
            className={cn(
              "bg-background border border-border/60",
              "text-foreground",
              "hover:border-secondary/40",
              "active:scale-[0.96]",
              "transition-all duration-200",
              "flex max-w-full min-w-0 items-center",
              "min-h-[var(--touch-target-min)]",
              "cursor-pointer",
            )}
            style={{
              gap: "var(--spacing-xs)",
              paddingLeft: "var(--spacing-sm)",
              paddingRight: "var(--spacing-base)",
              paddingTop: "var(--spacing-xs)",
              paddingBottom: "var(--spacing-xs)",
              borderRadius: "var(--radius-chat)",
              fontFamily: FONT,
              fontSize: "var(--font-size-small)",
              fontWeight: "var(--font-weight-medium)" as unknown as number,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              maxWidth: "100%",
            }}
            whileHover={{
              boxShadow: "0 2px 12px color-mix(in srgb, var(--secondary) 15%, transparent)",
            }}
          >
            <span
              className="flex items-center justify-center shrink-0"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius)",
                background: "color-mix(in srgb, var(--secondary) 8%, var(--background))",
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
            <span style={{ minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word" }}>
              {suggestion}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
