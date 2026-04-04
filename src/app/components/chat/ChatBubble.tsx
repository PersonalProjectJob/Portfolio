import { motion } from "motion/react";
import { Bot, User, FileText, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";
import { MarkdownContent } from "./MarkdownContent";
import type { FileAttachment } from "../../hooks/useChat";

const FONT = "'Inter', sans-serif";

export interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  attachment?: FileAttachment;
}

function formatTime(date: Date | undefined, localeCode: string): string {
  if (!date) return "";
  return date.toLocaleTimeString(localeCode, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatBubble({
  role,
  content,
  timestamp,
  isStreaming = false,
  attachment,
}: ChatBubbleProps) {
  const isUser = role === "user";
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex max-w-full group",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
      style={{ gap: "var(--spacing-sm)" }}
    >
      {/* Avatar with gradient ring */}
      <div className="relative shrink-0" style={{ alignSelf: "flex-start" }}>
        {/* Subtle glow behind avatar */}
        {!isUser && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: "50%",
              background: "radial-gradient(circle, color-mix(in srgb, var(--secondary) 20%, transparent), transparent 70%)",
              filter: "blur(6px)",
              width: "36px",
              height: "36px",
              top: "-2px",
              left: "-2px",
            }}
          />
        )}
        <Avatar
          className={cn(
            "size-8 shrink-0 relative",
            isUser ? "bg-primary" : "bg-transparent",
          )}
          style={
            !isUser
              ? {
                  background: "linear-gradient(135deg, var(--secondary), color-mix(in srgb, var(--primary) 60%, var(--secondary)))",
                }
              : undefined
          }
        >
          <AvatarFallback
            className={cn(
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-secondary-foreground",
            )}
            style={
              !isUser
                ? {
                    background: "linear-gradient(135deg, var(--secondary), color-mix(in srgb, var(--primary) 60%, var(--secondary)))",
                  }
                : undefined
            }
          >
            {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Bubble content */}
      <div
        className={cn(
          "flex flex-col",
          isUser ? "items-end max-w-[80%]" : "items-start max-w-[85%]",
        )}
        style={{ gap: "var(--spacing-2xs)" }}
      >
        <div
          className={cn(
            isUser
              ? "text-primary-foreground"
              : "text-foreground",
            !isUser && "w-full",
          )}
          style={{
            padding: `var(--spacing-sm) var(--spacing-md)`,
            borderRadius: isUser
              ? "var(--radius-chat) var(--radius-chat) var(--radius-sm) var(--radius-chat)"
              : "var(--radius-chat) var(--radius-chat) var(--radius-chat) var(--radius-sm)",
            /* Premium background */
            background: isUser
              ? "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 85%, var(--secondary)))"
              : "var(--muted)",
            /* Subtle shadow for depth */
            boxShadow: isUser
              ? "0 2px 12px color-mix(in srgb, var(--primary) 20%, transparent)"
              : "0 1px 4px rgba(0,0,0,0.04), 0 0 0 1px color-mix(in srgb, var(--border) 40%, transparent)",
            minWidth: 0,
          }}
        >
          {isUser ? (
            <p
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-body)",
                fontWeight: "var(--font-weight-normal)" as unknown as number,
                lineHeight: 1.6,
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {content}
              {isStreaming && <StreamingCursor />}
            </p>
          ) : (
            <div>
              <MarkdownContent content={content} isUser={false} />
              {isStreaming && <StreamingCursor />}
            </div>
          )}

          {/* File attachment card */}
          {attachment && (
            <div
              className={cn(
                "flex items-center",
                isUser
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "bg-secondary/10 text-secondary",
              )}
              style={{
                gap: "var(--spacing-xs)",
                borderRadius: "var(--radius)",
                paddingLeft: "var(--spacing-sm)",
                paddingRight: "var(--spacing-sm)",
                paddingTop: "var(--spacing-xs)",
                paddingBottom: "var(--spacing-xs)",
                marginTop: "var(--spacing-xs)",
                fontFamily: FONT,
                fontSize: "var(--font-size-caption)",
                fontWeight: "var(--font-weight-medium)" as unknown as number,
              }}
            >
              <FileText className="size-4 shrink-0" />
              <span className="truncate" style={{ maxWidth: "200px" }}>
                {attachment.name}
              </span>
            </div>
          )}
        </div>

        {/* Footer: timestamp + copy button */}
        {(timestamp || !isStreaming) && (
          <div
            className="flex items-center"
            style={{ gap: "var(--spacing-xs)", minHeight: "20px" }}
          >
            {timestamp && !isStreaming && (
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: "var(--font-size-caption)",
                  fontWeight: "var(--font-weight-normal)" as unknown as number,
                }}
                className="text-muted-foreground/60"
              >
                {formatTime(timestamp, t.locale.timeFormat)}
              </span>
            )}

            {/* Copy button — only for assistant, shown on hover */}
            {!isUser && !isStreaming && content && (
              <button
                onClick={handleCopy}
                className={cn(
                  "chat-bubble-copy-button flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  "bg-transparent border-none cursor-pointer text-muted-foreground/50 hover:text-muted-foreground",
                )}
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "999px",
                  padding: 0,
                }}
                aria-label="Copy"
              >
                {copied ? (
                  <Check style={{ width: "13px", height: "13px", color: "var(--color-success)" }} />
                ) : (
                  <Copy style={{ width: "13px", height: "13px" }} />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Blinking cursor shown during SSE streaming */
function StreamingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
      className="inline-block"
      style={{
        marginLeft: "2px",
        width: "2px",
        height: "1em",
        backgroundColor: "currentColor",
        verticalAlign: "text-bottom",
        borderRadius: "1px",
      }}
    />
  );
}
