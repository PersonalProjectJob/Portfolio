import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { Palette, Code, Monitor, Sparkles, ArrowRight } from "lucide-react";

const services = [
  {
    title: "UX & UI",
    description: "Crafting seamless, user-friendly interfaces that enhance engagement and usability.",
    icon: Palette,
    imageGradient: "linear-gradient(135deg, #BFDBFE 0%, #60A5FA 100%)",
    color: "#3B82F6",
  },
  {
    title: "Framer Development",
    description: "Building high-performance, interactive websites using Framer's powerful design and development tools.",
    icon: Code,
    imageGradient: "linear-gradient(135deg, #DDD6FE 0%, #8B5CF6 100%)",
    color: "#8B5CF6",
  },
  {
    title: "Interactive Web Experiences",
    description: "Interactive websites with Framer's advanced design tools to deliver smooth and engaging user experiences.",
    icon: Monitor,
    imageGradient: "linear-gradient(135deg, #6EE7B7 0%, #10B981 100%)",
    color: "#10B981",
  },
  {
    title: "Design & Creativity",
    description: "Creating visually compelling designs that truly resonate with your target audience and brand.",
    icon: Sparkles,
    imageGradient: "linear-gradient(135deg, #FBCFE8 0%, #EC4899 100%)",
    color: "#EC4899",
  },
];

function ServiceCard({ service, index }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 18,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-3xl p-8"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
        cursor: "pointer",
      }}
    >
      {/* Hover Background Effect */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{
          background: isHovered 
            ? `linear-gradient(135deg, ${service.color}08 0%, ${service.color}15 100%)`
            : "transparent",
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10 flex items-start gap-6">
        {/* Icon/Image */}
        <motion.div
          className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl"
          style={{
            background: service.imageGradient,
            boxShadow: `0 8px 24px ${service.color}33`,
          }}
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            animate={isHovered ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <service.icon size={40} className="text-white" />
          </motion.div>
        </motion.div>

        {/* Content */}
        <div className="flex-1">
          <motion.h3
            style={{
              fontFamily: "Inter",
              fontSize: "22px",
              fontWeight: 600,
              color: "#1E2C43",
              marginBottom: "8px",
            }}
          >
            {service.title}
          </motion.h3>
          
          <p
            style={{
              fontFamily: "Inter",
              fontSize: "15px",
              lineHeight: 1.5,
              color: "#64748B",
              marginBottom: "16px",
            }}
          >
            {service.description}
          </p>

          {/* Learn More Link */}
          <motion.div
            className="flex items-center gap-2"
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 600,
              color: service.color,
            }}
            animate={isHovered ? { x: 8 } : { x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span>Learn more</span>
            <ArrowRight size={16} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative mx-auto w-full px-6 py-16 md:px-12 md:py-24"
      style={{ maxWidth: "1440px" }}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, type: "spring" }}
        className="mb-16 text-center"
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
          Services
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
            marginBottom: "12px",
          }}
        >
          Crafting Digital Excellence
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
            maxWidth: "550px",
            margin: "0 auto",
          }}
        >
          Building smooth and engaging digital interactions that elevate user satisfaction
        </motion.p>
      </motion.div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service, index) => (
          <ServiceCard key={service.title} service={service} index={index} />
        ))}
      </div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-16 flex justify-center gap-4"
      >
        <motion.a
          href="#contact"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="transition-shadow"
          style={{
            fontFamily: "Inter",
            fontSize: "15px",
            fontWeight: 600,
            color: "#FFFFFF",
            textDecoration: "none",
            background: "linear-gradient(135deg, #2A3F67 0%, #1E2C43 100%)",
            borderRadius: "12px",
            padding: "16px 32px",
            boxShadow: "0 8px 24px rgba(42, 63, 103, 0.3)",
          }}
        >
          Contact Me
        </motion.a>
        <motion.a
          href="#projects"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            fontFamily: "Inter",
            fontSize: "15px",
            fontWeight: 600,
            color: "#2A3F67",
            textDecoration: "none",
            background: "#F1F5F9",
            borderRadius: "12px",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>→</span> See Projects
        </motion.a>
      </motion.div>
    </section>
  );
}
