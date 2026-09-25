import { router } from 'expo-router';

import { BrandButton } from '@/components/ui/brand-button';
import { useForm } from '@/features/auth/hooks/use-form';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerFormField } from '@/features/seller/components/seller-form-field';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { updateSellerOwner } from '@/features/seller/data/seller-profile-store';
import { useSellerProfile } from '@/features/seller/hooks/use-seller-profile';
import { validateOwnerInfo, type OwnerInfoValues } from '@/features/seller/validation';

const goToSettings = () => router.navigate('/seller/settings');

export function SellerOwnerInfoScreen() {
  const { owner } = useSellerProfile();
  const { values, errors, setField, submit } = useForm<OwnerInfoValues>({
    initialValues: owner,
    validate: validateOwnerInfo,
    onSubmit: (next) => {
      updateSellerOwner({
        fullName: next.fullName.trim(),
        email: next.email.trim(),
        phone: next.phone.trim(),
      });
      goToSettings();
    },
  });

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
