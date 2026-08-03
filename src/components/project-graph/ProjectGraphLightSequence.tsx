import React from 'react';
import { motion } from 'framer-motion';

interface ProjectGraphLightSequenceProps {
  pathD: string;
  duration?: number;
}

export const ProjectGraphLightSequence: React.FC<ProjectGraphLightSequenceProps> = ({
  pathD,
  duration = 2.5,
}) => {
  if (!pathD) return null;

  // Gradient Energy Comet (Dark Mode Only)
  // This component is conditionally rendered only in Dark Mode by ProjectGraphCanvas,
  // so all styles are Dark Mode specific — no isLightMode branching needed.

  const tailLength = 0.25;
  const bodyLength = 0.10;
  const headLength = 0.02;

  // Calculate offsets so their leading edges perfectly align.
  const baseOffset = [0, 1];
  const bodyOffset = baseOffset.map(v => v + tailLength - bodyLength);
  const headOffset = baseOffset.map(v => v + tailLength - headLength);

  const commonTransition = {
    duration: duration,
    times: [0, 0.1, 0.9, 1],
    ease: 'linear',
    repeat: Infinity,
    repeatDelay: 1.5,
  };

  return (
    <g className="pointer-events-none" style={{ mixBlendMode: 'screen' }}>
      {/* Layer 3: The Tail (Faint Purple) */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="rgba(168,85,247,0.3)"
        strokeWidth={1.5}
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.4))' }}
        initial={{ pathLength: tailLength, pathSpacing: 1, pathOffset: baseOffset[0], opacity: 0 }}
        animate={{
          pathOffset: baseOffset,
          opacity: [0, 1, 1, 0]
        }}
        transition={commonTransition}
      />
      
      {/* Layer 2: The Body (Orange) */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="rgba(249,115,22,0.7)"
        strokeWidth={2.5}
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.8))' }}
        initial={{ pathLength: bodyLength, pathSpacing: 1, pathOffset: bodyOffset[0], opacity: 0 }}
        animate={{
          pathOffset: bodyOffset,
          opacity: [0, 1, 1, 0]
        }}
        transition={commonTransition}
      />

      {/* Layer 1: The Head (White blinding) */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,1)) drop-shadow(0 0 12px rgba(249,115,22,1))' }}
        initial={{ pathLength: headLength, pathSpacing: 1, pathOffset: headOffset[0], opacity: 0 }}
        animate={{
          pathOffset: headOffset,
          opacity: [0, 1, 1, 0]
        }}
        transition={commonTransition}
      />
    </g>
  );
};
