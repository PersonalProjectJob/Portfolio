import React from 'react';
import { motion } from 'framer-motion';
import type { ProjectEdge } from './projectGraph.types';
import { useStore } from '../../store/useStore';

interface ProjectGraphEdgeProps {
  edge: ProjectEdge;
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  isActive?: boolean;
}

export const ProjectGraphEdge: React.FC<ProjectGraphEdgeProps> = ({
  edge,
  sourcePos,
  targetPos,
  isActive = false,
}) => {
  const { isLightMode } = useStore();

  // Draw a smooth bezier curve between nodes for all edges
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  
  // Calculate control point for a PROMINENT arch
  // Increased multiplier from 0.15 to 0.35 for a much more visible, elegant curve
  const cx = sourcePos.x + dx * 0.5 - dy * 0.35;
  const cy = sourcePos.y + dy * 0.5 + dx * 0.35;
  
  const path = `M ${sourcePos.x} ${sourcePos.y} Q ${cx} ${cy} ${targetPos.x} ${targetPos.y}`;

  // Make the base strokes softer and more transparent to look like subtle hanging wires/sketch lines
  const baseStroke = isLightMode ? 'rgba(51,65,85,0.15)' : 'rgba(255,255,255,0.05)';
  
  // In Light mode (sketchpad concept), active links are just slightly darker pencil strokes.
  // Changed from #0f172a (too black) to slate-600 with opacity to match the pencil look.
  const activeStroke = isLightMode ? 'rgba(71,85,105,0.5)' : 'rgba(249,115,22,0.4)'; 
  
  const strokeColor = isActive ? activeStroke : baseStroke;
  // Keep stroke width consistent in light mode so it doesn't look like a sharpie when active
  const strokeWidth = isActive ? (isLightMode ? 2 : 3) : 2; 
  const strokeDasharray = edge.type === 'supporting' ? '4,4' : (isLightMode ? 'none' : '6,6');
  
  // Arrow heads need to match the new pencil color in light mode
  const activeArrowId = isLightMode ? 'url(#arrowhead)' : 'url(#arrowhead-active)';
  const markerEnd = edge.type === 'automation-sequence' ? (isActive ? activeArrowId : 'url(#arrowhead)') : 'none';

  // Add a very subtle glow to the base wires themselves (only in dark mode)
  const baseFilter = isLightMode ? 'none' : 'drop-shadow(0px 1px 2px rgba(255,255,255,0.1))';

  return (
    <motion.path
      d={path}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      markerEnd={markerEnd}
      fill="none"
      style={{ filter: baseFilter }}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="transition-colors duration-300"
    />
  );
};
