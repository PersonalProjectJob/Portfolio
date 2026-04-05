import { motion } from "motion/react";
import { Home, Briefcase, Palette, Mail, Download } from "lucide-react";

export function BottomDock() {
  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Projects", icon: Briefcase, href: "#projects" },
    { label: "Services", icon: Palette, href: "#services" },
    { label: "Contact", icon: Mail, href: "#contact" },
    { label: "Get Template", icon: Download, href: "#contact", isPrimary: true },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <div
        className="flex items-center gap-1 rounded-full px-2 py-2"
        style={{
          background: "linear-gradient(135deg, #2A3F67 0%, #1E2C43 100%)",
          boxShadow: "0 8px 32px rgba(42, 63, 103, 0.4)",
        }}
      >
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all hover:scale-105 ${
              item.isPrimary ? "bg-white/20" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: item.isPrimary ? 600 : 500,
              color: item.isPrimary ? "#FFFFFF" : undefined,
              textDecoration: "none",
            }}
          >
            <item.icon size={16} />
            <span className="hidden sm:inline">{item.label}</span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
