/**
 * Shared email helpers for partner invite + client report credentials.
 * Uses Resend if RESEND_API_KEY is set; otherwise logs and returns ok (dev).
 */
export async function sendCredentialEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('PARTNER_EMAIL_FROM') || 'Finbrella Partner <onboarding@resend.dev>';

  if (!apiKey) {
    console.log('[partner-email] RESEND_API_KEY missing — skipping send', {
      to: opts.to,
      subject: opts.subject,
    });
    return { ok: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: body || `Email failed (${res.status})` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Email send failed' };
  }
}

export function partnerInviteEmailHtml(params: {
  fullName: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}) {
  const name = params.fullName || 'Partner';
  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
    <h1 style="font-size:22px;letter-spacing:-0.02em;">Welcome to Finbrella Partner</h1>
    <p>Hi ${name},</p>
    <p>Your partner account is ready. Sign in with your email and the one-time password below, then set a new password.</p>
    <p><strong>Login ID:</strong> ${params.email}<br/>
    <strong>One-time password:</strong> <code style="font-size:16px;">${params.tempPassword}</code></p>
    <p><a href="${params.loginUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:10px;">Open Partner Portal</a></p>
    <p style="color:#666;font-size:13px;">You must change this password before continuing.</p>
  </div>`;
}

export function clientReportEmailHtml(params: {
  fullName: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
  partnerName?: string;
}) {
  const name = params.fullName || 'there';
  const by = params.partnerName ? ` prepared by ${params.partnerName}` : '';
  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
    <h1 style="font-size:22px;letter-spacing:-0.02em;">Your financial plan is ready</h1>
    <p>Hi ${name},</p>
    <p>Your personalised Finbrella report${by} is ready. Sign in with the credentials below, then set a new password to continue.</p>
    <p><strong>Client ID (email):</strong> ${params.email}<br/>
    <strong>One-time password:</strong> <code style="font-size:16px;">${params.tempPassword}</code></p>
    <p><a href="${params.loginUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:10px;">View your report</a></p>
    <p style="color:#666;font-size:13px;">You must change this password before continuing. This report is read-only.</p>
  </div>`;
}

export function randomTempPassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}
