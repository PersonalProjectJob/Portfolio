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

const HEARTBEAT_INTERVAL_MS = 60000; // 1-minute active reader pulse cadence

class UxCollector {
  private currentSession: UxSession | null = null;
  private activePageSlug = '';
  private sectionMap = new Map<Element, SectionTrackingState>();
  private observer: IntersectionObserver | null = null;
  private clickHistory: ClickHistoryItem[] = [];
  private clickListener: ((e: MouseEvent) => void) | null = null;
  private scrollListener: ((e: Event) => void) | null = null;
  private visibilityListener: (() => void) | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;

  public init(options: InitUxTelemetryOptions): UxSession {
    const isSameSlug = this.activePageSlug === options.pageSlug;
    const now = Date.now();

    // Fast remount resume (React 18 Strict Mode protection within 3 seconds)
    const canResume = Boolean(
      this.currentSession &&
      isSameSlug &&
      !options.forceNewSession &&
      now - (this.currentSession?.updatedAt || 0) < 3000
    );

    this.activePageSlug = options.pageSlug;

    if (!canResume || !this.currentSession) {
      const token = generateId();
      const device = detectUxDevice();
      const width = typeof window !== 'undefined' ? window.innerWidth : 1440;
      const height = typeof window !== 'undefined' ? window.innerHeight : 900;
      const path = typeof window !== 'undefined' ? window.location.pathname : `/project/${options.pageSlug}`;
      const referrer = typeof document !== 'undefined' ? document.referrer : undefined;

      this.currentSession = {
        id: generateId(),
        sessionToken: token,
        pageSlug: options.pageSlug,
        deviceType: device,
        viewportWidth: width,
        viewportHeight: height,
        entryPath: path,
        referrer,
        totalDurationMs: 0,
        maxScrollDepth: 0,
        readerType: 'skimmer',
        createdAt: now,
        updatedAt: now,
      };

      uxDispatcher.persistSession(this.currentSession);
    }

    this.setupRageClickDetection();
    this.setupScrollDepthTracking();
    this.setupVisibilityGuard();
    this.setupActiveHeartbeat();
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

                if (dwell >= 300) {
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

    const initialDwell = inView ? 1500 : 0;

    const state: SectionTrackingState = {
      sectionId,
      sectionOrder,
      enterTime: inView ? Date.now() : null,
      totalDwellMs: initialDwell,
      interacted: false,
    };

    this.sectionMap.set(element, state);
    this.observer.observe(element);

    // Initial presence handshake: if section is immediately in view on mount (e.g. Hero), record instant baseline
    if (inView && this.currentSession) {
      this.recordSectionDwell(state);
      this.currentSession.totalDurationMs = Math.max(this.currentSession.totalDurationMs, 2000);
      this.currentSession.updatedAt = Date.now();
      uxDispatcher.persistSession(this.currentSession);
      uxDispatcher.flush();
    }
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

  /**
   * Active Reader Pulse (1-minute cadence):
   * Accumulates real reading minutes for the section currently in the viewport
   */
  private setupActiveHeartbeat(): void {
    if (typeof window === 'undefined' || this.heartbeatTimer) return;

    this.heartbeatTimer = setInterval(() => {
      // Pause cadence when tab is hidden
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      const now = Date.now();
      let hasActiveSection = false;

      for (const state of this.sectionMap.values()) {
        if (state.enterTime) {
          const dwell = now - state.enterTime;
          state.totalDwellMs += dwell;
          state.enterTime = now; // reset milestone for next minute
          this.recordSectionDwell(state);
          hasActiveSection = true;
        }
      }

      if (hasActiveSection && this.currentSession) {
        this.currentSession.totalDurationMs = Math.max(
          this.currentSession.totalDurationMs,
          now - this.currentSession.createdAt
        );
        this.currentSession.updatedAt = now;

        // Classify reader persona based on accumulated reading time
        if (this.currentSession.totalDurationMs < 30000) {
          this.currentSession.readerType = 'skimmer';
        } else if (this.currentSession.totalDurationMs < 90000) {
          this.currentSession.readerType = 'scanner';
        } else {
          this.currentSession.readerType = 'deep_reader';
        }

        uxDispatcher.persistSession(this.currentSession);
        uxDispatcher.flush();
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  /**
   * Visibility guard: flushes active dwell immediately when tab is hidden or navigated away
   */
  private setupVisibilityGuard(): void {
    if (typeof document === 'undefined' || this.visibilityListener) return;

    this.visibilityListener = () => {
      const now = Date.now();
      if (document.visibilityState === 'hidden') {
        // Tab backgrounded: freeze and commit dwell
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

        uxDispatcher.flush();
      } else {
        // Tab foregrounded: re-initialize active sections in viewport
        for (const [el, state] of this.sectionMap.entries()) {
          const inView =
            el.getBoundingClientRect &&
            el.getBoundingClientRect().top < (window.innerHeight || 800) &&
            el.getBoundingClientRect().bottom > 0;
          if (inView) {
            state.enterTime = now;
          }
        }
      }
    };

    document.addEventListener('visibilitychange', this.visibilityListener);
    window.addEventListener('pagehide', this.visibilityListener);
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

          this.clickHistory = [];
        }
      }
    };

    window.addEventListener('click', this.clickListener, { passive: true });
  }

  /**
   * Window Capture Scroll Tracker:
   * Captures scroll events from ANY nested element (.custom-scrollbar, main, body, window)
   * using DOM Level 3 capture phase without coupling to DOM selectors.
   */
  private setupScrollDepthTracking(): void {
    if (typeof window === 'undefined' || this.scrollListener) return;

    let maxScroll = 0;
    this.scrollListener = (e: Event) => {
      const target = (e.target === document ? document.documentElement : e.target) as HTMLElement;
      if (!target) return;

      const scrollHeight = (target.scrollHeight || document.documentElement.scrollHeight) - (target.clientHeight || window.innerHeight);
      if (scrollHeight <= 0) return;

      const scrollTop = target.scrollTop ?? window.scrollY ?? 0;
      const currentScroll = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));

      if (currentScroll > maxScroll) {
        maxScroll = currentScroll;
        if (this.currentSession) {
          this.currentSession.maxScrollDepth = maxScroll;
          uxDispatcher.persistSession(this.currentSession);
        }
      }
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true, capture: true });
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

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

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

    if (this.scrollListener && typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.scrollListener, { capture: true });
      this.scrollListener = null;
    }

    if (this.visibilityListener && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityListener);
      window.removeEventListener('pagehide', this.visibilityListener);
      this.visibilityListener = null;
    }

    uxDispatcher.flush();
    this.isInitialized = false;
  }
}

export const uxCollector = new UxCollector();
