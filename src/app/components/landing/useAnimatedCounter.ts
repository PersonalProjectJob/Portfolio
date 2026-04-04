import { useState, useEffect, useRef } from "react";
import { useInView } from "motion/react";

interface AnimatedCounterOptions {
  target: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}

export function useAnimatedCounter({
  target,
  duration = 2000,
  decimals = 0,
  suffix = "",
  prefix = "",
}: AnimatedCounterOptions) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;

    hasAnimated.current = true;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = target;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(count);

  return {
    ref,
    value: `${prefix}${formatted}${suffix}`,
  };
}
