import { motion } from "motion/react";

const experiences = [
  {
    title: "Product Designer",
    context: "Fintech platform / 2023",
  },
  {
    title: "UX/UI Designer",
    context: "AI product / 2022",
  },
  {
    title: "Freelance",
    context: "Brand and web work / 2021",
  },
  {
    title: "Design system and prototyping practice",
    context: "",
  },
];

const tabletExperiences = [
  {
    title: "Product Design",
    context: "Fteams platform / 2023",
  },
  {
    title: "Web Design",
    context: "Framer build / 2025",
  },
  {
    title: "Design System",
    context: "brand structure / 2026",
  },
  {
    title: "Creative Direction",
    context: "editorial visuals / ongoing",
  },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative mx-auto w-full px-6 py-12 md:px-12"
      style={{ maxWidth: "1440px" }}
    >
      {/* About Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden rounded-[44px] md:rounded-[28px]"
        style={{
          background: "linear-gradient(180deg, #FBFDFF 0%, #F0F5FB 100%)",
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
            marginBottom: "18px",
          }}
        >
          ABOUT
        </span>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontFamily: "Inter",
            fontSize: "clamp(28px, 3vw, 32px)",
            fontWeight: 600,
            lineHeight: "1.15",
            color: "#1E2C43",
            marginBottom: "24px",
            margin: 0,
          }}
        >
          Product-oriented UX designer based in Vietnam.
        </motion.h2>

        {/* Desktop: 2-Column Layout */}
        <div className="hidden gap-6 md:grid md:grid-cols-[340px_1fr]">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="overflow-hidden rounded-[24px]"
            style={{
              background: "#FFFFFF",
              border: "1px solid #D9E5F1",
              boxShadow: "0 8px 16px rgba(202, 214, 226, 0.13)",
              padding: "16px",
            }}
          >
            {/* Profile Photo */}
            <div
              className="mb-4 h-40 w-full overflow-hidden rounded-[24px]"
              style={{
                background: "linear-gradient(135deg, #7BC0ED 0%, #2A436B 100%)",
                border: "1px solid #C9D8EA",
                boxShadow: "0 12px 24px rgba(94, 167, 209, 0.27)",
              }}
            >
              <div className="flex h-full items-center justify-center">
                <span
                  style={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    color: "#FFFFFF",
                    opacity: 0.7,
                  }}
                >
                  Profile Photo
                </span>
              </div>
            </div>

            {/* Available Badge */}
            <div
              className="mb-3 inline-block rounded-full px-4 py-2"
              style={{
                background: "#2B3E63",
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                color: "#FFFFFF",
              }}
            >
              available for work
            </div>

            {/* Name */}
            <h3
              style={{
                fontFamily: "Inter",
                fontSize: "28px",
                fontWeight: 600,
                lineHeight: 1.1,
                color: "#1E2C43",
                marginBottom: "8px",
              }}
            >
              Truong Nguyen Son Thao
            </h3>

            {/* Description */}
            <p
              style={{
                fontFamily: "Inter",
                fontSize: "18px",
                fontWeight: "normal",
                lineHeight: 1.3,
                color: "#5A6880",
                marginBottom: "16px",
              }}
            >
              Product-oriented UX designer building premium portfolio and brand
              experiences.
            </p>

            {/* Contact Button */}
            <a
              href="#contact"
              className="inline-block transition-all hover:scale-105"
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

            {/* Skill Chips */}
            <div className="mt-4 flex flex-wrap gap-3">
              <span
                className="rounded-full px-4 py-2"
                style={{
                  background: "#F1F7FF",
                  border: "1px solid #D9E4F6",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#2A3F67",
                }}
              >
                UX Research
              </span>
              <span
                className="rounded-full px-4 py-2"
                style={{
                  background: "#F1F7FF",
                  border: "1px solid #D9E4F6",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#2A3F67",
                }}
              >
                Design Systems
              </span>
            </div>
          </motion.div>

          {/* Experience List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-3"
          >
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="overflow-hidden rounded-[16px]"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D9E5F1",
                  padding: "18px 20px",
                }}
              >
                <h4
                  style={{
                    fontFamily: "Inter",
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#1E2C43",
                    marginBottom: "4px",
                  }}
                >
                  {exp.title}
                </h4>
                {exp.context && (
                  <p
                    style={{
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: "normal",
                      color: "#6C7A90",
                    }}
                  >
                    {exp.context}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Tablet/Mobile: Stacked Layout */}
        <div className="flex flex-col gap-6 md:hidden">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="overflow-hidden rounded-[24px]"
            style={{
              background: "#FFFFFF",
              border: "1px solid #D9E5F1",
              boxShadow: "0 8px 16px rgba(202, 214, 226, 0.13)",
              padding: "18px",
            }}
          >
            {/* Profile Photo */}
            <div
              className="mb-4 h-40 w-full overflow-hidden rounded-[24px]"
              style={{
                background: "linear-gradient(135deg, #7BC0ED 0%, #2A436B 100%)",
                border: "1px solid #C9D8EA",
                boxShadow: "0 12px 24px rgba(94, 167, 209, 0.27)",
              }}
            >
              <div className="flex h-full items-center justify-center">
                <span
                  style={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    color: "#FFFFFF",
                    opacity: 0.7,
                  }}
                >
                  Profile Photo
                </span>
              </div>
            </div>

            {/* Available Badge */}
            <div
              className="mb-3 inline-block rounded-full px-4 py-2"
              style={{
                background: "#2B3E63",
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                color: "#FFFFFF",
              }}
            >
              available for work
            </div>

            {/* Name */}
            <h3
              style={{
                fontFamily: "Inter",
                fontSize: "24px",
                fontWeight: 600,
                lineHeight: 1.1,
                color: "#1E2C43",
                marginBottom: "8px",
              }}
            >
              Truong Nguyen Son Thao
            </h3>

            {/* Description */}
            <p
              style={{
                fontFamily: "Inter",
                fontSize: "15px",
                fontWeight: "normal",
                lineHeight: 1.4,
                color: "#5A6880",
                marginBottom: "16px",
              }}
            >
              Product-oriented UX designer building premium portfolio and brand
              experiences.
            </p>

            {/* Contact Button */}
            <a
              href="#contact"
              className="inline-block transition-all hover:scale-105"
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
          </motion.div>

          {/* Experience List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-3"
          >
            {tabletExperiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="overflow-hidden rounded-[16px]"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D9E5F1",
                  padding: "16px 18px",
                }}
              >
                <h4
                  style={{
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#1E2C43",
                    marginBottom: "4px",
                  }}
                >
                  {exp.title}
                </h4>
                {exp.context && (
                  <p
                    style={{
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: "normal",
                      color: "#6C7A90",
                    }}
                  >
                    {exp.context}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
