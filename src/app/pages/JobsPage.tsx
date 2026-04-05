import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useRef } from "react";
import {
  BarChart3,
  Briefcase,
  ExternalLink,
  MapPin,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Clock3,
} from "lucide-react";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { useI18n } from "../lib/i18n";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Button } from "../components/ui/button";
import { MobileSidebarButton } from "../components/mobile/MobileSidebarButton";
import { Badge } from "../components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { MarkdownContent } from "../components/chat/MarkdownContent";
import { recordTokenUsageFromUsage } from "../lib/tokenUsage";
import { buildSessionHeaders, scopeStorageKey, useSessionIdentity } from "../lib/sessionScope";

const FONT = "'Inter', sans-serif";
const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d`;
const PROFILE_URL = `${BASE}/cv-profile`;
const JOB_RECOMMENDATIONS_URL = `${BASE}/job-recommendations`;
const JOB_RECOMMENDATIONS_CACHE_KEY_PREFIX = "careerai-job-recommendations-v8";
const PAGE_BACKGROUND =
  "linear-gradient(180deg, color-mix(in srgb, var(--secondary) 4%, var(--background)) 0%, var(--background) 24%)";
const CARD_SURFACE_STYLE = {
  background: "var(--background)",
  boxShadow: "0 18px 40px color-mix(in srgb, var(--foreground) 10%, transparent)",
};
const CARD_SURFACE_ACCENT_STYLE = {
  background: "var(--background)",
  boxShadow: "0 22px 52px color-mix(in srgb, var(--secondary) 16%, transparent)",
};
const CARD_INSET_STYLE = {
  background: "color-mix(in srgb, var(--secondary) 5%, var(--background))",
  borderRadius: "18px",
  boxShadow: "none",
};
const FEATURED_MATCH_STYLE = {
  background:
    "radial-gradient(circle at top left, color-mix(in srgb, #facc15 28%, transparent) 0%, transparent 34%), radial-gradient(circle at bottom right, color-mix(in srgb, #f59e0b 18%, transparent) 0%, transparent 38%), linear-gradient(135deg, color-mix(in srgb, var(--background) 80%, #fef3c7 20%) 0%, color-mix(in srgb, var(--background) 92%, #fde68a 8%) 100%)",
  boxShadow:
    "0 14px 28px color-mix(in srgb, var(--foreground) 8%, transparent), inset 0 1px 0 color-mix(in srgb, var(--background) 60%, transparent)",
};
const FEATURED_SCORE_STYLE = {
  background:
    "linear-gradient(180deg, color-mix(in srgb, var(--background) 72%, #facc15 18%) 0%, color-mix(in srgb, var(--background) 88%, #fde68a 12%) 100%)",
  boxShadow:
    "0 16px 30px color-mix(in srgb, #f59e0b 16%, transparent), inset 0 1px 0 color-mix(in srgb, var(--background) 55%, transparent)",
};
const BANNER_GOLD_PILL_STYLE = {
  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  color: "#fffdf5",
  boxShadow: "0 8px 18px color-mix(in srgb, #d97706 18%, transparent)",
};
const COMMON_JOB_TOOLTIP_CONTENT_CLASS = "max-w-[200px] text-left leading-snug";
const COMMON_JOB_TOOLTIP_SIDE_OFFSET = 0;
const CARD_TITLE_STYLE = {
  fontFamily: FONT,
  fontSize: "clamp(1rem, 2.8vw, 1.125rem)",
  fontWeight: "var(--font-weight-semibold)" as unknown as number,
  lineHeight: 1.25,
};
const CARD_DESCRIPTION_STYLE = {
  fontFamily: FONT,
  fontSize: "clamp(0.875rem, 2.2vw, 0.9375rem)",
  lineHeight: 1.55,
};
const CARD_TEXT_STYLE = {
  fontFamily: FONT,
  fontSize: "clamp(0.875rem, 2.2vw, 0.9375rem)",
  lineHeight: 1.55,
  margin: 0,
};

function getNoRecommendationCopy(locale: "vi" | "en"): { message: string; actionLabel: string } {
  if (locale === "vi") {
    return {
      message: "Đã hiển thị hết các job phù hợp với bạn",
      actionLabel: "Xem lại",
    };
  }

  return {
    message: "All matching jobs have been shown",
    actionLabel: "View history",
  };
}

interface LoadingTipSlide {
  eyebrow: string;
  title: string;
  items: string[];
}

const JOB_LOADING_TIPS_VI: LoadingTipSlide[] = [
  {
    eyebrow: "CV",
    title: "Khớp từ khóa với JD",
    items: [
      "Ưu tiên số liệu cụ thể: % tăng trưởng, số dự án, số năm kinh nghiệm.",
      "Đưa đúng keyword từ job_summary vào summary, skills và experience.",
      "Mỗi bullet nên bắt đầu bằng động từ mạnh: xây dựng, tối ưu, dẫn dắt, cải thiện.",
    ],
  },
  {
    eyebrow: "Kinh nghiệm",
    title: "Làm rõ chiều sâu thực chiến",
    items: [
      "Nêu scope dự án, vai trò của bạn và tác động đo lường được.",
      "Nếu job yêu cầu kinh nghiệm, hãy chỉ rõ bạn đã làm bao lâu và ở đâu.",
      "Dùng 1-2 ví dụ thực tế để chứng minh mức seniority, không chỉ kể mô tả chung.",
    ],
  },
  {
    eyebrow: "Domain",
    title: "Chứng minh hiểu ngành",
    items: [
      "Liên hệ kinh nghiệm của bạn với domain của job: product, fintech, AI, SaaS, e-commerce...",
      "Chỉ ra những bài toán/đối tượng người dùng mà bạn đã làm trước đó.",
      "Nếu đổi domain, hãy giải thích vì sao nền tảng hiện tại vẫn phù hợp.",
    ],
  },
  {
    eyebrow: "Skill",
    title: "Bù gap bằng bằng chứng",
    items: [
      "Liệt kê skill đúng yêu cầu JD, nhưng chỉ giữ những gì bạn có thể chứng minh.",
      "Nếu còn thiếu, hãy nêu dự án, khóa học hoặc portfolio đang dùng để bù đắp.",
      "Đừng để skills section dài nhưng thiếu chiều sâu thực tế.",
    ],
  },
  {
    eyebrow: "Phỏng vấn",
    title: "Chuẩn bị câu trả lời sắc nét",
    items: [
      "Chuẩn bị 1 câu trả lời theo STAR cho dự án bạn tự hào nhất.",
      "Giải thích rõ vì sao bạn phù hợp với team, domain và level của job.",
      "Nếu bị hỏi gap, hãy nói cách bạn đang bù đắp nó bằng học tập hoặc dự án.",
    ],
  },
  {
    eyebrow: "Câu hỏi",
    title: "Luyện trước các câu hay gặp",
    items: [
      "Bạn đã tạo ra tác động đo lường được nào trong dự án gần nhất?",
      "Khi stakeholder đổi yêu cầu ở phút cuối, bạn xử lý thế nào?",
      "Nếu vào vị trí này, 30 ngày đầu bạn sẽ ưu tiên việc gì?",
    ],
  },
];

const JOB_LOADING_TIPS_EN: LoadingTipSlide[] = [
  {
    eyebrow: "CV",
    title: "Match keywords with the JD",
    items: [
      "Use concrete numbers: growth %, number of projects, years of experience.",
      "Mirror keywords from the job summary in your summary, skills, and experience.",
      "Start each bullet with an action verb: built, optimized, led, improved.",
    ],
  },
  {
    eyebrow: "Experience",
    title: "Show real depth",
    items: [
      "State the project scope, your role, and measurable impact.",
      "If the job asks for experience, make the timeline and context explicit.",
      "Use one or two concrete examples to prove seniority, not just broad descriptions.",
    ],
  },
  {
    eyebrow: "Domain",
    title: "Prove industry fit",
    items: [
      "Connect your background to the job domain: product, fintech, AI, SaaS, e-commerce...",
      "Show the product problems or user groups you have worked with before.",
      "If you are switching domains, explain why your current foundation still fits.",
    ],
  },
  {
    eyebrow: "Skill",
    title: "Close gaps with evidence",
    items: [
      "List only the skills you can back up with evidence from work or projects.",
      "If something is missing, mention learning, portfolio work, or side projects.",
      "Do not make the skills section long without real depth behind it.",
    ],
  },
  {
    eyebrow: "Interview",
    title: "Prepare crisp answers",
    items: [
      "Prepare one STAR answer for your strongest project.",
      "Explain why you fit the team, domain, and level of the role.",
      "If asked about gaps, show how you are closing them through learning or projects.",
    ],
  },
  {
    eyebrow: "Practice",
    title: "Train common questions",
    items: [
      "What measurable impact did you make in your latest project?",
      "How do you handle last-minute requirement changes from stakeholders?",
      "What would you prioritize in your first 30 days in this role?",
    ],
  },
];

interface JobDimension {
  score: number;
  justification: string;
  matchedKeywords: string[];
  missingKeywords: string[];
}

interface JobMatch {
  job: {
    id: string;
    title: string;
    company: string;
    domain: string;
    location: string;
    level: string;
    description: string;
    requirements: string;
    skills: string;
    url?: string;
  };
  overallScore: number;
  domainKnowledge: JobDimension;
  workingExperience: JobDimension;
  requirementsOfSkills: JobDimension;
  finalRecommendation: string;
}

interface JobRecommendationResponse {
  profile: {
    id: string;
    fullName: string;
    jobTitle: string;
    experienceSummary: string;
    parsedAt: string;
    fileName: string;
  } | null;
  matches: JobMatch[];
  bestMatch: JobMatch | null;
  overallSummary: string;
  analysisMarkdown: string;
  generatedAt: string;
  totalJobsAnalyzed: number;
  providerLabel?: string;
  usage?: unknown;
  cacheHit?: boolean;
  _cachedAt?: number;
  error?: string;
}

interface JobRecommendationCacheEntry {
  version: 8;
  scopeKey: string;
  locale: string;
  cachedAt: number;
  data: JobRecommendationResponse;
}

type JobRecommendationProfile = JobRecommendationResponse["profile"];

// NEW: Interface for recommended jobs history
interface RecommendedJobsHistory {
  version: 1;
  scopeKey: string;
  locale: string;
  jobs: JobMatch[];  // All recommended jobs (sorted by score)
  lastRefreshAt: number;  // Timestamp of last refresh
  refreshCount: number;  // No longer used (server-side rate limit)
  windowStartAt: number;  // No longer used (server-side rate limit)
}

const RECOMMENDED_JOBS_HISTORY_KEY = "careerai-recommended-jobs-history-v1";

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function getJobRecommendationsCacheKey(scopeKey: string, locale: string): string {
  return scopeStorageKey(`${JOB_RECOMMENDATIONS_CACHE_KEY_PREFIX}:${locale}`, scopeKey);
}

function readJobRecommendationsCache(scopeKey: string, locale: string): JobRecommendationCacheEntry | null {
  if (!canUseLocalStorage()) return null;

  try {
    const raw = localStorage.getItem(getJobRecommendationsCacheKey(scopeKey, locale));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<JobRecommendationCacheEntry>;
    if (parsed?.version !== 8 || parsed.locale !== locale || parsed.scopeKey !== scopeKey || !parsed.data) {
      return null;
    }

    return parsed as JobRecommendationCacheEntry;
  } catch {
    return null;
  }
}

function writeJobRecommendationsCache(scopeKey: string, locale: string, data: JobRecommendationResponse): void {
  if (!canUseLocalStorage()) return;

  try {
    const entry: JobRecommendationCacheEntry = {
      version: 8,
      scopeKey,
      locale,
      cachedAt: Date.now(),
      data,
    };
    localStorage.setItem(getJobRecommendationsCacheKey(scopeKey, locale), JSON.stringify(entry));
  } catch {
    // Ignore storage quota / availability issues.
  }
}

function clearJobRecommendationsCache(scopeKey: string, locale: string): void {
  if (!canUseLocalStorage()) return;

  try {
    localStorage.removeItem(getJobRecommendationsCacheKey(scopeKey, locale));
  } catch {
    // Ignore storage quota / availability issues.
  }
}

// NEW: History management functions
function getRecommendedJobsHistoryKey(scopeKey: string): string {
  return scopeStorageKey(RECOMMENDED_JOBS_HISTORY_KEY, scopeKey);
}

function readRecommendedJobsHistory(scopeKey: string): RecommendedJobsHistory | null {
  if (!canUseLocalStorage()) return null;

  try {
    const raw = localStorage.getItem(getRecommendedJobsHistoryKey(scopeKey));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<RecommendedJobsHistory>;
    if (parsed?.version !== 1 || parsed.scopeKey !== scopeKey || !parsed.jobs) {
      return null;
    }

    return parsed as RecommendedJobsHistory;
  } catch {
    return null;
  }
}

function clearRecommendedJobsHistory(scopeKey: string): void {
  if (!canUseLocalStorage()) return;

  try {
    localStorage.removeItem(getRecommendedJobsHistoryKey(scopeKey));
  } catch {
    // Ignore storage quota / availability issues.
  }
}

function writeRecommendedJobsHistory(scopeKey: string, jobs: JobMatch[]): void {
  if (!canUseLocalStorage()) return;

  try {
    const history: RecommendedJobsHistory = {
      version: 1,
      scopeKey,
      locale: localStorage.getItem(`locale`) || "vi",
      jobs: jobs.sort((a, b) => b.overallScore - a.overallScore),  // Sort by score descending
      lastRefreshAt: Date.now(),
      refreshCount: 0,  // No longer used (server-side rate limit)
      windowStartAt: 0,  // No longer used (server-side rate limit)
    };
    localStorage.setItem(getRecommendedJobsHistoryKey(scopeKey), JSON.stringify(history));
  } catch {
    // Ignore storage quota / availability issues.
  }
}

function normalizeRecommendationProfile(profile: unknown): JobRecommendationProfile {
  if (!profile || typeof profile !== "object") return null;

  const candidate = profile as Record<string, unknown>;
  const id = typeof candidate.id === "string" ? candidate.id : "";
  if (!id) return null;

  return {
    id,
    fullName:
      typeof candidate.fullName === "string"
        ? candidate.fullName
        : typeof candidate.full_name === "string"
          ? candidate.full_name
          : "",
    jobTitle:
      typeof candidate.jobTitle === "string"
        ? candidate.jobTitle
        : typeof candidate.job_title === "string"
          ? candidate.job_title
          : "",
    experienceSummary:
      typeof candidate.experienceSummary === "string"
        ? candidate.experienceSummary
        : typeof candidate.experience_summary === "string"
          ? candidate.experience_summary
          : "",
    parsedAt:
      typeof candidate.parsedAt === "string"
        ? candidate.parsedAt
        : typeof candidate.parsed_at === "string"
          ? candidate.parsed_at
          : new Date().toISOString(),
    fileName:
      typeof candidate.fileName === "string"
        ? candidate.fileName
        : typeof candidate.file_name === "string"
          ? candidate.file_name
          : "CV",
  };
}

function createRecommendationPlaceholder(
  locale: "vi" | "en",
  profile: JobRecommendationProfile = null,
): JobRecommendationResponse {
  return {
    profile,
    matches: [],
    bestMatch: null,
    overallSummary:
      locale === "vi"
        ? "Hãy mở Profile để upload hoặc chọn CV đã lưu trước khi xem job matching."
        : "Open Profile to upload or choose a saved CV before viewing job matching.",
    analysisMarkdown: "",
    generatedAt: new Date().toISOString(),
    totalJobsAnalyzed: 0,
    cacheHit: true,
  };
}

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_REFRESH_PER_WINDOW = 5;

function canRefreshJobs(scopeKey: string): { canRefresh: boolean; remainingWaitMs: number; refreshCount: number } {
  const history = readRecommendedJobsHistory(scopeKey);
  
  if (!history) {
    return { canRefresh: true, remainingWaitMs: 0, refreshCount: 0 };
  }

  const now = Date.now();
  const windowEnd = history.windowStartAt + WINDOW_MS;

  // Check if we're in a new window
  if (now >= windowEnd) {
    return { canRefresh: true, remainingWaitMs: 0, refreshCount: 0 };
  }

  // We're in the same window
  if (history.refreshCount >= MAX_REFRESH_PER_WINDOW) {
    const remainingWaitMs = windowEnd - now;
    return { canRefresh: false, remainingWaitMs, refreshCount: history.refreshCount };
  }

  return { canRefresh: true, remainingWaitMs: 0, refreshCount: history.refreshCount };
}

function formatScore(score: number): string {
  return Number.isFinite(score) ? score.toFixed(1) : "0.0";
}

function scoreHue(score: number): string {
  if (score >= 8) return "var(--color-success)";
  if (score >= 6) return "var(--secondary)";
  if (score >= 4) return "var(--warning, #d97706)";
  return "var(--destructive)";
}

function normalizeJobUrl(url?: string): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/\//.test(trimmed)) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

function ScoreRow({
  label,
  dimension,
}: {
  label: string;
  dimension: JobDimension;
}) {
  return (
    <div className="min-w-0 w-full" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xs)" }}>
      <div className="flex min-w-0 items-start justify-between" style={{ gap: "var(--spacing-sm)" }}>
        <span
          className="text-foreground min-w-0 flex-1"
          style={{
            fontFamily: FONT,
            fontSize: "var(--font-size-small)",
            fontWeight: "var(--font-weight-medium)" as unknown as number,
            lineHeight: 1.4,
          }}
        >
          {label}
        </span>
        <span
          className="text-muted-foreground shrink-0"
          style={{
            fontFamily: FONT,
            fontSize: "var(--font-size-caption)",
            fontWeight: "var(--font-weight-medium)" as unknown as number,
          }}
        >
          {formatScore(dimension.score)}/10
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: "8px",
          borderRadius: "999px",
          background: "color-mix(in srgb, var(--border) 55%, transparent)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, dimension.score * 10))}%`,
            height: "100%",
            borderRadius: "999px",
            background: scoreHue(dimension.score),
            transition: "width 180ms ease",
          }}
        />
      </div>

      <p
        className="text-muted-foreground"
        style={{
          fontFamily: FONT,
          fontSize: "var(--font-size-caption)",
          fontWeight: "var(--font-weight-normal)" as unknown as number,
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {dimension.justification}
      </p>

      {(dimension.matchedKeywords.length > 0 || dimension.missingKeywords.length > 0) && (
        <div className="flex min-w-0 flex-wrap" style={{ gap: "var(--spacing-2xs)" }}>
          {dimension.matchedKeywords.slice(0, 3).map((keyword) => (
          <Badge
            key={`${label}-matched-${keyword}`}
            variant="secondary"
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize shadow-none"
          >
            {keyword}
          </Badge>
          ))}
          {dimension.missingKeywords.slice(0, 2).map((keyword) => (
          <Badge
            key={`${label}-missing-${keyword}`}
            variant="secondary"
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize shadow-none"
          >
            {keyword}
          </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function JobSourceLink({
  url,
  locale,
  isDesktop,
}: {
  url: string;
  locale: "vi" | "en";
  isDesktop: boolean;
}) {
  const href = normalizeJobUrl(url);

  return (
    <Button
      asChild
      variant="secondary"
      size={isDesktop ? "sm" : "lg"}
      className="w-full min-w-0 justify-center rounded-[8px] px-3 py-1.5 text-[12px] font-semibold shadow-none sm:w-fit"
    >
      <a href={href} target="_blank" rel="noreferrer noopener">
        <span>{locale === "vi" ? "Xem tin gốc" : "View original posting"}</span>
        <ExternalLink style={{ width: "12px", height: "12px" }} />
      </a>
    </Button>
  );
}

function JobUrlBlock({
  url,
  locale,
  isDesktop,
}: {
  url?: string;
  locale: "vi" | "en";
  isDesktop: boolean;
}) {
  const href = normalizeJobUrl(url);

  return (
    <div
      className="min-w-0 w-full"
      style={{
        marginTop: "var(--spacing-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-2xs)",
      }}
    >
      <p
        className="text-muted-foreground"
        style={{
          fontFamily: FONT,
          fontSize: "var(--font-size-caption)",
          fontWeight: "var(--font-weight-medium)" as unknown as number,
          margin: 0,
        }}
      >
        {locale === "vi" ? "URL job" : "Job URL"}
      </p>

      {href ? (
        <>
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-secondary min-w-0 max-w-full underline"
            style={{
              fontFamily: FONT,
              fontSize: "var(--font-size-caption)",
              fontWeight: "var(--font-weight-medium)" as unknown as number,
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {url?.trim() || href}
          </a>
          <JobSourceLink url={url} locale={locale} isDesktop={isDesktop} />
        </>
      ) : (
        <p
          className="text-muted-foreground"
          style={{
            fontFamily: FONT,
            fontSize: "var(--font-size-caption)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {locale === "vi" ? "Chưa có URL trong dữ liệu job." : "No job URL was provided in the data."}
        </p>
      )}
    </div>
  );
}

function BestMatchHero({
  bestMatch,
  locale,
  isDesktop,
  emptyState,
  isLoading,
}: {
  bestMatch: JobMatch | null;
  locale: "vi" | "en";
  isDesktop: boolean;
  isLoading?: boolean;
  emptyState?: {
    message: string;
    actionLabel: string;
    actionDisabled?: boolean;
    onAction: () => void;
    badgeLabel?: string;
    eyebrow?: string;
    description?: string;
  };
}) {
  if (isLoading && !bestMatch) {
    return (
      <div
        className="min-w-0 w-full"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: isDesktop ? "18px" : "16px",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: isDesktop ? "-22px" : "-16px",
            right: isDesktop ? "-14px" : "-10px",
            width: isDesktop ? "96px" : "68px",
            height: isDesktop ? "96px" : "68px",
            borderRadius: "999px",
            background: "radial-gradient(circle, color-mix(in srgb, #facc15 32%, transparent) 0%, transparent 68%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="min-w-0 w-full"
          style={{
            ...FEATURED_MATCH_STYLE,
            position: "relative",
            borderRadius: isDesktop ? "18px" : "16px",
            padding: isDesktop ? "16px" : "14px",
            minHeight: isDesktop ? "176px" : "152px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "var(--spacing-sm)",
          }}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-none"
              style={BANNER_GOLD_PILL_STYLE}
            >
              <RefreshCw className="animate-spin" style={{ width: "12px", height: "12px" }} />
              {locale === "vi" ? "Đang làm mới" : "Refreshing"}
            </Badge>
            <span
              className="text-muted-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "10px",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {locale === "vi" ? "Đang tải gợi ý..." : "Loading recommendations..."}
            </span>
          </div>

          <div className="animate-pulse" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                height: isDesktop ? "18px" : "16px",
                width: isDesktop ? "56%" : "70%",
                borderRadius: "999px",
                background: "color-mix(in srgb, var(--foreground) 10%, transparent)",
              }}
            />
            <div
              style={{
                height: isDesktop ? "28px" : "24px",
                width: isDesktop ? "76%" : "88%",
                borderRadius: "999px",
                background: "color-mix(in srgb, var(--foreground) 14%, transparent)",
              }}
            />
            <div
              style={{
                height: isDesktop ? "14px" : "12px",
                width: isDesktop ? "42%" : "58%",
                borderRadius: "999px",
                background: "color-mix(in srgb, var(--foreground) 8%, transparent)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!bestMatch) {
    if (emptyState) {
      return (
        <div
          className="min-w-0 w-full"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: isDesktop ? "18px" : "16px",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: isDesktop ? "-22px" : "-16px",
              right: isDesktop ? "-14px" : "-10px",
              width: isDesktop ? "96px" : "68px",
              height: isDesktop ? "96px" : "68px",
              borderRadius: "999px",
              background: "radial-gradient(circle, color-mix(in srgb, #facc15 32%, transparent) 0%, transparent 68%)",
              pointerEvents: "none",
            }}
          />

          <div
            className="min-w-0 w-full"
            style={{
              ...FEATURED_MATCH_STYLE,
              position: "relative",
              borderRadius: isDesktop ? "18px" : "16px",
              padding: isDesktop ? "16px" : "14px",
              minHeight: isDesktop ? "176px" : "152px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "var(--spacing-sm)",
            }}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-none"
              style={BANNER_GOLD_PILL_STYLE}
            >
                {emptyState.badgeLabel || (locale === "vi" ? "Đã lọc xong" : "Done filtering")}
              </Badge>
              <span
                className="text-muted-foreground"
                style={{
                  fontFamily: FONT,
                  fontSize: "10px",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {emptyState.eyebrow || (locale === "vi" ? "Không còn job phù hợp" : "No more matches")}
              </span>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p
                className="text-foreground min-w-0"
                style={{
                  fontFamily: FONT,
                  fontSize: "clamp(0.92rem, 2.4vw, 1.1rem)",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  lineHeight: 1.45,
                  margin: 0,
                }}
              >
                {emptyState.message}
              </p>

              <Button
                variant="link"
                size="sm"
                onClick={emptyState.onAction}
                disabled={emptyState.actionDisabled}
                className="h-auto p-0 text-secondary"
              >
                {emptyState.actionLabel}
              </Button>
            </div>

            <p
              className="text-muted-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-caption)",
                lineHeight: 1.55,
                margin: 0,
                maxWidth: "52ch",
              }}
            >
              {emptyState.description || (locale === "vi"
                ? "Bạn có thể xem lại lịch sử jobs đã gợi ý trước đó hoặc cập nhật CV để mở thêm cơ hội mới."
                : "Review previously recommended jobs or update your CV to unlock more opportunities.")}
            </p>
          </div>
        </div>
      );
    }

    return (
      <p
        className="text-muted-foreground"
        style={{
          ...CARD_DESCRIPTION_STYLE,
          fontWeight: "var(--font-weight-medium)" as unknown as number,
        }}
      >
        {locale === "vi" ? "Đang chờ dữ liệu..." : "Waiting for data..."}
      </p>
    );
  }

  const score = formatScore(bestMatch.overallScore);
  const scoreColor = scoreHue(bestMatch.overallScore);
  const jobTitle =
    bestMatch.job.title || (locale === "vi" ? "Không có tiêu đề" : "Untitled job");
  const company =
    bestMatch.job.company || (locale === "vi" ? "Chưa rõ công ty" : "Company not specified");

  return (
    <div
      className="min-w-0 w-full"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: isDesktop ? "18px" : "16px",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: isDesktop ? "-22px" : "-16px",
          right: isDesktop ? "-14px" : "-10px",
          width: isDesktop ? "96px" : "68px",
          height: isDesktop ? "96px" : "68px",
          borderRadius: "999px",
          background: "radial-gradient(circle, color-mix(in srgb, #facc15 32%, transparent) 0%, transparent 68%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="min-w-0 w-full"
        style={{
          ...FEATURED_MATCH_STYLE,
          position: "relative",
          borderRadius: isDesktop ? "18px" : "16px",
          padding: isDesktop ? "11px" : "8px",
          display: "grid",
          gridTemplateColumns: isDesktop ? "minmax(0, 1.35fr) minmax(0, 0.65fr)" : "1fr",
          gap: isDesktop ? "10px" : "8px",
          alignItems: "center",
          opacity: isLoading ? 0.84 : 1,
          transition: "opacity 180ms ease",
        }}
      >
        <div className="min-w-0" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-none"
              style={BANNER_GOLD_PILL_STYLE}
            >
              {isLoading
                ? (
                  <>
                    <RefreshCw className="animate-spin" style={{ width: "12px", height: "12px" }} />
                    {locale === "vi" ? "Đang làm mới" : "Refreshing"}
                  </>
                )
                : (locale === "vi" ? "Phù hợp nhất" : "Best match")}
            </Badge>
            <span
              className="text-muted-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "10px",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {isLoading
                ? (locale === "vi" ? "Đang tải gợi ý..." : "Loading recommendations...")
                : (locale === "vi" ? "Top 1 đề xuất" : "Top recommendation")}
            </span>
          </div>

          <div className="min-w-0" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xs)" }}>
            <h3
              className="text-foreground min-w-0"
              style={{
                fontFamily: FONT,
                fontSize: "clamp(0.92rem, 2.4vw, 1.35rem)",
                fontWeight: "var(--font-weight-extrabold)" as unknown as number,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                margin: 0,
                maxWidth: isDesktop ? "20ch" : "none",
                overflowWrap: "anywhere",
              }}
            >
              {jobTitle}
            </h3>

            <p
              className="text-foreground min-w-0"
              style={{
                fontFamily: FONT,
                fontSize: "clamp(0.72rem, 2vw, 0.82rem)",
                fontWeight: "var(--font-weight-medium)" as unknown as number,
                lineHeight: 1.4,
                margin: 0,
                opacity: 0.84,
                overflowWrap: "anywhere",
              }}
            >
              {company}
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap" style={{ gap: "5px" }}>
            {bestMatch.job.location && (
              <Badge
                variant="secondary"
                className="max-w-full rounded-full px-2 py-0.5 text-[10px] font-medium shadow-none"
                style={{ gap: "var(--spacing-2xs)", overflowWrap: "anywhere" }}
              >
                <MapPin style={{ width: "12px", height: "12px" }} />
                {bestMatch.job.location}
              </Badge>
            )}
            {bestMatch.job.level && (
              <Badge
                variant="secondary"
                className="max-w-full rounded-full px-2 py-0.5 text-[10px] font-medium shadow-none"
                style={{ gap: "var(--spacing-2xs)", overflowWrap: "anywhere" }}
              >
                <Clock3 style={{ width: "12px", height: "12px" }} />
                {bestMatch.job.level}
              </Badge>
            )}
            {bestMatch.job.domain && (
              <Badge
                variant="secondary"
                className="max-w-full rounded-full px-2 py-0.5 text-[10px] font-medium shadow-none"
                style={{ overflowWrap: "anywhere" }}
              >
                {bestMatch.job.domain}
              </Badge>
            )}
          </div>
        </div>

        <div
          className="min-w-0"
          style={{
            justifySelf: "stretch",
            display: "flex",
            justifyContent: isDesktop ? "stretch" : "center",
          }}
        >
          <div
            style={{
              ...FEATURED_SCORE_STYLE,
              width: "100%",
              maxWidth: isDesktop ? "none" : "132px",
              minHeight: isDesktop ? "108px" : "96px",
              borderRadius: "16px",
              padding: isDesktop ? "10px" : "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: "auto auto -14px -14px",
                width: "42px",
                height: "42px",
                borderRadius: "999px",
                background: "radial-gradient(circle, color-mix(in srgb, #f59e0b 32%, transparent) 0%, transparent 72%)",
              }}
            />

            <div
              className="flex items-center justify-between"
              style={{ gap: "4px", position: "relative" }}
            >
              <span
                className="text-muted-foreground"
                style={{
                  fontFamily: FONT,
                  fontSize: "9px",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {locale === "vi" ? "Điểm khớp" : "Match score"}
              </span>
              <TrendingUp style={{ width: "12px", height: "12px", color: scoreColor }} />
            </div>

            <div style={{ position: "relative" }}>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: isDesktop ? "2.2rem" : "1.95rem",
                  fontWeight: "var(--font-weight-extrabold)" as unknown as number,
                  lineHeight: 0.9,
                  letterSpacing: "-0.04em",
                  color: scoreColor,
                }}
              >
                {score}
              </div>
              <div
                className="text-foreground"
                style={{
                  fontFamily: FONT,
                  fontSize: "0.7rem",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  marginTop: "2px",
                }}
              >
                /10
              </div>
            </div>

            <div
              className="text-muted-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "9px",
                fontWeight: "var(--font-weight-medium)" as unknown as number,
                lineHeight: 1.35,
                position: "relative",
              }}
            >
              {locale === "vi" ? "AI ranking ưu tiên" : "AI-ranked priority"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingTipsPanel({
  locale,
  isDesktop,
}: {
  locale: "vi" | "en";
  isDesktop: boolean;
}) {
  const slides = locale === "vi" ? JOB_LOADING_TIPS_VI : JOB_LOADING_TIPS_EN;
  const [activeIndex, setActiveIndex] = useState(() => Math.floor(Math.random() * Math.max(slides.length, 1)));

  useEffect(() => {
    setActiveIndex(Math.floor(Math.random() * Math.max(slides.length, 1)));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 8000);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  return (
    <div
      className="min-w-0 w-full"
      style={{
        marginTop: "var(--spacing-md)",
        padding: "var(--spacing-md)",
        borderRadius: "20px",
        background: "color-mix(in srgb, var(--secondary) 4%, var(--background))",
        border: "1px solid color-mix(in srgb, var(--border) 45%, transparent)",
      }}
    >
      <div className="flex items-center" style={{ gap: "var(--spacing-xs)", marginBottom: "var(--spacing-sm)" }}>
        <Sparkles className="text-secondary" style={{ width: "16px", height: "16px" }} />
        <div className="flex items-center justify-between" style={{ flex: 1, gap: "var(--spacing-xs)" }}>
          <p
            className="text-foreground"
            style={{
              fontFamily: FONT,
              fontSize: "var(--font-size-small)",
              fontWeight: "var(--font-weight-semibold)" as unknown as number,
              margin: 0,
            }}
          >
            {locale === "vi" ? "Tips trong lúc chờ dữ liệu" : "Tips while the data loads"}
          </p>

          <span
            className="text-muted-foreground"
            style={{
              fontFamily: FONT,
              fontSize: "var(--font-size-caption)",
              fontWeight: "var(--font-weight-medium)" as unknown as number,
            }}
          >
            {slides.length > 0 ? `${activeIndex + 1}/${slides.length}` : "0/0"}
          </span>
        </div>
      </div>

      <div
        style={{
          overflow: "hidden",
          borderRadius: "18px",
          minHeight: isDesktop ? "220px" : "260px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: `${Math.max(slides.length, 1) * 100}%`,
            transform: `translateX(-${activeIndex * (100 / Math.max(slides.length, 1))}%)`,
            transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
          }}
        >
          {slides.map((section) => (
          <div
            key={section.title}
            style={{
              flex: `0 0 ${100 / Math.max(slides.length, 1)}%`,
              boxSizing: "border-box",
              padding: "var(--spacing-sm)",
              background: "var(--background)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--spacing-sm)",
                marginBottom: "var(--spacing-xs)",
              }}
            >
              <p
                className="text-secondary"
                style={{
                  fontFamily: FONT,
                  fontSize: "var(--font-size-caption)",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {section.eyebrow}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {slides.map((_, index) => (
                  <span
                    key={`${section.title}-dot-${index}`}
                    aria-hidden
                    style={{
                      width: index === activeIndex ? "18px" : "6px",
                      height: "6px",
                      borderRadius: "999px",
                      background: index === activeIndex ? "var(--secondary)" : "color-mix(in srgb, var(--border) 60%, transparent)",
                      transition: "all 240ms ease",
                    }}
                  />
                ))}
              </div>
            </div>

            <p
              className="text-foreground"
              style={{
                fontFamily: FONT,
                fontSize: isDesktop ? "1rem" : "var(--font-size-small)",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                margin: 0,
                marginBottom: "var(--spacing-xs)",
              }}
            >
              {section.title}
            </p>

            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                display: "grid",
                gap: "var(--spacing-2xs)",
              }}
            >
              {section.items.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground"
                  style={{
                    fontFamily: FONT,
                    fontSize: "var(--font-size-caption)",
                    lineHeight: 1.6,
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function JobsPage() {
  const isDesktop = useIsDesktop();
  const isMobile = !isDesktop;
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const identity = useSessionIdentity();
  const [data, setData] = useState<JobRecommendationResponse | null>(() => readJobRecommendationsCache(identity.scopeKey, locale)?.data ?? null);
  const [isLoading, setIsLoading] = useState(() => !readJobRecommendationsCache(identity.scopeKey, locale));
  const [error, setError] = useState<string | null>(null);
  const [excludedJobIds, setExcludedJobIds] = useState<string[]>([]);  // Track excluded job IDs
  const [showHistory, setShowHistory] = useState(false);  // Toggle history view
  const [refreshesLeft, setRefreshesLeft] = useState<number>(3);  // Track remaining refreshes
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);  // Track unlimited account status
  const scopeCacheKeyRef = useRef(`${identity.scopeKey}|${locale}`);
  const excludedJobIdsRef = useRef<string[]>([]);
  const isUnlimitedRef = useRef(false);
  const recommendedHistory = readRecommendedJobsHistory(identity.scopeKey);
  const hasRecommendedHistory = Boolean(recommendedHistory?.jobs?.length);
  const hasSavedProfile = Boolean(data?.profile);

  useEffect(() => {
    excludedJobIdsRef.current = excludedJobIds;
  }, [excludedJobIds]);

  useEffect(() => {
    isUnlimitedRef.current = isUnlimited;
  }, [isUnlimited]);

  useEffect(() => {
    const nextScopeCacheKey = `${identity.scopeKey}|${locale}`;
    if (scopeCacheKeyRef.current === nextScopeCacheKey) return;
    scopeCacheKeyRef.current = nextScopeCacheKey;
    setData(null);
    setError(null);
    setIsLoading(true);
    setExcludedJobIds([]);
    excludedJobIdsRef.current = [];
    setShowHistory(false);
  }, [identity.scopeKey, locale]);

  const loadRecommendations = useCallback(
    async (options: { forceNetwork?: boolean; signal?: AbortSignal } = {}) => {
      const { forceNetwork = false, signal } = options;
      const cached = readJobRecommendationsCache(identity.scopeKey, locale);
      const headers = {
        Authorization: `Bearer ${publicAnonKey}`,
        ...buildSessionHeaders(identity),
      };

      setIsLoading(true);
      setError(null);

      try {
        const profileResponse = await fetch(PROFILE_URL, {
          headers,
          signal,
        });
        const profilePayload = await profileResponse.json().catch(() => ({}));

        if (!profileResponse.ok) {
          throw new Error(profilePayload?.error || `Request failed with ${profileResponse.status}`);
        }

        const latestProfile = normalizeRecommendationProfile(profilePayload?.profile);
        if (!latestProfile) {
          clearJobRecommendationsCache(identity.scopeKey, locale);
          clearRecommendedJobsHistory(identity.scopeKey);
          setExcludedJobIds([]);
          excludedJobIdsRef.current = [];
          setShowHistory(false);
          setData(createRecommendationPlaceholder(locale));
          return;
        }

        if (!forceNetwork && cached) {
          setData({
            ...cached.data,
            profile: cached.data.profile ?? latestProfile,
          });
          setError(null);
          return;
        }

        const requestUrl = new URL(JOB_RECOMMENDATIONS_URL);
        requestUrl.searchParams.set("locale", locale);
        requestUrl.searchParams.set("limit", "50");
        if (forceNetwork) {
          requestUrl.searchParams.set("forceRefresh", "1");
        }
        
        // NEW: Add excluded job IDs
        if (excludedJobIdsRef.current.length > 0) {
          requestUrl.searchParams.set("excludeJobIds", excludedJobIdsRef.current.join(","));
        }

        const response = await fetch(requestUrl.toString(), {
          headers,
          signal,
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || `Request failed with ${response.status}`);
        }

        if (payload?.error) {
          throw new Error(payload.error);
        }

        const nextData = payload as JobRecommendationResponse;
        const normalizedData: JobRecommendationResponse = {
          ...nextData,
          profile: normalizeRecommendationProfile(nextData.profile) ?? latestProfile,
        };

        if (!normalizedData.cacheHit) {
          recordTokenUsageFromUsage(normalizedData.usage, new Date());
        }
        setData(normalizedData);
        writeJobRecommendationsCache(identity.scopeKey, locale, normalizedData);

        const remainingHeader = response.headers.get("X-RateLimit-Remaining");
        if (remainingHeader) {
          const remaining = Number(remainingHeader);
          setRefreshesLeft(remaining);
          setIsUnlimited(remaining >= 999);
        } else if (forceNetwork && !isUnlimitedRef.current) {
          setRefreshesLeft((prev) => Math.max(0, prev - 1));
        }
        
        // NEW: Update excluded job IDs with newly matched jobs
        if (normalizedData.matches && normalizedData.matches.length > 0) {
          const newMatchedIds = normalizedData.matches.map(m => m.job.id);
          setExcludedJobIds(prev => {
            // Combine with existing IDs and remove duplicates
            const combined = [...prev, ...newMatchedIds];
            const nextExcludedJobIds = Array.from(new Set(combined));
            excludedJobIdsRef.current = nextExcludedJobIds;
            return nextExcludedJobIds;
          });

          // NEW: Save to history
          const history = readRecommendedJobsHistory(identity.scopeKey);
          const allJobs = history ? [...history.jobs, ...normalizedData.matches] : normalizedData.matches;
          
          // Deduplicate by job ID
          const uniqueJobs = Array.from(
            new Map(allJobs.map(job => [job.job.id, job])).values()
          );

          writeRecommendedJobsHistory(identity.scopeKey, uniqueJobs);
          
        }
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [identity, locale],
  );

  useEffect(() => {
    const controller = new AbortController();
    const cached = readJobRecommendationsCache(identity.scopeKey, locale);
    
    // Only fetch from API if there's no cached data
    // If cache exists, it will be used and no API call is needed
    if (!cached) {
      void loadRecommendations({ signal: controller.signal });
    } else {
      // Cache exists, just ensure loading state is false
      setIsLoading(false);
    }
    
    return () => controller.abort();
  }, [loadRecommendations, identity.scopeKey, locale]);

  // Auto-reset excluded jobs and refreshes left when user switches account
  useEffect(() => {
    setExcludedJobIds([]);
    excludedJobIdsRef.current = [];
    setShowHistory(false);
    setRefreshesLeft(3);  // Reset to 3 refreshes
    setIsUnlimited(false);  // Reset unlimited status
  }, [identity.scopeKey]);

  const bestMatch = useMemo(() => data?.bestMatch || data?.matches?.[0] || null, [data]);
  const topJobMatches = useMemo(() => data?.matches?.slice(1) ?? [], [data]);
  const missingProfileHeroState =
    !isLoading && !error && data && !data.profile
      ? {
          message:
            locale === "vi"
              ? "Mở Profile để upload CV mới hoặc chọn CV đã lưu."
              : "Open Profile to upload a new CV or choose a saved one.",
          actionLabel: locale === "vi" ? "Mở Profile" : "Open Profile",
          onAction: () => navigate("/chat/profile"),
          badgeLabel: locale === "vi" ? "Cần CV" : "CV required",
          eyebrow: locale === "vi" ? "Chưa liên kết CV" : "No CV connected",
          description:
            locale === "vi"
              ? "Trang Jobs chỉ chạy đối chiếu sau khi bạn đã lưu một CV trong Profile."
              : "The Jobs page can only compare matches after a CV has been saved in Profile.",
        }
      : undefined;

  const handleRetry = () => {
    // Load new jobs by excluding current matches
    // Server-side rate limit will handle the 3 requests per 5 hours limit
    setShowHistory(false);
    void loadRecommendations({ forceNetwork: true });
  };

  // NEW: Show previously recommended jobs
  const handleShowHistory = () => {
    const history = readRecommendedJobsHistory(identity.scopeKey);
    if (history && history.jobs.length > 0) {
      // Create a mock response with history jobs
      const historyData: JobRecommendationResponse = {
        profile: data?.profile || null,
        matches: history.jobs,
        bestMatch: history.jobs[0] || null,
        overallSummary: locale === "vi"
          ? `Đã xem ${history.jobs.length} jobs được gợi ý (sắp xếp theo điểm giảm dần)`
          : `Viewing ${history.jobs.length} previously recommended jobs (sorted by score)`,
        analysisMarkdown: "",
        generatedAt: new Date(history.lastRefreshAt).toISOString(),
        totalJobsAnalyzed: history.jobs.length,
        cacheHit: true,
      };
      setData(historyData);
      setShowHistory(true);
      setError(null);
    }
  };

  // NEW: Return to latest recommendations
  const handleShowLatest = () => {
    setShowHistory(false);
    const cached = readJobRecommendationsCache(identity.scopeKey, locale);
    if (cached) {
      setData(cached.data);
      setError(null);
    } else {
      void loadRecommendations({ forceNetwork: false });
    }
  };

  return (
      <div
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
        style={{
          background: PAGE_BACKGROUND,
          padding: isDesktop ? "var(--spacing-xl)" : "var(--spacing-xs)",
        gap: isDesktop ? "var(--spacing-lg)" : "var(--spacing-sm)",
        paddingBottom: isDesktop ? "var(--spacing-xl)" : "calc(96px + env(safe-area-inset-bottom))",
          boxSizing: "border-box",
        }}
      >
        {!isDesktop && (
          <div
            className="sticky top-0 z-20"
            style={{
              paddingTop: "calc(var(--spacing-xs) + env(safe-area-inset-top))",
              paddingBottom: "var(--spacing-xs)",
              marginBottom: "var(--spacing-sm)",
              background: PAGE_BACKGROUND,
              backdropFilter: "blur(18px)",
            }}
          >
            <div
              className="mx-auto flex w-full max-w-[1240px] items-center"
              style={{ boxSizing: "border-box" }}
            >
              <MobileSidebarButton />
            </div>
          </div>
        )}

        <section
          className="flex min-w-0 w-full flex-col items-start"
          style={{
            gap: isDesktop ? "var(--spacing-md)" : "var(--spacing-sm)",
          maxWidth: "1240px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: isDesktop ? "84px" : "72px",
            height: isDesktop ? "84px" : "72px",
            borderRadius: "24px",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 18%, var(--background)), color-mix(in srgb, var(--primary) 10%, var(--background)))",
            boxShadow: "0 10px 30px color-mix(in srgb, var(--secondary) 16%, transparent)",
          }}
        >
          <Briefcase
            className="text-secondary"
            style={{ width: isDesktop ? "34px" : "28px", height: isDesktop ? "34px" : "28px" }}
          />
        </div>

        <div className="min-w-0 w-full" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
          <h1
            className="text-foreground"
            style={{
              fontFamily: FONT,
              fontSize: isDesktop ? "var(--font-size-h1)" : "var(--font-size-h2)",
              fontWeight: "var(--font-weight-semibold)" as unknown as number,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {t.jobsPage.title}
          </h1>
          <p
            className="text-muted-foreground"
            style={{
              fontFamily: FONT,
              fontSize: "var(--font-size-body)",
              fontWeight: "var(--font-weight-normal)" as unknown as number,
              lineHeight: 1.65,
              margin: 0,
              maxWidth: "860px",
            }}
          >
            {t.jobsPage.description}
          </p>
        </div>
      </section>

      <section
        className="flex-1 min-w-0 w-full"
        style={{
          maxWidth: "1240px",
          width: "100%",
          margin: "0 auto",
          display: isDesktop ? "grid" : "flex",
          flexDirection: isDesktop ? undefined : "column",
          gap: isDesktop ? "var(--spacing-lg)" : "var(--spacing-md)",
          gridTemplateColumns: isDesktop ? "1.25fr 0.75fr" : "1fr",
          alignItems: "stretch",
          boxSizing: "border-box",
        }}
      >
        <div className="min-w-0 w-full" style={{ display: "flex", flexDirection: "column", gap: isDesktop ? "var(--spacing-lg)" : "var(--spacing-md)" }}>
          <Card className="gap-4 overflow-hidden rounded-[20px] border-0 shadow-none sm:rounded-[24px] sm:gap-0" style={CARD_SURFACE_STYLE}>
            <CardHeader style={{ position: "relative" }}>
              <div
                className="flex min-w-0 flex-col"
                style={{ gap: "var(--spacing-sm)" }}
              >
                <div
                  className="min-w-0 w-full"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  <div style={{ paddingRight: isDesktop ? "48px" : 0 }}>
                    <div className="flex items-start justify-between gap-[var(--spacing-sm)]">
                      <div className="min-w-0 flex items-center gap-[var(--spacing-sm)]">
                        <CardTitle
                          className="text-foreground"
                          style={CARD_TITLE_STYLE}
                        >
                          {showHistory
                            ? (locale === "vi" ? "Jobs đã gợi ý" : "Recommended History")
                            : (locale === "vi" ? "Tổng quan đánh giá" : "Analysis Overview")}
                        </CardTitle>
                        
                        {showHistory && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShowLatest}
                            className="h-6 px-2 text-xs"
                          >
                            {locale === "vi" ? "← Quay lại" : "← Back"}
                          </Button>
                        )}
                      </div>

                      {!showHistory && hasSavedProfile && hasRecommendedHistory && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleShowHistory}
                              className="shrink-0 h-auto gap-1 rounded-none bg-transparent px-0 py-0 text-foreground/80 shadow-none hover:bg-transparent hover:text-foreground"
                            >
                              <Clock3 style={{ width: "14px", height: "14px" }} />
                          <span className="whitespace-nowrap text-sm font-medium">
                            {locale === "vi" ? "Xem lại" : "History"}
                          </span>
                        </Button>
                      </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            align="center"
                            sideOffset={COMMON_JOB_TOOLTIP_SIDE_OFFSET}
                            className={COMMON_JOB_TOOLTIP_CONTENT_CLASS}
                          >
                            {locale === "vi"
                              ? "Xem lịch sử jobs đã được gợi ý (sắp xếp theo điểm)"
                              : "View previously recommended jobs (sorted by score)"}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  <BestMatchHero
                    bestMatch={bestMatch}
                    locale={locale}
                    isDesktop={isDesktop}
                    isLoading={isLoading}
                    emptyState={
                      missingProfileHeroState
                        ? missingProfileHeroState
                        : !isLoading && !error && Boolean(data?.profile) && !data?.matches?.length && !showHistory
                          ? {
                              message: getNoRecommendationCopy(locale).message,
                              actionLabel: getNoRecommendationCopy(locale).actionLabel,
                              actionDisabled: !hasRecommendedHistory,
                              onAction: handleShowHistory,
                            }
                          : undefined
                    }
                  />
                </div>

                <div
                  className="flex items-center"
                  style={{
                    position: "absolute",
                    top: "var(--spacing-md)",
                    right: "var(--spacing-md)",
                    gap: "var(--spacing-xs)",
                  }}
                >
                  <Tooltip>
                    <div className="relative">
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size={isDesktop ? "icon" : "touch"}
                          onClick={handleRetry}
                          disabled={isLoading || !hasSavedProfile}
                          aria-label={locale === "vi" ? "Gợi ý jobs khác" : "Show different jobs"}
                          className="rounded-full bg-background/80 text-muted-foreground shadow-none hover:bg-muted/60"
                          style={isDesktop ? { width: "32px", height: "32px" } : undefined}
                        >
                          <RefreshCw
                            className={isLoading ? "animate-spin" : ""}
                            style={{ width: "14px", height: "14px" }}
                          />
                        </Button>
                      </TooltipTrigger>

                      <span
                          className="pointer-events-none"
                          style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-4px",
                            minWidth: "16px",
                            height: "16px",
                            padding: "0 4px",
                            borderRadius: "999px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: refreshesLeft > 0 ? "var(--secondary)" : "var(--destructive)",
                            color: refreshesLeft > 0 ? "var(--secondary-foreground)" : "#fff",
                            fontFamily: FONT,
                            fontSize: "10px",
                            fontWeight: "var(--font-weight-semibold)" as unknown as number,
                            lineHeight: 1,
                            boxShadow: "0 4px 10px color-mix(in srgb, var(--foreground) 14%, transparent)",
                          }}
                        >
                          {isUnlimited ? "∞" : refreshesLeft}
                        </span>
                    </div>
                    <TooltipContent
                      side="bottom"
                      align="end"
                      sideOffset={COMMON_JOB_TOOLTIP_SIDE_OFFSET}
                      className={COMMON_JOB_TOOLTIP_CONTENT_CLASS}
                    >
                      {locale === "vi"
                        ? (isUnlimited 
                            ? "Gợi ý các jobs mới khác (không giới hạn)"
                            : `Gợi ý các jobs mới khác (${refreshesLeft}/3 lượt còn lại)`)
                        : (isUnlimited
                            ? "Show different job recommendations (unlimited)"
                            : "Show different job recommendations (limit: 3 per 5 hours)")}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="min-w-0">
              {isLoading && !data && <LoadingTipsPanel locale={locale} isDesktop={isDesktop} />}

              {!isLoading && error && !data && (
                <div
                  className="flex flex-col"
                  style={{
                    gap: "var(--spacing-md)",
                    padding: "var(--spacing-md)",
                    borderRadius: "var(--radius-card)",
                    background: "color-mix(in srgb, var(--destructive) 8%, var(--background))",
                  }}
                >
                  <p
                    className="text-foreground"
                    style={{
                      fontFamily: FONT,
                      fontSize: "var(--font-size-body)",
                      fontWeight: "var(--font-weight-semibold)" as unknown as number,
                      margin: 0,
                    }}
                  >
                    {locale === "vi" ? "Không tải được gợi ý jobs" : "Could not load job recommendations"}
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontFamily: FONT,
                      fontSize: "var(--font-size-small)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {error}
                  </p>
                  <Button
                    onClick={handleRetry}
                    variant="secondary"
                    size={isDesktop ? "sm" : "lg"}
                    className="w-full sm:w-fit"
                  >
                    {locale === "vi" ? "Thử lại" : "Try again"}
                  </Button>
                </div>
              )}

              {!isLoading && error && data && (
                <div
                  style={{
                    marginBottom: "var(--spacing-sm)",
                    padding: "var(--spacing-sm)",
                    borderRadius: "var(--radius-card)",
                    background: "color-mix(in srgb, var(--warning, #d97706) 10%, var(--background))",
                  }}
                >
                  <p
                    className="text-foreground"
                    style={{
                      fontFamily: FONT,
                      fontSize: "var(--font-size-small)",
                      fontWeight: "var(--font-weight-medium)" as unknown as number,
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {locale === "vi"
                      ? "Không làm mới được dữ liệu, đang hiển thị bản đã lưu trong storage."
                      : "Refresh failed, so the page is showing cached results from storage."}
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontFamily: FONT,
                      fontSize: "var(--font-size-caption)",
                      lineHeight: 1.55,
                      margin: "var(--spacing-2xs) 0 0",
                    }}
                  >
                    {error}
                  </p>
                </div>
              )}

              {!isLoading && !error && data && !data.profile && (
                <div
                  className="flex flex-col"
                  style={{
                    gap: "var(--spacing-md)",
                    padding: "var(--spacing-md)",
                    borderRadius: "var(--radius-card)",
                    background: "color-mix(in srgb, var(--secondary) 8%, var(--background))",
                  }}
                >
                  <p
                    className="text-foreground"
                    style={{
                      fontFamily: FONT,
                      fontSize: "var(--font-size-body)",
                      fontWeight: "var(--font-weight-semibold)" as unknown as number,
                      margin: 0,
                    }}
                  >
                    {locale === "vi"
                      ? "Cần chọn hoặc upload CV trong Profile"
                      : "Choose or upload a CV in Profile first"}
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontFamily: FONT,
                      fontSize: "var(--font-size-small)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {locale === "vi"
                      ? "Jobs matching chỉ hoạt động khi hệ thống đã có một CV đã lưu. Mở trang Profile để upload CV mới hoặc chọn lại hồ sơ hiện có."
                      : "Job matching only works after the system has a saved CV. Open Profile to upload a new CV or choose an existing profile."}
                  </p>
                  <Button
                    onClick={() => navigate("/chat/profile")}
                    variant="secondary"
                    size={isDesktop ? "sm" : "lg"}
                    className="w-full sm:w-fit"
                  >
                    {locale === "vi" ? "Đi tới Profile" : "Go to Profile"}
                  </Button>
                </div>
              )}

              {!isLoading && data?.analysisMarkdown && data?.matches?.length ? (
                <div
                  className="min-w-0 w-full"
                  style={{
                    marginTop: "-var(--spacing-sm)",
                    paddingTop: 0,
                    paddingBottom: isMobile ? "var(--spacing-2xs)" : 0,
                  }}
                >
                  <div
                    className="min-w-0 w-full"
                    style={{
                      borderRadius: isMobile ? "16px" : "18px",
                      background: isMobile
                        ? "color-mix(in srgb, var(--secondary) 4%, var(--background))"
                        : "transparent",
                      padding: isMobile ? "var(--spacing-sm)" : 0,
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                  <MarkdownContent
                    content={data.analysisMarkdown}
                    variant="report"
                    density={isDesktop ? "comfortable" : "compact"}
                  />
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {bestMatch && (
            <Card
              className="gap-4 overflow-hidden rounded-[20px] border-0 shadow-none sm:rounded-[24px] sm:gap-5"
              style={{
                ...CARD_SURFACE_ACCENT_STYLE,
              }}
            >
              <CardHeader>
                <div className={isDesktop ? "flex items-start justify-between" : "flex min-w-0 flex-col items-start"} style={{ gap: "var(--spacing-md)" }}>
                  <div className="min-w-0 w-full" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xs)" }}>
                    <CardTitle
                      className="text-foreground"
                      style={CARD_TITLE_STYLE}
                    >
                      {locale === "vi" ? "Chi tiết job phù hợp nhất" : "Best match details"}
                    </CardTitle>
                    <CardDescription
                      style={CARD_DESCRIPTION_STYLE}
                    >
                      {bestMatch.job.title}
                      {bestMatch.job.company ? ` · ${bestMatch.job.company}` : ""}
                    </CardDescription>
                  </div>

                  <Badge
                    variant="secondary"
                    className="rounded-[8px] px-3 py-1.5 text-[13px] font-semibold shadow-none"
                    style={{ alignSelf: isDesktop ? "auto" : "flex-start" }}
                  >
                    {formatScore(bestMatch.overallScore)}/10
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="min-w-0">
                <div
                  className="grid min-w-0"
                  style={{
                    gridTemplateColumns: isDesktop ? "repeat(3, minmax(0, 1fr))" : "1fr",
                    gap: isDesktop ? "var(--spacing-md)" : "var(--spacing-sm)",
                  }}
                >
                  <ScoreRow label="Domain Knowledge" dimension={bestMatch.domainKnowledge} />
                  <ScoreRow label="Working Experience" dimension={bestMatch.workingExperience} />
                  <ScoreRow label="Requirements of Skills" dimension={bestMatch.requirementsOfSkills} />
                </div>

                <JobUrlBlock url={bestMatch.job.url} locale={locale} isDesktop={isDesktop} />

                <div
                  style={{
                    marginTop: "var(--spacing-md)",
                    ...CARD_INSET_STYLE,
                    padding: "var(--spacing-md)",
                  }}
                >
                  <p
                    className="text-foreground"
                    style={{
                      fontFamily: FONT,
                      fontSize: "var(--font-size-small)",
                      fontWeight: "var(--font-weight-semibold)" as unknown as number,
                      margin: 0,
                      marginBottom: "var(--spacing-2xs)",
                    }}
                  >
                    {locale === "vi" ? "Khuyến nghị cuối" : "Final recommendation"}
                  </p>
                    <p
                      className="text-muted-foreground"
                      style={CARD_TEXT_STYLE}
                    >
                      {bestMatch.finalRecommendation}
                    </p>
                </div>
              </CardContent>
            </Card>
          )}

          {data?.matches?.length ? (
          <>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
            <BarChart3 className="text-secondary" style={{ width: "18px", height: "18px" }} />
            <h2
              className="text-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-body)",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                margin: 0,
              }}
            >
                      {locale === "vi" ? "Top jobs phù hợp nhất" : "Top matching jobs"}
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            {topJobMatches.map((match) => {
              return (
                <Card
                  key={match.job.id}
                  className="gap-4 overflow-hidden rounded-[20px] border-0 shadow-none sm:rounded-[24px] sm:gap-5"
                  style={CARD_SURFACE_STYLE}
                >
                  <CardHeader>
                    <div className={isDesktop ? "flex items-start justify-between" : "flex min-w-0 flex-col items-start"} style={{ gap: "var(--spacing-sm)" }}>
                      <div className="min-w-0 w-full">
                        <CardTitle
                          className="text-foreground"
                          style={CARD_TITLE_STYLE}
                        >
                          {match.job.title || (locale === "vi" ? "Không có tiêu đề" : "Untitled job")}
                        </CardTitle>
                        <CardDescription
                          style={{
                            ...CARD_DESCRIPTION_STYLE,
                            marginTop: "var(--spacing-2xs)",
                          }}
                        >
                          {match.job.company || (locale === "vi" ? "Chưa rõ công ty" : "Company not specified")}
                        </CardDescription>
                      </div>

                    <Badge
                      variant="secondary"
                      className="rounded-[8px] px-3 py-1.5 text-[13px] font-semibold shadow-none"
                      style={{ whiteSpace: "nowrap", alignSelf: isDesktop ? "auto" : "flex-start" }}
                    >
                      {formatScore(match.overallScore)}/10
                    </Badge>
                  </div>

                    <div className="flex flex-wrap" style={{ gap: "var(--spacing-xs)", marginTop: "var(--spacing-xs)" }}>
                      {match.job.location && (
                        <Badge
                          variant="secondary"
                          className="max-w-full capitalize rounded-full px-2.5 py-1 text-[12px] font-medium shadow-none"
                          style={{ gap: "var(--spacing-2xs)", overflowWrap: "anywhere" }}
                        >
                          <MapPin style={{ width: "12px", height: "12px" }} />
                          {match.job.location}
                        </Badge>
                      )}
                      {match.job.level && (
                        <Badge
                          variant="secondary"
                          className="max-w-full capitalize rounded-full px-2.5 py-1 text-[12px] font-medium shadow-none"
                          style={{ gap: "var(--spacing-2xs)", overflowWrap: "anywhere" }}
                        >
                          <Clock3 style={{ width: "12px", height: "12px" }} />
                          {match.job.level}
                        </Badge>
                      )}
                      {match.job.domain && (
                        <Badge
                          variant="secondary"
                          className="max-w-full rounded-full px-2.5 py-1 text-[12px] font-medium shadow-none"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {match.job.domain}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="min-w-0">
                    <div
                      className="grid min-w-0"
                      style={{
                        gridTemplateColumns: isDesktop ? "repeat(3, minmax(0, 1fr))" : "1fr",
                        gap: isDesktop ? "var(--spacing-md)" : "var(--spacing-sm)",
                      }}
                    >
                      <ScoreRow label="Domain Knowledge" dimension={match.domainKnowledge} />
                      <ScoreRow label="Working Experience" dimension={match.workingExperience} />
                      <ScoreRow label="Requirements of Skills" dimension={match.requirementsOfSkills} />
                    </div>

                    <JobUrlBlock url={match.job.url} locale={locale} isDesktop={isDesktop} />

                    <div
                      style={{
                        marginTop: "var(--spacing-md)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-xs)",
                        ...CARD_INSET_STYLE,
                        padding: "var(--spacing-md)",
                      }}
                    >
                      <p
                        className="text-foreground"
                        style={{
                          fontFamily: FONT,
                          fontSize: "var(--font-size-small)",
                          fontWeight: "var(--font-weight-semibold)" as unknown as number,
                          margin: 0,
                        }}
                      >
                        {locale === "vi" ? "Khuyến nghị" : "Recommendation"}
                      </p>
                      <p
                        className="text-muted-foreground"
                        style={{
                          fontFamily: FONT,
                          fontSize: "var(--font-size-small)",
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {match.finalRecommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          </>
          ) : null}

        </div>

        <div className="min-w-0 w-full" style={{ display: "flex", flexDirection: "column", gap: isDesktop ? "var(--spacing-lg)" : "var(--spacing-md)" }}>
          <Card
            className="gap-4 overflow-hidden rounded-[20px] border-0 shadow-none sm:rounded-[24px] sm:gap-5"
            style={{
              ...CARD_SURFACE_STYLE,
              position: isDesktop ? "sticky" : "relative",
              top: isDesktop ? "var(--spacing-xl)" : undefined,
              alignSelf: "start",
            }}
          >
            <CardHeader>
              <CardTitle
                className="text-foreground"
                style={CARD_TITLE_STYLE}
              >
                {locale === "vi" ? "Dữ liệu CV đã lưu" : "Saved CV data"}
              </CardTitle>
              <CardDescription
                style={CARD_DESCRIPTION_STYLE}
              >
                {data?.profile
                  ? `${data.profile.fullName || "N/A"}${data.profile.jobTitle ? ` · ${data.profile.jobTitle}` : ""}`
                  : locale === "vi"
                    ? "Chưa tìm thấy hồ sơ CV đã lưu."
                    : "No saved CV profile found."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data?.profile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                  <div className="flex flex-wrap items-center" style={{ gap: "var(--spacing-xs)" }}>
                    <Badge
                      variant="secondary"
                      className="max-w-full rounded-[8px] px-3 py-1.5 text-[13px] font-semibold shadow-none"
                    >
                      {data.profile.fileName || "CV"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="max-w-full rounded-[8px] px-3 py-1.5 text-[13px] font-medium shadow-none"
                    >
                      {new Date(data.profile.parsedAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                    </Badge>
                  </div>

                  {data.profile.experienceSummary && (
                    <p
                      className="text-muted-foreground"
                      style={CARD_TEXT_STYLE}
                    >
                      {data.profile.experienceSummary}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  className="flex flex-col"
                  style={{ gap: "var(--spacing-md)" }}
                >
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontFamily: FONT,
                      fontSize: "var(--font-size-small)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {locale === "vi"
                      ? "Hãy lưu CV vào Profile để hệ thống đọc dữ liệu đã lưu rồi so sánh với danh sách việc làm."
                      : "Save your CV in Profile so the system can compare it with the saved job list."}
                  </p>
                  <div className="flex flex-col" style={{ gap: "var(--spacing-xs)" }}>
                    <Button variant="secondary" onClick={() => navigate("/chat/profile")} style={{ width: "100%" }}>
                      {locale === "vi" ? "Mở Profile" : "Open Profile"}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate("/chat")} style={{ width: "100%" }}>
                      {locale === "vi" ? "Quay lại Chat" : "Back to Chat"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gap-4 overflow-hidden rounded-[20px] border-0 shadow-none sm:rounded-[24px] sm:gap-5" style={CARD_SURFACE_STYLE}>
            <CardHeader>
              <CardTitle
                className="text-foreground"
                style={CARD_TITLE_STYLE}
              >
                {locale === "vi" ? "Cách hiểu kết quả" : "How the results work"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col" style={{ gap: "var(--spacing-md)" }}>
                <div className="flex items-start" style={{ gap: "var(--spacing-sm)" }}>
                  <TrendingUp className="text-secondary shrink-0" style={{ width: "16px", height: "16px", marginTop: "2px" }} />
                  <p className="text-muted-foreground" style={CARD_TEXT_STYLE}>
                    {locale === "vi"
                      ? "Điểm cao hơn nghĩa là job đó khớp tốt hơn với domain, kinh nghiệm và skills của CV."
                      : "Higher scores mean the job matches your domain, experience, and skills more closely."}
                  </p>
                </div>
                <div className="flex items-start" style={{ gap: "var(--spacing-sm)" }}>
                  <Sparkles className="text-secondary shrink-0" style={{ width: "16px", height: "16px", marginTop: "2px" }} />
                  <p className="text-muted-foreground" style={CARD_TEXT_STYLE}>
                    {locale === "vi"
                      ? "AI viết phần đánh giá cuối cùng, còn dữ liệu nền được lấy từ hồ sơ đã lưu."
                      : "The AI writes the final assessment, while the underlying data comes from the saved profile."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
