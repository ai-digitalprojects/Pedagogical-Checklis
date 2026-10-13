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
- All data lives in ONE central Google Sheet, saved automatically through a small Google Apps Script backend (`backend/Code.gs`). No login: the checklist opens directly and all four subjects are editable. `localStorage` holds no task data.

## Hard constraints
- **Standalone project.** Do not touch, import from, or modify any other repository, database, or deployment.
- **Only integration:** the Google Sheet via the Apps Script web app (`src/storage/sheetsApi.js`, URL in `src/config.js`). No other services, no analytics, no CDN dependencies at runtime (fonts/icons bundled locally). The web app URL is public (it is in the code), so anyone with it can read/write the Sheet — the user chose this deliberately (no access codes). Do NOT connect to the Principal's Dashboard.
- **No real student data.** Sample tasks only; never add names, grades, or identifiers of real people.
- Do NOT implement the future items listed below.

## Future (NOT now; design so they can be added cleanly)
- Connection to the existing School Management Dashboard (explicitly NOT now).
- Optional later: real Google sign-in / per-subject permissions; Google Drive backups.

Persistence goes through `src/state/store.js` and `src/storage/sheetsApi.js` (list/upsert/remove), so the backend can be swapped without touching the views. Data shapes are plain JSON-serializable objects with stable string IDs and a `schemaVersion`.

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
- Backend: Google Sheet tab "Tasks" (id, subject, category, title, status, due, note, deleted, updatedAt). Sheets start empty; deletes are soft (deleted=TRUE). Sheet is shared by all four subjects.
- Subject colors are the `--c`/`--c2`/`--c-soft`/`--c-dark` variables set via `[data-subject]` in `src/styles/tokens.css`.

## Access model
No access codes or roles (removed on request). The tool tracks pedagogical processes, never individual teachers. If permissions are wanted later, add them in `backend/Code.gs` and `src/storage/sheetsApi.js` without touching the views.
