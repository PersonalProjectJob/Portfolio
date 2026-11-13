export interface DockItemConfig {
  id: string;
  label: string;
  glyph: 'home' | 'grove' | 'habitats' | 'journal' | 'enter' | 'projects' | 'about' | 'services' | 'contact' | 'custom';
  customSvg?: React.ReactNode;
  isActive?: boolean;
  isMark?: boolean;
  isEnter?: boolean;
  delayMs?: number;
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
}

export interface StatItemConfig {
  label: string;
  value: string;
  icon?: 'circles' | 'rays';
  delayMs?: number;
  positionClass?: string;
  parallaxDepth?: number;
}

export interface DepthCardConfig {
  id: string;
  variant: 'about' | 'stove' | 'custom';
  label: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  knobLabel: string;
  knobIcon?: React.ReactNode;
  onKnobClick?: () => void;
  delayMs?: number;
  portalDelayMs?: number;
  parallaxDepth?: number;
  parallaxRotate?: number;
}

export interface LiquidMetalProps {
  variant?: 'explore' | 'play' | 'custom';
  label?: string;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export interface SylvaHeroProps {
  variant?: 'living-green';
  headlineLine1?: string;
  headlineLine2?: string;
  ledeText?: string;
  ghostText?: string;
  stats?: StatItemConfig[];
  cards?: DepthCardConfig[];
  dockItems?: DockItemConfig[];
  onExploreClick?: () => void;
  onPlayClick?: () => void;
  onNavigate?: (destination: 'projects' | 'about' | 'services' | 'contact') => void;
  onComplete?: () => void;
  className?: string;
}
