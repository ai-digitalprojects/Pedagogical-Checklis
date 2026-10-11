import { h, icon } from '../utils/dom.js';
import { ICONS } from '../data/icons.js';
import { S } from '../data/strings.he.js';
import { formatDate } from '../utils/dates.js';
import { updateTask, deleteTask } from '../state/store.js';

const STATUSES = ['todo', 'doing', 'done'];

// ctx: { expanded:Set, setStatus(task, status, el), toggleExpand(id) }
export function taskItem(task, ctx) {
  const open = ctx.expanded.has(task.id);
  const state = task.status;

  const checkbox = h('input', {
    type: 'checkbox',
    'aria-label': task.title,
    onchange: (e) => ctx.setStatus(task, e.target.checked ? 'done' : 'todo', li),
  });
  checkbox.checked = task.status === 'done';

  const noteFlag = h('span', { class: 'chip chip-note', title: S.note }, icon(ICONS.note));
  noteFlag.hidden = !task.note;

  const titleEl = h('span', { class: 'task-title' }, task.title);

  const meta = h(
    'div',
    { class: 'task-meta' },
    h('span', { class: `badge badge-${state}` }, S.status[state]),
    task.due &&
      h(
        'span',
        { class: 'chip' },
        icon(ICONS.calendar),
        formatDate(task.due),
      ),
    noteFlag,
  );

  const toggle = h(
    'button',
    { class: 'task-toggle', type: 'button', 'aria-expanded': String(open), 'aria-label': 'פרטים', onclick: () => ctx.toggleExpand(task.id, li) },
    icon(ICONS.chevron),
  );

  const segmented = h(
    'div',
    { class: 'segmented', role: 'group', 'aria-label': 'סטטוס' },
    STATUSES.map((s) =>
      h('button', { type: 'button', class: `seg-btn seg-${s}`, 'aria-pressed': String(task.status === s), onclick: () => ctx.setStatus(task, s, li) }, S.status[s]),
    ),
  );

  const titleInput = h('input', {
    type: 'text',
    class: 'field',
    value: task.title,
    'aria-label': S.taskTitle,
    oninput: (e) => {
      const v = e.target.value.trim();
      if (!v) return;
      updateTask(task.id, { title: v }, { silent: true });
      titleEl.textContent = v;
    },
  });

  const dateInput = h('input', {
    type: 'date',
    class: 'field',
    value: task.due,
    'aria-label': S.due,
    onchange: (e) => updateTask(task.id, { due: e.target.value }),
  });

  const noteInput = h('textarea', {
    class: 'field',
    rows: 3,
    placeholder: S.notePlaceholder,
    'aria-label': S.note,
    oninput: (e) => {
      updateTask(task.id, { note: e.target.value }, { silent: true });
      noteFlag.hidden = !e.target.value.trim();
    },
  });
  noteInput.value = task.note;

  const detail = h(
    'div',
    { class: 'task-detail' },
    h('label', { class: 'lbl' }, S.taskTitle, titleInput),
    h('div', { class: 'detail-grid' },
      h('div', { class: 'lbl' }, 'סטטוס', segmented),
      h('label', { class: 'lbl' }, S.due, dateInput),
    ),
    h('label', { class: 'lbl' }, S.note, noteInput),
    // Only tasks added by a coordinator can be deleted; the predefined ones stay.
    (task.custom || task.id.startsWith('t-')) &&
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn-danger',
          onclick: () => {
            if (window.confirm(S.confirmDelete)) deleteTask(task.id);
          },
        },
        icon(ICONS.trash),
        S.del,
      ),
  );

  const li = h(
    'li',
    { class: `task is-${state} ${open ? 'is-open' : ''}`, 'data-id': task.id },
    h('label', { class: 'check' }, checkbox, h('span', { class: 'box' }, icon(ICONS.check))),
    h('div', { class: 'task-main', onclick: () => ctx.toggleExpand(task.id, li) }, titleEl, meta),
    toggle,
    detail,
  );
  return li;
}
