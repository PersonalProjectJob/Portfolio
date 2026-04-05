import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Twitter, Instagram, Globe, ArrowUpRight } from "lucide-react";

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

function ProfileCard() {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
      className="overflow-hidden rounded-2xl p-6"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        height: "fit-content",
      }}
    >
      {/* Profile Photo */}
      <motion.div
        className="relative mb-4 h-64 w-full overflow-hidden rounded-xl"
        style={{
          background: "linear-gradient(135deg, #7BC0ED 0%, #2A436B 100%)",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <img
          src="/img/profile.jpg"
          alt="Profile"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.3) 100%)",
          }}
        />
      </motion.div>

      {/* Available Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-4 flex items-center gap-2"
      >
        <motion.span
          className="h-2 w-2 rounded-full bg-green-500"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
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
      </motion.div>

      {/* Name */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          fontFamily: "Inter",
          fontSize: "28px",
          fontWeight: 600,
          color: "#1E2C43",
          marginBottom: "4px",
        }}
      >
        Truong Nguyen Son Thao
      </motion.h3>

      {/* Title */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          fontFamily: "Inter",
          fontSize: "14px",
          color: "#64748B",
          marginBottom: "20px",
        }}
      >
        UI/UX Interaction Designer Based in Vietnam.
      </motion.p>

      {/* Social Icons */}
      <div className="mb-6 flex gap-3">
        {[
          { icon: Twitter, href: "#", label: "Twitter" },
          { icon: Instagram, href: "#", label: "Instagram" },
          { icon: Globe, href: "#", label: "Website" },
        ].map((social, index) => (
          <motion.a
            key={social.label}
            href={social.href}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.15, y: -3 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ 
              background: "#F1F5F9",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#E2E8F0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#F1F5F9")}
          >
            <social.icon size={18} className="text-gray-600" />
          </motion.a>
        ))}
      </div>

      {/* Contact Button */}
      <motion.a
        href="#contact"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex w-full items-center justify-center gap-2"
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
        <span>Contact Me</span>
        <ArrowUpRight size={16} />
      </motion.a>
    </motion.div>
  );
}

function ExperienceItem({ exp, index }) {
  const itemRef = useRef(null);
  const isInView = useInView(itemRef, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, x: 20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
      whileHover={{ x: 8 }}
      className="group flex items-center justify-between rounded-xl px-6 py-4"
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        cursor: "pointer",
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
      <div className="flex items-center gap-3">
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
        <motion.span
          style={{ color: "#94A3B8", fontSize: "18px" }}
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          →
        </motion.span>
      </div>
    </motion.div>
  );
}

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative mx-auto w-full px-6 py-16 md:px-12 md:py-24"
      style={{ maxWidth: "1440px" }}
    >
      <div className="grid gap-8 md:grid-cols-[320px_1fr]">
        {/* Profile Card */}
        <ProfileCard />

        {/* Experience Section */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
        >
          {/* Bio */}
          <motion.p
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{
              fontFamily: "Inter",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#475569",
            }}
          >
            I'm Truong Nguyen Son Thao, a passionate Web Designer & Developer based in Vietnam. 
            I blend creative design with precise technical execution to deliver outstanding digital experiences.
          </motion.p>

          {/* Skills */}
          <div className="mb-8 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05, type: "spring" }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="rounded-lg px-4 py-2"
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#475569",
                  background: "#F1F5F9",
                  cursor: "pointer",
                }}
              >
                {skill}
              </motion.span>
            ))}
          </div>

          {/* Experience List */}
          <div className="space-y-3">
            {experiences.map((exp, index) => (
              <ExperienceItem key={index} exp={exp} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
