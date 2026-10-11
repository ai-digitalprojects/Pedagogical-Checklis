import { h } from '../utils/dom.js';

function countUp(el, target, duration = 900) {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function ring({ pct, size = 120, stroke = 12, sub = '', animate = false, cls = '' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = c * (1 - pct / 100);
  const bar = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  for (const [k, v] of Object.entries({ cx: size / 2, cy: size / 2, r, class: 'ring-bar', 'stroke-width': stroke })) {
    bar.setAttribute(k, v);
  }
  bar.style.strokeDasharray = c;
  bar.style.strokeDashoffset = animate ? c : target;

  const track = bar.cloneNode();
  track.setAttribute('class', 'ring-track');
  track.style.cssText = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.append(track, bar);

  const num = h('span', { class: 'ring-num' }, animate ? '0' : String(pct));
  const el = h(
    'div',
    { class: `ring ${cls}`, style: `--ring-size:${size}px`, role: 'img', 'aria-label': `${pct}%` },
    svg,
    h('div', { class: 'ring-center' }, h('div', { class: 'ring-value' }, num, h('small', {}, '%')), sub && h('div', { class: 'ring-sub' }, sub)),
  );

  if (animate) {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        bar.style.strokeDashoffset = target;
        countUp(num, pct);
      }),
    );
  }
  return el;
}

// Stacked progress bar: solid = done, striped = in progress.
export function stackedBar({ doneP, doingP, animate = false, cls = '' }) {
  const done = h('span', { class: 'seg seg-done' });
  const doing = h('span', { class: 'seg seg-doing' });
  const set = () => {
    done.style.width = `${doneP}%`;
    doing.style.width = `${doingP}%`;
  };
  if (animate) requestAnimationFrame(() => requestAnimationFrame(set));
  else set();
  return h('div', { class: `bar ${cls}`, role: 'progressbar', 'aria-valuenow': Math.round(doneP), 'aria-valuemin': 0, 'aria-valuemax': 100 }, done, doing);
}
