import { Outlet, useNavigate, useLocation } from "react-router";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { MobileChatLayout } from "../components/mobile/MobileChatLayout";
import { MobileSidebarSheet } from "../components/mobile/MobileSidebarSheet";
import { DesktopChatLayout } from "../components/desktop/DesktopChatLayout";
import { SidebarProvider } from "../components/ui/sidebar";
import { useChatHistory } from "../lib/chatHistoryContext";

const PATH_TO_TAB: Record<string, string> = {
  "/chat": "chat",
  "/chat/jobs": "jobs",
  "/chat/profile": "profile",
};

const TAB_TO_PATH: Record<string, string> = {
  chat: "/chat",
  jobs: "/chat/jobs",
  profile: "/chat/profile",
};

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const {
    conversations,
    activeConversationId,
    createConversation,
    switchConversation,
    deleteConversation,
  } = useChatHistory();

  const activeTab = PATH_TO_TAB[location.pathname] || "chat";

  const handleTabChange = (tabId: string) => {
    const path = TAB_TO_PATH[tabId];
    if (path && path !== location.pathname) {
      navigate(path);
    }
  };

  const handleNewChat = () => {
    createConversation();
    if (location.pathname !== "/chat") {
      navigate("/chat");
    }
  };

  const handleSwitchConversation = (id: string) => {
    switchConversation(id);
    // Make sure we're on the chat page
    if (location.pathname !== "/chat") {
      navigate("/chat");
    }
  };

  if (isDesktop) {
    return (
      <DesktopChatLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewChat={handleNewChat}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSwitchConversation={handleSwitchConversation}
        onDeleteConversation={deleteConversation}
      >
        <Outlet />
      </DesktopChatLayout>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <MobileSidebarSheet
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewChat={handleNewChat}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSwitchConversation={handleSwitchConversation}
        onDeleteConversation={deleteConversation}
      />
      <MobileChatLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showBottomNav={activeTab !== "chat"}
      >
        <Outlet />
      </MobileChatLayout>
    </SidebarProvider>
  );
}
