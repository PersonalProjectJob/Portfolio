import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ArrowLeft,
  Save,
  Send,
  ExternalLink,
  Plus,
  Layers,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
} from 'lucide-react';
import type { ContentEntry, ContentBlock, ContentEntryStatus } from '../../../cms/types/cms.types';
import type { BlockType } from '../../../cms/blocks/types';
import { createDefaultBlock } from '../../../cms/blocks/registry';
import { resolveLocalizedString } from '../../../cms/blocks/types';
import { useProjects } from '../../../cms/hooks/useProjects';
import { createVersionSnapshot, fetchProjectVersions, rollbackToVersion, type ContentVersion } from '../../../cms/repositories/versionRepository';
import { LivePreviewCanvas } from '../../components/LivePreviewCanvas';
import { BlockPaletteModal } from '../../components/BlockPaletteModal';
import { BlockSortableItem } from '../../components/BlockSortableItem';
import { LocalizedInput, SingleInput } from '../../../cms/blocks/editors/common/EditorField';
import { CustomSelect } from '../../components/CustomSelect';

export interface ProjectEditorProps {
  project: ContentEntry;
  onBack: () => void;
  onSaved?: (updated: ContentEntry) => void;
}

type SaveState = 'saved' | 'saving' | 'unsaved' | 'error';

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project: initialProject,
  onBack,
  onSaved,
}) => {
  const { updateProject } = useProjects();

  // Active language for editor and preview
  const [language, setLanguage] = useState<'en' | 'vi'>('en');

  // Draft project state
  const [project, setProject] = useState<ContentEntry>(() => {
    // Ensure draft_document exists
    const initialBlocks =
      initialProject.draft_document?.blocks ||
      initialProject.published_document?.blocks ||
      [];

    return {
      ...initialProject,
      draft_document: {
        schemaVersion: 1,
        blocks: JSON.parse(JSON.stringify(initialBlocks)),
      },
    };
  });

  // Extract blocks array from draft document
  const blocks = useMemo(() => project.draft_document?.blocks || [], [project.draft_document?.blocks]);

  // Expanded blocks accordion IDs
  const [expandedBlockIds, setExpandedBlockIds] = useState<Set<string>>(() => {
    // Expand first block by default if exists
    const set = new Set<string>();
    if (blocks.length > 0) set.add(blocks[0].id);
    return set;
  });

  // UI Modals State
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(true);

  // Publish Note State
  const [publishNote, setPublishNote] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Version History State
  const [versionHistory, setVersionHistory] = useState<ContentVersion[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Autosave status state
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ─── UPDATE HELPERS ──────────────────────────────────────

  const updateMetadataField = <K extends keyof ContentEntry>(field: K, value: ContentEntry[K]) => {
    setProject((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveState('unsaved');
  };

  const updateBlocks = useCallback((newBlocks: ContentBlock[]) => {
    setProject((prev) => ({
      ...prev,
      draft_document: {
        schemaVersion: prev.draft_document?.schemaVersion || 1,
        blocks: newBlocks,
      },
    }));
    setSaveState('unsaved');
  }, []);

  const handleUpdateBlockData = useCallback((blockId: string, newData: Record<string, unknown>) => {
    setProject((prev) => {
      const currentBlocks = prev.draft_document?.blocks || [];
      const updated = currentBlocks.map((b) =>
        b.id === blockId ? { ...b, data: { ...b.data, ...newData } } : b
      );
      return {
        ...prev,
        draft_document: {
          schemaVersion: prev.draft_document?.schemaVersion || 1,
          blocks: updated,
        },
      };
    });
    setSaveState('unsaved');
  }, []);

  const handleToggleBlockVisibility = useCallback((blockId: string) => {
    setProject((prev) => {
      const currentBlocks = prev.draft_document?.blocks || [];
      const updated = currentBlocks.map((b) =>
        b.id === blockId ? { ...b, visible: b.visible === false ? true : false } : b
      );
      return {
        ...prev,
        draft_document: {
          schemaVersion: prev.draft_document?.schemaVersion || 1,
          blocks: updated,
        },
      };
    });
    setSaveState('unsaved');
  }, []);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    setProject((prev) => {
      const currentBlocks = prev.draft_document?.blocks || [];
      const index = currentBlocks.findIndex((b) => b.id === blockId);
      if (index === -1) return prev;

      const target = currentBlocks[index];
      const newBlock: ContentBlock = {
        id: `block-${target.type}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        type: target.type,
        visible: true,
        data: JSON.parse(JSON.stringify(target.data)),
      };

      const updated = [...currentBlocks];
      updated.splice(index + 1, 0, newBlock);

      setExpandedBlockIds((prevIds) => new Set([...prevIds, newBlock.id]));
      return {
        ...prev,
        draft_document: {
          schemaVersion: prev.draft_document?.schemaVersion || 1,
          blocks: updated,
        },
      };
    });
    setSaveState('unsaved');
  }, []);

  const handleDeleteBlock = useCallback((blockId: string) => {
    setProject((prev) => {
      const currentBlocks = prev.draft_document?.blocks || [];
      const updated = currentBlocks.filter((b) => b.id !== blockId);
      return {
        ...prev,
        draft_document: {
          schemaVersion: prev.draft_document?.schemaVersion || 1,
          blocks: updated,
        },
      };
    });
    setSaveState('unsaved');
  }, []);

  const handleToggleExpandBlock = useCallback((blockId: string) => {
    setExpandedBlockIds((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  }, []);

  // ─── ADD NEW BLOCK ───────────────────────────────────────
  const handleAddBlock = useCallback((type: BlockType) => {
    const newBlock = createDefaultBlock(type);
    setProject((prev) => {
      const currentBlocks = prev.draft_document?.blocks || [];
      const updated = [...currentBlocks, newBlock];
      return {
        ...prev,
        draft_document: {
          schemaVersion: prev.draft_document?.schemaVersion || 1,
          blocks: updated,
        },
      };
    });
    setExpandedBlockIds((prev) => new Set([...prev, newBlock.id]));
    setSaveState('unsaved');
    showToast(`Added ${type} section block.`, 'success');
  }, []);

  // ─── DND REORDER HANDLER ─────────────────────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(blocks, oldIndex, newIndex);
      updateBlocks(reordered);
    }
  };

  // ─── AUTOSAVE ENGINE ─────────────────────────────────────
  const performSave = useCallback(
    async (isManual = false) => {
      setSaveState('saving');
      try {
        const updated = await updateProject({
          id: project.id,
          updates: {
            title: project.title,
            summary: project.summary,
            category: project.category,
            role: project.role,
            slug: project.slug,
            route: `/project/${project.slug}`,
            featured: project.featured,
            seo: project.seo,
            draft_document: project.draft_document,
            render_mode: 'builder',
          },
        });

        setSaveState('saved');
        if (onSaved) onSaved(updated);
        if (isManual) showToast('Draft saved successfully.', 'success');
      } catch (err) {
        console.error('[ProjectEditor] Save failed:', err);
        setSaveState('error');
        if (isManual) showToast('Failed to save draft. Check connection.', 'error');
      }
    },
    [project, updateProject, onSaved]
  );

  // Debounced autosave effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (saveState === 'unsaved') {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        performSave(false);
      }, 2000);
    }

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [saveState, performSave]);

  // ─── PUBLISH ENGINE & SNAPSHOT ───────────────────────────
  const publishChecklist = useMemo(() => {
    const hasTitle = Boolean(
      (project.title?.en && project.title.en.trim().length > 0) ||
      (project.title?.vi && project.title.vi.trim().length > 0)
    );
    const hasSlug = Boolean(project.slug && project.slug.trim().length > 0);
    const hasBlocks = blocks.length > 0;
    const hasCategory = Boolean(project.category && project.category.trim().length > 0);
    const isReady = hasTitle && hasSlug && hasBlocks;

    return {
      hasTitle,
      hasSlug,
      hasBlocks,
      hasCategory,
      isReady,
    };
  }, [project, blocks]);

  const handlePublishConfirm = async () => {
    if (!publishChecklist.isReady) {
      showToast('Please fulfill the publish requirements.', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      // 1. Create version snapshot and publish
      const newVersion = await createVersionSnapshot(
        project.id,
        {
          ...project,
          published_document: project.draft_document,
          status: 'published',
        },
        publishNote.trim() || `Published snapshot (${new Date().toLocaleDateString()})`
      );

      setProject((prev) => ({
        ...prev,
        status: 'published',
        published_document: prev.draft_document,
        published_at: newVersion.published_at,
      }));

      setSaveState('saved');
      setIsPublishModalOpen(false);
      setPublishNote('');
      showToast(`Case study published as v${newVersion.version}!`, 'success');
    } catch (err) {
      console.error('[ProjectEditor] Publish failed:', err);
      showToast('Failed to publish snapshot. Check console.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // ─── LOAD & RESTORE VERSION HISTORY ──────────────────────
  const handleOpenHistory = async () => {
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      const list = await fetchProjectVersions(project.id);
      setVersionHistory(list);
    } catch (err) {
      console.error('[ProjectEditor] Fetch versions failed:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRestoreVersion = async (version: ContentVersion) => {
    if (!window.confirm(`Are you sure you want to restore Version v${version.version}? This will overwrite your current draft document.`)) {
      return;
    }

    setIsRestoringVersion(true);
    try {
      const restored = await rollbackToVersion(project.id, version.id);
      setProject(restored);
      setSaveState('saved');
      setIsHistoryModalOpen(false);
      showToast(`Restored version v${version.version} successfully!`, 'success');
    } catch (err) {
      console.error('[ProjectEditor] Restore failed:', err);
      showToast('Failed to restore version snapshot.', 'error');
    } finally {
      setIsRestoringVersion(false);
    }
  };

  const projectTitleDisplay = resolveLocalizedString(project.title, language) || 'Untitled Project';

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      
      {/* ─── Toast Notification ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl backdrop-blur-xl border ${
              toastMessage.type === 'success'
                ? 'bg-slate-900/95 border-teal-500/50 text-teal-300 shadow-teal-950/50'
                : 'bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-rose-950/50'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 1. TOP NAVIGATION & WORKSPACE BAR ─── */}
      <header className="h-16 shrink-0 bg-slate-950/95 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 z-30 backdrop-blur-xl">
        
        {/* Left: Back & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80 transition-colors cursor-pointer"
            title="Back to Content Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs truncate">
            <span className="text-slate-500 hidden sm:inline">Admin</span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="text-slate-500 hidden sm:inline">Content</span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="font-bold text-white truncate font-display max-w-[220px] sm:max-w-xs">
              {projectTitleDisplay}
            </span>
          </div>

          {/* Status Badge */}
          <span
            className={`hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              project.status === 'published'
                ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'published' ? 'bg-teal-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="capitalize">{project.status}</span>
          </span>
        </div>

        {/* Center: Autosave Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
          {saveState === 'saving' && (
            <>
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-amber-300 font-medium">Saving draft...</span>
            </>
          )}
          {saveState === 'saved' && (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 font-medium">Saved to Cloud</span>
            </>
          )}
          {saveState === 'unsaved' && (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-400 font-medium">Unsaved changes</span>
            </>
          )}
          {saveState === 'error' && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-400 font-medium">Save failed</span>
            </>
          )}
        </div>

        {/* Right: Actions (Language, Save Draft, Preview, Version Snapshots, Publish) */}
        <div className="flex items-center gap-2">
          
          {/* Language Switch */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('vi')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                language === 'vi'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VI
            </button>
          </div>

          {/* Version Snapshots History */}
          <button
            type="button"
            onClick={handleOpenHistory}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="View Version Snapshots & Rollback"
          >
            <History className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Preview in New Tab */}
          <a
            href={`/project/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
            title="Preview Public Page in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview</span>
          </a>

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={() => performSave(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Save Draft</span>
          </button>

          {/* Publish / Snapshot Button */}
          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-teal-900/40 transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* ─── 2. SPLIT-SCREEN WORKSPACE (Left: Inspector 420px, Right: Live Canvas) ─── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* ─── LEFT COLUMN: INSPECTOR & BLOCKS STREAM (420px) ─── */}
        <aside className="w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl flex flex-col h-full overflow-hidden">
          
          {/* Blocks & Inspector Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-950 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                Section Blocks ({blocks.length})
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all shadow-md shadow-teal-950 cursor-pointer hover:-translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Block</span>
            </button>
          </div>

          {/* Scrollable Inspector Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Project Metadata Accordion */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
                className="w-full p-3.5 bg-slate-900/90 flex items-center justify-between text-left cursor-pointer hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white font-display">
                    Project Metadata & Settings
                  </span>
                </div>
                {isMetadataExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isMetadataExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-slate-800/80 p-4 space-y-3.5 bg-slate-950/70"
                  >
                    {/* Title (EN / VI) */}
                    <LocalizedInput
                      label="Project Title"
                      value={project.title}
                      onChange={(val) => updateMetadataField('title', val)}
                      placeholderEn="e.g. VLINKPAY Payment Gateway"
                      placeholderVi="e.g. Cổng Thanh Toán VLINKPAY"
                      required
                    />

                    {/* Slug & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SingleInput
                        label="URL Slug"
                        value={project.slug}
                        onChange={(val) =>
                          updateMetadataField(
                            'slug',
                            val.toLowerCase().replace(/[^a-z0-9-]/g, '')
                          )
                        }
                        placeholder="vlinkpay-gateway"
                        description="/project/[slug]"
                        required
                      />

                      <SingleInput
                        label="Category"
                        value={project.category}
                        onChange={(val) => updateMetadataField('category', val)}
                        placeholder="Fintech & SaaS"
                      />
                    </div>

                    {/* Role & Summary */}
                    <SingleInput
                      label="Role & Contribution"
                      value={project.role || ''}
                      onChange={(val) => updateMetadataField('role', val)}
                      placeholder="Lead Product Designer & Architect"
                    />

                    <LocalizedInput
                      label="Executive Summary"
                      value={project.summary}
                      onChange={(val) => updateMetadataField('summary', val)}
                      placeholderEn="Short description for preview cards and SEO..."
                      placeholderVi="Mô tả ngắn gọn hiển thị ở thẻ xem trước..."
                      isTextarea
                      rows={2}
                    />

                    {/* Featured & Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={project.featured}
                          onChange={(e) => updateMetadataField('featured', e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500/40"
                        />
                        <span>Feature on Homepage</span>
                      </label>

                      <div className="w-36">
                        <CustomSelect
                          value={project.status}
                          onChange={(val) =>
                            updateMetadataField('status', val as ContentEntryStatus)
                          }
                          options={[
                            { value: 'draft', label: 'Draft', badge: 'WIP' },
                            { value: 'published', label: 'Published', badge: 'Live' },
                            { value: 'archived', label: 'Archived' },
                          ]}
                          size="sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dnd Sortable Stream of Section Blocks */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {blocks.map((block, idx) => (
                    <BlockSortableItem
                      key={block.id}
                      block={block}
                      index={idx}
                      isExpanded={expandedBlockIds.has(block.id)}
                      onToggleExpand={handleToggleExpandBlock}
                      onUpdateData={handleUpdateBlockData}
                      onToggleVisibility={handleToggleBlockVisibility}
                      onDuplicate={handleDuplicateBlock}
                      onDelete={handleDeleteBlock}
                      language={language}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Empty Blocks State */}
            {blocks.length === 0 && (
              <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
                  <Plus className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">No section blocks yet</h4>
                <p className="text-[11px] text-slate-400">
                  Click the button below to add your first atomic section block.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPaletteOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-950 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Choose Block Template</span>
                </button>
              </div>
            )}

            {/* Bottom Add Section Block Big Button */}
            {blocks.length > 0 && (
              <button
                type="button"
                onClick={() => setIsPaletteOpen(true)}
                className="w-full py-3.5 rounded-2xl border border-dashed border-slate-800 hover:border-teal-500/50 bg-slate-900/40 hover:bg-slate-900 text-slate-400 hover:text-teal-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section Block</span>
              </button>
            )}
          </div>
        </aside>

        {/* ─── RIGHT COLUMN: EMBEDDED LIVE PREVIEW CANVAS ─── */}
        <main className="flex-1 h-full min-w-0 bg-slate-950 p-2 sm:p-4 overflow-hidden">
          <LivePreviewCanvas
            project={project}
            blocks={blocks}
            language={language}
            onLanguageChange={(newLang) => setLanguage(newLang)}
          />
        </main>
      </div>

      {/* ─── 3. BLOCK PALETTE MODAL ─── */}
      <BlockPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelectBlock={handleAddBlock}
        language={language}
      />

      {/* ─── 4. PUBLISH & VERSION SNAPSHOT MODAL ─── */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPublishModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-7 shadow-2xl z-10 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/10">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Publish & Create Snapshot
                    </h3>
                    <p className="text-xs text-slate-400">
                      Creates an immutable version record and deploys to public route.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Publish Checklist */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
                <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                  Pre-Publish Checklist
                </h4>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Title Configured</span>
                    {publishChecklist.hasTitle ? (
                      <span className="text-teal-400 flex items-center gap-1 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> Missing
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">URL Slug Valid</span>
                    {publishChecklist.hasSlug ? (
                      <span className="text-teal-400 flex items-center gap-1 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> /{project.slug}
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> Missing
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Content Stream Blocks</span>
                    {publishChecklist.hasBlocks ? (
                      <span className="text-teal-400 flex items-center gap-1 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {blocks.length} Blocks
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> At least 1 block needed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Version Note Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Version Snapshot Note
                </label>
                <input
                  type="text"
                  value={publishNote}
                  onChange={(e) => setPublishNote(e.target.value)}
                  placeholder="e.g. Added user research telemetry and updated CTA"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
                <p className="text-[11px] text-slate-500">
                  Helps track architectural changes when rolling back.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handlePublishConfirm}
                  disabled={!publishChecklist.isReady || isPublishing}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-teal-900/40 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Snapshot...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirm & Publish</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 5. VERSION HISTORY SNAPSHOTS MODAL ─── */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Version Snapshot History
                    </h3>
                    <p className="text-xs text-slate-400">
                      Audit past deployments or rollback to a previous version.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Version History List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {isLoadingHistory ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Loader2 className="w-6 h-6 text-teal-400 animate-spin mx-auto" />
                    <p className="text-xs">Fetching version logs...</p>
                  </div>
                ) : versionHistory.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No published version snapshots recorded yet.
                  </div>
                ) : (
                  versionHistory.map((ver) => (
                    <div
                      key={ver.id}
                      className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            v{ver.version}
                          </span>
                          <span className="text-xs font-semibold text-slate-300">
                            {ver.publish_note || 'Published version'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(ver.published_at).toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRestoreVersion(ver)}
                        disabled={isRestoringVersion}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        title="Restore this version to draft"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectEditor;
