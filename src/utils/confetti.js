const COLORS = ['#ff7a1a', '#3b6bff', '#e8318a', '#10b981', '#ffc633', '#7a5cff'];

export function confetti(x = window.innerWidth / 2, y = window.innerHeight / 3, count = 60) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 220;
    p.style.cssText =
      `left:${x}px;top:${y}px;background:${COLORS[i % COLORS.length]};` +
      `--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist - 60}px;--rot:${Math.random() * 720}deg;` +
      `animation-delay:${Math.random() * 80}ms`;
    layer.append(p);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 1700);
}

export function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2400);
}
