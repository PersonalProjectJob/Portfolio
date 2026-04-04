import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Bot, User, ArrowRight } from "lucide-react";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";

/* ------------------------------------------------------------------ */
/*  Streaming hook                                                      */
/* ------------------------------------------------------------------ */
function useStreamingText(fullText: string, active: boolean, speed = 25) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    if (!active) return;
    idx.current = 0;
    setDisplayed("");
    setDone(false);

    const words = fullText.split(" ");
    const timer = setInterval(() => {
      if (idx.current < words.length) {
        setDisplayed((prev) => (prev ? prev + " " : "") + words[idx.current]);
        idx.current++;
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [fullText, active, speed]);

  return { displayed, done };
}

/* ------------------------------------------------------------------ */
/*  Bold markdown renderer                                              */
/* ------------------------------------------------------------------ */
function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span
          key={i}
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

/* ------------------------------------------------------------------ */
/*  ChatPreview                                                         */
/* ------------------------------------------------------------------ */
export function ChatPreview() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const demos = t.hero.chatDemos;
  const [demoIndex, setDemoIndex] = useState(0);
  const [step, setStep] = useState(0); // 0 = idle, 1 = user msg, 2 = ai streaming

  const currentDemo = demos[demoIndex];

  const { displayed: aiText, done: aiDone } = useStreamingText(
    currentDemo.aiMsg,
    step === 2,
    40,
  );

  /* Auto-scroll to bottom when AI streams text */
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step >= 1 && messagesEndRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [aiText, step, demoIndex]);

  // Start the first demo
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // When AI finishes streaming, wait then cycle to next demo
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (aiDone) {
      clearTimers();
      const wait = setTimeout(() => {
        setStep(0);
        const show = setTimeout(() => {
          setDemoIndex((prev) => (prev + 1) % demos.length);
          setStep(1);
          const ai = setTimeout(() => setStep(2), 1000);
          timersRef.current.push(ai);
        }, 800);
        timersRef.current.push(show);
      }, 4000);
      timersRef.current.push(wait);
      return () => clearTimers();
    }
  }, [aiDone, demos.length, clearTimers]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={cn(
        "w-full rounded-[var(--radius-card)]",
        "overflow-hidden",
      )}
      style={{
        background: "var(--background)",
        boxShadow: "12px 12px 30px rgba(0,0,0,0.08), -8px -8px 20px rgba(255,255,255,0.9), 0 0 0 1px color-mix(in srgb, var(--border) 30%, transparent)",
      }}
    >
      {/* Responsive height: 320px mobile, 400px desktop */}
      <style>{`
        .chat-preview-messages { height: 320px; }
        @media (min-width: 1024px) {
          .chat-preview-messages { height: 400px; }
        }
      `}</style>

      {/* Window chrome */}
      <div className="flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] border-b border-border bg-muted/50">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="flex-1 flex justify-center">
          <span
            className="text-muted-foreground"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-caption)",
              fontWeight: "var(--font-weight-normal)" as unknown as number,
            }}
          >
            {t.hero.chatPreviewTitle}
          </span>
        </div>
        <div className="size-2.5" /> {/* spacer for symmetry */}
      </div>

      {/* Messages area — responsive height, scrollable */}
      <div
        className="chat-preview-messages [&::-webkit-scrollbar]:hidden"
        style={{
          overflowY: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
        ref={scrollContainerRef}
      >
        <div className="flex flex-col gap-[var(--spacing-md)] p-[var(--spacing-md)]">
          {/* User message */}
          {step >= 1 && (
            <motion.div
              key={`user-${demoIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-[var(--spacing-xs)] flex-row-reverse"
            >
              <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <User className="size-3.5 text-primary" />
              </div>
              <div
                className={cn(
                  "bg-primary text-primary-foreground",
                  "px-[var(--spacing-sm)] py-[var(--spacing-xs)]",
                  "rounded-[var(--radius-chat)] rounded-br-[var(--radius-sm)]",
                  "max-w-[75%]",
                )}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                    fontWeight: "var(--font-weight-normal)" as unknown as number,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {currentDemo.userMsg}
                </p>
              </div>
            </motion.div>
          )}

          {/* AI response (streaming) */}
          {step >= 2 && (
            <motion.div
              key={`ai-${demoIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-[var(--spacing-xs)]"
            >
              <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="size-3.5 text-primary" />
              </div>
              <div
                className={cn(
                  "bg-muted text-card-foreground",
                  "px-[var(--spacing-sm)] py-[var(--spacing-xs)]",
                  "rounded-[var(--radius-chat)] rounded-bl-[var(--radius-sm)]",
                  "max-w-[80%]",
                )}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                    fontWeight: "var(--font-weight-normal)" as unknown as number,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {renderBold(aiText)}
                  {!aiDone && (
                    <motion.span
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      className="inline-block ml-0.5 text-primary"
                    >
                      |
                    </motion.span>
                  )}
                </p>
              </div>
            </motion.div>
          )}

          {/* Typing dots before AI response */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-[var(--spacing-xs)]"
            >
              <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="size-3.5 text-primary" />
              </div>
              <div className="bg-muted px-[var(--spacing-sm)] py-[var(--spacing-xs)] rounded-[var(--radius-chat)] rounded-bl-[var(--radius-sm)] flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block size-1.5 rounded-full bg-muted-foreground/40"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Mock input bar */}
      <div className="px-[var(--spacing-md)] pb-[var(--spacing-md)]">
        <div
          onClick={() => navigate("/chat")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/chat"); }}
          className="flex items-center gap-[var(--spacing-xs)] bg-muted rounded-full px-[var(--spacing-md)] py-[var(--spacing-xs)] cursor-pointer hover:bg-muted/80 transition-colors"
        >
          <span
            className="flex-1 text-muted-foreground/50"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-small)",
              fontWeight: "var(--font-weight-normal)" as unknown as number,
            }}
          >
            {t.hero.chatPreviewPlaceholder}
          </span>
          <div className="size-7 rounded-full bg-primary flex items-center justify-center">
            <ArrowRight className="size-3.5 text-primary-foreground" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}