import { useState } from "react";
import { motion } from "motion/react";

export function PortfolioNav() {
  const [isScrolled, setIsScrolled] = useState(false);

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 20);
    });
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full"
      style={{
        height: "80px",
        background: isScrolled ? "rgba(255, 255, 255, 0.95)" : "#FFFFFF",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #D8E3F0",
        padding: "0 32px",
      }}
    >
      <div
        className="mx-auto flex h-full max-w-7xl items-center justify-between"
        style={{ maxWidth: "1440px" }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            fontFamily: "Great Vibes",
            fontSize: "30px",
            fontWeight: 500,
            color: "#21314A",
            textDecoration: "none",
          }}
        >
          Son Thao Atelier
        </a>

        {/* Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#projects"
            className="transition-colors hover:text-[#2A3F67]"
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              color: "#5D6D86",
              textDecoration: "none",
            }}
          >
            Projects
          </a>
          <a
            href="#services"
            className="transition-colors hover:text-[#2A3F67]"
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              color: "#5D6D86",
              textDecoration: "none",
            }}
          >
            Services
          </a>
          <a
            href="#contact"
            className="transition-colors hover:text-[#2A3F67]"
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              color: "#5D6D86",
              textDecoration: "none",
            }}
          >
            Contact
          </a>
          <a
            href="#contact"
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
              textDecoration: "none",
              background: "#2A3F67",
              border: "1px solid #314B79",
              borderRadius: "18px",
              padding: "14px 18px",
            }}
          >
            Get In Touch
          </a>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-4 md:hidden">
          <span
            style={{
              fontFamily: "Inter",
              fontSize: "12px",
              fontWeight: 500,
              color: "#5D6D86",
            }}
          >
            Projects
          </span>
          <button
            className="rounded-md p-2"
            style={{
              background: "transparent",
              border: "1px solid #D8E3F0",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17M3 10H17M3 15H17" stroke="#5D6D86" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
