import { useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { ChatBubble } from "../chat/ChatBubble";
import { TypingIndicator } from "../chat/TypingIndicator";
import { ScrollArea } from "../ui/scroll-area";
import type { ChatMessage } from "../../hooks/useChat";

export interface MobileChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  streamingContent: string | null;
  children?: React.ReactNode;
}

export function MobileChatMessageList({
  messages,
  isLoading,
  streamingContent,
  children,
}: MobileChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <ScrollArea className="flex-1 min-w-0">
      <div
        className="flex min-w-0 flex-col"
        style={{
          gap: "var(--spacing-md)",
          padding: "var(--spacing-sm)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
            attachment={message.attachment}
          />
        ))}

        <AnimatePresence>
          {streamingContent !== null && streamingContent.length > 0 && (
            <ChatBubble
              key="streaming"
              role="assistant"
              content={streamingContent}
              isStreaming
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLoading && streamingContent !== null && streamingContent.length === 0 && (
            <TypingIndicator />
          )}
        </AnimatePresence>

        {children}

        <div ref={bottomRef} className="h-1" />
      </div>
    </ScrollArea>
  );
}
