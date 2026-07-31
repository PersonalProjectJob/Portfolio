import type { ProjectNode, ProjectEdge } from "./projectGraph.types";
import { CV_PROJECTS } from "../../data/cvData";
import { mapProjectToGraphNode, deriveEdgesFromNodes, validateProjectGraph } from "./projectGraph.adapter";

// Count projects per zone for distribution logic (used by resolver if no override)
const counts: Record<string, number> = {};
CV_PROJECTS.forEach(p => {
  if (p.graphMetadata?.zone) {
    counts[p.graphMetadata.zone] = (counts[p.graphMetadata.zone] || 0) + 1;
  }
});

// Map all projects
export const projectNodes: ProjectNode[] = CV_PROJECTS.filter(p => p.graphMetadata).map(
  p => mapProjectToGraphNode(p, counts[p.graphMetadata!.zone])
);

// Add the Profile (Antares) node manually as it's the center identity
projectNodes.push({
  id: "profile",
  title: "Sota Trương",
  shortTitle: "Sota Trương",
  description: "Product Designer",
  group: "identity",
  status: "published",
  position: { x: 0.5, y: 0.28 },
  importance: "primary"
});

// Auto-derive primary and automation edges
const derivedEdges = deriveEdgesFromNodes(projectNodes, CV_PROJECTS);

// Define extra edges (like Process pointing to Profile, which flows backwards/inwards)
const extraProjectEdges: ProjectEdge[] = [
  { id: "e-aiprocess-profile", source: "ai-process", target: "profile", type: "primary-flow", direction: "forward" },
  { id: "e-handoff-profile", source: "handoff", target: "profile", type: "primary-flow", direction: "forward" }
];

export const projectEdges: ProjectEdge[] = [...derivedEdges, ...extraProjectEdges];

// Development time validation
if (import.meta.env?.DEV) {
  validateProjectGraph(projectNodes, projectEdges);
}
