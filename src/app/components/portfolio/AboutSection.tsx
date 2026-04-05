import { motion } from "motion/react";
import { Twitter, Instagram, Globe } from "lucide-react";

const experiences = [
  { role: "Product Designer", company: "Nexus Creative", year: "2023" },
  { role: "Freelance", company: "BrightLeaf Co", year: "2021" },
  { role: "Graphic Designer", company: "SummitWorks", year: "2024" },
  { role: "UX/UI Designer", company: "UrbanFlow Lab", year: "2022" },
];

const skills = [
  "Product Design",
  "UX Design",
  "UI Design",
  "Framer",
  "Interaction Design",
  "Branding",
  "Webflow",
  "UX Research",
  "No-Code",
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative mx-auto w-full px-6 py-16 md:px-12 md:py-24"
      style={{ maxWidth: "1440px" }}
    >
      <div className="grid gap-8 md:grid-cols-[320px_1fr]">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-2xl p-6"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            height: "fit-content",
          }}
        >
          {/* Profile Photo */}
          <div
            className="mb-4 h-64 w-full overflow-hidden rounded-xl"
            style={{
              background: "linear-gradient(135deg, #7BC0ED 0%, #2A436B 100%)",
            }}
          >
            <img
              src="/img/profile.jpg"
              alt="Profile"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          {/* Available Badge */}
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span
              style={{
                fontFamily: "Inter",
                fontSize: "13px",
                fontWeight: 500,
                color: "#64748B",
              }}
            >
              available for work
            </span>
          </div>

          {/* Name */}
          <h3
            style={{
              fontFamily: "Inter",
              fontSize: "28px",
              fontWeight: 600,
              color: "#1E2C43",
              marginBottom: "4px",
            }}
          >
            Truong Nguyen Son Thao
          </h3>

          {/* Title */}
          <p
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              color: "#64748B",
              marginBottom: "20px",
            }}
          >
            UI/UX Interaction Designer Based in Vietnam.
          </p>

          {/* Social Icons */}
          <div className="mb-6 flex gap-3">
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
              style={{ background: "#F1F5F9" }}
            >
              <Twitter size={18} className="text-gray-600" />
            </a>
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
              style={{ background: "#F1F5F9" }}
            >
              <Instagram size={18} className="text-gray-600" />
            </a>
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
              style={{ background: "#F1F5F9" }}
            >
              <Globe size={18} className="text-gray-600" />
            </a>
          </div>

          {/* Contact Button */}
          <a
            href="#contact"
            className="flex w-full items-center justify-center gap-2 transition-all hover:scale-105"
            style={{
              fontFamily: "Inter",
              fontSize: "15px",
              fontWeight: 600,
              color: "#FFFFFF",
              textDecoration: "none",
              background: "linear-gradient(135deg, #2A3F67 0%, #1E2C43 100%)",
              borderRadius: "12px",
              padding: "14px 24px",
              boxShadow: "0 8px 24px rgba(42, 63, 103, 0.3)",
            }}
          >
            ↗ Contact Me
          </a>
        </motion.div>

        {/* Experience Section */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Bio */}
          <p
            className="mb-8"
            style={{
              fontFamily: "Inter",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#475569",
            }}
          >
            I'm Truong Nguyen Son Thao, a passionate Web Designer & Developer based in Vietnam. 
            I blend creative design with precise technical execution to deliver outstanding digital experiences.
          </p>

          {/* Skills */}
          <div className="mb-8 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-lg px-4 py-2"
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#475569",
                  background: "#F1F5F9",
                }}
              >
                {skill}
              </motion.span>
            ))}
          </div>

          {/* Experience List */}
          <div className="space-y-3">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center justify-between rounded-xl px-6 py-4"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <span
                  style={{
                    fontFamily: "Inter",
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "#1E2C43",
                  }}
                >
                  {exp.role}
                </span>
                <span
                  style={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    color: "#64748B",
                  }}
                >
                  {exp.company}
                </span>
                <span
                  style={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#94A3B8",
                  }}
                >
                  {exp.year}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
