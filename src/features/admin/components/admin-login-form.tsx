import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { TextField } from '@/components/ui/text-field';
import { AdminIcons } from '@/features/admin/constants/icons';
import { MOCK_ADMIN_ACCOUNT } from '@/features/admin/data/mock-admin-account';
import { validateAdminLogin, type AdminLoginValues } from '@/features/admin/validation';
import { FieldIcon } from '@/features/auth/components/field-icon';
import { PasswordField } from '@/features/auth/components/password-field';
import { AuthIcons } from '@/features/auth/constants/icons';
import { useForm } from '@/features/auth/hooks/use-form';
import { HomeIcon } from '@/features/home/components/home-icon';
import { useTheme } from '@/hooks/use-theme';

// Giả lập độ trễ gọi API để nút có trạng thái đang tải như khi nối thật.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function AdminLoginForm({ onAuthenticated }: { onAuthenticated: () => void }) {
  const theme = useTheme();
  // Lỗi sai tài khoản là của cả form, không gắn vào ô nào để không lộ ô nào đúng ô nào sai.
  const [formError, setFormError] = useState<string>();
  const { values, errors, isSubmitting, setField, submit } = useForm<AdminLoginValues>({
    initialValues: { email: '', password: '' },
    validate: validateAdminLogin,
    onSubmit: async ({ email, password }) => {
      setFormError(undefined);
      await wait(400);
      const isValid =
        email.trim().toLowerCase() === MOCK_ADMIN_ACCOUNT.email &&
        password === MOCK_ADMIN_ACCOUNT.password;

      if (isValid) onAuthenticated();
      else setFormError('Email hoặc mật khẩu không đúng.');
    },
  });

  const changeField = (field: keyof AdminLoginValues, value: string) => {
    setFormError(undefined);
    setField(field, value);
  };

  const fillDemoAccount = () => {
    changeField('email', MOCK_ADMIN_ACCOUNT.email);
    changeField('password', MOCK_ADMIN_ACCOUNT.password);
  };

  return (
    <View style={styles.container}>
      <View style={styles.fields}>
        <TextField
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          error={errors.email}
          keyboardType="email-address"
          label="Email quản trị"
          leading={<FieldIcon name={AuthIcons.mail} />}
          onChangeText={(text) => changeField('email', text)}
          placeholder="admin@lootfast.vn"
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
      </View>

      {formError ? (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.error, { backgroundColor: `${theme.danger}1F` }]}
        >
          <HomeIcon name={AdminIcons.warning} color={theme.danger} size={16} />
          <Text style={[styles.errorText, { color: theme.danger }]}>{formError}</Text>
        </View>
      ) : null}

      <BrandButton loading={isSubmitting} onPress={() => void submit()}>
        Đăng nhập quản trị
      </BrandButton>

      <View style={styles.demo}>
        <BrandButton variant="outline" disabled={isSubmitting} onPress={fillDemoAccount}>
          Điền tài khoản demo
        </BrandButton>
        <Text style={[styles.demoNote, { color: theme.textSecondary }]}>
          Chưa có API xác thực — dùng tài khoản mẫu để xem khu vực quản trị.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  fields: { gap: 16 },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, padding: 12 },
  errorText: { flex: 1, fontSize: 13, fontWeight: '700' },
  demo: { gap: 12 },
  demoNote: { textAlign: 'center', fontSize: 13, lineHeight: 19 },
});
