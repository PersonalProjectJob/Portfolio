import { getStoredUxEvents, getStoredUxSessions, type UxFrictionEvent, type UxSectionDwell, type DailyUxRollup } from '../../lib/uxTelemetry';
import { PROJECT_NAME_MAP } from '../../utils/analytics';
import { getLocalPostViewEvents } from './trackingRepository';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface SectionHeatPoint {
  sectionId: string;
  sectionName: string;
  sectionOrder: number;
  dwellTimeMs: number;
  avgDwellSeconds: number;
  heatScore: number; // 0 - 100
  heatLevel: 'cold' | 'warm' | 'hot' | 'blazing';
  dropOffRate: number; // % who left after this section
}

export interface UxFunnelStep {
  sectionId: string;
  sectionName: string;
  stepOrder: number;
  readersReached: number;
  retentionRate: number; // 0 - 100%
  dropOffCount: number;
}

export interface UxFrictionAlert {
  id: string;
  eventType: 'rage_click' | 'dead_click';
  pageSlug: string;
  targetTag: string;
  targetText: string;
  targetSelector: string;
  clickCount: number;
  occurrences: number;
  lastSeen: number;
  suggestedFix: string;
}

export interface ReaderSegmentation {
  skimmers: number;
  scanners: number;
  deepReaders: number;
  skimmerPct: number;
  scannerPct: number;
  deepReaderPct: number;
}

export interface UxProjectSummary {
  pageSlug: string;
  projectName: string;
  timeRange: '24h' | '7d' | '30d' | 'all';
  totalReaders: number;
  avgDwellSeconds: number;
  completionRate: number;
  maxScrollDepthAvg: number;
  segmentation: ReaderSegmentation;
  heatMap: SectionHeatPoint[];
  readingFunnel: UxFunnelStep[];
  frictionAlerts: UxFrictionAlert[];
}

const SECTION_NAME_DICTIONARY: Record<string, string> = {
  hero: '01. Hero & Overview',
  problem_statement: '02. Problem Framing',
  problem: '02. Problem Framing',
  system_architecture: '03. System Architecture & Flow',
  architecture: '03. System Architecture & Flow',
  interaction_protocol: '04. Interaction Protocols',
  solution: '04. Solution & Components',
  prototype: '05. Interactive Prototype & Demos',
  impact_metrics: '06. Business Impact & Metrics',
  impact: '06. Business Impact & Metrics',
  chapter_00_hero: 'Chapter 00: Herobanner',
  chapter_01_identity: 'Chapter 01: Profile Identity',
  chapter_02_mosaic_projects: 'Chapter 02: Case Studies Grid',
  chapter_03_craft_matrix: 'Chapter 03: Skills & Mastery',
  chapter_04_contact_hub: 'Chapter 04: Conversion & Contact',
};

function formatSectionName(id: string): string {
  return SECTION_NAME_DICTIONARY[id] || id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTimeRangeCutoff(timeRange: '24h' | '7d' | '30d' | 'all'): number {
  if (timeRange === 'all') return 0;
  const now = Date.now();
  if (timeRange === '24h') return now - 24 * 60 * 60 * 1000;
  if (timeRange === '7d') return now - 7 * 24 * 60 * 60 * 1000;
  return now - 30 * 24 * 60 * 60 * 1000;
}

export function getAllTrackedProjects(): Array<{ slug: string; name: string }> {
  return Object.entries(PROJECT_NAME_MAP).map(([slug, name]) => ({
    slug,
    name,
  }));
}

export function getFrictionAlerts(pageSlug?: string): UxFrictionAlert[] {
  const events = getStoredUxEvents();
  const frictionEvents = events.filter(
    (e): e is UxFrictionEvent => 'eventType' in e && (e.eventType === 'rage_click' || e.eventType === 'dead_click')
  );

  const filtered = pageSlug
    ? frictionEvents.filter((e) => e.pageSlug === pageSlug)
    : frictionEvents;

  const map = new Map<string, UxFrictionAlert>();

  for (const ev of filtered) {
    const key = `${ev.eventType}_${ev.pageSlug}_${ev.targetSelector || ev.targetTag || 'unknown'}_${ev.targetText || ''}`;
    const existing = map.get(key);

    let suggestedFix = 'Review element affordance and cursor styling.';
    if (ev.eventType === 'rage_click') {
      suggestedFix = ev.targetTag === 'IMG' || ev.targetTag === 'DIV'
        ? 'User attempted multiple clicks on visual asset. Consider adding a Click-to-Zoom lightbox.'
        : 'Action button unresponsive or loading state missing. Add active click feedback.';
    } else if (ev.eventType === 'dead_click') {
      suggestedFix = 'Element looks clickable but has no interactive handler. Remove pointer cursor or bind action.';
    }

    if (existing) {
      existing.occurrences += 1;
      existing.clickCount = Math.max(existing.clickCount, ev.clickCount || 1);
      existing.lastSeen = Math.max(existing.lastSeen, ev.timestamp);
    } else {
      map.set(key, {
        id: ev.id,
        eventType: ev.eventType as 'rage_click' | 'dead_click',
        pageSlug: ev.pageSlug,
        targetTag: ev.targetTag || 'ELEMENT',
        targetText: ev.targetText || '',
        targetSelector: ev.targetSelector || '',
        clickCount: ev.clickCount || 1,
        occurrences: 1,
        lastSeen: ev.timestamp,
        suggestedFix,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.occurrences - a.occurrences);
}

export function getSectionHeatMap(pageSlug: string, timeRange: '24h' | '7d' | '30d' | 'all' = 'all'): SectionHeatPoint[] {
  const cutoff = getTimeRangeCutoff(timeRange);
  const events = getStoredUxEvents();

  const dwellEvents = events.filter(
    (e): e is UxSectionDwell =>
      'dwellTimeMs' in e &&
      e.pageSlug === pageSlug &&
      e.timestamp >= cutoff
  );

  const defaults = ['hero', 'problem_statement', 'system_architecture', 'interaction_protocol', 'impact_metrics'];

  if (dwellEvents.length === 0) {
    return defaults.map((sec, idx) => ({
      sectionId: sec,
      sectionName: formatSectionName(sec),
      sectionOrder: idx,
      dwellTimeMs: 0,
      avgDwellSeconds: 0,
      heatScore: 0,
      heatLevel: 'cold',
      dropOffRate: 0,
    }));
  }

  // Aggregate by sectionId using max dwell per session token to prevent double-counting
  const sectionSessionMap = new Map<string, Map<string, number>>();
  const sectionOrderMap = new Map<string, number>();

  for (const ev of dwellEvents) {
    if (!sectionSessionMap.has(ev.sectionId)) {
      sectionSessionMap.set(ev.sectionId, new Map());
      sectionOrderMap.set(ev.sectionId, ev.sectionOrder);
    }
    const sessMap = sectionSessionMap.get(ev.sectionId)!;
    const current = sessMap.get(ev.sessionToken) || 0;
    sessMap.set(ev.sessionToken, Math.max(current, ev.dwellTimeMs));
  }

  // Ensure default sections are present in heat map order
  for (let i = 0; i < defaults.length; i++) {
    const sec = defaults[i];
    if (!sectionSessionMap.has(sec)) {
      sectionSessionMap.set(sec, new Map());
      sectionOrderMap.set(sec, i);
    }
  }

  const items = Array.from(sectionSessionMap.entries()).map(([sectionId, sessMap]) => {
    let totalMs = 0;
    for (const dwell of sessMap.values()) {
      totalMs += dwell;
    }
    const count = sessMap.size || 1;
    return {
      sectionId,
      sectionName: formatSectionName(sectionId),
      sectionOrder: sectionOrderMap.get(sectionId) ?? 0,
      dwellTimeMs: totalMs,
      avgDwellSeconds: Math.round(totalMs / count / 1000),
    };
  });

  items.sort((a, b) => a.sectionOrder - b.sectionOrder);

  const maxDwell = Math.max(...items.map((i) => i.dwellTimeMs), 1);

  return items.map((item, idx, arr) => {
    const heatScore = item.dwellTimeMs > 0 ? Math.round((item.dwellTimeMs / maxDwell) * 100) : 0;
    let heatLevel: 'cold' | 'warm' | 'hot' | 'blazing' = 'cold';
    if (heatScore >= 75) heatLevel = 'blazing';
    else if (heatScore >= 50) heatLevel = 'hot';
    else if (heatScore >= 25) heatLevel = 'warm';

    const nextItem = arr[idx + 1];
    const dropOffRate = nextItem && item.dwellTimeMs > 0
      ? Math.max(0, Math.round(((item.dwellTimeMs - nextItem.dwellTimeMs) / item.dwellTimeMs) * 100))
      : 0;

    return {
      ...item,
      heatScore,
      heatLevel,
      dropOffRate,
    };
  });
}

export function getUxReadingFunnel(pageSlug: string, timeRange: '24h' | '7d' | '30d' | 'all' = 'all'): UxFunnelStep[] {
  const heatMap = getSectionHeatMap(pageSlug, timeRange);
  const events = getStoredUxEvents();
  const cutoff = getTimeRangeCutoff(timeRange);

  const sectionSessionMap = new Map<string, Set<string>>();

  for (const ev of events) {
    if ('sectionId' in ev && ev.pageSlug === pageSlug && ev.timestamp >= cutoff) {
      if (!sectionSessionMap.has(ev.sectionId)) {
        sectionSessionMap.set(ev.sectionId, new Set());
      }
      sectionSessionMap.get(ev.sectionId)!.add(ev.sessionToken);
    }
  }

  const allSessions = new Set(
    events
      .filter((e) => 'pageSlug' in e && e.pageSlug === pageSlug && e.timestamp >= cutoff)
      .map((e) => e.sessionToken)
  );

  const totalBase = Math.max(allSessions.size, 1);

  return heatMap.map((sec, idx, arr) => {
    const sessionCount = sectionSessionMap.get(sec.sectionId)?.size || (idx === 0 ? allSessions.size : 0);
    const retentionRate = Math.round((sessionCount / totalBase) * 100);
    const nextStep = arr[idx + 1];
    const nextCount = nextStep ? (sectionSessionMap.get(nextStep.sectionId)?.size || 0) : 0;
    const dropOffCount = Math.max(0, sessionCount - nextCount);

    return {
      sectionId: sec.sectionId,
      sectionName: sec.sectionName,
      stepOrder: sec.sectionOrder,
      readersReached: sessionCount,
      retentionRate,
      dropOffCount,
    };
  });
}

export function getUxProjectSummary(pageSlug: string, timeRange: '24h' | '7d' | '30d' | 'all' = 'all'): UxProjectSummary {
  const cutoff = getTimeRangeCutoff(timeRange);
  const allSessions = getStoredUxSessions();
  const sessions = allSessions.filter((s) => s.createdAt >= cutoff);

  // Filter sessions specifically mapped to this case study
  const projectSessions = sessions.filter(
    (s) => s.pageSlug === pageSlug || (s.entryPath && s.entryPath.includes(pageSlug))
  );

  // Cross-reference first-party post views
  const postViews = getLocalPostViewEvents().filter(
    (pv) => pv.projectId === pageSlug && (cutoff === 0 || new Date(pv.timestamp).getTime() >= cutoff)
  );

  const heatMap = getSectionHeatMap(pageSlug, timeRange);
  const readingFunnel = getUxReadingFunnel(pageSlug, timeRange);
  const frictionAlerts = getFrictionAlerts(pageSlug);

  // Reconcile total readers from 3 truth sources (Funnel Readers, Project Sessions, First-Party Post Views)
  const funnelReaders = readingFunnel[0]?.readersReached || 0;
  const totalReaders = Math.max(funnelReaders, projectSessions.length, postViews.length);

  let totalDwellMs = 0;
  for (const s of heatMap) {
    totalDwellMs += s.dwellTimeMs;
  }

  // If heatMap has dwell, calculate avg; if reader visited but heatMap is cold, supply realistic reading average
  let avgDwellSeconds = totalReaders > 0 ? Math.round(totalDwellMs / totalReaders / 1000) : 0;
  if (avgDwellSeconds === 0 && totalReaders > 0) {
    const sessionDwells = projectSessions.map((s) => s.totalDurationMs).filter((d) => d > 0);
    if (sessionDwells.length > 0) {
      avgDwellSeconds = Math.round(sessionDwells.reduce((a, b) => a + b, 0) / sessionDwells.length / 1000);
    } else {
      avgDwellSeconds = 3; // Baseline presence duration
    }
  }

  // Completion rate: % who reached the final section of reading funnel
  const lastStep = readingFunnel[readingFunnel.length - 1];
  const firstStep = readingFunnel[0];
  const completionRate = firstStep && firstStep.readersReached > 0 && lastStep
    ? Math.round((lastStep.readersReached / firstStep.readersReached) * 100)
    : 0;

  // Reader segmentation
  let skimmers = 0;
  let scanners = 0;
  let deepReaders = 0;

  const segmentationPool = projectSessions.length > 0 ? projectSessions : sessions;

  for (const sess of segmentationPool) {
    if (sess.totalDurationMs < 30000 || sess.readerType === 'skimmer') {
      skimmers++;
    } else if (sess.totalDurationMs < 90000 || sess.readerType === 'scanner') {
      scanners++;
    } else {
      deepReaders++;
    }
  }

  // Fallback: If postViews exist but sessions have not yet classified, ensure total equals totalReaders
  const currentSum = skimmers + scanners + deepReaders;
  if (currentSum === 0 && totalReaders > 0) {
    skimmers = totalReaders;
  }

  const segTotal = Math.max(skimmers + scanners + deepReaders, 1);
  const segmentation: ReaderSegmentation = {
    skimmers,
    scanners,
    deepReaders,
    skimmerPct: Math.round((skimmers / segTotal) * 100),
    scannerPct: Math.round((scanners / segTotal) * 100),
    deepReaderPct: Math.round((deepReaders / segTotal) * 100),
  };

  const avgScroll = segmentationPool.length > 0
    ? Math.round(segmentationPool.reduce((acc, s) => acc + s.maxScrollDepth, 0) / segmentationPool.length)
    : 0;

  const projectName = PROJECT_NAME_MAP[pageSlug] || pageSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    pageSlug,
    projectName,
    timeRange,
    totalReaders,
    avgDwellSeconds,
    completionRate,
    maxScrollDepthAvg: avgScroll,
    segmentation,
    heatMap,
    readingFunnel,
    frictionAlerts,
  };
}

/**
 * Daily Executive Rollup (00:01 AM Cadence):
 * Calculates and freezes daily summary for a given case study and date
 */
export function getDailyUxRollup(pageSlug: string, targetDate?: string): DailyUxRollup {
  const summary = getUxProjectSummary(pageSlug, '24h');
  const dateStr = targetDate || new Date().toISOString().split('T')[0];

  let uxGrade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B';
  if (summary.totalReaders >= 10 && summary.completionRate >= 50 && summary.avgDwellSeconds >= 60) {
    uxGrade = 'A+';
  } else if (summary.totalReaders >= 5 && summary.avgDwellSeconds >= 30) {
    uxGrade = 'A';
  } else if (summary.totalReaders >= 1) {
    uxGrade = 'B';
  } else {
    uxGrade = 'C';
  }

  return {
    id: `rollup_${pageSlug}_${dateStr}`,
    dateString: dateStr,
    pageSlug,
    projectName: summary.projectName,
    totalReaders: summary.totalReaders,
    avgDwellSeconds: summary.avgDwellSeconds,
    completionRate: summary.completionRate,
    uxGrade,
    frictionAlertsCount: summary.frictionAlerts.length,
    skimmerPct: summary.segmentation.skimmerPct,
    scannerPct: summary.segmentation.scannerPct,
    deepReaderPct: summary.segmentation.deepReaderPct,
    rollupTimestamp: Date.now(),
  };
}

/**
 * Computes and upserts today's (or targetDate's) daily rollup into Supabase table `ux_daily_rollups`.
 */
export async function syncDailyUxRollupToSupabase(pageSlug: string, targetDate?: string): Promise<void> {
  if (typeof window === 'undefined' || !isSupabaseConfigured) return;
  try {
    const rollup = getDailyUxRollup(pageSlug, targetDate);
    await supabase.from('ux_daily_rollups').upsert({
      date_string: rollup.dateString,
      page_slug: rollup.pageSlug,
      project_name: rollup.projectName,
      total_readers: rollup.totalReaders,
      avg_dwell_seconds: rollup.avgDwellSeconds,
      completion_rate: rollup.completionRate,
      ux_grade: rollup.uxGrade,
      friction_alerts_count: rollup.frictionAlertsCount,
      skimmer_pct: rollup.skimmerPct,
      scanner_pct: rollup.scannerPct,
      deep_reader_pct: rollup.deepReaderPct,
      rollup_timestamp: new Date(rollup.rollupTimestamp).toISOString(),
    }, { onConflict: 'date_string,page_slug' });
  } catch (err) {
    console.warn('[uxAnalyticsRepository] Failed to sync daily rollup to Supabase:', err);
  }
}

/**
 * Computes and upserts daily rollups for ALL tracked projects into Supabase `ux_daily_rollups`.
 * Ensures the table is fully populated and up-to-date with ground truth.
 */
export async function syncAllDailyRollupsToSupabase(targetDate?: string): Promise<void> {
  if (typeof window === 'undefined' || !isSupabaseConfigured) return;
  const projects = getAllTrackedProjects();
  try {
    await Promise.allSettled(
      projects.map((p) => syncDailyUxRollupToSupabase(p.slug, targetDate))
    );
  } catch (err) {
    console.warn('[uxAnalyticsRepository] Failed to sync all daily rollups:', err);
  }
}

/**
 * Reads daily rollups directly from Supabase table `ux_daily_rollups`.
 */
export async function getCloudDailyUxRollups(targetDate?: string): Promise<DailyUxRollup[]> {
  if (!isSupabaseConfigured) return [];
  try {
    let query = supabase.from('ux_daily_rollups').select('*');
    if (targetDate) {
      query = query.eq('date_string', targetDate);
    } else {
      query = query.order('date_string', { ascending: false }).limit(50);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row: any) => ({
      id: row.id,
      dateString: row.date_string,
      pageSlug: row.page_slug,
      projectName: row.project_name,
      totalReaders: row.total_readers,
      avgDwellSeconds: row.avg_dwell_seconds,
      completionRate: row.completion_rate,
      uxGrade: row.ux_grade,
      frictionAlertsCount: row.friction_alerts_count,
      skimmerPct: row.skimmer_pct,
      scannerPct: row.scanner_pct,
      deepReaderPct: row.deep_reader_pct,
      rollupTimestamp: new Date(row.rollup_timestamp).getTime(),
    }));
  } catch {
    return [];
  }
}
