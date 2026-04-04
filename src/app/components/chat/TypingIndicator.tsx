import { motion } from "motion/react";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start"
      style={{ gap: "var(--spacing-sm)" }}
    >
      <Avatar
        className="size-8 shrink-0"
        style={{
          background: "linear-gradient(135deg, var(--secondary), color-mix(in srgb, var(--primary) 60%, var(--secondary)))",
        }}
      >
        <AvatarFallback
          style={{
            background: "linear-gradient(135deg, var(--secondary), color-mix(in srgb, var(--primary) 60%, var(--secondary)))",
            color: "var(--secondary-foreground)",
          }}
        >
          <Bot className="size-4" />
        </AvatarFallback>
      </Avatar>

      <div
        className="bg-muted flex items-center"
        style={{
          borderRadius: "var(--radius-chat) var(--radius-chat) var(--radius-chat) var(--radius-sm)",
          padding: "var(--spacing-sm) var(--spacing-md)",
          gap: "6px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 0 0 1px color-mix(in srgb, var(--border) 40%, transparent)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block rounded-full"
            style={{
              width: "7px",
              height: "7px",
              background: i === 1
                ? "var(--secondary)"
                : "color-mix(in srgb, var(--secondary) 50%, var(--border))",
            }}
            animate={{
              y: [0, -5, 0],
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
