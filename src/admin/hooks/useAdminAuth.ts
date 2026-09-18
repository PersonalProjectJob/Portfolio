import { create } from 'zustand';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface AdminAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | Error | null; data: any }>;
  signInWithOtp: (email: string) => Promise<{ error: AuthError | Error | null; data: any }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initAuth: () => Promise<void>;
}

export const useAdminAuth = create<AdminAuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  initAuth: async () => {
    // Purge any legacy demo authentication tokens from earlier previews
    if (typeof window !== 'undefined') {
      localStorage.removeItem('portfolio_admin_demo_auth');
    }

    if (!isSupabaseConfigured) {
      console.warn('[useAdminAuth] Supabase credentials not configured in environment.');
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        loading: false,
        error: 'Supabase authentication is not configured. Please check environment variables.',
      });
      return;
    }

    try {
      set({ loading: true });
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('[useAdminAuth] getSession error:', sessionError.message);
      }
      set({
        session: data.session ?? null,
        user: data.session?.user ?? null,
        isAuthenticated: Boolean(data.session?.user),
        loading: false,
      });
    } catch (err) {
      console.error('[useAdminAuth] Auth initialization error:', err);
      set({ loading: false, isAuthenticated: false, user: null, session: null });
    }
  },

  signInWithPassword: async (email: string, password: string) => {
    set({ error: null, loading: true });

    if (!isSupabaseConfigured) {
      const err = new Error('Supabase authentication is not configured.') as AuthError;
      set({ error: err.message, loading: false });
      return { error: err, data: null };
    }

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
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

    if (!isSupabaseConfigured) {
      const err = new Error('Supabase authentication is not configured.') as AuthError;
      set({ error: err.message, loading: false });
      return { error: err, data: null };
    }

    try {
      const { data, error: otpErr } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/admin`,
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('portfolio_admin_demo_auth');
      }
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      set({
        session: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (err) {
      console.error('[useAdminAuth] signOut error:', err);
      set({ loading: false, user: null, session: null, isAuthenticated: false });
    }
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
      loading: false,
    });
  });
}
