import { motion } from "motion/react";
import { Bot } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { MarkdownContent } from "./MarkdownContent";

const FONT = "'Inter', sans-serif";

export function ChatWelcome() {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center flex-1 min-h-0"
      style={{
        paddingLeft: "var(--spacing-xl)",
        paddingRight: "var(--spacing-xl)",
        paddingTop: "var(--spacing-xl)",
        paddingBottom: "var(--spacing-xl)",
      }}
    >
      <div
        className="w-full"
        style={{
          maxWidth: "920px",
          borderRadius: "24px",
          background: "var(--background)",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.05)",
          padding: "var(--spacing-xl)",
        }}
      >
        <div className="flex items-start" style={{ gap: "var(--spacing-md)" }}>
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, var(--secondary), color-mix(in srgb, var(--primary) 75%, var(--secondary)))",
              color: "var(--primary-foreground)",
            }}
          >
            <Bot className="size-7" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              className="text-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "clamp(2rem, 1.8rem + 0.6vw, 2.6rem)",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              {t.common.aiName}
            </h2>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-body)",
                fontWeight: "var(--font-weight-normal)" as unknown as number,
                lineHeight: 1.6,
                margin: "var(--spacing-xs) 0 0 0",
              }}
            >
              {t.chat.onlineStatus}
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: "var(--spacing-lg)",
            paddingTop: "var(--spacing-md)",
          }}
        >
          <MarkdownContent content={t.welcome.content} />
        </div>
      </div>
    </motion.div>
  );
}
