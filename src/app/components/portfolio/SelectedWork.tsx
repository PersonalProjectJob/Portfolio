import { motion } from "motion/react";

const projects = [
  {
    id: "coursesite",
    title: "CourseSite / product system refresh",
    shortTitle: "CourseSite",
    gradient: "linear-gradient(135deg, #A693D6 0%, #8B7CC3 100%)",
    shadow: "0 12px 24px rgba(141, 126, 199, 0.2)",
    stroke: "#B4A8DE",
  },
  {
    id: "aiter",
    title: "Aiter / AI workflow landing page",
    shortTitle: "Aiter",
    gradient: "linear-gradient(135deg, #4DB1CE 0%, #2B8DA9 100%)",
    shadow: "0 12px 24px rgba(74, 169, 197, 0.2)",
    stroke: "#7DD1E9",
  },
];

export function SelectedWork() {
  return (
    <section
      id="projects"
      className="relative mx-auto w-full px-6 py-12 md:px-12"
      style={{ maxWidth: "1440px" }}
    >
      {/* Section Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span
          style={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "1px",
            color: "#6C7A90",
            display: "block",
            marginBottom: "24px",
          }}
        >
          SELECTED WORK
        </span>
      </motion.div>

      {/* Desktop Layout: Horizontal Rail */}
      <div className="hidden gap-4 md:grid md:grid-cols-4">
        {/* Post Card 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="overflow-hidden rounded-[20px]"
          style={{
            background: "#F9FBFF",
            border: "1px solid #E4EAF4",
            boxShadow: "0 8px 16px rgba(202, 214, 226, 0.13)",
            padding: "14px",
          }}
        >
          <div
            className="mb-3 h-32 w-full overflow-hidden rounded-[20px]"
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #F6F9FE 100%)",
              border: "1px solid #E4EAF4",
            }}
          />
          <div
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              color: "#4E5E77",
            }}
          >
            Post Card
          </div>
        </motion.div>

        {/* Project Card 1 - CourseSite */}
        <motion.a
          href="#coursesite"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="group block cursor-pointer overflow-hidden rounded-[32px] transition-all hover:-translate-y-1 hover:shadow-xl"
          style={{
            background: projects[0].gradient,
            border: `1px solid ${projects[0].stroke}`,
            boxShadow: projects[0].shadow,
            padding: "18px",
          }}
        >
          <h3
            className="mb-3"
            style={{
              fontFamily: "Inter",
              fontSize: "18px",
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#FFFFFF",
            }}
          >
            {projects[0].shortTitle}
          </h3>
          <div
            className="overflow-hidden rounded-[20px]"
            style={{
              height: "200px",
              background: "linear-gradient(180deg, #FFFFFF 0%, #F7F8FD 100%)",
              border: "1px solid #E4EAF4",
            }}
          />
        </motion.a>

        {/* Project Card 2 - Aiter */}
        <motion.a
          href="#aiter"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="group block cursor-pointer overflow-hidden rounded-[32px] transition-all hover:-translate-y-1 hover:shadow-xl"
          style={{
            background: projects[1].gradient,
            border: `1px solid ${projects[1].stroke}`,
            boxShadow: projects[1].shadow,
            padding: "18px",
          }}
        >
          <h3
            className="mb-3"
            style={{
              fontFamily: "Inter",
              fontSize: "18px",
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#FFFFFF",
            }}
          >
            {projects[1].shortTitle}
          </h3>
          <div
            className="overflow-hidden rounded-[20px]"
            style={{
              height: "200px",
              background: "linear-gradient(180deg, #FFFFFF 0%, #F7F8FD 100%)",
              border: "1px solid #E4EAF4",
            }}
          />
        </motion.a>

        {/* Post Card 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="overflow-hidden rounded-[20px]"
          style={{
            background: "#F9FBFF",
            border: "1px solid #E4EAF4",
            boxShadow: "0 8px 16px rgba(202, 214, 226, 0.13)",
            padding: "14px",
          }}
        >
          <div
            className="mb-3 h-32 w-full overflow-hidden rounded-[20px]"
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #F6F9FE 100%)",
              border: "1px solid #E4EAF4",
            }}
          />
          <div
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              color: "#4E5E77",
            }}
          >
            Post Card
          </div>
        </motion.div>
      </div>

      {/* Tablet/Mobile Layout: Stacked Cards */}
      <div className="flex flex-col gap-4 md:hidden">
        {projects.map((project, index) => (
          <motion.a
            key={project.id}
            href={`#${project.id}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group block cursor-pointer overflow-hidden rounded-[20px] transition-all hover:-translate-y-1 hover:shadow-xl"
            style={{
              background: project.gradient,
              border: `1px solid ${project.stroke}`,
              boxShadow: project.shadow,
              padding: "20px",
            }}
          >
            <h3
              className="mb-3"
              style={{
                fontFamily: "Inter",
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: 1.2,
                color: "#FFFFFF",
              }}
            >
              {project.title}
            </h3>
            <div
              className="overflow-hidden rounded-[12px]"
              style={{
                height: "160px",
                background: "linear-gradient(180deg, #FFFFFF 0%, #F7F8FD 100%)",
                border: "1px solid #E4EAF4",
              }}
            />
          </motion.a>
        ))}
      </div>
    </section>
  );
}
