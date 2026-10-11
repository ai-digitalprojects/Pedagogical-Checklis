export function summarize(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const doing = tasks.filter((t) => t.status === 'doing').length;
  return {
    total,
    done,
    doing,
    todo: total - done - doing,
    pct: total ? Math.round((done / total) * 100) : 0,
    doingPct: total ? (doing / total) * 100 : 0,
  };
}

export const bySubject = (tasks, id) => tasks.filter((t) => t.subject === id);
export const byCategory = (tasks, id) => tasks.filter((t) => t.category === id);
