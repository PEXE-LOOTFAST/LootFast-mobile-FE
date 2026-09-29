import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { useForm } from '@/features/auth/hooks/use-form';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerFormField } from '@/features/seller/components/seller-form-field';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { useMerchantCurrentUser } from '@/features/seller/hooks/use-merchant-shop';
import { validateOwnerInfo, type OwnerInfoValues } from '@/features/seller/validation';
import { useTheme } from '@/hooks/use-theme';

const goToSettings = () => router.navigate('/seller/settings');

export function SellerOwnerInfoScreen() {
  const theme = useTheme();
  const { data: currentUser, isLoading } = useMerchantCurrentUser();

  const { values, errors, setField, submit } = useForm<OwnerInfoValues>({
    initialValues: {
      fullName: currentUser?.displayName ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.phoneNumber ? `0${currentUser.phoneNumber}` : '',
    },
    validate: validateOwnerInfo,
    onSubmit: () => {
      goToSettings();
    },
  });

  if (isLoading) {
    return (
      <SellerPageScaffold
        onPressBack={goToSettings}
        subtitle="Cập nhật thông tin hồ sơ và liên hệ của bạn"
        title="Thông tin & Liên hệ"
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </SellerPageScaffold>
    );
  }

  return (
    <SellerPageScaffold
      onPressBack={goToSettings}
      subtitle="Cập nhật thông tin hồ sơ và liên hệ của bạn"
      title="Thông tin & Liên hệ"
    >
      <SellerFormCard>
        <SellerFormField
          autoComplete="name"
          error={errors.fullName}
          label="Họ và tên"
          onChangeText={(text) => setField('fullName', text)}
          placeholder="Nguyễn Văn A"
          value={values.fullName}
        />
        <SellerFormField
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
        <SellerFormField
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
    </SellerPageScaffold>
  );
}
