import React from 'react';
import { motion } from 'framer-motion';

const BotIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
const CheckCircleIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const UserIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';

export const ProjectAIProcess: React.FC = () => {
  const { isLightMode } = useStore();
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f172a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-white/10',
    accent: isLightMode ? 'text-amber-600' : 'text-amber-400',
    glow: isLightMode ? 'shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'shadow-[0_0_30px_rgba(245,158,11,0.1)]'
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <CaseStudyLayout>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${isLightMode ? 'from-amber-100/50 via-transparent to-transparent' : 'from-amber-900/20 via-transparent to-transparent'}`}></div>
      </div>

      <div className="pt-12">
        <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="mb-20 text-center md:text-left">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border ${isLightMode ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>Tư duy & Quy trình làm việc</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
            AI Trong Thiết Kế <br className="hidden md:block"/> 
            <span className="text-amber-500">Người Dùng Quyết Định</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl ${theme.textMuted} leading-relaxed mx-auto md:mx-0`}>
            Tôi xem AI là một "Builder" để tăng tốc quá trình phát triển (MVP), không phải là người ra quyết định thay cho Product Designer.
          </p>
        </motion.section>

        {/* Division of Labor */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className={`p-8 rounded-3xl border backdrop-blur-xl ${theme.card} ${theme.glow}`}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><BotIcon/> AI Giúp Tôi (Builder)</h3>
            <ul className={`space-y-4 ${theme.textMuted}`}>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span>Khám phá các hướng bố cục nhanh hơn.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span>Tạo bản mẫu (Prototype/MVP) nhanh hơn.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span>Phác thảo nội dung UX (UX Copywriting).</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span>Phác thảo tài liệu hướng dẫn thành phần giao diện.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span>Tạo ra nhiều phương án để có cơ sở đối chiếu và rà soát.</span></li>
            </ul>
          </div>
          
          <div className={`p-8 rounded-3xl border backdrop-blur-xl ${isLightMode ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-900/10 border-amber-500/30'} ${theme.glow}`}>
            <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}><UserIcon/> Tôi Vẫn Làm Chủ (Decision Maker)</h3>
            <ul className={`space-y-4 ${isLightMode ? 'text-amber-900/70' : 'text-amber-200/70'}`}>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span><strong>Xác định đúng bài toán:</strong> Dữ liệu và nhu cầu của người dùng.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span><strong>Quyết định luồng trải nghiệm:</strong> Map User Journey và User Flow.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span><strong>Xử lý các trạng thái:</strong> Empty, Pending, Error, Success.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span><strong>Đảm bảo thứ bậc thông tin:</strong> User nhìn thấy gì trước, bấm vào đâu.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span><strong>Kiểm soát tính nhất quán & khả thi:</strong> Đảm bảo hệ thống Design System chuẩn và dễ code.</span></li>
            </ul>
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="text-center">
          <blockquote className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight max-w-4xl mx-auto ${theme.text}`}>
            "AI giúp tôi đi nhanh hơn. <br/> 
            <span className="text-amber-500">Tư duy sản phẩm giúp tôi đi đúng hướng hơn."</span>
          </blockquote>
        </motion.section>
      </div>
    </CaseStudyLayout>
  );
};
