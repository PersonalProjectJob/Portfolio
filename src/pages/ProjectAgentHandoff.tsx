import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { ZoomableImage } from '../components/ZoomableImage';
import {
  trackHandoffPdfView,
  trackHandoffPdfDownload,
  trackHandoffShareClick,
  trackHandoffImageZoom,
  trackHandoffDrillToggle,
  trackHandoffAssumptionExpand
} from '../utils/analytics';
import {
  FileText,
  Download,
  Check,
  Copy,
  Eye,
  X,
  Maximize2,
  Terminal,
  Activity,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const ProjectAgentHandoff: React.FC = () => {
  const { isLightMode, language } = useStore();

  const [isCopied, setIsCopied] = useState(false);
  const [isPreviewPdfOpen, setIsPreviewPdfOpen] = useState(false);
  const [activeDrillStep, setActiveDrillStep] = useState(0);
  const [expandedAssumption, setExpandedAssumption] = useState<number | null>(null);

  const isVi = language === 'vi';

  const theme = {
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/60 border-white/10',
    cardHighlight: isLightMode ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30',
    cardWarning: isLightMode ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-950/20 border-amber-500/30',
    cardStop: isLightMode ? 'bg-rose-50/70 border-rose-200' : 'bg-rose-950/20 border-rose-500/30',
    accent: isLightMode ? 'text-emerald-700' : 'text-emerald-400',
    textMuted: isLightMode ? 'text-slate-600' : 'text-slate-400',
    border: isLightMode ? 'border-slate-200' : 'border-slate-800',
    tableHeader: isLightMode ? 'bg-slate-100 text-slate-700' : 'bg-slate-800/80 text-slate-300',
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      trackHandoffShareClick();
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy URL:', err);
    }
  };

  const handleOpenPdf = (source: string) => {
    setIsPreviewPdfOpen(true);
    trackHandoffPdfView(source);
  };

  const handleDownloadPdf = () => {
    trackHandoffPdfDownload();
  };

  return (
    <CaseStudyLayout>
      <div className="relative z-10 max-w-4xl mx-auto space-y-16 md:space-y-24">

        {/* ─── Hero Header ─── */}
        <motion.section data-ux-section="hero" initial="hidden" animate="visible" variants={fadeInUp} className="pt-4">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isVi ? 'Field Notes // Automation 04' : 'Field notes // Automation 04'}</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                #Multi-Agent
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                #Harness
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                #Distributed Systems
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-serif leading-[1.1] text-slate-900 dark:text-slate-50">
              {isVi ? 'Bài Toán Bàn Giao Agent (The Agent Handoff Problem)' : 'The Agent Handoff Problem'}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-3xl">
              {isVi
                ? 'Bốn AI agent chia sẻ chung một bộ quy tắc và hàng đợi nhiệm vụ. Chỉ một agent có thể thực sự điều phối quy trình — khi agent này cạn quota giữa chừng, toàn bộ dự án bị đóng băng. Dưới đây là giải pháp kiến trúc để xử lý triệt để, và 8 giả định đã sụp đổ sau các bài kiểm thử thực chiến.'
                : 'Four AI coding agents shared one rule set and one work queue. Only one of them could actually drive the workflow — so when it ran out of quota mid-task, everything stopped. Here is what it took to fix that, and the eight things that turned out to be wrong along the way.'}
            </p>

            {/* Action Bar: PDF Deck Download & Preview */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleOpenPdf('hero_action_bar')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>{isVi ? 'Xem Tài Liệu PDF (Full Deck)' : 'View PDF Presentation Deck'}</span>
              </button>

              <a
                href="/documents/agent-handoff.pdf"
                download="agent-handoff.pdf"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{isVi ? 'Tải PDF gốc (429KB)' : 'Download PDF (429KB)'}</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? (isVi ? 'Đã sao chép' : 'Copied') : (isVi ? 'Chia sẻ bài viết' : 'Share Article')}</span>
              </button>
            </div>

            {/* 3 Metric counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100">4</div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {isVi ? 'AI Agent dùng chung 1 lớp quy tắc' : 'Agents sharing one rule layer'}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400">4</div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {isVi ? 'Lát cắt kiến tạo handoff an toàn' : 'Slices to make handoff safe'}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="text-3xl font-mono font-bold text-rose-600 dark:text-rose-400">8</div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {isVi ? 'Giả định sai lầm bị bác bỏ' : 'Assumptions that failed review'}
                </div>
              </div>
            </div>

            {/* Hero Illustration: Multi-Agent Command Center & Handoff */}
            <div className="pt-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900/40 shadow-xl group">
                <ZoomableImage
                  src="/images/case-study/harness_handoff_hero.jpg"
                  alt={isVi ? 'Trung tâm điều phối Multi-Agent AI và cơ chế bàn giao CAS' : 'Multi-Agent Handoff Command Center & Compare-And-Swap Protocol'}
                  className="w-full h-auto object-cover max-h-[460px] select-none"
                  onZoom={() => trackHandoffImageZoom('harness_handoff_hero', 'hero_header')}
                />
                <div className="p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-t border-white/10 text-xs sm:text-sm text-slate-300 flex items-center justify-between">
                  <span className="font-mono text-emerald-400 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    {isVi ? 'Hình 1 // Mô hình bàn giao giữa các agent khi chạm trần Quota qua Compare-And-Swap' : 'Fig 1 // Multi-Agent Command Center: Quota-Exceeded Handoff via CAS Lease'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                    {isVi ? 'Nhấp để phóng to' : 'Click to zoom'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─── Section 1: The Setup ─── */}
        <motion.section data-ux-section="problem_statement" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-6">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
            {isVi ? 'Bối Cảnh Khởi Điểm' : 'The Setup'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Dùng chung văn bản là phần việc dễ dàng' : 'Shared text was the easy half'}
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              {isVi
                ? 'Điểm khởi đầu khá thông thường: một kho lưu trữ chuẩn (canonical repo) chứa các tệp quy tắc và định nghĩa skill, được tạo liên kết tượng trưng (symlink) vào thư mục cấu hình của từng agent. Một nguồn chân lý duy nhất, phục vụ bốn đối tượng — một agent CLI, một agent CLI thứ hai từ nhà cung cấp khác, một agent tích hợp trong IDE, và một plugin của trình soạn thảo.'
                : 'The starting point was ordinary: a canonical repo holding rule files and skill definitions, symlinked into each agent\'s config directory. One source of truth, four consumers — a CLI-based coding agent, a second CLI agent from a different vendor, an IDE-based agent, and an editor plugin.'}
            </p>
            <p>
              {isVi
                ? 'Phần đó hoạt động tốt. Điều không hoạt động là làm thế nào để biết khi nào cần áp dụng quy tắc nào. Hai trong bốn agent có tệp khởi tạo (entry file) hoàn toàn trống rỗng — tài liệu mà runtime của chúng đọc lúc bắt đầu phiên làm việc để biết quy tắc nào đang tồn tại. Chúng có trọn bộ thư viện quy tắc trên đĩa nhưng không hề có chỉ mục tra cứu.'
                : 'That part worked. What did not work was knowing when to apply any of it. Two of the four agents had an empty entry file — the document their runtime reads at session start to learn which rules exist. They had the whole rule library on disk and no index into it.'}
            </p>
            <div className={`p-5 rounded-xl border-l-4 border-emerald-500 ${theme.cardHighlight}`}>
              <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200">
                {isVi
                  ? 'Hệ quả thực tế: Mọi nhiệm vụ đều phải điều phối ngược về agent duy nhất có nạp quy tắc, đơn giản vì nó là bên duy nhất biết các quy tắc đó tồn tại. Agent đó trở thành bên điều phối (orchestrator) một cách tình cờ, không phải do chủ ý thiết kế.'
                  : 'The practical result: every task routed back through the one agent that did load the rules, because it was the only one that knew they were there. That agent became the orchestrator by accident, not by design.'}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── Section 2: The Real Problem ─── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-6">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
            {isVi ? 'Bản Chất Vấn Đề' : 'The Real Problem'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Trạng thái nằm trong hội thoại, không nằm trong tệp tin' : 'State lived in a conversation, not a file'}
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              {isVi
                ? 'Khi bảng routing đã được sửa xong, bất kỳ agent nào cũng có thể đọc được quy tắc. Nhưng không agent nào có thể tiếp quản công việc đang dở. Nhánh nào, worktree nào, đang ở bước nào, ai đang giữ quyền, những gì đã được kiểm thử xác minh — toàn bộ chỉ tồn tại bên trong context window của agent điều phối.'
                : 'With the routing fixed, any agent could read the rules. None of them could pick up work in progress. Which branch, which worktree, which step, who was holding it, what had already been verified — all of it existed only in the orchestrating agent\'s context window.'}
            </p>
            <div className={`p-5 rounded-xl border-l-4 border-rose-500 ${theme.cardStop}`}>
              <p className="text-sm sm:text-base font-semibold text-rose-900 dark:text-rose-200">
                {isVi
                  ? 'Ghi chú trong backlog đã hoàn toàn sai lầm. Hàng đợi đã có sẵn. Thứ nó thiếu là khái niệm về việc tiếp quản an toàn (safe takeover) — và lỗ hổng đó hoàn toàn vô hình cho đến khi có hai agent cùng chạm vào một nhiệm vụ.'
                  : 'The backlog note was wrong. The queue existed. What it did not have was any notion of safe takeover — and that gap is invisible until two agents touch the same task.'}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── Section 3: What Was Actually Broken ─── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-6">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
            {isVi ? 'Điểm Hỏng Hóc Thật Sự' : 'What Was Actually Broken'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Bốn lỗ hổng chí mạng trong một hàng đợi trông tưởng như hoàn hảo' : 'Four holes in a queue that looked finished'}
          </h2>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className={theme.tableHeader}>
                  <th className="p-3.5 font-mono font-bold uppercase text-xs w-1/4">Command</th>
                  <th className="p-3.5 font-mono font-bold uppercase text-xs w-1/3">What it did</th>
                  <th className="p-3.5 font-mono font-bold uppercase text-xs">Why that fails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-3.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">claim</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {isVi ? 'Chỉ từ chối khi task ở trạng thái in-progress.' : 'Refused only when the task was in the in-progress state.'}
                  </td>
                  <td className="p-3.5 text-rose-600 dark:text-rose-400 font-medium">
                    {isVi ? 'Agent chết khi đang verify khiến task vẫn có chủ nhưng bị claim đè. Hai agent cùng làm một task.' : 'An agent dying during verify left a task owned but claimable. Two agents, one task.'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-3.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">handoff</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {isVi ? 'Xóa trường owner vô điều kiện.' : 'Cleared the owner field unconditionally.'}
                  </td>
                  <td className="p-3.5 text-rose-600 dark:text-rose-400 font-medium">
                    {isVi ? 'Không kiểm tra ai đang gọi — bất kỳ ai cũng có thể giải phóng task của người khác. Cướp quyền không có khóa.' : 'No caller check — anyone could release anyone\'s task. Takeover with no lock.'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-3.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">set --state</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {isVi ? 'Chấp nhận bất kỳ trạng thái nào, kể cả trạng thái kết thúc (done).' : 'Accepted any state, including the terminal one.'}
                  </td>
                  <td className="p-3.5 text-rose-600 dark:text-rose-400 font-medium">
                    {isVi ? 'Nhảy cóc vượt qua hoàn toàn quality gate mà lệnh đóng chuyên dụng bắt buộc phải kiểm tra.' : 'Walked straight past the quality gate that the dedicated close command enforced.'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-3.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">gate</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {isVi ? 'Chỉ đọc một file verification toàn cục duy nhất.' : 'Read one global verification file.'}
                  </td>
                  <td className="p-3.5 text-rose-600 dark:text-rose-400 font-medium">
                    {isVi ? 'Không ràng buộc theo task, branch, commit hay diff — kết quả cũ rích có thể được dùng để đóng một task hoàn toàn không liên quan.' : 'Not bound to task, branch, commit or diff — a stale result could close an unrelated task.'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-sm">
            <strong>{isVi ? 'Nguyên nhân ngầm sâu hơn' : 'Underneath all four'}:</strong>{' '}
            {isVi
              ? 'Bản thân bộ chạy verification trả về kết quả PASS khi mọi kiểm tra đều bị bỏ qua (skipped), đơn giản vì nó đếm số lỗi và thấy bằng 0. Một repo không có script test nào vẫn tạo ra phán quyết màu xanh.'
              : 'The verification runner itself returned pass when every check was skipped, because it counted failures and found none. A repository with no test script configured produced a green verdict.'}
          </div>
        </motion.section>

        {/* ─── Section 4: The Fix: Distributed Systems Primitives ─── */}
        <motion.section data-ux-section="system_architecture" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-8">
          <div>
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
              {isVi ? 'Giải Pháp Kiến Trúc' : 'The Fix'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100 mt-2">
              {isVi ? 'Mượn các nguyên mẫu từ hệ thống phân tán' : 'Borrow the primitives from distributed systems'}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3">
              {isVi
                ? 'Không có gì trong số này là hoàn toàn mới lạ. Hãy coi mỗi AI agent như một worker không đáng tin cậy cạnh tranh trên cùng một bản ghi dữ liệu chia sẻ, và các giải pháp tiêu chuẩn của hệ thống phân tán sẽ áp dụng vừa vặn.'
                : 'None of this is novel. Treat each agent as an unreliable worker competing for a shared record, and the standard answers apply directly.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border ${theme.card} space-y-3`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-mono font-bold text-sm">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isVi ? 'Lease và Compare-And-Swap' : 'Leases and compare-and-swap'}
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isVi
                  ? 'Quyền sở hữu hết hạn theo thời gian. Mọi thao tác ghi đều mang theo phiên bản kỳ vọng; file lock tuần tự hóa các bên ghi và version được đọc lại bên trong lock. Tiếp quản bắt buộc phải nêu tên owner hiện tại và một lease đã hết hạn.'
                  : 'Ownership expires. Every mutation carries the version it expects; a lockfile serialises writers and the version is re-read inside the lock. Takeover requires naming the current owner and an expired lease.'}
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${theme.card} space-y-3`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center font-mono font-bold text-sm">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isVi ? 'Di trú & Tách biệt Verifier' : 'Migration & splitting the verifier'}
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isVi
                  ? 'Việc siết chặt schema cần một đường dẫn di trú an toàn. Tách riêng bộ xác minh: nó chạy hoàn toàn chỉ đọc (read-only) và in JSON có cấu trúc ra màn hình, và một bên hoàn toàn khác sẽ ghi kết quả đó vào bản ghi task.'
                  : 'The schema change needed a migration path. Separately, the verification runner was split: it now runs read-only and prints structured output, and a different party writes the result into the task record.'}
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${theme.card} space-y-3`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-mono font-bold text-sm">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isVi ? 'Controller phát hành hành động tiếp theo' : 'A controller that emits the next action'}
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isVi
                  ? 'Một lệnh chỉ đọc phân tích manifest, xác định vai trò thông qua công cụ phân vai, và phát ra một hành động máy đọc duy nhất: ai thực thi, với model và sandbox nào, lệnh nào cần chạy, và điều gì chứng minh hoàn thành.'
                  : 'One read-only command reads the manifest, resolves the role through the existing role-assignment tool, and emits a single machine-readable action: who acts, with which model and sandbox, which command to run, and what marks it complete.'}
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${theme.card} space-y-3`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-mono font-bold text-sm">
                  04
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isVi ? 'Adapter kích hoạt agent & ranh giới trung thực' : 'An adapter that actually spawns the agent'}
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isVi
                  ? 'Đối với agent có thể gọi từ shell, adapter chạy nó thật sự — truyền model, effort và sandbox, bọc prompt trong ranh giới thư mục, và chỉ áp dụng đổi trạng thái khi verdict là pass. Với agent không thể script, nó sinh file prompt sẵn sàng để dán.'
                  : 'For the one agent invocable from a shell, the adapter really runs it — passing through the model, effort and sandbox named in the action, wrapping the prompt in a filesystem boundary, and applying the state change only on a pass verdict.'}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── Section 5: Separation of Duties ─── */}
        <motion.section data-ux-section="interaction_protocol" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-6">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
            {isVi ? 'Phân Định Thẩm Quyền' : 'Separation of Duties'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Ba bên độc lập tham gia xác minh, không bao giờ là một' : 'Three parties touch a verification, never one'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {isVi
              ? 'Thiết kế ban đầu để một lệnh duy nhất vừa chạy kiểm tra vừa ghi phán quyết. Điều này đã âm thầm vi phạm chính sách của dự án rằng một verifier không được sở hữu công cụ ghi — và nó có nghĩa là agent viết code cũng có thể tự ghi nhận lời phán quyết cho chính nó.'
              : 'The original design had a single command run the checks and write the verdict. That quietly violated the project\'s own policy that a verifier holds no write tools — and it meant the agent that wrote the code could also record the judgement on it.'}
          </p>

          {/* Architecture Illustration: Separation of Duties */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900/40 shadow-xl group">
            <ZoomableImage
              src="/images/case-study/harness_verifier_architecture.jpg"
              alt={isVi ? 'Mô hình phân định tam quyền giữa Executor, Verifier và Controller' : 'Three-Party Separation of Duties: Executor, Verifier, and Controller'}
              className="w-full h-auto object-cover max-h-[440px] select-none"
              onZoom={() => trackHandoffImageZoom('harness_verifier_architecture', 'separation_of_duties')}
            />
            <div className="p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-t border-white/10 text-xs sm:text-sm text-slate-300 flex items-center justify-between">
              <span className="font-mono text-teal-400 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                {isVi ? 'Hình 2 // Tam quyền phân lập: Executor (Sandbox) ⟷ Verifier (Read-Only) ⟷ Action Controller' : 'Fig 2 // Three-Party Separation: Executor (Sandbox) ⟷ Verifier (Read-Only) ⟷ Action Controller'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                {isVi ? 'Nhấp để phóng to' : 'Click to zoom'}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed shadow-lg">
            <div className="text-emerald-400 font-bold mb-3">// Architecture Pipeline: Strict Separation of Duties</div>
            <div>verifier   -&gt;  runs checks read-only, prints JSON to stdout</div>
            <div>controller -&gt;  ingests that JSON, writes the signed artifact</div>
            <div>owner      -&gt;  reads the artifact, records the gate verdict</div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-amber-300 font-semibold">
              constraint:  controller != executor  and  controller != verifier
            </div>
          </div>

          <div className={`p-5 rounded-xl border-l-4 border-emerald-500 ${theme.cardHighlight}`}>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200">
              {isVi
                ? 'Một tác dụng phụ tuyệt vời: verifier giờ đây có thể chạy trong một sandbox hoàn toàn chỉ đọc (fully read-only sandbox), bởi vì nó không còn cần phải ghi bất kỳ thứ gì vào ổ đĩa nữa.'
                : 'A pleasant side effect: the verifier can now run in a fully read-only sandbox, because it no longer needs to write anything at all.'}
            </p>
          </div>
        </motion.section>

        {/* ─── Section 6: Closing Condition: The Drill ─── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-6">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
            {isVi ? 'Tiêu Chí Đóng' : 'Closing Condition'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Một cuộc diễn tập ngắt quãng, không phải checklist tĩnh' : 'A drill, not a checklist'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {isVi
              ? 'Agent review đã đặt ra tiêu chuẩn để coi việc này là hoàn thành: ngắt quãng agent điều phối tại MỌI điểm chuyển tiếp trạng thái, để một agent khác tiếp quản mà không cần sửa trạng thái bằng tay, và hoàn thành công việc trơn tru.'
              : 'The reviewing agent set the bar for calling this done, and it was a good bar: interrupt the orchestrator at every transition, have a different agent take over without hand-editing state, and reach completion.'}
          </p>

          {/* Fault-Injection Crash-Resume Drill Illustration */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900/40 shadow-xl group">
            <ZoomableImage
              src="/images/case-study/harness_crash_drill.jpg"
              alt={isVi ? 'Mô phỏng diễn tập ngắt quãng đột ngột và tự phục hồi an toàn qua sổ cái đĩa' : 'Fault-Injection Crash-Resume Drill and Ledger Checkpoint'}
              className="w-full h-auto object-cover max-h-[440px] select-none"
              onZoom={() => trackHandoffImageZoom('harness_crash_drill', 'crash_drill')}
            />
            <div className="p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-t border-white/10 text-xs sm:text-sm text-slate-300 flex items-center justify-between">
              <span className="font-mono text-purple-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                {isVi ? 'Hình 3 // Bài diễn tập chịu lỗi: Mất nguồn / kiệt Quota và tiếp quản qua sổ cái tiến trình' : 'Fig 3 // Fault-Injection Drill: Power cut & state resume via persistent ledger'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                {isVi ? 'Nhấp để phóng to' : 'Click to zoom'}
              </span>
            </div>
          </div>

          {/* Interactive Live Drill Inspector with Telemetry */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                {isVi ? 'Trực quan hóa các bước diễn tập tiếp quản (Nhấp để xem chi tiết log)' : 'Interactive Takeover Drill Steps (Click to inspect log output)'}
              </span>
              <span className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                CAS v5 // PASS
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 0, label: '01. Interrupt', sub: 'Quota Drop', color: 'border-rose-500/40 text-rose-500' },
                { id: 1, label: '02. Takeover', sub: 'CAS Acquire', color: 'border-amber-500/40 text-amber-500' },
                { id: 2, label: '03. Read-Only', sub: 'Verifier Test', color: 'border-teal-500/40 text-teal-500' },
                { id: 3, label: '04. State Bump', sub: 'Close Gate', color: 'border-emerald-500/40 text-emerald-500' },
              ].map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setActiveDrillStep(step.id);
                    trackHandoffDrillToggle(step.id + 1, `${step.label} - ${step.sub}`);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    activeDrillStep === step.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm'
                      : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{step.label}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{step.sub}</div>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0d1117] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-400">node harness-task.mjs drill --step={activeDrillStep + 1}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {activeDrillStep === 0 && 'STEP 1/4'}
                  {activeDrillStep === 1 && 'STEP 2/4'}
                  {activeDrillStep === 2 && 'STEP 3/4'}
                  {activeDrillStep === 3 && 'STEP 4/4'}
                </span>
              </div>
              <div className="p-5 font-mono text-xs sm:text-sm text-slate-300 space-y-2 overflow-x-auto">
                {activeDrillStep === 0 && (
                  <>
                    <div className="text-rose-400">[DRILL:FAULT_INJECT] Simulating SIGKILL on orchestrator Agent-A</div>
                    <div className="text-slate-400">&gt; Process 4128 killed mid-execution during task 094_agent_rules</div>
                    <div className="text-amber-400">&gt; Status on disk: state=&quot;in-progress&quot;, owner=&quot;agent-a&quot;, lease_expires=1726308000 (EXPIRED)</div>
                    <div className="text-slate-300">&gt; Worktree lock intact, uncommitted buffer saved in .agent-tasks/progress.log</div>
                  </>
                )}
                {activeDrillStep === 1 && (
                  <>
                    <div className="text-amber-400">[DRILL:TAKEOVER] Agent-B initiates takeover protocol</div>
                    <div className="text-slate-400">&gt; Inspecting lease status: Current owner &quot;agent-a&quot; lease is stale by 42s</div>
                    <div className="text-teal-400">&gt; Attempting atomic CAS mutation: expectedOwner=&quot;agent-a&quot;, expectedVersion=4</div>
                    <div className="text-emerald-400 font-bold">&gt; CAS_MUTATION_SUCCESS: Task lease granted to Agent-B (version: 4 -&gt; 5)</div>
                  </>
                )}
                {activeDrillStep === 2 && (
                  <>
                    <div className="text-teal-400">[DRILL:VERIFY] Spawning isolated Verifier in read-only sandbox</div>
                    <div className="text-slate-400">&gt; ReadOnlyFileSystemPolicy: Write syscalls DENIED</div>
                    <div className="text-slate-300">&gt; Running test suites: node test-view-mode.mjs &amp;&amp; oxlint</div>
                    <div className="text-emerald-400">&gt; STDOUT JSON: {`{"verdict":"pass", "stage":"verify", "sha":"dd84437", "regressions":0}`}</div>
                  </>
                )}
                {activeDrillStep === 3 && (
                  <>
                    <div className="text-emerald-400 font-bold">[DRILL:CLOSE] Action Controller ingestion &amp; state finalization</div>
                    <div className="text-slate-300">&gt; Signature verified: Verifier output signed by runtime sha256</div>
                    <div className="text-teal-400">&gt; Advancing task state: verify@5 -&gt; review@6</div>
                    <div className="text-emerald-300 font-bold">&gt; DRILL_VERDICT: PASS (Recovery time: 1.84s, zero state corruption)</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─── Section 7: 8 Assumptions That Failed ─── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-6">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
            {isVi ? 'Bài Học Đắt Giá' : 'What Went Wrong'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Tám giả định không thể vượt qua vòng kiểm thử' : 'Eight assumptions that did not survive'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            {isVi
              ? 'Đây là những phần đáng giá nhất để đúc rút. Mỗi giả định trong số này đều từng mang lại kết quả xanh (pass) vào thời điểm viết, và mọi giả định đó đều đã sai.'
              : 'These are the parts worth stealing. Every one of them produced a green result at the time, and every one was wrong.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                tag: 'Dead configuration',
                title: isVi ? 'Cấu hình chết không ai đọc' : 'A patch to a field nothing reads',
                desc: isVi
                  ? 'Grep tìm nơi tiêu thụ (consumer), không chỉ nơi khai báo. Thiết lập không có ai đọc chỉ là comment.'
                  : 'Grep for the consumer, not just the definition. A setting with no reader is a comment.',
              },
              {
                tag: 'Order of operations',
                title: isVi ? 'Hàng rào tự biến thành cạm bẫy' : 'The guardrail rewrote itself into a trap',
                desc: isVi
                  ? 'Template thay thế biến trước khi viết lại đường dẫn theo từng agent khiến agent bị cấm đọc chính thư mục của mình. Giải pháp: gắn sentinel.'
                  : 'Templates resolved placeholders before per-agent path rewriting. The fix: emitting a sentinel and substituting after rewriting.',
              },
              {
                tag: 'Test design',
                title: isVi ? 'Allowlist tự tha bổng những gì bị quên' : 'An allowlist exempts whatever you forget',
                desc: isVi
                  ? 'Thay vì duy trì allowlist viết tay (từng bỏ sót 5 vị trí gọi), thay thế bằng việc quét toàn bộ codebase tìm lời gọi thực tế.'
                  : 'Replacing a hand-written allowlist with a scan for actual invocations found missed call sites.',
              },
              {
                tag: 'Control group',
                title: isVi ? 'Vắng mặt trong danh sách lỗi không có nghĩa là pass' : 'Absent from failure list is not passing',
                desc: isVi
                  ? 'Một dòng bị thiếu có nghĩa là chưa biết, không phải là xanh. Kiểm tra baseline phải chạy độc lập trên cây checkout sạch.'
                  : 'A missing row means unknown, not green. Baseline suites must be fully compiled as a reliable control.',
              },
              {
                tag: 'Scope of evidence',
                title: isVi ? 'Một tệp test đơn lẻ không đại diện cho cả bộ suite' : 'One test file is not the suite',
                desc: isVi
                  ? 'Chỉ chạy một tệp test liên quan trực tiếp và kết luận đã xanh là ảo tưởng; kiểm tra toàn bộ suite sạch mới phát hiện hồi quy thật.'
                  : 'The full comparison against a clean checkout found regressions in files that had never been run.',
              },
              {
                tag: 'Migration',
                title: isVi ? 'Phải đếm các bản ghi đang chạy trước' : 'Count the live records first',
                desc: isVi
                  ? 'Siết chặt schema mà không có lệnh di trú đã làm đóng băng 8 task thật đang hoạt động. Phải cung cấp lệnh migrate trước.'
                  : 'Tightening the record schema without a migration command froze eight live task records mid-flight.',
              },
              {
                tag: 'Verification boundary',
                title: isVi ? 'Agent không thể tự xác minh cửa thoát của chính nó' : 'An agent cannot verify its own escape hatch',
                desc: isVi
                  ? 'Adapter gọi agent lồng nhau không thể tự test từ bên trong sandbox bị chặn mạng; bằng chứng phải đến từ bên ngoài.'
                  : 'The proof had to come from outside the sandbox because outbound network was blocked.',
              },
              {
                tag: 'Definition of done',
                title: isVi ? 'Artifact tồn tại != cơ chế failover chạy được' : 'Artifact exists != failover works',
                desc: isVi
                  ? 'Không được đánh đồng việc có file state trên đĩa với việc hệ thống có thể sống sót sau sự cố ngắt quãng thật.'
                  : 'Substituting "the artifact is present" for "the failure path works" proves nothing until interrupted.',
              },
            ].map((lesson, idx) => {
              const isExpanded = expandedAssumption === idx;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    const next = isExpanded ? null : idx;
                    setExpandedAssumption(next);
                    if (next !== null) {
                      trackHandoffAssumptionExpand(idx + 1, lesson.tag);
                    }
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${theme.card} hover:border-rose-500/40 hover:shadow-md ${
                    isExpanded ? 'ring-1 ring-rose-500/30' : ''
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      {lesson.tag}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-rose-500' : ''
                      }`}
                    />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{lesson.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Section 8: Summary & Deliberate Limits ─── */}
        <motion.section data-ux-section="impact_metrics" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-6">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
            {isVi ? 'Tổng Kết Thực Chiến' : 'If You Build One'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Tóm lược trong năm nguyên tắc cốt lõi' : 'The short version'}
          </h2>

          <div className={`p-6 rounded-2xl border ${theme.card} space-y-4 text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed`}>
            <p>
              <strong>{isVi ? 'Quy tắc chung là bài toán kết xuất:' : 'Shared rules are a rendering problem.'}</strong>{' '}
              {isVi
                ? 'Một bảng định tuyến duy nhất, sinh ra cho từng agent, kiểm tra độ lệch. Phần khó không bao giờ nằm ở phần văn bản.'
                : 'One routing table, generated per agent, checked for drift. The hard part is never the text.'}
            </p>
            <p>
              <strong>{isVi ? 'Bàn giao là bài toán tương tranh:' : 'Handoff is a concurrency problem.'}</strong>{' '}
              {isVi
                ? 'Lease, compare-and-swap, đồ thị chuyển tiếp rõ ràng, và kết quả xác minh gắn chặt với đúng cây thư mục mà chúng mô tả.'
                : 'Leases, compare-and-swap, an explicit transition graph, and verification results bound to the exact tree they describe.'}
            </p>
            <p>
              <strong>{isVi ? 'Tách biệt các bên:' : 'Separate the parties.'}</strong>{' '}
              {isVi
                ? 'Bên viết code không được tự ký phán quyết cho nó. Bên chạy kiểm tra không cần quyền ghi để thực hiện.'
                : 'Whoever wrote the code does not record the verdict on it. Whoever runs the checks does not need write access to do so.'}
            </p>
            <p>
              <strong>{isVi ? 'Khép lại bằng diễn tập:' : 'Close reliability work with a drill.'}</strong>{' '}
              {isVi
                ? 'Ngắt quãng quy trình ở mọi bước và buộc một agent khác hoàn thành công việc. Một bảng danh sách tính năng không chứng minh được gì.'
                : 'Interrupt it at every transition and make something else finish the job. A checklist of declared capabilities proves nothing.'}
            </p>
            <p>
              <strong>{isVi ? 'Để công cụ dừng lại hỏi người dùng:' : 'Let the tooling stop and ask.'}</strong>{' '}
              {isVi
                ? 'Khi không có reviewer hợp lệ, đầu ra đúng đắn là tạm dừng có lý do rõ ràng, không phải là âm thầm bỏ qua.'
                : 'When no eligible reviewer exists, the correct output is a halt with a reason, not a silent skip.'}
            </p>
          </div>
        </motion.section>

      </div>

      {/* ─── Embedded PDF Preview Drawer / Modal ─── */}
      <AnimatePresence>
        {isPreviewPdfOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-sm sm:text-base text-slate-100">
                    The Agent Handoff Problem — Presentation Deck (PDF)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="/documents/agent-handoff.pdf"
                    download="agent-handoff.pdf"
                    onClick={handleDownloadPdf}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                  </a>
                  <a
                    href="/documents/agent-handoff.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Open in new tab"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsPreviewPdfOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full bg-slate-950">
                <iframe
                  src="/documents/agent-handoff.pdf#toolbar=1"
                  className="w-full h-full border-none"
                  title="Agent Handoff PDF"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CaseStudyLayout>
  );
};

export default ProjectAgentHandoff;
