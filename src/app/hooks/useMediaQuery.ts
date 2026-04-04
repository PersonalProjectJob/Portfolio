import { useState, useEffect } from "react";

/**
 * Custom hook to detect viewport breakpoints.
 * Used to switch between Mobile and Desktop layouts.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) =>
      setMatches(e.matches);

    mql.addEventListener("change", handler);
    setMatches(mql.matches);

    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** Convenience: true when viewport ≥ 1024px */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

export type ResponsiveDensity =
  | "compact"
  | "standard"
  | "expanded";

/**
 * Density buckets for layout spacing and container width.
 * - compact: small desktop / split view
 * - standard: regular desktop
 * - expanded: wide desktop
 */
export function useResponsiveDensity(): ResponsiveDensity {
  const isStandardUp = useMediaQuery("(min-width: 768px)");
  const isExpanded = useMediaQuery("(min-width: 1280px)");

  if (isExpanded) return "expanded";
  if (isStandardUp) return "standard";
  return "compact";
}