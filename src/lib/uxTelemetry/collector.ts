import { uxDispatcher } from './dispatcher';
import type {
  InitUxTelemetryOptions,
  UxDeviceType,
  UxFrictionEvent,
  UxSectionDwell,
  UxSession,
} from './types';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'ux_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}

export function detectUxDevice(): UxDeviceType {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width <= 640) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

interface SectionTrackingState {
  sectionId: string;
  sectionOrder: number;
  enterTime: number | null;
  totalDwellMs: number;
  interacted: boolean;
}

interface ClickHistoryItem {
  x: number;
  y: number;
  time: number;
  target: HTMLElement | null;
}

class UxCollector {
  private currentSession: UxSession | null = null;
  private activePageSlug = '';
  private sectionMap = new Map<Element, SectionTrackingState>();
  private observer: IntersectionObserver | null = null;
  private clickHistory: ClickHistoryItem[] = [];
  private clickListener: ((e: MouseEvent) => void) | null = null;
  private isInitialized = false;

  public init(options: InitUxTelemetryOptions): UxSession {
    this.activePageSlug = options.pageSlug;

    if (!this.currentSession || options.forceNewSession) {
      const token = generateId();
      const device = detectUxDevice();
      const width = typeof window !== 'undefined' ? window.innerWidth : 1440;
      const height = typeof window !== 'undefined' ? window.innerHeight : 900;
      const path = typeof window !== 'undefined' ? window.location.pathname : `/${options.pageSlug}`;
      const referrer = typeof document !== 'undefined' ? document.referrer : undefined;

      this.currentSession = {
        id: generateId(),
        sessionToken: token,
        deviceType: device,
        viewportWidth: width,
        viewportHeight: height,
        entryPath: path,
        referrer,
        totalDurationMs: 0,
        maxScrollDepth: 0,
        readerType: 'skimmer',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      uxDispatcher.persistSession(this.currentSession);
    }

    this.setupRageClickDetection();
    this.setupScrollDepthTracking();
    this.isInitialized = true;

    return this.currentSession;
  }

  public getSession(): UxSession | null {
    return this.currentSession;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public getSessionId(): string {
    return this.currentSession ? this.currentSession.sessionToken : 'anonymous';
  }

  public observeSection(element: Element, sectionId: string, sectionOrder: number): void {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          const now = Date.now();
          for (const entry of entries) {
            const state = this.sectionMap.get(entry.target);
            if (!state) continue;

            if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
              if (!state.enterTime) {
                state.enterTime = now;
              }
            } else {
              if (state.enterTime) {
                const dwell = now - state.enterTime;
                state.totalDwellMs += dwell;
                state.enterTime = null;

                if (dwell >= 400) {
                  this.recordSectionDwell(state);
                }
              }
            }
          }
        },
        { threshold: [0.2, 0.6] }
      );
    }

    const inView =
      typeof window !== 'undefined' &&
      element.getBoundingClientRect &&
      element.getBoundingClientRect().top < (window.innerHeight || 800) &&
      element.getBoundingClientRect().bottom > 0;

    this.sectionMap.set(element, {
      sectionId,
      sectionOrder,
      enterTime: inView ? Date.now() : null,
      totalDwellMs: 0,
      interacted: false,
    });

    this.observer.observe(element);
  }


  public recordSectionDwell(state: SectionTrackingState): void {
    if (!this.currentSession) return;

    const event: UxSectionDwell = {
      id: generateId(),
      sessionToken: this.currentSession.sessionToken,
      pageSlug: this.activePageSlug,
      sectionId: state.sectionId,
      sectionOrder: state.sectionOrder,
      dwellTimeMs: state.totalDwellMs,
      interacted: state.interacted,
      timestamp: Date.now(),
      eventType: 'section_dwell',
    };

    uxDispatcher.enqueue(event);
  }

  public recordUxEvent(data: {
    pageSlug: string;
    sectionId: string;
    sectionOrder: number;
    dwellTimeMs: number;
    interacted?: boolean;
  }): void {
    const sessionToken = this.currentSession ? this.currentSession.sessionToken : generateId();
    const event: UxSectionDwell = {
      id: generateId(),
      sessionToken,
      pageSlug: data.pageSlug,
      sectionId: data.sectionId,
      sectionOrder: data.sectionOrder,
      dwellTimeMs: data.dwellTimeMs,
      interacted: data.interacted ?? false,
      timestamp: Date.now(),
      eventType: 'section_dwell',
    };

    uxDispatcher.enqueue(event);
    uxDispatcher.flush();
  }

  public recordFrictionEvent(data: {
    pageSlug: string;
    eventType: 'rage_click' | 'dead_click' | 'rapid_backtrack';
    targetTag?: string;
    targetText?: string;
    targetSelector?: string;
    clickCount?: number;
    viewportX?: number;
    viewportY?: number;
  }): void {
    const sessionToken = this.currentSession ? this.currentSession.sessionToken : generateId();
    const event: UxFrictionEvent = {
      id: generateId(),
      sessionToken,
      pageSlug: data.pageSlug,
      eventType: data.eventType,
      targetTag: data.targetTag,
      targetText: data.targetText,
      targetSelector: data.targetSelector,
      clickCount: data.clickCount ?? 1,
      viewportX: data.viewportX,
      viewportY: data.viewportY,
      timestamp: Date.now(),
    };

    uxDispatcher.enqueue(event);
    uxDispatcher.flush();
  }

  private setupRageClickDetection(): void {
    if (typeof window === 'undefined' || this.clickListener) return;

    this.clickListener = (e: MouseEvent) => {
      const now = Date.now();
      const x = e.clientX;
      const y = e.clientY;
      const target = e.target as HTMLElement | null;

      this.clickHistory.push({ x, y, time: now, target });

      // Clean items older than 1000ms
      this.clickHistory = this.clickHistory.filter((item) => now - item.time <= 1000);

      // Check if 3+ clicks within 700ms in <= 35px radius
      const recent = this.clickHistory.filter((item) => now - item.time <= 700);
      if (recent.length >= 3) {
        const first = recent[0];
        const isCluster = recent.every(
          (item) => Math.hypot(item.x - first.x, item.y - first.y) <= 35
        );

        if (isCluster) {
          const targetTag = target ? target.tagName : 'UNKNOWN';
          const targetText = target ? (target.textContent || '').trim().substring(0, 40) : '';
          const targetSelector = target ? this.getShortSelector(target) : '';

          this.recordFrictionEvent({
            pageSlug: this.activePageSlug,
            eventType: 'rage_click',
            targetTag,
            targetText,
            targetSelector,
            clickCount: recent.length,
            viewportX: x,
            viewportY: y,
          });

          // Reset history after detecting to avoid spamming
          this.clickHistory = [];
        }
      }
    };

    window.addEventListener('click', this.clickListener, { passive: true });
  }

  private setupScrollDepthTracking(): void {
    if (typeof window === 'undefined') return;

    let maxScroll = 0;
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const currentScroll = Math.round((window.scrollY / docHeight) * 100);
      if (currentScroll > maxScroll) {
        maxScroll = currentScroll;
        if (this.currentSession) {
          this.currentSession.maxScrollDepth = maxScroll;
          uxDispatcher.persistSession(this.currentSession);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private getShortSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    if (el.className && typeof el.className === 'string') {
      const firstClass = el.className.split(' ')[0];
      if (firstClass) return `.${firstClass}`;
    }
    return el.tagName.toLowerCase();
  }

  public destroy(): void {
    const now = Date.now();
    for (const state of this.sectionMap.values()) {
      if (state.enterTime) {
        const dwell = now - state.enterTime;
        state.totalDwellMs += dwell;
        state.enterTime = null;
        if (state.totalDwellMs >= 300) {
          this.recordSectionDwell(state);
        }
      }
    }

    if (this.currentSession) {
      this.currentSession.totalDurationMs = Math.max(
        this.currentSession.totalDurationMs,
        now - this.currentSession.createdAt
      );
      this.currentSession.updatedAt = now;
      uxDispatcher.persistSession(this.currentSession);
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.sectionMap.clear();

    if (this.clickListener && typeof window !== 'undefined') {
      window.removeEventListener('click', this.clickListener);
      this.clickListener = null;
    }

    uxDispatcher.flush();
    this.isInitialized = false;
  }

}

export const uxCollector = new UxCollector();
