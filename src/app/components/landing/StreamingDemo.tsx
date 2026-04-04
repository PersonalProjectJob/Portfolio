import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Bot, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";

const FONT = "'Inter', sans-serif";
const NEU = "6px 6px 14px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.8)";
const NEU_LG = "10px 10px 24px rgba(0,0,0,0.07), -8px -8px 20px rgba(255,255,255,0.9)";

function useTypewriter(text: string, running: boolean, wpm = 120) {
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  const reset = useCallback(() => {
    indexRef.current = 0;
    setOutput("");
    setDone(false);
  }, []);

  useEffect(() => {
    if (!running) return;
    reset();

    const words = text.split(" ");
    const msPerWord = 60000 / wpm;

    const timer = setInterval(() => {
      if (indexRef.current < words.length) {
        const word = words[indexRef.current];
        setOutput((prev) => (prev ? prev + " " : "") + word);
        indexRef.current++;
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, msPerWord);

    return () => clearInterval(timer);
  }, [text, running, wpm, reset]);

  return { output, done, reset };
}

function renderFormatted(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span
          key={i}
          className="text-primary"
          style={{ fontWeight: "var(--font-weight-semibold)" as unknown as number }}
        >
          {part.slice(2, -2)}
        </span>
      );
    }
    const lines = part.split("\n");
    return lines.map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ));
  });
}

export function StreamingDemo() {
  const { t } = useI18n();
  const demoText = t.streamingDemo.demoContent;

  const [running, setRunning] = useState(false);
  const { output, done, reset } = useTypewriter(demoText, running, 160);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  /* ── Scroll-driven parallax ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const leftY = useTransform(scrollYProgress, [0, 1], [60, -40]);
  const rightY = useTransform(scrollYProgress, [0, 1], [80, -30]);
  const statScale = useTransform(scrollYProgress, [0.1, 0.4], [0.9, 1]);
  const statOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);

  // Start typewriter on scroll into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running && !done) {
          setRunning(true);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [running, done]);

  const handleReplay = () => {
    reset();
    setRunning(false);
    setTimeout(() => setRunning(true), 100);
  };

  const textRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (textRef.current) {
      const viewport = textRef.current.closest("[data-slot='scroll-area-viewport']");
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [output]);

  const stats = [
    { value: t.streamingDemo.statFirstTokenValue, label: t.streamingDemo.statFirstTokenLabel },
    { value: t.streamingDemo.statWpmValue, label: t.streamingDemo.statWpmLabel },
    { value: t.streamingDemo.statUptimeValue, label: t.streamingDemo.statUptimeLabel },
  ];

  return (
    <section id="demo" ref={sectionRef} style={{ position: "relative" }}>
      {/* Grid pattern — subtle */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in srgb, var(--border) 12%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--border) 12%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.3,
          maskImage: "radial-gradient(ellipse 70% 60% at 30% 50%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 30% 50%, black 20%, transparent 70%)",
        }}
      />

      {/* Morphing accent blob */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute pointer-events-none hidden lg:block"
        style={{
          width: "300px", height: "300px",
          top: "10%", right: "5%",
          background: "radial-gradient(circle, color-mix(in srgb, var(--secondary) 10%, transparent), transparent 70%)",
          filter: "blur(50px)",
          borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
        }}
      />

      <div
        ref={containerRef}
        className="mx-auto w-full px-[var(--spacing-md)] py-[var(--spacing-xl)]"
        style={{ maxWidth: "1200px", paddingTop: "6rem", paddingBottom: "6rem", position: "relative" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-xl)] items-center">
          {/* Left: Description — parallax up */}
          <motion.div
            style={{ y: leftY }}
            className="flex flex-col gap-[var(--spacing-md)]"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4 }}
              className="text-primary"
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-small)",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {t.streamingDemo.sectionLabel}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "clamp(var(--font-size-h2), 3.5vw, var(--text-2xl))",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                lineHeight: 1.2, letterSpacing: "-0.01em", margin: 0,
              }}
            >
              {t.streamingDemo.headlinePart1}{" "}
              <span className="text-primary">{t.streamingDemo.headlineAccent}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground"
              style={{
                fontFamily: FONT, fontSize: "var(--font-size-body)",
                fontWeight: "var(--font-weight-normal)" as unknown as number,
                lineHeight: 1.6, margin: 0, maxWidth: "440px",
              }}
            >
              {t.streamingDemo.description}
            </motion.p>

            {/* Stats — neumorphic pills with scroll-driven scale */}
            <motion.div
              style={{ scale: statScale, opacity: statOpacity }}
              className="flex gap-[var(--spacing-md)] mt-[var(--spacing-sm)]"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center"
                  style={{
                    padding: "var(--spacing-sm) var(--spacing-md)",
                    borderRadius: "var(--radius-card)",
                    background: "var(--background)",
                    boxShadow: NEU,
                    minWidth: "80px",
                  }}
                >
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: FONT, fontSize: "var(--font-size-h2)",
                      fontWeight: "var(--font-weight-semibold)" as unknown as number,
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    className="text-muted-foreground"
                    style={{
                      fontFamily: FONT, fontSize: "var(--font-size-caption)",
                      fontWeight: "var(--font-weight-normal)" as unknown as number,
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Streaming terminal — parallax with neumorphic card */}
          <motion.div style={{ y: rightY }}>
            <div
              className={cn("rounded-[var(--radius-card)]", "overflow-hidden")}
              style={{ background: "var(--background)", boxShadow: NEU_LG }}
            >
              {/* Gradient top bar */}
              <div style={{ height: "3px", background: "linear-gradient(90deg, var(--secondary), var(--primary), var(--secondary))" }} />

              {/* Header */}
              <div
                className="flex items-center justify-between px-[var(--spacing-md)] py-[var(--spacing-sm)]"
                style={{
                  background: "var(--muted)",
                  borderBottom: "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                }}
              >
                <div className="flex items-center gap-[var(--spacing-xs)]">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 15%, var(--background)), color-mix(in srgb, var(--primary) 10%, var(--background)))",
                      boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.5), inset -1px -1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Bot className="size-3.5 text-primary" />
                  </div>
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: FONT, fontSize: "var(--font-size-small)",
                      fontWeight: "var(--font-weight-medium)" as unknown as number,
                    }}
                  >
                    {t.streamingDemo.aiResponseLabel}
                  </span>
                  {!done && running && (
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-secondary"
                      style={{
                        fontFamily: FONT, fontSize: "var(--font-size-caption)",
                        fontWeight: "var(--font-weight-normal)" as unknown as number,
                      }}
                    >
                      {t.streamingDemo.streamingStatus}
                    </motion.span>
                  )}
                </div>
                {done && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReplay}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="size-3" />
                    <span style={{ fontFamily: FONT, fontSize: "var(--font-size-caption)", fontWeight: "var(--font-weight-normal)" as unknown as number }}>
                      {t.streamingDemo.replayButton}
                    </span>
                  </Button>
                )}
              </div>

              {/* Content */}
              <ScrollArea style={{ height: "320px" }}>
                <div ref={textRef} className="p-[var(--spacing-md)]">
                  <p
                    className="text-card-foreground"
                    style={{
                      fontFamily: FONT, fontSize: "var(--font-size-small)",
                      fontWeight: "var(--font-weight-normal)" as unknown as number,
                      lineHeight: 1.7, margin: 0,
                    }}
                  >
                    {output ? renderFormatted(output) : (
                      <span className="text-muted-foreground/50">
                        {t.streamingDemo.scrollToStart}
                      </span>
                    )}
                    {running && !done && (
                      <motion.span
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="inline-block ml-0.5 text-secondary"
                      >
                        |
                      </motion.span>
                    )}
                  </p>
                </div>
              </ScrollArea>

              {/* Progress bar — gradient */}
              <div style={{ height: "3px", background: "var(--muted)" }}>
                <motion.div
                  style={{ height: "100%", background: "linear-gradient(90deg, var(--secondary), var(--primary))" }}
                  initial={{ width: "0%" }}
                  animate={{
                    width: done ? "100%" : running ? `${Math.min((output.split(" ").length / demoText.split(" ").length) * 100, 100)}%` : "0%",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}