import { Info } from "lucide-react";
import { useI18n } from "../../lib/i18n";

const FONT = "'Inter', sans-serif";

export function DemoBanner() {
  const { t } = useI18n();

  return (
    <div
      className="flex min-w-0 items-center justify-center shrink-0"
      style={{
        paddingTop: "var(--spacing-2xs)",
        paddingBottom: "var(--spacing-2xs)",
        paddingLeft: "var(--spacing-xs)",
        paddingRight: "var(--spacing-xs)",
        gap: "var(--spacing-xs)",
        background: "linear-gradient(90deg, color-mix(in srgb, var(--secondary) 6%, var(--background)), color-mix(in srgb, var(--secondary) 10%, var(--background)), color-mix(in srgb, var(--secondary) 6%, var(--background)))",
      }}
    >
      <Info
        className="text-secondary shrink-0"
        style={{ width: "13px", height: "13px", opacity: 0.7 }}
      />
      <span
        className="text-secondary min-w-0"
        style={{
          fontFamily: FONT,
          fontSize: "var(--font-size-caption)",
          fontWeight: "var(--font-weight-medium)" as unknown as number,
          lineHeight: 1.4,
          opacity: 0.8,
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {t.chat.demoBanner}
      </span>
    </div>
  );
}
