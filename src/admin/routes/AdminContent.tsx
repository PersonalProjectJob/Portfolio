import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  ExternalLink,
  Copy,
  Trash2,
  Edit3,
  FileText,
  FileCode2,
  Layers,
  FileUp,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Calendar,
  UploadCloud,
  FileCheck2,
  FileQuestion,
  RefreshCw,
} from 'lucide-react';
import { useProjects } from '../../cms/hooks/useProjects';
import type { ContentEntry, ContentEntryStatus, RenderMode } from '../../cms/types/cms.types';
import { parseMarkdownFile } from '../../cms/parsers/markdownParser';
import { ProjectEditor } from '../features/content/ProjectEditor';
import { CloudinaryPdfUploader } from '../components/CloudinaryPdfUploader';
import { CustomSelect } from '../components/CustomSelect';
import { useStore } from '../../store/useStore';

const REGISTERED_TSX_COMPONENTS = [
  {
    key: 'cryptomap',
    name: 'ProjectCryptomap (CryptoMap 360)',
    category: 'Web3 & Fintech',
    role: 'Lead Product Designer',
    summaryEn: 'Multi-chain asset tracking & crypto market intelligence platform.',
    summaryVi: 'Nền tảng theo dõi tài sản đa chuỗi & thông tin thị trường crypto.',
  },
  {
    key: 'nailhub',
    name: 'ProjectNailhub (NailHub POS SaaS)',
    category: 'B2B SaaS',
    role: 'Product Architect & Lead Designer',
    summaryEn: 'End-to-end booking, POS & customer retention platform for US nail salons.',
    summaryVi: 'Hệ thống đặt lịch, POS và chăm sóc khách hàng cho tiệm nail tại Mỹ.',
  },
  {
    key: 'nexora',
    name: 'ProjectNexora (NEXORA Smart Hardware)',
    category: 'Hardware & Interface',
    role: 'Principal UX/UI Designer',
    summaryEn: 'Next-generation industrial IoT control surface and embedded display system.',
    summaryVi: 'Giao diện điều khiển IoT công nghiệp và hệ thống hiển thị nhúng.',
  },
  {
    key: 'vlinkpay',
    name: 'ProjectVlinkpay (VLINKPAY Gateway)',
    category: 'Fintech Platform',
    role: 'Lead Product Designer',
    summaryEn: 'High-throughput merchant acquiring and multi-currency settlement gateway.',
    summaryVi: 'Cổng thanh toán thương mại và quyết toán đa tiền tệ tốc độ cao.',
  },
  {
    key: 'ai-process',
    name: 'ProjectAIProcess (AI Workflows)',
    category: 'AI & Methodologies',
    role: 'Design Technologist',
    summaryEn: 'Deep agentic workflow integration into product lifecycle & prototyping.',
    summaryVi: 'Tích hợp AI Agent sâu vào vòng đời phát triển sản phẩm & tạo mẫu.',
  },
  {
    key: 'handoff',
    name: 'ProjectHandoff (Design-to-Code)',
    category: 'Process & Tooling',
    role: 'Design System Engineer',
    summaryEn: 'Production-grade design token pipelines and sync automation tools.',
    summaryVi: 'Hệ thống đồng bộ Token thiết kế và pipeline tự động hóa mã nguồn.',
  },
  {
    key: 'sync-task-badge',
    name: 'ProjectSyncTaskBadge (Real-time Sync)',
    category: 'Telemetry & Devops',
    role: 'DevOps & Integration Engineer',
    summaryEn: 'Bi-directional status broadcasting and automated issue triage via Telegram.',
    summaryVi: 'Phát sóng trạng thái hai chiều và xử lý sự cố tự động qua Telegram.',
  },
  {
    key: 'dispatch',
    name: 'ProjectDispatch (Multi-Agent Dispatch)',
    category: 'Automation Engineering',
    role: 'Systems & Prompt Architect',
    summaryEn: 'Distributed orchestrator coordinating AI agents for automated delivery.',
    summaryVi: 'Hệ thống điều phối phân tán các tác tử AI phục vụ bàn giao tự động.',
  },
  {
    key: 'agent-rules',
    name: 'ProjectAgentRules (Agent Rules Engine)',
    category: 'Governance & AI Systems',
    role: 'AI Governance Lead',
    summaryEn: 'Standardized agent operational procedures, invariants, and compliance.',
    summaryVi: 'Quy trình vận hành chuẩn cho Agent và kiểm tra tuân thủ tự động.',
  },
];

type IngestionMode = 'builder' | 'legacy' | 'markdown' | 'pdf_deck';

export const AdminContent: React.FC = () => {
  const { isLightMode } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    isCreating,
    isUpdating,
    isDeleting,
    isDuplicating,
    refetch,
  } = useProjects();

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedIngestionMode, setSelectedIngestionMode] = useState<IngestionMode>('builder');
  const [editingProject, setEditingProject] = useState<ContentEntry | null>(null);
  const [activeEditorProject, setActiveEditorProject] = useState<ContentEntry | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // New Project Form State
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleVi, setFormTitleVi] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('Product Design');
  const [formRole, setFormRole] = useState('');
  const [formSummaryEn, setFormSummaryEn] = useState('');
  const [formSummaryVi, setFormSummaryVi] = useState('');
  const [formStatus, setFormStatus] = useState<ContentEntryStatus>('published');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formLegacyKey, setFormLegacyKey] = useState(REGISTERED_TSX_COMPONENTS[0].key);
  const [formPdfUrl, setFormPdfUrl] = useState('');
  const [formMarkdownContent, setFormMarkdownContent] = useState('');
  const [parsedMdMeta, setParsedMdMeta] = useState<string | null>(null);

  // Categories extracted from projects
  const allCategories = React.useMemo(() => {
    const cats = new Set<string>();
    projects.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [projects]);

  // Filtered projects
  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      // Tab filter
      if (activeTab !== 'all' && p.status !== activeTab) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle =
          p.title.en.toLowerCase().includes(q) || p.title.vi.toLowerCase().includes(q);
        const matchSlug = p.slug.toLowerCase().includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        const matchRole = p.role ? p.role.toLowerCase().includes(q) : false;
        return matchTitle || matchSlug || matchCategory || matchRole;
      }
      return true;
    });
  }, [projects, activeTab, selectedCategory, searchQuery]);

  // Handle Slug auto-generation
  const handleTitleEnChange = (val: string) => {
    setFormTitleEn(val);
    if (!formSlug || formSlug === formTitleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setFormSlug(generated);
    }
  };

  // Handle TSX Key selection auto-fill
  const handleTsxKeyChange = (key: string) => {
    setFormLegacyKey(key);
    const found = REGISTERED_TSX_COMPONENTS.find((item) => item.key === key);
    if (found) {
      setFormTitleEn(found.name.split(' (')[0]);
      setFormTitleVi(found.name.split(' (')[0]);
      setFormSlug(found.key);
      setFormCategory(found.category);
      setFormRole(found.role);
      setFormSummaryEn(found.summaryEn);
      setFormSummaryVi(found.summaryVi);
    }
  };

  // Handle Markdown file drop / input
  const handleMarkdownFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      setFormMarkdownContent(content);
      const parsed = parseMarkdownFile(content);
      setFormTitleEn(parsed.metadata.title?.en || file.name.replace(/\.md$/i, ''));
      setFormTitleVi(parsed.metadata.title?.vi || file.name.replace(/\.md$/i, ''));
      setFormSlug(parsed.metadata.slug || file.name.replace(/\.md$/i, '').toLowerCase());
      setFormCategory(parsed.metadata.category || 'Product Design');
      setFormRole(parsed.metadata.role || '');
      setFormSummaryEn(parsed.metadata.summary?.en || '');
      setFormSummaryVi(parsed.metadata.summary?.vi || '');
      setParsedMdMeta(
        `Parsed: ${parsed.blocks.length} blocks, ${parsed.headings.length} headings (~${parsed.readingTimeMinutes} min read)`
      );
    };
    reader.readAsText(file);
  };

  // Reset new project form
  const resetForm = () => {
    setFormTitleEn('');
    setFormTitleVi('');
    setFormSlug('');
    setFormCategory('Product Design');
    setFormRole('');
    setFormSummaryEn('');
    setFormSummaryVi('');
    setFormStatus('published');
    setFormFeatured(false);
    setFormLegacyKey(REGISTERED_TSX_COMPONENTS[0].key);
    setFormPdfUrl('');
    setFormMarkdownContent('');
    setParsedMdMeta(null);
  };

  // Submit New Project
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleEn.trim() || !formSlug.trim()) {
      showToast('Please provide a Title and Slug.');
      return;
    }

    try {
      let publishedDoc = null;
      let draftDoc = null;

      if (selectedIngestionMode === 'markdown' && formMarkdownContent) {
        const parsed = parseMarkdownFile(formMarkdownContent);
        publishedDoc = parsed.metadata.published_document || null;
        draftDoc = parsed.metadata.draft_document || null;
      } else if (selectedIngestionMode === 'pdf_deck' && formPdfUrl) {
        publishedDoc = {
          schemaVersion: 1,
          blocks: [
            {
              id: 'pdf-deck-hero',
              type: 'PdfDeck',
              visible: true,
              data: { pdfUrl: formPdfUrl, title: formTitleEn },
            },
          ],
        };
      }

      const created = await createProject({
        slug: formSlug.trim().toLowerCase(),
        route: `/project/${formSlug.trim().toLowerCase()}`,
        title: { en: formTitleEn.trim(), vi: formTitleVi.trim() || formTitleEn.trim() },
        summary: { en: formSummaryEn.trim(), vi: formSummaryVi.trim() || formSummaryEn.trim() },
        category: formCategory.trim(),
        role: formRole.trim() || null,
        status: formStatus,
        render_mode: selectedIngestionMode,
        legacy_key: selectedIngestionMode === 'legacy' ? formLegacyKey : null,
        featured: formFeatured,
        sort_order: projects.length + 1,
        published_document: publishedDoc,
        draft_document: draftDoc,
      });

      showToast(`Case study "${formTitleEn}" created successfully!`);
      setIsNewModalOpen(false);
      resetForm();

      if (selectedIngestionMode === 'builder') {
        setActiveEditorProject(created);
      }
    } catch (err) {
      console.error(err);
      showToast('Error creating project. Check console.');
    }
  };

  // Submit Edit Project
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      await updateProject({
        id: editingProject.id,
        updates: {
          title: editingProject.title,
          slug: editingProject.slug,
          route: `/project/${editingProject.slug}`,
          summary: editingProject.summary,
          category: editingProject.category,
          role: editingProject.role,
          status: editingProject.status,
          render_mode: editingProject.render_mode,
          featured: editingProject.featured,
          sort_order: editingProject.sort_order,
        },
      });

      showToast(`Project updated successfully!`);
      setEditingProject(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to update project.');
    }
  };

  // Handle Project Duplication
  const handleDuplicate = async (project: ContentEntry) => {
    try {
      await duplicateProject(project);
      showToast(`Project duplicated as draft.`);
    } catch (err) {
      console.error(err);
      showToast('Failed to duplicate project.');
    }
  };

  // Handle Project Delete
  const handleDeleteConfirm = async () => {
    if (!deletingProjectId) return;
    try {
      await deleteProject(deletingProjectId);
      showToast('Project removed.');
      setDeletingProjectId(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete project.');
    }
  };

  // Helper for Render Mode badge
  const renderModeBadge = (mode: RenderMode) => {
    switch (mode) {
      case 'legacy':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <FileCode2 className="w-3 h-3 text-cyan-400" />
            <span>Custom TSX</span>
          </span>
        );
      case 'markdown':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <FileText className="w-3 h-3 text-emerald-400" />
            <span>Markdown</span>
          </span>
        );
      case 'pdf_deck':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <FileUp className="w-3 h-3 text-amber-400" />
            <span>PDF Deck</span>
          </span>
        );
      case 'builder':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
            <Layers className="w-3 h-3 text-teal-400" />
            <span>Builder</span>
          </span>
        );
    }
  };

  // Helper for Status badge
  const renderStatusBadge = (status: ContentEntryStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>Published</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Draft</span>
          </span>
        );
      case 'archived':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>Archived</span>
          </span>
        );
    }
  };

  const fileInputId = useId();

  if (activeEditorProject) {
    return (
      <ProjectEditor
        project={activeEditorProject}
        onBack={() => {
          setActiveEditorProject(null);
          refetch();
        }}
        onSaved={(updated) => {
          setActiveEditorProject(updated);
          refetch();
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* ─── Toast Notification ─── */}
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

      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight font-display ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              Content & Case Studies
            </h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono ${
              isLightMode ? 'bg-slate-200 text-slate-700 border border-slate-300' : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {projects.length} Total
            </span>
          </div>
          <p className={`text-sm ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
            Manage multi-format case studies, dynamic TSX components, Markdown documents, and presentation decks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-300 shadow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
            }`}
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsNewModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-900/30 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Case Study</span>
          </button>
        </div>
      </div>

      {/* ─── Filter Tabs & Search Bar ─── */}
      <div className={`rounded-2xl border backdrop-blur-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-30 ${
        isLightMode
          ? 'bg-white/90 border-slate-200 shadow-lg shadow-slate-200/50'
          : 'bg-slate-900/70 border-slate-800/80'
      }`}>
        {/* Status Tabs */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl border overflow-x-auto ${
          isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/70 border-slate-800'
        }`}>
          {(
            [
              { id: 'all', label: 'All Projects', count: projects.length },
              {
                id: 'published',
                label: 'Published',
                count: projects.filter((p) => p.status === 'published').length,
              },
              {
                id: 'draft',
                label: 'Drafts',
                count: projects.filter((p) => p.status === 'draft').length,
              },
              {
                id: 'archived',
                label: 'Archived',
                count: projects.filter((p) => p.status === 'archived').length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? isLightMode
                    ? 'bg-white text-teal-800 border border-teal-500/40 shadow-sm'
                    : 'bg-teal-600/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                isLightMode ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isLightMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, slug, role..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none transition-colors ${
                isLightMode
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-600'
                  : 'bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:border-teal-500'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {allCategories.length > 0 && (
            <CustomSelect
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...allCategories.map((cat) => ({ value: cat, label: cat })),
              ]}
              size="sm"
              className="w-48"
            />
          )}
        </div>
      </div>

      {/* ─── Projects Grid ─── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <p className="text-xs font-medium">Loading case studies...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No projects found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' || activeTab !== 'all'
              ? 'Try changing your search filters or selected tab.'
              : 'Create your first case study using the button above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`rounded-2xl border backdrop-blur-xl p-5 transition-all duration-200 flex flex-col justify-between group ${
                isLightMode
                  ? 'bg-white/95 border-slate-200 hover:border-teal-500/60 shadow-lg shadow-slate-200/50 text-slate-800'
                  : 'bg-slate-900/70 border-slate-800/80 hover:border-teal-500/40 shadow-lg shadow-black/20 text-slate-100'
              }`}
            >
              <div>
                {/* Top Tags & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {renderModeBadge(project.render_mode)}
                    <span className={`text-[11px] font-semibold tracking-wider px-2 py-0.5 rounded-full border ${
                      isLightMode
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {project.category}
                    </span>
                  </div>
                  {renderStatusBadge(project.status)}
                </div>

                {/* Title & Slug */}
                <h3 className={`text-base font-bold font-display line-clamp-1 mb-1 transition-colors ${
                  isLightMode
                    ? 'text-slate-900 group-hover:text-teal-600'
                    : 'text-white group-hover:text-teal-300'
                }`}>
                  {project.title.en}
                </h3>
                <div className={`flex items-center gap-1.5 text-[11px] font-mono mb-2 ${
                  isLightMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span>/project/{project.slug}</span>
                  {project.featured && (
                    <span className="text-amber-500 dark:text-amber-400 font-sans font-semibold text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                      ★ Featured
                    </span>
                  )}
                </div>

                {/* Summary / Role */}
                <p className={`text-xs line-clamp-2 leading-relaxed mb-4 ${
                  isLightMode ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {project.role ? `${project.role} • ` : ''}
                  {project.summary.en || project.summary.vi || 'No summary available.'}
                </p>
              </div>

              {/* Bottom Actions Bar */}
              <div className={`pt-4 border-t flex items-center justify-between gap-2 ${
                isLightMode ? 'border-slate-100' : 'border-slate-800/80'
              }`}>
                <div className={`flex items-center gap-1 text-[11px] ${
                  isLightMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {project.updated_at
                      ? new Date(project.updated_at).toLocaleDateString()
                      : 'v1.0'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Public Link */}
                  <a
                    href={`/project/${project.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-1.5 rounded-lg transition-colors ${
                      isLightMode
                        ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="View Public Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(project)}
                    disabled={isDuplicating}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLightMode
                        ? 'text-slate-400 hover:text-cyan-600 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                    }`}
                    title="Duplicate as Draft"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => {
                      if (project.render_mode === 'builder') {
                        setActiveEditorProject(project);
                      } else {
                        setEditingProject(project);
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLightMode
                        ? 'text-slate-400 hover:text-teal-600 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-teal-300 hover:bg-slate-800'
                    }`}
                    title={project.render_mode === 'builder' ? 'Open Visual Builder' : 'Edit Metadata'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeletingProjectId(project.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLightMode
                        ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                    }`}
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── 4-Option "New Case Study" Modal ─── */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Create New Case Study</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select an ingestion mode and specify project metadata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ingestion Mode Selector (4 Options) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                {(
                  [
                    {
                      mode: 'builder' as IngestionMode,
                      title: 'Atomic Builder',
                      icon: Layers,
                      color: 'text-teal-400',
                      border: 'hover:border-teal-500/40',
                    },
                    {
                      mode: 'legacy' as IngestionMode,
                      title: 'Custom TSX',
                      icon: FileCode2,
                      color: 'text-cyan-400',
                      border: 'hover:border-cyan-500/40',
                    },
                    {
                      mode: 'markdown' as IngestionMode,
                      title: 'Markdown (.md)',
                      icon: FileText,
                      color: 'text-emerald-400',
                      border: 'hover:border-emerald-500/40',
                    },
                    {
                      mode: 'pdf_deck' as IngestionMode,
                      title: 'PDF Deck',
                      icon: FileUp,
                      color: 'text-amber-400',
                      border: 'hover:border-amber-500/40',
                    },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedIngestionMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => setSelectedIngestionMode(item.mode)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                        isSelected
                          ? 'bg-teal-500/10 border-teal-500/50 shadow-md shadow-teal-950'
                          : `bg-slate-900/60 border-slate-800/80 ${item.border}`
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-xs font-bold text-white">{item.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Mode Specific Inputs */}
                {selectedIngestionMode === 'legacy' && (
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                    <CustomSelect
                      value={formLegacyKey}
                      onChange={(val) => handleTsxKeyChange(val)}
                      options={REGISTERED_TSX_COMPONENTS.map((item) => ({
                        value: item.key,
                        label: item.name,
                        description: item.category,
                      }))}
                      label="Select Registered TSX Component"
                    />
                    <p className="text-[11px] text-cyan-400/80">
                      Pre-populates title, summary, role, and category from registered component.
                    </p>
                  </div>
                )}

                {selectedIngestionMode === 'markdown' && (
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload or Paste Markdown (.md)</span>
                      </label>
                      {parsedMdMeta && (
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {parsedMdMeta}
                        </span>
                      )}
                    </div>

                    <input
                      id={fileInputId}
                      type="file"
                      accept=".md,.markdown,.txt"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleMarkdownFileUpload(f);
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor={fileInputId}
                      className="flex flex-col items-center justify-center p-4 border border-dashed border-emerald-500/40 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/50 transition-colors cursor-pointer text-center"
                    >
                      <FileCheck2 className="w-6 h-6 text-emerald-400 mb-1" />
                      <span className="text-xs font-medium text-emerald-300">
                        Click to select .md file
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Frontmatter and headings will be parsed automatically
                      </span>
                    </label>

                    <textarea
                      rows={3}
                      value={formMarkdownContent}
                      onChange={(e) => {
                        setFormMarkdownContent(e.target.value);
                        if (e.target.value) {
                          const p = parseMarkdownFile(e.target.value);
                          setFormTitleEn(p.metadata.title?.en || formTitleEn);
                          setParsedMdMeta(`Parsed: ${p.blocks.length} blocks`);
                        }
                      }}
                      placeholder="...or paste raw markdown content here"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-white placeholder-slate-500 font-mono"
                    />
                  </div>
                )}

                {selectedIngestionMode === 'pdf_deck' && (
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                    <CloudinaryPdfUploader
                      value={formPdfUrl}
                      onChange={(url, fileMeta) => {
                        setFormPdfUrl(url);
                        if (!formTitleEn && fileMeta?.name) {
                          const cleanTitle = fileMeta.name
                            .replace(/\.pdf$/i, '')
                            .replace(/[-_]/g, ' ')
                            .replace(/\b\w/g, (c) => c.toUpperCase());
                          setFormTitleEn(cleanTitle);
                          setFormSlug(fileMeta.name.replace(/\.pdf$/i, '').toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                        }
                      }}
                      folder="portfolio/presentation-decks"
                      label="PDF Presentation Deck (Cloudinary Storage)"
                      helperText="Upload slide deck or presentation document to Cloudinary CDN"
                    />
                  </div>
                )}

                {/* Common Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Title (EN) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitleEn}
                      onChange={(e) => handleTitleEnChange(e.target.value)}
                      placeholder="e.g. CryptoMap 360"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Title (VI)
                    </label>
                    <input
                      type="text"
                      value={formTitleVi}
                      onChange={(e) => setFormTitleVi(e.target.value)}
                      placeholder="e.g. CryptoMap 360 - Nền tảng Web3"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      URL Slug <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="e.g. cryptomap"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-teal-300 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. Web3 & Fintech"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="e.g. Lead Designer"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Summary (EN)
                  </label>
                  <textarea
                    rows={2}
                    value={formSummaryEn}
                    onChange={(e) => setFormSummaryEn(e.target.value)}
                    placeholder="Brief overview of case study context and impact..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0"
                      />
                      <span>Featured Case Study</span>
                    </label>

                    <div className="w-36">
                      <CustomSelect
                        value={formStatus}
                        onChange={(val) => setFormStatus(val as ContentEntryStatus)}
                        options={[
                          { value: 'published', label: 'Published', badge: 'Live' },
                          { value: 'draft', label: 'Draft', badge: 'WIP' },
                          { value: 'archived', label: 'Archived' },
                        ]}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsNewModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-900/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>Create Project</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Edit Project Modal ─── */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProject(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white font-display">Edit Project Metadata</h2>
                  <p className="text-xs text-slate-400 font-mono">ID: {editingProject.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Title (EN)
                    </label>
                    <input
                      type="text"
                      value={editingProject.title.en}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          title: { ...editingProject.title, en: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Title (VI)
                    </label>
                    <input
                      type="text"
                      value={editingProject.title.vi}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          title: { ...editingProject.title, vi: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={editingProject.slug}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-teal-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editingProject.category}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={editingProject.role || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, role: e.target.value || null })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomSelect
                    label="Status"
                    value={editingProject.status}
                    onChange={(val) =>
                      setEditingProject({
                        ...editingProject,
                        status: val as ContentEntryStatus,
                      })
                    }
                    options={[
                      { value: 'published', label: 'Published', badge: 'Live' },
                      { value: 'draft', label: 'Draft', badge: 'WIP' },
                      { value: 'archived', label: 'Archived' },
                    ]}
                  />

                  <CustomSelect
                    label="Render Mode"
                    value={editingProject.render_mode}
                    onChange={(val) =>
                      setEditingProject({
                        ...editingProject,
                        render_mode: val as RenderMode,
                      })
                    }
                    options={[
                      { value: 'builder', label: '🧱 Atomic Builder', description: 'Visual block builder' },
                      { value: 'legacy', label: '⚛️ Custom TSX', description: 'Hardcoded component' },
                      { value: 'markdown', label: '📝 Markdown (.md)', description: 'Rendered from .md' },
                      { value: 'pdf_deck', label: '📄 PDF Deck', description: 'Cloudinary PDF slides' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Summary (EN)
                  </label>
                  <textarea
                    rows={2}
                    value={editingProject.summary.en}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        summary: { ...editingProject.summary, en: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProject.featured}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          featured: e.target.checked,
                        })
                      }
                      className="rounded bg-slate-900 border-slate-700 text-teal-500"
                    />
                    <span>Featured Case Study</span>
                  </label>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {deletingProjectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingProjectId(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-3xl border border-rose-500/30 bg-slate-950 p-6 shadow-2xl z-10 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Delete Case Study?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This action will delete or archive this project from the database. This cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProjectId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
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
