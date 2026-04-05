import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { Cloud, Moon, Sun, Star, Sparkles } from "lucide-react";

const projects = [
  {
    id: "lander-os",
    title: "LanderOS",
    subtitle: "Lead with the data to save your time and money",
    gradient: "linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 100%)",
    logo: "LOS",
  },
  {
    id: "alter",
    title: "Alter",
    subtitle: "Automate. Engage. Convert. Powered by AI.",
    gradient: "linear-gradient(135deg, #5EEAD4 0%, #0EA5E9 100%)",
    logo: "◆",
  },
  {
    id: "portfoy",
    title: "Portfoy",
    subtitle: "Designer Builder - Portfolio Template",
    gradient: "linear-gradient(135deg, #67E8F9 0%, #06B6D4 100%)",
    logo: "PB",
  },
];

function FloatingIcon({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        duration: 0.8, 
        delay,
        type: "spring",
        stiffness: 180,
        damping: 12,
      }}
      className={`pointer-events-none absolute ${className}`}
    >
      <motion.div
        animate={{ 
          y: [0, -12, 0],
          rotate: [0, 8, -8, 0],
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="rounded-2xl p-4"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function HeroButton({ children, variant = "primary", delay = 0 }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={variant === "primary" ? "#contact" : "#projects"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.95 }}
      className="relative overflow-hidden"
      style={{
        fontFamily: "Inter",
        fontSize: "15px",
        fontWeight: 600,
        textDecoration: "none",
        borderRadius: "12px",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
      }}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: variant === "primary" 
            ? "linear-gradient(135deg, #2A3F67 0%, #1E2C43 100%)" 
            : "#F1F5F9",
        }}
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 300 }}
      />

      {/* Shine Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            exit={{ x: "200%" }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            }}
          />
        )}
      </AnimatePresence>

      <span 
        className="relative z-10"
        style={{ color: variant === "primary" ? "#FFFFFF" : "#2A3F67" }}
      >
        {children}
      </span>

      {/* Shadow */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          boxShadow: variant === "primary"
            ? "0 8px 24px rgba(42, 63, 103, 0.3)"
            : "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      />
    </motion.a>
  );
}

export function PortfolioHero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  // Animated text reveal
  const titleWords = ["I'm", "Thao", "Remote", "Designer"];
  const [visibleWords, setVisibleWords] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleWords(titleWords.length);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative mx-auto w-full overflow-hidden px-6 py-12 md:px-12 md:py-20"
      style={{ maxWidth: "1440px" }}
    >
      <motion.div style={{ y, opacity, scale }}>
        {/* Floating Icons */}
        <div className="relative">
          <FloatingIcon delay={0.4} className="right-8 top-0 md:right-24">
            <Cloud size={28} className="text-blue-400" />
          </FloatingIcon>

          <FloatingIcon delay={0.5} className="left-8 top-20 md:left-24">
            <Moon size={28} className="text-indigo-400" />
          </FloatingIcon>

          <FloatingIcon delay={0.6} className="right-32 top-32 hidden md:block">
            <Star size={24} className="text-amber-400" />
          </FloatingIcon>

          <FloatingIcon delay={0.7} className="left-32 top-40 hidden md:block">
            <Sparkles size={24} className="text-purple-400" />
          </FloatingIcon>

          {/* Profile Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            className="mx-auto mb-8 flex justify-center"
          >
            <motion.div
              className="relative h-20 w-20 overflow-hidden rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #7BC0ED 0%, #2A436B 100%)",
                boxShadow: "0 12px 40px rgba(42, 67, 107, 0.25)",
              }}
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <img
                src="/img/profile.jpg"
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                    "linear-gradient(135deg, transparent 100%, rgba(255,255,255,0.3) 50%, transparent 0%)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              />
            </motion.div>
          </motion.div>

          {/* Hero Title with Word-by-Word Animation */}
          <motion.h1
            className="mb-6 text-center"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(40px, 7vw, 98px)",
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              color: "#1E2C43",
            }}
          >
            {titleWords.map((word, index) => (
              <motion.span
                key={word}
                className="inline-block"
                initial={{ opacity: 0, y: 40, rotateX: -90 }}
                animate={index < visibleWords ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ 
                  delay: 0.3 + index * 0.1,
                  type: "spring",
                  stiffness: 150,
                  damping: 15,
                }}
                style={{ 
                  display: "inline-block",
                  marginRight: word === "Thao" || word === "Designer" ? "0" : "0.3em",
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mx-auto mb-10 text-center"
          style={{
            fontFamily: "Inter",
            fontSize: "clamp(15px, 1.5vw, 20px)",
            fontWeight: 400,
            lineHeight: 1.6,
            color: "#64748B",
            maxWidth: "550px",
          }}
        >
          I specialize in creating thoughtful and impactful products,
          collaborating with startups and leading brands
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mx-auto mb-16 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <HeroButton variant="primary" delay={0.9}>
            Get Template
          </HeroButton>
          <HeroButton variant="secondary" delay={1}>
            <span>→</span> See Projects
          </HeroButton>
        </motion.div>

        {/* Horizontal Project Carousel */}
        <div className="relative">
          <motion.div 
            className="flex gap-6 overflow-x-auto pb-8"
            style={{ 
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {projects.map((project, index) => (
              <motion.a
                key={project.id}
                href={`#${project.id}`}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 1 + index * 0.15,
                  type: "spring",
                  stiffness: 120,
                  damping: 18,
                }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.03,
                  boxShadow: "0 24px 48px rgba(0, 0, 0, 0.15)",
                  transition: { duration: 0.3, type: "spring", stiffness: 300 },
                }}
                className="group flex-shrink-0 cursor-pointer overflow-hidden rounded-3xl"
                style={{
                  width: "360px",
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
                  textDecoration: "none",
                }}
              >
                {/* Project Preview */}
                <div
                  className="relative h-52 overflow-hidden"
                  style={{ background: project.gradient }}
                >
                  {/* Animated Gradient */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)`,
                      backgroundSize: "150% 150%",
                    }}
                  />

                  <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-white">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: 1.2 + index * 0.15, 
                        type: "spring", 
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20"
                      style={{ backdropFilter: "blur(8px)" }}
                    >
                      <span style={{ fontSize: "24px", fontWeight: 700 }}>
                        {project.logo}
                      </span>
                    </motion.div>
                    
                    <h3
                      style={{
                        fontFamily: "Inter",
                        fontSize: "20px",
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      {project.title}
                    </h3>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20"
                    style={{ backdropFilter: "blur(8px)" }}
                    whileHover={{ scale: 1.2, rotate: 45 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span style={{ fontSize: "18px" }}>↗</span>
                  </motion.div>
                </div>

                {/* Project Info */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h4
                      style={{
                        fontFamily: "Inter",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#1E2C43",
                      }}
                    >
                      {project.title}
                    </h4>
                    <motion.span
                      style={{ color: "#94A3B8", fontSize: "20px" }}
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
