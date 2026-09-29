import { router } from 'expo-router';
import { Alert } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { PasswordField } from '@/components/ui/password-field';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { validateChangePassword, type ChangePasswordValues } from '@/features/seller/validation';
import { useForm } from '@/hooks/use-form';
import { MIN_PASSWORD_LENGTH } from '@/lib/validation';

const INITIAL_VALUES: ChangePasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function SellerChangePasswordScreen() {
  const { values, errors, setField, submit } = useForm<ChangePasswordValues>({
    initialValues: INITIAL_VALUES,
    validate: validateChangePassword,
    // Chưa có API đổi mật khẩu: form kiểm tra đủ quy tắc rồi báo tính năng sắp có.
    onSubmit: () => Alert.alert('Mật khẩu', 'Tính năng đổi mật khẩu đang được phát triển.'),
  });

  return (
    <SellerPageScaffold
      onPressBack={() => router.navigate('/seller/settings')}
      subtitle="Đổi mật khẩu đăng nhập của bạn"
      title="Mật khẩu"
    >
      <SellerFormCard>
        <PasswordField
          size="compact"
          autoComplete="current-password"
          error={errors.currentPassword}
          label="Mật khẩu hiện tại"
          onChangeText={(text) => setField('currentPassword', text)}
          placeholder="Nhập mật khẩu hiện tại"
          value={values.currentPassword}
        />
        <PasswordField
          size="compact"
          autoComplete="new-password"
          error={errors.newPassword}
          label="Mật khẩu mới"
          onChangeText={(text) => setField('newPassword', text)}
          placeholder={`Từ ${MIN_PASSWORD_LENGTH} ký tự, có chữ hoa, chữ thường và số`}
          value={values.newPassword}
        />
        <PasswordField
          size="compact"
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="Xác nhận mật khẩu mới"
          onChangeText={(text) => setField('confirmPassword', text)}
          placeholder="Nhập lại mật khẩu mới"
          value={values.confirmPassword}
        />
      </SellerFormCard>

      <BrandButton onPress={submit}>Cập nhật mật khẩu</BrandButton>
    </SellerPageScaffold>
  );
}
