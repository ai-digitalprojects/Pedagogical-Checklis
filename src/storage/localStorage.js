// Single persistence boundary. A future adapter (School Management Dashboard
// API, Google Drive backup) only needs to implement the same three functions.
// The simplified demo uses its own key. The previous full demo
// ('gavim-pedagogical-checklist') is never read, modified or deleted here.
const KEY = 'gavim-pedagogical-checklist-simple';
export const SCHEMA_VERSION = 2;

export function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.schemaVersion !== SCHEMA_VERSION || !Array.isArray(data.tasks)) return null;
    return data;
  } catch {
    return null;
  }
}

export function save(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: demo keeps working in memory */
  }
}

export function reset() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
