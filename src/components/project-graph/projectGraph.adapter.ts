import type { ProjectNode, ProjectEdge } from './projectGraph.types';
import type { ProjectData } from '../../data/cvData';
import { resolvePosition } from './utils/resolvePosition';

export function mapProjectToGraphNode(
  project: ProjectData,
  totalInZone: number
): ProjectNode {
  const meta = project.graphMetadata;
  if (!meta) {
    throw new Error(`Project ${project.id} is missing graphMetadata`);
  }

  const position = resolvePosition(
    meta.zone,
    meta.order,
    totalInZone,
    meta.positionOverride
  );

  return {
    id: project.id,
    title: project.title,
    shortTitle: meta.shortName,
    description: project.category, // fallback for description
    href: project.id,
    group: meta.zone,
    status: 'published',
    position,
    sequence: meta.order,
    note: {
      eyebrow: meta.eyebrow || project.role,
      title: project.title, // Note title should map to translated string in real app
      description: project.context,
      preferredAnchor: meta.noteAnchor,
      offset: meta.noteOffset,
    },
    expansion: {
      parentId: meta.parentId,
      slot: meta.slot,
      order: meta.order,
    }
  };
}

/**
 * Automatically derive edges from nodes that declare a parentId.
 */
export function deriveEdgesFromNodes(nodes: ProjectNode[], rawCVProjects: ProjectData[]): ProjectEdge[] {
  const edges: ProjectEdge[] = [];
  
  for (const node of nodes) {
    if (node.expansion?.parentId) {
      // Find original metadata for edgeType
      const original = rawCVProjects.find(p => p.id === node.id);
      const edgeType = original?.graphMetadata?.edgeType || 'primary-flow';
      
      edges.push({
        id: `e-${node.expansion.parentId}-${node.id}`,
        source: node.expansion.parentId,
        target: node.id,
        type: edgeType,
        direction: 'forward'
      });
    }
  }
  
  return edges;
}

export function validateProjectGraph(nodes: ProjectNode[], edges: ProjectEdge[]) {
  const ids = new Set<string>();

  // Validate Nodes
  for (const node of nodes) {
    if (ids.has(node.id)) {
      throw new Error(`Duplicate Node ID: ${node.id}`);
    }
    ids.add(node.id);
  }

  // Validate Edges
  for (const edge of edges) {
    if (edge.source === edge.target) {
      throw new Error(`Self-referencing edge found: ${edge.id}`);
    }
    if (!ids.has(edge.source)) {
      throw new Error(`Edge ${edge.id} references missing source: ${edge.source}`);
    }
    if (!ids.has(edge.target)) {
      throw new Error(`Edge ${edge.id} references missing target: ${edge.target}`);
    }
  }

  return true;
}
