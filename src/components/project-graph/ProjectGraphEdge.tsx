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

  // Draw a smooth bezier curve between nodes
  // For Scorpio layout, we can use a slight curve or straight line. Let's use a straight line for simplicity and cosmic constellation feel, or a slight curve for automation sequence.
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  
  let path = '';
  if (edge.type === 'automation-sequence') {
    // Add a slight curve for automation tail
    const cx = sourcePos.x + dx * 0.5 + dy * 0.1;
    const cy = sourcePos.y + dy * 0.5 - dx * 0.1;
    path = `M ${sourcePos.x} ${sourcePos.y} Q ${cx} ${cy} ${targetPos.x} ${targetPos.y}`;
  } else {
    // Straight line for main constellation
    path = `M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`;
  }

  const baseStroke = isLightMode ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.4)';
  const activeStroke = isLightMode ? 'rgba(249,115,22,0.8)' : 'rgba(249,115,22,0.8)'; // orange-500
  
  const strokeColor = isActive ? activeStroke : baseStroke;
  const strokeWidth = isActive ? 3 : 2;
  const strokeDasharray = edge.type === 'supporting' ? '4,4' : '6,6';
  const markerEnd = edge.type === 'automation-sequence' ? (isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)') : 'none';

  return (
    <motion.path
      d={path}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      markerEnd={markerEnd}
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="transition-colors duration-300"
    />
  );
};
