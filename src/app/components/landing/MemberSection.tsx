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
interface TeamMemberData {
  initials: string;
  name: string;
  role: string;
  bio: string;
  tags: string;
}

interface StatCardData {
  value: string;
  label: string;
}

interface TestimonialData {
  initials: string;
  name: string;
  role: string;
  quote: string;
}

interface BenefitData {
  title: string;
  description: string;
  icon: string;
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
/*  Gradient presets for cards (Stage 2 Visual)                         */
/* ------------------------------------------------------------------ */
const GRADIENTS = {
  stat1: "linear-gradient(135deg, #FFFFFF 0%, #F3FAFF 100%)",
  stat2: "linear-gradient(135deg, #FFFFFF 0%, #F5FCFB 100%)",
  stat3: "linear-gradient(135deg, #FFFFFF 0%, #FFF8F1 100%)",
  stat4: "linear-gradient(135deg, #FFFFFF 0%, #F7FBF6 100%)",
  benefit1: "linear-gradient(135deg, #FFFFFF 0%, #F3FAFF 100%)",
  benefit2: "linear-gradient(135deg, #FFFFFF 0%, #F5FCFB 100%)",
  benefit3: "linear-gradient(135deg, #FFFFFF 0%, #FFF8F1 100%)",
  benefit4: "linear-gradient(135deg, #FFFFFF 0%, #F7FBF6 100%)",
  benefit5: "linear-gradient(135deg, #FFFFFF 0%, #F4F7FF 100%)",
  benefit6: "linear-gradient(135deg, #FFFFFF 0%, #F5FBFF 100%)",
  teamIntro: "linear-gradient(135deg, #FFFFFF 0%, #F4F8FF 100%)",
  teamSota: "linear-gradient(135deg, #FFFFFF 0%, #F3FAFF 100%)",
  teamHarry: "linear-gradient(135deg, #FFFFFF 0%, #F7FBF6 100%)",
  testimonial: "linear-gradient(135deg, #FFFFFF 0%, #F1F8FF 100%)",
  avatarSota: "linear-gradient(135deg, #0B2545 0%, #4AADE6 100%)",
  avatarHarry: "linear-gradient(135deg, #214766 0%, #72B7C9 100%)",
  avatarDefault: "linear-gradient(135deg, #0B2545 0%, #4AADE6 100%)",
};

const STROKES = {
  stat1: "#DCEAF6",
  stat2: "#DDEEEB",
  stat3: "#F1E6D7",
  stat4: "#E0EDE2",
  benefit1: "#DCEAF6",
  benefit2: "#DDEEEB",
  benefit3: "#F1E6D7",
  benefit4: "#E0EDE2",
  benefit5: "#DDE3F5",
  benefit6: "#DCEAF6",
};

const SHADOWS = {
  container: "0px 18px 48px rgba(169, 185, 209, 0.20)",
  card: "0px 8px 24px rgba(169, 185, 209, 0.13)",
  avatar: "0px 6px 20px rgba(94, 167, 209, 0.27)",
  avatarHarry: "0px 6px 20px rgba(124, 183, 201, 0.27)",
  quote: "0px 18px 42px rgba(156, 178, 204, 0.13)",
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

/* ── Community Pill Badge ── */
function CommunityBadge({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center px-4 py-2 rounded-full"
      style={{
        background: "#E9F5FF",
        border: "1px solid #B8DBF4",
        boxShadow: "0px 2px 8px rgba(169, 185, 209, 0.10)",
      }}
    >
      <span
        className="text-primary font-semibold tracking-widest uppercase"
        style={{ fontSize: "12px", letterSpacing: "1.2px" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({
  label,
  heading,
  description,
}: {
  label: string;
  heading: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <CommunityBadge label={label} />
      <h2
        className="text-foreground font-semibold leading-tight max-w-3xl"
        style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
      >
        {heading}
      </h2>
      <p
        className="text-muted-foreground leading-relaxed max-w-2xl"
        style={{ fontSize: "clamp(14px, 2vw, 18px)" }}
      >
        {description}
      </p>
    </div>
  );
}

/* ── Team Member Card ── */
function TeamMemberCard({
  member,
  gradient,
  shadow,
  index,
}: {
  member: TeamMemberData;
  gradient: string;
  shadow: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="flex-1 rounded-[26px] p-6 flex flex-col gap-3"
      style={{
        background: gradient,
        border: "1px solid #DCEAF6",
        boxShadow: shadow,
        minHeight: "228px",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center rounded-[36px]"
          style={{
            width: "72px",
            height: "72px",
            background:
              index === 0 ? GRADIENTS.avatarSota : GRADIENTS.avatarHarry,
            boxShadow: index === 0 ? SHADOWS.avatar : SHADOWS.avatarHarry,
          }}
        >
          <span className="text-white font-semibold text-2xl">
            {member.initials}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-[#0B2545] leading-tight">
            {member.name}
            <br />
            <span className="text-sm font-medium">{member.role}</span>
          </span>
        </div>
      </div>
      <p className="text-sm text-[#5A6475] leading-relaxed">{member.bio}</p>
      <span
        className="text-sm font-semibold mt-auto hidden md:block"
        style={{ color: index === 0 ? "#4AADE6" : "#2B6C78" }}
      >
        {member.tags}
      </span>
    </motion.div>
  );
}

/* ── Team Spotlight Section ── */
function TeamSpotlight({
  tag,
  heading,
  body,
  members,
}: {
  tag: string;
  heading: string;
  body: string;
  members: TeamMemberData[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="flex flex-col lg:flex-row gap-4"
    >
      {/* Intro Card */}
      <div
        className="lg:w-[420px] rounded-[26px] p-6 flex flex-col justify-between gap-3"
        style={{
          background: GRADIENTS.teamIntro,
          border: "1px solid #DCEAF6",
          boxShadow: SHADOWS.card,
          minHeight: "228px",
        }}
      >
        <div>
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: "#4AADE6", letterSpacing: "1.1px" }}
          >
            {tag}
          </span>
          <h3
            className="text-2xl font-semibold text-[#0B2545] mt-2"
            style={{ fontSize: "28px" }}
          >
            {heading}
          </h3>
        </div>
        <p className="text-sm text-[#5A6475] leading-relaxed">{body}</p>
      </div>

      {/* Team Member Cards */}
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        {members.map((member, index) => (
          <TeamMemberCard
            key={member.name}
            member={member}
            gradient={index === 0 ? GRADIENTS.teamSota : GRADIENTS.teamHarry}
            shadow={index === 0 ? SHADOWS.card : SHADOWS.card}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Stat Card ── */
function StatCard({
  value,
  label,
  index,
  gradient,
  stroke,
}: {
  value: string;
  label: string;
  index: number;
  gradient: string;
  stroke: string;
}) {
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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col justify-center p-5 rounded-[24px]"
      style={{
        background: gradient,
        border: `1px solid ${stroke}`,
        boxShadow: SHADOWS.card,
        minHeight: "116px",
      }}
    >
      <span
        className="font-semibold text-[#0B2545]"
        style={{ fontSize: "clamp(24px, 3vw, 34px)" }}
      >
        {animatedValue}
      </span>
      <span
        className="text-sm leading-relaxed whitespace-pre-line"
        style={{ color: "#5A6475", fontSize: "14px" }}
      >
        {label}
      </span>
    </motion.div>
  );
}

/* ── Testimonial Card ── */
function TestimonialCard({
  testimonial,
  isActive,
}: {
  testimonial: TestimonialData;
  isActive: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col md:flex-row items-center gap-6 p-7 rounded-[28px]",
        isActive ? "flex" : "hidden"
      )}
      style={{
        background: GRADIENTS.testimonial,
        border: "1px solid #DCEAF6",
        boxShadow: SHADOWS.quote,
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center">
        <div
          className="flex items-center justify-center rounded-[48px]"
          style={{
            width: "96px",
            height: "96px",
            background: GRADIENTS.avatarDefault,
            boxShadow: SHADOWS.avatar,
          }}
        >
          <span className="text-white font-semibold text-2xl">
            {testimonial.initials}
          </span>
        </div>
        <div className="flex flex-col items-center mt-3">
          <span className="text-sm font-semibold text-[#0B2545] text-center leading-tight">
            {testimonial.name}
            <br />
            <span className="text-xs font-normal text-[#5A6475]">
              {testimonial.role}
            </span>
          </span>
        </div>
      </div>

      {/* Quote */}
      <div className="flex-1 flex flex-col justify-center gap-5">
        <p
          className="font-semibold text-[#0B2545] leading-snug italic"
          style={{ fontSize: "clamp(18px, 2.5vw, 28px)" }}
        >
          "{testimonial.quote}"
        </p>
      </div>
    </motion.div>
  );
}

/* ── Benefit Card ── */
function BenefitCard({
  title,
  description,
  iconKey,
  gradient,
  stroke,
  index,
}: {
  title: string;
  description: string;
  iconKey: string;
  gradient: string;
  stroke: string;
  index: number;
}) {
  const IconComponent = BENEFIT_ICONS[iconKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="flex flex-col items-start p-5 rounded-[24px] transition-shadow duration-300"
      style={{
        background: gradient,
        border: `1px solid ${stroke}`,
        boxShadow: SHADOWS.card,
      }}
      whileHover={{
        boxShadow: "0px 12px 32px rgba(169, 185, 209, 0.18)",
      }}
    >
      {IconComponent && (
        <div
          className="mb-3 p-2 rounded-lg"
          style={{ background: "rgba(74, 173, 230, 0.08)" }}
        >
          <IconComponent className="w-5 h-5 text-[#4AADE6]" />
        </div>
      )}
      <h3
        className="font-medium text-[#0B2545] mb-2 leading-snug"
        style={{ fontSize: "16px", fontWeight: 500 }}
      >
        {title}
      </h3>
      <p
        className="text-sm text-[#5A6475] leading-relaxed"
        style={{ fontSize: "14px" }}
      >
        {description}
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
export function MemberSection() {
  const { t } = useI18n();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const teamSpotlight = t.members.teamSpotlight;
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

  const statGradients = [
    GRADIENTS.stat1,
    GRADIENTS.stat2,
    GRADIENTS.stat3,
    GRADIENTS.stat4,
  ];
  const statStrokes = [
    STROKES.stat1,
    STROKES.stat2,
    STROKES.stat3,
    STROKES.stat4,
  ];

  const benefitGradients = [
    GRADIENTS.benefit1,
    GRADIENTS.benefit2,
    GRADIENTS.benefit3,
    GRADIENTS.benefit4,
    GRADIENTS.benefit5,
    GRADIENTS.benefit6,
  ];
  const benefitStrokes = [
    STROKES.benefit1,
    STROKES.benefit2,
    STROKES.benefit3,
    STROKES.benefit4,
    STROKES.benefit5,
    STROKES.benefit6,
  ];

  return (
    <section
      id="members"
      className="py-16 md:py-24"
      aria-labelledby="members-heading"
      style={{
        background: "linear-gradient(180deg, #F8FCFF 0%, #EEF5FF 100%)",
      }}
    >
      <div
        className="mx-auto rounded-[30px] p-8 md:p-10"
        style={{
          maxWidth: "1440px",
          border: "1px solid #DCEAF6",
          boxShadow: SHADOWS.container,
        }}
      >
        {/* Section Header */}
        <div className="mb-10">
          <SectionHeader
            label={t.members.sectionLabel}
            heading={t.members.heading}
            description={t.members.description}
          />
        </div>

        {/* Team Spotlight */}
        <div className="mb-12">
          <TeamSpotlight
            tag={teamSpotlight.tag}
            heading={teamSpotlight.heading}
            body={teamSpotlight.body}
            members={teamSpotlight.members as unknown as TeamMemberData[]}
          />
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-12">
          {statistics.map((stat, index) => (
            <StatCard
              key={stat.value}
              value={stat.value}
              label={stat.label}
              index={index}
              gradient={statGradients[index]}
              stroke={statStrokes[index]}
            />
          ))}
        </div>

        {/* Testimonials Carousel */}
        <div className="mb-14">
          <h3
            className="text-xl md:text-2xl font-semibold text-[#0B2545] text-center mb-8"
            style={{ fontSize: "clamp(18px, 2vw, 22px)" }}
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

            {/* Navigation Arrows - Desktop only */}
            <button
              onClick={prevTestimonial}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-white border border-[#DCEAF6] shadow-sm hover:shadow-md transition-shadow"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-[#0B2545]" />
            </button>

            <button
              onClick={nextTestimonial}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-white border border-[#DCEAF6] shadow-sm hover:shadow-md transition-shadow"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-[#0B2545]" />
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
                    ? "w-8 h-2"
                    : "w-2 h-2 hover:bg-[#C9DAEA]"
                )}
                style={{
                  background:
                    index === activeTestimonial ? "#4AADE6" : "#C9DAEA",
                }}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === activeTestimonial ? "true" : "false"}
              />
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div>
          <h3
            className="text-xl md:text-2xl font-semibold text-[#0B2545] text-center mb-8"
            style={{ fontSize: "clamp(18px, 2vw, 22px)" }}
          >
            {t.members.benefits.heading}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {benefits.map((benefit, index) => (
              <BenefitCard
                key={benefit.title}
                title={benefit.title}
                description={benefit.description}
                iconKey={benefit.icon}
                gradient={benefitGradients[index]}
                stroke={benefitStrokes[index]}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
