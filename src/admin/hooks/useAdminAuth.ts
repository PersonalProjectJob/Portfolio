import { create } from 'zustand';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface AdminAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isDemoMode: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | Error | null; data: any }>;
  signInWithOtp: (email: string) => Promise<{ error: AuthError | Error | null; data: any }>;
  signOut: () => Promise<void>;
  loginAsDemo: () => void;
  clearError: () => void;
  initAuth: () => Promise<void>;
}

const DEMO_USER: User = {
  id: 'demo-admin-id-001',
  app_metadata: { provider: 'email' },
  user_metadata: { role: 'admin', full_name: 'Lead Designer & Engineer' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'admin@portfolio.local',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

const DEMO_STORAGE_KEY = 'portfolio_admin_demo_auth';

// Helper to check existing demo auth
const checkInitialDemoAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_STORAGE_KEY) === 'true';
};

export const useAdminAuth = create<AdminAuthState>((set) => ({
  user: checkInitialDemoAuth() ? DEMO_USER : null,
  session: checkInitialDemoAuth()
    ? {
        access_token: 'demo-token',
        token_type: 'bearer',
        expires_in: 86400,
        refresh_token: 'demo-refresh',
        user: DEMO_USER,
      }
    : null,
  loading: false,
  error: null,
  isDemoMode: checkInitialDemoAuth(),
  isAuthenticated: checkInitialDemoAuth(),

  initAuth: async () => {
    try {
      if (checkInitialDemoAuth()) {
        set({
          user: DEMO_USER,
          session: {
            access_token: 'demo-token',
            token_type: 'bearer',
            expires_in: 86400,
            refresh_token: 'demo-refresh',
            user: DEMO_USER,
          },
          isDemoMode: true,
          isAuthenticated: true,
          loading: false,
        });
        return;
      }

      if (isSupabaseConfigured) {
        set({ loading: true });
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('[useAdminAuth] getSession error:', sessionError.message);
        }
        set({
          session: data.session,
          user: data.session?.user ?? null,
          isAuthenticated: Boolean(data.session?.user),
          isDemoMode: false,
          loading: false,
        });
      }
    } catch (err) {
      console.error('[useAdminAuth] Auth initialization error:', err);
      set({ loading: false });
    }
  },

  signInWithPassword: async (email: string, password: string) => {
    set({ error: null, loading: true });

    try {
      if (!isSupabaseConfigured) {
        // Mock authentication for development / preview
        if (email.trim()) {
          localStorage.setItem(DEMO_STORAGE_KEY, 'true');
          const mockUser: User = { ...DEMO_USER, email: email.trim() };
          const mockSession: Session = {
            access_token: 'demo-access-token',
            token_type: 'bearer',
            expires_in: 86400,
            refresh_token: 'demo-refresh-token',
            user: mockUser,
          };
          set({
            user: mockUser,
            session: mockSession,
            isDemoMode: true,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          return { error: null, data: { user: mockUser, session: mockSession } };
        } else {
          const mockErr = new Error('Please enter a valid email address.') as AuthError;
          set({ error: mockErr.message, loading: false });
          return { error: mockErr, data: null };
        }
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) {
        set({ error: authErr.message, loading: false });
        return { error: authErr, data: null };
      }

      set({
        session: data.session,
        user: data.user,
        isAuthenticated: true,
        isDemoMode: false,
        loading: false,
        error: null,
      });
      return { error: null, data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      set({ error: message, loading: false });
      return { error: new Error(message), data: null };
    }
  },

  signInWithOtp: async (email: string) => {
    set({ error: null, loading: true });

    try {
      if (!isSupabaseConfigured) {
        if (email.includes('@')) {
          localStorage.setItem(DEMO_STORAGE_KEY, 'true');
          const mockUser: User = { ...DEMO_USER, email: email.trim() };
          const mockSession: Session = {
            access_token: 'demo-access-token',
            token_type: 'bearer',
            expires_in: 86400,
            refresh_token: 'demo-refresh-token',
            user: mockUser,
          };
          set({
            user: mockUser,
            session: mockSession,
            isDemoMode: true,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          return {
            error: null,
            data: { message: 'Demo Mode: Signed in successfully with simulated magic link.' },
          };
        }
        const err = new Error('Please enter a valid email address.');
        set({ error: err.message, loading: false });
        return { error: err, data: null };
      }

      const { data, error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (otpErr) {
        set({ error: otpErr.message, loading: false });
        return { error: otpErr, data: null };
      }

      set({ loading: false, error: null });
      return { error: null, data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send magic link';
      set({ error: message, loading: false });
      return { error: new Error(message), data: null };
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      set({
        session: null,
        user: null,
        isAuthenticated: false,
        isDemoMode: false,
        loading: false,
      });
    } catch (err) {
      console.error('[useAdminAuth] signOut error:', err);
      set({ loading: false });
    }
  },

  loginAsDemo: () => {
    localStorage.setItem(DEMO_STORAGE_KEY, 'true');
    const mockSession: Session = {
      access_token: 'demo-token',
      token_type: 'bearer',
      expires_in: 86400,
      refresh_token: 'demo-refresh',
      user: DEMO_USER,
    };
    set({
      session: mockSession,
      user: DEMO_USER,
      isDemoMode: true,
      isAuthenticated: true,
      error: null,
      loading: false,
    });
  },

  clearError: () => set({ error: null }),
}));

// Setup Supabase auth listener once globally
if (typeof window !== 'undefined' && isSupabaseConfigured) {
  supabase.auth.onAuthStateChange((_event, newSession) => {
    useAdminAuth.setState({
      session: newSession,
      user: newSession?.user ?? null,
      isAuthenticated: Boolean(newSession?.user),
      isDemoMode: false,
      loading: false,
    });
  });
}
