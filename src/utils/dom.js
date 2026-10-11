export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, val] of Object.entries(props || {})) {
    if (val == null || val === false) continue;
    if (key === 'class') el.className = val;
    else if (key === 'html') el.innerHTML = val;
    else if (key === 'style') el.style.cssText = val;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
    else if (key === 'value') el.value = val;
    else if (val === true) el.setAttribute(key, '');
    else el.setAttribute(key, val);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child.nodeType ? child : document.createTextNode(child));
  }
  return el;
}

export const icon = (svg, cls = 'icon') => h('span', { class: cls, html: svg, 'aria-hidden': 'true' });
