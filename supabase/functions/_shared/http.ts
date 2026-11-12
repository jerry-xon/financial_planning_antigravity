import { corsHeaders } from './cors.ts';

export function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export async function readJsonBody(req: Request): Promise<
  { ok: true; body: Record<string, unknown> } | { ok: false; response: Response }
> {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    return { ok: true, body: body ?? {} };
  } catch {
    return {
      ok: false,
      response: json(400, { success: false, error: 'Invalid JSON payload' }),
    };
  }
}
