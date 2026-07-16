import React, { useEffect, useState } from 'react';

export const EmberParticles: React.FC<{ count?: number }> = ({ count = 20 }) => {
  const [embers, setEmbers] = useState<Array<{ id: number; left: string; delay: string; duration: string; size: string }>>([]);

  useEffect(() => {
    const newEmbers = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${4 + Math.random() * 6}s`,
      size: `${2 + Math.random() * 4}px`
    }));
    setEmbers(newEmbers);
  }, [count]);

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
