import * as api from '../storage/sheetsApi.js';

// phase: init | login | loading | ready | error
let state = { phase: 'init', error: '', tasks: [], session: null };
let code = '';
let pollTimer = null;

const subscribers = new Set();
const syncSubscribers = new Set();
const dirty = new Map(); // task id -> { rev, timer, deleted, inflight }
let syncError = false;

const POLL_MS = 30000;
const RETRY_MS = 5000;
const SAVE_DELAY_MS = 900; // typing (notes/titles) is batched; discrete changes save almost at once

const notify = () => subscribers.forEach((fn) => fn(state));
const notifySync = () => syncSubscribers.forEach((fn) => fn());

export const getState = () => state;
export const getTask = (id) => state.tasks.find((t) => t.id === id);
export const getSync = () => ({ pending: dirty.size, error: syncError });
export const canEdit = (subject) => state.session?.role === 'editor' && state.session.subject === subject;

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function subscribeSync(fn) {
  syncSubscribers.add(fn);
  return () => syncSubscribers.delete(fn);
}

/* ------------------------------ session / loading ----------------------------- */

function setPhase(phase, error = '') {
  state = { ...state, phase, error };
  notify();
}

async function loadSession() {
  setPhase('loading');
  try {
    const me = await api.login(code);
    if (!me.ok) {
      api.clearCode();
      code = '';
      return setPhase('login', me.error === 'bad_code' ? 'bad_code' : 'connect');
    }
    const data = await api.list(code);
    if (!data.ok) throw new Error(data.error);
    state = { ...state, session: { role: me.role, subject: me.subject }, tasks: data.tasks };
    setPhase('ready');
    startPolling();
  } catch {
    setPhase('error');
  }
}

export function init() {
  code = api.getSavedCode();
  if (!code) return setPhase('login');
  return loadSession();
}

export async function login(input) {
  code = input.trim();
  if (!code) return setPhase('login', 'bad_code');
  try {
    const me = await api.login(code);
    if (!me.ok) {
      code = '';
      return setPhase('login', 'bad_code');
    }
    api.saveCode(code);
  } catch {
    code = '';
    return setPhase('login', 'connect');
  }
  return loadSession();
}

export function logout() {
  stopPolling();
  dirty.forEach((e) => clearTimeout(e.timer));
  dirty.clear();
  syncError = false;
  api.clearCode();
  code = '';
  state = { phase: 'login', error: '', tasks: [], session: null };
  notify();
  notifySync();
}

/* ---------------------------------- writing ---------------------------------- */

function markDirty(id, delay, deleted = false) {
  const entry = dirty.get(id) ?? { rev: 0, timer: null, deleted: false, inflight: false };
  entry.rev += 1;
  entry.deleted = deleted;
  clearTimeout(entry.timer);
  entry.timer = setTimeout(() => flush(id), delay);
  dirty.set(id, entry);
  notifySync();
}

async function flush(id, { keepalive = false } = {}) {
  const entry = dirty.get(id);
  if (!entry) return;
  clearTimeout(entry.timer);
  if (entry.inflight) {
    entry.timer = setTimeout(() => flush(id), 300);
    return;
  }
  const rev = entry.rev;
  const task = getTask(id);
  if (!entry.deleted && !task) {
    dirty.delete(id);
    return notifySync();
  }
  entry.inflight = true;
  try {
    const res = entry.deleted ? await api.remove(code, id, { keepalive }) : await api.upsert(code, task, { keepalive });
    entry.inflight = false;
    if (res.ok) {
      if (entry.rev === rev) dirty.delete(id);
      syncError = false;
    } else if (res.error === 'bad_code') {
      return logout();
    } else if (res.error === 'busy') {
      throw new Error('busy');
    } else {
      // The server refused this change (e.g. read-only): drop it and show the server's truth.
      dirty.delete(id);
      syncError = true;
      pollNow(true);
    }
  } catch {
    entry.inflight = false;
    syncError = true;
    entry.timer = setTimeout(() => flush(id), RETRY_MS);
  }
  notifySync();
}

export function flushAll() {
  dirty.forEach((_, id) => flush(id, { keepalive: true }));
}

export function updateTask(id, patch, { silent = false } = {}) {
  const task = getTask(id);
  if (!task || !canEdit(task.subject)) return;
  Object.assign(task, patch);
  markDirty(id, silent ? SAVE_DELAY_MS : 100);
  if (!silent) notify();
}

export function addTask(data) {
  const task = { id: `t-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, status: 'todo', note: '', due: '', ...data };
  if (!canEdit(task.subject)) return null;
  state.tasks.push(task);
  markDirty(task.id, 100);
  notify();
  return task;
}

export function deleteTask(id) {
  const task = getTask(id);
  if (!task || !canEdit(task.subject)) return;
  state.tasks = state.tasks.filter((t) => t.id !== id);
  markDirty(id, 100, true);
  notify();
}

/* ---------------------------------- polling ---------------------------------- */

const FIELDS = ['id', 'subject', 'category', 'title', 'status', 'due', 'note'];
const fingerprint = (tasks) => JSON.stringify(tasks.map((t) => FIELDS.map((k) => t[k])));

const userIsEditing = () =>
  !!document.querySelector('dialog[open]') || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

// Refresh from the Sheet so changes made on other devices appear. Skipped while this device has
// unsent changes or the user is typing, so nothing they are editing is replaced.
async function pollNow(force = false) {
  if (state.phase !== 'ready' || (!force && (dirty.size || userIsEditing()))) return;
  try {
    const data = await api.list(code);
    if (!data.ok || dirty.size || state.phase !== 'ready') return;
    if (fingerprint(data.tasks) !== fingerprint(state.tasks)) {
      state = { ...state, tasks: data.tasks };
      notify();
    }
  } catch {
    /* next poll will try again */
  }
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(pollNow, POLL_MS);
}

function stopPolling() {
  clearInterval(pollTimer);
  pollTimer = null;
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') pollNow();
});
window.addEventListener('pagehide', flushAll);
