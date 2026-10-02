import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { TextField } from '@/components/ui/text-field';
import { toPasswordResetErrorMessage } from '@/features/auth/api/auth-error-messages';
import { useRequestPasswordReset } from '@/features/auth/api/use-password-reset';
import { AuthIcons } from '@/features/auth/constants/icons';
import type { ForgotPasswordValues } from '@/features/auth/types';
import { validateForgotPassword } from '@/features/auth/validation';
import { useForm } from '@/hooks/use-form';
import { useTheme } from '@/hooks/use-theme';

type ForgotPasswordFormProps = {
  initialEmail?: string;
  /** Đã gửi yêu cầu — sang bước nhập mã và mật khẩu mới. */
  onSent: (email: string) => void;
  onBack: () => void;
};

export function ForgotPasswordForm({ initialEmail = '', onSent, onBack }: ForgotPasswordFormProps) {
  const theme = useTheme();
  const request = useRequestPasswordReset(onSent);

  const { values, errors, isSubmitting, setField, submit } = useForm<ForgotPasswordValues>({
    initialValues: { email: initialEmail },
    validate: validateForgotPassword,
    onSubmit: async ({ email }) => {
      try {
        await request.mutateAsync(email);
      } catch {
        // Lỗi đã nằm trong request.error để hiện banner.
      }
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          Quên mật khẩu
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác thực để bạn đặt lại mật khẩu.
        </Text>
      </View>

      <TextField
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        error={errors.email}
        keyboardType="email-address"
        label="Email"
        leading={<Icon name={AuthIcons.mail} />}
        onChangeText={(text) => {
          if (request.error) request.reset();
          setField('email', text);
        }}
        onSubmitEditing={() => void submit()}
        placeholder="ban@email.com"
        returnKeyType="done"
        value={values.email}
      />

      {request.error ? <InlineAlert message={toPasswordResetErrorMessage(request.error)} /> : null}

      <BrandButton loading={isSubmitting} onPress={() => void submit()}>
        Gửi mã xác thực
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
