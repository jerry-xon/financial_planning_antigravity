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

/**
 * Invoke Gemini-powered policy document parser via Supabase Edge Function
 * @param {string} fileBase64 Raw base64 string of PDF / Image
 * @param {string} mimeType e.g. 'application/pdf', 'image/jpeg', 'image/png'
 * @param {'motor'|'health'} policyCategory
 */
export async function invokeParsePolicy(fileBase64, mimeType, policyCategory) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    'Content-Type': 'application/json',
    apikey: supabaseAnonKey,
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/parse-policy`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fileBase64, mimeType, policyCategory }),
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok || result?.success === false) {
    const err = new Error(result?.error || `Policy extraction failed (${res.status})`);
    err.status = res.status;
    err.details = result?.details;
    throw err;
  }
  return result.data;
}
