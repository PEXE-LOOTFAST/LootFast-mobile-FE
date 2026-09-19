// Dải U+0300–U+036F là các dấu thanh/dấu phụ tách ra sau khi normalize('NFD').
const COMBINING_MARKS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  'g',
);

// Người dùng hay gõ không dấu ("com tam") — bỏ dấu ở cả hai phía để vẫn khớp "Cơm tấm".
export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();
}
