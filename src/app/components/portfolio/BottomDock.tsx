import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Home, Briefcase, Palette, Mail, Download, ChevronUp } from "lucide-react";

export function BottomDock() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Projects", icon: Briefcase, href: "#projects" },
    { label: "Services", icon: Palette, href: "#services" },
    { label: "Contact", icon: Mail, href: "#contact" },
    { label: "Get Template", icon: Download, href: "#contact", isPrimary: true },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ 
            duration: 0.5, 
            type: "spring", 
            stiffness: 200, 
            damping: 25 
          }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <motion.div
            className="flex items-center gap-1 rounded-full px-2 py-2"
            style={{
              background: "linear-gradient(135deg, #2A3F67 0%, #1E2C43 100%)",
              boxShadow: "0 8px 32px rgba(42, 63, 103, 0.4)",
            }}
            whileHover={{ scale: 1.02 }}
          >
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ 
                  scale: 1.08,
                  background: item.isPrimary ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
                }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                  item.isPrimary ? "bg-white/20 text-white" : "text-white/80 hover:text-white"
                }`}
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: item.isPrimary ? 600 : 500,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <item.icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
