// Google Apps Script web app URL (backend/Code.gs). Not a secret: every request still needs an access code.
export const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://script.google.com/macros/s/AKfycbzUCqkqsqNReFrB33C2R8MR0lqdJp67-mUjJb4H4HKT5csjJ49sVEI612HdGqHcTBnJpA/exec';
