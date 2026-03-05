import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const useSupabase = import.meta.env.VITE_USE_SUPABASE;

const isSupabaseDisabled =
  useSupabase === 'false' || !supabaseUrl || !supabaseAnonKey;

export const isSupabaseEnabled = !isSupabaseDisabled;

function createMockSupabaseClient() {
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
        user: null,
      }),
    getSession: () =>
      authPromise({
        session: null,
      }),
    signUp: () => authPromise({ user: null, session: null }),
    signInWithPassword: () => authPromise({ user: null, session: null }),
    signInWithOAuth: () => authPromise({ provider: 'google', url: null }),
    signOut: () => emptyPromise(),
    resetPasswordForEmail: () => authPromise(),
    updateUser: () => authPromise({ user: null }),
    onAuthStateChange: (callback) => {
      callback('INITIAL_SESSION', null);
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
