import { motion } from "motion/react";

const services = [
  {
    title: "UX & UI",
    description:
      "Crafting seamless, user-friendly interfaces that enhance engagement and usability.",
    bg: "#FFF7F1",
    stroke: "#F0DED0",
    shadow: "0 8px 16px rgba(231, 210, 196, 0.13)",
  },
  {
    title: "Framer Development",
    description:
      "Building high-performance, interactive websites with strong design-development alignment.",
    bg: "#F1F7FF",
    stroke: "#D9E4F6",
    shadow: "0 8px 16px rgba(210, 221, 237, 0.13)",
  },
  {
    title: "Interactive Web Experiences",
    description:
      "Interactive websites designed for smooth navigation, strong storytelling, and clarity.",
    bg: "#FFF7FA",
    stroke: "#F2DEE8",
    shadow: "0 8px 16px rgba(232, 208, 219, 0.13)",
  },
  {
    title: "Design & Creativity",
    description:
      "Creating visually compelling designs that resonate with audiences and support the brand.",
    bg: "#F4FBF5",
    stroke: "#D8EAD9",
    shadow: "0 8px 16px rgba(213, 229, 214, 0.13)",
  },
];

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative mx-auto w-full px-6 py-12 md:px-12"
      style={{ maxWidth: "1440px" }}
    >
      {/* Services Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden rounded-[44px] md:rounded-[28px]"
        style={{
          background: "linear-gradient(180deg, #FBFDFF 0%, #EEF4FB 100%)",
          border: "1px solid #D8E3F0",
          boxShadow: "0 16px 32px rgba(182, 196, 213, 0.2)",
          padding: "32px",
        }}
      >
        {/* Section Label */}
        <span
          style={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "1px",
            color: "#6C7A90",
            display: "block",
            marginBottom: "24px",
          }}
        >
          SERVICES
        </span>

        {/* Desktop: 2x2 Grid */}
        <div className="hidden gap-4 md:grid md:grid-cols-2">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-[24px]"
              style={{
                background: service.bg,
                border: `1px solid ${service.stroke}`,
                boxShadow: service.shadow,
                padding: "24px",
              }}
            >
              <h3
                style={{
                  fontFamily: "Inter",
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "#1E2C43",
                  marginBottom: "16px",
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  fontFamily: "Inter",
                  fontSize: "18px",
                  fontWeight: "normal",
                  lineHeight: 1.4,
                  color: "#5A6880",
                }}
              >
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tablet: 2x2 Grid */}
        <div className="hidden gap-4 md:hidden lg:grid lg:grid-cols-2">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-[24px]"
              style={{
                background: service.bg,
                border: `1px solid ${service.stroke}`,
                boxShadow: service.shadow,
                padding: "20px",
              }}
            >
              <h3
                style={{
                  fontFamily: "Inter",
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "#1E2C43",
                  marginBottom: "12px",
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  fontFamily: "Inter",
                  fontSize: "15px",
                  fontWeight: "normal",
                  lineHeight: 1.4,
                  color: "#5A6880",
                }}
              >
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Stacked */}
        <div className="flex flex-col gap-4 lg:hidden">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-[20px]"
              style={{
                background: service.bg,
                border: `1px solid ${service.stroke}`,
                boxShadow: service.shadow,
                padding: "18px",
              }}
            >
              <h3
                style={{
                  fontFamily: "Inter",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#1E2C43",
                  marginBottom: "12px",
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: "normal",
                  lineHeight: 1.3,
                  color: "#5A6880",
                }}
              >
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 flex flex-wrap gap-3"
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
              background: "#2A3F67",
              border: "1px solid #314B79",
              borderRadius: "18px",
              padding: "16px 24px",
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
              color: "#233A67",
              textDecoration: "none",
              background: "#FFFFFF",
              border: "1px solid #D9E5F1",
              borderRadius: "18px",
              padding: "16px 24px",
            }}
          >
            See Projects
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
