export type ConfirmRequest = {
  title: string;
  message: string;
  /** Nhãn nút xác nhận, vd. "Đăng xuất", "Khóa". */
  confirmLabel: string;
  cancelLabel: string;
  isDestructive: boolean;
  onConfirm: () => void;
};

type ConfirmOptions = Omit<ConfirmRequest, 'cancelLabel' | 'isDestructive'> &
  Partial<Pick<ConfirmRequest, 'cancelLabel' | 'isDestructive'>>;

/**
 * Hộp thoại xác nhận hai nút dùng chung, vẽ bằng `ConfirmDialog` ở layout gốc.
 *
 * Không dùng `Alert.alert` vì trên web, react-native-web bỏ qua mảng nút: hộp thoại hiện ra
 * nhưng `onPress` không bao giờ chạy, khiến đăng xuất và khoá tài khoản im lặng không làm gì.
 * `window.confirm` thì lại bị một số môi trường tự đóng. Tự vẽ trong app để cả web và thiết
 * bị chạy giống nhau, và hộp thoại cũng theo đúng giao diện của app.
 */
let request: ConfirmRequest | null = null;
const listeners = new Set<() => void>();

function setRequest(next: ConfirmRequest | null) {
  request = next;
  listeners.forEach((listener) => listener());
}

export function getConfirmRequest(): ConfirmRequest | null {
  return request;
}

export function subscribeConfirm(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function confirmAction({
  cancelLabel = 'Huỷ',
  isDestructive = false,
  ...options
}: ConfirmOptions) {
  setRequest({ ...options, cancelLabel, isDestructive });
}

export function dismissConfirm() {
  setRequest(null);
}

export function acceptConfirm() {
  const action = request?.onConfirm;
  setRequest(null);
  // Chạy sau một nhịp để hộp thoại kịp đóng trước khi thao tác điều hướng màn.
  if (action) setTimeout(action, 0);
}
