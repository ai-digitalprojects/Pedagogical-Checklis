import { h } from '../utils/dom.js';
import { S } from '../data/strings.he.js';
import { CATEGORIES } from '../data/subjects.js';
import { addTask } from '../state/store.js';
import { toast } from '../utils/confetti.js';

// New tasks always start as "todo". beforeAdd(categoryId) lets the view
// un-collapse the chosen category; onAdded(task) runs after the view re-rendered.
export function openAddTask(subject, { beforeAdd, onAdded } = {}) {
  const title = h('input', { type: 'text', class: 'field', required: true, maxlength: 140, placeholder: 'לדוגמה: מפגש תכנון משותף עם צוות המקצוע' });
  const category = h('select', { class: 'field' }, CATEGORIES.map((c) => h('option', { value: c.id }, `${c.emoji} ${c.name}`)));
  const due = h('input', { type: 'date', class: 'field' });
  const note = h('textarea', { class: 'field', rows: 2, placeholder: S.notePlaceholder });

  const dialog = h(
    'dialog',
    { class: 'dialog', 'data-subject': subject },
    h(
      'form',
      {
        method: 'dialog',
        onsubmit: (e) => {
          e.preventDefault();
          if (!title.value.trim()) return;
          beforeAdd?.(category.value);
          const task = addTask({ subject, category: category.value, title: title.value.trim(), due: due.value, note: note.value.trim() });
          dialog.close();
          toast(S.taskAdded);
          onAdded?.(task);
        },
      },
      h('h2', {}, S.addTaskLong),
      h('label', { class: 'lbl' }, S.taskTitle, title),
      h('label', { class: 'lbl' }, S.category, category),
      h('label', { class: 'lbl' }, S.note, note),
      h('label', { class: 'lbl' }, S.due, due),
      h(
        'div',
        { class: 'dialog-actions' },
        h('button', { type: 'submit', class: 'btn btn-primary' }, S.save),
        h('button', { type: 'button', class: 'btn btn-ghost', onclick: () => dialog.close() }, S.cancel),
      ),
    ),
  );
  dialog.addEventListener('close', () => dialog.remove());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  document.body.append(dialog);
  dialog.showModal();
  title.focus();
}
