export function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function formatMoney(n, compact = false) {
  const value = Number(n) || 0;
  if (compact && Math.abs(value) >= 100000) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function daysBadge(days) {
  const d = Number(days);
  if (Number.isNaN(d)) return { label: '—', tone: 'slate' };
  if (d < 0) return { label: `${Math.abs(d)}d overdue`, tone: 'rose' };
  if (d <= 15) return { label: `${d}d left`, tone: 'amber' };
  return { label: `${d}d left`, tone: 'teal' };
}

export const CATEGORY_LABELS = {
  life: 'Life',
  health: 'Health',
  motor: 'Motor',
  non_motor: 'Non-motor',
};
