import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowRight, Bot } from "lucide-react";
import { Button } from "../ui/button";
import { useI18n } from "../../lib/i18n";

const FONT = "'Inter', sans-serif";

export function LandingCTA() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.4], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.4], [40, 0]);

  return (
    <section ref={sectionRef} style={{ padding: "var(--spacing-xl) 0" }}>
      <motion.div
        style={{ scale, opacity, borderRadius }}
        className="relative overflow-hidden mx-auto"
        data-cta-container=""
      >
        <style>{`
          [data-cta-container] {
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
          }
          @media (min-width: 1024px) {
            [data-cta-container] {
              max-width: 100%;
              margin: 0;
            }
          }
        `}</style>
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 75%, black) 50%, color-mix(in srgb, var(--primary) 85%, var(--secondary)) 100%)",
            padding: "clamp(3rem, 8vw, 6rem) var(--spacing-xl)",
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Animated gradient mesh */}
          <div className="absolute inset-0 pointer-events-none" style={{ overflow: "hidden" }}>
            {/* Large morphing blobs */}
            <motion.div
              animate={{
                x: [0, 100, -50, 0],
                y: [0, -60, 80, 0],
                scale: [1, 1.2, 0.9, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "-20%", right: "-10%",
                width: "50%", height: "60%",
                borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
                background: "radial-gradient(circle, color-mix(in srgb, var(--secondary) 20%, transparent), transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <motion.div
              animate={{
                x: [0, -80, 60, 0],
                y: [0, 50, -40, 0],
                scale: [1, 0.9, 1.15, 1],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              style={{
                position: "absolute",
                bottom: "-15%", left: "-5%",
                width: "40%", height: "50%",
                borderRadius: "55% 45% 50% 50% / 45% 55% 45% 55%",
                background: "radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)",
                filter: "blur(30px)",
              }}
            />

            {/* Grid pattern */}
            <div
              style={{
                position: "absolute", inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px",
                maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 80%)",
              }}
            />

            {/* Shimmer beam */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
              style={{
                position: "absolute",
                top: "30%", left: 0,
                width: "30%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              }}
            />
          </div>

          <div className="relative flex flex-col items-center gap-[var(--spacing-xl)] text-center" style={{ maxWidth: "640px" }}>
            {/* Icon with glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: "72px", height: "72px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 0 40px rgba(255,255,255,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Bot className="text-primary-foreground" style={{ width: "32px", height: "32px" }} />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-primary-foreground"
              style={{
                fontFamily: FONT,
                fontSize: "clamp(var(--font-size-h1), 4vw, var(--text-2xl))",
                fontWeight: "var(--font-weight-semibold)" as unknown as number,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {t.cta.heading}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-body)",
                fontWeight: "var(--font-weight-normal)" as unknown as number,
                lineHeight: 1.7, margin: 0,
                color: "rgba(255,255,255,0.75)",
                maxWidth: "440px",
              }}
            >
              {t.cta.description}
            </motion.p>

            {/* Button with glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                onClick={() => navigate("/chat")}
                size="lg"
                className="bg-card text-primary hover:bg-card/90"
                style={{
                  fontSize: "var(--font-size-body)",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  paddingLeft: "var(--spacing-xl)",
                  paddingRight: "var(--spacing-xl)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 0 20px rgba(255,255,255,0.1)",
                }}
              >
                {t.common.tryNowFree}
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
