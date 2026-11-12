import { supabase } from '../lib/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * When true (default), plan CRUD and compute go through Edge Functions.
 * Set VITE_USE_EDGE_API=false to fall back to direct PostgREST + local Logic.
 */
export const useEdgeApi = () => import.meta.env.VITE_USE_EDGE_API !== 'false';

async function getAccessToken() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error('Not authenticated');
  }
  return session.access_token;
}

/**
 * Invoke a Supabase Edge Function with the caller's JWT.
 * Gateway verify_jwt is off (ES256); functions authenticate via getUser().
 */
export async function invokeEdgeFunction(functionName, body = {}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured');
  }

  const accessToken = await getAccessToken();
  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(body),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`Edge function ${functionName} returned non-JSON (${response.status})`);
  }

  if (!response.ok || result?.success === false) {
    const err = new Error(result?.error || `Edge function ${functionName} failed (${response.status})`);
    err.status = response.status;
    err.payload = result;
    throw err;
  }

  return result;
}
