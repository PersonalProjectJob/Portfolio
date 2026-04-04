import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { FileText } from "lucide-react";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { useChat } from "../hooks/useChat";
import { useI18n } from "../lib/i18n";
import { useChatHistory } from "../lib/chatHistoryContext";
import { useAuthenticatedState } from "../hooks/useAuthenticatedState";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import {
  buildSessionHeaders,
  scopeStorageKey,
  useSessionIdentity,
} from "../lib/sessionScope";

import { SearchLoadingTips } from "../components/chat/SearchLoadingTips";
import { ChatCvGuideModal } from "../components/chat/ChatCvGuideModal";
import { MobileChatHeader } from "../components/mobile/MobileChatHeader";
import { MobileChatMessageList } from "../components/mobile/MobileChatMessageList";
import { MobileChatInput } from "../components/mobile/MobileChatInput";
import { QuickSuggestions } from "../components/chat/QuickSuggestions";
import { DesktopChatHeader } from "../components/desktop/DesktopChatHeader";
import type { AIModel } from "../components/desktop/DesktopChatHeader";
import { DesktopChatMessageList } from "../components/desktop/DesktopChatMessageList";
import { DesktopChatInput } from "../components/desktop/DesktopChatInput";
import { DesktopQuickSuggestions } from "../components/desktop/DesktopQuickSuggestions";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d`;
const PROFILE_URL = `${BASE}/cv-profile`;
const CV_GUIDE_SEEN_KEY = "careerai-chat-cv-guide-seen";

interface CVProfileMini {
  id: string;
  full_name: string;
  job_title: string;
}

export function ChatPage() {
  const isDesktop = useIsDesktop();
  const isMobile = !isDesktop;
  const { t, locale } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const autoSentRef = useRef(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthenticatedState();
  const identity = useSessionIdentity();
  const cvProfileCacheKey = `careerai-cv-profile-cache:${identity.scopeKey}`;
  const cvGuideSeenStorageKey = scopeStorageKey(CV_GUIDE_SEEN_KEY, identity.scopeKey);

  const { activeConversationId, refreshConversations, createConversation } =
    useChatHistory();

  const [selectedModel, setSelectedModel] = useState<AIModel>("deepseek-chat");
  const [latestProfile, setLatestProfile] = useState<CVProfileMini | null>(null);
  const [hasResolvedProfile, setHasResolvedProfile] = useState(false);
  const [showCvGuide, setShowCvGuide] = useState(false);

  const activeModel: AIModel =
    isAuthenticated && selectedModel === "qwen-plus"
      ? "qwen-plus"
      : "deepseek-chat";

  useEffect(() => {
    setLatestProfile(null);
    setHasResolvedProfile(false);
    setShowCvGuide(false);
  }, [identity.scopeKey]);

  useEffect(() => {
    let cancelled = false;

    // Check localStorage cache first to avoid unnecessary API calls
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const loadLatestProfile = async () => {
      try {
        // Try cache first
        const cachedData = localStorage.getItem(cvProfileCacheKey);
        if (cachedData) {
          const { profile, timestamp } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > CACHE_DURATION;
          
          if (!isExpired && profile) {
            setLatestProfile(profile);
            setHasResolvedProfile(true);
            return; // Skip API call
          }
        }

        // Fetch from API only if cache miss or expired
        const response = await fetch(PROFILE_URL, {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            ...buildSessionHeaders(identity),
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        if (cancelled) return;

        if (data?.profile) {
          const p = {
            id: data.profile.id,
            full_name: data.profile.fullName || data.profile.full_name || "",
            job_title: data.profile.jobTitle || data.profile.job_title || "",
          };
          setLatestProfile(p);
          
          // Cache the result
          try {
            localStorage.setItem(cvProfileCacheKey, JSON.stringify({
              profile: p,
              timestamp: Date.now(),
            }));
          } catch (cacheErr) {
            // Ignore cache errors
          }
        } else {
          setLatestProfile(null);
          // Clear cache if no profile
          localStorage.removeItem(cvProfileCacheKey);
        }
      } catch (err) {
        if (!cancelled) {
          // Silently fail
        }
      } finally {
        if (!cancelled) {
          setHasResolvedProfile(true);
        }
      }
    };

    void loadLatestProfile();

    return () => {
      cancelled = true;
    };
  }, [cvProfileCacheKey, identity.scopeKey]);

  const quickSuggestions = useMemo(() => {
    const base = [
      t.suggestions.analyzeJd,
      t.suggestions.cvTips,
      t.suggestions.interviewPrep,
      t.suggestions.salaryReference,
    ];

    if (latestProfile) {
      return [
        t.suggestions.jobMatches,
        t.suggestions.analyzeJd,
        t.suggestions.cvTips,
        t.suggestions.interviewPrep,
        t.suggestions.salaryReference,
      ];
    }

    return base;
  }, [t, latestProfile, locale]);

  const {
    messages,
    isLoading,
    streamingContent,
    sendMessage,
    clearMessages,
    limitInfo,
    cleanupFiles,
    trackUploadedFile,
  } = useChat(
    t.welcome.content,
    activeConversationId,
    refreshConversations,
    latestProfile?.id,
    activeModel,
    locale,
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupFiles();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      cleanupFiles();
    };
  }, [cleanupFiles]);

  const searchQuery = searchParams.get("q");

  useEffect(() => {
    if (searchQuery && !autoSentRef.current) {
      autoSentRef.current = true;
      const timer = setTimeout(() => {
        sendMessage(searchQuery);
        setSearchParams({}, { replace: true });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [searchQuery, sendMessage, setSearchParams]);

  const markCvGuideSeen = useCallback(() => {
    try {
      localStorage.setItem(cvGuideSeenStorageKey, "true");
    } catch {
      /* ignore */
    }
  }, [cvGuideSeenStorageKey]);

  useEffect(() => {
    if (!hasResolvedProfile) return;

    if (latestProfile) {
      markCvGuideSeen();
      setShowCvGuide(false);
      return;
    }

    if (searchQuery || messages.length > 1) {
      setShowCvGuide(false);
      return;
    }

    try {
      setShowCvGuide(localStorage.getItem(cvGuideSeenStorageKey) !== "true");
    } catch {
      setShowCvGuide(true);
    }
  }, [
    cvGuideSeenStorageKey,
    hasResolvedProfile,
    latestProfile,
    markCvGuideSeen,
    messages.length,
    searchQuery,
  ]);

  const showSuggestions =
    messages.length <= 1 &&
    !isLoading &&
    !searchQuery &&
    !limitInfo.isLimitReached;
  const showLoadingTips = isLoading && messages.length >= 2;

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      if (suggestion === t.suggestions.jobMatches) {
        navigate("/chat/jobs");
        return;
      }
      sendMessage(suggestion);
    },
    [navigate, sendMessage, t.suggestions.jobMatches],
  );

  const handleNewChat = useCallback(() => {
    createConversation();
    clearMessages();
  }, [createConversation, clearMessages]);

  const handleNavigateToProfile = useCallback(() => {
    navigate("/chat/profile");
  }, [navigate]);

  const handleUnlinkCv = useCallback(() => {
    setLatestProfile(null);
    localStorage.removeItem(cvProfileCacheKey);
  }, [cvProfileCacheKey]);

  const handleCvGuideOpenChange = useCallback(
    (open: boolean) => {
      setShowCvGuide(open);
      if (!open) {
        markCvGuideSeen();
      }
    },
    [markCvGuideSeen],
  );

  const handleStartCvUpload = useCallback(() => {
    markCvGuideSeen();
    setShowCvGuide(false);
    navigate("/chat/profile");
  }, [markCvGuideSeen, navigate]);

  const cvBadge = latestProfile ? (
    <div
      className="inline-flex min-w-0 max-w-full items-center text-secondary"
      style={{
        gap: "var(--spacing-xs)",
        padding: "0.4rem 0.8rem",
        borderRadius: "999px",
        background: "color-mix(in srgb, var(--secondary) 8%, var(--background))",
        fontFamily: "'Inter', sans-serif",
        fontSize: "var(--font-size-caption)",
        fontWeight: "var(--font-weight-medium)" as unknown as number,
      }}
    >
      <FileText style={{ width: "14px", height: "14px", flexShrink: 0 }} />
      <span
        className="truncate"
        style={{ maxWidth: isMobile ? "min(220px, calc(100vw - 11rem))" : "180px" }}
      >
        {locale === "vi"
          ? "CV \u0111\u00e3 k\u1ebft n\u1ed1i"
          : "CV connected"}
        {latestProfile.full_name ? `: ${latestProfile.full_name}` : ""}
      </span>
    </div>
  ) : null;

  if (isDesktop) {
    return (
      <div className="min-h-dvh bg-background flex flex-col">
        <ChatCvGuideModal
          open={showCvGuide}
          onOpenChange={handleCvGuideOpenChange}
          onStartUpload={handleStartCvUpload}
        />
        <div
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--secondary) 4%, var(--background)) 0%, var(--background) 22%)",
          }}
        >
          <DesktopChatHeader
            onClear={handleNewChat}
            cvBadge={cvBadge}
            cvProfile={
              latestProfile
                ? { id: latestProfile.id, fullName: latestProfile.full_name }
                : null
            }
            onNavigateToProfile={handleNavigateToProfile}
            onUnlinkCv={handleUnlinkCv}
            selectedModel={activeModel}
            isAuthenticated={isAuthenticated}
            onModelChange={setSelectedModel}
          />

          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <DesktopChatMessageList
              messages={messages}
              isLoading={isLoading}
              streamingContent={streamingContent}
            >
              <SearchLoadingTips visible={showLoadingTips} />
            </DesktopChatMessageList>
            <DesktopQuickSuggestions
              suggestions={quickSuggestions}
              onSelect={handleSuggestionSelect}
              visible={showSuggestions}
            />
            <DesktopChatInput
              onSend={sendMessage}
              disabled={isLoading}
              limitInfo={limitInfo}
              onClear={handleNewChat}
              onFileUploaded={trackUploadedFile}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <ChatCvGuideModal
        open={showCvGuide}
        onOpenChange={handleCvGuideOpenChange}
        onStartUpload={handleStartCvUpload}
      />
      <div
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--secondary) 4%, var(--background)) 0%, var(--background) 24%)",
        }}
      >
        <MobileChatHeader
          onClear={handleNewChat}
          cvBadge={cvBadge}
          cvProfile={
            latestProfile
              ? { id: latestProfile.id, fullName: latestProfile.full_name }
              : null
          }
          onNavigateToProfile={handleNavigateToProfile}
          onUnlinkCv={handleUnlinkCv}
          selectedModel={activeModel}
          isAuthenticated={isAuthenticated}
          onModelChange={setSelectedModel}
        />
        <MobileChatMessageList
          messages={messages}
          isLoading={isLoading}
          streamingContent={streamingContent}
        >
          <SearchLoadingTips visible={showLoadingTips} />
        </MobileChatMessageList>
        <QuickSuggestions
          suggestions={quickSuggestions}
          onSelect={handleSuggestionSelect}
          visible={showSuggestions}
        />
        <MobileChatInput
          onSend={sendMessage}
          disabled={isLoading}
          limitInfo={limitInfo}
          onClear={handleNewChat}
          onFileUploaded={trackUploadedFile}
        />
      </div>
    </div>
  );
}
