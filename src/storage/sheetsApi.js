// Single persistence boundary: the central Google Sheet, reached through the Apps Script web app.
// Requests use Content-Type text/plain so the browser sends a "simple" request (no CORS preflight).
import { API_URL } from '../config.js';

async function call(body, { keepalive = false } = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    keepalive,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const FIELDS = ['id', 'subject', 'category', 'title', 'status', 'due', 'note'];
const pick = (task) => Object.fromEntries(FIELDS.map((k) => [k, task[k] ?? '']));

export const list = () => call({ action: 'list' });
export const upsert = (task, opts) => call({ action: 'upsert', task: pick(task) }, opts);
export const remove = (id, opts) => call({ action: 'delete', id }, opts);
