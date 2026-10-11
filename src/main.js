import '@fontsource/heebo/hebrew-400.css';
import '@fontsource/heebo/hebrew-600.css';
import '@fontsource/heebo/hebrew-800.css';
import '@fontsource/heebo/latin-400.css';
import '@fontsource/heebo/latin-600.css';
import '@fontsource/heebo/latin-800.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/views.css';
import './styles/present.css';

import { h } from './utils/dom.js';
import { subscribe } from './state/store.js';
import { buildHeader, markActive } from './components/header.js';
import { renderDashboard } from './views/dashboard.js';
import { renderSubject } from './views/subject.js';
import { mountPresent } from './views/present.js';

const app = document.getElementById('app');
const header = buildHeader();
const main = h('main', { id: 'view', tabindex: '-1' });
app.append(header, main);

let cleanup = null;
let lastRouteKey = null;

function parseRoute() {
  const raw = location.hash || '#/';
  const [path, query = ''] = raw.split('?');
  return { raw, path, params: new URLSearchParams(query) };
}

function render({ routeChanged }) {
  const { path, params } = parseRoute();
  const animate = routeChanged;
  const scrollY = window.scrollY;

  cleanup?.();
  cleanup = null;
  document.body.classList.toggle('is-presenting', path === '#/present');
  markActive(header, path);

  if (path === '#/present') {
    cleanup = mountPresent(main);
  } else if (path.startsWith('#/s/')) {
    renderSubject(main, path.slice(4), { animate, focusTask: routeChanged ? params.get('task') : null });
  } else {
    renderDashboard(main, { animate });
  }

  const subjectId = path.startsWith('#/s/') ? path.slice(4) : '';
  document.body.dataset.subject = subjectId;
  if (routeChanged) window.scrollTo({ top: 0 });
  else window.scrollTo({ top: scrollY });
}

function onRoute() {
  const key = parseRoute().path;
  const routeChanged = key !== lastRouteKey;
  lastRouteKey = key;
  render({ routeChanged });
}

window.addEventListener('hashchange', onRoute);
subscribe(() => {
  if (parseRoute().path !== '#/present') render({ routeChanged: false });
});
onRoute();
