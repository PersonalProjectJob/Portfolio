import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ArrowRight, ExternalLink, Calendar, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

// Project data
const projects = [
  {
    id: "caloer-official",
    title: "Caloer Official - Food & Nutrition App",
    subtitle: "UI/UX Redesign",
    category: "UI Design",
    banner: "/img/Redesign Caloer Official.pdf",
    bannerImage: "/img/Redesign-Caloer-Official-Banner.jpg", // Placeholder - replace with actual image
    description: "Complete UI/UX redesign of Caloer Official food tracking application with focus on user experience and modern design principles.",
    problem: "Low user engagement (2.1 daily active users), confusing navigation flow, outdated visual design causing high churn rate (68% within 7 days).",
    solution: "Comprehensive redesign focusing on intuitive food logging, clear nutritional insights, and modern visual language that motivates daily use.",
    role: "Lead UX/UI Designer",
    timeline: "3 months",
    team: "2 Designers, 1 PM",
    tools: ["Figma", "Principle", "Maze", "Hotjar"],
    process: [
      {
        step: 1,
        title: "Research & Discovery",
        description: "Conducted user interviews with 25+ users, analyzed 10K+ session recordings, mapped pain points in existing flow.",
        image: "/assets/projects/caloer/research.png"
      },
      {
        step: 2,
        title: "Information Architecture",
        description: "Restructured app navigation from 5 tabs to 3 core flows: Log, Track, Discover.",
        image: "/assets/projects/caloer/ia.png"
      },
      {
        step: 3,
        title: "Wireframing",
        description: "Created 80+ low-fidelity screens, tested with 15 users, iterated based on feedback.",
        image: "/assets/projects/caloer/wireframes.png"
      },
      {
        step: 4,
        title: "High-Fidelity Design",
        description: "Pixel-perfect designs with new design system, 300+ components, dark mode support.",
        image: "/assets/projects/caloer/final.png"
      }
    ],
    results: [
      { metric: "Daily Active Users", value: 340, suffix: "%", improvement: true },
      { metric: "7-Day Retention", value: 58, suffix: "%", improvement: true },
      { metric: "Task Completion", value: 89, suffix: "%", improvement: true },
      { metric: "App Store Rating", value: 4.8, suffix: "★", improvement: true }
    ],
    images: [
      "/assets/projects/caloer/screen-1.png",
      "/assets/projects/caloer/screen-2.png",
      "/assets/projects/caloer/screen-3.png",
      "/assets/projects/caloer/screen-4.png",
      "/assets/projects/caloer/screen-5.png",
      "/assets/projects/caloer/screen-6.png"
    ],
    liveUrl: "https://caloer.app"
  },
  {
    id: "cryptomap360",
    title: "CryptoMap 360 - Blockchain Analytics",
    subtitle: "Dashboard Design",
    category: "UX Design",
    banner: "/img/cryptomap360.pdf",
    bannerImage: "/img/CryptoMap360-Banner.jpg", // Placeholder - replace with actual image
    description: "Comprehensive blockchain analytics dashboard enabling traders to visualize crypto market data, track portfolios, and make informed decisions.",
    problem: "Crypto traders struggled with fragmented data across 8+ platforms. No single source of truth for portfolio tracking and market analysis.",
    solution: "Unified dashboard with real-time data visualization, portfolio tracking, customizable alerts, and AI-powered insights.",
    role: "UX Designer & Researcher",
    timeline: "4 months",
    team: "1 UX Designer, 2 Developers, 1 Data Scientist",
    tools: ["Figma", "D3.js", "Recharts", "Miro", "Notion"],
    process: [
      {
        step: 1,
        title: "User Research",
        description: "Surveyed 500+ crypto traders, conducted 30 in-depth interviews, identified 5 core user personas.",
        image: "/assets/projects/cryptomap/research.png"
      },
      {
        step: 2,
        title: "Data Architecture",
        description: "Mapped complex data relationships, designed intuitive information hierarchy for 15+ data sources.",
        image: "/assets/projects/cryptomap/architecture.png"
      },
      {
        step: 3,
        title: "Dashboard Design",
        description: "Created modular dashboard with drag-and-drop widgets, customizable layouts, real-time updates.",
        image: "/assets/projects/cryptomap/dashboard.png"
      },
      {
        step: 4,
        title: "Testing & Iteration",
        description: "Usability testing with 40 traders, 3 iteration cycles, achieved 92% task success rate.",
        image: "/assets/projects/cryptomap/testing.png"
      }
    ],
    results: [
      { metric: "User Satisfaction", value: 94, suffix: "%", improvement: true },
      { metric: "Time to Insight", value: 65, suffix: "%", improvement: true },
      { metric: "Data Accuracy", value: 99.9, suffix: "%", improvement: true },
      { metric: "Beta Users", value: 2500, suffix: "+", improvement: true }
    ],
    images: [
      "/assets/projects/cryptomap/dashboard-1.png",
      "/assets/projects/cryptomap/dashboard-2.png",
      "/assets/projects/cryptomap/portfolio.png",
      "/assets/projects/cryptomap/alerts.png",
      "/assets/projects/cryptomap/mobile-1.png",
      "/assets/projects/cryptomap/mobile-2.png"
    ],
    liveUrl: "https://cryptomap360.io"
  }
];

export function ProjectsPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const [activeFilter, setActiveFilter] = useState("All");
  const categories = ["All", "UI Design", "UX Design", "AI Projects", "Branding"];

  const filteredProjects = activeFilter === "All" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  return (
    <div ref={containerRef} className="min-h-dvh bg-background">
      {/* Background gradient */}
      <motion.div 
        style={{ y: bgY }}
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 40%, color-mix(in srgb, var(--secondary) 8%, transparent) 0%, transparent 70%),
              radial-gradient(ellipse 60% 50% at 80% 30%, color-mix(in srgb, var(--primary) 6%, transparent) 0%, transparent 70%)
            `,
          }}
        />
      </motion.div>

      {/* Navbar placeholder - will use existing LandingNav */}
      <div style={{ height: "80px" }} />

      {/* Page Header */}
      <section className="relative mx-auto w-full px-[var(--spacing-md)]" style={{ maxWidth: "1200px", paddingTop: "var(--spacing-xl)", paddingBottom: "var(--spacing-xl)" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center gap-[var(--spacing-md)]"
        >
          <Badge 
            variant="secondary"
            className="text-xs uppercase tracking-wider"
            style={{ 
              padding: "var(--spacing-xs) var(--spacing-sm)",
              borderRadius: "9999px",
              background: "color-mix(in srgb, var(--secondary) 8%, var(--background))",
              border: "1px solid color-mix(in srgb, var(--secondary) 20%, transparent)",
            }}
          >
            Portfolio
          </Badge>

          <h1 style={{
            fontSize: "clamp(var(--font-size-h1), 5vw, 48px)",
            fontWeight: "var(--font-weight-semibold)" as unknown as number,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            margin: 0,
          }}>
            Design Projects
          </h1>

          <p className="text-muted-foreground" style={{
            fontSize: "var(--font-size-body)",
            lineHeight: 1.6,
            maxWidth: "600px",
            margin: 0,
          }}>
            Case studies and portfolio work showcasing UX/UI design expertise
          </p>
        </motion.div>
      </section>

      {/* Filter Bar */}
      <section className="relative mx-auto w-full px-[var(--spacing-md)]" style={{ maxWidth: "1200px", paddingBottom: "var(--spacing-xl)" }}>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-[var(--spacing-xs)]"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className="px-[var(--spacing-sm)] py-[var(--spacing-xs)] rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: activeFilter === cat 
                  ? "var(--primary)" 
                  : "var(--muted)",
                color: activeFilter === cat 
                  ? "var(--primary-foreground)" 
                  : "var(--muted-foreground)",
                border: activeFilter === cat ? "none" : "1px solid var(--border)",
              }}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Projects Grid */}
      <section className="relative mx-auto w-full px-[var(--spacing-md)]" style={{ maxWidth: "1200px", paddingBottom: "var(--spacing-xl)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-lg)]">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="group cursor-pointer rounded-[var(--radius-card)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                border: "1px solid var(--border)",
                background: "var(--card)",
              }}
            >
              {/* Banner */}
              <div 
                className="relative w-full overflow-hidden"
                style={{ 
                  height: "280px",
                  background: `linear-gradient(135deg, ${project.id === "caloer-official" ? "#A693D6, #8B7CC3" : "#4DB1CE, #2B8DA9"})`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                      {project.id === "caloer-official" ? "🍎" : "₿"}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 500, opacity: 0.9 }}>
                      {project.subtitle}
                    </div>
                    <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "8px" }}>
                      Click to view case study
                    </div>
                  </div>
                </div>
                
                {/* Hover overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{
                    background: "rgba(11, 37, 69, 0.8)",
                  }}
                >
                  <span className="text-white font-medium" style={{ fontSize: "var(--font-size-body)" }}>
                    View Project →
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-[var(--spacing-md)]">
                <Badge 
                  variant="secondary"
                  className="mb-[var(--spacing-xs)]"
                  style={{ 
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: "color-mix(in srgb, var(--secondary) 10%, var(--muted))",
                    color: "var(--secondary)",
                  }}
                >
                  {project.category}
                </Badge>

                <h3 style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  lineHeight: 1.3,
                  marginBottom: "var(--spacing-xs)",
                  color: "var(--foreground)",
                }}>
                  {project.title}
                </h3>

                <p className="text-muted-foreground" style={{
                  fontSize: "var(--font-size-small)",
                  lineHeight: 1.5,
                  marginBottom: "var(--spacing-sm)",
                }}>
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-[var(--spacing-2xs)]">
                  {project.tools.slice(0, 3).map((tool) => (
                    <span
                      key={tool}
                      className="text-muted-foreground"
                      style={{
                        fontSize: "11px",
                        padding: "4px 8px",
                        background: "var(--muted)",
                        borderRadius: "4px",
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
