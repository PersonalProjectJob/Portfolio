import { motion } from "motion/react";

export function PortfolioHero() {
  return (
    <section
      className="relative mx-auto w-full px-6 py-12 md:px-12 md:py-16"
      style={{ maxWidth: "1440px" }}
    >
      {/* Hero Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto overflow-hidden rounded-[44px] md:rounded-[28px]"
        style={{
          background: "linear-gradient(180deg, #FBFDFF 0%, #EEF4FB 100%)",
          border: "1px solid #D6E2F0",
          boxShadow: "0 16px 32px rgba(182, 196, 213, 0.2)",
          padding: "36px",
        }}
      >
        <div
          className="mx-auto flex flex-col items-center gap-7"
          style={{ maxWidth: "900px" }}
        >
          {/* Label */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontFamily: "Inter",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "1px",
              color: "#6C7A90",
            }}
          >
            PORTFOLIO
          </motion.span>

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
            style={{
              fontFamily: "Playfair Display",
              fontSize: "clamp(32px, 8vw, 98px)",
              fontWeight: 500,
              lineHeight: 1.08,
              letterSpacing: "-1px",
              color: "#1E2C43",
              margin: 0,
            }}
          >
            <span className="block">I'm Thao</span>
            <span className="block">Remote Designer</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
            style={{
              fontFamily: "Inter",
              fontSize: "clamp(15px, 2vw, 22px)",
              fontWeight: "normal",
              lineHeight: 1.45,
              color: "#56657E",
              maxWidth: "700px",
              margin: 0,
            }}
          >
            I specialize in designing thoughtful digital products, collaborating
            with startups and ambitious brands across strategy, motion, and
            interface systems.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
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
                background: "#2A3F67",
                border: "1px solid #314B79",
                borderRadius: "18px",
                padding: "16px 24px",
                boxShadow: "0 12px 24px rgba(33, 58, 96, 0.2)",
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
                color: "#233A67",
                textDecoration: "none",
                background: "#FFFFFF",
                border: "1px solid #D9E5F1",
                borderRadius: "18px",
                padding: "16px 24px",
                boxShadow: "0 12px 24px rgba(201, 213, 227, 0.12)",
              }}
            >
              See Projects
            </a>
          </motion.div>

          {/* Preview Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full overflow-hidden rounded-[12px]"
            style={{
              height: "clamp(200px, 30vw, 280px)",
              background: "linear-gradient(135deg, #DDEBFF 0%, #C5D8F2 100%)",
              border: "1px solid #C9D8EA",
              marginTop: "8px",
            }}
          >
            {/* Placeholder for hero image/preview */}
            <div className="flex h-full items-center justify-center">
              <span
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  color: "#6C7A90",
                  opacity: 0.5,
                }}
              >
                Hero Preview
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
