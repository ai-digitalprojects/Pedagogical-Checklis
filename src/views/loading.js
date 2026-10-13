import { h } from '../utils/dom.js';
import { S } from '../data/strings.he.js';
import { getState, init } from '../state/store.js';
import { logo } from '../components/header.js';

// Shown while the checklist loads from the Sheet, or if the connection fails.
export function renderLoading(root) {
  const failed = getState().phase === 'error';
  root.replaceChildren(
    h(
      'div',
      { class: 'page login' },
      h(
        'section',
        { class: 'panel login-card' },
        logo(),
        h('h1', {}, S.schoolName),
        h('p', { class: 'login-sub' }, `${S.appTitle} · ${S.appSubtitle}`),
        h('p', { class: 'login-msg' }, failed ? S.connectError : S.loading),
        failed && h('button', { type: 'button', class: 'btn btn-primary', onclick: () => init() }, S.retry),
      ),
    ),
  );
}
