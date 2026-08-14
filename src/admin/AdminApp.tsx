import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Sliders,
  Image as ImageIcon,
  Share2,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sun,
  Moon,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useAdminAuth } from './hooks/useAdminAuth';
import { AdminLogin } from './routes/AdminLogin';
import { AdminDashboard } from './routes/AdminDashboard';
import { AdminContent } from './routes/AdminContent';
import { AdminSettings } from './routes/AdminSettings';
import { AdminMedia } from './routes/AdminMedia';
import { AdminDistribution } from './routes/AdminDistribution';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from '../store/useStore';

const adminQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export type AdminRoute = 
  | '/admin' 
  | '/admin/content' 
  | '/admin/settings' 
  | '/admin/media' 
  | '/admin/distribution'
  | '/admin/login';

interface NavItem {
  name: string;
  route: AdminRoute;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    route: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Content & Case Studies',
    route: '/admin/content',
    icon: FolderKanban,
  },
  {
    name: 'Site Settings & Profile',
    route: '/admin/settings',
    icon: Sliders,
  },
  {
    name: 'Media Library',
    route: '/admin/media',
    icon: ImageIcon,
  },
  {
    name: 'UTM & Distribution',
    route: '/admin/distribution',
    icon: Share2,
    badge: 'Engine',
  },
];

export const AdminApp: React.FC = () => {
  const { user, isAuthenticated, loading, signOut } = useAdminAuth();
  const { isLightMode, toggleTheme, setGameState } = useStore();
  
  // Resolve initial admin route from URL
  const resolveInitialRoute = (): AdminRoute => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/admin';
    if (path === '/admin/login') return '/admin/login';
    if (path === '/admin/content') return '/admin/content';
    if (path === '/admin/settings') return '/admin/settings';
    if (path === '/admin/media') return '/admin/media';
    if (path === '/admin/distribution') return '/admin/distribution';
    return '/admin';
  };

  const [currentRoute, setCurrentRoute] = useState<AdminRoute>(resolveInitialRoute());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync navigation with browser history
  const navigate = useCallback((route: AdminRoute) => {
    setCurrentRoute(route);
    setMobileMenuOpen(false);
    if (window.location.pathname !== route) {
      window.history.pushState({ adminRoute: route }, '', route);
    }
  }, []);

  // Listen to popstate for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/\/+$/, '') || '/admin';
      if (
        path === '/admin' ||
        path === '/admin/content' ||
        path === '/admin/settings' ||
        path === '/admin/media' ||
        path === '/admin/distribution' ||
        path === '/admin/login'
      ) {
        setCurrentRoute(path as AdminRoute);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Public navigation handler
  const handleNavigatePublic = () => {
    setGameState('HERO_LANDING');
    window.location.href = '/';
  };

  // ─── 1. Auth Loading Screen ───
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-400 tracking-wide font-sans">
            Verifying Admin Session...
          </p>
        </div>
      </div>
    );
  }

  // ─── 2. Auth Guard: Render Login if not authenticated ───
  if (!isAuthenticated || currentRoute === '/admin/login') {
    return (
      <AdminLogin
        onSuccess={() => navigate('/admin')}
        onNavigatePublic={handleNavigatePublic}
      />
    );
  }

  // ─── 3. Main Admin Layout ───
  return (
    <QueryClientProvider client={adminQueryClient}>
      <div className={`min-h-screen flex transition-colors duration-200 ${
        isLightMode ? 'bg-slate-50 text-slate-900 font-sans' : 'bg-slate-950 text-slate-100 font-sans'
      }`}>
        {/* ─── Mobile Sidebar Drawer ─── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`fixed top-0 bottom-0 left-0 z-50 w-72 border-r p-6 flex flex-col justify-between backdrop-blur-2xl shadow-2xl lg:hidden ${
                  isLightMode ? 'bg-white/95 border-slate-200' : 'bg-slate-950/95 border-slate-800'
                }`}
              >
                <div>
                  {/* Mobile Brand Header */}
                  <div className={`flex items-center justify-between pb-6 border-b ${
                    isLightMode ? 'border-slate-200' : 'border-slate-800/80'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        <img
                          src="/favicon.png"
                          alt="Son Thao"
                          className="w-full h-full object-contain drop-shadow-md"
                        />
                      </div>
                      <div>
                        <h2 className={`text-base font-bold font-display ${
                          isLightMode ? 'text-slate-900' : 'text-white'
                        }`}>Portfolio CMS</h2>
                        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-mono">Admin Control Center</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isLightMode ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mobile Nav Links */}
                  <nav className="mt-6 space-y-1.5">
                    {NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentRoute === item.route;
                      return (
                        <button
                          key={item.route}
                          type="button"
                          onClick={() => navigate(item.route)}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? isLightMode
                                ? 'bg-teal-50 text-teal-800 border border-teal-500/30 shadow-sm'
                                : 'bg-teal-600/20 text-teal-300 border border-teal-500/40 shadow-md shadow-teal-950'
                              : isLightMode
                              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? (isLightMode ? 'text-teal-600' : 'text-teal-400') : (isLightMode ? 'text-slate-400' : 'text-slate-500')}`} />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                              isLightMode ? 'bg-teal-100 text-teal-800' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Mobile Sidebar Footer */}
                <div className={`pt-4 border-t space-y-3 ${
                  isLightMode ? 'border-slate-200' : 'border-slate-800/80'
                }`}>
                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ─── Desktop Sticky Sidebar ─── */}
        <aside className={`hidden lg:flex flex-col justify-between w-64 xl:w-72 shrink-0 h-screen sticky top-0 border-r backdrop-blur-xl p-5 z-30 transition-colors duration-200 ${
          isLightMode
            ? 'bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50'
            : 'bg-slate-950/90 border-slate-800/60'
        }`}>
          <div>
            {/* Brand Header */}
            <div className={`flex items-center gap-3.5 pb-6 border-b ${
              isLightMode ? 'border-slate-200' : 'border-slate-800/60'
            }`}>
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <img
                  src="/favicon.png"
                  alt="Son Thao"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <div>
                <h2 className={`text-base font-bold font-display ${
                  isLightMode ? 'text-slate-900' : 'text-white'
                }`}>Portfolio CMS</h2>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Admin Control Center</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="mt-6 space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => navigate(item.route)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? isLightMode
                          ? 'bg-teal-50 text-teal-800 border border-teal-500/30 shadow-sm'
                          : 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-md shadow-teal-950'
                        : isLightMode
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? (isLightMode ? 'text-teal-600' : 'text-teal-400') : (isLightMode ? 'text-slate-400' : 'text-slate-500')}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isLightMode ? 'bg-teal-100 text-teal-800' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom Footer: Public Link & Logout */}
          <div className={`pt-4 border-t space-y-2 ${
            isLightMode ? 'border-slate-200' : 'border-slate-800/60'
          }`}>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                isLightMode
                  ? 'text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                  : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4 text-amber-500" />
                <span>Public Portfolio</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} />
            </a>

            <button
              type="button"
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ─── Right Main Body (Header + Content Surface) ─── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          
          {/* Top Header */}
          <header className={`h-16 sticky top-0 z-20 backdrop-blur-xl border-b px-4 sm:px-8 flex items-center justify-between transition-colors duration-200 ${
            isLightMode ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800/60'
          }`}>
            {/* Left: Mobile hamburger & breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-xl transition-colors ${
                  isLightMode ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className={`hidden sm:flex items-center gap-2 text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>Admin</span>
                <span>/</span>
                <span className={`font-semibold capitalize ${isLightMode ? 'text-teal-700' : 'text-teal-300'}`}>
                  {currentRoute.replace('/admin', '').replace('/', '') || 'Overview'}
                </span>
              </div>
            </div>

            {/* Right Header Badges & Actions */}
            <div className="flex items-center gap-3">
              {/* User Session Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                isLightMode ? 'bg-slate-100/90 border-slate-200 text-slate-700' : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
              }`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[160px] truncate font-medium">
                  {user?.email || 'admin@portfolio.dev'}
                </span>
              </div>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isLightMode
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:text-amber-600 hover:bg-slate-200'
                    : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-amber-300 hover:border-slate-700'
                }`}
                title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* Direct Logout */}
              <button
                type="button"
                onClick={signOut}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          {/* ─── Main Content Canvas ─── */}
          <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentRoute === '/admin' && (
                <AdminDashboard key="dashboard" onNavigate={(route) => navigate(route as AdminRoute)} />
              )}
              {currentRoute === '/admin/content' && (
                <AdminContent key="content" />
              )}
              {currentRoute === '/admin/settings' && (
                <AdminSettings key="settings" />
              )}
              {currentRoute === '/admin/media' && (
                <AdminMedia key="media" />
              )}
              {currentRoute === '/admin/distribution' && (
                <AdminDistribution key="distribution" />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default AdminApp;
