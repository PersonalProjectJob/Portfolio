import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Cloud, Moon } from "lucide-react";

const projects = [
  {
    id: "lander-os",
    title: "LanderOS",
    gradient: "linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 100%)",
  },
  {
    id: "alter",
    title: "Alter",
    gradient: "linear-gradient(135deg, #5EEAD4 0%, #0EA5E9 100%)",
  },
  {
    id: "portfoy",
    title: "Portfoy",
    gradient: "linear-gradient(135deg, #67E8F9 0%, #06B6D4 100%)",
  },
];

export function PortfolioHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative mx-auto w-full overflow-hidden px-6 py-12 md:px-12 md:py-20"
      style={{ maxWidth: "1440px" }}
    >
      <motion.div style={{ y, opacity }}>
        {/* Logo and floating icons */}
        <div className="relative mx-auto mb-8 flex flex-col items-center" style={{ maxWidth: "900px" }}>
          {/* Profile icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 h-16 w-16 overflow-hidden rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #7BC0ED 0%, #2A436B 100%)",
              boxShadow: "0 8px 24px rgba(42, 67, 107, 0.2)",
            }}
          >
            <img
              src="/img/profile.jpg"
              alt="Profile"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(40px, 7vw, 98px)",
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              color: "#1E2C43",
              margin: 0,
            }}
          >
            <span className="block">I'm Thao</span>
            <span className="block">Remote Designer</span>
          </motion.h1>

          {/* Floating decorative icons */}
          <div className="pointer-events-none absolute -right-4 top-0 md:right-12">
            <motion.div
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)",
                boxShadow: "0 8px 24px rgba(147, 197, 253, 0.3)",
              }}
            >
              <Cloud size={32} className="text-white" />
            </motion.div>
          </div>

          <div className="pointer-events-none absolute -left-4 top-16 md:left-12">
            <motion.div
              initial={{ opacity: 0, rotate: 10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, #818CF8 0%, #6366F1 100%)",
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
              }}
            >
              <Moon size={32} className="text-white" />
            </motion.div>
          </div>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mb-8 text-center"
          style={{
            fontFamily: "Inter",
            fontSize: "clamp(15px, 1.5vw, 20px)",
            fontWeight: 400,
            lineHeight: 1.5,
            color: "#5A6880",
            maxWidth: "600px",
            margin: "0 auto 32px",
          }}
        >
          I specialize in creating thoughtful and impactful products,
          collaborating with startups and leading brands
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mx-auto mb-12 flex items-center justify-center gap-4"
        >
          <a
            href="#contact"
            className="transition-all hover:scale-105"
            style={{
              fontFamily: "Inter",
              fontSize: "15px",
              fontWeight: 600,
              color: "#FFFFFF",
              textDecoration: "none",
              background: "linear-gradient(135deg, #2A3F67 0%, #1E2C43 100%)",
              borderRadius: "12px",
              padding: "14px 28px",
              boxShadow: "0 8px 24px rgba(42, 63, 103, 0.3)",
            }}
          >
            Get Template
          </a>
          <a
            href="#projects"
            className="transition-all hover:scale-105"
            style={{
              fontFamily: "Inter",
              fontSize: "15px",
              fontWeight: 600,
              color: "#2A3F67",
              textDecoration: "none",
              background: "#F1F5F9",
              borderRadius: "12px",
              padding: "14px 28px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>→</span> See Projects
          </a>
        </motion.div>

        {/* Horizontal Project Carousel */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-8" style={{ scrollbarWidth: "none" }}>
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="group flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-all hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  width: "340px",
                  background: project.gradient,
                  boxShadow: "0 16px 32px rgba(0, 0, 0, 0.15)",
                }}
              >
                <div className="p-6">
                  {/* Project Preview */}
                  <div
                    className="mb-4 h-48 overflow-hidden rounded-xl bg-white"
                    style={{
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div className="flex h-full items-center justify-center">
                      <span
                        style={{
                          fontFamily: "Inter",
                          fontSize: "24px",
                          fontWeight: 600,
                          color: "#1E2C43",
                          opacity: 0.3,
                        }}
                      >
                        {project.title}
                      </span>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="flex items-center justify-between">
                    <h3
                      style={{
                        fontFamily: "Inter",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#FFFFFF",
                      }}
                    >
                      {project.title}
                    </h3>
                    <span
                      className="transition-transform group-hover:translate-x-1"
                      style={{
                        color: "#FFFFFF",
                        fontSize: "20px",
                      }}
                    >
                      ↗
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
