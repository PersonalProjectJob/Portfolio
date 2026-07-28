import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';

const IconCheck = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconX = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconArrowRight = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;

export const ProjectAgentRules: React.FC = () => {
  const { isLightMode, handleQuestSelect } = useStore();
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f172a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-white/10',
    cardHighlight: isLightMode ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-900/10 border-indigo-500/30',
    accent: isLightMode ? 'text-indigo-600' : 'text-indigo-400',
    glow: isLightMode ? 'shadow-[0_0_30px_rgba(79,70,229,0.15)]' : 'shadow-[0_0_30px_rgba(79,70,229,0.1)]'
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const [activeTab, setActiveTab] = useState(1);

  return (
    <CaseStudyLayout>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${isLightMode ? 'from-indigo-100/50 via-transparent to-transparent' : 'from-indigo-900/20 via-transparent to-transparent'}`}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">
        {/* 01. TỔNG QUAN */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">01. TỔNG QUAN</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                Biến "Kiến thức ngầm" thành Hệ thống vận hành chuẩn cho AI Agent
              </h1>
              <p className={`text-lg md:text-xl ${theme.textMuted} mb-8 leading-relaxed`}>
                Làm sao để một đội AI Agent biết phối hợp trơn tru như một team thật? Tôi đã đúc kết những quyết định thủ công (vốn chỉ nằm trong đầu con người) thành một hệ thống rule chặt chẽ — với luồng điều phối, vòng đời chuẩn và các chốt chặn rõ ràng.
              </p>
              <blockquote className={`p-6 border-l-4 border-indigo-500 ${theme.cardHighlight} rounded-r-xl italic ${theme.text} text-lg`}>
                Mục tiêu cốt lõi không phải là phó mặc mọi thứ cho AI tự tung tự tác. Mục tiêu là đảm bảo mỗi Agent nhận đúng context, làm đúng phần việc của mình và bàn giao kết quả sạch sẽ cho khâu tiếp theo.
              </blockquote>
            </div>
            <div className="flex items-center justify-center">
              <img src="/images/case-study/agent_rules_hero.jpg" alt="Tacit Knowledge to Systematic Rules" className="w-full rounded-2xl shadow-xl object-contain" />
            </div>
          </div>
        </motion.section>

        {/* 02. QUY TRÌNH BAN ĐẦU */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">02. QUY TRÌNH BAN ĐẦU</p>
          <h2 className="text-3xl font-bold mb-6">Quy trình ban đầu trông như thế nào?</h2>
          <img src="/images/case-study/workflow_original.jpg" alt="Workflow Original" className="w-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mb-6" />
          <p className={`mb-10 ${theme.textMuted}`}>
            Thực ra, trước khi <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">.agent-rules</code> ra đời, team chúng tôi ĐÃ có một quy trình Delivery khá bài bản. Vấn đề không nằm ở việc "thiếu quy trình", mà là quy trình này ngốn quá nhiều thời gian để điều phối thủ công.
          </p>

          <div className={`${theme.card} rounded-2xl overflow-hidden`}>
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
              {['User Story', 'GitHub Issue', 'Design', 'Implementation', 'Evidence', 'QA', 'Tracking'].map((tab, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveTab(idx + 1)}
                  className={`px-4 py-3 whitespace-nowrap text-sm font-medium transition-colors ${activeTab === idx + 1 ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {`0${idx + 1}. ${tab}`}
                </button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === 1 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">Artifact (Đầu ra)</h4>
                    <p className={theme.textMuted}>Xác định Goal, AC, chia Tasks</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">Điểm nghẽn (Thủ công)</h4>
                    <p className={theme.textMuted}>Có cần tạo ra User Story mới không?</p>
                  </div>
                </div>
              )}
              {activeTab === 2 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">Artifact (Đầu ra)</h4>
                    <p className={theme.textMuted}>Member-facing issue</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">Điểm nghẽn (Thủ công)</h4>
                    <p className={theme.textMuted}>Viết Issue theo format nào, assign cho ai?</p>
                  </div>
                </div>
              )}
              {activeTab === 3 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">Artifact (Đầu ra)</h4>
                    <p className={theme.textMuted}>Figma / HTML / PNG</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">Điểm nghẽn (Thủ công)</h4>
                    <p className={theme.textMuted}>Bản nào mới là Source of Truth?</p>
                  </div>
                </div>
              )}
              {activeTab === 4 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">Artifact (Đầu ra)</h4>
                    <p className={theme.textMuted}>Code</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">Điểm nghẽn (Thủ công)</h4>
                    <p className={theme.textMuted}>Giao cho Agent nào làm, khoanh vùng phạm vi tới đâu?</p>
                  </div>
                </div>
              )}
              {activeTab === 5 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">Artifact (Đầu ra)</h4>
                    <p className={theme.textMuted}>Screenshot / video / report</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">Điểm nghẽn (Thủ công)</h4>
                    <p className={theme.textMuted}>Lưu file vào thư mục nào, đặt tên ra sao?</p>
                  </div>
                </div>
              )}
              {activeTab === 6 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">Artifact (Đầu ra)</h4>
                    <p className={theme.textMuted}>Parent Task</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">Điểm nghẽn (Thủ công)</h4>
                    <p className={theme.textMuted}>Khi nào thì chuyển trạng thái sang Testing / Done?</p>
                  </div>
                </div>
              )}
              {activeTab === 7 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">Artifact (Đầu ra)</h4>
                    <p className={theme.textMuted}>Sprint / US / Board</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">Điểm nghẽn (Thủ công)</h4>
                    <p className={theme.textMuted}>Update trạng thái chéo nhau kiểu gì?</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* 03. KIẾN THỨC NGẦM */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">03. KIẾN THỨC NGẦM</p>
          <h2 className="text-3xl font-bold mb-6">Điểm gãy của những "Kiến thức ngầm"</h2>
          <img src="/images/case-study/before_after_chaos.jpg" alt="Tacit Knowledge Chaos" className="w-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mb-8" />
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-xl border-t-4 border-red-500 ${theme.card}`}>
              <h3 className="text-red-500 font-bold mb-3">Mất Ngữ Cảnh (Context Loss)</h3>
              <p className={`text-sm ${theme.textMuted}`}>Mỗi khi mở một session chat mới, AI lại "mất trí nhớ" về Active Sprint, quên mất User Story đang làm, gọi sai tên màn hình, và lờ đi các quy tắc báo cáo (Evidence) từ session trước đó.</p>
            </div>
            <div className={`p-6 rounded-xl border-t-4 border-red-500 ${theme.card}`}>
              <h3 className="text-red-500 font-bold mb-3">Thực thi Thiếu Nhất quán</h3>
              <p className={`text-sm ${theme.textMuted}`}>Mỗi Agent lại viết Issue theo một kiểu riêng. Có Issue thì quá nặng về kỹ thuật, Evidence thì không xem được. Task cỏn con thì document dài ngoằng, trong khi feature lớn thì lại mô tả sơ sài.</p>
            </div>
            <div className={`p-6 rounded-xl border-t-4 border-red-500 ${theme.card}`}>
              <h3 className="text-red-500 font-bold mb-3">Nút thắt Nhân sự</h3>
              <p className={`text-sm ${theme.textMuted}`}>Người quản lý (PM/Lead) liên tục phải gõ lại rules, soi từng cái naming convention, ép dùng đúng template, cập nhật status và phải liên kết lại tài liệu từ đầu cho Agent mới đọc.</p>
            </div>
          </div>
          <div className={`p-5 rounded-xl border ${theme.cardHighlight} flex gap-4 items-center`}>
            <span className="text-2xl">💡</span>
            <p className={theme.text}>Vấn đề cốt lõi không nằm ở độ thông minh của model, mà là chúng ta đang thiếu một <strong>"bộ nhớ vận hành" (operational memory)</strong> được chia sẻ chung và có kiểm soát.</p>
          </div>
        </motion.section>

        {/* 04. KIẾN TRÚC TRI THỨC */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">04. KIẾN TRÚC TRI THỨC</p>
          <h2 className="text-3xl font-bold mb-6">Kiến trúc "Phân rã Tri thức"</h2>
          <p className={`mb-8 ${theme.textMuted}`}>
            Đừng nhầm tưởng <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">.agent-rules</code> là một file prompt khổng lồ nhồi nhét mọi thứ. Nó thực chất đóng vai trò như một "Trạm điều phối" (Router), chia nhỏ các quy tắc ra thành từng domain chuyên biệt.
          </p>
          
          <div className={`p-8 rounded-2xl ${theme.card} relative`}>
            <div className="flex justify-center mb-8">
              <div className="px-6 py-4 rounded-xl bg-indigo-600 text-white shadow-lg text-center relative z-10">
                <span className="text-2xl mb-2 block">🧭</span>
                <strong className="block text-lg">.agent-rules</strong>
                <span className="text-sm text-indigo-100">Router chính</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['task-sizing.md', 'obsidian-us-workflow.md', 'github-issue.md', 'screen-registry.md', 'reports-export.md', 'carry-over.md'].map((file, i) => (
                <div key={i} className={`p-4 rounded-lg border border-slate-200 dark:border-slate-700 ${isLightMode ? 'bg-white' : 'bg-slate-800/50'}`}>
                  <h4 className="font-mono font-bold mb-2">📄 {file}</h4>
                  <p className={`text-sm ${theme.textMuted}`}>Quy tắc chuyên biệt cho domain tương ứng.</p>
                </div>
              ))}
              <div className={`p-4 rounded-lg border-l-4 border-emerald-500 ${isLightMode ? 'bg-white' : 'bg-slate-800/50'}`}>
                <h4 className="font-mono font-bold mb-2">📁 scripts/</h4>
                <p className={`text-sm ${theme.textMuted}`}>Một phần policy được thực thi bằng tool tự động thay vì prompt.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 05. PHÂN LUỒNG TASK */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">05. PHÂN LUỒNG TASK</p>
          <h2 className="text-3xl font-bold mb-6">Phân luồng theo Mức độ Phức tạp</h2>
          <img src="/images/case-study/gatekeeper_shield.jpg" alt="Gatekeeper Shield" className="w-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mb-6" />
          <p className={`mb-8 ${theme.textMuted}`}>
            Quy tắc sống còn: Mức độ khắt khe của tài liệu (Documentation) và kiểm duyệt (Governance) phải tỷ lệ thuận với độ phức tạp và rủi ro của task.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className={`p-8 rounded-xl border-l-4 border-emerald-500 ${theme.card}`}>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">Task Nhỏ (Micro Task)</h3>
              <ul className={`space-y-2 ${theme.text} list-disc list-inside`}>
                <li>Estimate <strong>dưới 2 tiếng</strong>.</li>
                <li>Phạm vi hẹp: 1 surface, tối đa 2 file.</li>
                <li>Không đụng chạm đến core business logic.</li>
                <li>Không sửa code ở tầng shared layer.</li>
                <li>Giải quyết dứt điểm gọn gàng trong 1 session.</li>
              </ul>
            </div>
            <div className={`p-8 rounded-xl border-l-4 border-amber-500 ${theme.card}`}>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-500 mb-4">Toàn bộ User Story</h3>
              <ul className={`space-y-2 ${theme.text} list-disc list-inside`}>
                <li>Estimate <strong>từ 2 tiếng trở lên</strong>.</li>
                <li>Đụng đến nhiều file, sửa shared layer hoặc build hẳn feature mới.</li>
                <li>Có can thiệp vào business logic.</li>
                <li>Cần Design Contract (Figma).</li>
                <li>Cần hỏi Backend về API Contract.</li>
                <li>Kéo dài nhiều session.</li>
              </ul>
            </div>
          </div>
          
          <div className="p-5 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
            <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Cơ chế Escalation</h4>
            <p className="text-sm">Nếu đang xử lý Micro task nhưng phát hiện phải đụng vào business logic, sửa đến file thứ 3 hoặc gọi API mới, Agent <strong>BẮT BUỘC DỪNG LẠI</strong>, không cố code tiếp mà phải <strong>đẩy lên thành Full US</strong>.</p>
          </div>
        </motion.section>

        {/* 06. HAI LUỒNG DELIVERY */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">06. HAI LUỒNG DELIVERY</p>
          <h2 className="text-3xl font-bold mb-8">Hai Luồng Delivery Song Song</h2>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-emerald-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border ${theme.card}`}>
                <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4">Lane A — Task Nhỏ (Micro Task)</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <div><h4 className="font-bold text-sm">Bỏ qua User Story và Folder</h4><p className={`text-xs mt-1 ${theme.textMuted}`}>Giúp giảm thiểu thủ tục rườm rà. GitHub Issue kiêm luôn mini-spec.</p></div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <div><h4 className="font-bold text-sm">Vòng đời QA</h4><p className={`text-xs mt-1 ${theme.textMuted}`}>Dev Code Xong &rarr; Parent Task sang Testing &rarr; QA Pass.</p></div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <div><h4 className="font-bold text-sm">Ad-hoc Evidence</h4><p className={`text-xs mt-1 ${theme.textMuted}`}>Lưu ảnh thẳng vào thư mục Ad-hoc của Sprint.</p></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-amber-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border ${theme.card}`}>
                <h3 className="font-bold text-amber-600 dark:text-amber-500 mb-4">Lane B — Toàn bộ User Story</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <div><h4 className="font-bold text-sm">Viết Spec trước, Code sau (Spec-IN)</h4><p className={`text-xs mt-1 ${theme.textMuted}`}>User Story phải được dựng xong trước khi gõ dòng code đầu tiên.</p></div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <div><h4 className="font-bold text-sm">Kiểm tra chéo API & Thiết kế</h4><p className={`text-xs mt-1 ${theme.textMuted}`}>Phải kiểm tra chéo API Spec hoặc file Design trước khi chốt AC.</p></div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <div><h4 className="font-bold text-sm">Đồng bộ Sprint & Dispatch Log</h4><p className={`text-xs mt-1 ${theme.textMuted}`}>Ghi log trạng thái để Agent vào sau vẫn nắm trọn bối cảnh.</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 07. MÔ HÌNH WORK ITEM */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">07. MÔ HÌNH WORK ITEM</p>
          <h2 className="text-3xl font-bold mb-6">User Story, Task và Dev Task</h2>
          <p className={`mb-8 ${theme.textMuted}`}>
            Mỗi Item có một sứ mệnh riêng biệt. Lưu ý: <strong>Dev Task Done KHÔNG có nghĩa là tính năng đã Done.</strong>
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-xl ${theme.card}`}>
              <h3 className="font-bold text-indigo-600 dark:text-indigo-400 mb-4">User Story (Obsidian)</h3>
              <ul className={`space-y-2 text-sm ${theme.text} list-disc list-inside`}>
                <li>Là <strong>Product Spec</strong>.</li>
                <li>Nơi gom tụ Goal, AC, Task Breakdown, Execution Log và toàn bộ Evidence.</li>
              </ul>
            </div>
            <div className={`p-6 rounded-xl ${theme.card}`}>
              <h3 className="font-bold text-amber-600 dark:text-amber-500 mb-4">Task Mẹ (Parent Task - GitHub)</h3>
              <ul className={`space-y-2 text-sm ${theme.text} list-disc list-inside`}>
                <li>Là <strong>QA/QC Parent</strong>.</li>
                <li>Tự động nhảy sang <code>Testing</code> ngay khi Dev báo hoàn thành code.</li>
                <li>Chỉ được đóng (Done) khi QA đã gật đầu Pass.</li>
                <li>Assignee: <code>qa-owner</code> + <code>dev-owner</code>.</li>
              </ul>
            </div>
            <div className={`p-6 rounded-xl ${theme.card}`}>
              <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4">Task Con (Child Dev Task - GitHub)</h3>
              <ul className={`space-y-2 text-sm ${theme.text} list-disc list-inside`}>
                <li>Đại diện cho <strong>Effort Code Thực Tế</strong> của Dev.</li>
                <li>Liên kết trực tiếp tới PR.</li>
                <li>Chỉ đóng lại khi đã code xong và tự test (self-verify).</li>
                <li>Assignee: chỉ <code>dev-owner</code>.</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm font-bold bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">Dev Task = Done</span>
            <IconArrowRight className="w-5 h-5 text-slate-400" />
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">Parent Task = Testing</span>
            <IconArrowRight className="w-5 h-5 text-slate-400" />
            <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full">QA Pass</span>
            <IconArrowRight className="w-5 h-5 text-slate-400" />
            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full">Parent Task = Done</span>
          </div>
          <p className={`mt-3 text-xs ${theme.textMuted}`}>Nếu QA bắt lỗi (Fail): Parent Task bị trả về Re-Open &rarr; Dev phải quay lại fix &rarr; verify lại từ đầu.</p>
        </motion.section>

        {/* 08. KIỂM SOÁT ISSUE & UI */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">08. KIỂM SOÁT ISSUE & UI</p>
          <h2 className="text-3xl font-bold mb-6">Thuật ngữ Chuẩn & Hợp đồng Giao tiếp</h2>
          <img src="/images/case-study/handoff_contract.jpg" alt="Handoff Contract" className="w-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mb-8" />
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">GitHub Issue là Hợp đồng Member-facing</h3>
              <p className={`text-sm mb-4 ${theme.textMuted}`}>
                Issue sinh ra là để bất kỳ ai đọc cũng hiểu (kể cả người ngoài dự án). Không dùng từ lóng kỹ thuật, không dán filepath hay tên component vào đây. Chỉ được phép mô tả trực quan: <strong>Tình trạng hiện tại</strong> bị gì, và <strong>Kết quả mong muốn</strong> là sao (Không nhét AC vào Issue).
              </p>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs leading-relaxed">
                - <strong>Màn hình:</strong> Tên UI-label<br/>
                - <strong>Vị trí:</strong> Vùng hoặc bước<br/>
                - <strong>Thiết bị:</strong> Mobile / Desktop<br/>
                - <strong>Hiện tại:</strong> Lỗi hoặc thứ người dùng đang nhìn thấy ngay lúc này.<br/>
                - <strong>Ảnh hưởng:</strong> Lỗi này cản trở trải nghiệm ra sao?<br/>
                - <strong>Mong muốn:</strong> Kết quả cuối cùng trên màn hình phải là gì?
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Screen Registry: Từ điển kiểm soát</h3>
              <p className={`text-sm mb-4 ${theme.textMuted}`}>
                Agent rất dễ lấy nhầm <em>filepath</em> ra làm tên màn hình. Để trị bệnh này, tôi lập ra <strong>Screen Registry</strong> ép Agent phải <strong>TRA CỨU</strong> đúng tên màn hình (khớp với giao diện thực tế) và dùng <code>screen-slug</code> chuẩn chỉnh để lưu tên ảnh Evidence.
              </p>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Màn hình (UI Label)</th>
                      <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Route</th>
                      <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Screen-slug</th>
                    </tr>
                  </thead>
                  <tbody className={theme.text}>
                    <tr>
                      <td className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Chi tiết nhân viên</td>
                      <td className="px-4 py-3 border-b border-slate-200 dark:border-slate-700"><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">/staff/:id</code></td>
                      <td className="px-4 py-3 border-b border-slate-200 dark:border-slate-700"><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">staff-detail</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 09. EVIDENCE & LIÊN TỤC */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">09. EVIDENCE & LIÊN TỤC</p>
          <h2 className="text-3xl font-bold mb-6">Evidence chính là "Bộ nhớ vận hành"</h2>
          <p className={`mb-8 ${theme.textMuted}`}>
            Evidence không chỉ để lưu vết đơn thuần. Nó phục vụ Reviewer, QA, Agent người kế nhiệm, truy vết Regression, và là bằng chứng thép (Audit trail) để dẹp bỏ mọi sự mập mờ.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl ${theme.card}`}>
              <h3 className="font-bold text-indigo-600 dark:text-indigo-400 mb-3">Quy tắc Đặt tên & Lưu trữ</h3>
              <p className={`text-sm mb-4 ${theme.textMuted}`}>Bản gốc (Persistent) phải được lưu trữ vĩnh viễn tại Obsidian Vault (lưu vào thư mục US hoặc folder Ad-hoc). Luật bất thành văn: Không bao giờ commit ảnh rác vào repo code. Quy tắc Naming:</p>
              <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded font-mono text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
                &lt;id&gt;--&lt;screen-slug&gt;--&lt;state&gt;--&lt;desc&gt;.png
              </div>
            </div>
            <div className={`p-6 rounded-xl ${theme.card}`}>
              <h3 className="font-bold text-red-500 mb-3">Chuyển tiếp (Carry-over) & Lịch sử</h3>
              <p className={`text-sm mb-4 ${theme.textMuted}`}>Hết Sprint mà User Story vẫn chưa Done? <strong>KHÔNG</strong> được phép ỉm đi hay tự động drop. Bắt buộc phải bê sang Sprint mới, và Agent phải <strong>chủ động hỏi user lý do</strong> để ghi log vào Change History.</p>
              <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded font-mono text-xs text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre">
                | Ngày | Từ | Sang | Lý do (User) |<br/>
                | 22/6 | W-03 | W-04 | Đợi BE chốt API |
              </div>
            </div>
          </div>
        </motion.section>

        {/* 10. VÍ DỤ THỰC TẾ: US-093 */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">10. VÍ DỤ THỰC TẾ</p>
          <h2 className="text-3xl font-bold mb-8">Ví dụ thực tế: Xử lý US-093</h2>
          
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border-l-4 border-indigo-500 ${theme.card}`}>
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">1. User Story (Obsidian)</h4>
              <p className={theme.text}>Là một nhân viên, tôi muốn tự ngắt liên kết với salon, để có thể quản lý nơi mình đang làm việc.</p>
            </div>
            <div className={`p-6 rounded-xl border-l-4 border-amber-500 ${theme.card}`}>
              <h4 className="font-bold text-amber-600 dark:text-amber-500 mb-2">2. Hợp đồng Thiết kế (Design Contract)</h4>
              <p className={theme.text}>Yêu cầu có đủ các trạng thái màn hình <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-sm">Salon của tôi</code>: Confirmation, Success, Empty, và Responsive.</p>
            </div>
            <div className="bg-slate-900 text-slate-300 p-6 rounded-xl">
              <h4 className="font-bold text-sky-400 mb-3">3. GitHub Issue (Member-facing)</h4>
              <div className="font-mono text-sm leading-relaxed">
                - <strong>Màn hình:</strong> Salon của tôi<br/>
                - <strong>Vị trí:</strong> Danh sách salon đang liên kết<br/>
                - <strong>Thiết bị:</strong> Tất cả<br/>
                - <strong>Hiện tại:</strong> Nhân viên nhìn thấy tên salon nhưng nhưng không có thao tác tự rời đi.<br/>
                - <strong>Mong muốn:</strong> Bổ sung ngay thao tác "Rời salon" (Unlink) rõ ràng.
              </div>
            </div>
            <div className={`p-6 rounded-xl border-l-4 border-emerald-500 ${theme.card}`}>
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4">4. Evidence</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className={`text-sm font-bold mb-2 ${theme.textMuted}`}>Hiện tại (Chưa có nút Rời đi)</p>
                  <img src="/images/case-study/us_093_current.jpg" alt="Current State" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                </div>
                <div>
                  <p className={`text-sm font-bold mb-2 ${theme.textMuted}`}>Mong muốn (Có thao tác Rời đi)</p>
                  <img src="/images/case-study/us_093_expected.jpg" alt="Expected State" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 11. TRƯỚC & SAU KHI CÓ RULE */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">11. TRƯỚC & SAU</p>
          <h2 className="text-3xl font-bold mb-8">Tác động thực tế của Hệ thống</h2>
          
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-4 text-sm font-bold">
              <div className="flex-1 text-slate-500 dark:text-slate-400">⚠️ Trạng thái cũ</div>
              <div className="w-12"></div>
              <div className="flex-1 text-indigo-600 dark:text-indigo-400">💡 Hệ thống mới</div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                ["Rule nằm trong trí nhớ (hay quên)", "Rule được Code hóa thành file dùng chung"],
                ["Cào bằng quy trình mọi Task (bé cũng như lớn)", "Task Tier Gate phân làn luồng đi chuẩn xác"],
                ["Agent tự chế tên màn hình từ filepath", "Agent phải tra từ điển Screen Registry"],
                ["Issue viết thiếu nhất quán", "Issue dùng template chuẩn (Member-first)"],
                ["Evidence lưu trữ phân tán", "Evidence có vị trí lưu trữ chuẩn"],
                ["Mở session mới là Agent bị \"mất trí nhớ\"", "Có Dispatch log lưu giữ cẩn thận Execution State"],
                ["Việc tồn đọng (Carry-over) dễ trôi vào quên lãng", "Carry-over gắt gao + Ghi sổ Change History"]
              ].map((row, i) => (
                <div key={i} className={`flex items-center p-4 ${theme.bg}`}>
                  <div className={`flex-1 flex items-start gap-2 ${theme.textMuted} text-sm`}><IconX className="w-5 h-5 text-red-400 shrink-0 mt-0.5" /> <span>{row[0]}</span></div>
                  <div className="w-12 flex justify-center text-slate-300 dark:text-slate-700">➔</div>
                  <div className={`flex-1 flex items-start gap-2 ${theme.text} text-sm font-medium`}><IconCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> <span>{row[1]}</span></div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 12. KIỂM SOÁT & ĐÁNH ĐỔI */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">12. QUẢN TRỊ</p>
          <h2 className="text-3xl font-bold mb-8">Bàn tay Con người & Sự Đánh Đổi (Trade-offs)</h2>
          
          <h3 className="text-xl font-bold mb-6">Ai quyết định cái gì? (Human vs AI Agent)</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {[
              { title: "Quyết định quy mô Task (Micro hay Full US?)", agent: "Duyệt logic qua Task Tier Gate", human: "Trực tiếp can thiệp (Override) khi cần" },
              { title: "Requirement chưa rõ ràng", agent: "Phát hiện kẽ hở và gạn lọc (Refine)", human: "Quyết định Product outcome cuối cùng" },
              { title: "AC và Design mâu thuẫn", agent: "Bấm nút \"Pause\" thi công và báo cáo (Escalate)", human: "Phán xử xem đâu là Source of Truth chuẩn" },
              { title: "Phạm vi (Scope) phình to", agent: "Ngừng mở rộng code / Đề xuất nâng cấp thành US", human: "Ký duyệt mở rộng Scope" },
              { title: "Chuyển tiếp Sprint (Carry-over)", agent: "Phát hiện work chưa Done", human: "Khai báo lý do trễ deadline (Ghi log)" },
              { title: "Vòng đời QA", agent: "Đóng gói Evidence sạch sẽ, đúng rule", human: "Duyệt (Pass) hoặc Re-Open để yêu cầu làm lại" }
            ].map((item, i) => (
              <div key={i} className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 ${theme.bg}`}>
                <h4 className="font-bold mb-3">{item.title}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2 items-start"><span className="shrink-0 w-6">🤖</span> <span className={theme.textMuted}>{item.agent}</span></div>
                  <div className="flex gap-2 items-start"><span className="shrink-0 w-6">👤</span> <span className={theme.text}>{item.human}</span></div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-bold mb-6">Các Trade-offs Chính</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 ${theme.bg}`}>
              <h4 className="font-bold mb-2 text-sm">Nhiều rule file hơn</h4>
              <p className={`text-xs ${theme.textMuted}`}>Tách rule ra thì quản lý dễ, nhưng bù lại phải giữ dependency khéo léo để Agent không bị nhiễu loạn do các rule mâu thuẫn.</p>
            </div>
            <div className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 ${theme.bg}`}>
              <h4 className="font-bold mb-2 text-sm">Tăng cường Quản trị (Governance)</h4>
              <p className={`text-xs ${theme.textMuted}`}>Quản trị chặt thì dễ truy vết (Traceability), nhưng sẽ làm chậm tiến độ nếu task nào cũng áp dụng quy trình rườm rà (nên mới đẻ ra Task Tier Gate).</p>
            </div>
            <div className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 ${theme.bg}`}>
              <h4 className="font-bold mb-2 text-sm">Evidence Lưu trữ Dài hạn</h4>
              <p className={`text-xs ${theme.textMuted}`}>Lưu log local thì siêu an toàn, nhưng lại phải mất nhiều nỗ lực để chuẩn hóa thư mục và quy tắc đặt tên (naming convention).</p>
            </div>
            <div className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 ${theme.bg}`}>
              <h4 className="font-bold mb-2 text-sm">Chốt chặn Con người (Human Gates)</h4>
              <p className={`text-xs ${theme.textMuted}`}>Hi sinh giấc mơ "AI tự chạy 100%", đổi lấy thứ vô giá: Đảm bảo tuyệt đối chất lượng Product và kiểm soát được rủi ro Release.</p>
            </div>
          </div>
          <div className={`p-5 rounded-xl border ${theme.cardHighlight} flex gap-4 items-center`}>
            <span className="text-2xl">💡</span>
            <p className={theme.text}>Tóm lại: Trong phát triển phần mềm thực chiến, chúng tôi ưu tiên <strong>"Tự động hoá có kiểm soát" (Controlled Automation)</strong> thay vì để AI tự quyết định hoàn toàn mọi thứ.</p>
          </div>
        </motion.section>

        {/* 13. VAI TRÒ CỦA TÔI */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">13. VAI TRÒ CỦA TÔI</p>
          <h2 className="text-3xl font-bold mb-8">Hierarchy & Vai trò của Tác giả</h2>
          
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xl font-bold mb-4">Phân cấp Nguồn chân lý (Source of Truth)</h3>
              <p className={`text-sm mb-6 ${theme.textMuted}`}>Trong hệ thống này, mỗi Artifact (tài liệu/dữ liệu) nắm giữ một uy quyền (authority) riêng biệt. Sẽ không có một file duy nhất nào quyết định mọi thứ:</p>
              
              <div className="space-y-3 font-mono text-xs md:text-sm">
                {[
                  ["Product Intent", "User Story / Refined requirement"],
                  ["Member Problem", "GitHub Issue"],
                  ["UI Naming", "Screen Registry"],
                  ["Execution State", "Dispatch Log"],
                  ["Canonical Evidence", "Obsidian Vault"],
                  ["Code Change", "Branch / Pull Request"],
                  ["QA Result", "Parent Task Status"],
                  ["Sprint History", "Sprint file + Change History"]
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold whitespace-nowrap">{row[0]}</span>
                    <span className="text-slate-400">➔</span>
                    <span className="text-indigo-600 dark:text-indigo-400 whitespace-nowrap overflow-hidden text-ellipsis">{row[1]}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`p-8 rounded-2xl bg-slate-900 text-slate-100 shadow-xl`}>
              <h3 className="text-2xl font-serif text-amber-500 mb-4">AI Workflow Architect (Kiến trúc sư Quy trình)</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Tôi không ngồi tối ưu vài câu lệnh (prompt) rồi tự nhận mình là "Prompt Engineer". Trách nhiệm thực sự của một Workflow Architect khó nhằn hơn nhiều:
              </p>
              <ul className="space-y-3 text-sm text-slate-300 list-disc list-inside marker:text-amber-500">
                <li>Thiết kế trọn vẹn quy trình <strong>Delivery</strong> từ con số không.</li>
                <li>Đóng vai người quan sát để nhận diện những điểm lặp lại (Kinh nghiệm ngầm) của team cũ, sau đó hệ thống hóa chúng thành các domain độc lập.</li>
                <li>Thiết kế chốt chặn <strong>Task Tier Gate</strong>, nắn lại cấu trúc User Story và quy chuẩn theo dõi Sprint.</li>
                <li>Quy chuẩn hoá bộ từ điển <strong>Screen Registry</strong>, xây dựng kiến trúc lưu trữ Evidence và vòng đời Task.</li>
                <li>Ép các rule nằm trên giấy thành <strong>Công cụ cưỡng chế (Tools constraint)</strong> (vd: tự tay viết script <code className="bg-slate-800 px-1 rounded">capture-evidence.mjs</code> để tự động tích hợp auth token, auto-detect port cho mượt).</li>
                <li>Xác định rõ ràng các ranh giới: Đâu là chỗ AI được chạy, đâu là chỗ <strong>Con người (Human Control)</strong> bắt buộc nhúng tay vào duyệt.</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* 14. GRAND FINALE */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 text-center">
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 relative">
            <img src="/images/case-study/farewell_team.jpg" alt="Farewell Team" className="w-full h-64 md:h-80 object-cover object-center" />
            <div className="p-10 md:p-16 relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-6">Cảm ơn bạn đã theo dõi!</h2>
              <p className={`text-lg max-w-2xl mx-auto mb-10 ${theme.textMuted}`}>
                Bộ quy tắc <strong>.agent-rules</strong> đảm bảo mỗi Agent nhận đúng context. Nhưng ai sẽ là người đứng ra quyết định <strong>"Agent nào chạy, lúc nào, theo thứ tự gì"</strong>?
              </p>
              <button onClick={() => handleQuestSelect('dispatch')} className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-transform hover:scale-105 shadow-lg shadow-indigo-500/30 cursor-pointer">
                <IconArrowRight className="w-5 h-5 rotate-180" /> Khám phá Hệ thống Điều phối (@dispatch)
              </button>
            </div>
          </div>
        </motion.section>

      </div>
    </CaseStudyLayout>
  );
};
