import * as api from '../storage/sheetsApi.js';

// phase: loading | ready | error
let state = { phase: 'loading', tasks: [] };
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

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function subscribeSync(fn) {
  syncSubscribers.add(fn);
  return () => syncSubscribers.delete(fn);
}

/* ------------------------------------ loading ---------------------------------- */

function setPhase(phase) {
  state = { ...state, phase };
  notify();
}

export async function init() {
  setPhase('loading');
  try {
    const data = await api.list();
    if (!data.ok) throw new Error(data.error);
    state = { ...state, tasks: data.tasks };
    setPhase('ready');
    startPolling();
  } catch {
    setPhase('error');
  }
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
    const res = entry.deleted ? await api.remove(id, { keepalive }) : await api.upsert(task, { keepalive });
    entry.inflight = false;
    if (res.ok) {
      if (entry.rev === rev) dirty.delete(id);
      syncError = false;
    } else if (res.error === 'busy') {
      throw new Error('busy');
    } else {
      // The server refused this change: drop it and show the Sheet's version.
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
  if (!task) return;
  Object.assign(task, patch);
  markDirty(id, silent ? SAVE_DELAY_MS : 100);
  if (!silent) notify();
}

export function addTask(data) {
  const task = { id: `t-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, status: 'todo', note: '', due: '', ...data };
  state.tasks.push(task);
  markDirty(task.id, 100);
  notify();
  return task;
}

export function deleteTask(id) {
  if (!getTask(id)) return;
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
    const data = await api.list();
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
  clearInterval(pollTimer);
  pollTimer = setInterval(pollNow, POLL_MS);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') pollNow();
});
window.addEventListener('pagehide', flushAll);
