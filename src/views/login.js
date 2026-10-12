import { h } from '../utils/dom.js';
import { S } from '../data/strings.he.js';
import { getState, init, login } from '../state/store.js';
import { logo } from '../components/header.js';

// Access-code screen, also used for the loading and connection-error states.
export function renderLogin(root) {
  const { phase, error } = getState();
  let body;

  if (phase === 'init' || phase === 'loading') {
    body = h('p', { class: 'login-msg' }, S.loading);
  } else if (phase === 'error') {
    body = [
      h('p', { class: 'login-msg' }, S.connectError),
      h('button', { type: 'button', class: 'btn btn-primary', onclick: () => init() }, S.retry),
    ];
  } else {
    const input = h('input', {
      type: 'text',
      class: 'field code-field',
      autocomplete: 'off',
      autocapitalize: 'characters',
      spellcheck: 'false',
      maxlength: 12,
      'aria-label': S.accessCode,
      placeholder: 'XXXX-XXXX',
    });
    body = h(
      'form',
      { class: 'login-form', onsubmit: (e) => { e.preventDefault(); login(input.value); } },
      h('p', { class: 'login-msg' }, S.loginHint),
      h('label', { class: 'lbl' }, S.accessCode, input),
      error && h('p', { class: 'login-error', role: 'alert' }, error === 'bad_code' ? S.badCode : S.connectError),
      h('button', { type: 'submit', class: 'btn btn-primary' }, S.loginBtn),
    );
    requestAnimationFrame(() => input.focus());
  }

  root.replaceChildren(
    h('div', { class: 'page login' }, h('section', { class: 'panel login-card' }, logo(), h('h1', {}, S.schoolName), h('p', { class: 'login-sub' }, `${S.appTitle} · ${S.appSubtitle}`), body)),
  );
}
