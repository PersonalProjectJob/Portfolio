/**
 * i18n system — Type-safe internationalization
 *
 * Usage:
 *   1. Wrap your app with <I18nProvider>
 *   2. Use the `useI18n()` hook in any component
 *   3. Access translations via `t.section.key`
 *   4. Switch language via `setLocale("en")` or `setLocale("vi")`
 *
 * Example:
 *   const { t, locale, setLocale } = useI18n();
 *   <h1>{t.hero.headlinePart1}</h1>
 *   <button onClick={() => setLocale("en")}>EN</button>
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { vi, type Translations } from "./locales/vi";
import { en } from "./locales/en";

/* ------------------------------------------------------------------ */
/*  Supported locales                                                   */
/* ------------------------------------------------------------------ */
export type Locale = "vi" | "en";

const LOCALES: Record<Locale, Translations> = {
  vi,
  en,
};

/** Human-readable locale labels (for language switcher UI) */
export const LOCALE_LABELS: Record<Locale, string> = {
  vi: "Tieng Viet",
  en: "English",
};

/** All supported locale keys */
export const SUPPORTED_LOCALES = Object.keys(
  LOCALES,
) as Locale[];

/** Default locale */
export const DEFAULT_LOCALE: Locale = "vi";

/* ------------------------------------------------------------------ */
/*  Local-storage persistence                                           */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = "careerai-locale";

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in LOCALES) return stored as Locale;
  } catch {
    /* SSR or storage unavailable */
  }
  return DEFAULT_LOCALE;
}

function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Context                                                             */
/* ------------------------------------------------------------------ */
interface I18nContextValue {
  /** Current translations object — access like `t.hero.headlinePart1` */
  t: Translations;
  /** Current locale code */
  locale: Locale;
  /** Switch to a different locale */
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(
  null,
);

/* ------------------------------------------------------------------ */
/*  Provider                                                            */
/* ------------------------------------------------------------------ */
export interface I18nProviderProps {
  children: ReactNode;
  /** Override initial locale (defaults to localStorage → "vi") */
  defaultLocale?: Locale;
}

export function I18nProvider({
  children,
  defaultLocale,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(
    defaultLocale ?? getStoredLocale(),
  );

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    storeLocale(newLocale);
    // Update <html lang="..."> for accessibility
    document.documentElement.lang =
      newLocale === "vi" ? "vi" : "en";
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      t: LOCALES[locale],
      locale,
      setLocale,
    }),
    [locale, setLocale],
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */
/**
 * Access translations and locale switching.
 *
 * ```tsx
 * const { t, locale, setLocale } = useI18n();
 * ```
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error(
      "useI18n() must be used within an <I18nProvider>",
    );
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Re-exports                                                          */
/* ------------------------------------------------------------------ */
export type { Translations };