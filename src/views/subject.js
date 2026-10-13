import { h, icon } from '../utils/dom.js';
import { ICONS } from '../data/icons.js';
import { S } from '../data/strings.he.js';
import { CATEGORIES, subjectById } from '../data/subjects.js';
import { getState, updateTask } from '../state/store.js';
import { saveStatus } from '../components/saveStatus.js';
import { summarize, bySubject, byCategory } from '../utils/progress.js';
import { ring, stackedBar } from '../components/ring.js';
import { openAddTask } from '../components/addTaskDialog.js';
import { taskItem } from '../components/taskItem.js';
import { confetti, toast } from '../utils/confetti.js';

// View-local state survives re-renders for the same subject.
const view = { subject: null, expanded: new Set(), collapsed: new Set() };

function setStatus(task, status, el) {
  const before = summarize(byCategory(bySubject(getState().tasks, task.subject), task.category));
  const subjBefore = summarize(bySubject(getState().tasks, task.subject));
  const rect = el?.getBoundingClientRect();
  updateTask(task.id, { status });
  const after = summarize(byCategory(bySubject(getState().tasks, task.subject), task.category));
  const subjAfter = summarize(bySubject(getState().tasks, task.subject));
  const x = rect ? rect.left + rect.width / 2 : undefined;
  const y = rect ? rect.top + rect.height / 2 : undefined;
  if (subjAfter.pct === 100 && subjBefore.pct < 100) {
    confetti(x, y, 140);
    toast('🏆 כל משימות המקצוע הושלמו!');
  } else if (after.pct === 100 && before.pct < 100) {
    confetti(x, y, 70);
    toast(S.celebrate);
  }
}

export function renderSubject(root, subjectId, { animate, focusTask }) {
  const subject = subjectById(subjectId);
  if (!subject) {
    location.hash = '#/';
    return;
  }
  if (view.subject !== subjectId) Object.assign(view, { subject: subjectId, expanded: new Set(), collapsed: new Set() });
  if (focusTask) view.expanded.add(focusTask);

  const subjTasks = bySubject(getState().tasks, subjectId);
  const sum = summarize(subjTasks);

  const ctx = {
    expanded: view.expanded,
    setStatus,
    toggleExpand(id, li) {
      const open = !view.expanded.has(id);
      view.expanded[open ? 'add' : 'delete'](id);
      li.classList.toggle('is-open', open);
      li.querySelector('.task-toggle').setAttribute('aria-expanded', String(open));
    },
  };

  const addTask = () =>
    openAddTask(subjectId, {
      beforeAdd: (cat) => view.collapsed.delete(cat),
      onAdded: (task) => {
        const el = root.querySelector(`[data-id="${task.id}"]`);
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        el?.classList.add('flash');
      },
    });

  const listHost = h('div', { class: 'categories' });

  const renderList = () => {
    const sections = CATEGORIES.map((cat) => {
      const all = byCategory(subjTasks, cat.id);
      const shown = all;
      if (!shown.length) return null;
      const cs = summarize(all);
      const closed = view.collapsed.has(cat.id);
      const section = h(
        'section',
        { class: `category ${closed ? 'is-collapsed' : ''} ${cs.pct === 100 ? 'is-complete' : ''}` },
        h(
          'button',
          {
            type: 'button',
            class: 'cat-head',
            'aria-expanded': String(!closed),
            onclick: () => {
              view.collapsed[section.classList.toggle('is-collapsed') ? 'add' : 'delete'](cat.id);
              head.setAttribute('aria-expanded', String(!section.classList.contains('is-collapsed')));
            },
          },
          h('span', { class: 'cat-emoji' }, cat.emoji),
          h('span', { class: 'cat-name' }, cat.name),
          h('span', { class: 'cat-count' }, `${cs.done}/${cs.total}`),
          h('span', { class: 'cat-bar' }, stackedBar({ doneP: cs.pct, doingP: cs.doingPct })),
          h('span', { class: 'cat-pct' }, cs.pct === 100 ? icon(ICONS.check) : `${cs.pct}%`),
          icon(ICONS.chevron, 'icon cat-chev'),
        ),
        h('ul', { class: 'tasks' }, shown.map((t) => taskItem(t, ctx))),
      );
      const head = section.querySelector('.cat-head');
      return section;
    }).filter(Boolean);
    listHost.replaceChildren(...(sections.length ? sections : [h('p', { class: 'empty big' }, S.noResults)]));
  };

  renderList();

  root.replaceChildren(
    h(
      'div',
      { class: 'page subject', 'data-subject': subjectId },
      h(
        'section',
        { class: 'banner' },
        h('div', { class: 'hero-blob b1' }),
        h('div', { class: 'hero-blob b2' }),
        h(
          'div',
          { class: 'banner-text' },
          h('a', { class: 'back', href: '#/' }, icon(ICONS.arrowRight), S.nav.home),
          h('div', { class: 'banner-title' }, h('div', { class: 'banner-icon' }, icon(ICONS[subjectId])), h('div', {}, h('h1', {}, subject.name), h('p', {}, subject.tagline))),
          h(
            'div',
            { class: 'banner-stats' },
            h('span', {}, h('b', {}, String(sum.done)), S.filters.done),
            h('span', {}, h('b', {}, String(sum.doing)), S.filters.doing),
            h('span', {}, h('b', {}, String(sum.todo)), S.filters.todo),
          ),
          h('button', { type: 'button', class: 'btn btn-hero', onclick: addTask }, icon(ICONS.plus), S.addTask),
        ),
        h('div', { class: 'banner-ring' }, ring({ pct: sum.pct, size: 170, stroke: 16, sub: `${sum.done}/${sum.total}`, animate, cls: 'ring-hero' })),
      ),
      listHost,
      h('p', { class: 'footnote' }, S.draftNote, h('br'), S.demoNote, ' · ', saveStatus()),
    ),
  );

  if (focusTask) {
    requestAnimationFrame(() => {
      const el = root.querySelector(`[data-id="${focusTask}"]`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.classList.add('flash');
    });
  }
}
