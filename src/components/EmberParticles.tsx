import React, { useEffect, useState } from 'react';

export const EmberParticles: React.FC<{ count?: number }> = ({ count = 20 }) => {
  const [embers, setEmbers] = useState<Array<{ id: number; left: string; delay: string; duration: string; size: string }>>([]);

  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const finalCount = isMobile ? 8 : count;
    const newEmbers = Array.from({ length: finalCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${4 + Math.random() * 6}s`,
      size: `${2 + Math.random() * 4}px`
    }));
    setEmbers(newEmbers);
  }, [count, isMobile]);

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="ember"
          style={{
            left: ember.left,
            animationDelay: ember.delay,
            animationDuration: ember.duration,
            width: ember.size,
            height: ember.size,
          }}
        />
      ))}
    </div>
  );
};
