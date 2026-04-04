import { LandingNav } from "../components/landing/LandingNav";
import { HeroSection } from "../components/landing/HeroSection";
import { FeatureCards } from "../components/landing/FeatureCards";
import { StreamingDemo } from "../components/landing/StreamingDemo";
import { IntegrationLogos } from "../components/landing/IntegrationLogos";
import { LandingCTA } from "../components/landing/LandingCTA";
import { LandingFooter } from "../components/landing/LandingFooter";
import { AnimatedBackground } from "../components/landing/AnimatedBackground";

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col" style={{ position: "relative" }}>
      {/* Animated background layer — fixed, behind all content */}
      <AnimatedBackground />

      {/* Film grain / noise texture overlay — premium feel */}
      <div
        className="pointer-events-none"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          opacity: 0.025,
          mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
        aria-hidden="true"
      />

      {/* All content sits above the background */}
      <div style={{ position: "relative", zIndex: 1 }} className="flex flex-col">
        <LandingNav />
        <main>
          <HeroSection />
          <FeatureCards />
          <StreamingDemo />
          <IntegrationLogos />
          <LandingCTA />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
