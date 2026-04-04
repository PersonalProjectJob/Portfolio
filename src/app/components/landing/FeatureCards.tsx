import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent, useTransform } from "motion/react";
import {
  FileSearch,
  BrainCircuit,
  MessageSquareText,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useI18n } from "../../lib/i18n";
import type { Translations } from "../../lib/i18n";

const FONT = "'Inter', sans-serif";

interface Feature {
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  titleKey: keyof Translations["features"];
  descKey: keyof Translations["features"];
  gradient: string;
  accentColor: string;
}

const FEATURES: Feature[] = [
  {
    Icon: FileSearch,
    titleKey: "jdAnalysisTitle",
    descKey: "jdAnalysisDesc",
    gradient: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 18%, var(--background)), color-mix(in srgb, var(--primary) 12%, var(--background)))",
    accentColor: "var(--secondary)",
  },
  {
    Icon: BrainCircuit,
    titleKey: "cvReviewTitle",
    descKey: "cvReviewDesc",
    gradient: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, var(--background)), color-mix(in srgb, var(--secondary) 20%, var(--background)))",
    accentColor: "var(--primary)",
  },
  {
    Icon: MessageSquareText,
    titleKey: "interviewPrepTitle",
    descKey: "interviewPrepDesc",
    gradient: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 22%, var(--background)), color-mix(in srgb, var(--primary) 8%, var(--background)))",
    accentColor: "var(--secondary)",
  },
  {
    Icon: TrendingUp,
    titleKey: "salaryInsightsTitle",
    descKey: "salaryInsightsDesc",
    gradient: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, var(--background)), color-mix(in srgb, var(--secondary) 12%, var(--background)))",
    accentColor: "var(--primary)",
  },
  {
    Icon: Zap,
    titleKey: "streamingTitle",
    descKey: "streamingDesc",
    gradient: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 15%, var(--background)), color-mix(in srgb, var(--primary) 18%, var(--background)))",
    accentColor: "var(--secondary)",
  },
  {
    Icon: ShieldCheck,
    titleKey: "privateSecureTitle",
    descKey: "privateSecureDesc",
    gradient: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, var(--background)), color-mix(in srgb, var(--secondary) 15%, var(--background)))",
    accentColor: "var(--primary)",
  },
];

const NUM = FEATURES.length;

/* ── SVG Circular Progress Ring ── */
function ProgressRing({ progress, activeIdx }: { progress: number; activeIdx: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <svg width={72} height={72} viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={36} cy={36} r={radius} fill="none" stroke="var(--border)" strokeWidth={2} opacity={0.3} />
        {/* Progress */}
        <circle
          cx={36} cy={36} r={radius}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <span
        className="absolute text-foreground"
        style={{
          fontFamily: FONT,
          fontSize: "var(--font-size-body)",
          fontWeight: "var(--font-weight-semibold)" as unknown as number,
        }}
      >
        {String(activeIdx + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

export function FeatureCards() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(Math.floor(v * NUM), NUM - 1);
    setActiveIdx(idx);
  });

  /* Overall progress 0→1 for ring */
  const ringProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [ringVal, setRingVal] = useState(0);
  useMotionValueEvent(ringProgress, "change", (v) => setRingVal(v));

  return (
    <section
      id="features"
      ref={sectionRef}
      style={{
        height: `${(NUM + 1) * 100}vh`,
        position: "relative",
      }}
    >
      {/* CSS for animations */}
      <style>{`
        @keyframes morph-blob {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          25% { border-radius: 58% 42% 45% 55% / 55% 45% 55% 45%; }
          50% { border-radius: 50% 50% 33% 67% / 55% 30% 70% 45%; }
          75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
        }
      `}</style>

      {/* ── Sticky viewport ── */}
      <div
        className="sticky top-0 overflow-hidden"
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "color-mix(in srgb, var(--muted) 60%, var(--background))",
        }}
      >
        {/* Grid pattern — Framer style */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(color-mix(in srgb, var(--border) 15%, transparent) 1px, transparent 1px),
              linear-gradient(90deg, color-mix(in srgb, var(--border) 15%, transparent) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            opacity: 0.5,
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%)",
          }}
        />

        {/* Large background number — oversized watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ overflow: "hidden" }}
        >
          <motion.span
            key={activeIdx}
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: FONT,
              fontSize: "clamp(120px, 25vw, 300px)",
              fontWeight: 700,
              lineHeight: 1,
              color: "transparent",
              WebkitTextStroke: "1.5px color-mix(in srgb, var(--border) 40%, transparent)",
              userSelect: "none",
            }}
          >
            {String(activeIdx + 1).padStart(2, "0")}
          </motion.span>
        </div>

        {/* Morphing accent blob — follows active feature */}
        <motion.div
          key={`blob-${activeIdx}`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute pointer-events-none"
          style={{
            width: "clamp(200px, 30vw, 400px)",
            height: "clamp(200px, 30vw, 400px)",
            top: "20%",
            right: "10%",
            background: `radial-gradient(circle, ${FEATURES[activeIdx].accentColor}, transparent 70%)`,
            animation: "morph-blob 12s ease-in-out infinite",
            filter: "blur(60px)",
          }}
        />

        {/* Section label — top left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute flex items-center gap-[var(--spacing-sm)]"
          style={{
            top: "var(--spacing-xl)",
            left: "var(--spacing-xl)",
            zIndex: 10,
          }}
        >
          <div style={{ width: "24px", height: "1px", background: "var(--secondary)" }} />
          <span
            className="text-muted-foreground"
            style={{
              fontFamily: FONT,
              fontSize: "var(--font-size-caption)",
              fontWeight: "var(--font-weight-medium)" as unknown as number,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {t.features.sectionLabel}
          </span>
        </motion.div>

        {/* Progress ring — top right */}
        <div
          className="absolute hidden lg:flex"
          style={{ top: "var(--spacing-xl)", right: "var(--spacing-xl)", zIndex: 10 }}
        >
          <ProgressRing progress={ringVal} activeIdx={activeIdx} />
        </div>

        {/* ── Main content ── */}
        <div
          className="flex-1 flex items-center justify-center relative"
          style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "0 var(--spacing-xl)" }}
        >
          {FEATURES.map((feature, idx) => {
            const isActive = idx === activeIdx;
            const title = t.features[feature.titleKey] as string;
            const desc = t.features[feature.descKey] as string;
            const FeatureIcon = feature.Icon;

            return (
              <motion.div
                key={feature.titleKey}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : idx > activeIdx ? 60 : -60,
                  scale: isActive ? 1 : 0.9,
                  rotateX: isActive ? 0 : idx > activeIdx ? 8 : -8,
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ pointerEvents: isActive ? "auto" : "none", perspective: 1000 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-xl)] items-center w-full">
                  {/* Left — Icon showcase with morphing card */}
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{
                        rotate: isActive ? 0 : -5,
                        scale: isActive ? 1 : 0.85,
                      }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="relative"
                    >
                      {/* Neumorphic card */}
                      <div
                        className="relative flex items-center justify-center"
                        style={{
                          width: "clamp(220px, 28vw, 360px)",
                          height: "clamp(220px, 28vw, 360px)",
                          borderRadius: "var(--radius-card)",
                          background: feature.gradient,
                          boxShadow: "12px 12px 30px rgba(0,0,0,0.08), -8px -8px 24px rgba(255,255,255,0.9)",
                          border: "1px solid color-mix(in srgb, var(--border) 30%, transparent)",
                        }}
                      >
                        {/* Inner glow circle */}
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: "55%",
                            height: "55%",
                            borderRadius: "50%",
                            background: "var(--background)",
                            boxShadow: "inset 4px 4px 12px rgba(0,0,0,0.05), inset -4px -4px 12px rgba(255,255,255,0.8), 0 0 40px color-mix(in srgb, var(--secondary) 10%, transparent)",
                          }}
                        >
                          <motion.div
                            animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <FeatureIcon
                              className="text-primary"
                              style={{
                                width: "clamp(44px, 6vw, 76px)",
                                height: "clamp(44px, 6vw, 76px)",
                              }}
                            />
                          </motion.div>
                        </div>

                        {/* Floating mini-cards */}
                        <motion.div
                          animate={{ y: isActive ? [0, -8, 0] : 0 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute hidden lg:flex items-center"
                          style={{
                            top: "-8%", left: "-12%",
                            padding: "var(--spacing-xs) var(--spacing-sm)",
                            borderRadius: "var(--radius)",
                            background: "var(--background)",
                            boxShadow: "6px 6px 16px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.8)",
                            border: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
                            gap: "var(--spacing-xs)",
                          }}
                        >
                          <div
                            style={{
                              width: "24px", height: "24px",
                              borderRadius: "var(--radius-button)",
                              background: "linear-gradient(135deg, var(--secondary), var(--primary))",
                            }}
                          />
                          <div>
                            <div style={{ width: 52, height: 5, borderRadius: 3, background: "var(--border)" }} />
                            <div style={{ width: 36, height: 5, borderRadius: 3, background: "var(--border)", marginTop: 4 }} />
                          </div>
                        </motion.div>

                        {/* Status pill */}
                        <motion.div
                          animate={{ y: isActive ? [0, 6, 0] : 0 }}
                          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                          className="absolute hidden lg:flex items-center"
                          style={{
                            bottom: "8%", right: "-10%",
                            padding: "var(--spacing-2xs) var(--spacing-sm)",
                            borderRadius: "999px",
                            background: "var(--background)",
                            boxShadow: "6px 6px 16px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.8)",
                            border: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
                            gap: "var(--spacing-2xs)",
                          }}
                        >
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success)" }} />
                          <span
                            className="text-muted-foreground"
                            style={{
                              fontFamily: FONT,
                              fontSize: "var(--font-size-caption)",
                              fontWeight: "var(--font-weight-medium)" as unknown as number,
                            }}
                          >
                            Active
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right — Title + description with shimmer line */}
                  <div className="flex flex-col" style={{ gap: "var(--spacing-md)" }}>
                    {/* Feature number tag */}
                    <motion.div
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 20 }}
                      transition={{ duration: 0.4, delay: isActive ? 0.1 : 0 }}
                      className="flex items-center"
                      style={{ gap: "var(--spacing-sm)" }}
                    >
                      <div
                        style={{
                          width: "32px", height: "2px",
                          background: "linear-gradient(90deg, var(--secondary), transparent)",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: FONT,
                          fontSize: "var(--font-size-caption)",
                          fontWeight: "var(--font-weight-medium)" as unknown as number,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--secondary)",
                        }}
                      >
                        Feature {String(idx + 1).padStart(2, "0")}
                      </span>
                    </motion.div>

                    <motion.h2
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 40, filter: isActive ? "blur(0px)" : "blur(6px)" }}
                      transition={{ duration: 0.5, delay: isActive ? 0.15 : 0, ease: [0.22, 1, 0.36, 1] }}
                      className="text-foreground"
                      style={{
                        fontFamily: FONT,
                        fontSize: "clamp(var(--font-size-h1), 4vw, var(--text-2xl))",
                        fontWeight: "var(--font-weight-semibold)" as unknown as number,
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                        margin: 0,
                      }}
                    >
                      {title}
                    </motion.h2>

                    <motion.p
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 40, filter: isActive ? "blur(0px)" : "blur(4px)" }}
                      transition={{ duration: 0.5, delay: isActive ? 0.25 : 0, ease: [0.22, 1, 0.36, 1] }}
                      className="text-muted-foreground"
                      style={{
                        fontFamily: FONT,
                        fontSize: "var(--font-size-body)",
                        fontWeight: "var(--font-weight-normal)" as unknown as number,
                        lineHeight: 1.7,
                        margin: 0,
                        maxWidth: "440px",
                      }}
                    >
                      {desc}
                    </motion.p>

                    {/* Shimmer divider */}
                    <motion.div
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.4, delay: isActive ? 0.3 : 0 }}
                      style={{ position: "relative", height: "1px", maxWidth: "300px", overflow: "hidden" }}
                    >
                      <div style={{ position: "absolute", inset: 0, background: "var(--border)", opacity: 0.3 }} />
                      {isActive && (
                        <motion.div
                          animate={{ x: ["-100%", "300%"] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                          style={{
                            position: "absolute", top: 0, left: 0,
                            width: "30%", height: "100%",
                            background: `linear-gradient(90deg, transparent, ${FEATURES[idx].accentColor}, transparent)`,
                          }}
                        />
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom pagination — Framer style ── */}
        <div
          className="flex items-center justify-center"
          style={{ padding: "var(--spacing-lg)", gap: "var(--spacing-xs)" }}
        >
          {FEATURES.map((_, idx) => (
            <div
              key={idx}
              className="transition-all duration-500"
              style={{
                width: idx === activeIdx ? "32px" : "8px",
                height: "4px",
                borderRadius: "2px",
                background: idx === activeIdx
                  ? "linear-gradient(90deg, var(--secondary), var(--primary))"
                  : idx < activeIdx
                    ? "var(--secondary)"
                    : "var(--border)",
                boxShadow: idx === activeIdx
                  ? "0 2px 10px color-mix(in srgb, var(--secondary) 40%, transparent)"
                  : "none",
                opacity: idx === activeIdx ? 1 : idx < activeIdx ? 0.6 : 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
