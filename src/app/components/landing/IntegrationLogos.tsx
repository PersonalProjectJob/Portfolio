import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";

/**
 * Integration logos rendered as styled text badges.
 * Using text-based logos to keep the page lightweight and
 * avoid external image dependencies.
 */

interface Integration {
  name: string;
  abbr: string;
  logo: string;
}

const INTEGRATIONS: Integration[] = [
  {
    name: "LinkedIn",
    abbr: "in",
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230A66C2'%3E%3Cpath d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/%3E%3C/svg%3E",
  },
  {
    name: "Slack",
    abbr: "S",
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234A154B'%3E%3Cpath d='M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z'/%3E%3C/svg%3E",
  },
  {
    name: "Notion",
    abbr: "N",
    logo: "https://cdn.simpleicons.org/notion/000000",
  },
  {
    name: "Google Docs",
    abbr: "G",
    logo: "https://cdn.simpleicons.org/googledocs/4285F4",
  },
  {
    name: "GitHub",
    abbr: "GH",
    logo: "https://cdn.simpleicons.org/github/181717",
  },
  {
    name: "Jira",
    abbr: "J",
    logo: "https://cdn.simpleicons.org/jira/0052CC",
  },
  {
    name: "Figma",
    abbr: "F",
    logo: "https://cdn.simpleicons.org/figma/F24E1E",
  },
  {
    name: "Trello",
    abbr: "T",
    logo: "https://cdn.simpleicons.org/trello/0052CC",
  },
];

export function IntegrationLogos() {
  const { t } = useI18n();
  const chainRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isChainInView = useInView(chainRef, { once: false, margin: "-60px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [40, -20]);

  return (
    <section id="integrations" ref={sectionRef} style={{ background: "color-mix(in srgb, var(--muted) 85%, transparent)", position: "relative" }}>
      {/* Glassmorphic orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        className="absolute pointer-events-none hidden lg:block"
        style={{
          width: 120, height: 120, top: "12%", right: "4%",
          borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
          background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(8px)",
        }}
      />
      <div
        className="mx-auto w-full px-[var(--spacing-md)] py-[var(--spacing-xl)]"
        style={{ maxWidth: "1200px", paddingTop: "6rem", paddingBottom: "6rem" }}
      >
        {/* Heading — parallax */}
        <motion.div
          style={{ y: headingY, marginBottom: "2.5rem" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <span
            className="text-primary"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-small)",
              fontWeight: "var(--font-weight-semibold)" as unknown as number,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {t.integrations.sectionLabel}
          </span>
          <h2
            className="text-foreground mt-[var(--spacing-xs)]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(var(--font-size-h2), 3.5vw, var(--text-2xl))",
              fontWeight: "var(--font-weight-semibold)" as unknown as number,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              margin: 0,
              marginTop: "var(--spacing-xs)",
            }}
          >
            {t.integrations.heading}
          </h2>
          <p
            className="text-muted-foreground mt-[var(--spacing-sm)] mx-auto"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-body)",
              fontWeight: "var(--font-weight-normal)" as unknown as number,
              lineHeight: 1.6,
              marginTop: "var(--spacing-sm)",
              marginBottom: 0,
              marginLeft: "auto",
              marginRight: "auto",
              maxWidth: "480px",
            }}
          >
            {t.integrations.description}
          </p>
        </motion.div>

        {/* Logo chain — rope wave animation */}
        <div ref={chainRef}>
          {/* Keyframes & utility styles */}
          <style>{`
            /* ── Entrance: fast whip pull from right ── */
            @keyframes pill-enter {
              0% {
                opacity: 0;
                transform: scale(0.8) translateX(30px);
              }
              55% {
                opacity: 1;
                transform: scale(1.04) translateX(-3px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateX(0);
              }
            }

            /* ── Wave: rope ripple oscillation ── */
            @keyframes pill-wave {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              20% { transform: translateY(-9px) rotate(-1.2deg); }
              50% { transform: translateY(3px) rotate(0.6deg); }
              80% { transform: translateY(-6px) rotate(-0.8deg); }
            }

            /* ── Connector dot pulse synced with wave ── */
            @keyframes dot-pulse {
              0%, 100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.5;
                box-shadow: 0 0 4px color-mix(in srgb, var(--secondary) 30%, transparent);
              }
              35% {
                transform: translate(-50%, -50%) scale(1.5);
                opacity: 1;
                box-shadow: 0 0 10px color-mix(in srgb, var(--secondary) 60%, transparent);
              }
              65% {
                transform: translate(-50%, -50%) scale(0.9);
                opacity: 0.6;
                box-shadow: 0 0 4px color-mix(in srgb, var(--secondary) 20%, transparent);
              }
            }

            /* ── Connector line shimmer ── */
            @keyframes line-shimmer {
              0%, 100% { opacity: 0.5; }
              40% { opacity: 1; }
            }

            /* ── Horizontal marquee (desktop) ── */
            @keyframes chain-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }

            /* ── Classes ── */
            .pill-outer {
              opacity: 0;
              transform: scale(0.8) translateX(30px);
            }
            .pill-outer-active {
              animation: pill-enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
              animation-delay: calc(var(--pill-i, 0) * 0.065s);
            }

            .pill-wave-inner {
              animation: pill-wave 2.8s ease-in-out infinite;
              animation-delay: calc(var(--pill-i, 0) * 0.22s);
              animation-play-state: paused;
            }
            .pill-wave-active .pill-wave-inner {
              animation-play-state: running;
            }

            .chain-dot {
              animation: dot-pulse 2.8s ease-in-out infinite;
              animation-delay: calc(var(--pill-i, 0) * 0.22s + 0.12s);
              animation-play-state: paused;
            }
            .pill-wave-active .chain-dot {
              animation-play-state: running;
            }

            .chain-line {
              animation: line-shimmer 2.8s ease-in-out infinite;
              animation-delay: calc(var(--pill-i, 0) * 0.22s);
              animation-play-state: paused;
            }
            .pill-wave-active .chain-line {
              animation-play-state: running;
            }

            .chain-track-x {
              animation: chain-marquee 38s linear infinite;
            }
            .chain-track-x:hover {
              animation-play-state: paused;
            }
            .chain-track-paused {
              animation-play-state: paused !important;
            }

            .chain-fade-mask {
              mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
              -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
            }
            .chain-mobile-scroll::-webkit-scrollbar { display: none; }
            .chain-mobile-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>

          {/* ── Mobile: horizontal swipeable chain with wave ── */}
          <div
            className={cn(
              "flex md:hidden chain-mobile-scroll items-center",
              isChainInView && "pill-wave-active",
            )}
            style={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              paddingLeft: "var(--spacing-md)",
              paddingRight: "var(--spacing-md)",
              paddingTop: "calc(var(--spacing-md) * 1.5)",
              paddingBottom: "calc(var(--spacing-md) * 1.5)",
            }}
          >
            {INTEGRATIONS.map((item, index) => (
              <div
                key={item.name}
                className={cn(
                  "flex items-center shrink-0 pill-outer",
                  isChainInView && "pill-outer-active",
                )}
                style={{ "--pill-i": index } as React.CSSProperties}
              >
                {/* Chain connector */}
                {index > 0 && (
                  <div className="pill-wave-inner flex items-center shrink-0"
                    style={{
                      "--pill-i": index,
                      width: "var(--spacing-xl)",
                      position: "relative",
                      height: "60px",
                    } as React.CSSProperties}
                  >
                    <div
                      className="chain-line"
                      style={{
                        "--pill-i": index,
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "50%",
                        height: "2px",
                        marginTop: "-1px",
                        background: "linear-gradient(90deg, var(--border), var(--secondary), var(--border))",
                        borderRadius: "1px",
                      } as React.CSSProperties}
                    />
                    <div
                      className="chain-dot"
                      style={{
                        "--pill-i": index,
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "var(--secondary)",
                      } as React.CSSProperties}
                    />
                  </div>
                )}
                {/* Card with wave */}
                <div
                  className="pill-wave-inner"
                  style={{ "--pill-i": index } as React.CSSProperties}
                >
                  <div
                    className={cn(
                      "flex items-center gap-[var(--spacing-sm)]",
                      "bg-card border border-border/60",
                      "rounded-[var(--radius-card)]",
                      "cursor-default shrink-0",
                    )}
                    style={{
                      minWidth: "140px",
                      boxShadow: "var(--elevation-sm)",
                      paddingLeft: "var(--spacing-lg)",
                      paddingRight: "var(--spacing-lg)",
                      paddingTop: "calc(var(--spacing-md) * 1.5)",
                      paddingBottom: "calc(var(--spacing-md) * 1.5)",
                    }}
                  >
                    <div
                      className="flex items-center justify-center shrink-0 overflow-hidden"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "calc(var(--radius) - 2px)",
                      }}
                    >
                      <img
                        src={item.logo}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>
                    <span
                      className="text-foreground"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "var(--font-size-small)",
                        fontWeight: "var(--font-weight-medium)" as unknown as number,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop: marquee chain with wave ── */}
          <div
            className={cn(
              "hidden md:block chain-fade-mask",
              isChainInView && "pill-wave-active",
            )}
            style={{
              overflow: "hidden",
              paddingTop: "calc(var(--spacing-md) * 1.5)",
              paddingBottom: "calc(var(--spacing-md) * 1.5)",
            }}
          >
            <div
              className={cn(
                "flex items-center chain-track-x",
                !isChainInView && "chain-track-paused",
              )}
              style={{ width: "max-content" }}
            >
              {/* Duplicate for seamless loop */}
              {[...INTEGRATIONS, ...INTEGRATIONS].map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className={cn(
                    "flex items-center shrink-0 pill-outer",
                    isChainInView && "pill-outer-active",
                  )}
                  style={{ "--pill-i": index } as React.CSSProperties}
                >
                  {/* Chain connector */}
                  {index > 0 && (
                    <div className="pill-wave-inner flex items-center shrink-0"
                      style={{
                        "--pill-i": index,
                        width: "var(--spacing-xl)",
                        position: "relative",
                        height: "60px",
                      } as React.CSSProperties}
                    >
                      <div
                        className="chain-line"
                        style={{
                          "--pill-i": index,
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: "50%",
                          height: "2px",
                          marginTop: "-1px",
                          background: "linear-gradient(90deg, var(--border), var(--secondary), var(--border))",
                          borderRadius: "1px",
                        } as React.CSSProperties}
                      />
                      <div
                        className="chain-dot"
                        style={{
                          "--pill-i": index,
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--secondary)",
                        } as React.CSSProperties}
                      />
                    </div>
                  )}
                  {/* Card with wave */}
                  <div
                    className="pill-wave-inner"
                    style={{ "--pill-i": index } as React.CSSProperties}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-[var(--spacing-sm)]",
                        "rounded-[var(--radius-card)]",
                        "cursor-default shrink-0",
                      )}
                      style={{
                        minWidth: "140px",
                        background: "var(--background)",
                        boxShadow: "6px 6px 14px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.8)",
                        paddingLeft: "var(--spacing-lg)",
                        paddingRight: "var(--spacing-lg)",
                        paddingTop: "calc(var(--spacing-md) * 1.5)",
                        paddingBottom: "calc(var(--spacing-md) * 1.5)",
                      }}
                    >
                      <div
                        className="flex items-center justify-center shrink-0 overflow-hidden"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "calc(var(--radius) - 2px)",
                        }}
                      >
                        <img
                          src={item.logo}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <span
                        className="text-foreground"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "var(--font-size-small)",
                          fontWeight: "var(--font-weight-medium)" as unknown as number,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}