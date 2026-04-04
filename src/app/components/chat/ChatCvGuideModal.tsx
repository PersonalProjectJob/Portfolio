import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  FileText,
  MessageCircle,
  Upload,
  type LucideProps,
} from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { useIsDesktop } from "../../hooks/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

type GuideIcon = ComponentType<LucideProps>;

interface GuideStep {
  key: string;
  title: string;
  body: string;
  tip: string;
  accent: string;
  icon: GuideIcon;
  imageSrc?: string;
  imageAlt?: string;
}

interface ChatCvGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartUpload: () => void;
}

const FONT = "'Inter', sans-serif";
const GUIDE_MODAL_WIDTH = "min(680px, calc(100vw - 2rem))";
const GUIDE_MODAL_HEIGHT = "min(86vh, 760px)";
const GUIDE_TEXT_CARD_STYLE: CSSProperties = {
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  width: "100%",
};

function buildOptimizedGuideImageUrl(url: string): string {
  return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_1600,c_limit/");
}

function renderBoldQuotedText(text: string): ReactNode[] {
  const segments = text.split(/(`[^`]+`)/g);

  return segments.filter(Boolean).map((segment, index) => {
    if (segment.startsWith("`") && segment.endsWith("`")) {
      return (
        <strong
          key={`${segment}-${index}`}
          style={{ fontWeight: "var(--font-weight-semibold)" as unknown as number }}
        >
          {segment.slice(1, -1)}
        </strong>
      );
    }

    return segment;
  });
}

export function ChatCvGuideModal({
  open,
  onOpenChange,
  onStartUpload,
}: ChatCvGuideModalProps) {
  const { t, locale } = useI18n();
  const isDesktop = useIsDesktop();
  const [currentStep, setCurrentStep] = useState(0);
  const guideImageFrameStyle = useMemo<CSSProperties>(
    () => ({
      width: "100%",
      height: isDesktop ? "250px" : "clamp(140px, 20vh, 160px)",
      padding: isDesktop ? "var(--spacing-md)" : "0",
      boxSizing: "border-box",
      flex: "0 0 auto",
    }),
    [isDesktop],
  );
  const guideMediaShellStyle = useMemo<CSSProperties>(
    () => ({
      marginInline: isDesktop ? 0 : "calc(var(--spacing-md) * -1)",
      width: isDesktop ? "100%" : "calc(100% + (var(--spacing-md) * 2))",
    }),
    [isDesktop],
  );
  const mainBodyStyle = useMemo<CSSProperties>(
    () => ({
      padding: isDesktop ? "var(--spacing-md) var(--spacing-lg)" : "var(--spacing-sm) var(--spacing-md)",
      gap: isDesktop ? "var(--spacing-md)" : "var(--spacing-sm)",
    }),
    [isDesktop],
  );
  const guideTextCardStyle = useMemo<CSSProperties>(
    () => ({
      ...GUIDE_TEXT_CARD_STYLE,
      gap: isDesktop ? "var(--spacing-sm)" : "0",
    }),
    [isDesktop],
  );
  const footerStyle = useMemo<CSSProperties>(
    () => ({
      padding: isDesktop ? "var(--spacing-md) var(--spacing-lg)" : "var(--spacing-sm) var(--spacing-md)",
    }),
    [isDesktop],
  );

  const steps = useMemo<GuideStep[]>(
    () => [
      {
        key: "entry",
        title: t.chat.cvGuide.stepOpenTitle,
        body: t.chat.cvGuide.stepOpenBody,
        tip: t.chat.cvGuide.stepOpenTip,
        accent: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 22%, white), color-mix(in srgb, var(--primary) 14%, white))",
        icon: MessageCircle,
        imageSrc: buildOptimizedGuideImageUrl(
          "https://res.cloudinary.com/dbnyy6zmo/image/upload/v1774923396/Screenshot_2026-03-31_090929_hol80l.png",
        ),
        imageAlt: "Step 1 CV guide screenshot",
      },
      {
        key: "upload",
        title: t.chat.cvGuide.stepUploadTitle,
        body: t.chat.cvGuide.stepUploadBody,
        tip: t.chat.cvGuide.stepUploadTip,
        accent: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, white), color-mix(in srgb, var(--secondary) 12%, white))",
        icon: Upload,
        imageSrc: buildOptimizedGuideImageUrl(
          "https://res.cloudinary.com/dbnyy6zmo/image/upload/v1774923832/Screenshot_2026-03-31_092335_a7gh9n.png",
        ),
        imageAlt: "Step 2 CV guide screenshot",
      },
      {
        key: "chat",
        title: t.chat.cvGuide.stepChatTitle,
        body: t.chat.cvGuide.stepChatBody,
        tip: t.chat.cvGuide.stepChatTip,
        accent: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 14%, white), color-mix(in srgb, var(--success, #16a34a) 12%, white))",
        icon: CheckCircle2,
        imageSrc: buildOptimizedGuideImageUrl(
          "https://res.cloudinary.com/dbnyy6zmo/image/upload/v1774923444/Screenshot_2026-03-31_091717_ef1cnb.png",
        ),
        imageAlt: "Step 3 CV guide screenshot",
      },
    ],
    [t],
  );

  useEffect(() => {
    if (!open) return;
    setCurrentStep(0);
  }, [open]);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progressLabel =
    locale === "vi"
      ? `Bước ${currentStep + 1}/${steps.length}`
      : `Step ${currentStep + 1}/${steps.length}`;
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col gap-0 overflow-hidden p-0"
        style={{
          width: GUIDE_MODAL_WIDTH,
          maxWidth: GUIDE_MODAL_WIDTH,
          height: GUIDE_MODAL_HEIGHT,
          maxHeight: GUIDE_MODAL_HEIGHT,
          borderRadius: "24px",
        }}
      >
        <div
          className="shrink-0 border-b border-border/70"
          style={{
            padding: "var(--spacing-md) var(--spacing-lg)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--secondary) 4%, var(--background)) 0%, var(--background) 100%)",
          }}
        >
          <div
            className="inline-flex items-center rounded-full border border-border/80 text-muted-foreground"
            style={{
              padding: "0.35rem 0.7rem",
              fontFamily: FONT,
              fontSize: "11px",
              fontWeight: "var(--font-weight-semibold)" as unknown as number,
              letterSpacing: "0.02em",
              marginBottom: "var(--spacing-xs)",
            }}
          >
            {progressLabel}
          </div>

          <DialogHeader className="gap-2 text-left">
            <DialogTitle
              style={{
                fontFamily: FONT,
                fontSize: "clamp(1rem, 1.15vw, 1.25rem)",
                lineHeight: 1.12,
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                margin: 0,
              }}
            >
              {t.chat.cvGuide.title}
            </DialogTitle>
            <DialogDescription
              style={{
                fontFamily: FONT,
                fontSize: "12.5px",
                lineHeight: 1.5,
                color: "var(--muted-foreground)",
                margin: 0,
              }}
            >
              {t.chat.cvGuide.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col"
          style={mainBodyStyle}
        >
          <div
            className="shrink-0 overflow-hidden"
            style={{
              ...guideMediaShellStyle,
              borderRadius: "20px",
              background: "color-mix(in srgb, var(--secondary) 3%, var(--background))",
            }}
          >
            {step.imageSrc ? (
              <div
                className="flex items-center justify-center bg-background/70"
                style={guideImageFrameStyle}
              >
                <img
                  src={step.imageSrc}
                  alt={step.imageAlt || step.title}
                  width={1037}
                  height={385}
                  className="block h-full w-full"
                  loading="lazy"
                  decoding="async"
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                  }}
                />
              </div>
            ) : (
              <div
                className="relative flex min-h-[220px] flex-col justify-between"
                style={{ padding: "var(--spacing-lg)" }}
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    width: "180px",
                    height: "180px",
                    right: "-48px",
                    top: "-36px",
                    background:
                      "radial-gradient(circle, color-mix(in srgb, white 75%, transparent) 0%, transparent 70%)",
                    opacity: 0.7,
                  }}
                />
                <div
                  className="inline-flex items-center rounded-full bg-background/85 text-secondary shadow-sm"
                  style={{
                    width: "56px",
                    height: "56px",
                    justifyContent: "center",
                  }}
                >
                  <Icon style={{ width: "26px", height: "26px" }} />
                </div>

                <div
                  className="relative z-10 max-w-[28rem] rounded-[18px] border border-white/50 bg-background/86 shadow-[0_16px_30px_rgba(15,23,42,0.08)] backdrop-blur"
                  style={{ padding: "var(--spacing-md)" }}
                >
                  <div
                    className="inline-flex items-center rounded-full bg-secondary/10 text-secondary"
                    style={{
                      gap: "0.35rem",
                      padding: "0.3rem 0.7rem",
                      fontFamily: FONT,
                      fontSize: "var(--font-size-caption)",
                      fontWeight: "var(--font-weight-semibold)" as unknown as number,
                      marginBottom: "var(--spacing-sm)",
                    }}
                  >
                    <FileText style={{ width: "14px", height: "14px" }} />
                    {step.title}
                  </div>
                  <p
                    className="text-foreground"
                    style={{
                      fontFamily: FONT,
                      fontSize: "var(--font-size-body)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {renderBoldQuotedText(step.body)}
                  </p>
                </div>
              </div>
            )}
          </div>

        <div
          className="flex min-h-0 flex-1 flex-col"
          style={{
            gap: "var(--spacing-sm)",
          }}
        >
          <div
            className="flex min-h-0 flex-1 flex-col"
            style={guideTextCardStyle}
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
              {step.title}
            </p>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "13px",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {renderBoldQuotedText(step.body)}
            </p>

            <div
              className="rounded-[14px]"
              style={{
                marginTop: isDesktop ? 0 : "var(--spacing-sm)",
                padding: "0.6rem 0.75rem",
                background: "color-mix(in srgb, var(--background) 70%, var(--secondary) 6%)",
                width: "100%",
              }}
            >
              <p
                className="text-foreground"
                style={{
                  fontFamily: FONT,
                  fontSize: "11px",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  margin: 0,
                  marginBottom: "0.25rem",
                }}
              >
                {t.chat.cvGuide.tipLabel}
              </p>
              <p
                className="text-muted-foreground"
                style={{
                  fontFamily: FONT,
                  fontSize: "13px",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {renderBoldQuotedText(step.tip)}
              </p>
            </div>

            <div className="flex shrink-0 items-center justify-center pt-1" style={{ gap: "0.45rem" }}>
              {steps.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  aria-label={`${progressLabel} ${item.title}`}
                  onClick={() => setCurrentStep(index)}
                  className="border-0 transition-all"
                  style={{
                    width: index === currentStep ? "28px" : "10px",
                    height: "8px",
                    borderRadius: "999px",
                    background:
                      index === currentStep
                        ? "var(--secondary)"
                        : "color-mix(in srgb, var(--border) 85%, white)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

        <div
          className="shrink-0 border-t border-border/70"
          style={footerStyle}
        >
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((stepIndex) => Math.max(0, stepIndex - 1))}
              disabled={currentStep === 0}
            >
              {t.chat.cvGuide.previous}
            </Button>

            {isLastStep ? (
              <Button onClick={onStartUpload}>{t.chat.cvGuide.goToProfile}</Button>
            ) : (
              <Button onClick={() => setCurrentStep((stepIndex) => Math.min(steps.length - 1, stepIndex + 1))}>
                {t.chat.cvGuide.next}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
