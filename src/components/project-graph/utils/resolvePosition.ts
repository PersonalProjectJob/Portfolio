import type { ProjectNodeGroup } from '../projectGraph.types';
import { graphZones } from '../projectGraph.config';

export function resolvePosition(
  zone: ProjectNodeGroup,
  order: number,
  totalInZone: number,
  positionOverride?: { x: number; y: number }
): { x: number; y: number } {
  if (positionOverride) {
    return positionOverride;
  }

  const bounds = graphZones[zone]?.bounds;
  if (!bounds) {
    // Fallback if zone not found
    return { x: 0.5, y: 0.5 };
  }

  // If there's only 1 item, put it in the center of the zone
  if (totalInZone <= 1) {
    return {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    };
  }

  // Distribute items linearly from top-left to bottom-right (or just along Y axis)
  // For Scorpio layout, a linear progression downwards makes the most sense.
  const t = (order - 1) / (totalInZone - 1); // 0 to 1
  const x = bounds.minX + t * (bounds.maxX - bounds.minX);
  const y = bounds.minY + t * (bounds.maxY - bounds.minY);

  return { x, y };
}
