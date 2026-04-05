import { motion, useScroll, useTransform, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { Cloud, Moon, Sun, Star } from "lucide-react";

const projects = [
  {
    id: "lander-os",
    title: "LanderOS",
    subtitle: "Lead with the data to save your time and money",
    gradient: "linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 100%)",
    logo: "LOS",
    tags: ["UI Design", "Dashboard"],
  },
  {
    id: "alter",
    title: "Alter",
    subtitle: "Automate. Engage. Convert. Powered by AI.",
    gradient: "linear-gradient(135deg, #5EEAD4 0%, #0EA5E9 100%)",
    logo: "◆",
    tags: ["AI", "Landing Page"],
  },
  {
    id: "portfoy",
    title: "Portfoy",
    subtitle: "Designer Builder - Portfolio Template",
    gradient: "linear-gradient(135deg, #67E8F9 0%, #06B6D4 100%)",
    logo: "PB",
    tags: ["Template", "Framer"],
  },
];

function FloatingIcon({ children, delay = 0, x = 0, y = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      className="pointer-events-none absolute"
      style={{ x, y }}
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="rounded-2xl p-3"
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ProjectCard({ project, index }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  return (
    <motion.a
      ref={cardRef}
      href={`#${project.id}`}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      whileHover={{ 
        y: -16, 
        scale: 1.03,
        transition: { duration: 0.3, type: "spring", stiffness: 300 },
      }}
      className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-3xl"
      style={{
        width: "380px",
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
        textDecoration: "none",
      }}
    >
      {/* Project Preview */}
      <div
        className="relative h-56 overflow-hidden"
        style={{ background: project.gradient }}
      >
        {/* Animated Background Pattern */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 30% 70%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
            backgroundSize: "200% 200%",
          }}
        />

        {/* Project Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-8 text-white">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3 + index * 0.15, type: "spring", stiffness: 200 }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <span style={{ fontSize: "28px", fontWeight: 700 }}>
              {project.logo}
            </span>
          </motion.div>
          
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.15 }}
            style={{
              fontFamily: "Inter",
              fontSize: "24px",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "8px",
            }}
          >
            {project.title}
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.15 }}
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              opacity: 0.9,
              textAlign: "center",
            }}
          >
            {project.subtitle}
          </motion.p>
        </div>

        {/* Arrow Icon */}
        <motion.div
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20"
          style={{ backdropFilter: "blur(8px)" }}
          whileHover={{ scale: 1.2, rotate: 45 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <span style={{ fontSize: "20px", color: "#FFFFFF" }}>↗</span>
        </motion.div>
      </div>

      {/* Project Info */}
      <div className="p-6">
        <div className="mb-3 flex gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: "#F1F5F9",
                color: "#475569",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4
              style={{
                fontFamily: "Inter",
                fontSize: "18px",
                fontWeight: 600,
                color: "#1E2C43",
              }}
            >
              {project.title}
            </h4>
            <p
              style={{
                fontFamily: "Inter",
                fontSize: "14px",
                color: "#64748B",
              }}
            >
              {project.subtitle}
            </p>
          </div>
          <motion.span
            className="text-2xl"
            style={{ color: "#94A3B8" }}
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            →
          </motion.span>
        </div>
      </div>
    </motion.a>
  );
}

export function SelectedWork() {
  const containerRef = useRef(null);
  const { scrollXProgress } = useScroll({
    target: containerRef,
    axis: "x",
  });

  return (
    <section
      id="projects"
      className="relative mx-auto w-full px-6 py-16 md:px-12 md:py-24"
      style={{ maxWidth: "1440px" }}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, type: "spring" }}
        className="mb-12 text-center"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-4 inline-block rounded-full px-4 py-2"
          style={{
            fontFamily: "Inter",
            fontSize: "13px",
            fontWeight: 500,
            color: "#2A3F67",
            background: "#F1F5F9",
          }}
        >
          Selected Work
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{
            fontFamily: "Inter",
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 600,
            color: "#1E2C43",
            marginBottom: "8px",
          }}
        >
          Projects I've Worked On
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: "Inter",
            fontSize: "16px",
            color: "#64748B",
          }}
        >
          A collection of projects showcasing design and development expertise
        </motion.p>
      </motion.div>

      {/* Horizontal Project Carousel */}
      <div ref={containerRef} className="relative">
        <div 
          className="flex gap-6 overflow-x-auto pb-8" 
          style={{ 
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* Scroll Progress Bar */}
        <motion.div
          className="mx-auto mt-6 h-1 w-32 overflow-hidden rounded-full bg-gray-200"
          style={{ maxWidth: "200px" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #8B5CF6, #06B6D4)",
              scaleX: scrollXProgress,
              transformOrigin: "left",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
