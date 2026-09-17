import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Flame,
  Clock,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Copy,
  CheckCircle2,
  FileText,
  Trash2,
  ChevronDown,
  ArrowDownRight,
  MousePointer,
  Eye,
  X,
  Target,
  BookOpen,
} from 'lucide-react';
import {
  getAllTrackedProjects,
  getUxProjectSummary,
  type SectionHeatPoint,
} from '../../cms/repositories/uxAnalyticsRepository';
import {
  generateAiUxCritique,
  generateExecutiveCritiqueMarkdown,
} from '../../cms/services/aiUxCritiqueService';
import { resetUxTelemetry } from '../../lib/uxTelemetry';

export const AdminUxLab: React.FC = () => {
  const allProjects = useMemo(() => getAllTrackedProjects(), []);
  const [selectedSlug, setSelectedSlug] = useState<string>('agent-handoff');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SectionHeatPoint | null>(null);

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshTick((t) => t + 1);
      setIsRefreshing(false);
      showToast('Đã làm mới dữ liệu UX Lab');
    }, 400);
  };

  const handleReset = () => {
    resetUxTelemetry();
    setShowResetModal(false);
    setRefreshTick((t) => t + 1);
    setSelectedSection(null);
    showToast('Đã làm sạch toàn bộ dữ liệu đo lường UX');
  };

  // Aggregated data for selected project
  const summary = useMemo(() => {
    void refreshTick;
    return getUxProjectSummary(selectedSlug, timeRange);
  }, [selectedSlug, timeRange, refreshTick]);

  // AI Critique generated dynamically
  const critique = useMemo(() => {
    return generateAiUxCritique(summary);
  }, [summary]);

  // Markdown report content
  const reportMarkdown = useMemo(() => {
    return generateExecutiveCritiqueMarkdown(critique, summary);
  }, [critique, summary]);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportMarkdown);
      setIsCopied(true);
      showToast('Đã sao chép Báo cáo UX vào clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      showToast('Không thể sao chép báo cáo');
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl backdrop-blur-xl border border-emerald-500/30 bg-slate-900/90 text-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Top Header & Controls ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>First-Party UX Telemetry</span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Zero-PII · &lt; 3KB Script</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>UX Intelligence Lab</span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              Grade {critique.grade}
            </span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {/* AI Executive Report Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI UX Critique</span>
          </button>

          {/* Safe Reset Data */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-rose-300/40 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Xóa cache đo lường UX"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ─── Case Study Selector & Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Case Study:
          </span>
          <div className="relative">
            <select
              value={selectedSlug}
              onChange={(e) => {
                setSelectedSlug(e.target.value);
                setSelectedSection(null);
              }}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {allProjects.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} ({p.slug})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60">
          {(['24h', '7d', '30d', 'all'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                timeRange === range
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ─── KPI Metrics Overview ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Total Readers */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-medium">Độc giả tiếp cận</span>
            <Eye className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {summary.totalReaders}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Phiên đọc ghi nhận thực</p>
        </div>

        {/* Metric 2: Avg Dwell Time */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-medium">Thời gian đọc TB</span>
            <Clock className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {summary.avgDwellSeconds}s
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.avgDwellSeconds >= 60 ? 'Mức độ nghiên cứu sâu' : 'Đọc lướt trọng tâm'}
          </p>
        </div>

        {/* Metric 3: Completion Rate */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-medium">Tỷ lệ đọc hết bài</span>
            <Target className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {summary.completionRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Chạm tới phần Impact/CTA</p>
        </div>

        {/* Metric 4: Deep Readers */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-medium">Deep Readers</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {summary.segmentation.deepReaderPct}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">&gt;90s nghiên cứu kỹ</p>
        </div>

        {/* Metric 5: Friction Alerts */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur-md col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-medium">Cảnh báo nghẽn UX</span>
            <AlertTriangle className={`w-4 h-4 ${summary.frictionAlerts.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {summary.frictionAlerts.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Rage Clicks / Dead clicks</p>
        </div>
      </div>

      {/* ─── Reader Segmentation Bar ─── */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700 dark:text-slate-300">Phân Khúc Độc Giả (Reading Personas)</span>
          <span className="font-mono text-slate-400">Total: {summary.totalReaders} sessions</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          <div
            style={{ width: `${summary.segmentation.skimmerPct}%` }}
            className="bg-sky-500 transition-all duration-500"
            title={`Skimmers: ${summary.segmentation.skimmerPct}%`}
          />
          <div
            style={{ width: `${summary.segmentation.scannerPct}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Scanners: ${summary.segmentation.scannerPct}%`}
          />
          <div
            style={{ width: `${summary.segmentation.deepReaderPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Deep Readers: ${summary.segmentation.deepReaderPct}%`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Skimmers (&lt;30s): {summary.segmentation.skimmerPct}% ({summary.segmentation.skimmers})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Scanners (30-90s): {summary.segmentation.scannerPct}% ({summary.segmentation.scanners})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Deep Readers (&gt;90s): {summary.segmentation.deepReaderPct}% ({summary.segmentation.deepReaders})</span>
          </div>
        </div>
      </div>

      {/* ─── Attention Heat Strip (Section Reading Intensity) ─── */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Attention Heat Strip (Thanh Đo Độ Nóng Nội Dung)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Phản ánh trực quan thời gian mắt độc giả dừng lại tại từng phần trong Case Study.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-400" /> Lướt (&lt;25)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Ấm (25-49)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Nóng (50-74)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Bùng nổ (75+)</span>
          </div>
        </div>

        {/* Heat Strip Visual Ruler */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {summary.heatMap.map((sec) => {
              let bg = 'bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400';
              if (sec.heatLevel === 'blazing') bg = 'bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400';
              else if (sec.heatLevel === 'hot') bg = 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400';
              else if (sec.heatLevel === 'warm') bg = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400';

              const isSelected = selectedSection?.sectionId === sec.sectionId;

              return (
                <button
                  key={sec.sectionId}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${bg} ${
                    isSelected ? 'ring-2 ring-emerald-500 scale-[1.02] shadow-lg' : 'hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono opacity-80 mb-1">
                    <span>Part {sec.sectionOrder + 1}</span>
                    <span className="font-bold">{sec.heatScore}/100</span>
                  </div>
                  <div className="text-xs font-bold truncate" title={sec.sectionName}>
                    {sec.sectionName}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                    <span>TB: {sec.avgDwellSeconds}s</span>
                    {sec.dropOffRate > 0 && (
                      <span className="text-rose-500 flex items-center gap-0.5" title="Tỷ lệ rơi rụng sang phần kế tiếp">
                        <ArrowDownRight className="w-3 h-3" />
                        -{sec.dropOffRate}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector when clicking a section */}
          {selectedSection && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-mono text-emerald-500 font-bold uppercase tracking-wider">
                  Chi tiết phần:
                </span>{' '}
                <strong className="text-slate-900 dark:text-white font-semibold">
                  {selectedSection.sectionName}
                </strong>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Tổng thời lượng hiển thị trên màn hình độc giả: {Math.round(selectedSection.dwellTimeMs / 1000)} giây.
                </p>
              </div>
              <div className="flex items-center gap-4 font-mono text-slate-600 dark:text-slate-300">
                <div>Chỉ số nhiệt: <strong>{selectedSection.heatScore}/100</strong></div>
                <div>Tỷ lệ rời đi sau phần này: <strong className="text-rose-400">{selectedSection.dropOffRate}%</strong></div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ─── Reading Funnel & Friction Radar Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Reading Drop-off Funnel */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-500" />
              <span>Phễu Đọc Giữ Chân (Reading Retention Funnel)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Baseline: 100%</span>
          </div>

          <div className="space-y-3">
            {summary.readingFunnel.map((step) => (
              <div key={step.sectionId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]">
                    {step.sectionName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{step.readersReached} đọc</span>
                    <span className="font-bold text-slate-900 dark:text-white">{step.retentionRate}%</span>
                  </div>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${step.retentionRate}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      step.retentionRate >= 60
                        ? 'bg-emerald-500'
                        : step.retentionRate >= 30
                        ? 'bg-sky-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Friction Radar */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Điểm Nghẽn UX (Friction Radar)</span>
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              {summary.frictionAlerts.length} phát hiện
            </span>
          </div>

          {summary.frictionAlerts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-mono space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-slate-700 dark:text-slate-300 font-semibold">Trải nghiệm hoàn hảo (Zero Friction)</p>
              <p>Chưa ghi nhận bất kỳ Rage Click hoặc nhấp lỗi nào trên bài viết này.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {summary.frictionAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <MousePointer className="w-3.5 h-3.5" />
                      {alert.eventType === 'rage_click' ? 'Rage Click' : 'Dead Click'} ({alert.occurrences}x)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(alert.lastSeen).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                    Element: <code className="text-emerald-500">{alert.targetSelector || alert.targetTag}</code>{' '}
                    {alert.targetText && `"${alert.targetText}"`}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    <strong>Đề xuất sửa:</strong> {alert.suggestedFix}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── AI UX Critique Cards ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Khuyến Nghị Thiết Kế UX Từ Trí Tuệ Nhân Tạo (AI Design Critique)
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-500 font-medium">Heuristic Design VP Model</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {critique.critiques.map((c, idx) => {
            let badgeBg = 'bg-sky-500/10 text-sky-500 border-sky-500/20';
            if (c.severity === 'high') badgeBg = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            else if (c.severity === 'medium') badgeBg = 'bg-amber-500/10 text-amber-500 border-amber-500/20';

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${badgeBg}`}>
                      {c.severity} Severity
                    </span>
                    <span className="text-xs font-mono text-slate-400">Card 0{idx + 1}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {c.diagnosis}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    Actionable Polish:
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    {c.actionableFix}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Executive Report Modal ─── */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Báo Cáo Phân Tích UX Thực Nghiệm (Markdown)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 whitespace-pre-wrap select-all custom-scrollbar">
                {reportMarkdown}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Dùng để gửi nhà tuyển dụng hoặc đính kèm vào Case Study
                </span>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Đã sao chép' : 'Sao chép Markdown'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Reset Confirmation Modal ─── */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md p-6 rounded-3xl border border-rose-500/30 bg-white dark:bg-slate-900 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <Trash2 className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Xác nhận Reset dữ liệu UX?
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Hành động này sẽ xóa toàn bộ số liệu thời gian đọc section, session và cảnh báo Rage Click đã lưu trong bộ nhớ cục bộ. Bạn có chắc chắn muốn làm mới?
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-colors"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
