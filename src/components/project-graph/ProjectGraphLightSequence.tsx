import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

interface ProjectGraphLightSequenceProps {
  pathD: string;
  duration?: number;
}

export const ProjectGraphLightSequence: React.FC<ProjectGraphLightSequenceProps> = ({
  pathD,
  duration = 1.5,
}) => {
  const { isLightMode } = useStore();

  if (!pathD) return null;

  // Modern Laser Beam / Fiber Optic pulse
  // We use CSS drop-shadow for a clean, high-performance neon glow.
  const dropShadow = isLightMode
    ? `drop-shadow(0 0 4px rgba(249,115,22,0.8)) drop-shadow(0 0 8px rgba(249,115,22,0.6))`
    : `drop-shadow(0 0 5px rgba(249,115,22,1)) drop-shadow(0 0 15px rgba(249,115,22,0.8))`;

  const beamColor = '#ffffff'; // Pure white core for the laser

  return (
    <motion.path
      d={pathD}
      fill="none"
      stroke={beamColor}
      strokeWidth={3}
      strokeLinecap="round"
      style={{ filter: dropShadow, mixBlendMode: 'screen' }}
      initial={{ pathLength: 0.15, pathSpacing: 1, pathOffset: 0, opacity: 0 }}
      animate={{
        pathOffset: [0, 1],
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration: duration,
        times: [0, 0.1, 0.9, 1], // Fade in quickly, hold, fade out at the very end
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: 1.5,
      }}
      className="pointer-events-none"
    />
  );
};
