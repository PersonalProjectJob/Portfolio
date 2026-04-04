import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { useI18n } from "../../lib/i18n";
import { ChatPreview } from "./ChatPreview";

const FONT = "'Inter', sans-serif";

/* ── Animated counter for stats ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.max(1, Math.ceil(target / 40));
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 30);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ── 3D Tilt card wrapper ── */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(y * -8);
    rotateY.set(x * 8);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springX,
        rotateY: springY,
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Shimmer line (decorative) ── */
function ShimmerLine() {
  return (
    <div style={{ position: "relative", height: "1px", width: "100%", overflow: "hidden", marginTop: "var(--spacing-lg)" }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--border)", opacity: 0.4 }} />
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
        style={{
          position: "absolute", top: 0, left: 0,
          width: "40%", height: "100%",
          background: "linear-gradient(90deg, transparent, var(--secondary), transparent)",
        }}
      />
    </div>
  );
}

export function HeroSection() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const previewY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const previewScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const headlineWords = `${t.hero.headlinePart1} ${t.hero.headlineAccent}`.split(" ");
  const accentWord = t.hero.headlineAccent;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* CSS for gradient shimmer text */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text-shimmer {
          background: var(--gradient-text);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 4s ease infinite;
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
      `}</style>

      {/* Radial gradient backdrop */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 40%, color-mix(in srgb, var(--secondary) 10%, transparent) 0%, transparent 70%),
              radial-gradient(ellipse 60% 50% at 80% 30%, color-mix(in srgb, var(--primary) 8%, transparent) 0%, transparent 70%),
              radial-gradient(circle at 50% 80%, color-mix(in srgb, var(--secondary) 5%, transparent) 0%, transparent 50%)
            `,
          }}
        />
      </motion.div>

      {/* Grid pattern overlay — subtle */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in srgb, var(--border) 20%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--border) 20%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.4,
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)",
        }}
      />

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute pointer-events-none hidden lg:block"
        style={{
          top: "12%", right: "8%",
          width: "80px", height: "80px",
          borderRadius: "var(--radius-card)",
          background: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 15%, var(--background)), color-mix(in srgb, var(--primary) 8%, var(--background)))",
          boxShadow: "8px 8px 20px rgba(0,0,0,0.06), -6px -6px 16px rgba(255,255,255,0.8)",
          border: "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
        }}
      />
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute pointer-events-none hidden lg:block"
        style={{
          bottom: "18%", left: "5%",
          width: "60px", height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, var(--background)), color-mix(in srgb, var(--secondary) 10%, var(--background)))",
          boxShadow: "6px 6px 14px rgba(0,0,0,0.05), -4px -4px 10px rgba(255,255,255,0.7)",
        }}
      />
      {/* Gradient ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none hidden lg:block"
        style={{
          top: "25%", left: "12%",
          width: "120px", height: "120px",
          borderRadius: "50%",
          border: "1.5px solid transparent",
          borderTopColor: "var(--secondary)",
          borderRightColor: "color-mix(in srgb, var(--secondary) 30%, transparent)",
          opacity: 0.3,
        }}
      />

      <div
        className="relative mx-auto w-full px-[var(--spacing-md)] flex items-center justify-center"
        style={{ maxWidth: "1200px", minHeight: "100vh", paddingTop: "calc(5rem - 80px)", paddingBottom: "var(--spacing-xl)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-xl)] items-center w-full">
          {/* Left: Copy with staggered word reveal */}
          <motion.div style={{ y: textY }} className="flex flex-col items-center text-center lg:items-start lg:text-left gap-[var(--spacing-lg)]">
            {/* Badge — animated glow border */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center lg:justify-start"
            >
              <span
                className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-sm)] py-[var(--spacing-xs)] rounded-full"
                style={{
                  fontFamily: FONT,
                  fontSize: "var(--font-size-caption)",
                  fontWeight: "var(--font-weight-medium)" as unknown as number,
                  background: "color-mix(in srgb, var(--secondary) 8%, var(--background))",
                  boxShadow: "0 0 20px color-mix(in srgb, var(--secondary) 15%, transparent), 4px 4px 10px rgba(0,0,0,0.04), -3px -3px 8px rgba(255,255,255,0.7)",
                  border: "1px solid color-mix(in srgb, var(--secondary) 20%, transparent)",
                  color: "var(--primary)",
                }}
              >
                <Sparkles className="size-3.5" style={{ color: "var(--secondary)" }} />
                {t.hero.badge}
              </span>
            </motion.div>

            {/* Headline — per-word staggered reveal with gradient accent */}
            <div style={{ margin: 0 }}>
              <h1 style={{
                fontFamily: FONT,
                fontSize: "clamp(var(--font-size-h1), 5.5vw, var(--text-3xl))",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                margin: 0,
              }}>
                {headlineWords.map((word, i) => {
                  const isAccent = accentWord.includes(word);
                  return (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        duration: 0.6,
                        delay: 0.15 + i * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={isAccent ? "text-secondary" : "text-foreground"}
                      style={{ display: "inline-block", marginRight: "0.25em" }}
                    >
                      {word}
                    </motion.span>
                  );
                })}
              </h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-muted-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-body)",
                fontWeight: "var(--font-weight-normal)" as unknown as number,
                lineHeight: 1.7, margin: 0, maxWidth: "480px",
              }}
            >
              {t.hero.description}
            </motion.p>

            {/* CTA group */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-[var(--spacing-sm)]"
            >
              <Button
                onClick={() => navigate("/chat")}
                variant="default"
                size="lg"
                style={{
                  fontSize: "var(--font-size-body)",
                  boxShadow: "0 4px 20px color-mix(in srgb, var(--primary) 30%, transparent)",
                }}
              >
                {t.common.tryNowFree}
                <ArrowRight className="size-4" />
              </Button>
              <span
                className="text-muted-foreground"
                style={{
                  fontFamily: FONT,
                  fontSize: "var(--font-size-caption)",
                  fontWeight: "var(--font-weight-normal)" as unknown as number,
                }}
              >
                {t.common.noSignup}
              </span>
            </motion.div>

            {/* Shimmer divider */}
            <ShimmerLine />

            {/* Mini stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex gap-[var(--spacing-xl)]"
            >
              {[
                { num: 50, suffix: "K+", label: "Users" },
                { num: 99, suffix: "%", label: "Uptime" },
                { num: 4, suffix: ".9", label: "Rating" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: FONT,
                      fontSize: "var(--font-size-h2)",
                      fontWeight: "var(--font-weight-semibold)" as unknown as number,
                      lineHeight: 1.1,
                    }}
                  >
                    <AnimatedCounter target={stat.num} suffix={stat.suffix} />
                  </span>
                  <span
                    className="text-muted-foreground"
                    style={{
                      fontFamily: FONT,
                      fontSize: "var(--font-size-caption)",
                      fontWeight: "var(--font-weight-normal)" as unknown as number,
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: 3D Tilt Chat Preview */}
          <motion.div
            style={{ y: previewY, scale: previewScale }}
            className="lg:pl-[var(--spacing-xl)] flex flex-col min-h-0"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: 1000 }}
            >
              <TiltCard>
                {/* Glow behind the card */}
                <div
                  className="absolute -inset-4 pointer-events-none hidden lg:block"
                  style={{
                    background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--secondary) 12%, transparent) 0%, transparent 70%)",
                    borderRadius: "var(--radius-card)",
                    filter: "blur(30px)",
                    zIndex: -1,
                  }}
                />
                <ChatPreview />
              </TiltCard>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll-down indicator with gradient line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute bottom-[var(--spacing-xl)] left-1/2 flex flex-col items-center pointer-events-none"
        style={{ transform: "translateX(-50%)", gap: "var(--spacing-xs)" }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "1px", height: "40px",
            background: "linear-gradient(to bottom, var(--secondary), transparent)",
          }}
        />
        <span
          className="text-muted-foreground"
          style={{
            fontFamily: FONT,
            fontSize: "var(--font-size-caption)",
            fontWeight: "var(--font-weight-normal)" as unknown as number,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Scroll
        </span>
      </motion.div>
    </section>
  );
}