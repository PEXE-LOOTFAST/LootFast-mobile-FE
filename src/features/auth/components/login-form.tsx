import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Spacing } from '@/constants/theme';
import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { toAuthErrorMessage, toSocialErrorMessage } from '@/features/auth/api/auth-error-messages';
import { useSignin } from '@/features/auth/api/use-signin';
import { isGoogleLoginConfigured, useSocialLogin } from '@/features/auth/api/use-social-login';
import { FormSection } from '@/features/auth/components/form-section';
import { AuthIcons } from '@/features/auth/constants/icons';
import type { LoginValues } from '@/features/auth/types';
import { validateLogin } from '@/features/auth/validation';
import { useForm } from '@/hooks/use-form';
import { useTheme } from '@/hooks/use-theme';

type LoginFormProps = {
  initialEmail?: string;
  onSuccess: () => void;
  onForgotPassword: () => void;
};

export function LoginForm({ initialEmail = '', onSuccess, onForgotPassword }: LoginFormProps) {
  const theme = useTheme();
  const signin = useSignin(onSuccess);
  const socialLogin = useSocialLogin(onSuccess);
  const { values, errors, isSubmitting, setField, submit } = useForm<LoginValues>({
    initialValues: { email: initialEmail, password: '' },
    validate: validateLogin,
    onSubmit: async ({ email, password }) => {
      try {
        await signin.mutateAsync({ email: email.trim(), password });
      } catch {
        // Lỗi đã nằm trong signin.error để hiện banner; ném tiếp sẽ thành unhandled rejection.
      }
    },
  });

  const changeField = (field: keyof LoginValues, value: string) => {
    if (signin.error) signin.reset();
    setField(field, value);
  };

  return (
    <View style={styles.container}>
      <FormSection title="Thông tin đăng nhập">
        <TextField
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          error={errors.email}
          keyboardType="email-address"
          label="Email"
          leading={<Icon name={AuthIcons.mail} />}
          onChangeText={(text) => changeField('email', text)}
          placeholder="ban@email.com"
          returnKeyType="next"
          value={values.email}
        />

        <PasswordField
          autoComplete="current-password"
          error={errors.password}
          label="Mật khẩu"
          onChangeText={(text) => changeField('password', text)}
          onSubmitEditing={() => void submit()}
          placeholder="••••••••"
          returnKeyType="go"
          value={values.password}
        />

        <Pressable
          accessibilityRole="link"
          hitSlop={8}
          onPress={onForgotPassword}
          style={styles.forgot}
        >
          <Text style={[styles.forgotText, { color: theme.primary }]}>Quên mật khẩu?</Text>
        </Pressable>
      </FormSection>

      {signin.error ? <InlineAlert message={toAuthErrorMessage(signin.error)} /> : null}

      <BrandButton loading={isSubmitting} onPress={() => void submit()}>
        Đăng nhập
      </BrandButton>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerLabel, { color: theme.textSecondary }]}>hoặc</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      {socialLogin.error ? <InlineAlert message={toSocialErrorMessage(socialLogin.error)} /> : null}

      <BrandButton
        disabled={isSubmitting}
        loading={socialLogin.isPending}
        onPress={() => socialLogin.mutate('GOOGLE')}
        variant="outline"
      >
        Đăng nhập bằng Google
      </BrandButton>

      {/* Nói trước để người dùng không bấm rồi mới gặp lỗi khó hiểu. */}
      {isGoogleLoginConfigured ? null : (
        <Text style={[styles.socialNote, { color: theme.textSecondary }]}>
          Đăng nhập Google chỉ dùng được trên bản dựng Android (không chạy trong Expo Go) và cần cấu
          hình OAuth client.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xl },
  forgot: { alignSelf: 'flex-end', marginTop: -6 },
  forgotText: { fontSize: FontSize.bodySm, fontWeight: FontWeight.bold },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerLabel: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  socialNote: { fontSize: FontSize.footnote, lineHeight: 17, textAlign: 'center' },
});
