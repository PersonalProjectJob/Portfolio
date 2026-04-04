/**
 * ChatHistoryContext — manages conversation list & active conversation.
 *
 * Provides:
 * - `conversations` — sorted list (newest first)
 * - `activeConversationId` — current active ID
 * - `createConversation()` — start new, returns ID
 * - `switchConversation(id)` — change active
 * - `deleteConversation(id)` — remove from storage + list
 * - `refreshConversations()` — re-read from localStorage
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import * as storage from "./chatStorage";
import type { ConversationMeta } from "./chatStorage";

/* ------------------------------------------------------------------ */
/*  Context types                                                       */
/* ------------------------------------------------------------------ */
interface ChatHistoryContextValue {
  conversations: ConversationMeta[];
  activeConversationId: string;
  createConversation: () => string;
  switchConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  refreshConversations: () => void;
}

const ChatHistoryContext =
  createContext<ChatHistoryContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                            */
/* ------------------------------------------------------------------ */
export function ChatHistoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [conversations, setConversations] = useState<
    ConversationMeta[]
  >(() => storage.getConversationList());
  const [activeConversationId, setActiveConversationId] =
    useState<string>(() => {
      // Resume the most recent conversation if any exist, otherwise create new
      const existing = storage.getConversationList();
      if (existing.length > 0) return existing[0].id;
      return storage.createConversation();
    });

  const refreshConversations = useCallback(() => {
    setConversations(storage.getConversationList());
  }, []);

  const createConversation = useCallback(() => {
    const newId = storage.createConversation();
    setActiveConversationId(newId);
    // Don't add to list yet — it'll appear once the first message is saved
    return newId;
  }, []);

  const switchConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      storage.deleteConversation(id);
      setConversations(storage.getConversationList());

      // If deleting the active conversation, create a new one
      if (id === activeConversationId) {
        const remaining = storage.getConversationList();
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          setActiveConversationId(storage.createConversation());
        }
      }
    },
    [activeConversationId],
  );

  const value = useMemo<ChatHistoryContextValue>(
    () => ({
      conversations,
      activeConversationId,
      createConversation,
      switchConversation,
      deleteConversation,
      refreshConversations,
    }),
    [
      conversations,
      activeConversationId,
      createConversation,
      switchConversation,
      deleteConversation,
      refreshConversations,
    ],
  );

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */
export function useChatHistory(): ChatHistoryContextValue {
  const ctx = useContext(ChatHistoryContext);
  if (!ctx) {
    throw new Error(
      "useChatHistory() must be used within <ChatHistoryProvider>",
    );
  }
  return ctx;
}