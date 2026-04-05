import { motion } from "motion/react";
import { Palette, Code, Monitor, Sparkles } from "lucide-react";

const services = [
  {
    title: "UX & UI",
    description: "Crafting seamless, user-friendly interfaces that enhance engagement and usability.",
    icon: Palette,
    bg: "#FFFFFF",
    imageGradient: "linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)",
  },
  {
    title: "Framer Development",
    description: "Building high-performance, interactive websites using Framer's powerful design and development tools for seamless user experiences.",
    icon: Code,
    bg: "#FFFFFF",
    imageGradient: "linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)",
  },
  {
    title: "Interactive Web Experiences",
    description: "Interactive websites with Framer's advanced design and development tools to deliver smooth and engaging user experiences.",
    icon: Monitor,
    bg: "#FFFFFF",
    imageGradient: "linear-gradient(135deg, #6EE7B7 0%, #34D399 100%)",
  },
  {
    title: "Design & Creativity",
    description: "Creating visually compelling designs that truly resonate with your target audience and brand.",
    icon: Sparkles,
    bg: "#FFFFFF",
    imageGradient: "linear-gradient(135deg, #FBCFE8 0%, #F472B6 100%)",
  },
];

export function ServicesSection() {
  return (
    <section
      id="services"
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
        <span
          className="mb-4 inline-block rounded-full px-4 py-2"
          style={{
            fontFamily: "Inter",
            fontSize: "13px",
            fontWeight: 500,
            color: "#2A3F67",
            background: "#F1F5F9",
          }}
        >
          Services
        </span>
        <h2
          style={{
            fontFamily: "Inter",
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 600,
            color: "#1E2C43",
            marginBottom: "12px",
          }}
        >
          Crafting Digital Excellence
        </h2>
        <p
          style={{
            fontFamily: "Inter",
            fontSize: "16px",
            color: "#64748B",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Building smooth and engaging digital interactions that elevate user satisfaction
        </p>
      </motion.div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group overflow-hidden rounded-3xl p-8 transition-all"
            style={{
              background: service.bg,
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div className="mb-6 flex items-start gap-6">
              {/* Icon/Image */}
              <div
                className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                style={{
                  background: service.imageGradient,
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                }}
              >
                <service.icon size={40} className="text-white" />
              </div>

              {/* Content */}
              <div>
                <h3
                  style={{
                    fontFamily: "Inter",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "#1E2C43",
                    marginBottom: "8px",
                  }}
                >
                  {service.title}
                </h3>
                <p
                  style={{
                    fontFamily: "Inter",
                    fontSize: "15px",
                    lineHeight: 1.5,
                    color: "#64748B",
                  }}
                >
                  {service.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 flex justify-center gap-4"
      >
        <a
          href="#contact"
          className="transition-all hover:scale-105"
          style={{
            fontFamily: "Inter",
            fontSize: "15px",
            fontWeight: 600,
            color: "#FFFFFF",
            textDecoration: "none",
            background: "linear-gradient(135deg, #2A3F67 0%, #1E2C43 100%)",
            borderRadius: "12px",
            padding: "14px 28px",
            boxShadow: "0 8px 24px rgba(42, 63, 103, 0.3)",
          }}
        >
          Contact Me
        </a>
        <a
          href="#projects"
          className="transition-all hover:scale-105"
          style={{
            fontFamily: "Inter",
            fontSize: "15px",
            fontWeight: 600,
            color: "#2A3F67",
            textDecoration: "none",
            background: "#F1F5F9",
            borderRadius: "12px",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>→</span> See Projects
        </a>
      </motion.div>
    </section>
  );
}
