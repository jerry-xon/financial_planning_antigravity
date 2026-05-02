/**
 * Sends professional invitation emails via AWS SES for coupon_codes rows.
 *
 * Secrets (Supabase Dashboard → Edge Functions → send-coupon-email):
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION (e.g. ap-south-1)
 *   SES_FROM_EMAIL — verified sender in SES (same region)
 * Optional:
 *   APP_PUBLIC_URL (default https://app.wealthmap.app)
 *   MARKETING_SITE_URL (default https://wealthmap.app)
 *   EMAIL_BRAND_NAME (default Finbrella)
 *
 * verify_jwt is false in config.toml; we validate admin via user_profiles below.
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SESClient, SendEmailCommand } from 'npm:@aws-sdk/client-ses@3.654.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

function escHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtmlEmail(opts: {
  brand: string;
  recipientEmail: string;
  code: string;
  inviteUrl: string;
  marketingUrl: string;
}) {
  const { brand, recipientEmail, code, inviteUrl, marketingUrl } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="padding:28px 32px 12px 32px;background:linear-gradient(135deg,#0f766e 0%,#0d9488 100%);">
              <p style="margin:0;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);font-weight:600;">Invitation</p>
              <h1 style="margin:8px 0 0 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.25;">Your ${escHtml(brand)} access is ready</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px 32px;color:#1e293b;font-size:15px;line-height:1.6;">
              <p style="margin:0 0 16px 0;">Hello,</p>
              <p style="margin:0 0 16px 0;">You’ve been granted complimentary access to the financial planning suite. Use the secure link below to sign in or create your account with <strong>this same email address</strong> (<span style="color:#0f766e;font-weight:600;">${escHtml(recipientEmail)}</span>). Your subscription will activate automatically—no payment step.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
                <tr>
                  <td align="center">
                    <a href="${escHtml(inviteUrl)}" style="display:inline-block;padding:14px 28px;background:#0d9488;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:8px;">Open your personalized signup link</a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 8px 0;font-size:13px;color:#64748b;">Or open the app and enter your coupon manually:</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px dashed #cbd5e1;border-radius:10px;background:#f8fafc;">
                <tr>
                  <td style="padding:18px 20px;text-align:center;">
                    <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;font-weight:600;">Your coupon code</p>
                    <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:20px;font-weight:800;letter-spacing:0.15em;color:#0f766e;">${escHtml(code)}</p>
                    <p style="margin:12px 0 0 0;font-size:12px;color:#94a3b8;">Single use · tied to ${escHtml(recipientEmail)} only</p>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 8px 0;font-size:14px;color:#475569;">Company website: <a href="${escHtml(marketingUrl)}" style="color:#0d9488;font-weight:600;text-decoration:none;">${escHtml(marketingUrl)}</a></p>
              <p style="margin:16px 0 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">If you did not expect this email, you can ignore it.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px 32px;border-top:1px solid #e2e8f0;background:#fafafa;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">© ${new Date().getFullYear()} ${escHtml(brand)} · Wealth planning tools</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { success: false, error: 'Method not allowed' });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json(401, { success: false, error: 'Missing authorization header' });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    return json(500, { success: false, error: 'Missing Supabase configuration' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return json(401, { success: false, error: 'Unauthorized' });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    return json(403, { success: false, error: 'Admin access required' });
  }

  let body: { codes?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    return json(400, { success: false, error: 'Invalid JSON' });
  }

  const codes = Array.isArray(body.codes) ? body.codes.map((c) => String(c).trim()).filter(Boolean) : [];
  if (codes.length === 0) return json(400, { success: false, error: 'codes array required' });

  const region = Deno.env.get('AWS_REGION') || 'ap-south-1';
  const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
  const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
  const fromEmail = Deno.env.get('SES_FROM_EMAIL');

  if (!accessKeyId || !secretAccessKey || !fromEmail) {
    return json(503, {
      success: false,
      error: 'AWS SES not configured for this function (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, SES_FROM_EMAIL)',
    });
  }

  const appPublicUrl = (Deno.env.get('APP_PUBLIC_URL') || 'https://app.wealthmap.app').replace(/\/+$/, '');
  const marketingSiteUrl = (Deno.env.get('MARKETING_SITE_URL') || 'https://wealthmap.app').replace(/\/+$/, '');
  const brand = Deno.env.get('EMAIL_BRAND_NAME') || 'Finbrella';

  const { data: rows, error: fetchErr } = await supabase
    .from('coupon_codes')
    .select('code,target_email')
    .in('code', codes);

  if (fetchErr) return json(500, { success: false, error: fetchErr.message });

  const ses = new SESClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  const results: { code: string; ok: boolean; error?: string }[] = [];

  for (const row of rows || []) {
    const inviteUrl = `${appPublicUrl}/?invite=1&code=${encodeURIComponent(row.code)}&email=${encodeURIComponent(row.target_email)}`;
    const html = buildHtmlEmail({
      brand,
      recipientEmail: row.target_email,
      code: row.code,
      inviteUrl,
      marketingUrl: marketingSiteUrl,
    });
    const text = [
      `Your ${brand} access`,
      ``,
      `Sign up or sign in with ${row.target_email} using this link:`,
      inviteUrl,
      ``,
      `Your coupon code (single use, only for ${row.target_email}): ${row.code}`,
      ``,
      `Website: ${marketingSiteUrl}`,
    ].join('\n');

    try {
      await ses.send(
        new SendEmailCommand({
          Source: fromEmail,
          Destination: { ToAddresses: [row.target_email] },
          Message: {
            Subject: {
              Data: `${brand}: Your complimentary access & coupon`,
              Charset: 'UTF-8',
            },
            Body: {
              Html: { Data: html, Charset: 'UTF-8' },
              Text: { Data: text, Charset: 'UTF-8' },
            },
          },
        }),
      );
      results.push({ code: row.code, ok: true });
    } catch (e) {
      results.push({
        code: row.code,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const missing = codes.filter((c) => !(rows || []).some((r) => r.code === c));
  return json(200, { success: true, results, notFound: missing });
});
