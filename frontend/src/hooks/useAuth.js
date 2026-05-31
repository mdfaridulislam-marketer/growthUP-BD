// ══════════════════════════════════════════════════
// useAuth Hook — Authentication State Management
// ══════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Current session check
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });

    // Auth state change listen করো
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Login ──
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // ── Register ──
  const register = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;

    // Name profile এ সেভ করো
    if (data.user && name) {
      await supabase.from('profiles').update({ name }).eq('id', data.user.id);
    }

    return data;
  };

  // ── Logout ──
  const logout = async () => {
    await supabase.auth.signOut();
  };

  // ── Google Login ──
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) throw error;
  };

  return { user, loading, login, register, logout, loginWithGoogle };
}
