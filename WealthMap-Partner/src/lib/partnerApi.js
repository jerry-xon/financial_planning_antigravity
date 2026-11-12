import { supabase } from './supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function invokePartnerApi(action, body = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    'Content-Type': 'application/json',
    apikey: supabaseAnonKey,
  };

  // register_partner may use secret without session
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  if (body.registerSecret) {
    headers['x-partner-register-secret'] = body.registerSecret;
    delete body.registerSecret;
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/partner-api`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...body }),
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok || result?.success === false) {
    const err = new Error(result?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = result?.code;
    err.payload = result;
    throw err;
  }
  return result.data;
}
