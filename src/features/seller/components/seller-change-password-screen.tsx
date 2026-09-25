import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { useForm } from '@/features/auth/hooks/use-form';
import { MIN_PASSWORD_LENGTH } from '@/features/auth/validation';
import { HomeIcon } from '@/features/home/components/home-icon';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerFormField } from '@/features/seller/components/seller-form-field';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { SellerIcons } from '@/features/seller/constants/icons';
import { validateChangePassword, type ChangePasswordValues } from '@/features/seller/validation';
import { useTheme } from '@/hooks/use-theme';

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
        <PasswordInput
          autoComplete="current-password"
          error={errors.currentPassword}
          label="Mật khẩu hiện tại"
          onChangeText={(text) => setField('currentPassword', text)}
          placeholder="Nhập mật khẩu hiện tại"
          value={values.currentPassword}
        />
        <PasswordInput
          autoComplete="new-password"
          error={errors.newPassword}
          label="Mật khẩu mới"
          onChangeText={(text) => setField('newPassword', text)}
          placeholder={`Từ ${MIN_PASSWORD_LENGTH} ký tự, có chữ hoa, chữ thường và số`}
          value={values.newPassword}
        />
        <PasswordInput
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

function PasswordInput(props: Omit<Parameters<typeof SellerFormField>[0], 'secureTextEntry'>) {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <SellerFormField
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!isVisible}
      trailing={
        <Pressable
          accessibilityLabel={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => setIsVisible((visible) => !visible)}
          style={styles.toggle}
        >
          <HomeIcon
            name={isVisible ? SellerIcons.hide : SellerIcons.show}
            color={theme.text}
            size={18}
          />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
