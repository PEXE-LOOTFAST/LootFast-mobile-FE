import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { MOCK_ADMIN_ACCOUNT } from '@/features/admin/data/mock-admin-account';
import { validateAdminLogin, type AdminLoginValues } from '@/features/admin/validation';
import { AuthIcons } from '@/features/auth/constants/icons';
import { useForm } from '@/hooks/use-form';
import { useTheme } from '@/hooks/use-theme';

// Giả lập độ trễ gọi API để nút có trạng thái đang tải như khi nối thật.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function AdminLoginForm({ onAuthenticated }: { onAuthenticated: () => void }) {
  const theme = useTheme();
  // Lỗi sai tài khoản là của cả form, không gắn vào ô nào để không lộ ô nào đúng ô nào sai.
  const [formError, setFormError] = useState<string>();
  const [isEnteringDemo, setIsEnteringDemo] = useState(false);
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

  // Điền sẵn tài khoản mẫu rồi vào luôn: người dùng thấy được mình đăng nhập bằng tài khoản nào
  // mà không phải bấm thêm lần nữa.
  const enterWithDemoAccount = async () => {
    if (isSubmitting || isEnteringDemo) return;

    setFormError(undefined);
    setField('email', MOCK_ADMIN_ACCOUNT.email);
    setField('password', MOCK_ADMIN_ACCOUNT.password);

    setIsEnteringDemo(true);
    await wait(400);
    onAuthenticated();
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
          leading={<Icon name={AuthIcons.mail} />}
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

      {formError ? <InlineAlert message={formError} /> : null}

      <BrandButton disabled={isEnteringDemo} loading={isSubmitting} onPress={() => void submit()}>
        Đăng nhập quản trị
      </BrandButton>

      <View style={styles.demo}>
        <BrandButton
          variant="outline"
          disabled={isSubmitting}
          loading={isEnteringDemo}
          onPress={() => void enterWithDemoAccount()}
        >
          Vào bằng tài khoản demo
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
  demo: { gap: 12 },
  demoNote: { textAlign: 'center', fontSize: 13, lineHeight: 19 },
});
