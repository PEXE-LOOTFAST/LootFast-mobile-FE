import { router, type Href } from 'expo-router';

import { signOut } from '@/lib/auth-session';
import { confirmAction } from '@/lib/confirm';

type ConfirmSignOutOptions = {
  message?: string;
  /** Nơi quay về sau khi đăng xuất — mặc định là Trang chủ người mua, nơi khách vẫn xem được. */
  redirectTo?: Href;
};

// Cả ba khu vực (người mua, người bán, quản trị) dùng chung hộp thoại này, chỉ khác câu hỏi
// và nơi quay về.
export function confirmSignOut({
  message = 'Bạn muốn đăng xuất khỏi LootFast?',
  redirectTo = '/',
}: ConfirmSignOutOptions = {}) {
  confirmAction({
    title: 'Đăng xuất',
    message,
    confirmLabel: 'Đăng xuất',
    isDestructive: true,
    onConfirm: () => {
      signOut();
      router.replace(redirectTo);
    },
  });
}
