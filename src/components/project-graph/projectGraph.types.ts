export type ProjectNodeGroup =
  | "foundation"
  | "identity"
  | "product"
  | "process"
  | "automation"
  | "future";

export type ProjectNodeStatus =
  | "published"
  | "coming-soon"
  | "hidden";

export type NodeAnchor =
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left"
  | "top-left"
  | "auto";

export interface ProjectNode {
  id: string;
  title: string;          // Dùng locale key hoặc chuỗi tĩnh
  shortTitle?: string;
  description: string;    // Dùng locale key hoặc chuỗi tĩnh

  href?: string;
  group: ProjectNodeGroup;
  status: ProjectNodeStatus;

  position: {
    x: number; // 0..1
    y: number; // 0..1
  };

  desktopPosition?: {
    x: number;
    y: number;
  };

  tabletPosition?: {
    x: number;
    y: number;
  };

  sequence?: number;
  importance?: "primary" | "secondary" | "supporting";

  note?: {
    title?: string;
    description?: string;
    eyebrow?: string;
    metadata?: string;
    preferredAnchor?: NodeAnchor;
    offset?: {
      x: number;
      y: number;
    };
  };

  expansion?: {
    parentId?: string;
    slot?: string;
    order?: number;
  };
}

export interface ProjectEdge {
  id: string;
  source: string;
  target: string;

  type?:
    | "primary-flow"
    | "supporting"
    | "automation-sequence"
    | "future";

  direction?: "forward" | "both";
  label?: string;
}
