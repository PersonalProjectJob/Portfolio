import type { ReactNode } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import type { ConversationMeta } from "../../lib/chatStorage";

export interface DesktopChatLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onNewChat?: () => void;
  conversations?: ConversationMeta[];
  activeConversationId?: string;
  onSwitchConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

/**
 * Desktop layout with sidebar + main content area.
 * - Sidebar for navigation & conversation history
 * - Main area fills remaining width
 */
export function DesktopChatLayout({
  children,
  activeTab = "chat",
  onTabChange,
  onNewChat,
  conversations,
  activeConversationId,
  onSwitchConversation,
  onDeleteConversation,
}: DesktopChatLayoutProps) {
  return (
    <div className="flex h-dvh bg-muted overflow-hidden">
      {/* Left sidebar */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNewChat={onNewChat}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSwitchConversation={onSwitchConversation}
        onDeleteConversation={onDeleteConversation}
      />

      {/* Main content area — flex column ensures header/messages/input stack */}
      <main
        className="flex flex-col flex-1 min-w-0 min-h-0"
        style={{
          background: "var(--background)",
          borderRadius: "var(--radius-card) 0 0 var(--radius-card)",
          boxShadow: "-2px 0 24px rgba(0,0,0,0.06), -1px 0 4px rgba(0,0,0,0.03)",
          marginLeft: "-1px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </main>
    </div>
  );
}