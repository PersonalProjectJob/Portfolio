import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  FileCheck,
  MessageSquare,
  TrendingUp,
  Route,
  Users,
} from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { useAnimatedCounter } from "./useAnimatedCounter";
import { cn } from "../ui/utils";

/* ------------------------------------------------------------------ */
/*  Interfaces                                                          */
/* ------------------------------------------------------------------ */
interface StatCardData {
  value: string;
  label: string;
}

interface TestimonialData {
  name: string;
  role: string;
  quote: string;
}

interface BenefitData {
  title: string;
  description: string;
  icon: string;
}

interface SectionHeaderProps {
  label: string;
  heading: string;
  description: string;
}

interface StatCardProps {
  value: string;
  label: string;
  index: number;
}

interface TestimonialCardProps {
  testimonial: TestimonialData;
  isActive: boolean;
}

interface BenefitCardProps {
  title: string;
  description: string;
  iconKey: string;
}

/* ------------------------------------------------------------------ */
/*  Icon mapping for benefits                                           */
/* ------------------------------------------------------------------ */
const BENEFIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  fileCheck: FileCheck,
  messageSquare: MessageSquare,
  trendingUp: TrendingUp,
  route: Route,
  users: Users,
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */
function SectionHeader({ label, heading, description }: SectionHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <span className="text-xs font-semibold tracking-widest text-primary uppercase">
        {label}
      </span>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight max-w-3xl">
        {heading}
      </h2>
      <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StatCard({ value, label, index }: StatCardProps) {
  const isPercentage = value.includes("%");
  const hasPlus = value.includes("+");
  const isRating = value.includes("/");

  let numericValue = value.replace(/[^0-9.]/g, "");
  const numValue = parseFloat(numericValue);

  const decimals = isRating ? 1 : 0;
  const suffix = isPercentage ? "%" : hasPlus && !isRating ? "+" : "";

  const { ref, value: animatedValue } = useAnimatedCounter({
    target: numValue,
    duration: 2000 + index * 200,
    decimals,
    suffix,
  });

  const displayValue = isRating ? animatedValue : animatedValue;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col items-center justify-center p-6 rounded-lg bg-card border border-border transition-shadow duration-300 hover:shadow-lg"
      style={{
        boxShadow:
          "6px 6px 16px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.8)",
      }}
    >
      <span className="text-3xl md:text-4xl font-bold text-primary mb-2">
        {displayValue}
      </span>
      <span className="text-sm text-muted-foreground text-center">{label}</span>
    </motion.div>
  );
}

function TestimonialCard({ testimonial, isActive }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col md:flex-row items-center gap-6 p-8 rounded-lg bg-card",
        isActive ? "block" : "hidden"
      )}
      style={{
        boxShadow:
          "6px 6px 16px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.8)",
      }}
    >
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-32">
        <div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold mb-3"
          aria-hidden="true"
        >
          {testimonial.name.charAt(0)}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-4">
        <p className="text-lg md:text-xl font-semibold text-foreground leading-relaxed italic">
          "{testimonial.quote}"
        </p>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-primary">
            {testimonial.name}
          </span>
          <span className="text-xs text-muted-foreground">{testimonial.role}</span>
        </div>
      </div>
    </motion.div>
  );
}

function BenefitCard({ title, description, iconKey }: BenefitCardProps) {
  const IconComponent = BENEFIT_ICONS[iconKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-start p-6 rounded-lg bg-card border border-border transition-all duration-300 hover:shadow-lg"
      style={{
        boxShadow:
          "6px 6px 16px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.8)",
      }}
      whileHover={{
        boxShadow:
          "inset 4px 4px 12px rgba(0,0,0,0.05), inset -4px -4px 12px rgba(255,255,255,0.8)",
      }}
    >
      {IconComponent && (
        <div className="mb-4 p-3 rounded-lg bg-muted">
          <IconComponent className="w-6 h-6 text-primary" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
export function MemberSection() {
  const { t } = useI18n();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const statistics = t.members.statistics as unknown as StatCardData[];
  const testimonials = t.members.testimonials.items as unknown as TestimonialData[];
  const benefits = t.members.benefits.items as unknown as BenefitData[];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section
      id="members"
      className="py-16 md:py-24 bg-background"
      aria-labelledby="members-heading"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <SectionHeader
          label={t.members.sectionLabel}
          heading={t.members.heading}
          description={t.members.description}
        />

        {/* Statistics Row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {statistics.map((stat, index) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} index={index} />
          ))}
        </div>

        {/* Testimonials Carousel */}
        <div className="mt-16">
          <h3
            id="members-heading"
            className="text-2xl font-semibold text-foreground text-center mb-8"
          >
            {t.members.testimonials.heading}
          </h3>

          <div className="relative">
            <AnimatePresence mode="wait">
              <TestimonialCard
                key={activeTestimonial}
                testimonial={testimonials[activeTestimonial]}
                isActive={true}
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-2 rounded-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
              aria-label="Previous testimonial"
              style={{
                boxShadow:
                  "4px 4px 12px rgba(0,0,0,0.06), -2px -2px 8px rgba(255,255,255,0.8)",
              }}
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-2 rounded-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
              aria-label="Next testimonial"
              style={{
                boxShadow:
                  "4px 4px 12px rgba(0,0,0,0.06), -2px -2px 8px rgba(255,255,255,0.8)",
              }}
            >
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* Carousel Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  index === activeTestimonial
                    ? "w-8 h-2 bg-primary"
                    : "w-2 h-2 bg-border hover:bg-muted-foreground"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === activeTestimonial ? "true" : "false"}
              />
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold text-foreground text-center mb-8">
            {t.members.benefits.heading}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <BenefitCard
                key={benefit.title}
                title={benefit.title}
                description={benefit.description}
                iconKey={benefit.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
