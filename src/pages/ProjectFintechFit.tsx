import React from 'react';
import { motion } from 'framer-motion';

const BankIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="6" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/><path d="M7 15h.01"/><path d="M11 15h2"/></svg>;
const TargetIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const CheckCircleIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const MailIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;

import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';

export const ProjectFintechFit: React.FC = () => {
  const { isLightMode } = useStore();
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f172a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-white/10',
    accent: isLightMode ? 'text-amber-600' : 'text-amber-400',
    glow: isLightMode ? 'shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'shadow-[0_0_30px_rgba(16,185,129,0.1)]'
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

      <div className="pt-20 md:pt-24">
        <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="mb-12 md:mb-20 text-center md:text-left">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border ${isLightMode ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>Tầm nhìn & Đóng góp</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
            Mảnh ghép cho <span className="text-amber-500">Ngân hàng số</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl ${theme.textMuted} leading-relaxed mx-auto md:mx-0`}>
            Tại sao tư duy thiết kế của tôi lại phù hợp với các sản phẩm Fintech và Ngân hàng số?
          </p>
        </motion.section>

        {/* Fintech Fit */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 md:mb-24">
          <div className={`p-6 md:p-8 rounded-3xl border backdrop-blur-xl ${theme.card} ${theme.glow}`}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><BankIcon/> Sản phẩm tài chính cần gì?</h3>
            <ul className={`space-y-4 ${theme.textMuted}`}>
              <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>Sự tin cậy & Tính minh bạch:</strong> Tiền đang ở đâu, phí bao nhiêu.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>Luồng rõ ràng:</strong> Đăng ký, kích hoạt, giao dịch không gây bối rối.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>Quản lý trạng thái:</strong> Xử lý mượt mà khi lỗi, rớt mạng, hoặc chờ xử lý từ phía ngân hàng.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>Hệ thống thiết kế mạnh:</strong> Đảm bảo an toàn và nhất quán trên mọi điểm chạm.</span></li>
            </ul>
          </div>
          
          <div className={`p-6 md:p-8 rounded-3xl border backdrop-blur-xl ${isLightMode ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-900/10 border-amber-500/30'} ${theme.glow}`}>
            <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}><TargetIcon/> Đóng góp của tôi</h3>
            <ul className={`space-y-4 ${isLightMode ? 'text-amber-900/70' : 'text-amber-200/70'}`}>
              <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>Tư duy logic:</strong> Qua dự án VLINKPAY, tôi quen với việc phân tích luồng tiền, tách bạch vai trò người dùng và điểm giao dịch.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>Giảm sự mơ hồ:</strong> Thói quen phân tích BA/DOCS giúp tôi biến các nghiệp vụ phức tạp thành màn hình UI rõ ràng, dễ implement.</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>Tăng tốc với AI:</strong> Áp dụng AI để rà soát quy trình, tạo bản mẫu nhanh nhưng vẫn giữ nguyên tính hệ thống.</span></li>
            </ul>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="text-center">
          <div className={`p-10 md:p-16 rounded-3xl border ${isLightMode ? 'bg-amber-600 border-amber-500 text-white' : 'bg-gradient-to-r from-amber-900 to-slate-900 border-amber-500/50'} shadow-2xl`}>
            <MailIcon className={`w-12 h-12 mx-auto mb-6 ${isLightMode ? 'text-amber-100' : 'text-amber-400'}`} />
            <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 ${isLightMode ? 'text-white' : 'text-slate-100'}`}>Sẵn sàng Trao đổi</h2>
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${isLightMode ? 'text-amber-100' : 'text-slate-300'}`}>
              Tôi rất mong có cơ hội thảo luận sâu hơn về cách tôi có thể đóng góp cho trải nghiệm sản phẩm tại đội ngũ của bạn.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="mailto:hellosonthao@gmail.com" 
                className={`px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${isLightMode ? 'bg-white text-amber-700 hover:bg-amber-50' : 'bg-amber-500 text-white hover:bg-amber-400'} shadow-lg hover:scale-105`}
              >
                Gửi Email
              </a>
              <a 
                href="https://www.linkedin.com/in/sonthaouid/" 
                target="_blank"
                rel="noopener noreferrer"
                className={`px-8 py-4 rounded-xl font-bold uppercase tracking-widest border transition-all ${isLightMode ? 'bg-amber-700 border-amber-500 text-white hover:bg-amber-800' : 'bg-slate-800/50 border-amber-500/30 text-amber-400 hover:bg-slate-800 hover:border-amber-500'} shadow-lg hover:scale-105`}
              >
                LinkedIn Profile
              </a>
            </div>
          </div>
        </motion.section>
      </div>
    </CaseStudyLayout>
  );
};
