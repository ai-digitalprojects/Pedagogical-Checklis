/**
 * Pedagogical Checklist backend — Google Apps Script bound to the Google Sheet.
 *
 * - One sheet tab ("Tasks"), one row per task, every task linked to its subject.
 * - Access is controlled by codes kept in Script Properties (never in the Sheet or the repo):
 *     CODE_english / CODE_math / CODE_hebrew / CODE_science -> edit that subject only
 *     CODE_viewer                                           -> read-only, all subjects
 * - The web app is deployed "Execute as: Me", so nobody else needs access to the Sheet.
 *
 * One-time setup: run setup() from the editor, then read the codes with showCodes().
 */

var SHEET_NAME = 'Tasks';
var HEADERS = ['id', 'subject', 'category', 'title', 'status', 'due', 'note', 'deleted', 'updatedAt'];
var SUBJECTS = ['english', 'math', 'hebrew', 'science'];
var SUBJECT_LABELS = { english: 'אנגלית', math: 'מתמטיקה', hebrew: 'שפה עברית', science: 'מדעים', viewer: 'צפייה בלבד (מנהלת/רכזת פדגוגית)' };
var CATEGORIES = ['plan', 'assess', 'lead'];
var STATUSES = ['todo', 'doing', 'done'];
var CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 characters, no I/O/0/1

/* ------------------------------ setup & codes ------------------------------ */

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  // Plain-text columns: stops Sheets turning dates into Date cells or text into formulas.
  sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).setNumberFormat('@');
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);

  var props = PropertiesService.getScriptProperties();
  var existing = props.getProperties();
  SUBJECTS.concat(['viewer']).forEach(function (key) {
    if (!existing['CODE_' + key]) props.setProperty('CODE_' + key, randomCode_());
  });
  showCodes();
}

function showCodes() {
  var props = PropertiesService.getScriptProperties().getProperties();
  var lines = SUBJECTS.concat(['viewer']).map(function (key) {
    return SUBJECT_LABELS[key] + ':  ' + formatCode_(props['CODE_' + key] || '(not set — run setup)');
  });
  Logger.log('\nקודי גישה (לשמור בסוד, לשלוח לכל רכזת רק את הקוד שלה):\n' + lines.join('\n'));
}

function rotateAllCodes() {
  var props = PropertiesService.getScriptProperties();
  SUBJECTS.concat(['viewer']).forEach(function (key) { props.setProperty('CODE_' + key, randomCode_()); });
  showCodes();
}

function randomCode_() {
  var hex = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  var out = '';
  for (var i = 0; i < 8; i++) out += CODE_ALPHABET.charAt(parseInt(hex.substr(i * 2, 2), 16) % 32);
  return out;
}

function formatCode_(code) {
  return code.length === 8 ? code.substr(0, 4) + '-' + code.substr(4) : code;
}

function normalizeCode_(code) {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/* ------------------------------- web app entry ------------------------------ */

function doGet() {
  return json_({ ok: true, service: 'pedagogical-checklist' });
}

function doPost(e) {
  var res;
  try {
    res = handle_(JSON.parse(e.postData.contents));
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    res = { ok: false, error: 'bad_request' };
  }
  return json_(res);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function handle_(req) {
  var role = roleForCode_(req && req.code);
  if (!role) return { ok: false, error: 'bad_code' };
  switch (req.action) {
    case 'login': return { ok: true, role: role.type, subject: role.subject || null };
    case 'list': return { ok: true, tasks: listTasks_() };
    case 'upsert': return withLock_(function () { return upsert_(role, req.task); });
    case 'delete': return withLock_(function () { return remove_(role, req.id); });
  }
  return { ok: false, error: 'bad_action' };
}

function roleForCode_(code) {
  var given = normalizeCode_(code);
  if (given.length !== 8) return null;
  var props = PropertiesService.getScriptProperties().getProperties();
  if (given === normalizeCode_(props.CODE_viewer)) return { type: 'viewer' };
  for (var i = 0; i < SUBJECTS.length; i++) {
    if (given === normalizeCode_(props['CODE_' + SUBJECTS[i]])) return { type: 'editor', subject: SUBJECTS[i] };
  }
  return null;
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return { ok: false, error: 'busy' };
  }
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/* --------------------------------- data access ------------------------------- */

function getSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Run setup() first');
  return sheet;
}

function readRows_(sheet) {
  var last = sheet.getLastRow();
  return last < 2 ? [] : sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
}

function cellText_(v) {
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return v === null || v === undefined ? '' : String(v);
}

function listTasks_() {
  return readRows_(getSheet_())
    .filter(function (r) { return cellText_(r[7]) !== 'TRUE'; })
    .map(function (r) {
      return {
        id: cellText_(r[0]), subject: cellText_(r[1]), category: cellText_(r[2]), title: cellText_(r[3]),
        status: cellText_(r[4]), due: cellText_(r[5]), note: cellText_(r[6]),
      };
    });
}

function validate_(t) {
  if (!t || typeof t !== 'object') return null;
  var clean = {
    id: String(t.id || ''), subject: String(t.subject || ''), category: String(t.category || ''),
    title: String(t.title || '').trim().slice(0, 200), status: String(t.status || ''),
    due: String(t.due || ''), note: String(t.note || '').slice(0, 2000),
  };
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(clean.id)) return null;
  if (SUBJECTS.indexOf(clean.subject) < 0 || CATEGORIES.indexOf(clean.category) < 0 || STATUSES.indexOf(clean.status) < 0) return null;
  if (!clean.title) return null;
  if (clean.due && !/^\d{4}-\d{2}-\d{2}$/.test(clean.due)) return null;
  return clean;
}

function findRow_(rows, id) {
  for (var i = 0; i < rows.length; i++) if (cellText_(rows[i][0]) === id) return i;
  return -1;
}

function upsert_(role, task) {
  if (role.type !== 'editor') return { ok: false, error: 'read_only' };
  var clean = validate_(task);
  if (!clean) return { ok: false, error: 'invalid' };
  if (clean.subject !== role.subject) return { ok: false, error: 'forbidden' };

  var sheet = getSheet_();
  var rows = readRows_(sheet);
  var idx = findRow_(rows, clean.id);
  if (idx >= 0 && cellText_(rows[idx][1]) !== role.subject) return { ok: false, error: 'forbidden' };

  var rowNum = idx >= 0 ? idx + 2 : Math.max(sheet.getLastRow(), 1) + 1;
  var values = [clean.id, clean.subject, clean.category, clean.title, clean.status, clean.due, clean.note, '', new Date().toISOString()];
  sheet.getRange(rowNum, 1, 1, HEADERS.length).setNumberFormat('@').setValues([values]);
  return { ok: true };
}

function remove_(role, id) {
  if (role.type !== 'editor') return { ok: false, error: 'read_only' };
  var sheet = getSheet_();
  var rows = readRows_(sheet);
  var idx = findRow_(rows, String(id || ''));
  if (idx < 0) return { ok: true };
  if (cellText_(rows[idx][1]) !== role.subject) return { ok: false, error: 'forbidden' };
  sheet.getRange(idx + 2, 8, 1, 2).setValues([['TRUE', new Date().toISOString()]]);
  return { ok: true };
}
