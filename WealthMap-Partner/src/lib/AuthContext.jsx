import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { invokePartnerApi } from '../lib/partnerApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meLoading, setMeLoading] = useState(false);

  const refreshMe = async () => {
    setMeLoading(true);
    try {
      const data = await invokePartnerApi('get_me');
      setMe(data);
      return data;
    } catch (err) {
      setMe(null);
      throw err;
    } finally {
      setMeLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setMe(null);
      return;
    }
    refreshMe().catch(() => setMe(null));
  }, [session?.user?.id]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      me,
      loading,
      meLoading,
      refreshMe,
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setMe(null);
      },
      mustChangePassword:
        me?.kind === 'partner'
          ? Boolean(me?.partner?.must_change_password)
          : Boolean(me?.must_change_password),
      kind: me?.kind || null,
      seats: me?.seats || null,
    }),
    [session, me, loading, meLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth requires AuthProvider');
  return ctx;
}
