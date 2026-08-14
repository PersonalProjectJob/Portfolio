import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  FileText,
  Sparkles,
  Briefcase,
  Layers,
  Globe,
  Save,
  RotateCcw,
  Upload,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSiteSettings } from '../../cms/hooks/useSiteSettings';
import { uploadMediaAsset } from '../../cms/repositories/mediaRepository';
import { DEFAULT_SITE_SETTINGS } from '../../content/legacy/defaultSiteSettings';
import { CloudinaryPdfUploader } from '../components/CloudinaryPdfUploader';
import type {
  SiteSettings,
  SiteExperienceItem,
  SiteProcessItem,
} from '../../cms/types/cms.types';

type SettingsTab = 'profile' | 'cv' | 'skills' | 'experience' | 'process' | 'seo';

const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'profile', label: 'Profile & Bio', icon: User },
  { id: 'cv', label: 'CV Document', icon: FileText },
  { id: 'skills', label: 'Skills & Stack', icon: Sparkles },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'process', label: 'Design Process', icon: Layers },
  { id: 'seo', label: 'SEO & Social', icon: Globe },
];

export const AdminSettings: React.FC = () => {
  const {
    settings,
    isLoading,
    isError,
    updateSettings,
    isUpdating,
  } = useSiteSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [formData, setFormData] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Avatar Upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Tag inputs state
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newKeywordInput, setNewKeywordInput] = useState<string>('');

  // Sync settings into local form state
  useEffect(() => {
    if (settings) {
      setFormData(JSON.parse(JSON.stringify(settings)));
      setIsDirty(false);
    }
  }, [settings]);

  // Toast feedback helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper to mark form as dirty
  const updateForm = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  // Handle Save
  const handleSave = async () => {
    try {
      await updateSettings(formData);
      setIsDirty(false);
      showToast('Site settings saved successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings.';
      showToast(msg, 'error');
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('Reset all site settings to default configuration? You will need to click Save to persist this.')) {
      setFormData(JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS)));
      setIsDirty(true);
      showToast('Reset form to default baseline.', 'success');
    }
  };

  // Handle Avatar Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const asset = await uploadMediaAsset(file, 'avatar', {
        en: `Avatar - ${formData.profile.name}`,
        vi: `Ảnh đại diện - ${formData.profile.name}`,
      });

      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: asset.public_url,
        },
      }));
      setIsDirty(true);
      setIsUploadingAvatar(false);
      showToast('Avatar uploaded successfully!', 'success');
    } catch (err: unknown) {
      setIsUploadingAvatar(false);
      const msg = err instanceof Error ? err.message : 'Avatar upload failed';
      showToast(msg, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading Site Settings...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <div>
          <h4 className="text-sm font-bold">Failed to load site settings</h4>
          <p className="text-xs text-rose-400 mt-0.5">Please check network connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8 max-w-6xl mx-auto pb-16"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-xl border ${
              toastType === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/40 shadow-rose-950/50'
            }`}
          >
            {toastType === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Site Settings & Profile
            </h1>
            {isDirty && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                Unsaved changes
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Singleton configuration: Profile metadata, CV asset, technical skills, experience timeline, and SEO defaults.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900/50 text-white font-semibold text-xs shadow-lg shadow-teal-900/30 transition-all cursor-pointer"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-md shadow-teal-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: Profile & Bio ─── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar & Card Preview */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-6 flex flex-col items-center text-center">
                <div className="relative group mb-4">
                  <img
                    src={formData.profile.avatar || '/avatar.jpg'}
                    alt={formData.profile.name}
                    className="w-28 h-28 rounded-2xl object-cover border-2 border-teal-500/30 shadow-xl shadow-teal-950"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatar.jpg';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold transition-opacity cursor-pointer gap-1"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Change</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <h3 className="text-base font-bold text-white font-display">{formData.profile.name}</h3>
                <p className="text-xs text-teal-400 font-medium mt-0.5">{formData.profile.title}</p>
                <p className="text-[11px] text-slate-500 mt-1">{formData.profile.location}</p>

                <div className="w-full mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-3">
                  {formData.profile.email && (
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {formData.profile.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Avatar Direct URL Input */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={formData.profile.avatar || ''}
                  onChange={(e) =>
                    updateForm('profile', { ...formData.profile, avatar: e.target.value })
                  }
                  placeholder="/avatar.jpg or https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Profile Fields */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 font-display">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.profile.name}
                      onChange={(e) =>
                        updateForm('profile', { ...formData.profile, name: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={formData.profile.title}
                      onChange={(e) =>
                        updateForm('profile', { ...formData.profile, title: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={formData.profile.headline || ''}
                      onChange={(e) =>
                        updateForm('profile', { ...formData.profile, headline: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.profile.location || ''}
                      onChange={(e) =>
                        updateForm('profile', { ...formData.profile, location: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4 font-display">
                    Contact & Social Links
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.profile.email}
                        onChange={(e) =>
                          updateForm('profile', { ...formData.profile, email: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        LinkedIn URL
                      </label>
                      <input
                        type="text"
                        value={formData.profile.linkedin}
                        onChange={(e) =>
                          updateForm('profile', { ...formData.profile, linkedin: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Telegram URL
                      </label>
                      <input
                        type="text"
                        value={formData.profile.telegram || ''}
                        onChange={(e) =>
                          updateForm('profile', { ...formData.profile, telegram: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        GitHub URL
                      </label>
                      <input
                        type="text"
                        value={formData.profile.github || ''}
                        onChange={(e) =>
                          updateForm('profile', { ...formData.profile, github: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Bilingual Bio */}
                <div className="pt-4 border-t border-slate-800/80 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 font-display">
                    Bilingual Biography
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-teal-300 mb-1.5 flex items-center justify-between">
                      <span>Bio (English)</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {formData.profile.bio?.en?.length || 0} characters
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.profile.bio?.en || ''}
                      onChange={(e) =>
                        updateForm('profile', {
                          ...formData.profile,
                          bio: { ...formData.profile.bio, en: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center justify-between">
                      <span>Bio (Vietnamese)</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {formData.profile.bio?.vi?.length || 0} characters
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.profile.bio?.vi || ''}
                      onChange={(e) =>
                        updateForm('profile', {
                          ...formData.profile,
                          bio: { ...formData.profile.bio, vi: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: CV Management ─── */}
      {activeTab === 'cv' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Curriculum Vitae (CV) PDF Document
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Uploaded and distributed globally via Cloudinary CDN. Automatically syncs with public header CTA, shortlinks, and recruiter downloads.
              </p>
            </div>

            <CloudinaryPdfUploader
              value={formData.profile.cv_path || ''}
              onChange={(url) => {
                updateForm('profile', { ...formData.profile, cv_path: url });
                showToast('CV document updated successfully!', 'success');
              }}
              folder="portfolio/cv"
              label="Curriculum Vitae (CV) PDF Asset"
              helperText="Upload official resume in PDF format (Direct Cloudinary CDN)"
            />
          </div>
        </div>
      )}

      {/* ─── TAB 3: Skills & Stack ─── */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Skills, Competencies & Technology Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Organized by domain categories. Displayed on the interactive Skill Matrix and Character Stats canvas.
              </p>
            </div>

            {/* Render each skill category */}
            <div className="space-y-6">
              {Object.entries(formData.skills).map(([categoryKey, skillList]) => {
                const list = skillList || [];
                const currentInput = newSkillInputs[categoryKey] || '';

                const handleAddSkill = () => {
                  if (!currentInput.trim()) return;
                  const updatedList = [...list, currentInput.trim()];
                  const updatedSkills = {
                    ...formData.skills,
                    [categoryKey]: updatedList,
                  };
                  updateForm('skills', updatedSkills);
                  setNewSkillInputs((prev) => ({ ...prev, [categoryKey]: '' }));
                };

                const handleRemoveSkill = (indexToRemove: number) => {
                  const updatedList = list.filter((_, idx) => idx !== indexToRemove);
                  const updatedSkills = {
                    ...formData.skills,
                    [categoryKey]: updatedList,
                  };
                  updateForm('skills', updatedSkills);
                };

                const handleDeleteCategory = () => {
                  if (window.confirm(`Delete the entire category "${categoryKey}"?`)) {
                    const copy = { ...formData.skills };
                    delete copy[categoryKey];
                    updateForm('skills', copy);
                  }
                };

                return (
                  <div
                    key={categoryKey}
                    className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono">
                        {categoryKey.replace(/_/g, ' ')} ({list.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleDeleteCategory}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {list.map((skill, idx) => (
                        <span
                          key={`${skill}-${idx}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 group hover:border-slate-700 transition-colors"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(idx)}
                            className="text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add new skill input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={currentInput}
                        onChange={(e) =>
                          setNewSkillInputs((prev) => ({
                            ...prev,
                            [categoryKey]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder={`Add skill to ${categoryKey.replace(/_/g, ' ')}...`}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Category Section */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New Category Name (e.g. tools_and_devops)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 w-full sm:w-auto"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newCategoryName.trim()) return;
                  const key = newCategoryName.toLowerCase().trim().replace(/\s+/g, '_');
                  if (formData.skills[key]) {
                    showToast('Category already exists!', 'error');
                    return;
                  }
                  updateForm('skills', {
                    ...formData.skills,
                    [key]: [],
                  });
                  setNewCategoryName('');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: Experience Timeline ─── */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Career Experience Timeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological milestones shown on clipboard and experience overview timeline.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newItem: SiteExperienceItem = {
                    company: 'New Organization',
                    role: 'Lead Product Designer',
                    period: '2026 - Present',
                    description: {
                      en: 'Led end-to-end design & product architecture.',
                      vi: 'Dẫn dắt thiết kế & kiến trúc sản phẩm.',
                    },
                    details: ['Built design tokens and token pipelines.'],
                  };
                  updateForm('experience', [newItem, ...formData.experience]);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            {/* Experience Items List */}
            <div className="space-y-4">
              {formData.experience.map((item, idx) => {
                const descEn = typeof item.description === 'string' ? item.description : item.description?.en || '';
                const descVi = typeof item.description === 'string' ? item.description : item.description?.vi || '';

                const handleUpdateItem = (field: keyof SiteExperienceItem, val: unknown) => {
                  const copy = [...formData.experience];
                  copy[idx] = {
                    ...copy[idx],
                    [field]: val,
                  };
                  updateForm('experience', copy);
                };

                const handleRemoveItem = () => {
                  if (window.confirm(`Delete experience entry for "${item.company}"?`)) {
                    updateForm('experience', formData.experience.filter((_, i) => i !== idx));
                  }
                };

                const handleMove = (direction: 'up' | 'down') => {
                  const copy = [...formData.experience];
                  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
                  if (targetIdx < 0 || targetIdx >= copy.length) return;
                  const temp = copy[idx];
                  copy[idx] = copy[targetIdx];
                  copy[targetIdx] = temp;
                  updateForm('experience', copy);
                };

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs font-bold font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">{item.company || 'Company'}</span>
                        <span className="text-xs text-slate-400">&bull; {item.role}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove('up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-30"
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove('down')}
                          disabled={idx === formData.experience.length - 1}
                          className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-30"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveItem}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                          title="Delete position"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Company</label>
                        <input
                          type="text"
                          value={item.company}
                          onChange={(e) => handleUpdateItem('company', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Role / Title</label>
                        <input
                          type="text"
                          value={item.role}
                          onChange={(e) => handleUpdateItem('role', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Timeline / Period</label>
                        <input
                          type="text"
                          value={item.period}
                          onChange={(e) => handleUpdateItem('period', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-teal-300 mb-1">Summary (English)</label>
                        <input
                          type="text"
                          value={descEn}
                          onChange={(e) =>
                            handleUpdateItem('description', {
                              en: e.target.value,
                              vi: descVi,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-300 mb-1">Summary (Vietnamese)</label>
                        <input
                          type="text"
                          value={descVi}
                          onChange={(e) =>
                            handleUpdateItem('description', {
                              en: descEn,
                              vi: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Bullet point details */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                        Key Accomplishments & Deliverables (One per line)
                      </label>
                      <textarea
                        rows={3}
                        value={(item.details || []).join('\n')}
                        onChange={(e) =>
                          handleUpdateItem(
                            'details',
                            e.target.value.split('\n').filter((l) => l.trim().length > 0)
                          )
                        }
                        placeholder="Bullet 1&#10;Bullet 2&#10;Bullet 3"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: Design Process ─── */}
      {activeTab === 'process' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Design & Delivery Methodology Steps
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  4-step framework rendered in the Process Notebook modal and process cards.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newStep: SiteProcessItem = {
                    step: formData.process.length + 1,
                    title: { en: 'New Phase', vi: 'Giai đoạn mới' },
                    desc: { en: 'Phase description', vi: 'Mô tả giai đoạn' },
                    icon: '🚀',
                    details: ['Deliverable 1', 'Deliverable 2'],
                  };
                  updateForm('process', [...formData.process, newStep]);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.process.map((step, idx) => {
                const titleEn = typeof step.title === 'string' ? step.title : step.title?.en || '';
                const titleVi = typeof step.title === 'string' ? step.title : step.title?.vi || '';
                const descEn = typeof step.desc === 'string' ? step.desc : step.desc?.en || '';
                const descVi = typeof step.desc === 'string' ? step.desc : step.desc?.vi || '';

                const handleUpdateStep = (field: keyof SiteProcessItem, val: unknown) => {
                  const copy = [...formData.process];
                  copy[idx] = { ...copy[idx], [field]: val };
                  updateForm('process', copy);
                };

                const handleRemoveStep = () => {
                  if (window.confirm(`Delete step ${step.step}?`)) {
                    updateForm('process', formData.process.filter((_, i) => i !== idx));
                  }
                };

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{step.icon || '✨'}</span>
                        <span className="text-xs font-bold text-white">Step {step.step}: {titleEn}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveStep}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Step Number</label>
                        <input
                          type="number"
                          value={step.step}
                          onChange={(e) => handleUpdateStep('step', parseInt(e.target.value) || idx + 1)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Icon / Emoji</label>
                        <input
                          type="text"
                          value={step.icon || ''}
                          onChange={(e) => handleUpdateStep('icon', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-teal-300 mb-1">Title (EN)</label>
                        <input
                          type="text"
                          value={titleEn}
                          onChange={(e) => handleUpdateStep('title', { en: e.target.value, vi: titleVi })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-300 mb-1">Title (VI)</label>
                        <input
                          type="text"
                          value={titleVi}
                          onChange={(e) => handleUpdateStep('title', { en: titleEn, vi: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-teal-300 mb-1">Subtitle / Goal (EN)</label>
                        <input
                          type="text"
                          value={descEn}
                          onChange={(e) => handleUpdateStep('desc', { en: e.target.value, vi: descVi })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-300 mb-1">Subtitle / Goal (VI)</label>
                        <input
                          type="text"
                          value={descVi}
                          onChange={(e) => handleUpdateStep('desc', { en: descEn, vi: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Methods & Techniques (One per line)
                      </label>
                      <textarea
                        rows={2}
                        value={(step.details || []).join('\n')}
                        onChange={(e) =>
                          handleUpdateStep(
                            'details',
                            e.target.value.split('\n').filter((l) => l.trim().length > 0)
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 6: SEO & Social Defaults ─── */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 font-display">
                  Global Meta Tags & Open Graph
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Default Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo_defaults?.title || ''}
                    onChange={(e) =>
                      updateForm('seo_defaults', {
                        ...formData.seo_defaults,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Default Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.seo_defaults?.description || ''}
                    onChange={(e) =>
                      updateForm('seo_defaults', {
                        ...formData.seo_defaults,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    OG Image URL (Social Share Card)
                  </label>
                  <input
                    type="text"
                    value={formData.seo_defaults?.og_image || ''}
                    onChange={(e) =>
                      updateForm('seo_defaults', {
                        ...formData.seo_defaults,
                        og_image: e.target.value,
                      })
                    }
                    placeholder="/assets/og-preview.png or https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Keywords Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Keywords / Target Topics
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.seo_defaults?.keywords || []).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                      >
                        <span>{keyword}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.seo_defaults?.keywords || []).filter(
                              (_, i) => i !== idx
                            );
                            updateForm('seo_defaults', {
                              ...formData.seo_defaults,
                              keywords: updated,
                            });
                          }}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newKeywordInput}
                      onChange={(e) => setNewKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!newKeywordInput.trim()) return;
                          const currentKeywords = formData.seo_defaults?.keywords || [];
                          updateForm('seo_defaults', {
                            ...formData.seo_defaults,
                            keywords: [...currentKeywords, newKeywordInput.trim()],
                          });
                          setNewKeywordInput('');
                        }
                      }}
                      placeholder="Add keyword and press Enter..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newKeywordInput.trim()) return;
                        const currentKeywords = formData.seo_defaults?.keywords || [];
                        updateForm('seo_defaults', {
                          ...formData.seo_defaults,
                          keywords: [...currentKeywords, newKeywordInput.trim()],
                        });
                        setNewKeywordInput('');
                      }}
                      className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Search Engine Snippet Preview */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 space-y-4">
                <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider font-mono">
                  Google Search Snippet Preview
                </span>

                <div className="p-4 rounded-xl bg-white text-slate-900 space-y-1 shadow-md">
                  <div className="text-[11px] text-slate-600 flex items-center gap-1 truncate">
                    <span>https://phuchoang.dev</span>
                  </div>
                  <h4 className="text-sm font-medium text-blue-800 line-clamp-1 hover:underline cursor-pointer">
                    {formData.seo_defaults?.title || 'Portfolio Title'}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {formData.seo_defaults?.description || 'Portfolio meta description preview...'}
                  </p>
                </div>
              </div>

              {/* Social OG Image Preview */}
              {formData.seo_defaults?.og_image && (
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 space-y-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                    Open Graph Card Preview
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img
                      src={formData.seo_defaults.og_image}
                      alt="OG Preview"
                      className="w-full h-36 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/og-product-figma.jpg';
                      }}
                    />
                    <div className="p-3 border-t border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        phuchoang.dev
                      </span>
                      <h5 className="text-xs font-bold text-white line-clamp-1">
                        {formData.seo_defaults?.title}
                      </h5>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
