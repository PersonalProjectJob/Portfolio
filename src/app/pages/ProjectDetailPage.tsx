import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ArrowRight, ExternalLink, Calendar, Clock, User, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

// Project data (same as ProjectsPage - will move to shared file later)
const projects = [
  {
    id: "caloer-official",
    title: "Caloer Official - Food & Nutrition App",
    subtitle: "UI/UX Redesign",
    category: "UI Design",
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

// Animated Counter Component
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// Image Lightbox Component
function ImageLightbox({ 
  images, 
  initialIndex, 
  onClose 
}: { 
  images: string[]; 
  initialIndex: number; 
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.9)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-[var(--spacing-lg)] right-[var(--spacing-lg)] text-white hover:opacity-70 transition-opacity"
        style={{ zIndex: 10000 }}
      >
        ✕
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        className="absolute left-[var(--spacing-lg)] text-white hover:opacity-70 transition-opacity"
        style={{ zIndex: 10000 }}
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        className="absolute right-[var(--spacing-lg)] text-white hover:opacity-70 transition-opacity"
        style={{ zIndex: 10000 }}
      >
        <ChevronRight size={32} />
      </button>

      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="bg-muted rounded-[var(--radius-card)] overflow-hidden"
          style={{ 
            maxWidth: "1200px",
            maxHeight: "80vh",
            minWidth: "600px",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="text-center text-muted-foreground">
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🖼️</div>
            <div style={{ fontSize: "var(--font-size-body)" }}>
              Image {currentIndex + 1} of {images.length}
            </div>
            <div style={{ fontSize: "var(--font-size-small)", marginTop: "8px", opacity: 0.7 }}>
              Replace with actual project screenshot
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="absolute bottom-[var(--spacing-lg)] left-1/2 -translate-x-1/2 flex gap-[var(--spacing-xs)]">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
            className="w-16 h-16 rounded-[var(--radius)] overflow-hidden transition-all duration-200"
            style={{
              border: currentIndex === index ? "2px solid var(--secondary)" : "2px solid transparent",
              background: "var(--muted)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-muted-foreground" style={{ fontSize: "10px" }}>
              {index + 1}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--spacing-md)" }}>Project Not Found</h1>
          <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  const currentIndex = projects.findIndex(p => p.id === projectId);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <div ref={containerRef} className="min-h-dvh bg-background">
      {/* Navbar placeholder */}
      <div style={{ height: "80px" }} />

      {/* Hero Image/Banner */}
      <section className="relative w-full overflow-hidden" style={{ height: "500px" }}>
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${project.id === "caloer-official" ? "#A693D6 0%, #8B7CC3 100%" : "#4DB1CE 0%, #2B8DA9 100%"})`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>
                {project.id === "caloer-official" ? "🍎" : "₿"}
              </div>
              <div style={{ fontSize: "24px", fontWeight: 600 }}>
                {project.subtitle}
              </div>
            </div>
          </div>
        </div>
        
        {/* Gradient overlay at bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "200px",
            background: "linear-gradient(to top, var(--background), transparent)",
          }}
        />
      </section>

      {/* Project Header */}
      <section className="relative mx-auto w-full px-[var(--spacing-md)]" style={{ maxWidth: "1200px", marginTop: "-80px", position: "relative", zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge 
            variant="secondary"
            className="mb-[var(--spacing-sm)]"
            style={{ 
              fontSize: "12px",
              padding: "6px 12px",
              borderRadius: "6px",
              background: "color-mix(in srgb, var(--secondary) 10%, var(--muted))",
              color: "var(--secondary)",
            }}
          >
            {project.category}
          </Badge>

          <h1 style={{
            fontSize: "clamp(var(--font-size-h1), 4vw, 40px)",
            fontWeight: "var(--font-weight-semibold)" as unknown as number,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "var(--spacing-md)",
            color: "var(--foreground)",
          }}>
            {project.title}
          </h1>
        </motion.div>
      </section>

      {/* Problem & Solution */}
      <section className="relative mx-auto w-full px-[var(--spacing-md)]" style={{ maxWidth: "1200px", padding: "var(--spacing-xl) 0" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-lg)]">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-[var(--radius-card)] p-[var(--spacing-lg)]"
            style={{
              border: "1px solid color-mix(in srgb, var(--destructive) 20%, var(--border))",
              background: "color-mix(in srgb, var(--destructive) 5%, var(--card))",
            }}
          >
            <h3 style={{ 
              fontSize: "var(--text-lg)", 
              fontWeight: "var(--font-weight-semibold)" as unknown as number,
              marginBottom: "var(--spacing-sm)",
              color: "var(--destructive)",
            }}>
              ❌ The Problem
            </h3>
            <p className="text-muted-foreground" style={{ lineHeight: 1.6 }}>
              {project.problem}
            </p>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-[var(--radius-card)] p-[var(--spacing-lg)]"
            style={{
              border: "1px solid color-mix(in srgb, var(--color-success) 20%, var(--border))",
              background: "color-mix(in srgb, var(--color-success) 5%, var(--card))",
            }}
          >
            <h3 style={{ 
              fontSize: "var(--text-lg)", 
              fontWeight: "var(--font-weight-semibold)" as unknown as number,
              marginBottom: "var(--spacing-sm)",
              color: "var(--color-success)",
            }}>
              ✅ The Solution
            </h3>
            <p className="text-muted-foreground" style={{ lineHeight: 1.6 }}>
              {project.solution}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Project Details */}
      <section className="relative mx-auto w-full px-[var(--spacing-md)]" style={{ maxWidth: "1200px", padding: "var(--spacing-xl) 0" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-[var(--radius-card)] p-[var(--spacing-lg)]"
          style={{
            border: "1px solid var(--border)",
            background: "var(--card)",
          }}
        >
          <h3 style={{ 
            fontSize: "var(--text-lg)", 
            fontWeight: "var(--font-weight-semibold)" as unknown as number,
            marginBottom: "var(--spacing-md)",
            color: "var(--foreground)",
          }}>
            Project Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-md)]">
            <div>
              <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} />
                Role
              </div>
              <div style={{ fontWeight: "var(--font-weight-medium)" as unknown as number, color: "var(--foreground)" }}>
                {project.role}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={14} />
                Timeline
              </div>
              <div style={{ fontWeight: "var(--font-weight-medium)" as unknown as number, color: "var(--foreground)" }}>
                {project.timeline}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} />
                Team
              </div>
              <div style={{ fontWeight: "var(--font-weight-medium)" as unknown as number, color: "var(--foreground)" }}>
                {project.team}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ExternalLink size={14} />
                Live Site
              </div>
              <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontWeight: "var(--font-weight-medium)" as unknown as number, color: "var(--secondary)", textDecoration: "none" }}
              >
                View Project →
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Design Process */}
      <section className="relative mx-auto w-full px-[var(--spacing-md)]" style={{ maxWidth: "1200px", padding: "var(--spacing-xl) 0" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--font-weight-semibold)" as unknown as number,
            marginBottom: "var(--spacing-xl)",
            color: "var(--foreground)",
          }}
        >
          Design Process
        </motion.h2>

        <div className="flex flex-col gap-[var(--spacing-xl)]">
          {project.process.map((phase, index) => (
            <motion.div
              key={phase.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-lg)] items-center ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              style={{
                direction: index % 2 === 1 ? "rtl" : "ltr",
              }}
            >
              {/* Text Content */}
              <div style={{ direction: "ltr" }}>
                <div style={{ 
                  fontSize: "48px", 
                  fontWeight: "700", 
                  color: "var(--secondary)", 
                  marginBottom: "var(--spacing-xs)",
                  opacity: 0.3,
                }}>
                  {String(phase.step).padStart(2, "0")}
                </div>
                <h3 style={{
                  fontSize: "var(--text-xl)",
                  fontWeight: "var(--font-weight-semibold)" as unknown as number,
                  marginBottom: "var(--spacing-sm)",
                  color: "var(--foreground)",
                }}>
                  {phase.title}
                </h3>
                <p className="text-muted-foreground" style={{ lineHeight: 1.6 }}>
                  {phase.description}
                </p>
              </div>

              {/* Image Placeholder */}
              <div 
                className="rounded-[var(--radius-card)] overflow-hidden"
                style={{
                  height: "300px",
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="text-center text-muted-foreground">
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📸</div>
                  <div style={{ fontSize: "var(--font-size-body)" }}>
                    {phase.title}
                  </div>
                  <div style={{ fontSize: "var(--font-size-small)", marginTop: "8px", opacity: 0.7 }}>
                    Replace with actual image
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Image Gallery */}
      <section className="relative mx-auto w-full px-[var(--spacing-md)]" style={{ maxWidth: "1200px", padding: "var(--spacing-xl) 0" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--font-weight-semibold)" as unknown as number,
            marginBottom: "var(--spacing-xl)",
            color: "var(--foreground)",
          }}
        >
          Design Gallery
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-[var(--spacing-md)]">
          {project.images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
              className="group cursor-pointer rounded-[var(--radius-card)] overflow-hidden transition-all duration-300 hover:shadow-lg"
              style={{
                height: "240px",
                background: "var(--muted)",
                border: "1px solid var(--border)",
                position: "relative",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🖼️</div>
                  <div style={{ fontSize: "12px" }}>Screen {index + 1}</div>
                </div>
              </div>
              
              {/* Hover overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  background: "rgba(11, 37, 69, 0.7)",
                }}
              >
                <Maximize2 className="text-white" size={24} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Results & Metrics */}
      <section className="relative mx-auto w-full px-[var(--spacing-md)]" style={{ maxWidth: "1200px", padding: "var(--spacing-xl) 0" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--font-weight-semibold)" as unknown as number,
            marginBottom: "var(--spacing-xl)",
            color: "var(--foreground)",
          }}
        >
          Results & Impact
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-md)]">
          {project.results.map((result, index) => (
            <motion.div
              key={result.metric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-[var(--radius-card)] p-[var(--spacing-lg)] text-center"
              style={{
                border: "1px solid var(--border)",
                background: "var(--card)",
              }}
            >
              <div style={{ 
                fontSize: "36px", 
                fontWeight: "700", 
                color: "var(--color-success)", 
                marginBottom: "var(--spacing-xs)",
              }}>
                <AnimatedCounter target={result.value} suffix={result.suffix} />
              </div>
              <div className="text-muted-foreground" style={{ fontSize: "var(--font-size-small)" }}>
                {result.metric}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tools Used */}
      <section className="relative mx-auto w-full px-[var(--spacing-md)]" style={{ maxWidth: "1200px", padding: "var(--spacing-xl) 0" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--font-weight-semibold)" as unknown as number,
            marginBottom: "var(--spacing-md)",
            color: "var(--foreground)",
          }}
        >
          Tools Used
        </motion.h2>

        <div className="flex flex-wrap gap-[var(--spacing-sm)]">
          {project.tools.map((tool) => (
            <span
              key={tool}
              className="rounded-[var(--radius)] px-[var(--spacing-sm)] py-[var(--spacing-xs)]"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
                fontSize: "var(--font-size-small)",
                color: "var(--foreground)",
              }}
            >
              {tool}
            </span>
          ))}
        </div>
      </section>

      {/* Navigation */}
      <section className="relative mx-auto w-full px-[var(--spacing-md)]" style={{ maxWidth: "1200px", padding: "var(--spacing-xl) 0" }}>
        <div 
          className="flex items-center justify-between"
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "var(--spacing-xl)",
          }}
        >
          {prevProject ? (
            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${prevProject.id}`)}
              className="flex items-center gap-[var(--spacing-xs)]"
            >
              <ArrowLeft size={16} />
              <div className="text-left">
                <div style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>Previous</div>
                <div style={{ fontSize: "13px", fontWeight: 500 }}>{prevProject.title.split(" - ")[0]}</div>
              </div>
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="outline"
            onClick={() => navigate("/projects")}
          >
            All Projects
          </Button>

          {nextProject ? (
            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${nextProject.id}`)}
              className="flex items-center gap-[var(--spacing-xs)]"
            >
              <div className="text-right">
                <div style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>Next</div>
                <div style={{ fontSize: "13px", fontWeight: 500 }}>{nextProject.title.split(" - ")[0]}</div>
              </div>
              <ArrowRight size={16} />
            </Button>
          ) : (
            <div />
          )}
        </div>
      </section>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <ImageLightbox
            images={project.images}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
