import { h, icon } from '../utils/dom.js';
import { ICONS } from '../data/icons.js';
import { S } from '../data/strings.he.js';
import { SUBJECTS, CATEGORIES } from '../data/subjects.js';
import { getState } from '../state/store.js';
import { summarize, bySubject, byCategory } from '../utils/progress.js';
import { ring, stackedBar } from '../components/ring.js';
import { logo } from '../components/header.js';

const AUTO_MS = 9000;

function overviewSlide() {
  const { tasks } = getState();
  const all = summarize(tasks);
  return h(
    'div',
    { class: 'slide slide-overview' },
    h('div', { class: 'ov-head' }, logo('logo-lg'), h('div', {}, h('p', { class: 'pill' }, S.schoolYear), h('h1', {}, S.schoolName), h('h2', {}, `${S.appTitle} · ${S.appSubtitle}`), h('p', { style: 'opacity:.75;font-size:.9em;margin-top:.5em' }, S.draftNote))),
    h(
      'div',
      { class: 'ov-body' },
      h('div', { class: 'ov-ring' }, ring({ pct: all.pct, size: 300, stroke: 26, sub: S.overall, animate: true, cls: 'ring-hero' }),
        h('div', { class: 'ov-stats' },
          h('span', {}, h('b', {}, String(all.done)), S.filters.done),
          h('span', {}, h('b', {}, String(all.doing)), S.filters.doing),
          h('span', {}, h('b', {}, String(all.todo)), S.filters.todo),
        ),
      ),
      h(
        'div',
        { class: 'ov-subjects' },
        SUBJECTS.map((s) => {
          const sum = summarize(bySubject(tasks, s.id));
          return h('div', { class: 'ov-card', 'data-subject': s.id },
            h('div', { class: 'sc-icon' }, icon(ICONS[s.id])),
            h('div', { class: 'ov-card-main' }, h('h3', {}, s.name), stackedBar({ doneP: sum.pct, doingP: sum.doingPct, animate: true })),
            h('div', { class: 'ov-pct' }, `${sum.pct}%`),
          );
        }),
      ),
    ),
  );
}

function taskList(title, tasks, kind) {
  return h('div', { class: `pl pl-${kind}` }, h('h4', {}, title),
    tasks.length
      ? h('ul', {}, tasks.map((t) => h('li', {}, h('span', {}, t.title))))
      : h('p', {}, S.none));
}

function subjectSlide(subject) {
  const tasks = bySubject(getState().tasks, subject.id);
  const sum = summarize(tasks);
  const done = tasks.filter((t) => t.status === 'done').slice(0, 2);
  const doing = tasks.filter((t) => t.status === 'doing').slice(0, 2);
  const next = tasks.filter((t) => t.status === 'todo').slice(0, 2);

  return h(
    'div',
    { class: 'slide slide-subject', 'data-subject': subject.id },
    h('div', { class: 'ss-id' },
      h('div', { class: 'banner-icon xl' }, icon(ICONS[subject.id])),
      h('h1', {}, subject.name),
      h('p', {}, subject.tagline),
      ring({ pct: sum.pct, size: 260, stroke: 24, sub: `${sum.done}/${sum.total} ${S.filters.done}`, animate: true, cls: 'ring-hero' }),
    ),
    h('div', { class: 'ss-cats' },
      CATEGORIES.map((cat) => {
        const cs = summarize(byCategory(tasks, cat.id));
        return h('div', { class: 'ss-row' }, h('span', { class: 'ss-name' }, `${cat.emoji} ${cat.name}`), stackedBar({ doneP: cs.pct, doingP: cs.doingPct, animate: true }), h('span', { class: 'ss-pct' }, `${cs.pct}%`));
      }),
    ),
    h('div', { class: 'ss-lists' }, taskList(S.presentDone, done, 'done'), taskList(S.presentDoing, doing, 'doing'), taskList(S.presentNext, next, 'next')),
  );
}

export function mountPresent(root) {
  const slides = [overviewSlide, ...SUBJECTS.map((s) => () => subjectSlide(s))];
  let idx = 0;
  let auto = false;
  let timer = null;

  const stage = h('div', { class: 'stage' });
  const dots = slides.map((_, i) => h('button', { type: 'button', class: 'pdot', 'aria-label': `שקופית ${i + 1}`, onclick: () => go(i) }));
  const autoBtn = h('button', { type: 'button', class: 'pbtn', title: S.presentAuto, onclick: () => toggleAuto() }, icon(ICONS.autoplay));

  const go = (i) => {
    idx = (i + slides.length) % slides.length;
    const slide = slides[idx]();
    stage.replaceChildren(slide);
    stage.dataset.subject = slide.dataset.subject ?? '';
    root.dataset.subject = slide.dataset.subject ?? '';
    dots.forEach((d, n) => d.classList.toggle('active', n === idx));
    restartTimer();
  };
  const restartTimer = () => {
    clearInterval(timer);
    if (auto) timer = setInterval(() => go(idx + 1), AUTO_MS);
  };
  const toggleAuto = () => {
    auto = !auto;
    autoBtn.classList.toggle('on', auto);
    autoBtn.replaceChildren(icon(auto ? ICONS.pause : ICONS.autoplay));
    restartTimer();
  };
  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  const exit = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    location.hash = '#/';
  };

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') go(idx + 1);
    else if (e.key === 'ArrowRight') go(idx - 1);
    else if (e.key === ' ') { e.preventDefault(); toggleAuto(); }
    else if (e.key === 'Escape') exit();
    else if (e.key.toLowerCase() === 'f') fullscreen();
    else if (/^[1-5]$/.test(e.key)) go(Number(e.key) - 1);
  };
  document.addEventListener('keydown', onKey);

  root.replaceChildren(
    h('div', { class: 'present' },
      h('div', { class: 'present-bg' }),
      stage,
      h('div', { class: 'pbar' },
        h('div', { class: 'pgroup' }, h('button', { type: 'button', class: 'pbtn', 'aria-label': 'הקודם', onclick: () => go(idx - 1) }, icon(ICONS.arrowRight)), h('div', { class: 'pdots' }, dots), h('button', { type: 'button', class: 'pbtn', 'aria-label': 'הבא', onclick: () => go(idx + 1) }, icon(ICONS.arrowLeft))),
        h('div', { class: 'pgroup' }, autoBtn, h('button', { type: 'button', class: 'pbtn', title: S.presentFull, onclick: fullscreen }, icon(ICONS.expand)), h('button', { type: 'button', class: 'pbtn pexit', onclick: exit }, icon(ICONS.close), S.presentExit)),
      ),
    ),
  );
  go(0);

  return () => {
    clearInterval(timer);
    document.removeEventListener('keydown', onKey);
    delete root.dataset.subject;
  };
}
