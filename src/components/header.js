import { h, icon } from '../utils/dom.js';
import { ICONS } from '../data/icons.js';
import { S } from '../data/strings.he.js';
import { SUBJECTS } from '../data/subjects.js';
import { resetDemo } from '../state/store.js';
import logoUrl from '../assets/logo.webp';
import { toast } from '../utils/confetti.js';

// Official school logo (local asset, bundled by Vite).
export const logo = (cls = '') => h('img', { class: `logo ${cls}`, src: logoUrl, alt: S.logoPlaceholder, width: 2000, height: 2000, decoding: 'async' });

export function buildHeader() {
  const link = (href, ...kids) => h('a', { class: 'nav-link', href, 'data-href': href }, ...kids);

  return h(
    'header',
    { class: 'topbar' },
    h(
      'a',
      { class: 'brand', href: '#/' },
      logo('logo-sm'),
      h('div', { class: 'brand-text' }, h('strong', {}, S.schoolName), h('span', {}, `${S.appTitle} · ${S.appSubtitle}`)),
    ),
    h(
      'nav',
      { class: 'nav', 'aria-label': 'ניווט ראשי' },
      link('#/', icon(ICONS.home), h('span', {}, S.nav.home)),
      SUBJECTS.map((s) => link(`#/s/${s.id}`, h('i', { class: 'dot', 'data-subject': s.id }), h('span', {}, s.name))),
    ),
    h(
      'div',
      { class: 'top-actions' },
      h('a', { class: 'btn btn-present', href: '#/present' }, icon(ICONS.play), h('span', {}, S.nav.present)),
      h(
        'button',
        {
          class: 'btn btn-icon',
          type: 'button',
          title: S.nav.reset,
          'aria-label': S.nav.reset,
          onclick: () => {
            if (window.confirm(S.confirmReset)) {
              resetDemo();
              toast(S.resetDone);
            }
          },
        },
        icon(ICONS.reset),
      ),
    ),
  );
}

export function markActive(header, hash) {
  header.querySelectorAll('.nav-link').forEach((a) => {
    const href = a.getAttribute('data-href');
    const active = href === '#/' ? hash === '#/' || hash === '' : hash.startsWith(href);
    a.classList.toggle('active', active);
    if (active) a.setAttribute('data-subject', a.querySelector('.dot')?.dataset.subject ?? '');
    else a.removeAttribute('data-subject');
    a.toggleAttribute('aria-current', active);
  });
}
