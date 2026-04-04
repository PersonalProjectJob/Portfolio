import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  CircleCheckBig,
} from "lucide-react";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { useI18n } from "../lib/i18n";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  projectId,
  supabaseDashboardUrl,
  supabaseEdgeFunctionsUrl,
} from "/utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d`;
const HEALTH_AI_URL = `${BASE}/health-ai`;
const FONT = "'Inter', sans-serif";
const NEU = "6px 6px 14px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.8)";
const NEU_INNER = "inset 2px 2px 4px rgba(0,0,0,0.03), inset -1px -1px 3px rgba(255,255,255,0.5)";

interface HealthCheck {
  ok: boolean;
  detail: string;
}

interface HealthResult {
  status: string;
  checks: Record<string, HealthCheck>;
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "999px",
        backgroundColor: ok ? "var(--color-success)" : "var(--destructive)",
        flexShrink: 0,
      }}
    />
  );
}

export function SettingsPage() {
  const isDesktop = useIsDesktop();
  const { locale } = useI18n();
  const [health, setHealth] = useState<HealthResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const copy = useMemo(() => {
    if (locale === "vi") {
      return {
        title: "Cấu hình API",
        description:
          "Kết nối Alibaba DashScope làm nguồn chính cho chat và AI dự phòng khi DashScope hết quota hoặc bị rate-limit.",
        openDashboard: "Mở Supabase Secrets",
        refresh: "Làm mới trạng thái",
        primaryTitle: "Alibaba DashScope",
        primaryDesc:
          "Nguồn chính cho Qwen Turbo / Plus / Max. Dùng cho chat và parse CV text.",
        backupTitle: "AI dự phòng",
        backupDesc:
          "Tự động thay thế khi DashScope cạn quota hoặc bị giới hạn tốc độ. Dùng cho chat và parse CV text.",
        secretTitle: "Secrets cần thêm",
        secretHint:
          "Dán các key này trong Supabase Dashboard > Settings > Edge Functions > Manage Secrets.",
        workflowTitle: "Cách failover hoạt động",
        workflows: [
          "Chat gửi qua DashScope trước để tận dụng model giá rẻ của Alibaba.",
          "Nếu DashScope trả 429 / quota / rate-limit, cùng payload đó được retry qua AI dự phòng.",
          "Parse CV dạng text cũng dùng AI dự phòng khi DashScope hết quota.",
          "Parse CV từ ảnh vẫn cần DashScope Vision; luồng dự phòng hiện chỉ hỗ trợ văn bản.",
        ],
        sourceLabel: "Dashboard gốc",
        primaryKey: "DASHSCOPE_API_KEY",
        backupKey: "AI backup key",
        statusReady: "Sẵn sàng",
        statusMissing: "Thiếu key",
        fallbackReady: "Failover sẵn sàng",
        fallbackMissing: "Chưa bật failover",
      };
    }

    return {
      title: "API settings",
      description:
        "Use Alibaba DashScope as the primary provider and an AI backup when DashScope runs out of quota or hits rate limits.",
      openDashboard: "Open Supabase Secrets",
      refresh: "Refresh status",
      primaryTitle: "Alibaba DashScope",
      primaryDesc:
        "Primary source for Qwen Turbo / Plus / Max. Used for chat and text CV parsing.",
      backupTitle: "AI backup",
      backupDesc:
        "Automatically takes over when DashScope is rate-limited or out of quota. Used for chat and text CV parsing.",
      secretTitle: "Required secrets",
      secretHint:
        "Add these keys in Supabase Dashboard > Settings > Edge Functions > Manage Secrets.",
      workflowTitle: "How failover works",
      workflows: [
        "Chat goes to DashScope first so the app uses Alibaba's lower-cost models.",
        "If DashScope returns 429 / quota / rate-limit, the same payload retries against the AI backup.",
        "Text-based CV parsing also retries on the AI backup when DashScope is exhausted.",
        "Image CV parsing still relies on DashScope Vision; the backup chat API used here is text-only.",
      ],
      sourceLabel: "Dashboard link",
      primaryKey: "DASHSCOPE_API_KEY",
      backupKey: "AI backup key",
      statusReady: "Ready",
      statusMissing: "Missing key",
      fallbackReady: "Failover ready",
      fallbackMissing: "Failover not ready",
    };
  }, [locale]);

  const loadHealth = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(HEALTH_AI_URL);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as HealthResult;
      setHealth(data);
    } catch (err) {
      console.error("[SettingsPage] Failed to load AI health:", err);
      setHealth({
        status: "error",
        checks: {
          dashscope: {
            ok: false,
            detail:
              locale === "vi"
                ? "Không thể kiểm tra trạng thái DashScope."
                : "Could not load DashScope status.",
          },
          deepseek: {
            ok: false,
            detail:
              locale === "vi"
                ? "Không thể kiểm tra trạng thái AI dự phòng."
                : "Could not load AI backup status.",
          },
          fallback: {
            ok: false,
            detail:
              locale === "vi"
                ? "Không thể kiểm tra trạng thái failover."
                : "Could not load failover status.",
          },
        },
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [locale]);

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  const openSupabaseDashboard = useCallback(() => {
    window.open(supabaseEdgeFunctionsUrl, "_blank", "noopener,noreferrer");
  }, []);

  const primaryCheck = health?.checks.dashscope;
  const backupCheck = health?.checks.deepseek;
  const fallbackCheck = health?.checks.fallback;

  return (
    <ScrollArea className="flex-1 h-0">
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: isDesktop ? "920px" : undefined,
          padding: isDesktop ? "var(--spacing-xl)" : "var(--spacing-md)",
          paddingBottom: isDesktop ? "var(--spacing-xl)" : "80px",
        }}
      >
        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: isDesktop ? "96px" : "80px",
              height: isDesktop ? "96px" : "80px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 15%, var(--background)), color-mix(in srgb, var(--primary) 10%, var(--background)))",
              boxShadow: NEU,
              marginBottom: "var(--spacing-md)",
            }}
          >
            <KeyRound
              className="text-primary"
              style={{ width: isDesktop ? "40px" : "32px", height: isDesktop ? "40px" : "32px" }}
            />
          </div>

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
            {copy.title}
          </h1>
          <p
            className="text-muted-foreground"
            style={{
              fontFamily: FONT,
              fontSize: "var(--font-size-body)",
              fontWeight: "var(--font-weight-normal)" as unknown as number,
              lineHeight: 1.6,
              margin: 0,
              marginTop: "var(--spacing-xs)",
              maxWidth: "760px",
            }}
          >
            {copy.description}
          </p>

          <div className="flex flex-wrap" style={{ gap: "var(--spacing-sm)", marginTop: "var(--spacing-md)" }}>
            <Button
              variant="secondary"
              size="default"
              onClick={openSupabaseDashboard}
              style={{
                fontSize: "var(--font-size-small)",
                gap: "var(--spacing-xs)",
                boxShadow: NEU,
              }}
            >
              <ArrowUpRight style={{ width: "16px", height: "16px" }} />
              {copy.openDashboard}
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => void loadHealth()}
              disabled={isRefreshing}
              style={{
                fontSize: "var(--font-size-small)",
                gap: "var(--spacing-xs)",
                boxShadow: NEU,
              }}
            >
              <RefreshCw
                className={isRefreshing ? "animate-spin" : ""}
                style={{ width: "16px", height: "16px" }}
              />
              {copy.refresh}
            </Button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(2, minmax(0, 1fr))" : "1fr",
            gap: "var(--spacing-lg)",
          }}
        >
          <section
            style={{
              borderRadius: "var(--radius-card)",
              padding: "var(--spacing-lg)",
              background: "var(--background)",
              boxShadow: NEU,
            }}
          >
            <div className="flex items-center" style={{ gap: "var(--spacing-xs)", marginBottom: "var(--spacing-sm)" }}>
              <ShieldCheck className="text-secondary" style={{ width: "18px", height: "18px" }} />
              <h2
                className="text-foreground"
                style={{
                  fontFamily: FONT,
                  fontSize: "var(--font-size-body)",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  margin: 0,
                }}
              >
                {copy.primaryTitle}
              </h2>
            </div>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-small)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {copy.primaryDesc}
            </p>

            <div style={{ marginTop: "var(--spacing-md)", display: "grid", gap: "var(--spacing-xs)" }}>
              <div
                className="flex items-center"
                style={{
                  gap: "var(--spacing-xs)",
                  padding: "var(--spacing-sm)",
                  borderRadius: "var(--radius)",
                  background: "var(--muted)",
                  boxShadow: NEU_INNER,
                }}
              >
                <StatusDot ok={Boolean(primaryCheck?.ok)} />
                <div style={{ minWidth: 0 }}>
                  <p className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: 600, margin: 0 }}>
                    {copy.primaryKey}
                  </p>
                  <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", margin: 0, marginTop: "2px" }}>
                    {primaryCheck?.detail ?? (isLoading ? "Loading..." : copy.statusMissing)}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center"
                style={{
                  gap: "var(--spacing-xs)",
                  padding: "var(--spacing-sm)",
                  borderRadius: "var(--radius)",
                  background: "var(--muted)",
                  boxShadow: NEU_INNER,
                }}
              >
                <StatusDot ok={Boolean(backupCheck?.ok)} />
                <div style={{ minWidth: 0 }}>
                  <p className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: 600, margin: 0 }}>
                    {copy.backupTitle}
                  </p>
                  <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", margin: 0, marginTop: "2px" }}>
                    {backupCheck?.detail ?? (isLoading ? "Loading..." : copy.statusMissing)}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center"
                style={{
                  gap: "var(--spacing-xs)",
                  padding: "var(--spacing-sm)",
                  borderRadius: "var(--radius)",
                  background: "var(--muted)",
                  boxShadow: NEU_INNER,
                }}
              >
                <StatusDot ok={Boolean(fallbackCheck?.ok)} />
                <div style={{ minWidth: 0 }}>
                  <p className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: 600, margin: 0 }}>
                    {copy.fallbackReady}
                  </p>
                  <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", margin: 0, marginTop: "2px" }}>
                    {fallbackCheck?.detail ?? (isLoading ? "Loading..." : copy.fallbackMissing)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            style={{
              borderRadius: "var(--radius-card)",
              padding: "var(--spacing-lg)",
              background: "var(--background)",
              boxShadow: NEU,
            }}
          >
            <div className="flex items-center" style={{ gap: "var(--spacing-xs)", marginBottom: "var(--spacing-sm)" }}>
              <AlertCircle className="text-secondary" style={{ width: "18px", height: "18px" }} />
              <h2
                className="text-foreground"
                style={{
                  fontFamily: FONT,
                  fontSize: "var(--font-size-body)",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  margin: 0,
                }}
              >
                {copy.secretTitle}
              </h2>
            </div>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-small)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {copy.secretHint}
            </p>

            <div style={{ marginTop: "var(--spacing-md)", display: "grid", gap: "var(--spacing-xs)" }}>
              <div
                style={{
                  padding: "var(--spacing-sm)",
                  borderRadius: "var(--radius)",
                  background: "var(--muted)",
                  boxShadow: NEU_INNER,
                }}
              >
                <p className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: 600, margin: 0 }}>
                  {copy.primaryKey}
                </p>
                <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", margin: 0, marginTop: "2px" }}>
                  Alibaba Cloud DashScope API key
                </p>
              </div>
              <div
                style={{
                  padding: "var(--spacing-sm)",
                  borderRadius: "var(--radius)",
                  background: "var(--muted)",
                  boxShadow: NEU_INNER,
                }}
              >
                <p className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-small)", fontWeight: 600, margin: 0 }}>
                  {copy.backupKey}
                </p>
                <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", margin: 0, marginTop: "2px" }}>
                  AI backup API key
                </p>
              </div>
            </div>
          </section>
        </div>

        <section
          style={{
            marginTop: "var(--spacing-lg)",
            borderRadius: "var(--radius-card)",
            padding: "var(--spacing-lg)",
            background: "var(--background)",
            boxShadow: NEU,
          }}
        >
          <div className="flex items-center" style={{ gap: "var(--spacing-xs)", marginBottom: "var(--spacing-sm)" }}>
            <CircleCheckBig className="text-secondary" style={{ width: "18px", height: "18px" }} />
            <h2
              className="text-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-body)",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                margin: 0,
              }}
            >
              {copy.workflowTitle}
            </h2>
          </div>

          <div style={{ display: "grid", gap: "var(--spacing-xs)" }}>
            {copy.workflows.map((item) => (
              <div
                key={item}
                className="flex items-start"
                style={{
                  gap: "var(--spacing-xs)",
                  padding: "var(--spacing-sm)",
                  borderRadius: "var(--radius)",
                  background: "var(--muted)",
                  boxShadow: NEU_INNER,
                }}
              >
                <StatusDot ok />
                <p
                  className="text-muted-foreground"
                  style={{
                    fontFamily: FONT,
                    fontSize: "var(--font-size-small)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div
            className="text-muted-foreground"
            style={{
              fontFamily: FONT,
              fontSize: "var(--font-size-caption)",
              lineHeight: 1.6,
              marginTop: "var(--spacing-sm)",
              opacity: 0.9,
            }}
          >
            {copy.sourceLabel}: <span className="text-foreground">{supabaseDashboardUrl}</span>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}
