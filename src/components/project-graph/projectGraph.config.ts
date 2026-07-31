import type { ProjectNodeGroup } from "./projectGraph.types";

export const graphZones: Record<
  ProjectNodeGroup,
  {
    bounds: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    };
  }
> = {
  foundation: {
    bounds: { minX: 0.2, maxX: 0.72, minY: 0.08, maxY: 0.3 },
  },
  identity: {
    bounds: { minX: 0.42, maxX: 0.62, minY: 0.28, maxY: 0.45 },
  },
  product: {
    bounds: { minX: 0.32, maxX: 0.62, minY: 0.42, maxY: 0.7 },
  },
  automation: {
    bounds: { minX: 0.08, maxX: 0.4, minY: 0.66, maxY: 0.88 },
  },
  process: {
    bounds: { minX: 0.6, maxX: 0.9, minY: 0.4, maxY: 0.7 },
  },
  future: {
    bounds: { minX: 0.08, maxX: 0.92, minY: 0.08, maxY: 0.92 },
  },
};

export const mobileGroupOrder: ProjectNodeGroup[] = [
  "identity",
  "product",
  "process",
  "automation",
];

export const layoutConfig = {
  desktopCanvasWidth: 1200,
  desktopCanvasHeight: 900,
  tabletCanvasWidth: 800,
  tabletCanvasHeight: 1000,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1200,
};
