import { haptics } from '@/lib/haptics';

export type ToastTone = 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
  durationMs: number;
};

type ToastOptions = {
  tone?: ToastTone;
  /** Mặc định 3 giây, lỗi 5 giây để kịp đọc. */
  durationMs?: number;
};

/**
 * Thông báo ngắn tự ẩn, vẽ bằng `ToastHost` ở layout gốc. Dùng cho kết quả một thao tác ("Đã
 * lưu", "Không gửi được") thay vì `Alert.alert`: không chặn màn, không bắt người dùng bấm OK, và
 * chạy giống nhau trên web lẫn điện thoại.
 *
 * Không thấy được khi đang mở `Modal` của React Native (modal nằm ở cửa sổ riêng phía trên); báo
 * lỗi bên trong modal thì hiện ngay trong modal.
 */
let current: Toast | null = null;
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function showToast(message: string, { tone = 'info', durationMs }: ToastOptions = {}) {
  current = {
    id: nextId++,
    message,
    tone,
    durationMs: durationMs ?? (tone === 'error' ? 5000 : 3000),
  };
  // Kết quả thành công/thất bại kèm rung nhẹ để cảm nhận được cả khi không nhìn màn hình.
  if (tone === 'success') haptics.success();
  if (tone === 'error') haptics.error();
  emit();
}

export function dismissToast(id: number) {
  if (current?.id !== id) return;
  current = null;
  emit();
}

export function getToast(): Toast | null {
  return current;
}

export function subscribeToast(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
