import { h, icon } from '../utils/dom.js';
import { ICONS } from '../data/icons.js';
import { S } from '../data/strings.he.js';
import { SUBJECTS, CATEGORIES, subjectById } from '../data/subjects.js';
import { getState } from '../state/store.js';
import { summarize, bySubject, byCategory } from '../utils/progress.js';
import { ring, stackedBar } from '../components/ring.js';
import { logo } from '../components/header.js';

function statTile(kind, iconSvg, value, label) {
  return h('div', { class: `stat stat-${kind}` }, h('div', { class: 'stat-icon' }, icon(iconSvg)), h('div', {}, h('div', { class: 'stat-value' }, String(value)), h('div', { class: 'stat-label' }, label)));
}

function subjectCard(subject, tasks, animate) {
  const sum = summarize(bySubject(tasks, subject.id));
  return h(
    'a',
    { class: 'subject-card', href: `#/s/${subject.id}`, 'data-subject': subject.id },
    h('div', { class: 'sc-top' }, h('div', { class: 'sc-icon' }, icon(ICONS[subject.id])), h('div', { class: 'sc-title' }, h('h3', {}, subject.name), h('p', {}, subject.tagline))),
    h('div', { class: 'sc-pct' }, h('span', { class: 'sc-num' }, String(sum.pct)), h('small', {}, '%'), h('span', { class: 'sc-done' }, `${sum.done} מתוך ${sum.total} הושלמו`)),
    stackedBar({ doneP: sum.pct, doingP: sum.doingPct, animate }),
    h(
      'div',
      { class: 'sc-chips' },
      h('span', { class: 'mini mini-doing' }, `${sum.doing} בתהליך`),
      h('span', { class: 'mini mini-todo' }, `${sum.todo} טרם התחילו`),
    ),
    h('div', { class: 'sc-link' }, S.openChecklist, icon(ICONS.arrowLeft)),
  );
}

function attentionCard(tasks) {
  const items = tasks.filter((t) => t.status === 'doing').slice(0, 7);
  return h(
    'section',
    { class: 'panel' },
    h('h2', { class: 'panel-title' }, icon(ICONS.clock), S.attentionTitle),
    items.length
      ? h(
          'ul',
          { class: 'attention' },
          items.map((t) => {
            const subj = subjectById(t.subject);
            return h(
              'li',
              {},
              h('a', { href: `#/s/${t.subject}?task=${t.id}`, 'data-subject': t.subject },
                h('i', { class: 'dot' }),
                h('div', { class: 'att-main' }, h('span', { class: 'att-title' }, t.title), h('span', { class: 'att-sub' }, subj.name)),
              ),
            );
          }),
        )
      : h('p', { class: 'empty' }, S.attentionEmpty),
  );
}

function matrixCard(tasks) {
  const head = h('tr', {}, h('th', {}, ''), SUBJECTS.map((s) => h('th', { 'data-subject': s.id, class: 'mx-head' }, h('a', { href: `#/s/${s.id}` }, s.name))));
  const rows = CATEGORIES.map((cat) =>
    h(
      'tr',
      {},
      h('th', { class: 'mx-cat', scope: 'row' }, h('span', {}, cat.emoji), cat.name),
      SUBJECTS.map((s) => {
        const sum = summarize(byCategory(bySubject(tasks, s.id), cat.id));
        return h('td', { 'data-subject': s.id }, h('a', { href: `#/s/${s.id}`, class: `mx-cell ${sum.pct >= 55 ? 'hi' : ''}`, style: `--p:${sum.pct}`, title: `${s.name} · ${cat.name}` }, `${sum.pct}%`));
      }),
    ),
  );
  return h('section', { class: 'panel' }, h('h2', { class: 'panel-title' }, icon(ICONS.progress), S.matrixTitle), h('div', { class: 'matrix-wrap' }, h('table', { class: 'matrix' }, h('thead', {}, head), h('tbody', {}, rows))));
}

export function renderDashboard(root, { animate }) {
  const { tasks } = getState();
  const all = summarize(tasks);

  root.replaceChildren(
    h(
      'div',
      { class: 'page dashboard' },
      h(
        'section',
        { class: 'hero' },
        h('div', { class: 'hero-blob b1' }),
        h('div', { class: 'hero-blob b2' }),
        h(
          'div',
          { class: 'hero-text' },
          h('div', { class: 'hero-brand' }, logo(), h('span', { class: 'pill' }, S.schoolYear)),
          h('h1', {}, S.schoolName),
          h('p', { class: 'hero-sub' }, `${S.appTitle} — ${S.appSubtitle}`),
          h('p', { class: 'hero-lead' }, 'ארבעה מקצועות ליבה, שלוש קטגוריות ותמונת מצב אחת פשוטה.'),
          h('div', { class: 'hero-actions' }, h('a', { class: 'btn btn-hero', href: '#/present' }, icon(ICONS.play), S.nav.present)),
        ),
        h('div', { class: 'hero-ring' }, ring({ pct: all.pct, size: 210, stroke: 18, sub: S.overall, animate, cls: 'ring-hero' })),
      ),
      h(
        'div',
        { class: 'stats' },
        statTile('total', ICONS.list, all.total, S.stats.total),
        statTile('done', ICONS.check, all.done, S.stats.done),
        statTile('doing', ICONS.clock, all.doing, S.stats.doing),
        statTile('todo', ICONS.list, all.todo, S.stats.todo),
      ),
      h('h2', { class: 'section-title' }, S.subjectsTitle),
      h('div', { class: 'subjects-grid' }, SUBJECTS.map((s) => subjectCard(s, tasks, animate))),
      h('div', { class: 'two-col' }, attentionCard(tasks), matrixCard(tasks)),
      h('p', { class: 'footnote' }, S.draftNote, h('br'), S.demoNote),
    ),
  );
}
