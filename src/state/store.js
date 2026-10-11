import * as storage from '../storage/localStorage.js';
import { buildSeedTasks } from '../data/seedTasks.js';

function fresh() {
  return { schemaVersion: storage.SCHEMA_VERSION, tasks: buildSeedTasks() };
}

let state = storage.load() ?? fresh();
const subscribers = new Set();

function commit(silent) {
  storage.save(state);
  if (!silent) subscribers.forEach((fn) => fn(state));
}

export const getState = () => state;
export const getTask = (id) => state.tasks.find((t) => t.id === id);

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function updateTask(id, patch, { silent = false } = {}) {
  const task = getTask(id);
  if (!task) return;
  Object.assign(task, patch, { updatedAt: Date.now() });
  commit(silent);
}

export function addTask(data) {
  const task = { id: `t-${Date.now().toString(36)}`, status: 'todo', note: '', due: '', ...data, custom: true, updatedAt: Date.now() };
  state.tasks.push(task);
  commit(false);
  return task;
}

export function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  commit(false);
}

export function resetDemo() {
  storage.reset();
  state = fresh();
  commit(false);
}
