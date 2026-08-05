import React from 'react';
import type { ProjectNode, ProjectEdge } from './projectGraph.types';
import { ProjectGraphNode } from './ProjectGraphNode';
import { ProjectGraphEdge } from './ProjectGraphEdge';
import { ProjectGraphLightSequence } from './ProjectGraphLightSequence';
import { useStore } from '../../store/useStore';

interface ProjectGraphCanvasProps {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
  activeNodeId: string | null;
  onSelectNode: (id: string) => void;
}

// Removed ScorpioStars component per user request
export const ProjectGraphCanvas: React.FC<ProjectGraphCanvasProps> = ({
  nodes,
  edges,
  activeNodeId,
  onSelectNode,
}) => {
  const { isLightMode } = useStore();

  // Mapping edge source/target to node positions for the SVG
  const edgesWithPos = React.useMemo(() => edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    return {
      ...edge,
      sourcePos: sourceNode ? { x: sourceNode.position.x * 1000, y: sourceNode.position.y * 1000 } : null,
      targetPos: targetNode ? { x: targetNode.position.x * 1000, y: targetNode.position.y * 1000 } : null,
    };
  }).filter(e => e.sourcePos && e.targetPos), [nodes, edges]);

  // Build continuous SVG paths for the light sequences to perfectly follow the beziers
  const { mainPathD, secondaryPathD } = React.useMemo(() => {
    const buildPathString = (nodeIds: string[]) => {
      if (nodeIds.length < 2) return '';
      let d = '';
      for (let i = 0; i < nodeIds.length - 1; i++) {
        const sourceId = nodeIds[i];
        const targetId = nodeIds[i + 1];
        const sourceNode = nodes.find(n => n.id === sourceId);
        const targetNode = nodes.find(n => n.id === targetId);
        const edge = edges.find(e => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId));
        
        if (sourceNode && targetNode && edge) {
          const sourcePos = { x: sourceNode.position.x * 1000, y: sourceNode.position.y * 1000 };
          const targetPos = { x: targetNode.position.x * 1000, y: targetNode.position.y * 1000 };
          
          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          
          if (i === 0) {
            d += `M ${sourcePos.x} ${sourcePos.y} `;
          }
          
          const cx = sourcePos.x + dx * 0.5 - dy * 0.35;
          const cy = sourcePos.y + dy * 0.5 + dx * 0.35;
          
          d += `Q ${cx} ${cy} ${targetPos.x} ${targetPos.y} `;
        }
      }
      return d.trim();
    };

    const mainSequenceIds = [
      'ai-process', 'profile', 'nexora', 'cryptomap', 'nailhub', 
      'vlinkpay', 'dispatch', 'agent-rules', 'sync-task-badge'
    ];
    const secondarySequenceIds = [
      'handoff', 'profile', 'nexora', 'cryptomap', 'nailhub', 
      'vlinkpay', 'dispatch', 'agent-rules', 'sync-task-badge'
    ];

    return {
      mainPathD: buildPathString(mainSequenceIds),
      secondaryPathD: buildPathString(secondarySequenceIds),
    };
  }, [nodes, edges]);

  return (
    <div className="relative w-full h-full max-w-[1200px] max-h-[900px] mx-auto hidden md:block">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isLightMode ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.05)"} strokeWidth="1"/>
            </pattern>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill={isLightMode ? "rgba(15,23,42,0.4)" : "rgba(255,255,255,0.4)"} />
            </marker>
            <marker id="arrowhead-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="rgba(249,115,22,0.8)" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* SVG Container for Edges & Decoratives */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="glow-star-heavy" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* 8-Pointed StarLight SVG for nodes */}
          <g id="starlight-8pt">
            <path d="M 0 -10 Q 0 0 10 0 Q 0 0 0 10 Q 0 0 -10 0 Q 0 0 0 -10 Z" fill="#ffffff" />
            <path d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 -7 Z" fill="#ffffff" transform="rotate(45)" opacity="0.8" />
          </g>
        </defs>

        {/* Edges */}
        {edgesWithPos.map(edge => (
          <ProjectGraphEdge
            key={edge.id}
            edge={edge as ProjectEdge}
            sourcePos={edge.sourcePos!}
            targetPos={edge.targetPos!}
            isActive={activeNodeId === edge.source || activeNodeId === edge.target}
          />
        ))}

        {/* Animated Light Sequences (Dark Mode Only) */}
        {!isLightMode && (
          <>
            <ProjectGraphLightSequence pathD={mainPathD} />
            <ProjectGraphLightSequence pathD={secondaryPathD} />
          </>
        )}
      </svg>

      {/* HTML Container for Nodes */}
      <div className="absolute inset-0 z-20">
        {nodes.map(node => (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: `${node.position.x * 100}%`,
              top: `${node.position.y * 100}%`,
            }}
          >
            <ProjectGraphNode
              node={node}
              isActive={activeNodeId === node.id}
              onSelect={onSelectNode}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
