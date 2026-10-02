/**
 * Khoá chống đặt trùng cho `POST /orders`: backend yêu cầu header Idempotency-Key dạng UUID và
 * nhớ nó trong 24 giờ, nên gửi lại cùng khoá sẽ trả về đúng đơn cũ thay vì trừ kho lần nữa.
 *
 * Hermes chưa có `crypto.randomUUID` nên phải có đường lùi. Khoá này chỉ cần duy nhất, không
 * cần khó đoán, vì thế `Math.random` là đủ — đừng dùng hàm này cho token hay thứ gì bảo mật.
 */
export function createIdempotencyKey(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return uuid;

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
}
