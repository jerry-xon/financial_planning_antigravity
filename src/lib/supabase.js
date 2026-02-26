import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const useSupabase = import.meta.env.VITE_USE_SUPABASE;
const devUserEmail = import.meta.env.VITE_DEV_USER_EMAIL;

const isSupabaseDisabled =
  useSupabase === 'false' || !supabaseUrl || !supabaseAnonKey;

export const isSupabaseEnabled = !isSupabaseDisabled;

function createMockSupabaseClient() {
  const devUser =
    devUserEmail &&
    ({
      id: 'dev-user-id',
      email: devUserEmail,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    });

  const emptyPromise = (data = null) =>
    Promise.resolve({ data, error: null });

  const authPromise = (data = null) =>
    Promise.resolve({ data, error: null });

  const tableChain = (result = null) => {
    const promise = emptyPromise(result ?? []);
    const chain = {
      select: () => chain,
      eq: () => chain,
      not: () => chain,
      order: () => chain,
      insert: () => chain,
      update: () => chain,
      delete: () => chain,
      single: () => emptyPromise(result ?? null),
      then: (resolve, reject) => promise.then(resolve, reject),
      catch: (fn) => promise.catch(fn),
    };
    return chain;
  };

  const auth = {
    getUser: () =>
      authPromise({
        user: devUser ?? null,
      }),
    getSession: () =>
      authPromise({
        session: devUser
          ? {
              user: devUser,
              access_token: 'mock-token',
              refresh_token: 'mock-refresh',
              expires_in: 3600,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
            }
          : null,
      }),
    signUp: () => authPromise({ user: null, session: null }),
    signInWithPassword: () => authPromise({ user: null, session: null }),
    signInWithOAuth: () => authPromise({ provider: 'google', url: null }),
    signOut: () => emptyPromise(),
    resetPasswordForEmail: () => authPromise(),
    updateUser: () => authPromise({ user: devUser ?? null }),
    onAuthStateChange: (callback) => {
      callback('INITIAL_SESSION', devUser ? { user: devUser } : null);
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  };

  const from = () => tableChain();

  const channel = (name) => ({
    on: () => ({
      subscribe: () => ({}),
    }),
  });

  const removeChannel = () => {};

  return {
    auth,
    from,
    channel,
    removeChannel,
  };
}

let client;

if (isSupabaseDisabled) {
  client = createMockSupabaseClient();
  if (typeof console !== 'undefined' && console.info) {
    console.info(
      '[Supabase] Running in mock mode (no database). Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use the real backend.'
    );
  }
} else {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionUrl: true,
    },
  });
}

export const supabase = client;
