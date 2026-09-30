import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ApiPendingCard } from '@/components/ui/api-pending-card';
import { InlineAlert } from '@/components/ui/inline-alert';
import { TextField } from '@/components/ui/text-field';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { useMerchantCurrentUser } from '@/features/seller/hooks/use-merchant-shop';
import { useTheme } from '@/hooks/use-theme';

const goToSettings = () => router.navigate('/seller/settings');

/**
 * Thông tin chủ quán đọc từ `GET /users/me`. Backend chưa có endpoint sửa họ tên, email hay
 * số điện thoại (chỉ có `PUT /users/me/avatar`), nên các ô để xem chứ chưa sửa được.
 */
export function SellerOwnerInfoScreen() {
  const theme = useTheme();
  const { data: currentUser, isLoading, isError } = useMerchantCurrentUser();

  if (isLoading) {
    return (
      <SellerOwnerInfoScaffold>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </SellerOwnerInfoScaffold>
    );
  }

  if (isError || !currentUser) {
    return (
      <SellerOwnerInfoScaffold>
        <InlineAlert message="Không tải được thông tin tài khoản. Kiểm tra kết nối rồi thử lại." />
      </SellerOwnerInfoScaffold>
    );
  }

  const fullName = currentUser.displayName ?? '';
  const email = currentUser.email ?? '';
  const phone = currentUser.phoneNumber ? `0${currentUser.phoneNumber}` : '';

  return (
    <SellerOwnerInfoScaffold>
      <SellerFormCard>
        <TextField
          size="compact"
          editable={false}
          label="Họ và tên"
          placeholder="Chưa cập nhật"
          value={fullName}
        />
        <TextField
          size="compact"
          editable={false}
          label="Email"
          placeholder="Chưa cập nhật"
          value={email}
        />
        <TextField
          size="compact"
          editable={false}
          label="Số điện thoại"
          placeholder="Chưa cập nhật"
          value={phone}
        />
      </SellerFormCard>

      <ApiPendingCard feature="Sửa thông tin chủ quán" />
    </SellerOwnerInfoScaffold>
  );
}

function SellerOwnerInfoScaffold({ children }: { children: ReactNode }) {
  return (
    <SellerPageScaffold
      onPressBack={goToSettings}
      subtitle="Cập nhật thông tin hồ sơ và liên hệ của bạn"
      title="Thông tin & Liên hệ"
    >
      {children}
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
});
