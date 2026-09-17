export type UxDeviceType = 'desktop' | 'tablet' | 'mobile';

export type UxReaderType = 'skimmer' | 'scanner' | 'deep_reader';

export type UxFrictionType = 'rage_click' | 'dead_click' | 'rapid_backtrack';

export interface UxSession {
  id: string;
  sessionToken: string;
  deviceType: UxDeviceType;
  viewportWidth: number;
  viewportHeight: number;
  browser?: string;
  entryPath: string;
  referrer?: string;
  totalDurationMs: number;
  maxScrollDepth: number; // 0 - 100
  readerType: UxReaderType;
  createdAt: number;
  updatedAt: number;
}

export interface UxSectionDwell {
  id: string;
  sessionToken: string;
  pageSlug: string;
  sectionId: string;
  sectionOrder: number;
  dwellTimeMs: number;
  interacted?: boolean;
  timestamp: number;
  eventType?: 'section_dwell';
}

export interface UxFrictionEvent {
  id: string;
  sessionToken: string;
  pageSlug: string;
  eventType: UxFrictionType;
  targetTag?: string;
  targetText?: string;
  targetSelector?: string;
  clickCount?: number;
  viewportX?: number;
  viewportY?: number;
  timestamp: number;
}

export type UxEvent = UxSectionDwell | UxFrictionEvent;

export interface InitUxTelemetryOptions {
  pageSlug: string;
  forceNewSession?: boolean;
  onFlush?: (events: UxEvent[]) => void;
}
