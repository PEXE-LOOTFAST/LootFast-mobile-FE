import { router, type Href } from 'expo-router';
import { Alert } from 'react-native';

import { signOut } from '@/lib/auth-session';

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
  Alert.alert('Đăng xuất', message, [
    { text: 'Huỷ', style: 'cancel' },
    {
      text: 'Đăng xuất',
      style: 'destructive',
      onPress: () => {
        signOut();
        router.replace(redirectTo);
      },
    },
  ]);
}
