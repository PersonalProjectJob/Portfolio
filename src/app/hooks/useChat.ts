import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import * as chatStorage from "../lib/chatStorage";
import {
  estimateTokenCount,
  getTokenUsageSummary,
  recordTokenUsage,
  recordTokenUsageFromUsage,
} from "../lib/tokenUsage";
import { buildSessionHeaders, useSessionIdentity } from "../lib/sessionScope";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
export interface FileAttachment {
  name: string;
  url: string;
  publicId: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachment?: FileAttachment;
  /** Backend state code — used for rendering soft CTAs */
  aiState?: string;
}

/** Limit configuration for demo mode */
export const CHAT_LIMITS = {
  /** Maximum user messages per conversation */
  maxMessages: 20,
  /** Warning threshold — show warning when remaining <= this */
  warningThreshold: 5,
  /** Max recent messages sent to API as context (sliding window) */
  contextWindow: 10,
} as const;

export interface ChatLimitInfo {
  /** Number of user messages sent in this conversation */
  used: number;
  /** Maximum allowed user messages */
  max: number;
  /** Remaining messages */
  remaining: number;
  /** True when remaining <= warningThreshold */
  isWarning: boolean;
  /** True when limit has been reached */
  isLimitReached: boolean;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  streamingContent: string | null;
  sendMessage: (content: string, attachment?: FileAttachment) => Promise<void>;
  clearMessages: () => void;
  /** Info about current usage limits */
  limitInfo: ChatLimitInfo;
  /** Silently delete all tracked Cloudinary files */
  cleanupFiles: () => void;
  /** Track a newly uploaded file's publicId for later cleanup */
  trackUploadedFile: (publicId: string) => void;
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const CHAT_API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d/chat`;
const DELETE_CV_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d/delete-cv`;

/* ------------------------------------------------------------------ */
/*  Soft UX: Map backend states to user-friendly messages               */
/*  IMPORTANT: Never expose internal limits, thresholds, or rule names  */
/* ------------------------------------------------------------------ */

/**
 * Returns a soft, product-friendly message for each backend state.
 * The backend `message` field is also product-friendly (Vietnamese),
 * but we keep a fallback here for robustness.
 */
function softMessageForState(
  state: string | undefined,
  backendMessage: string | undefined,
): string {
  // Prefer the backend's message — it's already sanitized
  if (backendMessage && backendMessage.length > 10) {
    return backendMessage;
  }

  switch (state) {
    case "GUEST_LIMIT_REACHED":
      return "Bạn đã dùng hết lượt trải nghiệm AI miễn phí. Tạo tài khoản để tiếp tục sử dụng nhé! ✨";
    case "AUTH_REQUIRED":
      return "Đăng nhập hoặc tạo tài khoản để sử dụng tính năng AI nhé!";
    case "UNVERIFIED_LIMIT_REACHED":
      return "Bạn đã hết lượt AI cho hôm nay. Xác minh email để được tăng giới hạn sử dụng! 📧";
    case "VERIFICATION_REQUIRED":
      return "Xác minh email để mở khóa thêm lượt sử dụng AI. Kiểm tra hộp thư đến nhé! 📬";
    case "DAILY_LIMIT_REACHED":
      return "Bạn đã sử dụng hết giới hạn AI trong ngày. Quay lại vào ngày mai nhé! 🌟";
    case "RATE_LIMITED":
      return "Bạn đang gửi tin nhắn khá nhanh. Đợi một chút rồi thử lại nhé! ⏳";
    default:
      return "Xin lỗi, tính năng AI tạm thời không khả dụng. Vui lòng thử lại sau!";
  }
}

/** Artificial thinking delay — makes limit messages feel more natural */
function softDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */
export function useChat(
  welcomeContent: string,
  /** Conversation ID for localStorage persistence */
  conversationId?: string,
  /** Callback to refresh the conversation list after save */
  onConversationSaved?: () => void,
  /** Latest CV profile ID from SQL — auto-injected into chat context */
  cvProfileId?: string,
  /** AI model to use for chat (qwen-turbo or qwen-plus when unlocked) */
  model?: string,
  /** UI locale — server uses this for job-suggestion blocks when user asks about jobs */
  locale?: "vi" | "en",
): UseChatReturn {
  const identity = useSessionIdentity();
  const welcomeMsg: ChatMessage = {
    id: "msg_welcome",
    role: "assistant",
    content: welcomeContent,
    timestamp: new Date(),
  };

  /* ---------------------------------------------------------------- */
  /*  Load initial messages from storage                               */
  /* ---------------------------------------------------------------- */
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!conversationId) return [welcomeMsg];
    const stored = chatStorage.getMessages(conversationId);
    if (stored.length === 0) return [welcomeMsg];
    // Prepend welcome message, then load stored messages
    return [
      welcomeMsg,
      ...stored.map((m) => ({
        id: generateId(),
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        attachment: m.attachment,
      })),
    ];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /** Track the active conversation ID so save always targets the right one */
  const convIdRef = useRef(conversationId);
  convIdRef.current = conversationId;

  /** Track the active CV profile ID */
  const cvProfileIdRef = useRef(cvProfileId);
  cvProfileIdRef.current = cvProfileId;

  /* ---------------------------------------------------------------- */
  /*  Reload messages when conversationId changes                      */
  /* ---------------------------------------------------------------- */
  const prevConvIdRef = useRef(conversationId);
  useEffect(() => {
    if (conversationId === prevConvIdRef.current) return;
    prevConvIdRef.current = conversationId;

    // Abort any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setStreamingContent(null);

    if (!conversationId) {
      setMessages([welcomeMsg]);
      return;
    }

    const stored = chatStorage.getMessages(conversationId);
    if (stored.length === 0) {
      setMessages([welcomeMsg]);
    } else {
      setMessages([
        welcomeMsg,
        ...stored.map((m) => ({
          id: generateId(),
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: m.timestamp,
          attachment: m.attachment,
        })),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  /* ---------------------------------------------------------------- */
  /*  Persist helper (saves current messages to localStorage)          */
  /* ---------------------------------------------------------------- */
  const persistMessages = useCallback(
    (msgs: ChatMessage[]) => {
      const cid = convIdRef.current;
      if (!cid) return;

      // Convert ChatMessage[] to StoredMessage[] (skip welcome)
      const toStore = msgs
        .filter((m) => m.id !== "msg_welcome")
        .map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          attachment: m.attachment,
        }));

      if (toStore.length === 0) return;

      chatStorage.saveMessages(cid, toStore);
      onConversationSaved?.();
    },
    [onConversationSaved],
  );

  /* ------------------------------------------------------------------ */
  /*  Cloudinary file tracking for silent cleanup                       */
  /* ------------------------------------------------------------------ */
  const uploadedFileIdsRef = useRef<string[]>([]);

  const trackUploadedFile = useCallback((publicId: string) => {
    if (!uploadedFileIdsRef.current.includes(publicId)) {
      uploadedFileIdsRef.current.push(publicId);
    }
  }, []);

  const cleanupFiles = useCallback(() => {
    const publicIds = [...uploadedFileIdsRef.current];
    if (publicIds.length === 0) return;

    // Fire and forget — silent removal
    fetch(DELETE_CV_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
        ...buildSessionHeaders(identity),
      },
      body: JSON.stringify({ publicIds }),
      keepalive: true, // Survive page unload
    }).catch(() => {
      // Silently ignore errors
    });

    uploadedFileIdsRef.current = [];
  }, [identity]);

  /* ------------------------------------------------------------------ */
  /*  Limit tracking                                                     */
  /* ------------------------------------------------------------------ */
  const limitInfo = useMemo<ChatLimitInfo>(() => {
    const used = messages.filter((m) => m.role === "user").length;
    const remaining = Math.max(0, CHAT_LIMITS.maxMessages - used);
    return {
      used,
      max: CHAT_LIMITS.maxMessages,
      remaining,
      isWarning: remaining > 0 && remaining <= CHAT_LIMITS.warningThreshold,
      isLimitReached: remaining <= 0,
    };
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string, attachment?: FileAttachment) => {
      if (!content.trim() || isLoading) return;

      // Enforce conversation-level limit
      if (limitInfo.isLimitReached) return;

      // Weekly token budget (client-side hint — server is source of truth)
      const tokenSummary = getTokenUsageSummary();
      if (!tokenSummary.isUnlimited && tokenSummary.remaining <= 0) return;

      // Cancel any in-progress request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Track uploaded file for cleanup
      if (attachment) {
        trackUploadedFile(attachment.publicId);
      }

      // Add user message
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        attachment,
      };

      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setIsLoading(true);
      setStreamingContent("");

      // Persist immediately with user message (so it's not lost on crash)
      persistMessages(newMessages);

      try {
        // Build conversation history for the API (exclude welcome message)
        // Apply sliding context window to control token costs
        const allApiMessages = [...messages, userMsg]
          .filter((m) => m.id !== "msg_welcome")
          .map((m) => {
            let apiContent = m.content;
            // Append file info so the AI knows about the attachment
            if (m.attachment) {
              apiContent += `\n\n[File attached: ${m.attachment.name}]`;
            }
            return { role: m.role, content: apiContent };
          });

        // Keep only the last N messages for context
        const apiMessages = allApiMessages.slice(
          -CHAT_LIMITS.contextWindow,
        );
        const estimatedPromptTokens = apiMessages.reduce(
          (sum, msg) => sum + estimateTokenCount(msg.content),
          0,
        );
        let exactUsageRecorded = false;

        // If the current message has a file attachment, send it to the server
        // so it can extract text and inject into AI context
        const attachmentPayload = attachment
          ? {
              url: attachment.url,
              name: attachment.name,
              isImage: /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(attachment.name),
            }
          : undefined;

        const response = await fetch(CHAT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
            ...buildSessionHeaders(identity),
          },
          body: JSON.stringify({
            messages: apiMessages,
            ...(attachmentPayload ? { attachment: attachmentPayload } : {}),
            ...(cvProfileIdRef.current ? { cvProfileId: cvProfileIdRef.current } : {}),
            ...(model ? { model } : {}),
            ...(locale ? { locale } : {}),
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as {
            state?: string;
            message?: string;
            error?: string;
            code?: string;
          };
          console.error("[useChat] API state:", response.status, errorData);

          // ── Soft UX: Show "AI is thinking" briefly, then friendly message ──
          // This hides the fact that quota was checked and denied.
          const backendState = errorData.state || errorData.code;
          const softMsg = softMessageForState(backendState, errorData.message);

          // Artificial delay to simulate AI processing (makes it feel natural)
          await softDelay(800 + Math.random() * 700);

          if (abortController.signal.aborted) return;

          const limitMsg: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content: softMsg,
            timestamp: new Date(),
            aiState: backendState,
          };
          const limitMessages = [...newMessages, limitMsg];
          setMessages(limitMessages);
          setStreamingContent(null);
          setIsLoading(false);
          persistMessages(limitMessages);
          return;
        }

        // Read the SSE stream
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulated += parsed.content;
                if (!abortController.signal.aborted) {
                  setStreamingContent(accumulated);
                }
              }
              if (!exactUsageRecorded && parsed.usage) {
                const recorded = recordTokenUsageFromUsage(
                  parsed.usage,
                  new Date(),
                );
                if (recorded != null) {
                  exactUsageRecorded = true;
                }
              }
              if (parsed.error) {
                console.error("[useChat] Stream error:", parsed.error);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }

        // Finalize the assistant message
        if (!abortController.signal.aborted) {
          if (!exactUsageRecorded) {
            recordTokenUsage(
              estimatedPromptTokens + estimateTokenCount(accumulated),
              new Date(),
            );
          }
        }

        if (!abortController.signal.aborted && accumulated) {
          const assistantMsg: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content: accumulated,
            timestamp: new Date(),
          };
          const finalMessages = [...newMessages, assistantMsg];
          setMessages(finalMessages);
          setStreamingContent(null);

          // Persist with complete response
          persistMessages(finalMessages);
        }
      } catch (err) {
        if (abortController.signal.aborted) return;

        console.error("[useChat] Error:", err);
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content:
            "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại nhé!",
          timestamp: new Date(),
        };
        const errorMessages = [...newMessages, errorMsg];
        setMessages(errorMessages);
        setStreamingContent(null);
        persistMessages(errorMessages);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [
      isLoading,
      messages,
      limitInfo.isLimitReached,
      trackUploadedFile,
      persistMessages,
      model,
      locale,
      identity.scopeKey,
      identity.mode,
    ],
  );

  const clearMessages = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Silently delete all uploaded files from Cloudinary
    cleanupFiles();

    setMessages([
      {
        id: "msg_welcome",
        role: "assistant",
        content: welcomeContent,
        timestamp: new Date(),
      },
    ]);
    setStreamingContent(null);
    setIsLoading(false);

    // Note: We don't delete from storage here — the conversation stays in history.
    // The user can start a new conversation via "New Chat" button.
  }, [welcomeContent, cleanupFiles]);

  return {
    messages,
    isLoading,
    streamingContent,
    sendMessage,
    clearMessages,
    limitInfo,
    cleanupFiles,
    trackUploadedFile,
  };
}
