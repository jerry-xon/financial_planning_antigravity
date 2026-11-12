import { createClient, type SupabaseClient, type User } from 'https://esm.sh/@supabase/supabase-js@2';
import { json } from './http.ts';

export type AuthedContext = {
  user: User;
  /** User-scoped client — RLS applies. Prefer this for plan reads/writes. */
  userClient: SupabaseClient;
  authHeader: string;
};

/**
 * Require a valid Bearer JWT. Auth is enforced inside the function via
 * getUser() because the API gateway does not verify ES256 tokens correctly
 * (same pattern as razorpay-checkout / send-push-notification).
 */
export async function requireUser(
  req: Request,
): Promise<{ ok: true; ctx: AuthedContext } | { ok: false; response: Response }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: json(401, { success: false, error: 'Missing authorization header' }),
    };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      response: json(500, { success: false, error: 'Missing Supabase environment variables' }),
    };
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: json(401, { success: false, error: 'Unauthorized user session' }),
    };
  }

  return { ok: true, ctx: { user, userClient, authHeader } };
}

/** Load a plan the caller owns (or is agent for). RLS must allow the select. */
export async function loadOwnedPlan(
  userClient: SupabaseClient,
  planId: string,
): Promise<{ ok: true; plan: Record<string, unknown> } | { ok: false; response: Response }> {
  if (!planId || typeof planId !== 'string') {
    return {
      ok: false,
      response: json(400, { success: false, error: 'planId is required' }),
    };
  }

  const { data, error } = await userClient
    .from('financial_plans')
    .select('*')
    .eq('id', planId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      response: json(400, { success: false, error: error.message }),
    };
  }
  if (!data) {
    return {
      ok: false,
      response: json(404, { success: false, error: 'Plan not found or access denied' }),
    };
  }

  return { ok: true, plan: data as Record<string, unknown> };
}
