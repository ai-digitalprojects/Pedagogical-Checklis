// Single persistence boundary: the central Google Sheet, reached through the Apps Script web app.
// Requests use Content-Type text/plain so the browser sends a "simple" request (no CORS preflight).
import { API_URL } from '../config.js';

const CODE_KEY = 'gavim-access-code'; // only the access code is kept in the browser, never task data

export const getSavedCode = () => {
  try {
    return window.localStorage.getItem(CODE_KEY) || '';
  } catch {
    return '';
  }
};

export const saveCode = (code) => {
  try {
    window.localStorage.setItem(CODE_KEY, code);
  } catch {
    /* ignore */
  }
};

export const clearCode = () => {
  try {
    window.localStorage.removeItem(CODE_KEY);
  } catch {
    /* ignore */
  }
};

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

export const login = (code) => call({ action: 'login', code });
export const list = (code) => call({ action: 'list', code });
export const upsert = (code, task, opts) => call({ action: 'upsert', code, task: pick(task) }, opts);
export const remove = (code, id, opts) => call({ action: 'delete', code, id }, opts);
