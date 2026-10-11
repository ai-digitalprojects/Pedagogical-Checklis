const pad = (n) => String(n).padStart(2, '0');

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());

const toDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

export const addDays = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, d + n));
};

export const daysUntil = (iso) => Math.round((toDay(iso) - toDay(todayISO())) / 86400000);

export const formatDate = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }) : 'ללא תאריך';

export function relativeDue(iso) {
  if (!iso) return '';
  const n = daysUntil(iso);
  if (n === 0) return 'היום';
  if (n === 1) return 'מחר';
  if (n === -1) return 'אתמול';
  if (n > 1) return `בעוד ${n} ימים`;
  return `לפני ${-n} ימים`;
}
