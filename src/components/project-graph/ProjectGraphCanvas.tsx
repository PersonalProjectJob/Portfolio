import React from 'react';
import type { ProjectNode, ProjectEdge } from './projectGraph.types';
import { ProjectGraphNode } from './ProjectGraphNode';
import { ProjectGraphEdge } from './ProjectGraphEdge';
import { useStore } from '../../store/useStore';

interface ProjectGraphCanvasProps {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
  activeNodeId: string | null;
  onSelectNode: (id: string) => void;
}

export const ProjectGraphCanvas: React.FC<ProjectGraphCanvasProps> = ({
  nodes,
  edges,
  activeNodeId,
  onSelectNode,
}) => {
  const { isLightMode } = useStore();

  // Mapping edge source/target to node positions for the SVG
  const edgesWithPos = edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    return {
      ...edge,
      sourcePos: sourceNode ? { x: sourceNode.position.x * 1000, y: sourceNode.position.y * 1000 } : null,
      targetPos: targetNode ? { x: targetNode.position.x * 1000, y: targetNode.position.y * 1000 } : null,
    };
  }).filter(e => e.sourcePos && e.targetPos);

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

      {/* SVG Container for Edges */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="none"
      >
        {edgesWithPos.map(edge => (
          <ProjectGraphEdge
            key={edge.id}
            edge={edge as ProjectEdge}
            sourcePos={edge.sourcePos!}
            targetPos={edge.targetPos!}
            isActive={activeNodeId === edge.source || activeNodeId === edge.target}
          />
        ))}
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
