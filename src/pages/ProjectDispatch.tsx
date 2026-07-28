import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';

export const ProjectDispatch: React.FC = () => {
  const { isLightMode } = useStore();
  
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f172a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800',
    accent: isLightMode ? 'text-emerald-600' : 'text-emerald-400',
    accentBg: isLightMode ? 'bg-emerald-50' : 'bg-emerald-900/20',
    border: isLightMode ? 'border-slate-200' : 'border-slate-800',
    glow: isLightMode ? 'shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'shadow-[0_0_30px_rgba(16,185,129,0.1)]'
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <CaseStudyLayout>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${isLightMode ? 'from-emerald-100/50 via-transparent to-transparent' : 'from-emerald-900/20 via-transparent to-transparent'}`}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        
        {/* SECTION 1: Hero */}
        <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1">
              <p className={`text-sm font-bold tracking-widest uppercase mb-4 ${theme.accent}`}>01. TẦM NHÌN — GIAO VIỆC THÔNG MINH CHO AI</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                Từ quy trình thủ công đến <span className={theme.accent}>Hệ thống Điều phối (Dispatch)</span> có kiểm soát
              </h1>
              <p className={`text-lg md:text-xl mb-8 leading-relaxed ${theme.textMuted}`}>
                Làm thế nào để quản lý hàng tá task, issue, và file thiết kế mà không bị rối? Tôi đã phân tách toàn bộ quy trình thành hai lớp rạch ròi: <code className={`px-2 py-1 rounded ${theme.accentBg} ${theme.accent} font-mono text-sm`}>/dispatch</code> chuyên trách điều phối công việc, và <code className={`px-2 py-1 rounded ${theme.accentBg} ${theme.accent} font-mono text-sm`}>.agent-rules</code> lo việc duy trì chuẩn mực dự án.
              </p>
              <blockquote className={`pl-6 border-l-4 ${isLightMode ? 'border-emerald-500 bg-emerald-50/50' : 'border-emerald-500 bg-emerald-900/10'} py-4 pr-4 rounded-r-xl italic text-lg ${theme.text}`}>
                Mục tiêu ở đây không phải để AI cướp việc của Product Designer. Thay vào đó, mục tiêu là triệt tiêu các thao tác tay chân lặp lại, trả lại không gian để Designer thực sự được làm thiết kế và giải quyết vấn đề.
              </blockquote>
            </div>
            <div className="flex-1 w-full relative">
              <div className={`absolute inset-0 bg-emerald-500 rounded-3xl blur-3xl opacity-20`}></div>
              <img src="/images/case-study/hero_routing_portrait.jpg" alt="AI Agent Orchestrator Routing" className="relative z-10 w-full rounded-3xl shadow-2xl object-cover border border-slate-200/20" />
            </div>
          </div>
        </motion.section>

        {/* SECTION 2: Original Workflow */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>02. Quy trình ban đầu</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Chúng tôi vốn đã có quy trình, nhưng...</h2>
            <p className={`text-lg max-w-3xl ${theme.textMuted}`}>
              Trước khi <code className={`px-2 py-1 rounded ${theme.accentBg} ${theme.accent} font-mono text-sm`}>/dispatch</code> xuất hiện, mọi bước từ Design đến QA đều đã được định hình chuẩn chỉ. Vấn đề duy nhất là: Con người phải tự tay chắp vá và điều phối từng bước một.
            </p>
          </div>

          <div className="mb-16 text-center">
            <img src="/images/case-study/workflow_original.jpg" alt="Original Workflow Diagram" className="rounded-2xl shadow-lg max-h-[450px] inline-block w-full object-cover border border-slate-200/20" />
          </div>

          <div className="relative pl-6 md:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-12">
            {[
              { title: "1. Viết User Story", desc: "Viết US để chốt Goal, Acceptance Criteria (AC), và chia Task. 100% bằng sức người.", color: "bg-amber-500" },
              { title: "2. Khởi tạo Task", desc: "Lên GitHub gõ lại mô tả Task và tự canh chừng tiến độ.", color: "bg-slate-500" },
              { title: "3. Bàn giao Thiết kế", desc: "Chuẩn bị tài liệu Handoff (Figma, HTML, PNG). Lại là con người phải tự gom file.", color: "bg-emerald-500" },
              { title: "4. AI Nhận việc", desc: "Nhập prompt để giao việc cho AI. Agent bắt đầu code dựa trên Spec và file Design.", color: "bg-amber-500" },
              { title: "5. Agent Tự Test", desc: "Agent tự test code, còn con người thì ngồi giám sát, thấy lỗi lại gõ prompt bắt sửa.", color: "bg-slate-500" },
              { title: "6. Đẩy code & Báo cáo", desc: "Đẩy code, mở Pull Request và đính kèm ảnh chụp màn hình (Evidence) hoàn toàn bằng tay.", color: "bg-emerald-500" },
              { title: "7. Quản lý Sub-task", desc: "Tạo thêm Issue phụ (Dev Task) nếu task chính phình to.", color: "bg-amber-500" },
              { title: "8. Cập nhật Trạng thái", desc: "Người quản lý phải lóc cóc chạy qua chạy lại giữa các tool (Jira, GitHub) để cập nhật trạng thái.", color: "bg-slate-500" }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[31px] md:-left-[39px] w-4 h-4 rounded-full ${step.color} ring-4 ${isLightMode ? 'ring-white' : 'ring-[#0f172a]'}`}></div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className={theme.textMuted}>{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 3: Breakdown */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>03. ĐIỂM GÃY</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Khi Con người trở thành "Nút thắt cổ chai"</h2>
            <p className={`text-lg max-w-3xl ${theme.textMuted}`}>
              Quy trình thì rất chuẩn rồi, nhưng khi có cả chục Agent cùng nhảy vào làm việc song song, việc điều phối thủ công sẽ dẫn đến quá tải, làm mất context và sai sót liên miên.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Quyết định Lặp đi Lặp lại", desc: "Phải gõ đi gõ lại cùng một câu lệnh cho mỗi task. Cứ mở chat mới là lại phải nhồi nhét lại context cho Agent." },
              { title: "Không có Bộ nhớ Chung", desc: "Mỗi Agent hoạt động như một ốc đảo. Luật lệ dự án thì nằm rải rác trong đầu người quản lý, Agent hoàn toàn không nắm được." },
              { title: "Giao việc theo Cảm tính", desc: "Giao task cho Claude hay Gemini hoàn toàn theo cảm tính, thay vì có một hệ thống phân luồng (Router) rõ ràng." },
              { title: "Thường xuyên quên Evidence", desc: "Test xong quên chụp ảnh màn hình, hoặc lưu file lộn xộn khiến team QA gặp rất nhiều khó khăn." },
              { title: "Dễ ghi đè Code (Conflict)", desc: "Cho nhiều Agent cùng sửa chung một codebase mà không cách ly môi trường thì kiểu gì cũng có ngày ghi đè code (conflict) của nhau." },
              { title: "Trạng thái Rải rác", desc: "Không có quy trình báo cáo khi task phình to. Trạng thái task thì lệch nhau giữa GitHub, Jira và Obsidian." }
            ].map((card, idx) => (
              <div key={idx} className={`p-6 rounded-2xl border-l-4 border-l-amber-500 ${theme.card}`}>
                <h3 className="text-amber-600 dark:text-amber-500 font-bold text-lg mb-3">{card.title}</h3>
                <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{card.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 4: Research */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>04. NGHIÊN CỨU & PHÂN TÍCH</p>
            <h2 className="text-3xl md:text-4xl font-bold">Quan sát, Phân nhóm & Thử nghiệm</h2>
          </div>

          <div className="mb-12 text-center">
            <img src="/images/case-study/research_synthesis.jpg" alt="Research and Synthesis" className="rounded-2xl shadow-lg max-h-[450px] inline-block w-full object-cover border border-slate-200/20" />
          </div>

          <div className="space-y-6">
            {[
              { num: "01", title: "Quan sát Workflow:", desc: "Bám sát để soi ra các điểm chậm trễ (bottleneck) trong thực tế." },
              { num: "02", title: "Phân nhóm Quyết định:", desc: "Gom các quyết định lặp đi lặp lại thành 2 nhóm: Workflow Decisions (Ai làm) và Knowledge Decisions (Làm thế nào)." },
              { num: "03", title: "Cân đo đong đếm Model:", desc: "Đánh giá năng lực, token limit và chi phí của Claude, Codex, Gemini để chọn mặt gửi vàng." },
              { num: "04", title: "Xác định Human Gate:", desc: "Đánh dấu những \"ranh giới đỏ\" bắt buộc con người phải nhảy vào duyệt (vd: sửa Database, Auth)." },
              { num: "05", title: "Thực chiến & Tinh chỉnh:", desc: "Chạy thử trên task thật, gom lỗi, tối ưu prompt và đóng gói thành Reusable Skills." }
            ].map((step, idx) => (
              <div key={idx} className={`flex items-start gap-4 p-5 rounded-xl ${theme.card}`}>
                <span className={`text-2xl font-black ${theme.accent} opacity-50`}>{step.num}</span>
                <div>
                  <strong className={theme.text}>{step.title}</strong> <span className={theme.textMuted}>{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 5: Solution (Before/After) */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>05. GIẢI PHÁP: /DISPATCH & .AGENT-RULES</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Biến Quy trình thủ công thành "Hệ điều hành" (OS)</h2>
            <p className={`text-lg max-w-3xl ${theme.textMuted}`}>
              Tôi hệ thống hóa toàn bộ quy trình thành 2 lớp rạch ròi: Workflow Orchestration Layer (quyết định <strong>Ai làm, môi trường nào</strong>) và Knowledge Governance Layer (quyết định <strong>Luật lệ ra sao</strong>).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Header row for MD+ screens */}
            <div className={`hidden md:block col-span-1 p-5 font-bold text-slate-100 bg-slate-800`}>Bài toán (Domain)</div>
            <div className={`hidden md:block col-span-1 p-5 font-bold text-slate-100 bg-slate-800`}>Trước đây (Thủ công)</div>
            <div className={`hidden md:block col-span-1 p-5 font-bold text-slate-100 bg-emerald-800`}>Bây giờ (OS-Driven)</div>

            {[
              { domain: "Task Overview", before: "Phải tự tay viết US", after: "US Gate tự quyết mức độ chi tiết của tài liệu" },
              { domain: "Input Resolve", before: "PM đi gom nhặt, copy/paste từ từng nguồn", after: "AI tự mò và resolve dữ liệu từ Jira/GitHub/Figma" },
              { domain: "Agent Selection", before: "Chọn Agent theo cảm tính", after: "Router Tự động phân luồng năng lực (Route A/B/C)" },
              { domain: "Context", before: "Gõ đi gõ lại Rule vào Prompt chat", after: ".agent-rules tự động gài cắm Rule tương ứng" },
              { domain: "Environment", before: "Tự gõ lệnh tạo Git Branch", after: "Hệ thống tự cấp phát Branch / Worktree an toàn" },
              { domain: "Scope Limits", before: 'Dặn dò mồm: "Tuyệt đối đừng đụng vào file kia nhé"', after: "Giới hạn Scope khắt khe + Luật Do NOT touch" },
              { domain: "Verification", before: "Phó mặc cho Agent tự code tự test", after: "Một Agent khác độc lập đứng ra review diff/build/test" },
              { domain: "Evidence", before: "Quên chụp ảnh màn hình, lưu file định dạng lộn xộn", after: "Tự động lưu đúng format vào chuẩn thư mục của dự án" },
              { domain: "Tracking", before: "Lóc cóc đi update trạng thái Jira, GitHub bằng tay", after: "Hệ thống tự ghi log vào file Dispatch và Sprint Sync" },
              { domain: "Continuity", before: "AI mất trí nhớ ngay khi mở session chat mới", after: "Lưu trữ vĩnh viễn trong Shared Files (Hạ cánh tri thức)" }
            ].map((row, idx) => (
              <React.Fragment key={idx}>
                {/* Mobile headers (only show on mobile) */}
                <div className={`md:hidden col-span-1 p-4 font-bold text-amber-600 dark:text-amber-500 bg-slate-100 dark:bg-slate-900 border-t ${idx > 0 ? 'border-slate-200 dark:border-slate-800' : 'border-transparent'}`}>{row.domain}</div>
                <div className={`md:hidden col-span-1 px-4 py-2 text-sm ${theme.textMuted}`}>Trước đây: {row.before}</div>
                <div className={`md:hidden col-span-1 px-4 py-2 pb-4 text-sm font-medium ${theme.text}`}>Bây giờ: {row.after}</div>
                
                {/* Desktop rows */}
                <div className={`hidden md:flex items-center p-5 font-bold text-amber-600 dark:text-amber-500 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/50`}>{row.domain}</div>
                <div className={`hidden md:flex items-center p-5 text-sm ${theme.textMuted} bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50`}>{row.before}</div>
                <div className={`hidden md:flex items-center p-5 text-sm font-medium ${theme.text} bg-emerald-50/30 dark:bg-emerald-900/10 border-t border-slate-100 dark:border-slate-800/50`}>{row.after}</div>
              </React.Fragment>
            ))}
          </div>
        </motion.section>

        {/* SECTION 6: Route A/B/C Deep Dive */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>06. Phân luồng (Route A/B/C)</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Luồng A / B / C là gì?</h2>
            <p className={`text-lg max-w-4xl ${theme.textMuted}`}>
              Thay vì bốc thuốc mù mờ, <code className={`px-2 py-1 rounded ${theme.accentBg} ${theme.accent} font-mono text-sm`}>/dispatch</code> quét độ phức tạp của task và tự đề xuất một trong ba luồng (Route). Mỗi luồng quy định rạch ròi: Dùng Agent nào? Môi trường cách ly ra sao? Và quy trình test khắt khe tới mức nào.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Route A */}
            <div className={`p-8 rounded-2xl border-t-4 border-t-emerald-500 ${theme.card}`}>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl font-bold">A</span>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-500">Sửa Lỗi Nhanh</h3>
              </div>
              <p className={`text-sm mb-6 ${theme.textMuted}`}>Task lặt vặt, phạm vi hẹp, không đụng vào code dùng chung hay database.</p>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex flex-col gap-1"><span className="font-bold text-emerald-600 dark:text-emerald-500">Agent</span> <span className={theme.text}>Sonnet / Gemini Flash (tốc độ cao, chi phí thấp)</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-emerald-600 dark:text-emerald-500">Môi trường</span> <span className={theme.text}>Tạo nhánh Git thông thường</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-emerald-600 dark:text-emerald-500">Kiểm tra</span> <span className={theme.text}>Agent tự kiểm tra (Self-test)</span></li>
              </ul>
              <div className="p-3 rounded-lg bg-emerald-500/10 text-sm">
                <strong>Ví dụ:</strong> Chỉnh padding, đổi tên nút, sửa lỗi chính tả
              </div>
            </div>

            {/* Route B */}
            <div className={`p-8 rounded-2xl border-t-4 border-t-amber-500 ${theme.card}`}>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl font-bold">B</span>
                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-500">Tính năng Tiêu chuẩn</h3>
              </div>
              <p className={`text-sm mb-6 ${theme.textMuted}`}>Làm tính năng mới hoặc refactor đụng chạm nhiều file. Bắt buộc cách ly an toàn.</p>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex flex-col gap-1"><span className="font-bold text-amber-600 dark:text-amber-500">Agent</span> <span className={theme.text}>Opus / Gemini Pro (khả năng suy luận sâu)</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-amber-600 dark:text-amber-500">Môi trường</span> <span className={theme.text}>Sử dụng Git Worktree riêng biệt</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-amber-600 dark:text-amber-500">Kiểm tra</span> <span className={theme.text}>Gọi một Agent độc lập để review Code Diff</span></li>
              </ul>
              <div className="p-3 rounded-lg bg-amber-500/10 text-sm">
                <strong>Ví dụ:</strong> Thêm trang mới, tách component, refactor module
              </div>
            </div>

            {/* Route C */}
            <div className={`p-8 rounded-2xl border-t-4 border-t-red-500 bg-slate-900 border border-slate-800`}>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center text-xl font-bold">C</span>
                <h3 className="text-xl font-bold text-slate-100">Nhạy cảm / Kiểm duyệt</h3>
              </div>
              <p className={`text-sm mb-6 text-slate-300`}>Đụng đến Đăng nhập, Thanh toán, Database, hoặc kiến trúc lõi. <strong className="text-red-400">BẮT BUỘC Con người phải nhúng tay duyệt.</strong></p>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex flex-col gap-1"><span className="font-bold text-red-400">Agent</span> <span className="text-slate-200">Opus (thông minh nhất) + Chốt chặn Con người</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-red-400">Môi trường</span> <span className="text-slate-200">Worktree cách ly + Khoanh vùng <code className="text-emerald-400 px-1">Do NOT touch</code> cực đoan</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-red-400">Kiểm tra</span> <span className="text-slate-200">Con người review trực tiếp + Agent QA chéo</span></li>
              </ul>
              <div className="p-3 rounded-lg bg-red-500/15 text-sm text-slate-200">
                <strong>Ví dụ:</strong> Đổi luồng Login, sửa Database schema, Migrate dữ liệu
              </div>
            </div>
          </div>

          <div className={`mt-10 p-6 rounded-xl ${theme.accentBg} ${theme.accent} font-medium text-center`}>
            💡 Nguyên lý bất di bất dịch: Task càng nhạy cảm ➔ Agent phải càng xịn ➔ Môi trường càng cách ly ➔ Kiểm duyệt càng gắt. Tuyệt đối không có ngoại lệ.
          </div>
        </motion.section>

        {/* SECTION 7: My Role */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>07. VAI TRÒ CỦA TÁC GIẢ</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Làm Thiết kế, không phải Làm thợ điều phối AI</h2>
            <p className={`text-lg max-w-4xl ${theme.textMuted}`}>
              Tôi xây hệ thống này để giải phóng bản thân khỏi công việc điều phối nhàm chán. Thời gian và chất xám của tôi cần được dành trọn cho thiết kế và giải quyết bài toán của người dùng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-8 rounded-2xl ${theme.card}`}>
              <h3 className="text-emerald-600 dark:text-emerald-500 font-bold text-2xl mb-6">Tập trung vào Product & Design</h3>
              <ul className="space-y-4 list-disc list-inside">
                <li className={theme.textMuted}>Chuyên tâm vẽ UI/UX trên Figma, viết Goal, chốt AC và phân rã task.</li>
                <li className={theme.textMuted}>Xây dựng quy trình gốc và chuẩn hóa bộ tài liệu bàn giao cho Agent.</li>
                <li className={theme.textMuted}>Định nghĩa các điểm giao thoa giữa Người và AI (ví dụ: Khi nào hệ thống phải gọi người duyệt).</li>
                <li className={theme.textMuted}>Review & Approve — Nắm quyền quyết định tối cao (duyệt kết quả cuối cùng).</li>
              </ul>
            </div>
            <div className={`p-8 rounded-2xl ${theme.card}`}>
              <h3 className="text-amber-600 dark:text-amber-500 font-bold text-2xl mb-6">Thiết kế Hệ thống (Architecture)</h3>
              <ul className="space-y-4 list-disc list-inside">
                <li className={theme.textMuted}>Bắt bệnh hệ thống thủ công, tìm ra điểm gãy (bottleneck) và rủi ro lỗi.</li>
                <li className={theme.textMuted}>Phác thảo quy tắc phân luồng Route A/B/C và logic điều phối Agent.</li>
                <li className={theme.textMuted}>Soạn thảo hệ thống quản trị tri thức (.agent-rules) và cơ chế cách ly an toàn.</li>
                <li className={theme.textMuted}>Đích thân chạy thử nghiệm, tinh chỉnh câu lệnh (prompt) và đóng gói kỹ năng (Skills) cho AI.</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* SECTION 8: Handoff Contract */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>08. Bàn giao Thiết kế (Handoff)</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tài liệu Thiết kế: Bản hợp đồng đanh thép</h2>
            <p className={`text-lg max-w-4xl ${theme.textMuted}`}>
              Agent sẽ code dựa trên bản thiết kế của tôi. Bản thiết kế ở đây không chỉ là cái hình xem cho vui, nó là một "Hợp đồng" gắn chặt với Goal, AC và Scope. Nếu Agent soi ra mâu thuẫn giữa Hình vẽ và AC, hệ thống sẽ lập tức giật cờ báo động (Escalation) để gọi con người vào giải quyết.
            </p>
          </div>

          <div className="mb-12 text-center">
            <img src="/images/case-study/handoff_contract.jpg" alt="Design Handoff Contracts" className="rounded-2xl shadow-lg max-h-[450px] inline-block w-full object-cover border border-slate-200/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border-t-4 border-t-amber-500 ${theme.card}`}>
              <h3 className="text-amber-600 dark:text-amber-500 font-bold text-lg mb-3">Thiết kế Figma</h3>
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>Dùng khi làm tính năng lớn: User Flow phức tạp, cần bám sát UI Kit, Responsive State. Phải chi tiết đến từng pixel.</p>
            </div>
            <div className={`p-6 rounded-2xl border-t-4 border-t-emerald-500 ${theme.card}`}>
              <h3 className="text-emerald-600 dark:text-emerald-500 font-bold text-lg mb-3">Bản nháp HTML (Prototype)</h3>
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>Dùng khi cần Agent cảm nhận Interaction, Animation, hoặc test độ mượt mà thực tế trên trình duyệt.</p>
            </div>
            <div className={`p-6 rounded-2xl border-t-4 border-t-slate-500 ${theme.card}`}>
              <h3 className="text-slate-600 dark:text-slate-400 font-bold text-lg mb-3">Hình tham chiếu (PNG)</h3>
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>Dùng cho các task tinh chỉnh UI nhỏ lẻ (Route A). Nhanh gọn, trực quan, đủ để Agent hiểu ngay ý đồ.</p>
            </div>
          </div>
        </motion.section>

        {/* SECTION 9: Real Example */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>09. VÍ DỤ THỰC TẾ</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Thực chiến: Chạy thử một Task từ A-Z</h2>
            <p className={`text-lg max-w-3xl ${theme.textMuted}`}>
              Cùng xem cách hệ thống tự động chạy trơn tru từ lúc nhận yêu cầu đến khi code xong hoàn chỉnh, không cần đốc thúc.
            </p>
          </div>

          <div className="relative pl-6 md:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-10">
            {[
              { title: "1. Viết User Story", desc: "Nhận US #124 từ Product Owner: \"Fix padding trang Checkout\".", color: "bg-slate-300 dark:bg-slate-700" },
              { title: "2. Khởi tạo Task", desc: "Tạo Issue tương ứng để tracking.", color: "bg-slate-300 dark:bg-slate-700" },
              { title: "3. Bàn giao Thiết kế", desc: "Đính kèm PNG ghi chú khoảng cách 16px (Handoff Contract).", color: "bg-slate-300 dark:bg-slate-700" },
              { title: "4. Phân luồng (Router)", desc: "/dispatch quét qua và phán: \"Task lặt vặt, không đụng code lõi\" ➔ Bẻ lái vào Route A.", color: "bg-emerald-500" },
              { title: "5. Chọn Agent", desc: "Chỉ định tự động Sonnet xử lý cho nhanh.", color: "bg-emerald-500" },
              { title: "6. Cấp phát Môi trường", desc: "Hệ thống tự tạo nhánh Git thông thường, không cần cách ly phức tạp.", color: "bg-emerald-500" },
              { title: "7. AI Bắt tay vào Code", desc: "Sonnet mở .agent-rules đọc luật CSS dự án rồi mới bắt đầu code.", color: "bg-slate-800 dark:bg-slate-400" },
              { title: "8. Tự kiểm tra", desc: "Code xong, Sonnet tự động soi lại UI xem đã chuẩn 16px chưa.", color: "bg-slate-800 dark:bg-slate-400" },
              { title: "9. Agent QA chéo", desc: "Anh cả Opus nhảy vào check lại code diff một lần nữa để chắc chắn Sonnet không sửa bậy bạ.", color: "bg-emerald-500" },
              { title: "10. Hoàn thành & Báo cáo", desc: "Hệ thống tự push code, chụp luôn bức ảnh Evidence đính kèm vào PR.", color: "bg-slate-300 dark:bg-slate-700" },
              { title: "11. Đóng Task & Ghi Log", desc: "Tự động kéo Issue sang Done, ghi sổ nhật ký Sprint gọn gàng.", color: "bg-slate-300 dark:bg-slate-700", last: true }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[31px] md:-left-[39px] w-4 h-4 rounded-full ${step.color} ring-4 ${isLightMode ? 'ring-white' : 'ring-[#0f172a]'}`}></div>
                <h3 className="text-xl font-bold mb-1">{step.title}</h3>
                <p className={theme.textMuted}>{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 10: Grand Finale (Closing CTA) */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20">
          <div className="rounded-3xl overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 z-0">
              <img src="/images/case-study/agent_rules.jpg" alt="Knowledge Governance" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
            </div>
            
            <div className="relative z-10 p-10 md:p-16 text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">Điều phối xịn mới chỉ là một nửa câu chuyện!</h2>
              <p className="text-lg text-slate-300 mb-10 leading-relaxed">
                Workflow giải quyết cực tốt bài toán <strong>"Ai làm gì?"</strong>. Nhưng Agent chỉ làm đúng khi nó hiểu rõ luật lệ. Phần sau, tôi sẽ hé lộ cách xây dựng <strong>"Hiến pháp cho AI"</strong> — bộ quy tắc nghiêm ngặt ép AI phải tuân thủ kỷ luật dự án đến từng chi tiết nhỏ nhất.
              </p>
              <a href="/project-rules" className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold transition-colors">
                Khám phá Quản trị Tri thức (.agent-rules)
                <span className="text-xl">→</span>
              </a>
            </div>
          </div>
        </motion.section>
        
      </div>
    </CaseStudyLayout>
  );
};
