/** Session storage for invite links: ?invite=1&code=&email= */

export const PENDING_COUPON_STORAGE_KEY = 'finplan_pending_coupon_v1';

export function parseInviteSearchParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('invite') !== '1') return null;
  const code = params.get('code');
  const email = params.get('email');
  if (!code || !email) return null;
  return { code: code.trim(), email: decodeURIComponent(email.trim()) };
}

export function persistPendingCouponInvite(parsed) {
  sessionStorage.setItem(PENDING_COUPON_STORAGE_KEY, JSON.stringify(parsed));
}

/** Read invite query params, save to sessionStorage, strip sensitive params from URL */
export function consumeInviteParamsFromUrl() {
  const parsed = parseInviteSearchParams();
  if (!parsed) return;
  persistPendingCouponInvite(parsed);
  const url = new URL(window.location.href);
  url.searchParams.delete('invite');
  url.searchParams.delete('code');
  url.searchParams.delete('email');
  const qs = url.searchParams.toString();
  window.history.replaceState({}, '', `${url.pathname}${qs ? `?${qs}` : ''}${url.hash}`);
}

export function getPendingCouponInvite() {
  try {
    const raw = sessionStorage.getItem(PENDING_COUPON_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingCouponInvite() {
  sessionStorage.removeItem(PENDING_COUPON_STORAGE_KEY);
}
