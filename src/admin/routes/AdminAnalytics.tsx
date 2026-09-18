import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  MousePointerClick,
  Smartphone,
  Laptop,
  Share2,
  RefreshCw,
  Copy,
  CheckCircle2,
  FileText,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Clock,
  Radio,
  X,
  Layers,
  Eye,
  ExternalLink,
} from 'lucide-react';
import {
  getAnalyticsOverview,
  getTimelineStats,
  getChannelBreakdown,
  getTopTrackingLinks,
  getTopViewedCaseStudies,
  getUnifiedRecentEvents,
  resetAllAnalyticsData,
  type AnalyticsTimeRange,
  type TimelinePoint,
} from '../../cms/repositories/analyticsRepository';

import {
  generateAiInsights,
  generateExecutiveMarkdownReport,
  type AiInsightDeck,
} from '../../cms/services/aiAnalystService';

export const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('7d');
  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [leaderboardTab, setLeaderboardTab] = useState<'case_studies' | 'shortlinks'>('case_studies');

  // Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Chart hover state
  const [activePoint, setActivePoint] = useState<TimelinePoint | null>(null);

  // Memoized data states - derived synchronously from repository
  const overview = useMemo(() => {
    void refreshTick;
    return getAnalyticsOverview(timeRange);
  }, [timeRange, refreshTick]);

  const timeline = useMemo(() => {
    void refreshTick;
    return getTimelineStats(timeRange);
  }, [timeRange, refreshTick]);

  const channels = useMemo(() => {
    void refreshTick;
    return getChannelBreakdown(timeRange);
  }, [timeRange, refreshTick]);

  const topLinks = useMemo(() => {
    void refreshTick;
    return getTopTrackingLinks();
  }, [refreshTick]);

  const topCaseStudies = useMemo(() => {
    void refreshTick;
    return getTopViewedCaseStudies(timeRange);
  }, [timeRange, refreshTick]);

  const recentUnifiedEvents = useMemo(() => {
    void refreshTick;
    return getUnifiedRecentEvents(20);
  }, [refreshTick]);



  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshTick((t) => t + 1);
      setIsRefreshing(false);
      showToast('Analytics and AI insights synchronized with live telemetry.');
    }, 300);
  };

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tnsthao94.online';
    const url = `${origin}/r/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedSlug(slug);
    showToast(`Copied shortlink /r/${slug} to clipboard!`);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetAllAnalyticsData();
      setRefreshTick((t) => t + 1);
      setShowResetModal(false);
      showToast('All tracking counters and click logs have been reset to 0.');
    } catch {
      showToast('Failed to reset analytics data.');
    } finally {
      setIsResetting(false);
    }
  };

  // Generate AI Insights Deck dynamically
  const aiDeck: AiInsightDeck = useMemo(() => {
    return generateAiInsights(overview, channels, topLinks);
  }, [overview, channels, topLinks]);

  // Generate Executive Report Markdown
  const markdownReport = useMemo(() => {
    return generateExecutiveMarkdownReport(overview, channels, topLinks, timeRange);
  }, [overview, channels, topLinks, timeRange]);

  const handleCopyReport = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(markdownReport);
      showToast('AI Executive Report copied to clipboard!');
    }
  };

  // SVG Chart Dimensions & Computations
  const maxActivity = Math.max(1, ...timeline.map((p) => (p.clicks || 0) + (p.postViews || 0)));
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 30;

  const pointsString = timeline
    .map((p, idx) => {
      const total = (p.clicks || 0) + (p.postViews || 0);
      const x = paddingX + (idx / Math.max(1, timeline.length - 1)) * (svgWidth - paddingX * 2);
      const y = svgHeight - paddingY - (total / maxActivity) * (svgHeight - paddingY * 2);
      return `${x},${y}`;
    })
    .join(' ');


  const areaString =
    timeline.length > 0
      ? `${paddingX},${svgHeight - paddingY} ${pointsString} ${svgWidth - paddingX},${svgHeight - paddingY}`
      : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8 max-w-7xl mx-auto pb-16"
    >
      {/* ─── Toast Feedback ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/95 border border-teal-500/40 text-teal-300 text-xs font-semibold shadow-2xl backdrop-blur-xl"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header & Time Controls ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              AI Real-time Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[11px] font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Real-time attribution, recruiter intent scoring, and deterministic AI strategic insights.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time range pills */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
            {(['24h', '7d', '30d', 'all'] as AnalyticsTimeRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === '24h' ? '24 Hours' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
          </button>

          {/* AI Executive Report Trigger */}
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>AI Executive Report</span>
          </button>

          {/* Reset Clean Data */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
            title="Reset counter & clear test events"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── AI Executive Insights Deck ─── */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-slate-900/80 to-slate-950 p-6 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-center justify-between gap-4 mb-5 relative z-10 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                AI Strategic Insights Deck
              </h2>
              <p className="text-xs text-slate-400">
                Automated heuristic evaluation • Zero external API dependency
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Recruiter Health Index:</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                overview.recruiterIntentScore >= 70
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : overview.recruiterIntentScore >= 40
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {overview.recruiterIntentScore}/100 • {overview.recruiterIntentTier}
            </span>
          </div>
        </div>

        {/* 3 AI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {/* 1. Driver Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-teal-500/30 p-4 space-y-2.5 flex flex-col justify-between hover:border-teal-500/50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md border ${aiDeck.driver.badgeColor}`}>
                  {aiDeck.driver.tag}
                </span>
                <TrendingUp className="w-4 h-4 text-teal-400" />
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{aiDeck.driver.title}</h3>
              <p className="text-xs text-teal-300 font-mono">{aiDeck.driver.subtitle}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{aiDeck.driver.description}</p>
            </div>
            {aiDeck.driver.metricHighlight && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Metric Highlight:</span>
                <span className="font-mono font-bold text-teal-300">{aiDeck.driver.metricHighlight}</span>
              </div>
            )}
          </div>

          {/* 2. Friction Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-4 space-y-2.5 flex flex-col justify-between hover:border-amber-500/50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md border ${aiDeck.friction.badgeColor}`}>
                  {aiDeck.friction.tag}
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{aiDeck.friction.title}</h3>
              <p className="text-xs text-amber-300 font-mono">{aiDeck.friction.subtitle}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{aiDeck.friction.description}</p>
            </div>
            {aiDeck.friction.actionableFix && (
              <div className="pt-2 border-t border-slate-800 text-xs text-amber-300/90 font-medium">
                👉 {aiDeck.friction.actionableFix}
              </div>
            )}
          </div>

          {/* 3. Recommendation Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-indigo-500/30 p-4 space-y-2.5 flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md border ${aiDeck.recommendation.badgeColor}`}>
                  {aiDeck.recommendation.tag}
                </span>
                <Lightbulb className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{aiDeck.recommendation.title}</h3>
              <p className="text-xs text-indigo-300 font-mono">{aiDeck.recommendation.subtitle}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{aiDeck.recommendation.description}</p>
            </div>
            {aiDeck.recommendation.actionableText && (
              <div className="pt-2 border-t border-slate-800 text-xs text-indigo-300 font-semibold flex items-center gap-1">
                <span>{aiDeck.recommendation.actionableText}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Metric Cards Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Case Study Post Views */}
        <div className="rounded-2xl p-5 bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
              Case Study Views
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white font-display">{overview.totalPostViews}</p>
            <span className="text-xs text-indigo-300 font-mono">reads</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {overview.topPost ? (
              <span>Top: <strong className="text-indigo-300 font-semibold">{overview.topPost.projectName}</strong></span>
            ) : (
              <span>Chưa có lượt xem</span>
            )}
          </p>
        </div>

        {/* Card 2: Total Real Clicks */}
        <div className="rounded-2xl p-5 bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
              Total Link Clicks
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>

          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white font-display">{overview.totalClicks}</p>
            <span className="text-xs text-slate-500">inbound</span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-teal-400 font-semibold">{overview.activeLinksCount}</span> active tracking links
          </p>
        </div>

        {/* Card 2: Recruiter Intent Score */}
        <div className="rounded-2xl p-5 bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
              Recruiter Intent
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white font-display">{overview.recruiterIntentScore}</p>
            <span className="text-xs font-mono text-indigo-300">/100</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Tier: <span className="font-semibold text-indigo-300">{overview.recruiterIntentTier}</span>
          </p>
        </div>

        {/* Card 3: Top Channel */}
        <div className="rounded-2xl p-5 bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
              Top Channel
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-white font-display truncate">
              {overview.topChannel ? overview.topChannel.name : 'Chưa có click'}
            </p>
            <p className="text-xs text-amber-300 font-mono mt-0.5">
              {overview.topChannel ? `${overview.topChannel.percentage}% of total` : '0%'}
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            {overview.topChannel ? `${overview.topChannel.clicks} inbound clicks` : 'Chờ phân phối'}
          </p>
        </div>

        {/* Card 4: Device Split */}
        <div className="rounded-2xl p-5 bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
              Device Telemetry
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Laptop className="w-3.5 h-3.5 text-sky-400" />
              <span>Desktop:</span>
              <span className="font-mono font-bold text-white">{overview.deviceSplit.desktopPct}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Mobile:</span>
              <span className="font-mono font-bold text-white">{overview.deviceSplit.mobilePct}%</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${overview.deviceSplit.desktopPct}%` }}
              className="h-full bg-sky-500 transition-all duration-500"
              title={`Desktop: ${overview.deviceSplit.desktopPct}%`}
            />
            <div
              style={{ width: `${overview.deviceSplit.mobilePct}%` }}
              className="h-full bg-purple-500 transition-all duration-500"
              title={`Mobile: ${overview.deviceSplit.mobilePct}%`}
            />
          </div>
        </div>
      </div>

      {/* ─── Visual Charts Grid (SVG Interactive Charts) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timeline Area Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-bold text-white tracking-wide font-display">
                Clicks Trend Over Time
              </h2>
            </div>
            {activePoint && (
              <span className="text-xs font-mono text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                {activePoint.dateKey}: {activePoint.clicks} clicks • {activePoint.postViews || 0} views ({activePoint.desktopClicks} desktop, {activePoint.mobileClicks} mobile)
              </span>
            )}
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full h-[200px] flex items-center justify-center">
            {overview.totalClicks === 0 && overview.totalPostViews === 0 ? (
              <div className="text-center text-slate-500 text-xs space-y-1">
                <p className="font-semibold text-slate-400">Chưa ghi nhận clicks hoặc views trong khoảng thời gian này</p>
                <p>Biểu đồ thời gian thực sẽ tự động vẽ ngay khi có lượt truy cập đầu tiên.</p>
              </div>
            ) : (
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#334155" strokeDasharray="3 3" opacity={0.3} />
                <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#334155" strokeDasharray="3 3" opacity={0.3} />
                <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#334155" strokeDasharray="3 3" opacity={0.5} />

                {/* Area fill */}
                {areaString && (
                  <polygon points={areaString} fill="url(#areaGradient)" />
                )}

                {/* Line path */}
                {pointsString && (
                  <polyline
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsString}
                  />
                )}

                {/* Interactive Points */}
                {timeline.map((p, idx) => {
                  const total = (p.clicks || 0) + (p.postViews || 0);
                  const x = paddingX + (idx / Math.max(1, timeline.length - 1)) * (svgWidth - paddingX * 2);
                  const y = svgHeight - paddingY - (total / maxActivity) * (svgHeight - paddingY * 2);
                  const isHovered = activePoint?.label === p.label;


                  return (
                    <g key={p.label} className="cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 4}
                        fill={isHovered ? '#38bdf8' : '#14b8a6'}
                        stroke="#0f172a"
                        strokeWidth="2"
                        onMouseEnter={() => setActivePoint(p)}
                        onMouseLeave={() => setActivePoint(null)}
                      />
                      {/* Label on X axis */}
                      <text
                        x={x}
                        y={svgHeight - 10}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Right 1 Col: Channel Breakdown */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-bold text-white tracking-wide font-display">
                Channel Distribution
              </h2>
            </div>
            <p className="text-xs text-slate-400">Attribution share across marketing channels</p>
          </div>

          {/* Channel list with progress bars */}
          <div className="space-y-3 my-2 overflow-y-auto max-h-[180px] pr-1">
            {channels.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No channel data recorded yet.</p>
            ) : (
              channels.map((ch) => (
                <div key={ch.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{ch.name}</span>
                    <span className="font-mono text-slate-400">
                      {ch.clicks} clicks ({ch.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${ch.percentage}%`, backgroundColor: ch.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Active Channels:</span>
            <span className="font-mono text-teal-300 font-bold">{channels.filter((c) => c.clicks > 0).length} reporting</span>
          </div>
        </div>
      </div>

      {/* ─── Links & Case Studies Leaderboard & Live Stream Activity ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Table (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-display">
                    Performance Leaderboards
                  </h2>
                  <p className="text-[10px] text-slate-400 hidden sm:block">
                    Case Studies & Top Performing Shortlinks Leaderboard
                  </p>
                </div>

              </div>
              <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setLeaderboardTab('case_studies')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    leaderboardTab === 'case_studies'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Case Studies ({topCaseStudies.reduce((sum, c) => sum + c.viewsCount, 0)} views)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardTab('shortlinks')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    leaderboardTab === 'shortlinks'
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>Shortlinks ({topLinks.reduce((sum, l) => sum + l.clicks_count, 0)} clicks)</span>
                </button>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {leaderboardTab === 'case_studies' ? `${topCaseStudies.length} projects` : `${topLinks.length} links`}
            </span>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-x-auto max-h-[480px]">
            {leaderboardTab === 'case_studies' ? (
              topCaseStudies.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No case studies found.</div>
              ) : (
                topCaseStudies.map((c, idx) => (
                  <div
                    key={c.projectId}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-300 shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white truncate max-w-sm">
                            {c.projectName}
                          </h4>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            /project/{c.projectId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>Last viewed:</span>
                          <span className="font-mono text-slate-300">
                            {c.lastViewedAt ? new Date(c.lastViewedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 min-w-[85px]">
                        <p className="text-[10px] uppercase text-indigo-300 font-semibold flex items-center justify-end gap-1">
                          <Eye className="w-3 h-3" /> Views
                        </p>
                        <p className="text-base font-bold text-white font-mono">{c.viewsCount}</p>
                      </div>

                      <a
                        href={`/project/${c.projectId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-300 transition-colors"
                        title="View public case study"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))
              )
            ) : topLinks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No links registered.</div>
            ) : (
              topLinks.map((l) => (
                <div
                  key={l.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-teal-300 px-2.5 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                        /r/{l.slug}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {l.utm_source} • {l.utm_medium}
                      </span>
                      {l.is_active ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                          Paused
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                      <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">{l.destination_path}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right px-3 py-1 rounded-xl bg-slate-950/60 border border-slate-800 min-w-[70px]">
                      <p className="text-[10px] uppercase text-slate-500 font-semibold">Clicks</p>
                      <p className="text-sm font-bold text-white font-mono">{l.clicks_count}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(l.slug)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
                      title="Copy shortlink"
                    >
                      {copiedSlug === l.slug ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Stream Activity (1 col) */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white font-display">Live Inbound Activity Feed</h2>
            </div>
            <p className="text-xs text-slate-400">Real-time incoming post views & click stream</p>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1 divide-y divide-slate-800/40">
            {recentUnifiedEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-1">
                <Clock className="w-5 h-5 mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-slate-400">Chưa có sự kiện click hoặc view post thời gian thực</p>
                <p>Các lượt view post và click mới sẽ hiển thị tại đây với đầy đủ nguồn và thiết bị.</p>
              </div>
            ) : (
              recentUnifiedEvents.map((evt) => {
                const timeAgo = new Date(evt.timestamp).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                if (evt.eventType === 'post_view') {
                  return (
                    <div key={evt.id} className="pt-2.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px] shrink-0">
                            POST VIEW
                          </span>
                          <span className="font-semibold text-slate-200 truncate">{evt.projectName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{timeAgo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono truncate max-w-[120px]">
                          /project/{evt.projectId}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          {evt.device_type === 'mobile' ? (
                            <Smartphone className="w-3 h-3 text-purple-400" />
                          ) : (
                            <Laptop className="w-3 h-3 text-sky-400" />
                          )}
                          <span className="capitalize">{evt.device_type}</span>
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={evt.id} className="pt-2.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold text-[10px]">
                          CLICK
                        </span>
                        <span className="font-mono font-bold text-teal-300">/r/{evt.slug}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {evt.utm_source}
                      </span>
                      <span className="flex items-center gap-1">
                        {evt.device_type === 'mobile' ? (
                          <Smartphone className="w-3 h-3 text-purple-400" />
                        ) : (
                          <Laptop className="w-3 h-3 text-sky-400" />
                        )}
                        <span className="capitalize">{evt.device_type}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Buffer capacity:</span>
            <span className="font-mono text-slate-400">500 events</span>
          </div>
        </div>
      </div>


      {/* ─── Executive Report Modal ─── */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white font-display">
                    AI Strategic Executive Report
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Markdown view */}
              <div className="overflow-y-auto flex-1 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono space-y-3 whitespace-pre-wrap leading-relaxed">
                {markdownReport}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-500">Ready to export or send to hiring partners</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-900/30"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Markdown Report</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Reset Confirmation Modal ─── */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Xác nhận Reset Dữ liệu</h3>
                  <p className="text-xs text-slate-400">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Tất cả lượt click và nhật ký sự kiện kiểm thử sẽ được đưa về <strong>0</strong> để bắt đầu ghi nhận số liệu thực tế sạch sẽ.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  disabled={isResetting}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={isResetting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-900/30 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isResetting ? 'Đang reset...' : 'Xác nhận Reset về 0'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
