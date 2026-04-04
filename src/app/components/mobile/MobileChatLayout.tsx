import type { ReactNode } from "react";
import { MobileBottomNav } from "./MobileBottomNav";

export interface MobileChatLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  showBottomNav?: boolean;
}

/**
 * Mobile full-screen chat layout.
 * - 100dvh for mobile viewport
 * - Flex column with sticky header/footer
 * - BottomNav for thumb navigation
 */
export function MobileChatLayout({
  children,
  activeTab = "chat",
  onTabChange,
  showBottomNav = true,
}: MobileChatLayoutProps) {
  return (
    <div className="flex h-dvh min-w-0 flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {children}
      </div>
      {showBottomNav && (
        <MobileBottomNav activeTab={activeTab} onTabChange={onTabChange} />
      )}
    </div>
  );
}
