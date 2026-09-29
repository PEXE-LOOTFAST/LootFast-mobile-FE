import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { TextField } from '@/components/ui/text-field';
import { updateSellerStore } from '@/demo/store';
import { useSellerDemo } from '@/demo/use-demo';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { useMerchantCurrentUser } from '@/features/seller/hooks/use-merchant-shop';
import type { SellerOwner } from '@/features/seller/types';
import { validateOwnerInfo, type OwnerInfoValues } from '@/features/seller/validation';
import { useForm } from '@/hooks/use-form';
import { useTheme } from '@/hooks/use-theme';

const goToSettings = () => router.navigate('/seller/settings');

export function SellerOwnerInfoScreen() {
  const theme = useTheme();
  const { data: currentUser, isLoading, isError } = useMerchantCurrentUser();
  const { owner: demoOwner } = useSellerDemo();

  if (isLoading) {
    return (
      <SellerOwnerInfoScaffold>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </SellerOwnerInfoScaffold>
    );
  }

  // Không gọi được API (thường là chưa bật backend) thì dùng chủ quán trong kho dữ liệu demo.
  const owner: SellerOwner =
    isError || !currentUser
      ? demoOwner
      : {
          fullName: currentUser.displayName ?? '',
          email: currentUser.email ?? '',
          phone: currentUser.phoneNumber ? `0${currentUser.phoneNumber}` : '',
        };

  // Chờ tải xong mới dựng form: `useForm` chốt giá trị ban đầu ngay lần render đầu tiên,
  // nên nếu mount sớm thì các ô sẽ trống dù dữ liệu về sau đó.
  return <SellerOwnerInfoForm owner={owner} saveToDemo={isError || !currentUser} />;
}

function SellerOwnerInfoForm({ owner, saveToDemo }: { owner: SellerOwner; saveToDemo: boolean }) {
  const { values, errors, setField, submit } = useForm<OwnerInfoValues>({
    initialValues: owner,
    validate: validateOwnerInfo,
    onSubmit: (next) => {
      // Chưa có API cập nhật chủ quán; khi chạy bằng dữ liệu demo thì ghi thẳng vào kho chung
      // để màn Hồ sơ quán và khu quản trị cùng thấy tên mới.
      if (saveToDemo) {
        updateSellerStore({
          ownerName: next.fullName.trim(),
          ownerEmail: next.email.trim(),
          phone: next.phone.trim(),
        });
      }
      goToSettings();
    },
  });

  return (
    <SellerOwnerInfoScaffold>
      <SellerFormCard>
        <TextField
          size="compact"
          autoComplete="name"
          error={errors.fullName}
          label="Họ và tên"
          onChangeText={(text) => setField('fullName', text)}
          placeholder="Nguyễn Văn A"
          value={values.fullName}
        />
        <TextField
          size="compact"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          error={errors.email}
          keyboardType="email-address"
          label="Email"
          onChangeText={(text) => setField('email', text)}
          placeholder="ban@email.com"
          value={values.email}
        />
        <TextField
          size="compact"
          autoComplete="tel"
          error={errors.phone}
          keyboardType="phone-pad"
          label="Số điện thoại"
          maxLength={10}
          onChangeText={(text) => setField('phone', text)}
          placeholder="09xx xxx xxx"
          value={values.phone}
        />
      </SellerFormCard>

      <BrandButton onPress={submit}>Lưu thay đổi</BrandButton>
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
