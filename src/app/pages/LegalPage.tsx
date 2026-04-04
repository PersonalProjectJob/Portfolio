/**
 * LegalPage — Full-page view for Privacy Policy or Terms of Service.
 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { ChevronLeft, Loader2, Shield, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useI18n } from "../lib/i18n";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d`;
const NEU = "6px 6px 14px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.8)";
const FONT = "'Inter', sans-serif";

interface LegalDocument {
  id: string; docType: string; version: string;
  titleVi: string; titleEn: string;
  contentVi: string; contentEn: string;
  effectiveDate: string;
}

const SLUG_MAP: Record<string, string> = {
  "privacy-policy": "privacy_policy",
  "terms-of-service": "terms_of_service",
};

export function LegalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const slug = location.pathname.replace(/^\//, "");
  const docType = slug ? SLUG_MAP[slug] : undefined;

  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!docType) { setIsLoading(false); setLoadError(true); return; }
    const fetchDoc = async () => {
      setIsLoading(true); setLoadError(false);
      try {
        const res = await fetch(`${BASE}/legal/${docType}`, { headers: { Authorization: `Bearer ${publicAnonKey}` } });
        if (res.ok) { const data = await res.json(); data.document ? setDocument(data.document) : setLoadError(true); }
        else setLoadError(true);
      } catch { setLoadError(true); } finally { setIsLoading(false); }
    };
    fetchDoc();
  }, [docType]);

  const title = document ? (locale === "vi" ? document.titleVi : document.titleEn) : slug === "privacy-policy" ? t.legal.privacyTitle : t.legal.termsTitle;
  const content = document ? (locale === "vi" ? document.contentVi : document.contentEn) : "";
  const Icon = slug === "privacy-policy" ? Shield : FileText;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: FONT }}>
      {/* Top bar — neumorphic shadow */}
      <header
        className="bg-background sticky top-0 z-10"
        style={{
          padding: "calc(var(--spacing-sm) + env(safe-area-inset-top)) var(--spacing-lg) var(--spacing-sm)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div className="mx-auto flex items-center" style={{ maxWidth: "800px", gap: "var(--spacing-sm)" }}>
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-secondary bg-transparent border-0 cursor-pointer"
            style={{
              fontFamily: FONT, fontSize: "var(--font-size-small)",
              fontWeight: "var(--font-weight-medium)" as unknown as number,
              gap: "var(--spacing-2xs)",
              padding: "var(--spacing-sm) var(--spacing-base)",
              minHeight: "var(--touch-target-min)",
              borderRadius: "var(--radius-button)",
              background: "color-mix(in srgb, var(--secondary) 8%, transparent)",
            }}
          >
            <ChevronLeft style={{ width: "16px", height: "16px" }} />
            {t.legal.backToHome}
          </button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <main className="mx-auto" style={{ maxWidth: "800px", padding: "var(--spacing-xl) var(--spacing-lg)", paddingBottom: "80px" }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: "var(--spacing-xl)", gap: "var(--spacing-sm)", minHeight: "300px" }}>
              <div className="flex items-center justify-center" style={{ width: "64px", height: "64px", borderRadius: "50%", background: "color-mix(in srgb, var(--secondary) 10%, var(--background))", boxShadow: NEU }}>
                <Loader2 className="text-secondary animate-spin" style={{ width: "28px", height: "28px" }} />
              </div>
              <span className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)" }}>{t.legal.policyLoading}</span>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: "var(--spacing-xl)", gap: "var(--spacing-md)", minHeight: "300px" }}>
              <span className="text-destructive" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", textAlign: "center" }}>{t.legal.policyError}</span>
              <Button variant="outline" size="lg" onClick={() => navigate("/")} style={{ fontSize: "var(--font-size-small)", boxShadow: NEU }}>{t.legal.backToHome}</Button>
            </div>
          ) : (
            <>
              {/* Page title — neumorphic card */}
              <div
                style={{
                  borderRadius: "var(--radius-card)", overflow: "hidden",
                  background: "var(--background)", boxShadow: NEU,
                  marginBottom: "var(--spacing-lg)",
                }}
              >
                <div style={{ height: "4px", background: "linear-gradient(90deg, var(--secondary), var(--primary), var(--secondary))" }} />
                <div className="flex items-center" style={{ gap: "var(--spacing-sm)", padding: "var(--spacing-md) var(--spacing-lg)" }}>
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: "44px", height: "44px", borderRadius: "50%",
                      background: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 15%, var(--background)), color-mix(in srgb, var(--primary) 10%, var(--background)))",
                      boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.5), inset -1px -1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Icon className="text-secondary" style={{ width: "20px", height: "20px" }} />
                  </div>
                  <div>
                    <h1 className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-h2)", fontWeight: "var(--font-weight-semibold)" as unknown as number, lineHeight: 1.3, margin: 0 }}>{title}</h1>
                    {document && (
                      <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", fontWeight: "var(--font-weight-normal)" as unknown as number, margin: 0, marginTop: "var(--spacing-2xs)" }}>
                        {t.legal.version} {document.version} — {t.legal.effectiveDate}{" "}
                        {new Date(document.effectiveDate).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Markdown content */}
              <div className="prose prose-sm max-w-none text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-normal)" as unknown as number, lineHeight: 1.8 }}>
                {content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-h1)", fontWeight: "var(--font-weight-semibold)" as unknown as number, lineHeight: 1.3, marginTop: "var(--spacing-xl)", marginBottom: "var(--spacing-sm)" }}>{children}</h1>,
                      h2: ({ children }) => <h2 className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-h2)", fontWeight: "var(--font-weight-semibold)" as unknown as number, lineHeight: 1.3, marginTop: "var(--spacing-lg)", marginBottom: "var(--spacing-xs)" }}>{children}</h2>,
                      h3: ({ children }) => <h3 className="text-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-semibold)" as unknown as number, lineHeight: 1.4, marginTop: "var(--spacing-md)", marginBottom: "var(--spacing-xs)" }}>{children}</h3>,
                      p: ({ children }) => <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-normal)" as unknown as number, lineHeight: 1.8, margin: 0, marginBottom: "var(--spacing-sm)" }}>{children}</p>,
                      li: ({ children }) => <li className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", lineHeight: 1.7, marginBottom: "var(--spacing-2xs)" }}>{children}</li>,
                      strong: ({ children }) => <strong className="text-foreground" style={{ fontWeight: "var(--font-weight-semibold)" as unknown as number }}>{children}</strong>,
                      a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-secondary underline" style={{ fontWeight: "var(--font-weight-medium)" as unknown as number }}>{children}</a>,
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: "var(--font-size-body)", textAlign: "center", padding: "var(--spacing-xl) 0" }}>{t.legal.noContent}</p>
                )}
              </div>
            </>
          )}
        </main>
      </ScrollArea>
    </div>
  );
}
