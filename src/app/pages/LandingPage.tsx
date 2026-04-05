import { PortfolioNav } from "../components/portfolio/PortfolioNav";
import { PortfolioHero } from "../components/portfolio/PortfolioHero";
import { SelectedWork } from "../components/portfolio/SelectedWork";
import { ServicesSection } from "../components/portfolio/ServicesSection";
import { AboutSection } from "../components/portfolio/AboutSection";
import { BottomDock } from "../components/portfolio/BottomDock";

export function LandingPage() {
  return (
    <div 
      className="min-h-dvh relative" 
      style={{ 
        background: "linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394A3B8' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      <PortfolioNav />
      <main className="pb-32">
        <PortfolioHero />
        <SelectedWork />
        <ServicesSection />
        <AboutSection />
      </main>
      <BottomDock />
    </div>
  );
}
