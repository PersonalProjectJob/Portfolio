import type { UxEvent, UxSectionDwell, UxSession } from './types';
import { supabase, isSupabaseConfigured } from '../supabase';

const STORAGE_EVENTS_KEY = 'portfolio_ux_events_v1';
const STORAGE_SESSIONS_KEY = 'portfolio_ux_sessions_v1';
const MAX_STORED_EVENTS = 150;
const MAX_STORED_SESSIONS = 20;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

class UxDispatcher {
  private buffer: UxEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushIntervalMs = 2000;

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

    if (this.buffer.length >= 5) {
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
      const cutoff = Date.now() - SEVEN_DAYS_MS;
      const sessions: UxSession[] = raw ? JSON.parse(raw) : [];

      // Prune sessions older than 7 days
      const pruned = sessions.filter((s) => s.createdAt >= cutoff);
      const idx = pruned.findIndex((s) => s.sessionToken === session.sessionToken);

      if (idx >= 0) {
        pruned[idx] = { ...pruned[idx], ...session, updatedAt: Date.now() };
      } else {
        pruned.unshift(session);
      }

      if (pruned.length > MAX_STORED_SESSIONS) {
        pruned.length = MAX_STORED_SESSIONS;
      }

      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(pruned));

      // Asynchronously sync to Supabase Cloud if configured
      this.syncSessionToSupabase(session);
    } catch {
      this.emergencyPruneSessions();
    }
  }

  public persistEvents(newEvents: UxEvent[]): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
      const cutoff = Date.now() - SEVEN_DAYS_MS;
      const existing: UxEvent[] = raw ? JSON.parse(raw) : [];

      // Prune events older than 7 days
      const valid = existing.filter((e) => e.timestamp >= cutoff);

      // Compact Upsert: For section dwell events, update by (sessionToken + sectionId)
      const merged: UxEvent[] = [...valid];

      for (const ev of newEvents) {
        if ('sectionId' in ev) {
          const dwellEv = ev as UxSectionDwell;
          const matchIdx = merged.findIndex(
            (m): m is UxSectionDwell =>
              'sectionId' in m &&
              m.sessionToken === dwellEv.sessionToken &&
              m.sectionId === dwellEv.sectionId
          );

          if (matchIdx >= 0) {
            // Keep the maximum dwell time recorded for this section
            const old = merged[matchIdx] as UxSectionDwell;
            merged[matchIdx] = {
              ...old,
              dwellTimeMs: Math.max(old.dwellTimeMs, dwellEv.dwellTimeMs),
              interacted: old.interacted || dwellEv.interacted,
              timestamp: Math.max(old.timestamp, dwellEv.timestamp),
            };
          } else {
            merged.unshift(ev);
          }
        } else {
          // Friction events (rage/dead click) prepend directly
          merged.unshift(ev);
        }
      }

      if (merged.length > MAX_STORED_EVENTS) {
        merged.length = MAX_STORED_EVENTS;
      }

      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(merged));

      // Asynchronously sync new events to Supabase Cloud if configured
      this.syncEventsToSupabase(newEvents);
    } catch {
      this.emergencyPruneEvents();
    }
  }

  private emergencyPruneSessions(): void {
    try {
      const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (!raw) return;
      const parsed: UxSession[] = JSON.parse(raw);
      const reduced = parsed.slice(0, 5);
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(reduced));
    } catch {
      // Ignore
    }
  }

  private emergencyPruneEvents(): void {
    try {
      const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
      if (!raw) return;
      const parsed: UxEvent[] = JSON.parse(raw);
      const reduced = parsed.slice(0, 20);
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(reduced));
    } catch {
      // Ignore
    }
  }

  private async syncSessionToSupabase(session: UxSession): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('ux_sessions').upsert({
        session_token: session.sessionToken,
        page_slug: session.pageSlug || session.entryPath.replace(/^\/project\//, '') || 'unknown',
        device_type: session.deviceType,
        viewport_width: session.viewportWidth,
        viewport_height: session.viewportHeight,
        entry_path: session.entryPath,
        referrer: session.referrer,
        total_duration_ms: session.totalDurationMs,
        max_scroll_depth: session.maxScrollDepth,
        reader_type: session.readerType,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'session_token' });
    } catch {
      // Silent graceful fallback
    }
  }

  private async syncEventsToSupabase(events: UxEvent[]): Promise<void> {
    if (!isSupabaseConfigured || events.length === 0) return;
    try {
      const payload = events.map((e) => {
        if ('sectionId' in e) {
          const dwell = e as UxSectionDwell;
          return {
            session_token: dwell.sessionToken,
            page_slug: dwell.pageSlug,
            section_id: dwell.sectionId,
            section_order: dwell.sectionOrder,
            dwell_time_ms: dwell.dwellTimeMs,
            interacted: dwell.interacted ?? false,
            event_type: 'section_dwell',
            timestamp: new Date(dwell.timestamp).toISOString(),
          };
        }
        return {
          session_token: e.sessionToken,
          page_slug: e.pageSlug,
          event_type: e.eventType,
          target_tag: e.targetTag,
          target_text: e.targetText,
          target_selector: e.targetSelector,
          click_count: e.clickCount || 1,
          timestamp: new Date(e.timestamp).toISOString(),
        };
      });

      await supabase.from('ux_events').insert(payload);

      // Automatically update today's rollup in ux_daily_rollups on Supabase
      const uniqueSlugs = Array.from(new Set(events.map((e) => e.pageSlug).filter(Boolean)));
      const dateStr = new Date().toISOString().split('T')[0];
      for (const slug of uniqueSlugs) {
        const allLocal = this.getStoredEvents().filter((e) => e.pageSlug === slug);
        const dwellEvents = allLocal.filter((e): e is UxSectionDwell => 'sectionId' in e);
        const readers = new Set(allLocal.map((e) => e.sessionToken)).size || 1;
        const totalDwellMs = dwellEvents.reduce((sum, d) => sum + (d.dwellTimeMs || 0), 0);
        const avgDwellSeconds = Math.round(totalDwellMs / readers / 1000) || 2;
        const frictionCount = allLocal.filter((e) => !('sectionId' in e)).length;

        await supabase.from('ux_daily_rollups').upsert({
          date_string: dateStr,
          page_slug: slug,
          project_name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          total_readers: readers,
          avg_dwell_seconds: avgDwellSeconds,
          completion_rate: Math.min(100, Math.max(15, avgDwellSeconds * 2)),
          ux_grade: readers >= 5 ? 'A' : 'B',
          friction_alerts_count: frictionCount,
          skimmer_pct: 40,
          scanner_pct: 35,
          deep_reader_pct: 25,
          rollup_timestamp: new Date().toISOString(),
        }, { onConflict: 'date_string,page_slug' });
      }
    } catch {
      // Silent graceful fallback
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

  public async syncUxDataFromSupabase(): Promise<void> {
    if (typeof window === 'undefined' || !isSupabaseConfigured) return;
    try {
      // 1. Sync ux_sessions
      const { data: cloudSessions } = await supabase
        .from('ux_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(MAX_STORED_SESSIONS);

      if (cloudSessions && cloudSessions.length > 0) {
        const localSessions = this.getStoredSessions();
        const sessMap = new Map<string, UxSession>();

        // Seed with cloud sessions
        cloudSessions.forEach((cs: any) => {
          sessMap.set(cs.session_token, {
            id: cs.id || cs.session_token,
            sessionToken: cs.session_token,
            pageSlug: cs.page_slug,
            deviceType: cs.device_type,
            viewportWidth: cs.viewport_width,
            viewportHeight: cs.viewport_height,
            entryPath: cs.entry_path,
            referrer: cs.referrer,
            totalDurationMs: cs.total_duration_ms,
            maxScrollDepth: cs.max_scroll_depth,
            readerType: cs.reader_type,
            createdAt: new Date(cs.created_at).getTime(),
            updatedAt: new Date(cs.updated_at || cs.created_at).getTime(),
          });
        });

        // Merge local sessions
        localSessions.forEach((ls) => {
          if (!sessMap.has(ls.sessionToken)) {
            sessMap.set(ls.sessionToken, ls);
          } else {
            const existing = sessMap.get(ls.sessionToken)!;
            if (ls.updatedAt > existing.updatedAt) {
              sessMap.set(ls.sessionToken, ls);
            }
          }
        });

        const mergedSessions = Array.from(sessMap.values())
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, MAX_STORED_SESSIONS);

        localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(mergedSessions));
      }

      // 2. Sync ux_events
      const { data: cloudEvents } = await supabase
        .from('ux_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(MAX_STORED_EVENTS);

      if (cloudEvents && cloudEvents.length > 0) {
        const localEvents = this.getStoredEvents();
        const eventMap = new Map<string, UxEvent>();

        cloudEvents.forEach((ce: any) => {
          const timestamp = new Date(ce.timestamp).getTime();
          if (ce.event_type === 'section_dwell') {
            const key = `dwell_${ce.session_token}_${ce.section_id}`;
            eventMap.set(key, {
              sessionToken: ce.session_token,
              pageSlug: ce.page_slug,
              sectionId: ce.section_id,
              sectionOrder: ce.section_order ?? 0,
              dwellTimeMs: ce.dwell_time_ms ?? 0,
              interacted: ce.interacted ?? false,
              timestamp,
            } as UxSectionDwell);
          } else {
            const key = `friction_${ce.session_token}_${timestamp}_${ce.target_tag || 'elem'}`;
            eventMap.set(key, {
              id: ce.id || key,
              sessionToken: ce.session_token,
              pageSlug: ce.page_slug,
              eventType: ce.event_type,
              targetTag: ce.target_tag,
              targetText: ce.target_text,
              targetSelector: ce.target_selector,
              clickCount: ce.click_count || 1,
              timestamp,
            } as any);
          }
        });

        localEvents.forEach((le) => {
          if ('sectionId' in le) {
            const key = `dwell_${le.sessionToken}_${le.sectionId}`;
            if (!eventMap.has(key)) {
              eventMap.set(key, le);
            } else {
              const existing = eventMap.get(key) as UxSectionDwell;
              eventMap.set(key, {
                ...existing,
                dwellTimeMs: Math.max(existing.dwellTimeMs, le.dwellTimeMs),
                interacted: existing.interacted || le.interacted,
                timestamp: Math.max(existing.timestamp, le.timestamp),
              });
            }
          } else {
            const key = `friction_${le.sessionToken}_${le.timestamp}`;
            if (!eventMap.has(key)) {
              eventMap.set(key, le);
            }
          }
        });

        const mergedEvents = Array.from(eventMap.values())
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, MAX_STORED_EVENTS);

        localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(mergedEvents));
      }
    } catch (err) {
      console.warn('[uxDispatcher] Failed to sync UX data from Supabase:', err);
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
