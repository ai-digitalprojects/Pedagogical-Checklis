# Pedagogical Checklist — Project Status

Last updated: 2026-10-12

## Summary
Hebrew (RTL) dashboard for core-subject coordinators at בית ספר גבים. Vite + vanilla JS + CSS.
- **Live site (old version, unchanged):** https://ai-digitalprojects.github.io/Pedagogical-Checklis/ — localStorage demo with 24 sample tasks. Still deployed from commit `da6b482`.
- **Local work (NOT pushed, NOT deployed):** Google Sheets integration via Google Apps Script — verified against the real Sheet; no login.

## Current state of the Google Sheets integration
**Status: connected to the REAL Google Sheet and verified. NOT yet published to GitHub Pages (waiting for the user's approval).**

### Design decision (2026-10-13)
All access codes / login / roles were removed at the user's request. The checklist opens directly, all four subjects are editable by anyone with the page. Trade-off accepted: the Apps Script web app URL is in the public code, so anyone with it can read/write the Sheet (mitigated by input validation, Sheet version history, soft deletes).

### What exists
- `backend/Code.gs` — Apps Script bound to the Sheet "מעקב רכזות מקצוע – גבים", deployed as web app (Execute as Me, Access Anyone). Tab `Tasks`: `id, subject, category, title, status, due, note, deleted, updatedAt`; actions `list`, `upsert`, `delete` (soft delete). `setup()` creates the tab. To change the script: paste into Extensions → Apps Script, then Deploy → Manage deployments → edit → New version (URL stays the same).
- Web app URL is set in `src/config.js` (override with `VITE_API_URL`).
- App: `src/storage/sheetsApi.js`, `src/state/store.js` (optimistic updates, debounced auto-save, retry, 30 s polling + refresh on tab focus, flush on page hide), `src/views/loading.js` (loading / connection error), `src/components/saveStatus.js` (footer "נשמר ✓ / שומר…"). Approved design unchanged.
- Checklists start empty; any task can be added, edited, deleted.

### Real-Sheet test results (2026-10-13, all passed)
- Opens directly to the dashboard (no login); backend rejects the removed `login` action.
- Add (Hebrew / הערכה ומעקב) → row appeared in the real Sheet with correct subject, category, status, note; indicator שומר… → נשמר ✓.
- Edit status, note, date and title → all updated in the Sheet.
- Page refresh → task loaded back from the Sheet with status, date and note; no task data in localStorage.
- Dashboard totals and subject card updated; delete (with confirmation) removed it from the screen and from the list; Sheet row kept as soft-deleted (deleted=TRUE). The test task was removed; Sheet has no active tasks.
- Earlier (before removing codes): backend logic and app flow also passed local simulation tests.

### Remaining before publication
1. User approval to publish.
2. Push to GitHub (see below) → GitHub Pages deploys; then check the public site loads data from the Sheet (cross-origin from github.io), plus Presentation Mode and the logo.
3. Optional: delete the leftover soft-deleted test row(s) in the Sheet's Tasks tab.

## Repository / deployment (unchanged)
- Repo: https://github.com/ai-digitalprojects/Pedagogical-Checklis (public; name missing the final "t", kept on purpose). GitHub Pages source = GitHub Actions; Vite base `/Pedagogical-Checklis/`.
- Local commits are not pushed. Pushing to `main` triggers a Pages deployment — do not push until the Sheets integration is verified and approved.
- Commit identity: `ai-digitalprojects <ai-digitalprojects@users.noreply.github.com>`. The user's personal GitHub account must never appear anywhere in the repository or its history. Pushing: remote is pinned to the `ai-digitalprojects@` username; authenticate with `git -c credential.guiPrompt=false -c credential.gitHubAuthModes=device push` (device-code sign-in as ai-digitalprojects, private window). Another GitHub login is stored on this PC (the user's personal one): never use or change it.
- Idle Terminal tabs from earlier push attempts (c2, c3, c4) may still be open; safe to close.

## Completed functionality (live version and local version)
Dashboard (overall ring, stats, 4 coloured subject cards, "בתהליך כעת", heatmap "תמונת מצב לפי תחומי עבודה"), subject checklists in 3 categories (תכנון והיערכות, הערכה ומעקב, הובלה פדגוגית), statuses טרם התחיל / בתהליך / הושלם, optional notes and dates, add / edit / delete tasks, automatic progress calculation, Presentation Mode (`#/present`), official school logo (`src/assets/logo.webp`), message "הצעה ראשונית לשיח משותף עם רכזות המקצוע".

## Later / future (not started)
- Real Google sign-in instead of access codes; Google Drive backups.
- Connection to the School Management Dashboard — explicitly NOT wanted now.
- Optional: rename repo to `Pedagogical-Checklist` (requires changing `vite.config.js` base, the git remote and the site URL).
