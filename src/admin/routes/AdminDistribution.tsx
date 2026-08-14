import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle2,
  QrCode,
  Trash2,
  RefreshCw,
  Share2,
  Send,
  Mail,
  FileText,
  Sparkles,
  Search,
  X,
  Loader2,
  ArrowRight,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useTrackingLinks } from '../../cms/hooks/useTrackingLinks';
import { useProjects } from '../../cms/hooks/useProjects';
import { buildUtmUrl, generateShortSlug, type UtmPreset } from '../../lib/utm';
import type { TrackingLink } from '../../cms/types/cms.types';
import { CustomSelect } from '../components/CustomSelect';
import { useStore } from '../../store/useStore';

const CHANNEL_PRESETS: Record<
  string,
  UtmPreset & { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  linkedin_post: {
    name: 'LinkedIn Post',
    source: 'linkedin',
    medium: 'social',
    defaultCampaign: 'portfolio_launch',
    defaultContent: 'post_feed',
    description: 'Outbound links in LinkedIn feed posts & articles',
    icon: Share2,
    color: 'from-blue-600/20 to-blue-900/30 text-blue-400 border-blue-500/30',
  },
  linkedin_featured: {
    name: 'LinkedIn Featured',
    source: 'linkedin',
    medium: 'profile_featured',
    defaultCampaign: 'portfolio',
    defaultContent: 'profile_card',
    description: 'Pinned link in LinkedIn profile Featured section',
    icon: Sparkles,
    color: 'from-cyan-600/20 to-cyan-900/30 text-cyan-400 border-cyan-500/30',
  },
  zalo_message: {
    name: 'Zalo Message',
    source: 'zalo',
    medium: 'message',
    defaultCampaign: 'portfolio',
    defaultContent: 'direct_chat',
    description: 'Direct 1-on-1 or group message chats on Zalo',
    icon: Send,
    color: 'from-teal-600/20 to-teal-900/30 text-teal-400 border-teal-500/30',
  },
  recruiter_email: {
    name: 'Recruiter Email',
    source: 'recruiter_email',
    medium: 'email',
    defaultCampaign: 'job_application',
    defaultContent: 'email_pitch',
    description: 'Targeted outbound outreach to talent partners & CTOs',
    icon: Mail,
    color: 'from-amber-600/20 to-amber-900/30 text-amber-400 border-amber-500/30',
  },
  cv_download: {
    name: 'CV / Resume PDF',
    source: 'cv',
    medium: 'document',
    defaultCampaign: 'job_application',
    defaultContent: 'cv_pdf_link',
    description: 'Embedded clickable links in downloadable PDF resume',
    icon: FileText,
    color: 'from-purple-600/20 to-purple-900/30 text-purple-400 border-purple-500/30',
  },
  qr_offline: {
    name: 'QR Code (Offline)',
    source: 'qr',
    medium: 'offline',
    defaultCampaign: 'meetup_networking',
    defaultContent: 'namecard_qr',
    description: 'Physical namecard, conferences, and printed decks',
    icon: QrCode,
    color: 'from-emerald-600/20 to-emerald-900/30 text-emerald-400 border-emerald-500/30',
  },
};

export const AdminDistribution: React.FC = () => {
  const { isLightMode } = useStore();
  const { links, isLoading, createLink, toggleActive, deleteLink, isCreating, isDeleting, refetch } =
    useTrackingLinks();
  const { projects } = useProjects();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [qrModalLink, setQrModalLink] = useState<TrackingLink | null>(null);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  // Form State
  const [destPath, setDestPath] = useState('/');
  const [customPath, setCustomPath] = useState('');
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('linkedin_post');
  const [source, setSource] = useState(CHANNEL_PRESETS.linkedin_post.source);
  const [medium, setMedium] = useState(CHANNEL_PRESETS.linkedin_post.medium);
  const [campaign, setCampaign] = useState(CHANNEL_PRESETS.linkedin_post.defaultCampaign || '');
  const [content, setContent] = useState(CHANNEL_PRESETS.linkedin_post.defaultContent || '');
  const [shortSlug, setShortSlug] = useState(() => generateShortSlug(6));

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Preset Selection Handler
  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    const preset = CHANNEL_PRESETS[key];
    if (preset) {
      setSource(preset.source);
      setMedium(preset.medium);
      setCampaign(preset.defaultCampaign || '');
      setContent(preset.defaultContent || '');
    }
  };

  // Resolved Destination Path
  const resolvedDestination = destPath === 'custom' ? (customPath || '/') : destPath;

  // Live URL Preview calculation
  const calculatedFullUrl = buildUtmUrl(resolvedDestination, {
    source,
    medium,
    campaign: campaign || undefined,
    content: content || undefined,
  });

  const getBaseOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://portfolio.dev';
  };

  const shortLinkUrl = `${getBaseOrigin()}/r/${shortSlug || 'slug'}`;

  // Copy URL with toast
  const handleCopy = (slug: string, url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedSlug(slug);
    showToast(`Copied shortlink /r/${slug} to clipboard!`);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  // Submit Link Creation
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortSlug.trim() || !source.trim() || !medium.trim()) {
      showToast('Please fill in required fields (slug, source, medium).');
      return;
    }

    try {
      await createLink({
        slug: shortSlug.trim().toLowerCase(),
        destination_path: resolvedDestination,
        utm_source: source.trim(),
        utm_medium: medium.trim(),
        utm_campaign: campaign.trim() || null,
        utm_content: content.trim() || null,
        is_active: true,
      });

      showToast(`Shortlink "/r/${shortSlug}" created successfully!`);
      // Refresh form with new slug
      setShortSlug(generateShortSlug(6));
    } catch (err) {
      console.error(err);
      showToast('Error creating link. Check if slug is already taken.');
    }
  };

  // Delete Link
  const handleDeleteConfirm = async () => {
    if (!deletingLinkId) return;
    try {
      await deleteLink(deletingLinkId);
      showToast('Tracking link removed.');
      setDeletingLinkId(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete tracking link.');
    }
  };

  // Filtered Tracking Links
  const filteredLinks = links.filter((link) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      link.slug.toLowerCase().includes(q) ||
      link.destination_path.toLowerCase().includes(q) ||
      link.utm_source.toLowerCase().includes(q) ||
      link.utm_medium.toLowerCase().includes(q) ||
      (link.utm_campaign && link.utm_campaign.toLowerCase().includes(q))
    );
  });

  const totalClicks = links.reduce((sum, item) => sum + (item.clicks_count || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8 max-w-7xl mx-auto"
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

      {/* ─── Top Header & Summary ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              UTM Distribution Engine
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
              {links.length} Links Active
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Generate, shorten, and track campaign URLs across LinkedIn, Zalo, CV decks, and QR namecards.
          </p>
        </div>

        {/* Global Clicks Counter Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Total Inbound Clicks
              </p>
              <p className="text-lg font-bold text-white font-display leading-none mt-0.5">
                {totalClicks}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Refresh links"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Channel Presets Bar ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Share2 className="w-4 h-4 text-teal-400" />
            <span>Channel Presets (1-Click Fill)</span>
          </h2>
          <span className="text-xs text-slate-400">Select preset to configure quick link</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(CHANNEL_PRESETS).map(([key, preset]) => {
            const Icon = preset.icon;
            const isSelected = selectedPresetKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPreset(key)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  isSelected
                    ? 'bg-gradient-to-br from-teal-950/40 to-slate-900 border-teal-500/50 shadow-lg shadow-teal-950 ring-1 ring-teal-500/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border bg-gradient-to-br ${preset.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">{preset.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {preset.source} / {preset.medium}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Quick Link Creator Card ─── */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 lg:p-8 shadow-xl">
        <div className="flex items-center gap-2.5 pb-5 border-b border-slate-800/80 mb-6">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Create Short Tracking Link</h2>
            <p className="text-xs text-slate-400">
              Generate an intelligent vanity shortlink (`/r/:slug`) with embedded UTM telemetry.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Destination Project / Page */}
            <div>
              <CustomSelect
                label="Destination Target *"
                value={destPath}
                onChange={(val) => setDestPath(val)}
                options={[
                  { value: '/', label: 'Home Portfolio ( / )' },
                  { value: '/projects', label: 'Case Studies Hub ( /projects )' },
                  ...projects.map((proj) => ({
                    value: `/project/${proj.slug}`,
                    label: `${proj.title.en} ( /project/${proj.slug} )`,
                    description: proj.category,
                  })),
                  { value: 'custom', label: '+ Custom Target Path' },
                ]}
              />

              {destPath === 'custom' && (
                <input
                  type="text"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  placeholder="e.g. /custom-landing-page"
                  className={`w-full mt-2 px-3 py-2 rounded-xl text-xs ${
                    isLightMode
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-teal-600'
                      : 'bg-slate-950 border border-slate-800 text-white focus:border-teal-500'
                  }`}
                />
              )}
            </div>

            {/* 2. UTM Source & Medium */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                UTM Source & Medium <span className="text-teal-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="source"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-teal-500"
                />
                <input
                  type="text"
                  required
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  placeholder="medium"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-teal-500"
                />
              </div>
            </div>

            {/* 3. UTM Campaign & Content */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Campaign & Content (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="campaign"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-teal-500"
                />
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="content"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-teal-500"
                />
              </div>
            </div>

            {/* 4. Short Slug with Generator */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Short Slug (/r/:slug) <span className="text-teal-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                    /r/
                  </span>
                  <input
                    type="text"
                    required
                    value={shortSlug}
                    onChange={(e) => setShortSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                    placeholder="slug"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-teal-300 focus:border-teal-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShortSlug(generateShortSlug(6))}
                  className="px-2.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                  title="Generate Random Slug"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>

          {/* URL Live Preview Card */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-400">Shortened Inbound Link:</span>
              <span className="font-mono text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20 truncate">
                {shortLinkUrl}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1 border-t border-slate-850">
              <span className="font-semibold text-slate-400">Final Resolved Destination:</span>
              <span className="font-mono text-slate-400 truncate max-w-xl">
                {calculatedFullUrl}
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Save & Publish Tracking Link</span>
            </button>
          </div>
        </form>
      </div>

      {/* ─── Active Tracking Links Table ─── */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-xl">
        {/* Table Header Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-white font-display">
              Active Tracking Links & Analytics
            </h2>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by slug, destination, source..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Links List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            <p className="text-xs">Loading tracking links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <p className="text-sm font-semibold">No tracking links found</p>
            <p className="text-xs">Create your first link using the form above.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredLinks.map((link) => {
              const fullDestination = buildUtmUrl(link.destination_path, {
                source: link.utm_source,
                medium: link.utm_medium,
                campaign: link.utm_campaign || undefined,
                content: link.utm_content || undefined,
              });

              const resolvedShortLink = `${getBaseOrigin()}/r/${link.slug}`;

              return (
                <div
                  key={link.id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Left Link Info */}
                  <div className="space-y-1.5 min-w-0 max-w-2xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-teal-300 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20">
                        /r/{link.slug}
                      </span>

                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {link.utm_source} • {link.utm_medium}
                      </span>

                      {link.utm_campaign && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          cmp: {link.utm_campaign}
                        </span>
                      )}

                      {link.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                          Paused
                        </span>
                      )}
                    </div>

                    {/* Destination Target */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="text-white font-medium">{link.destination_path}</span>
                      <span className="text-[11px] font-mono text-slate-500 truncate max-w-md">
                        ({fullDestination})
                      </span>
                    </div>
                  </div>

                  {/* Right Actions & Clicks Metric */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Clicks Metric */}
                    <div className="text-right px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 min-w-[75px]">
                      <p className="text-[10px] uppercase text-slate-500 font-semibold">Clicks</p>
                      <p className="text-sm font-bold text-white font-display">
                        {link.clicks_count || 0}
                      </p>
                    </div>

                    {/* Copy Short URL Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(link.slug, resolvedShortLink)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    >
                      {copiedSlug === link.slug ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                          <span className="text-teal-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Shortlink</span>
                        </>
                      )}
                    </button>

                    {/* QR Code Trigger */}
                    <button
                      type="button"
                      onClick={() => setQrModalLink(link)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Show QR Code"
                    >
                      <QrCode className="w-4 h-4 text-emerald-400" />
                    </button>

                    {/* Open Destination Directly */}
                    <a
                      href={fullDestination}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Test Target URL"
                    >
                      <ExternalLink className="w-4 h-4 text-cyan-400" />
                    </a>

                    {/* Status Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => toggleActive(link.id, link.is_active)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                        link.is_active
                          ? 'bg-emerald-500/10 text-emerald-300 hover:bg-rose-500/10 hover:text-rose-300 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 hover:text-emerald-300'
                      }`}
                      title="Toggle Active/Paused"
                    >
                      {link.is_active ? 'Pause' : 'Activate'}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeletingLinkId(link.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── QR Code Modal Preview ─── */}
      <AnimatePresence>
        {qrModalLink && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQrModalLink(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl z-10 text-center space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-left">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h2 className="text-base font-bold text-white font-display">QR Code Preview</h2>
                    <p className="text-xs text-slate-400">/r/{qrModalLink.slug}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalLink(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Image Box */}
              <div className="p-6 rounded-2xl bg-white flex flex-col items-center justify-center mx-auto shadow-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    `${getBaseOrigin()}/r/${qrModalLink.slug}`
                  )}`}
                  alt={`QR code for /r/${qrModalLink.slug}`}
                  className="w-48 h-48 rounded-lg"
                  loading="lazy"
                />
                <span className="text-[11px] font-mono text-slate-800 font-semibold mt-3">
                  {getBaseOrigin()}/r/{qrModalLink.slug}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400">
                  Target: <span className="text-white font-medium">{qrModalLink.destination_path}</span> ({qrModalLink.utm_source} / {qrModalLink.utm_medium})
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(qrModalLink.slug, `${getBaseOrigin()}/r/${qrModalLink.slug}`)
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-900/30 transition-all cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy URL</span>
                  </button>

                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                      `${getBaseOrigin()}/r/${qrModalLink.slug}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    download={`qr-${qrModalLink.slug}.png`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Open High-Res</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {deletingLinkId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingLinkId(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-3xl border border-rose-500/30 bg-slate-950 p-6 shadow-2xl z-10 text-center space-y-4"
            >
              <h3 className="text-base font-bold text-white">Delete Tracking Link?</h3>
              <p className="text-xs text-slate-400">
                Existing traffic routed to this shortlink will no longer be redirected.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingLinkId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
