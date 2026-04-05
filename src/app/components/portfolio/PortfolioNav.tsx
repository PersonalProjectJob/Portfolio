import { motion } from "motion/react";
import { useState, useEffect } from "react";

export function PortfolioNav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full"
      style={{
        height: "80px",
        background: isScrolled ? "rgba(255, 255, 255, 0.9)" : "transparent",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        padding: "0 40px",
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
            fontFamily: "Great Vibes, cursive",
            fontSize: "28px",
            fontWeight: 500,
            color: "#1E2C43",
            textDecoration: "none",
          }}
        >
          Son Thao Atelier
        </a>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          <div className="hidden items-center gap-6 md:flex">
            <a
              href="#projects"
              className="transition-colors hover:text-[#1E2C43]"
              style={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 500,
                color: "#64748B",
                textDecoration: "none",
              }}
            >
              Projects
            </a>
            <a
              href="#services"
              className="transition-colors hover:text-[#1E2C43]"
              style={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 500,
                color: "#64748B",
                textDecoration: "none",
              }}
            >
              Services
            </a>
            <a
              href="#about"
              className="transition-colors hover:text-[#1E2C43]"
              style={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 500,
                color: "#64748B",
                textDecoration: "none",
              }}
            >
              Contact
            </a>
          </div>
          
          <a
            href="#contact"
            className="transition-all hover:scale-105"
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
              textDecoration: "none",
              background: "linear-gradient(135deg, #2A3F67 0%, #1E2C43 100%)",
              borderRadius: "10px",
              padding: "12px 20px",
              boxShadow: "0 4px 16px rgba(42, 63, 103, 0.3)",
            }}
          >
            Get In Touch
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
