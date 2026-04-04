import { useEffect, useState, useCallback } from "react";
import { Globe, Menu, X, ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";
import { AuthModal } from "../chat/AuthModal";

export interface PageHeaderProps {
  /** Optional search functionality - if provided, shows search bar */
  onSearch?: (query: string) => void;
  /** Custom links to display in menu */
  links?: { href: string; label: string }[];
  /** Custom CTA button text and action */
  ctaLabel?: string;
  ctaHref?: string;
  /** Whether to show language toggle (default: true) */
  showLanguageToggle?: boolean;
}

export function PageHeader({
  onSearch,
  links = [],
  ctaLabel,
  ctaHref = "/chat",
  showLanguageToggle = true,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleScroll = useCallback(() => {
    // Close menu on scroll
    if (isMenuOpen) setIsMenuOpen(false);
  }, [isMenuOpen]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* Close mobile menu on route change or resize to desktop */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleLocale = () => setLocale(locale === "vi" ? "en" : "vi");

  const handleSearchSubmit = useCallback(() => {
    const q = searchQuery.trim();
    if (!q || !onSearch) return;
    onSearch(q);
    setSearchQuery("");
    setIsMenuOpen(false);
  }, [searchQuery, onSearch]);

  const handleLoginClick = useCallback(() => {
    setIsMenuOpen(false);
    setShowAuthModal(true);
  }, []);

  const defaultLinks = [
    { href: "#features", label: t.nav.features },
    { href: "#demo", label: t.nav.demo },
    { href: "#integrations", label: t.nav.integrations },
  ];

  const displayLinks = links.length > 0 ? links : defaultLinks;

  return (
    <>
      {/* ============================================================ */}
      {/*  Sticky Navbar — always visible                               */}
      {/* ============================================================ */}
      <nav
        className={cn(
          "sticky top-0 z-50",
          "bg-background/80 backdrop-blur-xl border-b border-border/30",
        )}
      >
        <div
          className={cn(
            "relative grid items-center",
            "px-[var(--spacing-md)] py-[var(--spacing-sm)]",
            "mx-auto w-full",
          )}
          style={{
            maxWidth: "1200px",
            gridTemplateColumns: "1fr auto 1fr",
            paddingTop: "calc(var(--spacing-sm) + env(safe-area-inset-top))",
          }}
        >
          {/* ── Logo — left ── */}
          <div className="flex items-center gap-[var(--spacing-xs)] shrink-0 justify-self-start">
            <img
              src="https://res.cloudinary.com/dp6ctjvbv/image/upload/v1771260933/ChatGPT_Image_20_34_50_16_thg_2_2026_1_copy_ymaxby.png"
              alt={t.common.brandName}
              className="block nav-logo-img"
              style={{ height: "36px", width: "auto" }}
            />
            <style>{`
              @media (min-width: 768px) {
                .nav-logo-img { height: 44px !important; }
              }
            `}</style>
          </div>

          {/* ── Center — Search bar (desktop only) ── */}
          {onSearch && (
            <div className="justify-self-center">
              <div
                className="hidden md:flex items-center"
                style={{ minWidth: "340px", maxWidth: "420px" }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchSubmit();
                  }}
                  className={cn(
                    "flex items-center w-full",
                    "bg-muted border border-border/60",
                    "rounded-[var(--radius-button)]",
                    "transition-all duration-200",
                    "focus-within:border-secondary focus-within:ring-[2px] focus-within:ring-secondary/20",
                  )}
                  style={{
                    height: "var(--button-height-default)",
                    paddingLeft: "var(--spacing-sm)",
                    paddingRight: "var(--spacing-2xs)",
                  }}
                >
                  <Search
                    className="text-muted-foreground shrink-0"
                    style={{ width: "15px", height: "15px" }}
                  />
                  <input
                    type="search"
                    enterKeyHint="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.search.placeholder}
                    className={cn(
                      "flex-1 bg-transparent border-none outline-none",
                      "text-foreground placeholder:text-muted-foreground",
                    )}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "var(--font-size-small)",
                      fontWeight: "var(--font-weight-normal)" as unknown as number,
                      paddingLeft: "var(--spacing-xs)",
                      paddingRight: "var(--spacing-xs)",
                      minWidth: 0,
                    }}
                  />
                  <button
                    type="submit"
                    className={cn(
                      "flex items-center justify-center shrink-0",
                      "bg-secondary text-secondary-foreground",
                      "rounded-[var(--radius-button)]",
                      "hover:bg-secondary/90 active:bg-secondary/80",
                      "transition-colors cursor-pointer",
                    )}
                    style={{
                      width: "var(--button-height-lg)",
                      height: "var(--button-height-lg)",
                    }}
                    aria-label={t.chat.sendMessage}
                  >
                    <ArrowRight style={{ width: "14px", height: "14px" }} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── Right side ── */}
          <div className="flex items-center gap-[var(--spacing-xs)] md:gap-[var(--spacing-sm)] justify-self-end">
            {/* Language toggle */}
            {showLanguageToggle && (
              <button
                onClick={toggleLocale}
                className={cn(
                  "flex items-center justify-center",
                  "rounded-[var(--radius-button)]",
                  "border border-border/60",
                  "bg-background hover:bg-muted",
                  "text-muted-foreground hover:text-foreground",
                  "transition-all duration-150",
                  "cursor-pointer",
                  "size-[var(--button-height-lg)]",
                  "md:w-auto md:h-[var(--button-height-sm)] md:px-[var(--spacing-sm)] md:py-[var(--spacing-xs)]",
                  "md:gap-[var(--spacing-2xs)]",
                )}
                aria-label={
                  locale === "vi"
                    ? "Switch to English"
                    : "Chuyển sang Tiếng Việt"
                }
              >
                <Globe
                  className="text-muted-foreground shrink-0"
                  style={{ width: "14px", height: "14px" }}
                />
                <span
                  className="hidden md:inline"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-caption)",
                    fontWeight: "var(--font-weight-medium)" as unknown as number,
                    lineHeight: 1,
                  }}
                >
                  {locale === "vi" ? "VI" : "EN"}
                </span>
              </button>
            )}

            {/* Login — hidden on mobile, visible md+ */}
            <Button
              onClick={handleLoginClick}
              variant="outline"
              className="hidden md:inline-flex"
            >
              {t.waitlist.loginTab}
            </Button>

            {/* CTA — hidden on mobile, visible md+ */}
            <Button
              onClick={() => navigate(ctaHref)}
              variant="default"
              className="hidden md:inline-flex"
            >
              {ctaLabel || t.common.tryNow}
            </Button>

            {/* Hamburger — visible on mobile only */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={cn(
                "flex md:hidden items-center justify-center",
                "size-[var(--button-height-lg)]",
                "rounded-[var(--radius-button)]",
                "text-foreground",
                "hover:bg-muted",
                "transition-colors duration-150",
                "cursor-pointer",
              )}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X style={{ width: "20px", height: "20px" }} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu style={{ width: "20px", height: "20px" }} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* ── Mobile dropdown menu ── */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="md:hidden overflow-hidden"
                style={{
                  gridColumn: "1 / -1",
                  borderTop: "1px solid var(--border)",
                  marginTop: "var(--spacing-sm)",
                }}
              >
                <div
                  className="flex flex-col"
                  style={{
                    paddingTop: "var(--spacing-sm)",
                    paddingBottom: "var(--spacing-md)",
                    gap: "var(--spacing-2xs)",
                  }}
                >
                  {/* Mobile search bar */}
                  {onSearch && (
                    <motion.form
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSearchSubmit();
                      }}
                      className={cn(
                        "flex items-center w-full",
                        "bg-muted border border-border/60",
                        "rounded-[var(--radius-button)]",
                        "focus-within:border-secondary focus-within:ring-[2px] focus-within:ring-secondary/20",
                      )}
                      style={{
                        height: "var(--button-height-lg)",
                        paddingLeft: "var(--spacing-sm)",
                        paddingRight: "var(--spacing-xs)",
                        marginBottom: "var(--spacing-xs)",
                      }}
                    >
                      <Search
                        className="text-muted-foreground shrink-0"
                        style={{ width: "16px", height: "16px" }}
                      />
                      <input
                        type="search"
                        enterKeyHint="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.search.placeholderShort}
                        className={cn(
                          "flex-1 bg-transparent border-none outline-none",
                          "text-foreground placeholder:text-muted-foreground",
                        )}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "var(--font-size-body)",
                          fontWeight: "var(--font-weight-normal)" as unknown as number,
                          paddingLeft: "var(--spacing-xs)",
                          paddingRight: "var(--spacing-xs)",
                          minWidth: 0,
                        }}
                      />
                      {searchQuery.trim() && (
                        <button
                          type="submit"
                          className={cn(
                            "flex items-center justify-center shrink-0",
                            "bg-secondary text-secondary-foreground",
                            "rounded-[var(--radius-button)]",
                            "cursor-pointer",
                          )}
                          style={{
                            width: "var(--button-height-lg)",
                            height: "var(--button-height-lg)",
                          }}
                          aria-label={t.chat.sendMessage}
                        >
                          <ArrowRight style={{ width: "16px", height: "16px" }} />
                        </button>
                      )}
                    </motion.form>
                  )}

                  {/* Nav links */}
                  {displayLinks.map((l, index) => (
                    <motion.a
                      key={l.href}
                      href={l.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center",
                        "px-[var(--spacing-sm)] py-[var(--spacing-sm)]",
                        "rounded-[var(--radius)]",
                        "text-foreground hover:bg-muted",
                        "transition-colors duration-150",
                      )}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "var(--font-size-body)",
                        fontWeight: "var(--font-weight-medium)" as unknown as number,
                        minHeight: "var(--touch-target-min)",
                      }}
                    >
                      {l.label}
                    </motion.a>
                  ))}

                  {/* Divider */}
                  <div
                    className="bg-border/50"
                    style={{
                      height: "1px",
                      marginTop: "var(--spacing-xs)",
                      marginBottom: "var(--spacing-xs)",
                    }}
                  />

                  {/* Login button — mobile only */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <Button
                      onClick={handleLoginClick}
                      variant="outline"
                      size="lg"
                      className="w-full"
                      style={{
                        fontSize: "var(--font-size-body)",
                        gap: "var(--spacing-xs)",
                      }}
                    >
                      {t.waitlist.loginTab}
                    </Button>
                  </motion.div>

                  {/* CTA button — full width */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                  >
                    <Button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate(ctaHref);
                      }}
                      variant="default"
                      size="lg"
                      className="w-full"
                      style={{
                        fontSize: "var(--font-size-body)",
                        gap: "var(--spacing-xs)",
                      }}
                    >
                      {ctaLabel || t.common.tryNowFree}
                      <ArrowRight style={{ width: "16px", height: "16px" }} />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} initialMode="login" />
    </>
  );
}
