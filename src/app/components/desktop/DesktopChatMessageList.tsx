import { useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { ChatBubble } from "../chat/ChatBubble";
import { TypingIndicator } from "../chat/TypingIndicator";
import { ScrollArea } from "../ui/scroll-area";
import { useResponsiveDensity } from "../../hooks/useMediaQuery";
import type { ChatMessage } from "../../hooks/useChat";

export interface DesktopChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  streamingContent: string | null;
  children?: React.ReactNode;
}

export function DesktopChatMessageList({
  messages,
  isLoading,
  streamingContent,
  children,
}: DesktopChatMessageListProps) {
  const density = useResponsiveDensity();
  const bottomRef = useRef<HTMLDivElement>(null);
  const contentWidth =
    density === "expanded" ? "1040px" : density === "compact" ? "860px" : "920px";
  const shellPadding =
    density === "compact" ? "var(--spacing-lg)" : "var(--spacing-xl)";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div
        className="flex flex-col mx-auto w-full"
        style={{
          maxWidth: contentWidth,
          gap: "var(--spacing-lg)",
          paddingLeft: shellPadding,
          paddingRight: shellPadding,
          paddingTop: shellPadding,
          paddingBottom: shellPadding,
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
