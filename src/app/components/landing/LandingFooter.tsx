import { useI18n } from "../../lib/i18n";

export function LandingFooter() {
  const { t } = useI18n();

  return (
    <footer
      className="bg-background"
      style={{ position: "relative" }}
    >
      {/* Gradient top border */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, var(--secondary), var(--primary), var(--secondary), transparent)",
          opacity: 0.3,
        }}
      />
      <div
        className="mx-auto w-full px-[var(--spacing-md)] py-[var(--spacing-lg)]"
        style={{ maxWidth: "1200px" }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-[var(--spacing-md)]">
          {/* Logo */}
          <div className="flex items-center gap-[var(--spacing-xs)]">
            <img
              src="https://res.cloudinary.com/dp6ctjvbv/image/upload/v1771260933/ChatGPT_Image_20_34_50_16_thg_2_2026_1_copy_ymaxby.png"
              alt={t.common.brandName}
              style={{ height: "36px", width: "auto" }}
            />
          </div>

          {/* Links */}
          <div
            className="flex items-center gap-[var(--spacing-lg)]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-caption)",
              fontWeight: "var(--font-weight-normal)" as unknown as number,
            }}
          >
            <a href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.privacy}
            </a>
            <a href="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.terms}
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.contact}
            </a>
          </div>

          {/* Copyright */}
          <span
            className="text-muted-foreground/60"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-caption)",
              fontWeight: "var(--font-weight-normal)" as unknown as number,
            }}
          >
            {t.common.copyright}
          </span>
        </div>
      </div>
    </footer>
  );
}