/**
 * Support requests via Web3Forms (https://api.web3forms.com/submit).
 * Cooldown: one successful send per user + module every 24h (localStorage).
 *
 * Web3Forms delivers to the notification address configured for this access key
 * in the Web3Forms dashboard — set that to finbrellafpd@gmail.com so messages
 * land in the primary support inbox.
 */

export const DEFAULT_SUPPORT_REQUEST_RECIPIENTS = ['finbrellafpd@gmail.com','deepurswani@gmail.com'];

export const SUPPORT_WEB3_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

const formatField = (value) => {
  if (value === null || value === undefined) return '—';
  const s = String(value).trim();
  return s || '—';
};

function storageSegment(s, maxLen) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, maxLen) || 'unknown';
}

/** localStorage key: one slot per logged-in email (or anon) + module label */
export function getSupportWeb3StorageKey(userEmail, moduleName) {
  const safeUser = storageSegment(userEmail, 80);
  const safeMod = storageSegment(moduleName, 80);
  return `finbrella.web3support.v1.${safeUser}.${safeMod}`;
}

export function getSupportWeb3SentAt(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function isSupportWeb3CooldownActive(key, now = Date.now()) {
  const sentAt = getSupportWeb3SentAt(key);
  if (sentAt == null) return false;
  if (now - sentAt >= SUPPORT_WEB3_COOLDOWN_MS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return false;
  }
  return true;
}

export function markSupportWeb3Sent(key) {
  try {
    localStorage.setItem(key, String(Date.now()));
  } catch {
    /* ignore */
  }
}

function getWeb3AccessKey() {
  const k = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  return typeof k === 'string' ? k.trim() : '';
}

/**
 * @param {Object} params
 * @param {string} [params.userName]
 * @param {string} [params.userEmail]
 * @param {string} [params.moduleName]
 * @param {string} [params.userPhone]
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
export async function submitSupportRequestViaWeb3forms({
  userName,
  userEmail,
  moduleName,
  userPhone,
}) {
  const accessKey = getWeb3AccessKey();
  if (!accessKey) {
    console.error('[Help & Support] network: missing VITE_WEB3FORMS_ACCESS_KEY');
    return {
      ok: false,
      message: 'Support email is not configured (missing VITE_WEB3FORMS_ACCESS_KEY).',
    };
  }

  const subject = `Finbrella support — ${formatField(moduleName)}`;
  const message = [
    'Support request from Finbrella app',
    '',
    `Name: ${formatField(userName)}`,
    `Email: ${formatField(userEmail)}`,
    `Module: ${formatField(moduleName)}`,
    `Phone: ${formatField(userPhone)}`,
    '',
    'Thank you.',
  ].join('\n');

  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

  try {
    const response = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        name: formatField(userName),
        email: formatField(userEmail) !== '—' ? String(userEmail).trim() : 'noreply@web3forms.com',
        subject,
        message,
        replyto:
          formatField(userEmail) !== '—' ? String(userEmail).trim() : undefined,
      }),
    });

    const data = await response.json().catch(() => ({}));
    const durationMs = Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt
    );

    const ok =
      response.ok &&
      (data.success === true || data?.body?.message === 'Email sent successfully!');

    if (ok) {
      return { ok: true, message: data?.message || data?.body?.message };
    }

    const errMsg =
      data?.message ||
      data?.body?.message ||
      (response.status === 429
        ? 'Too many requests. Please try later.'
        : `Request failed (${response.status})`);

    console.error('[Help & Support] network: submission rejected', {
      status: response.status,
      durationMs,
      message: errMsg,
    });

    return { ok: false, message: errMsg };
  } catch (e) {
    const durationMs = Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt
    );
    console.error('[Help & Support] network: fetch failed', {
      url: WEB3FORMS_URL,
      durationMs,
      error: e,
    });
    return {
      ok: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}

/**
 * Builds the payload from auth + family profile (Self).
 * @param {Array<{ relation?: string, name?: string, mobile?: string }>} [familyMembers]
 * @param {{ email?: string, user_metadata?: { full_name?: string } }} [user]
 * @param {string} moduleName
 */
export function buildSupportEmailContextFromUser(familyMembers, user, moduleName) {
  const self = familyMembers?.find((m) => m.relation === 'Self');
  return {
    userName: (self?.name && String(self.name).trim()) || user?.user_metadata?.full_name || '',
    userEmail: user?.email || '',
    moduleName: moduleName || '—',
    userPhone: (self?.mobile && String(self.mobile).trim()) || '',
  };
}

/**
 * @deprecated Use submitSupportRequestViaWeb3forms for automatic delivery.
 */
export function buildSupportRequestMailtoHref({
  userName,
  userEmail,
  moduleName,
  userPhone,
  recipients = DEFAULT_SUPPORT_REQUEST_RECIPIENTS,
}) {
  const to = recipients.filter(Boolean).join(',');
  const subject = encodeURIComponent(`Finbrella support — ${formatField(moduleName)}`);
  const body = encodeURIComponent(
    [
      'Hello Finbrella Support,',
      '',
      'Please find my details below:',
      '',
      `Name: ${formatField(userName)}`,
      `Email: ${formatField(userEmail)}`,
      `Module: ${formatField(moduleName)}`,
      `Phone: ${formatField(userPhone)}`,
      '',
      'Thank you,',
    ].join('\n')
  );
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

/**
 * @deprecated Use submitSupportRequestViaWeb3forms for automatic delivery.
 */
export function openSupportRequestEmail(params) {
  if (typeof window === 'undefined') return;
  window.location.href = buildSupportRequestMailtoHref(params);
}
