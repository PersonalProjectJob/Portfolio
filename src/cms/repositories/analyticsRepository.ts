import {
  getLocalCachedTrackingLinks,
  getLocalClickEvents,
  resetAllTrackingStats,
  type ClickEvent,
} from './trackingRepository';

export type AnalyticsTimeRange = '24h' | '7d' | '30d' | 'all';

export interface ChannelStat {
  key: string;
  name: string;
  source: string;
  medium: string;
  clicks: number;
  percentage: number;
  color: string;
}

export interface TimelinePoint {
  label: string;
  dateKey: string;
  clicks: number;
  desktopClicks: number;
  mobileClicks: number;
}

export interface DeviceSplit {
  desktop: number;
  mobile: number;
  tablet: number;
  desktopPct: number;
  mobilePct: number;
}

export interface TopLinkStat {
  id: string;
  slug: string;
  destination_path: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string | null;
  clicks_count: number;
  percentage: number;
  is_active: boolean;
  last_clicked_at: string | null;
}

export interface AnalyticsOverview {
  totalClicks: number;
  activeLinksCount: number;
  totalLinksCount: number;
  topChannel: {
    name: string;
    source: string;
    clicks: number;
    percentage: number;
  } | null;
  deviceSplit: DeviceSplit;
  recruiterIntentScore: number;
  recruiterIntentTier: 'High' | 'Moderate' | 'Warm' | 'Baseline';
}

const CHANNEL_METADATA: Record<string, { name: string; color: string }> = {
  linkedin: { name: 'LinkedIn', color: '#0284c7' }, // sky-600
  zalo: { name: 'Zalo', color: '#0d9488' }, // teal-600
  recruiter_email: { name: 'Recruiter Email', color: '#f59e0b' }, // amber-500
  cv: { name: 'CV / Resume PDF', color: '#a855f7' }, // purple-500
  qr: { name: 'QR Code Offline', color: '#10b981' }, // emerald-500
  facebook: { name: 'Facebook', color: '#6366f1' }, // indigo-500
  telegram: { name: 'Telegram', color: '#38bdf8' }, // sky-400
  twitter: { name: 'X (Twitter)', color: '#94a3b8' }, // slate-400
  threads: { name: 'Threads', color: '#8b5cf6' }, // violet-500
  discord: { name: 'Discord', color: '#6366f1' }, // indigo-500
};

/**
 * Filter events within the specified time range
 */
function filterEventsByRange(events: ClickEvent[], range: AnalyticsTimeRange): ClickEvent[] {
  if (range === 'all') return events;
  const now = Date.now();
  const rangeMs =
    range === '24h'
      ? 24 * 60 * 60 * 1000
      : range === '7d'
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;

  return events.filter((e) => {
    const time = new Date(e.timestamp).getTime();
    return !isNaN(time) && now - time <= rangeMs;
  });
}

/**
 * Calculates high-level KPI overview
 */
export function getAnalyticsOverview(range: AnalyticsTimeRange = 'all'): AnalyticsOverview {
  const allLinks = getLocalCachedTrackingLinks();
  const allEvents = getLocalClickEvents();
  const filteredEvents = filterEventsByRange(allEvents, range);

  // If there are recorded events, use event count; otherwise sum link clicks
  const totalClicks =
    filteredEvents.length > 0
      ? filteredEvents.length
      : allLinks.reduce((sum, l) => sum + (l.clicks_count || 0), 0);

  const activeLinks = allLinks.filter((l) => l.is_active);

  // Device split
  let desktop = 0;
  let mobile = 0;
  let tablet = 0;

  filteredEvents.forEach((e) => {
    if (e.device_type === 'mobile') mobile += 1;
    else if (e.device_type === 'tablet') tablet += 1;
    else desktop += 1;
  });

  const totalDeviceEvents = desktop + mobile + tablet;
  const desktopPct = totalDeviceEvents > 0 ? Math.round((desktop / totalDeviceEvents) * 100) : 50;
  const mobilePct = totalDeviceEvents > 0 ? Math.round(((mobile + tablet) / totalDeviceEvents) * 100) : 50;

  // Channel calculation
  const channelCounts: Record<string, number> = {};
  if (filteredEvents.length > 0) {
    filteredEvents.forEach((e) => {
      const src = e.utm_source?.toLowerCase() || 'other';
      channelCounts[src] = (channelCounts[src] || 0) + 1;
    });
  } else {
    allLinks.forEach((l) => {
      const src = l.utm_source?.toLowerCase() || 'other';
      channelCounts[src] = (channelCounts[src] || 0) + (l.clicks_count || 0);
    });
  }

  let topSource = '';
  let topClicks = 0;
  Object.entries(channelCounts).forEach(([src, clicks]) => {
    if (clicks > topClicks) {
      topClicks = clicks;
      topSource = src;
    }
  });

  const topChannel =
    topSource && totalClicks > 0
      ? {
          name: CHANNEL_METADATA[topSource]?.name || topSource,
          source: topSource,
          clicks: topClicks,
          percentage: Math.round((topClicks / totalClicks) * 100),
        }
      : null;

  // Recruiter Intent Score: weighted scoring favoring direct recruiter channels
  // Weights: recruiter_email (35), cv (25), linkedin (15), others (5)
  let weightedScore = 0;
  if (totalClicks > 0) {
    const recruiterClicks = channelCounts['recruiter_email'] || 0;
    const cvClicks = channelCounts['cv'] || 0;
    const linkedinClicks = channelCounts['linkedin'] || 0;
    const otherClicks = totalClicks - (recruiterClicks + cvClicks + linkedinClicks);

    weightedScore = Math.min(
      100,
      Math.round(
        (recruiterClicks * 35 + cvClicks * 25 + linkedinClicks * 15 + Math.max(0, otherClicks) * 5) /
          Math.max(1, totalClicks * 0.4)
      )
    );
  }

  let recruiterIntentTier: 'High' | 'Moderate' | 'Warm' | 'Baseline' = 'Baseline';
  if (weightedScore >= 75) recruiterIntentTier = 'High';
  else if (weightedScore >= 50) recruiterIntentTier = 'Moderate';
  else if (weightedScore >= 20) recruiterIntentTier = 'Warm';

  return {
    totalClicks,
    activeLinksCount: activeLinks.length,
    totalLinksCount: allLinks.length,
    topChannel,
    deviceSplit: {
      desktop,
      mobile,
      tablet,
      desktopPct,
      mobilePct,
    },
    recruiterIntentScore: weightedScore,
    recruiterIntentTier,
  };
}

/**
 * Groups click events into timeline buckets for SVG charting
 */
export function getTimelineStats(range: AnalyticsTimeRange = '7d'): TimelinePoint[] {
  const allEvents = getLocalClickEvents();
  const now = new Date();

  // For 24h: 6 buckets of 4 hours
  if (range === '24h') {
    const points: TimelinePoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const bucketDate = new Date(now.getTime() - i * 4 * 60 * 60 * 1000);
      const hours = bucketDate.getHours().toString().padStart(2, '0');
      const label = `${hours}:00`;
      const dateKey = `${bucketDate.getMonth() + 1}/${bucketDate.getDate()} ${hours}:00`;

      const bucketStart = bucketDate.getTime() - 2 * 60 * 60 * 1000;
      const bucketEnd = bucketDate.getTime() + 2 * 60 * 60 * 1000;

      let clicks = 0;
      let mobileClicks = 0;
      let desktopClicks = 0;

      allEvents.forEach((e) => {
        const t = new Date(e.timestamp).getTime();
        if (t >= bucketStart && t <= bucketEnd) {
          clicks += 1;
          if (e.device_type === 'mobile' || e.device_type === 'tablet') mobileClicks += 1;
          else desktopClicks += 1;
        }
      });

      points.push({ label, dateKey, clicks, mobileClicks, desktopClicks });
    }
    return points;
  }

  // For 7d or 30d or all: daily buckets
  const daysCount = range === '7d' ? 7 : range === '30d' ? 30 : 14;
  const points: TimelinePoint[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayStr = `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
    const isoDayStr = targetDate.toISOString().slice(0, 10);

    let clicks = 0;
    let mobileClicks = 0;
    let desktopClicks = 0;

    allEvents.forEach((e) => {
      if (e.timestamp && e.timestamp.startsWith(isoDayStr)) {
        clicks += 1;
        if (e.device_type === 'mobile' || e.device_type === 'tablet') mobileClicks += 1;
        else desktopClicks += 1;
      }
    });

    points.push({
      label: dayStr,
      dateKey: isoDayStr,
      clicks,
      mobileClicks,
      desktopClicks,
    });
  }

  return points;
}

/**
 * Returns breakdown across distinct UTM channels
 */
export function getChannelBreakdown(range: AnalyticsTimeRange = 'all'): ChannelStat[] {
  const allLinks = getLocalCachedTrackingLinks();
  const allEvents = filterEventsByRange(getLocalClickEvents(), range);

  const channelMap: Record<
    string,
    { source: string; medium: string; clicks: number }
  > = {};

  if (allEvents.length > 0) {
    allEvents.forEach((e) => {
      const src = e.utm_source?.toLowerCase() || 'unknown';
      if (!channelMap[src]) {
        channelMap[src] = {
          source: src,
          medium: e.utm_medium || 'referral',
          clicks: 0,
        };
      }
      channelMap[src].clicks += 1;
    });
  } else {
    allLinks.forEach((l) => {
      const src = l.utm_source?.toLowerCase() || 'unknown';
      if (!channelMap[src]) {
        channelMap[src] = {
          source: src,
          medium: l.utm_medium || 'referral',
          clicks: 0,
        };
      }
      channelMap[src].clicks += l.clicks_count || 0;
    });
  }

  const total = Object.values(channelMap).reduce((sum, item) => sum + item.clicks, 0);

  return Object.entries(channelMap)
    .map(([key, data]) => {
      const meta = CHANNEL_METADATA[key] || {
        name: key.charAt(0).toUpperCase() + key.slice(1),
        color: '#64748b',
      };
      return {
        key,
        name: meta.name,
        source: data.source,
        medium: data.medium,
        clicks: data.clicks,
        percentage: total > 0 ? Math.round((data.clicks / total) * 100) : 0,
        color: meta.color,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);
}

/**
 * Returns ranked tracking links by click volume
 */
export function getTopTrackingLinks(): TopLinkStat[] {
  const allLinks = getLocalCachedTrackingLinks();
  const allEvents = getLocalClickEvents();

  const total = allLinks.reduce((sum, l) => sum + (l.clicks_count || 0), 0);

  // Map last clicked time from events
  const lastClickedMap: Record<string, string> = {};
  allEvents.forEach((e) => {
    const slug = e.slug?.toLowerCase();
    if (slug && (!lastClickedMap[slug] || e.timestamp > lastClickedMap[slug])) {
      lastClickedMap[slug] = e.timestamp;
    }
  });

  return allLinks
    .map((l) => ({
      id: l.id,
      slug: l.slug,
      destination_path: l.destination_path,
      utm_source: l.utm_source,
      utm_medium: l.utm_medium,
      utm_campaign: l.utm_campaign || null,
      clicks_count: l.clicks_count || 0,
      percentage: total > 0 ? Math.round(((l.clicks_count || 0) / total) * 100) : 0,
      is_active: l.is_active,
      last_clicked_at: lastClickedMap[l.slug.toLowerCase()] || l.updated_at || null,
    }))
    .sort((a, b) => b.clicks_count - a.clicks_count);
}

/**
 * Returns latest click events stream
 */
export function getRecentClickEvents(limit = 20): ClickEvent[] {
  const events = getLocalClickEvents();
  return events.slice(0, limit);
}

/**
 * Clears all analytics data and resets click counters
 */
export async function resetAllAnalyticsData(): Promise<boolean> {
  return resetAllTrackingStats();
}
