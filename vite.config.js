import { defineConfig } from 'vite';

// GitHub Pages serves the project at /Pedagogical-Checklist/; local dev stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Pedagogical-Checklist/' : './',
}));
