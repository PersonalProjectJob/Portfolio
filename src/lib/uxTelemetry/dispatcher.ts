import type { UxEvent, UxSession } from './types';

const STORAGE_EVENTS_KEY = 'portfolio_ux_events_v1';
const STORAGE_SESSIONS_KEY = 'portfolio_ux_sessions_v1';
const MAX_STORED_EVENTS = 1000;
const MAX_STORED_SESSIONS = 100;

class UxDispatcher {
  private buffer: UxEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushIntervalMs = 4000;

  constructor() {
    this.setupUnloadHandler();
  }

  private setupUnloadHandler(): void {
    if (typeof window !== 'undefined') {
      const flushNow = () => this.flush();
      window.addEventListener('beforeunload', flushNow);
      window.addEventListener('pagehide', flushNow);
    }
  }

  public enqueue(event: UxEvent): void {
    this.buffer.push(event);

    if (this.buffer.length >= 10) {
      this.flush();
      return;
    }

    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.flush();
      }, this.flushIntervalMs);
    }
  }

  public flush(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.buffer.length === 0) return;

    const toFlush = [...this.buffer];
    this.buffer = [];

    this.persistEvents(toFlush);
  }

  public persistSession(session: UxSession): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
      const sessions: UxSession[] = raw ? JSON.parse(raw) : [];
      const idx = sessions.findIndex((s) => s.sessionToken === session.sessionToken);

      if (idx >= 0) {
        sessions[idx] = { ...sessions[idx], ...session, updatedAt: Date.now() };
      } else {
        sessions.unshift(session);
      }

      if (sessions.length > MAX_STORED_SESSIONS) {
        sessions.length = MAX_STORED_SESSIONS;
      }

      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch {
      // Ignore storage quota errors
    }
  }

  private persistEvents(newEvents: UxEvent[]): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
      const existing: UxEvent[] = raw ? JSON.parse(raw) : [];
      const merged = [...newEvents, ...existing];

      if (merged.length > MAX_STORED_EVENTS) {
        merged.length = MAX_STORED_EVENTS;
      }

      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(merged));
    } catch {
      // Ignore storage quota errors
    }
  }

  public getStoredEvents(): UxEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getStoredSessions(): UxSession[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public reset(): void {
    this.buffer = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_EVENTS_KEY);
        localStorage.removeItem(STORAGE_SESSIONS_KEY);
      } catch {
        // Ignore
      }
    }
  }
}

export const uxDispatcher = new UxDispatcher();
