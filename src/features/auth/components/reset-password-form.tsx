import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { toPasswordResetErrorMessage } from '@/features/auth/api/auth-error-messages';
import { useConfirmPasswordReset } from '@/features/auth/api/use-password-reset';
import type { ResetPasswordValues } from '@/features/auth/types';
import { validateResetPassword } from '@/features/auth/validation';
import { useForm } from '@/hooks/use-form';
import { useTheme } from '@/hooks/use-theme';
import { MIN_PASSWORD_LENGTH } from '@/lib/validation';

type ResetPasswordFormProps = {
  email: string;
  /** Đổi mật khẩu xong — quay về tab đăng nhập với email đã điền sẵn. */
  onDone: () => void;
  onBack: () => void;
};

export function ResetPasswordForm({ email, onDone, onBack }: ResetPasswordFormProps) {
  const theme = useTheme();
  const confirm = useConfirmPasswordReset(onDone);

  const { values, errors, isSubmitting, setField, submit } = useForm<ResetPasswordValues>({
    initialValues: { otp: '', newPassword: '', confirmPassword: '' },
    validate: validateResetPassword,
    onSubmit: async (next) => {
      try {
        await confirm.mutateAsync({ email, ...next });
      } catch {
        // Lỗi đã nằm trong confirm.error để hiện banner.
      }
    },
  });

  const changeField = (field: keyof ResetPasswordValues, value: string) => {
    if (confirm.error) confirm.reset();
    setField(field, value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          Đặt mật khẩu mới
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Nhập mã 6 chữ số đã gửi tới {email} và mật khẩu mới của bạn.
        </Text>
      </View>

      <TextField
        autoFocus
        error={errors.otp}
        keyboardType="number-pad"
        label="Mã xác thực"
        maxLength={6}
        onChangeText={(text) => changeField('otp', text)}
        placeholder="123456"
        returnKeyType="next"
        value={values.otp}
      />

      <PasswordField
        autoComplete="new-password"
        error={errors.newPassword}
        label="Mật khẩu mới"
        onChangeText={(text) => changeField('newPassword', text)}
        placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
        returnKeyType="next"
        value={values.newPassword}
      />

      <PasswordField
        autoComplete="new-password"
        error={errors.confirmPassword}
        label="Nhập lại mật khẩu mới"
        onChangeText={(text) => changeField('confirmPassword', text)}
        onSubmitEditing={() => void submit()}
        placeholder="Nhập lại mật khẩu mới"
        returnKeyType="done"
        value={values.confirmPassword}
      />

      {confirm.error ? <InlineAlert message={toPasswordResetErrorMessage(confirm.error)} /> : null}

      <BrandButton loading={isSubmitting} onPress={() => void submit()}>
        Đổi mật khẩu
      </BrandButton>

      <Pressable accessibilityRole="button" hitSlop={8} onPress={onBack} style={styles.back}>
        <Text style={[styles.link, { color: theme.textSecondary }]}>Quay lại đăng nhập</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  intro: { gap: 6 },
  title: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  description: { fontSize: 13, lineHeight: 19 },
  back: { alignSelf: 'center' },
  link: { fontSize: 13, fontWeight: '800' },
});
