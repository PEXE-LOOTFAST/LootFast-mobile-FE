import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { TextField } from '@/components/ui/text-field';
import { toAuthErrorMessage } from '@/features/auth/api/auth-error-messages';
import { useSignin } from '@/features/auth/api/use-signin';
import { AuthError } from '@/features/auth/components/auth-error';
import { FieldIcon } from '@/features/auth/components/field-icon';
import { FormSection } from '@/features/auth/components/form-section';
import { PasswordField } from '@/features/auth/components/password-field';
import { AuthIcons, type AuthIconName } from '@/features/auth/constants/icons';
import { useForm } from '@/features/auth/hooks/use-form';
import type { DemoRole, LoginValues } from '@/features/auth/types';
import { validateLogin } from '@/features/auth/validation';
import { useTheme } from '@/hooks/use-theme';

type LoginFormProps = {
  initialEmail?: string;
  onSuccess: () => void;
  onTryDemo: (role: DemoRole) => void;
};

const DEMO_ACCOUNTS = [
  { role: 'buyer', label: 'Người mua', icon: AuthIcons.buyer },
  { role: 'seller', label: 'Người bán', icon: AuthIcons.seller },
  { role: 'admin', label: 'Quản lý', icon: AuthIcons.admin },
] as const satisfies readonly { role: DemoRole; label: string; icon: AuthIconName }[];

export function LoginForm({ initialEmail = '', onSuccess, onTryDemo }: LoginFormProps) {
  const theme = useTheme();
  const signin = useSignin(onSuccess);
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
          leading={<FieldIcon name={AuthIcons.mail} />}
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

        <Pressable accessibilityRole="link" hitSlop={8} style={styles.forgot}>
          <Text style={[styles.forgotText, { color: theme.primary }]}>Quên mật khẩu?</Text>
        </Pressable>
      </FormSection>

      {signin.error ? <AuthError message={toAuthErrorMessage(signin.error)} /> : null}

      <BrandButton loading={isSubmitting} onPress={() => void submit()}>
        Đăng nhập
      </BrandButton>

      <View style={styles.demo}>
        <Text style={[styles.demoTitle, { color: theme.textSecondary }]}>
          Dùng thử tài khoản demo
        </Text>
        <View style={styles.demoRow}>
          {DEMO_ACCOUNTS.map((account) => (
            <Pressable
              key={account.role}
              accessibilityLabel={`Dùng thử tài khoản ${account.label}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              onPress={() => onTryDemo(account.role)}
              style={({ pressed }) => [
                styles.demoButton,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                pressed && styles.pressed,
                isSubmitting && styles.disabled,
              ]}
            >
              <FieldIcon name={account.icon} color={theme.primary} size={15} />
              <Text numberOfLines={1} style={[styles.demoLabel, { color: theme.text }]}>
                {account.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.demoNote, { color: theme.textSecondary }]}>
          Vào ngay với dữ liệu mẫu, không cần đăng ký.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  forgot: { alignSelf: 'flex-end', marginTop: -6 },
  forgotText: { fontSize: 13, fontWeight: '700' },
  // Cụm demo là phần tạm, sẽ xoá khi có tài khoản thật: mọi khoảng cách của nó nằm gọn
  // trong styles.demo nên xoá cả khối <View style={styles.demo}> là đủ, không cần sửa gì thêm.
  demo: { gap: 8 },
  demoTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, textAlign: 'center' },
  demoRow: { flexDirection: 'row', gap: 8 },
  demoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  demoLabel: { fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  demoNote: { textAlign: 'center', fontSize: 11 },
});
