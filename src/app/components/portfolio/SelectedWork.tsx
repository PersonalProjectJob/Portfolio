import { motion } from "motion/react";

const projects = [
  {
    id: "lander-os",
    title: "LanderOS",
    subtitle: "Lead with the data to save your time and money",
    gradient: "linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 100%)",
    logo: "LOS",
  },
  {
    id: "alter",
    title: "Alter",
    subtitle: "Automate. Engage. Convert. Powered by AI.",
    gradient: "linear-gradient(135deg, #5EEAD4 0%, #0EA5E9 100%)",
    logo: "◆",
  },
  {
    id: "portfoy",
    title: "Portfoy",
    subtitle: "Designer Builder",
    gradient: "linear-gradient(135deg, #67E8F9 0%, #06B6D4 100%)",
    logo: "PB",
  },
];

export function SelectedWork() {
  return (
    <section
      id="projects"
      className="relative mx-auto w-full px-6 py-16 md:px-12 md:py-24"
      style={{ maxWidth: "1440px" }}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h2
          style={{
            fontFamily: "Inter",
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 600,
            color: "#1E2C43",
            marginBottom: "8px",
          }}
        >
          Selected Work
        </h2>
        <p
          style={{
            fontFamily: "Inter",
            fontSize: "16px",
            color: "#64748B",
          }}
        >
          A collection of projects I've worked on
        </p>
      </motion.div>

      {/* Horizontal Project Carousel */}
      <div className="relative">
        <div 
          className="flex gap-6 overflow-x-auto pb-8" 
          style={{ 
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {projects.map((project, index) => (
            <motion.a
              key={project.id}
              href={`#${project.id}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="group flex-shrink-0 cursor-pointer overflow-hidden rounded-3xl transition-all"
              style={{
                width: "380px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                textDecoration: "none",
              }}
            >
              {/* Project Preview */}
              <div
                className="relative h-56 overflow-hidden"
                style={{
                  background: project.gradient,
                }}
              >
                {/* Project Content */}
                <div className="flex h-full flex-col items-center justify-center p-8 text-white">
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20"
                    style={{
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span style={{ fontSize: "28px", fontWeight: 700 }}>
                      {project.logo}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "Inter",
                      fontSize: "24px",
                      fontWeight: 700,
                      textAlign: "center",
                      marginBottom: "8px",
                    }}
                  >
                    {project.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "Inter",
                      fontSize: "14px",
                      opacity: 0.9,
                      textAlign: "center",
                    }}
                  >
                    {project.subtitle}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1 group-hover:scale-110"
                  style={{
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span style={{ fontSize: "20px", color: "#FFFFFF" }}>↗</span>
                </div>
              </div>

              {/* Project Info */}
              <div className="flex items-center justify-between p-6">
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
                <span
                  className="transition-transform group-hover:translate-x-1"
                  style={{
                    fontSize: "24px",
                    color: "#94A3B8",
                  }}
                >
                  →
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
