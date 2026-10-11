// [category, title, status, optional note] — no deadlines in the simplified demo.
const ROWS = {
  english: [
    ['plan', 'גיבוש תוכנית עבודה שנתית לאנגלית', 'done', 'אושרה יחד עם צוות המקצוע.'],
    ['plan', 'התאמת פריסת החומר לרבעונים', 'doing'],
    ['assess', 'בחירת כלי הערכה משותפים לשכבות', 'doing'],
    ['assess', 'מיפוי הישגים ובניית קבוצות תמיכה בקריאה', 'todo'],
    ['lead', 'מפגש צוות לשיתוף רעיונות להוראת דיבור', 'done'],
    ['lead', 'תצפיות שיתופיות בשיעורים', 'todo'],
  ],
  math: [
    ['plan', 'תוכנית שנתית ויעדי שכבה במתמטיקה', 'done'],
    ['plan', 'הכנת חומרי המחשה ומשאבים', 'doing'],
    ['assess', 'מבחן מדידה אחיד בנושא שברים', 'todo'],
    ['assess', 'מיפוי הישגים והתאמת תמיכה לתלמידים', 'doing', 'כדאי לבדוק קודם את עובדות החשבון.'],
    ['lead', 'מפגש צוות: כלים ויזואליים להוראת שברים', 'done'],
    ['lead', 'ליווי מורים חדשים', 'todo'],
  ],
  hebrew: [
    ['plan', 'עדכון התוכנית השנתית לשפה: קריאה, כתיבה ולשון', 'done'],
    ['plan', 'תכנון שבוע קריאה בית-ספרי', 'todo'],
    ['assess', 'מחוון מוסכם להערכת חיבור', 'done'],
    ['assess', 'מיפוי שטף קריאה ותמיכה בקבוצות קטנות', 'doing'],
    ['lead', 'השתלמות פנימית בהוראת הבנת הנקרא', 'doing'],
    ['lead', 'שיתוף הורים: ״מקריאים ביחד״', 'todo'],
  ],
  science: [
    ['plan', 'תוכנית שנתית למדעים וניסויים מרכזיים', 'done'],
    ['plan', 'היערכות ציוד ובטיחות במעבדה', 'doing'],
    ['assess', 'הערכה מבוססת דוחות מעבדה', 'todo'],
    ['assess', 'מיפוי ידע קודם לפני יחידת לימוד', 'done'],
    ['lead', 'סדנת צוות: בטיחות ועבודה עם חומרים', 'done', 'מומלץ לקבוע מועד לפני תחילת הניסויים.'],
    ['lead', 'יום מדע משפחתי', 'todo'],
  ],
};

export function buildSeedTasks() {
  const tasks = [];
  for (const [subject, rows] of Object.entries(ROWS)) {
    rows.forEach(([category, title, status, note = ''], i) => {
      tasks.push({ id: `${subject}-${i + 1}`, subject, category, title, status, due: '', note, updatedAt: Date.now() });
    });
  }
  return tasks;
}
