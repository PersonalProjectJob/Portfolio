import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  Sparkles, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface AdminLoginProps {
  onSuccess?: () => void;
  onNavigatePublic?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onNavigatePublic }) => {
  const { signInWithPassword, signInWithOtp, loginAsDemo, loading, error, clearError } = useAdminAuth();
  
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setOtpSuccessMessage(null);

    if (!email.trim()) return;

    setSubmitting(true);
    if (authMode === 'password') {
      const res = await signInWithPassword(email, password);
      setSubmitting(false);
      if (!res.error) {
        onSuccess?.();
      }
    } else {
      const res = await signInWithOtp(email);
      setSubmitting(false);
      if (!res.error) {
        setOtpSuccessMessage('Magic link sent! Check your inbox to sign in directly.');
      }
    }
  };

  const handleDemoLogin = () => {
    clearError();
    loginAsDemo();
    onSuccess?.();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 px-4 py-12">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card Shell */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/85 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden p-8 sm:p-10">
          
          {/* Top navigation back link */}
          <div className="flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={() => {
                if (onNavigatePublic) {
                  onNavigatePublic();
                } else {
                  window.location.href = '/';
                }
              }}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-teal-300 transition-colors focus-visible:outline-teal-500"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Portfolio</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </div>
          </div>

          {/* Header Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-900/40 border border-teal-500/30 text-teal-300 mb-4 shadow-lg shadow-teal-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Portfolio Admin CMS
            </h1>
            <p className="text-sm text-slate-400 mt-2 font-sans">
              Sign in to manage case studies, media, and UTM links
            </p>
          </div>

          {/* Auth Mode Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/70 border border-slate-800/80 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                clearError();
                setOtpSuccessMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'password'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                clearError();
                setOtpSuccessMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'otp'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Magic Link</span>
            </button>
          </div>

          {/* Error Alert */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Success Alert */}
          <AnimatePresence mode="wait">
            {otpSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                className="mb-5 p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div className="flex-1">{otpSuccessMessage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>
            </div>

            {authMode === 'password' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : authMode === 'password' ? (
                <span>Sign In to Admin</span>
              ) : (
                <span>Send Magic Link</span>
              )}
            </button>
          </form>

          {/* Quick Demo Access (for dev and reviewing) */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 mb-3">Developer Preview Mode</p>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-amber-300/90 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Demo Access (Bypass Auth)</span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          Portfolio Admin Shell &bull; Supabase RLS Protected &bull; Sprint 1
        </p>
      </motion.div>
    </div>
  );
};
