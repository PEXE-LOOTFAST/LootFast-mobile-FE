import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { TextField } from '@/components/ui/text-field';
import { FieldIcon } from '@/features/auth/components/field-icon';
import { FormSection } from '@/features/auth/components/form-section';
import { PasswordField } from '@/features/auth/components/password-field';
import { AuthIcons, type AuthIconName } from '@/features/auth/constants/icons';
import { useForm } from '@/features/auth/hooks/use-form';
import type { DemoRole, LoginValues } from '@/features/auth/types';
import { validateLogin } from '@/features/auth/validation';
import { useTheme } from '@/hooks/use-theme';

type LoginFormProps = {
  initialIdentifier?: string;
  onSubmit: (values: LoginValues) => void | Promise<void>;
  onTryDemo: (role: DemoRole) => void;
};

const DEMO_ACCOUNTS = [
  { role: 'buyer', label: 'Người mua', icon: AuthIcons.buyer },
  { role: 'seller', label: 'Người bán', icon: AuthIcons.seller },
  { role: 'admin', label: 'Quản lý', icon: AuthIcons.admin },
] as const satisfies readonly { role: DemoRole; label: string; icon: AuthIconName }[];

export function LoginForm({ initialIdentifier = '', onSubmit, onTryDemo }: LoginFormProps) {
  const theme = useTheme();
  const { values, errors, isSubmitting, setField, submit } = useForm<LoginValues>({
    initialValues: { identifier: initialIdentifier, password: '' },
    validate: validateLogin,
    onSubmit,
  });

  return (
    <View style={styles.container}>
      <FormSection title="Thông tin đăng nhập">
        <TextField
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect={false}
          error={errors.identifier}
          keyboardType="email-address"
          label="Email hoặc tên đăng nhập"
          leading={<FieldIcon name={AuthIcons.mail} />}
          onChangeText={(text) => setField('identifier', text)}
          placeholder="ban@email.com hoặc username"
          returnKeyType="next"
          value={values.identifier}
        />

        <PasswordField
          autoComplete="current-password"
          error={errors.password}
          label="Mật khẩu"
          onChangeText={(text) => setField('password', text)}
          onSubmitEditing={() => void submit()}
          placeholder="••••••••"
          returnKeyType="go"
          value={values.password}
        />

        <Pressable accessibilityRole="link" hitSlop={8} style={styles.forgot}>
          <Text style={[styles.forgotText, { color: theme.primary }]}>Quên mật khẩu?</Text>
        </Pressable>
      </FormSection>

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
              <View style={[styles.demoIcon, { backgroundColor: theme.primarySoft }]}>
                <FieldIcon name={account.icon} color={theme.primary} size={18} />
              </View>
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
  demo: { gap: 12 },
  demoTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4, textAlign: 'center' },
  demoRow: { flexDirection: 'row', gap: 10 },
  demoButton: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  demoIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  demoLabel: { fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  demoNote: { textAlign: 'center', fontSize: 13 },
});
