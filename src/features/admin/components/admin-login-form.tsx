import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { toAdminSigninErrorMessage } from '@/features/admin/api/admin-error-messages';
import { useAdminSignin } from '@/features/admin/api/use-admin-signin';
import { validateAdminLogin, type AdminLoginValues } from '@/features/admin/validation';
import { AuthIcons } from '@/features/auth/constants/icons';
import { useForm } from '@/hooks/use-form';

type AdminLoginFormProps = {
  /** Đăng nhập thành công — phiên quản trị đã mở, chỉ còn điều hướng. */
  onAuthenticated: () => void;
};

export function AdminLoginForm({ onAuthenticated }: AdminLoginFormProps) {
  // Lỗi sai tài khoản là của cả form, không gắn vào ô nào để không lộ ô nào đúng ô nào sai.
  const [formError, setFormError] = useState<string>();
  const signin = useAdminSignin(onAuthenticated);
  const { values, errors, isSubmitting, setField, submit } = useForm<AdminLoginValues>({
    initialValues: { email: '', password: '' },
    validate: validateAdminLogin,
    onSubmit: async ({ email, password }) => {
      setFormError(undefined);
      try {
        await signin.mutateAsync({ email: email.trim().toLowerCase(), password });
      } catch (error) {
        setFormError(toAdminSigninErrorMessage(error));
      }
    },
  });

  const changeField = (field: keyof AdminLoginValues, value: string) => {
    setFormError(undefined);
    setField(field, value);
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

      <BrandButton loading={isSubmitting} onPress={() => void submit()}>
        Đăng nhập quản trị
      </BrandButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  fields: { gap: 16 },
});
