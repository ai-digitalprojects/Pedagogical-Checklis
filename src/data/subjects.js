export const SUBJECTS = [
  { id: 'english', name: 'אנגלית', tagline: 'English' },
  { id: 'math', name: 'מתמטיקה', tagline: 'חשיבה כמותית ופתרון בעיות' },
  { id: 'hebrew', name: 'שפה עברית', tagline: 'קריאה, כתיבה ולשון' },
  { id: 'science', name: 'מדעים', tagline: 'חקר, ניסוי וגילוי' },
];

export const CATEGORIES = [
  { id: 'plan', name: 'תכנון והיערכות', emoji: '🗓️' },
  { id: 'assess', name: 'הערכה ומעקב', emoji: '📝' },
  { id: 'lead', name: 'הובלה פדגוגית', emoji: '🌟' },
];

export const subjectById = (id) => SUBJECTS.find((s) => s.id === id);
export const categoryById = (id) => CATEGORIES.find((c) => c.id === id);
