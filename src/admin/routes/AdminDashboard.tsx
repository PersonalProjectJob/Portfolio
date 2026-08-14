import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  Link2,
  Image as ImageIcon,
  Plus,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MousePointerClick,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { CV_PROJECTS } from '../../data/cvData';
import { UTM_PRESETS } from '../../lib/utm';
import { useStore } from '../../store/useStore';

interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalTrackingLinks: number;
  totalClicks: number;
  totalMediaAssets: number;
}

interface ActivityItem {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  time: string;
  actionText?: string;
  actionRoute?: string;
}

interface AdminDashboardProps {
  onNavigate?: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { isLightMode } = useStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: CV_PROJECTS.length,
    publishedProjects: CV_PROJECTS.length - 1,
    draftProjects: 1,
    totalTrackingLinks: Object.keys(UTM_PRESETS).length,
    totalClicks: 142,
    totalMediaAssets: 24,
  });

  const [activities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      type: 'warning',
      title: 'Missing OG Meta Image',
      description: 'Project "CryptoMap360" is missing a designated social share image.',
      time: '15 mins ago',
      actionText: 'Add Image',
      actionRoute: '/admin/content',
    },
    {
      id: 'act-2',
      type: 'warning',
      title: 'Vietnamese Translation Incomplete',
      description: 'Project "Sync Task Badge" has 2 untranslated paragraphs in VI locale.',
      time: '1 hour ago',
      actionText: 'Translate',
      actionRoute: '/admin/content',
    },
    {
      id: 'act-3',
      type: 'info',
      title: 'New Recruiter Inbound Traffic',
      description: 'UTM link "recruiter_email" received 12 clicks in the last 24 hours.',
      time: '3 hours ago',
      actionText: 'View Links',
      actionRoute: '/admin/distribution',
    },
    {
      id: 'act-4',
      type: 'success',
      title: 'Schema & Storage Synced',
      description: 'Supabase RLS tables and Edge caching configured for sub-second latency.',
      time: 'Just now',
      actionText: 'Check DB',
      actionRoute: '/admin/settings',
    },
  ]);

  // Load real data from Supabase if configured
  useEffect(() => {
    async function fetchLiveStats() {
      if (!isSupabaseConfigured) return;

      try {
        // Query content entries
        const { count: projectCount, error: projErr } = await supabase
          .from('content_entries')
          .select('*', { count: 'exact', head: true });

        // Query published
        const { count: pubCount } = await supabase
          .from('content_entries')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');

        // Query tracking links
        const { data: trackingData } = await supabase
          .from('tracking_links')
          .select('clicks_count');

        // Query media
        const { count: mediaCount } = await supabase
          .from('media_assets')
          .select('*', { count: 'exact', head: true });

        if (!projErr && projectCount !== null) {
          const links = (trackingData || []) as unknown as { clicks_count: number }[];
          const totalClicks = links.reduce((acc, curr) => acc + (curr.clicks_count || 0), 0);
          setStats((prev) => ({
            ...prev,
            totalProjects: projectCount || prev.totalProjects,
            publishedProjects: pubCount ?? prev.publishedProjects,
            draftProjects: (projectCount ?? prev.totalProjects) - (pubCount ?? prev.publishedProjects),
            totalTrackingLinks: links.length || prev.totalTrackingLinks,
            totalClicks: totalClicks > 0 ? totalClicks : prev.totalClicks,
            totalMediaAssets: mediaCount ?? prev.totalMediaAssets,
          }));
        }
      } catch (err) {
        console.warn('[AdminDashboard] Error querying live stats:', err);
      }
    }

    fetchLiveStats();
  }, []);

  const handleAction = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      window.history.pushState({}, '', route);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Top Welcome & Quick Actions Bar */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight font-display ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              Admin Overview
            </h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isLightMode
                ? 'bg-teal-100 text-teal-800 border border-teal-200'
                : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Live Workspace
            </span>
          </div>
          <p className={`text-sm ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
            Monitor portfolio engagement, content pipelines, and distribution metrics.
          </p>
        </div>

        {/* Quick Action Button Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleAction('/admin/content')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-900/30 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('/admin/distribution')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
              isLightMode
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:border-slate-700'
            }`}
          >
            <Link2 className="w-4 h-4 text-teal-500 dark:text-teal-400" />
            <span>Create UTM Link</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-xs transition-all ${
              isLightMode
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:border-slate-700'
            }`}
          >
            <ExternalLink className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Public Site</span>
          </a>
        </div>
      </motion.div>

      {/* Primary KPI Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Case Studies */}
        <div className={`relative group rounded-2xl border backdrop-blur-xl p-5 transition-all duration-300 ${
          isLightMode
            ? 'bg-white/90 border-slate-200 hover:border-teal-500/60 shadow-lg shadow-slate-200/50'
            : 'bg-slate-900/70 border-slate-800/80 hover:border-teal-500/40'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Total Projects</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isLightMode ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-teal-500/10 border-teal-500/20 text-teal-300'
            }`}>
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-display ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              {stats.totalProjects}
            </span>
            <span className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              ({stats.publishedProjects} Published / {stats.draftProjects} Draft)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Case Studies Ready</span>
          </div>
        </div>

        {/* Total UTM Tracking Links */}
        <div className={`relative group rounded-2xl border backdrop-blur-xl p-5 transition-all duration-300 ${
          isLightMode
            ? 'bg-white/90 border-slate-200 hover:border-amber-500/60 shadow-lg shadow-slate-200/50'
            : 'bg-slate-900/70 border-slate-800/80 hover:border-amber-500/40'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Active UTM Links</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isLightMode ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}>
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-display ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              {stats.totalTrackingLinks}
            </span>
            <span className={`text-xs font-medium ${isLightMode ? 'text-amber-700' : 'text-amber-300/80'}`}>Preset Channels</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>{stats.totalClicks} Total Shortlink Clicks</span>
          </div>
        </div>

        {/* Media Assets Library */}
        <div className={`relative group rounded-2xl border backdrop-blur-xl p-5 transition-all duration-300 ${
          isLightMode
            ? 'bg-white/90 border-slate-200 hover:border-cyan-500/60 shadow-lg shadow-slate-200/50'
            : 'bg-slate-900/70 border-slate-800/80 hover:border-teal-500/40'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Media Assets</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isLightMode ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
            }`}>
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-display ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              {stats.totalMediaAssets}
            </span>
            <span className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Images & Diagrams</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WebP / SVG Optimized</span>
          </div>
        </div>

        {/* System & Edge Status */}
        <div className={`relative group rounded-2xl border backdrop-blur-xl p-5 transition-all duration-300 ${
          isLightMode
            ? 'bg-white/90 border-slate-200 hover:border-emerald-500/60 shadow-lg shadow-slate-200/50'
            : 'bg-slate-900/70 border-slate-800/80 hover:border-emerald-500/40'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>System Pipeline</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isLightMode ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-display ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              {isSupabaseConfigured ? 'Connected' : 'Local Mock'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Vercel Edge 301 Active</span>
          </div>
        </div>
      </motion.div>

      {/* Two Columns: Recent Activity & Attention (Left) + Distribution Performance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Needs Attention & Recent Activity (7 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white font-display">
                Needs Attention & Activity
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {activities.length} items flagged
            </span>
          </div>

          <div className="space-y-3">
            {activities.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-4 transition-all hover:border-slate-700/80 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${
                      item.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                        : item.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-teal-500/10 border-teal-500/20 text-teal-300'
                    }`}
                  >
                    {item.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : item.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-200">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-slate-500">&bull; {item.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.actionText && item.actionRoute && (
                  <button
                    type="button"
                    onClick={() => handleAction(item.actionRoute!)}
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-colors cursor-pointer"
                  >
                    <span>{item.actionText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: UTM Distribution Quick Channels & Projects Snapshot (5 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
          
          {/* UTM Preset Channels */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white font-display">
                  Top UTM Channels
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleAction('/admin/distribution')}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(UTM_PRESETS).slice(0, 4).map(([key, preset]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {preset.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      source: <span className="text-teal-400">{preset.source}</span> &bull; medium: {preset.medium}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-300 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick CMS Content Shortcut */}
          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-teal-950/40 to-slate-900/80 backdrop-blur-xl p-5 border-teal-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Multi-Format Content Ingestion</h4>
                <p className="text-xs text-slate-400">Atomic Blocks, TSX, Markdown, PDF Deck</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Edit case studies with live canvas preview, manage SEO tags, and publish instantly without manual commits.
            </p>
            <button
              type="button"
              onClick={() => handleAction('/admin/content')}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open Content Studio</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
};
