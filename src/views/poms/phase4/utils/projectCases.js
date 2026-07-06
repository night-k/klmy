export function projectCasesToText(list = []) {
  if (!Array.isArray(list)) return String(list || '').trim();
  return list.filter(Boolean).join('\n');
}

export function textToProjectCases(text = '') {
  const str = String(text || '').trim();
  if (!str) return [];
  if (/[\r\n]/.test(str)) {
    return str
      .split(/\r?\n/)
      .map(v => v.trim())
      .filter(Boolean);
  }
  return str
    .split(/[,，]/)
    .map(v => v.trim())
    .filter(Boolean);
}
