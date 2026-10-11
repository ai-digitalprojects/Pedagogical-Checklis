# Pedagogical-Checklist

Interactive pedagogical management dashboard for elementary-school core-subject coordinators (רכזי מקצועות ליבה).
Prototype for presentation to school leadership.

## Project goals
- Visually impressive, colorful, modern, interactive dashboard.
- **Entirely Hebrew UI with proper RTL** (`<html lang="he" dir="rtl">`; use CSS logical properties such as `margin-inline-start`, never hard-coded left/right).
- Four subjects, each with its own color, icon and interactive checklist:
  - English (אנגלית)
  - Mathematics (מתמטיקה)
  - Hebrew Language (שפה עברית)
  - Science (מדעים)
- Task categories, completion checkboxes, status indicators, progress bars, overall progress statistics.
- Polished and engaging; suitable for presenting to school leadership.
- Desktop and mobile layouts (mobile-first, responsive).
- Demonstration changes persist locally in the browser (`localStorage`).

## Hard constraints
- **Standalone project.** Do not touch, import from, or modify any other repository, database, or deployment.
- **No external services or integrations.** No backend, no network calls, no analytics, no auth, no CDN dependencies at runtime (fonts/icons bundled locally).
- **No real student data.** Sample tasks only; never add names, grades, or identifiers of real people.
- Do NOT implement the future integrations listed below.

## Future (NOT now; design so they can be added cleanly)
- Connection to an existing School Management Dashboard.
- Secure data storage.
- Google Drive backups.

To keep this possible: all persistence goes through a single storage module (`src/storage/`) with a small interface (`load()`, `save(state)`, `reset()`), so localStorage can later be swapped for an API without touching UI code. Data shapes are plain JSON-serializable objects with stable string IDs and a `schemaVersion`.

## Development rules
- Modular, maintainable code; small single-purpose modules; no giant files.
- Priorities: visual quality, usability, working interactions.
- Hebrew strings live in one place (`src/data/strings.he.js` or equivalent), not scattered through components.
- Accessibility: semantic HTML, real `<input type="checkbox">`, visible focus, sufficient contrast, `prefers-reduced-motion` respected.
- Subject theming via CSS custom properties (`--subject-color`, etc.), not per-subject duplicated CSS.
- Match existing code style; keep comments sparse and meaningful.

## Workflow
- Proposal-first: do not implement beyond what the user has approved.
- Verify UI changes in the browser (desktop + mobile widths, RTL) before reporting done.

## Status
- [x] CLAUDE.md created
- [x] Architecture/structure proposal approved by user (Vite + vanilla JS + CSS + localStorage)
- [x] Prototype implemented (dashboard, 4 subject checklists, presentation mode)

## Commands
- `npm install` then `npm run dev` → http://127.0.0.1:5173
- `npm run build` / `npm run preview` → production check
- Hash routes: `#/` dashboard, `#/s/<english|math|hebrew|science>` checklist, `#/present` presentation mode (←/→ navigate, Space auto-play, F fullscreen, Esc exit)
- Storage key `gavim-pedagogical-checklist-simple` (schemaVersion 2); the older key is never touched. The header reset button restores the simplified seed data.
- Subject colors are the `--c`/`--c2`/`--c-soft`/`--c-dark` variables set via `[data-subject]` in `src/styles/tokens.css`.

## Planned access model (not implemented)
Each subject coordinator will edit only her own subject; the pedagogical coordinator and principal get read-only access to all subjects. The tool tracks pedagogical processes, never individual teachers. Keep tasks keyed by `subject` and route all reads/writes through `src/state/store.js` + `src/storage/` so auth, roles, Supabase or Drive can be added later without touching the views. No auth/roles/backends now.
