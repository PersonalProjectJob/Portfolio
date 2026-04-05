import { PortfolioNav } from "../components/portfolio/PortfolioNav";
import { PortfolioHero } from "../components/portfolio/PortfolioHero";
import { SelectedWork } from "../components/portfolio/SelectedWork";
import { ServicesSection } from "../components/portfolio/ServicesSection";
import { AboutSection } from "../components/portfolio/AboutSection";

export function LandingPage() {
  return (
    <div className="min-h-dvh" style={{ position: "relative", background: "linear-gradient(180deg, #F8FBFF 0%, #EAF1FA 100%)" }}>
      <PortfolioNav />
      <main>
        <PortfolioHero />
        <SelectedWork />
        <ServicesSection />
        <AboutSection />
      </main>
    </div>
  );
}
