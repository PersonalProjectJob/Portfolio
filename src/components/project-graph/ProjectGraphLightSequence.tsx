import React from 'react';
import { useReducedMotion } from 'framer-motion';

interface ProjectGraphLightSequenceProps {
  pathD: string;
  duration?: number;
}

export const ProjectGraphLightSequence: React.FC<ProjectGraphLightSequenceProps> = ({
  pathD,
  duration = 2.5,
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  if (!pathD || prefersReducedMotion) return null;

  const totalDur = duration + 1.5; // 4s total loop (2.5s active, 1.5s delay)
  const activeRatio = duration / totalDur; // ~0.625

  // 5 layers for a smooth tapering gradient tail — balanced visual vs performance
  const tailLayers = [
    { length: 0.25, width: 0.6,  r: 147, g: 51,  b: 234, opacity: 0.08 }, // Farthest tip — thin, faint purple
    { length: 0.18, width: 1.2,  r: 173, g: 67,  b: 181, opacity: 0.20 }, // Mid-outer — purple-pink blend
    { length: 0.12, width: 2.0,  r: 210, g: 87,  b: 110, opacity: 0.40 }, // Mid — warm transition
    { length: 0.07, width: 2.8,  r: 237, g: 105, b: 50,  opacity: 0.65 }, // Inner — approaching orange
    { length: 0.03, width: 3.5,  r: 249, g: 115, b: 22,  opacity: 0.90 }, // Core — bright orange, closest to head
  ];

  return (
    <g className="pointer-events-none" style={{ mixBlendMode: 'screen' }}>
      <g opacity="0">
        <animate
          attributeName="opacity"
          values={`0;1;1;0;0`}
          keyTimes={`0;0.1;${activeRatio - 0.1};${activeRatio};1`}
          dur={`${totalDur}s`}
          repeatCount="indefinite"
        />
        
        {/* High-Fidelity Tapering Curved Tail — 5 layers, no drop-shadow */}
        {tailLayers.map((layer, index) => (
          <path
            key={index}
            d={pathD}
            fill="none"
            stroke={`rgba(${layer.r},${layer.g},${layer.b},${layer.opacity})`}
            strokeWidth={layer.width}
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray={`${layer.length} 2`}
          >
            <animate
              attributeName="stroke-dashoffset"
              values={`${layer.length};${-1 + layer.length};${-1 + layer.length}`}
              keyTimes={`0;${activeRatio};1`}
              dur={`${totalDur}s`}
              repeatCount="indefinite"
            />
          </path>
        ))}
        
        {/* StarLight Head — Moves along the path */}
        <g>
          <use href="#starlight-8pt" transform="scale(0.9)" filter="drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 12px rgba(249,115,22,1))" />
          
          <animateMotion
            dur={`${totalDur}s`}
            repeatCount="indefinite"
            path={pathD}
            calcMode="linear"
            keyPoints={`0;1;1`}
            keyTimes={`0;${activeRatio};1`}
          />
        </g>
      </g>
    </g>
  );
};

