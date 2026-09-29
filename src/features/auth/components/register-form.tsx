import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { FormSection } from '@/features/auth/components/form-section';
import { AuthIcons } from '@/features/auth/constants/icons';
import type { RegisterValues } from '@/features/auth/types';
import { validateRegister } from '@/features/auth/validation';
import { useForm } from '@/hooks/use-form';
import { useTheme } from '@/hooks/use-theme';
import { MIN_PASSWORD_LENGTH } from '@/lib/validation';

const INITIAL_VALUES: RegisterValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

type RegisterFormProps = {
  onSubmit: (values: RegisterValues) => void | Promise<void>;
};

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const theme = useTheme();
  const { values, errors, isSubmitting, setField, submit } = useForm<RegisterValues>({
    initialValues: INITIAL_VALUES,
    validate: validateRegister,
    onSubmit,
  });

  return (
    <View style={styles.container}>
      <FormSection title="Thông tin cá nhân">
        <TextField
          autoComplete="name"
          error={errors.fullName}
          label="Họ và tên"
          leading={<Icon name={AuthIcons.person} />}
          onChangeText={(text) => setField('fullName', text)}
          placeholder="Nguyễn Văn A"
          returnKeyType="next"
          value={values.fullName}
        />
        <TextField
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          error={errors.email}
          keyboardType="email-address"
          label="Email"
          leading={<Icon name={AuthIcons.mail} />}
          onChangeText={(text) => setField('email', text)}
          placeholder="ban@email.com"
          returnKeyType="next"
          value={values.email}
        />
        <TextField
          autoComplete="tel"
          error={errors.phone}
          keyboardType="phone-pad"
          label="Số điện thoại"
          leading={<Icon name={AuthIcons.phone} />}
          maxLength={10}
          onChangeText={(text) => setField('phone', text)}
          placeholder="0901234567"
          returnKeyType="next"
          value={values.phone}
        />
      </FormSection>

      <FormSection title="Bảo mật">
        <PasswordField
          autoComplete="new-password"
          error={errors.password}
          label="Mật khẩu"
          onChangeText={(text) => setField('password', text)}
          placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
          returnKeyType="next"
          value={values.password}
        />
        <PasswordField
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="Nhập lại mật khẩu"
          onChangeText={(text) => setField('confirmPassword', text)}
          onSubmitEditing={() => void submit()}
          placeholder="Nhập lại mật khẩu"
          returnKeyType="done"
          value={values.confirmPassword}
        />
      </FormSection>

      <BrandButton loading={isSubmitting} onPress={() => void submit()}>
        Tạo tài khoản
      </BrandButton>

      <Text style={[styles.terms, { color: theme.textSecondary }]}>
        Bằng việc đăng ký, bạn đồng ý với{' '}
        <Text style={[styles.link, { color: theme.primary }]}>Điều khoản sử dụng</Text> và{' '}
        <Text style={[styles.link, { color: theme.primary }]}>Chính sách bảo mật</Text> của
        LootFast.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  terms: { textAlign: 'center', fontSize: 12, lineHeight: 18 },
  link: { fontWeight: '700' },
});
