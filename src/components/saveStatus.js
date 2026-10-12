import { h } from '../utils/dom.js';
import { S } from '../data/strings.he.js';
import { getSync, subscribeSync } from '../state/store.js';

const paint = (el) => {
  const { pending, error } = getSync();
  el.textContent = error ? S.saveError : pending ? S.saving : S.saved;
};

// Small footer indicator; every instance on the page is refreshed together.
subscribeSync(() => document.querySelectorAll('.save-status').forEach(paint));

export function saveStatus() {
  const el = h('span', { class: 'save-status' });
  paint(el);
  return el;
}
