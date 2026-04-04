import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Building2,
  Calendar,
  Trash2,
  RefreshCw,
  ChevronLeft,
  Plus,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { useI18n } from "../lib/i18n";
import { Button } from "../components/ui/button";
import { MobileSidebarButton } from "../components/mobile/MobileSidebarButton";
import { ScrollArea } from "../components/ui/scroll-area";
import { cn } from "../components/ui/utils";
import { CVUploadModal } from "../components/chat/CVUploadModal";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { getParseQuotaSummary, recordParseQuotaUsage } from "../lib/parseQuota";
import { buildSessionHeaders, useSessionIdentity } from "../lib/sessionScope";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface ParsedCVProfile {
  id: string;
  fullName: string;
  jobTitle: string;
  experienceSummary: string;
  recentPositions: Array<{
    company: string;
    role: string;
    period: string;
    highlights: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  skills: string[];
  tools: string[];
  languages: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string;
  }>;
  rawTextLength: number;
  parsedAt: string;
  fileUrl: string;
  fileName: string;
}

/** Lightweight summary for the list view */
interface CVProfileSummary {
  id: string;
  full_name: string;
  job_title: string;
  file_name: string;
  parsed_at: string;
  file_url: string;
}

/* ------------------------------------------------------------------ */
/*  API URLs                                                            */
/* ------------------------------------------------------------------ */
const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d`;
const UPLOAD_URL = `${BASE}/upload-cv`;
const PARSE_URL = `${BASE}/parse-cv`;
const PARSE_IMAGE_URL = `${BASE}/parse-cv-image`;
const PROFILES_URL = `${BASE}/cv-profiles`;
const PROFILE_URL = `${BASE}/cv-profile`;
const REPARSE_URL = `${BASE}/parse-cv-image`;

/* ------------------------------------------------------------------ */
/*  File type helpers                                                   */
/* ------------------------------------------------------------------ */
const DOCUMENT_EXTS = ["pdf", "docx", "doc", "txt"];
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];
const ALL_ACCEPTED_EXTS = [...DOCUMENT_EXTS, ...IMAGE_EXTS];
const FILE_ACCEPT = ".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp";

function isImageFile(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return IMAGE_EXTS.includes(ext);
}

/* ------------------------------------------------------------------ */
/*  Parsing step states                                                 */
/* ------------------------------------------------------------------ */
type ParseStep = "idle" | "uploading" | "extracting" | "analyzing" | "retrying" | "done" | "error";

const STEP_LABELS_VI: Record<ParseStep, string> = {
  idle: "",
  uploading: "Đang tải file lên...",
  extracting: "Đang trích xuất nội dung...",
  analyzing: "AI đang phân tích hồ sơ...",
  retrying: "Đang thử lại bằng AI Vision...",
  done: "Phân tích hoàn tất!",
  error: "Có lỗi xảy ra",
};

const STEP_LABELS_EN: Record<ParseStep, string> = {
  idle: "",
  uploading: "Uploading file...",
  extracting: "Extracting content...",
  analyzing: "AI is analyzing your resume...",
  retrying: "Retrying with AI Vision...",
  done: "Analysis complete!",
  error: "An error occurred",
};

/* ------------------------------------------------------------------ */
/*  View modes                                                          */
/* ------------------------------------------------------------------ */
type ViewMode = "list" | "detail";

/* ------------------------------------------------------------------ */
/*  Neumorphic shadow tokens                                            */
/* ------------------------------------------------------------------ */
const NEU = "6px 6px 14px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.8)";
const NEU_INSET = "inset 3px 3px 8px rgba(0,0,0,0.05), inset -3px -3px 8px rgba(255,255,255,0.7)";
const NEU_HOVER = "4px 4px 10px rgba(0,0,0,0.08), -3px -3px 10px rgba(255,255,255,0.9)";
const NEU_INNER = "inset 2px 2px 4px rgba(0,0,0,0.03), inset -1px -1px 3px rgba(255,255,255,0.5)";
const FONT = "'Inter', sans-serif";

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export function ProfilePage() {
  const isDesktop = useIsDesktop();
  const isMobile = !isDesktop;
  const { locale, t } = useI18n();
  const identity = useSessionIdentity();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);

  /* ── State ── */
  const [profiles, setProfiles] = useState<CVProfileSummary[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ParsedCVProfile | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [step, setStep] = useState<ParseStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reparsingId, setReparsingId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const stepLabels = locale === "vi" ? STEP_LABELS_VI : STEP_LABELS_EN;

  useEffect(() => {
    setProfiles([]);
    setSelectedProfile(null);
    setViewMode("list");
    setStep("idle");
    setErrorMsg("");
    setIsLoadingList(true);
    setDeletingId(null);
    setReparsingId(null);
    setShowUploadModal(false);
  }, [identity.scopeKey]);

  /* ── Load list of CV profiles ── */
  const loadProfiles = useCallback(async () => {
    try {
      setIsLoadingList(true);
      const res = await fetch(PROFILES_URL, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          ...buildSessionHeaders(identity),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
      }
    } catch (err) {
      // Error handling
    } finally {
      setIsLoadingList(false);
    }
  }, [identity]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  /* ── Load single profile detail ── */
  const loadProfileDetail = useCallback(async (id: string) => {
    try {
      setIsLoadingDetail(true);
      setViewMode("detail");
      const res = await fetch(`${PROFILE_URL}?id=${id}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          ...buildSessionHeaders(identity),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          setSelectedProfile({
            ...p,
            recentPositions: Array.isArray(p.recentPositions) ? p.recentPositions : [],
            education: Array.isArray(p.education) ? p.education : [],
          });
        }
      }
    } catch (err) {
      // Error handling
    } finally {
      setIsLoadingDetail(false);
    }
  }, [identity]);

  /* ── Re-parse profile (Vision OCR) ── */
  const handleReparseProfile = useCallback(async (p: CVProfileSummary) => {
    if (!p.file_url || reparsingId) return;

    const parseQuota = getParseQuotaSummary(identity);
    if (!parseQuota.canParse) {
      setErrorMsg(
        parseQuota.isUnlimited
          ? t.legal.parseQuotaUnlimited
          : parseQuota.upgradeAvailable
          ? t.legal.parseQuotaLoginHint
          : parseQuota.guestRemaining > 0
            ? t.legal.parseQuotaAccountHint
            : t.legal.parseQuotaLocked,
      );
      setStep("error");
      return;
    }

    try {
      setReparsingId(p.id);
      let visionUrl = p.file_url;
      const ext = p.file_name.split(".").pop()?.toLowerCase() || "";
      if (ext === "pdf" && p.file_url.includes("/upload/")) {
        visionUrl = p.file_url.replace("/upload/", "/upload/pg_1,c_limit,w_2048,h_2048,q_auto,f_jpg/");
      } else if (!IMAGE_EXTS.includes(ext)) {
        return;
      }
      const res = await fetch(REPARSE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          ...buildSessionHeaders(identity),
        },
        body: JSON.stringify({ imageUrl: visionUrl, fileName: p.file_name, baseUrl: p.file_url }),
      });
      const data = await res.json();
      if (res.status === 429 || data?.quotaCounted) {
        recordParseQuotaUsage(identity);
      }
      if (!res.ok) { await loadProfiles(); return; }
      await fetch(`${PROFILE_URL}?id=${p.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          ...buildSessionHeaders(identity),
        },
      });
      await loadProfiles();
      if (data.profile?.id) loadProfileDetail(data.profile.id);
    } catch { await loadProfiles(); } finally { setReparsingId(null); }
  }, [reparsingId, loadProfiles, loadProfileDetail, identity, t]);

  /* ── Upload + Parse flow ── */
  const handleFileSelected = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALL_ACCEPTED_EXTS.includes(ext)) {
      setErrorMsg(locale === "vi" ? "Định dạng không hỗ trợ." : "Unsupported format.");
      setStep("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(locale === "vi" ? "File quá lớn. Tối đa 10MB." : "File too large. Maximum 10MB.");
      setStep("error");
      return;
    }

    const parseQuota = getParseQuotaSummary(identity);
    if (!parseQuota.canParse) {
      setErrorMsg(
        parseQuota.isUnlimited
          ? t.legal.parseQuotaUnlimited
          : parseQuota.upgradeAvailable
          ? t.legal.parseQuotaLoginHint
          : parseQuota.guestRemaining > 0
            ? t.legal.parseQuotaAccountHint
            : t.legal.parseQuotaLocked,
      );
      setStep("error");
      return;
    }

    setStep("uploading");
    setErrorMsg("");
    lastFileRef.current = file;
    try {
      const uploadController = new AbortController();
      const uploadTimer = setTimeout(() => uploadController.abort(), 30000);
      let uploadRes: Response;
      try {
        const formData = new FormData();
        formData.append("file", file);
        uploadRes = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            ...buildSessionHeaders(identity),
          },
          body: formData,
          signal: uploadController.signal,
        });
      } catch (uploadErr) {
        clearTimeout(uploadTimer);
        throw new Error(uploadErr instanceof DOMException && uploadErr.name === "AbortError"
          ? (locale === "vi" ? "Upload quá thời gian (30s)." : "Upload timed out (30s).")
          : (locale === "vi" ? "Không thể kết nối server." : "Cannot connect to server."));
      }
      clearTimeout(uploadTimer);
      if (!uploadRes.ok) { const err = await uploadRes.json().catch(() => ({})); throw new Error(err.error || `Upload failed: ${uploadRes.status}`); }
      const uploadData = await uploadRes.json();

      setStep("extracting");
      await new Promise((r) => setTimeout(r, 500));
      setStep("analyzing");

      const parseController = new AbortController();
      const parseTimer = setTimeout(() => parseController.abort(), 90000);
      let parseRes: Response;
      try {
        if (isImageFile(file.name)) {
          parseRes = await fetch(PARSE_IMAGE_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
              ...buildSessionHeaders(identity),
            },
            body: JSON.stringify({ imageUrl: uploadData.url, fileName: file.name }),
            signal: parseController.signal,
          });
        } else {
          const parseFormData = new FormData();
          parseFormData.append("file", file);
          parseFormData.append("fileUrl", uploadData.url || "");
          parseFormData.append("imagePreviewUrl", uploadData.imagePreviewUrl || "");
          parseFormData.append("fileName", file.name);
          parseFormData.append("pageCount", String(uploadData.pages || 1));
          parseRes = await fetch(PARSE_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              ...buildSessionHeaders(identity),
            },
            body: parseFormData,
            signal: parseController.signal,
          });
        }
      } catch (parseErr) {
        clearTimeout(parseTimer);
        throw new Error(parseErr instanceof DOMException && parseErr.name === "AbortError"
          ? (locale === "vi" ? "Phân tích CV quá thời gian (90s)." : "CV parsing timed out (90s).")
          : (locale === "vi" ? "Mất kết nối trong quá trình phân tích." : "Connection lost during analysis."));
      }
      clearTimeout(parseTimer);

      const parseData = await parseRes.json().catch(() => ({}));
      if (parseRes.status === 429 || parseData?.quotaCounted) {
        recordParseQuotaUsage(identity);
      }

      if (!parseRes.ok) {
        throw new Error(parseData.error || `Parse failed: ${parseRes.status}`);
      }

      if (parseData.profile) {
        setStep("done"); await loadProfiles();
        if (parseData.profile.id) loadProfileDetail(parseData.profile.id);
        setTimeout(() => setStep("idle"), 3000);
      } else {
        throw new Error("No profile data returned");
      }
    } catch (err) {
      setErrorMsg(String(err instanceof Error ? err.message : err));
      setStep("error");
    }
  }, [locale, loadProfiles, loadProfileDetail, identity, t]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [handleFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setShowUploadModal(true); }, []);

  /* ── Delete profile ── */
  const handleDeleteProfile = useCallback(async (id: string) => {
    try {
      setDeletingId(id);
      await fetch(`${PROFILE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          ...buildSessionHeaders(identity),
        },
      });
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      if (selectedProfile?.id === id) { setSelectedProfile(null); setViewMode("list"); }
    } catch (err) {
      // Error handling
    } finally { setDeletingId(null); }
  }, [selectedProfile, identity]);

  /* ── Render ── */
  const isProcessing = ["uploading", "extracting", "analyzing", "retrying"].includes(step);

  return (
    <ScrollArea className="flex-1 h-0 min-w-0">
      <div
        className="mx-auto w-full min-w-0 overflow-x-hidden"
        style={{
          maxWidth: isDesktop ? "780px" : undefined,
          padding: isDesktop ? "var(--spacing-xl)" : "var(--spacing-xs)",
          paddingBottom: isDesktop ? "var(--spacing-xl)" : "calc(96px + env(safe-area-inset-bottom))",
          boxSizing: "border-box",
        }}
      >
        {/* ── Page Header ── */}
        {!isDesktop && (
          <div
            className="sticky top-0 z-20"
            style={{
              paddingTop: "calc(var(--spacing-xs) + env(safe-area-inset-top))",
              paddingBottom: "var(--spacing-xs)",
              marginBottom: "var(--spacing-sm)",
              background: "color-mix(in srgb, var(--background) 92%, transparent)",
              backdropFilter: "blur(18px)",
            }}
          >
            <div className="flex w-full items-center" style={{ boxSizing: "border-box" }}>
              <MobileSidebarButton />
            </div>
          </div>
        )}

        <div className="min-w-0 w-full" style={{ marginBottom: isDesktop ? "var(--spacing-xl)" : "var(--spacing-lg)" }}>
          {viewMode === "detail" && (
            <button
              onClick={() => { setViewMode("list"); setSelectedProfile(null); }}
              className="flex items-center text-secondary bg-transparent border-0 cursor-pointer"
              style={{
                fontFamily: FONT, fontSize: "var(--font-size-small)",
                fontWeight: "var(--font-weight-medium)" as unknown as number,
                gap: "var(--spacing-2xs)", marginBottom: "var(--spacing-md)",
                padding: "var(--spacing-sm) var(--spacing-base)",
                minHeight: "var(--touch-target-min)",
                borderRadius: "var(--radius-button)",
                background: "color-mix(in srgb, var(--secondary) 8%, transparent)",
              }}
            >
              <ChevronLeft style={{ width: "16px", height: "16px" }} />
              {locale === "vi" ? "Tất cả hồ sơ" : "All profiles"}
            </button>
          )}
          <div style={{ width: "48px", height: "4px", borderRadius: "2px", background: "linear-gradient(90deg, var(--secondary), var(--primary))", marginBottom: "var(--spacing-sm)" }} />
          <h1 className="text-foreground" style={{ fontFamily: FONT, fontSize: isDesktop ? "var(--font-size-h1)" : "var(--font-size-h2)", fontWeight: "var(--font-weight-semibold)" as unknown as number, lineHeight: 1.2, margin: 0 }}>
            {locale === "vi" ? "Hồ sơ nghề nghiệp" : "Career Profile"}
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-normal)" as unknown as number, lineHeight: 1.6, margin: 0, marginTop: "var(--spacing-xs)" }}>
            {viewMode === "list"
              ? locale === "vi" ? "Upload CV để AI phân tích và trích xuất thông tin hồ sơ của bạn." : "Upload your CV for AI to analyze and extract your profile information."
              : locale === "vi" ? "Chi tiết hồ sơ được AI phân tích từ CV." : "Profile details analyzed by AI from your CV."}
          </p>
        </div>


        {/* ── Upload Area — Neumorphic ── */}
        <div
          className="min-w-0 w-full cursor-pointer transition-all duration-300"
          style={{
            borderRadius: "var(--radius-card)",
            padding: isDesktop ? "var(--spacing-xl)" : "var(--spacing-md)",
            marginBottom: "var(--spacing-lg)",
            background: isProcessing ? "color-mix(in srgb, var(--secondary) 5%, var(--background))" : step === "error" ? "color-mix(in srgb, var(--destructive) 4%, var(--background))" : step === "done" ? "color-mix(in srgb, var(--color-success) 5%, var(--background))" : "var(--muted)",
            boxShadow: isProcessing ? NEU_INSET : NEU,
            border: step === "error" ? "1.5px solid color-mix(in srgb, var(--destructive) 30%, transparent)" : step === "done" ? "1.5px solid color-mix(in srgb, var(--color-success) 30%, transparent)" : "1.5px solid transparent",
            boxSizing: "border-box",
          }}
          onClick={() => !isProcessing && setShowUploadModal(true)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input ref={fileInputRef} type="file" accept={FILE_ACCEPT} onChange={handleFileChange} className="hidden" />
          <div className="flex flex-col items-center text-center" style={{ gap: "var(--spacing-sm)" }}>
            {isProcessing ? (
              <div className="flex items-center justify-center" style={{ width: "64px", height: "64px", borderRadius: "50%", background: "color-mix(in srgb, var(--secondary) 12%, var(--background))", boxShadow: NEU_INSET }}>
                <Loader2 className="text-secondary animate-spin" style={{ width: "28px", height: "28px" }} />
              </div>
            ) : step === "done" ? (
              <div className="flex items-center justify-center" style={{ width: "64px", height: "64px", borderRadius: "50%", background: "color-mix(in srgb, var(--color-success) 10%, var(--background))", boxShadow: NEU }}>
                <CheckCircle2 style={{ width: "28px", height: "28px", color: "var(--color-success)" }} />
              </div>
            ) : step === "error" ? (
              <div className="flex items-center justify-center" style={{ width: "64px", height: "64px", borderRadius: "50%", background: "color-mix(in srgb, var(--destructive) 8%, var(--background))", boxShadow: NEU }}>
                <AlertCircle className="text-destructive" style={{ width: "28px", height: "28px" }} />
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 15%, var(--background)), color-mix(in srgb, var(--primary) 8%, var(--background)))", boxShadow: NEU }}>
                <Upload className="text-secondary" style={{ width: "28px", height: "28px" }} />
              </div>
            )}

            <p className={cn(step === "error" ? "text-destructive" : "text-foreground")} style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-medium)" as unknown as number, margin: 0 }}>
              {isProcessing || step === "done" || step === "error" ? stepLabels[step] : locale === "vi" ? "Kéo thả file CV hoặc nhấn để chọn" : "Drag & drop your CV or click to browse"}
            </p>

            {step === "idle" && (
              <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: "var(--font-weight-normal)" as unknown as number, margin: 0 }}>
                PDF, DOCX, DOC, TXT, JPG, PNG, WEBP — {locale === "vi" ? "Tối đa 10MB" : "Max 10MB"}
              </p>
            )}

            {step === "error" && errorMsg && (
              <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: "var(--font-weight-normal)" as unknown as number, margin: 0, maxWidth: "400px" }}>{errorMsg}</p>
            )}

            {step === "error" && (
              <div
                className={isDesktop ? "flex items-center" : "flex w-full flex-col"}
                style={{ gap: "var(--spacing-xs)" }}
              >
                {lastFileRef.current && (
                <Button
                  variant="secondary"
                  size={isDesktop ? "sm" : "lg"}
                  onClick={(e) => { e.stopPropagation(); if (lastFileRef.current) handleFileSelected(lastFileRef.current); }}
                  className="w-full sm:w-auto"
                  style={{ fontSize: "var(--font-size-small)", gap: "var(--spacing-2xs)" }}
                >
                    <RefreshCw style={{ width: "14px", height: "14px" }} /> {locale === "vi" ? "Thử lại" : "Retry"}
                </Button>
                )}
                <Button
                  variant="outline"
                  size={isDesktop ? "sm" : "lg"}
                  onClick={(e) => { e.stopPropagation(); setStep("idle"); setErrorMsg(""); lastFileRef.current = null; }}
                  className="w-full sm:w-auto"
                  style={{ fontSize: "var(--font-size-small)", gap: "var(--spacing-2xs)" }}
                >
                  {locale === "vi" ? "Đóng" : "Dismiss"}
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center" style={{ gap: "var(--spacing-xs)" }}>
                {(["uploading", "extracting", "analyzing", "retrying"] as const).map((s, i) => {
                  const currentIdx = ["uploading", "extracting", "analyzing", "retrying"].indexOf(step);
                  const isCurrent = step === s;
                  return (
                    <div key={s} className="transition-all duration-500" style={{
                      width: isCurrent ? "28px" : "10px", height: "10px", borderRadius: "5px",
                      background: isCurrent ? "linear-gradient(90deg, var(--secondary), var(--primary))" : currentIdx > i ? "var(--secondary)" : "var(--border)",
                      boxShadow: isCurrent ? "0 2px 6px color-mix(in srgb, var(--secondary) 40%, transparent)" : "none",
                    }} />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══════════ LIST VIEW ══════════ */}
        {viewMode === "list" && (
          <>
            {isLoadingList && profiles.length === 0 && (
              <div className="animate-pulse" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: "88px", borderRadius: "var(--radius-card)", background: "var(--muted)", boxShadow: NEU }} />
                ))}
              </div>
            )}

            {!isLoadingList && profiles.length === 0 && (
              <div className="flex flex-col items-center text-center" style={{ padding: "var(--spacing-xl) var(--spacing-lg)", gap: "var(--spacing-md)", borderRadius: "var(--radius-card)", background: "var(--muted)", boxShadow: NEU }}>
                <div className="flex items-center justify-center" style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--background)", boxShadow: NEU }}>
                  <FileText className="text-muted-foreground" style={{ width: "32px", height: "32px" }} />
                </div>
                <div>
                  <p className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-semibold)" as unknown as number, margin: 0 }}>
                    {locale === "vi" ? "Chưa có hồ sơ nào" : "No profiles yet"}
                  </p>
                  <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: "var(--font-weight-normal)" as unknown as number, margin: 0, marginTop: "var(--spacing-2xs)" }}>
                    {locale === "vi" ? "Hãy upload CV đầu tiên để bắt đầu!" : "Upload your first CV to get started!"}
                  </p>
                </div>
              </div>
            )}

            {profiles.length > 0 && (
              <div className="min-w-0 w-full" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", fontWeight: "var(--font-weight-medium)" as unknown as number, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {locale === "vi" ? `${profiles.length} hồ sơ đã phân tích` : `${profiles.length} profile${profiles.length > 1 ? "s" : ""} analyzed`}
                </p>

                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className="w-full min-w-0 cursor-pointer transition-all duration-200"
                    style={{ borderRadius: "var(--radius-card)", padding: isDesktop ? "var(--spacing-md)" : "var(--spacing-sm)", background: "var(--background)", boxShadow: NEU, border: "1px solid transparent", boxSizing: "border-box", overflow: "hidden" }}
                    onClick={() => loadProfileDetail(p.id)}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = NEU_HOVER; e.currentTarget.style.borderColor = "color-mix(in srgb, var(--secondary) 25%, transparent)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = NEU; e.currentTarget.style.borderColor = "transparent"; }}
                  >
                    <div
                      className={isDesktop ? "flex min-w-0 items-center" : "flex min-w-0 flex-col items-start"}
                      style={{ gap: isDesktop ? "var(--spacing-sm)" : "var(--spacing-md)" }}
                    >
                      <div className="flex items-center justify-center shrink-0" style={{ width: "48px", height: "48px", borderRadius: "var(--radius-card)", background: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 18%, var(--background)), color-mix(in srgb, var(--primary) 12%, var(--background)))", boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.5), inset -1px -1px 3px rgba(0,0,0,0.05)", alignSelf: isDesktop ? undefined : "flex-start" }}>
                        <User className="text-primary" style={{ width: "22px", height: "22px" }} />
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <p className={isDesktop ? "text-foreground truncate" : "text-foreground break-words"} style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-semibold)" as unknown as number, margin: 0, lineHeight: 1.3 }}>
                          {p.full_name || (locale === "vi" ? "Chưa xác định" : "Unknown")}
                        </p>
                        {p.job_title && (
                          <p className={isDesktop ? "text-secondary truncate" : "text-secondary break-words"} style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: "var(--font-weight-medium)" as unknown as number, margin: 0, marginTop: "var(--spacing-2xs)" }}>{p.job_title}</p>
                        )}
                        <div className={isDesktop ? "flex min-w-0 items-center flex-wrap" : "flex min-w-0 w-full flex-col"} style={{ gap: isDesktop ? "var(--spacing-sm)" : "var(--spacing-2xs)", marginTop: "var(--spacing-2xs)" }}>
                          <span className="text-muted-foreground flex items-center min-w-0 max-w-full" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", fontWeight: "var(--font-weight-normal)" as unknown as number, gap: "var(--spacing-2xs)", width: isDesktop ? undefined : "100%" }}>
                            <FileText style={{ width: "12px", height: "12px", flexShrink: 0 }} />
                            <span className="truncate max-w-full" style={{ maxWidth: isDesktop ? "240px" : "100%" }}>{p.file_name}</span>
                          </span>
                          <span className="text-muted-foreground flex items-center min-w-0" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", fontWeight: "var(--font-weight-normal)" as unknown as number, gap: "var(--spacing-2xs)", width: isDesktop ? undefined : "100%" }}>
                            <Calendar style={{ width: "12px", height: "12px", flexShrink: 0 }} />
                            {new Date(p.parsed_at).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <div
                        className={isDesktop ? "flex items-center shrink-0" : "flex w-full items-center justify-end"}
                        style={{
                          gap: "var(--spacing-2xs)",
                          paddingTop: isDesktop ? 0 : "var(--spacing-2xs)",
                          borderTop: isDesktop ? "none" : "1px solid color-mix(in srgb, var(--border) 75%, transparent)",
                        }}
                      >
                        {!p.full_name && p.file_url && (
                          <Button variant="ghost" size={isDesktop ? "icon" : "touch"} className="text-secondary hover:text-secondary" onClick={(e) => { e.stopPropagation(); handleReparseProfile(p); }} disabled={reparsingId === p.id} style={{ fontSize: "var(--font-size-small)" }}>
                            {reparsingId === p.id ? <Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> : <RefreshCw style={{ width: "16px", height: "16px" }} />}
                          </Button>
                        )}
                        <Button variant="ghost" size={isDesktop ? "icon" : "touch"} onClick={(e) => { e.stopPropagation(); loadProfileDetail(p.id); }} style={{ fontSize: "var(--font-size-small)" }}>
                          <Eye style={{ width: "16px", height: "16px" }} />
                        </Button>
                        <Button variant="ghost" size={isDesktop ? "icon" : "touch"} className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteProfile(p.id); }} disabled={deletingId === p.id} style={{ fontSize: "var(--font-size-small)" }}>
                          {deletingId === p.id ? <Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> : <Trash2 style={{ width: "16px", height: "16px" }} />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════ DETAIL VIEW ══════════ */}
        {viewMode === "detail" && (
          <>
            {isLoadingDetail && !selectedProfile && (
              <div className="animate-pulse" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                <div style={{ height: "140px", borderRadius: "var(--radius-card)", background: "var(--muted)", boxShadow: NEU }} />
                <div style={{ height: "220px", borderRadius: "var(--radius-card)", background: "var(--muted)", boxShadow: NEU }} />
              </div>
            )}

            {selectedProfile && (
              <div className="min-w-0 w-full" style={{ display: "flex", flexDirection: "column", gap: isDesktop ? "var(--spacing-lg)" : "var(--spacing-md)" }}>

                {/* Header Card — Neumorphic with gradient top */}
                <div className="min-w-0 w-full" style={{ borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--background)", boxShadow: NEU, boxSizing: "border-box" }}>
                  <div style={{ height: "4px", background: "linear-gradient(90deg, var(--secondary), var(--primary), var(--secondary))" }} />
                  <div style={{ padding: isDesktop ? "var(--spacing-lg)" : "var(--spacing-md)" }}>
                    <div className={isDesktop ? "flex min-w-0 items-start" : "flex min-w-0 flex-col"} style={{ gap: "var(--spacing-md)" }}>
                      <div className="flex items-center justify-center shrink-0" style={{ width: isDesktop ? "64px" : "52px", height: isDesktop ? "64px" : "52px", borderRadius: "50%", background: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 20%, var(--background)), color-mix(in srgb, var(--primary) 12%, var(--background)))", boxShadow: NEU }}>
                        <User className="text-primary" style={{ width: isDesktop ? "28px" : "24px", height: isDesktop ? "28px" : "24px" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-foreground" style={{ fontFamily: FONT, fontSize: isDesktop ? "var(--font-size-h2)" : "var(--font-size-body)", fontWeight: "var(--font-weight-semibold)" as unknown as number, margin: 0, lineHeight: 1.3 }}>
                          {selectedProfile.fullName || (locale === "vi" ? "Chưa xác định" : "Unknown")}
                        </h2>
                        {selectedProfile.jobTitle && (
                          <p className="text-secondary" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-medium)" as unknown as number, margin: 0, marginTop: "var(--spacing-2xs)" }}>{selectedProfile.jobTitle}</p>
                        )}
                        {selectedProfile.experienceSummary && (
                          <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: "var(--font-weight-normal)" as unknown as number, margin: 0, marginTop: "var(--spacing-xs)", lineHeight: 1.6 }}>{selectedProfile.experienceSummary}</p>
                        )}
                      </div>
                    </div>
                    {/* Meta chips */}
                    <div className={isDesktop ? "flex min-w-0 items-center flex-wrap" : "flex min-w-0 flex-col"} style={{ marginTop: "var(--spacing-md)", gap: "var(--spacing-xs)" }}>
                      <span className="text-muted-foreground flex items-center min-w-0 max-w-full" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", fontWeight: "var(--font-weight-normal)" as unknown as number, gap: "var(--spacing-2xs)", padding: "var(--spacing-2xs) var(--spacing-xs)", borderRadius: "var(--radius)", background: "var(--muted)", width: isDesktop ? undefined : "100%", boxSizing: "border-box" }}>
                        <FileText style={{ width: "12px", height: "12px" }} />
                        <span className="truncate max-w-full" style={{ maxWidth: isDesktop ? "180px" : "100%" }}>{selectedProfile.fileName}</span>
                      </span>
                      <span className="text-muted-foreground flex items-center min-w-0 max-w-full" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", fontWeight: "var(--font-weight-normal)" as unknown as number, gap: "var(--spacing-2xs)", padding: "var(--spacing-2xs) var(--spacing-xs)", borderRadius: "var(--radius)", background: "var(--muted)", width: isDesktop ? undefined : "100%", boxSizing: "border-box" }}>
                        <Calendar style={{ width: "12px", height: "12px" }} />
                        {new Date(selectedProfile.parsedAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Positions — Neumorphic */}
                {selectedProfile.recentPositions.length > 0 && (
                  <div className="min-w-0 w-full" style={{ borderRadius: "var(--radius-card)", padding: isDesktop ? "var(--spacing-lg)" : "var(--spacing-md)", background: "var(--background)", boxShadow: NEU, boxSizing: "border-box" }}>
                    <div className="flex items-center" style={{ gap: "var(--spacing-xs)", marginBottom: "var(--spacing-md)" }}>
                      <div className="flex items-center justify-center" style={{ width: "32px", height: "32px", borderRadius: "var(--radius)", background: "color-mix(in srgb, var(--secondary) 12%, var(--background))", boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.5)" }}>
                        <Briefcase className="text-secondary" style={{ width: "16px", height: "16px" }} />
                      </div>
                      <h3 className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-semibold)" as unknown as number, margin: 0 }}>
                        {locale === "vi" ? "Kinh nghiệm gần đây" : "Recent Experience"}
                      </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                      {selectedProfile.recentPositions.map((pos, i) => (
                        <div key={`pos-${i}`} className="min-w-0 w-full" style={{ borderLeft: "3px solid var(--secondary)", borderRadius: "0 var(--radius) var(--radius) 0", padding: "var(--spacing-sm)", paddingLeft: "var(--spacing-md)", background: "var(--muted)", boxShadow: NEU_INNER, boxSizing: "border-box" }}>
                          <div className="flex items-center flex-wrap" style={{ gap: "var(--spacing-xs)" }}>
                            <Building2 className="text-muted-foreground" style={{ width: "14px", height: "14px", flexShrink: 0 }} />
                            <span className="text-foreground break-words" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-semibold)" as unknown as number }}>{pos.company}</span>
                          </div>
                          <p className="text-foreground break-words" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: "var(--font-weight-medium)" as unknown as number, margin: 0, marginTop: "var(--spacing-2xs)" }}>{pos.role}</p>
                          {pos.period && <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", fontWeight: "var(--font-weight-normal)" as unknown as number, margin: 0, marginTop: "var(--spacing-2xs)" }}>{pos.period}</p>}
                          {pos.highlights && <p className="text-muted-foreground break-words" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: "var(--font-weight-normal)" as unknown as number, margin: 0, marginTop: "var(--spacing-xs)", lineHeight: 1.6 }}>{pos.highlights}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education — Neumorphic */}
                {selectedProfile.education.length > 0 && (
                  <div className="min-w-0 w-full" style={{ borderRadius: "var(--radius-card)", padding: isDesktop ? "var(--spacing-lg)" : "var(--spacing-md)", background: "var(--background)", boxShadow: NEU, boxSizing: "border-box" }}>
                    <div className="flex items-center" style={{ gap: "var(--spacing-xs)", marginBottom: "var(--spacing-md)" }}>
                      <div className="flex items-center justify-center" style={{ width: "32px", height: "32px", borderRadius: "var(--radius)", background: "color-mix(in srgb, var(--secondary) 12%, var(--background))", boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.5)" }}>
                        <GraduationCap className="text-secondary" style={{ width: "16px", height: "16px" }} />
                      </div>
                      <h3 className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-semibold)" as unknown as number, margin: 0 }}>
                        {locale === "vi" ? "Học vấn — Bằng cấp" : "Education"}
                      </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                      {selectedProfile.education.map((edu, i) => (
                        <div key={`edu-${i}`} className="flex min-w-0 w-full items-start" style={{ gap: "var(--spacing-sm)", padding: "var(--spacing-sm)", borderRadius: "var(--radius)", background: "var(--muted)", boxShadow: NEU_INNER, boxSizing: "border-box" }}>
                          <div className="flex items-center justify-center shrink-0" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--background)", boxShadow: NEU, marginTop: "2px" }}>
                            <GraduationCap className="text-secondary" style={{ width: "16px", height: "16px" }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground break-words" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: "var(--font-weight-semibold)" as unknown as number, margin: 0 }}>{edu.institution}</p>
                            <p className="text-muted-foreground break-words" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: "var(--font-weight-normal)" as unknown as number, margin: 0, marginTop: "var(--spacing-2xs)" }}>{edu.degree}{edu.year ? ` — ${edu.year}` : ""}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state — Neumorphic */}
                {selectedProfile.recentPositions.length === 0 && selectedProfile.education.length === 0 && !selectedProfile.experienceSummary && (
                  <div className="flex min-w-0 w-full flex-col items-center text-center" style={{ borderRadius: "var(--radius-card)", padding: isDesktop ? "var(--spacing-xl)" : "var(--spacing-lg)", gap: "var(--spacing-sm)", background: "var(--muted)", boxShadow: NEU_INSET, boxSizing: "border-box" }}>
                    <div className="flex items-center justify-center" style={{ width: "56px", height: "56px", borderRadius: "50%", background: "color-mix(in srgb, var(--secondary) 10%, var(--background))", boxShadow: NEU }}>
                      <AlertCircle className="text-secondary" style={{ width: "24px", height: "24px" }} />
                    </div>
                    <p className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-medium)" as unknown as number, margin: 0 }}>
                      {locale === "vi" ? "AI chưa trích xuất được chi tiết kinh nghiệm & học vấn" : "AI could not extract experience & education details"}
                    </p>
                    <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: "var(--font-weight-normal)" as unknown as number, margin: 0, maxWidth: "360px", lineHeight: 1.6 }}>
                      {locale === "vi" ? "Thử phân tích lại bằng AI Vision để trích xuất chính xác hơn." : "Try re-analyzing with AI Vision to extract more accurate information."}
                    </p>
                    <Button variant="secondary" size={isDesktop ? "default" : "lg"} disabled={reparsingId === selectedProfile.id} onClick={() => handleReparseProfile({ id: selectedProfile.id, full_name: selectedProfile.fullName, job_title: selectedProfile.jobTitle, file_name: selectedProfile.fileName, parsed_at: selectedProfile.parsedAt, file_url: selectedProfile.fileUrl })} className="w-full sm:w-auto" style={{ fontSize: "var(--font-size-small)", gap: "var(--spacing-xs)", marginTop: "var(--spacing-2xs)" }}>
                      {reparsingId === selectedProfile.id ? <Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> : <RefreshCw style={{ width: "16px", height: "16px" }} />}
                      {locale === "vi" ? "Phân tích lại bằng AI Vision" : "Re-analyze with AI Vision"}
                    </Button>
                  </div>
                )}

                {/* Actions — Neumorphic */}
                <div className={isDesktop ? "flex items-center flex-wrap" : "flex flex-col"} style={{ gap: "var(--spacing-sm)" }}>
                  <Button variant="outline" size={isDesktop ? "default" : "lg"} onClick={() => setShowUploadModal(true)} disabled={isProcessing} className="w-full sm:w-auto" style={{ fontSize: "var(--font-size-small)", gap: "var(--spacing-xs)", boxShadow: NEU, border: "1px solid var(--border)" }}>
                    <Plus style={{ width: "16px", height: "16px" }} /> {locale === "vi" ? "Upload CV mới" : "Upload new CV"}
                  </Button>
                  <Button variant="ghost" size={isDesktop ? "default" : "lg"} onClick={() => handleDeleteProfile(selectedProfile.id)} className="text-destructive hover:text-destructive w-full sm:w-auto" disabled={deletingId === selectedProfile.id} style={{ fontSize: "var(--font-size-small)", gap: "var(--spacing-xs)" }}>
                    {deletingId === selectedProfile.id ? <Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> : <Trash2 style={{ width: "16px", height: "16px" }} />}
                    {locale === "vi" ? "Xoá hồ sơ" : "Delete profile"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CVUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onUploadDocument={(file) => handleFileSelected(file)}
        onUploadImage={(file) => handleFileSelected(file)}
      />
    </ScrollArea>
  );
}
