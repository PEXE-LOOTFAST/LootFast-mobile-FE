import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { TextField } from '@/components/ui/text-field';
import { toOtpErrorMessage } from '@/features/auth/api/auth-error-messages';
import { useResendOtp, useVerifyOtp } from '@/features/auth/api/use-signup';
import type { OtpValues } from '@/features/auth/types';
import { validateOtp } from '@/features/auth/validation';
import { useForm } from '@/hooks/use-form';
import { useTheme } from '@/hooks/use-theme';

type OtpFormProps = {
  email: string;
  /** Xác thực xong thì tài khoản chuyển sang VERIFIED và đăng nhập được. */
  onVerified: () => void;
  onBack: () => void;
};

/**
 * Bước nhập mã 6 số gửi về email sau khi đăng ký. Không xác thực thì `POST /auth/signin` sẽ
 * trả ACCOUNT_NOT_VERIFIED, nên đây là bước bắt buộc chứ không phải tuỳ chọn.
 */
export function OtpForm({ email, onVerified, onBack }: OtpFormProps) {
  const theme = useTheme();
  const verify = useVerifyOtp(onVerified);
  const resend = useResendOtp();
  const [resentMessage, setResentMessage] = useState<string>();

  const { values, errors, isSubmitting, setField, submit } = useForm<OtpValues>({
    initialValues: { otp: '' },
    validate: validateOtp,
    onSubmit: async ({ otp }) => {
      setResentMessage(undefined);
      try {
        await verify.mutateAsync({ email, otp });
      } catch {
        // Lỗi đã nằm trong verify.error để hiện banner.
      }
    },
  });

  const handleResend = () => {
    if (resend.isPending) return;

    setResentMessage(undefined);
    verify.reset();
    resend.mutate(email, {
      onSuccess: () => setResentMessage('Đã gửi lại mã. Kiểm tra hộp thư của bạn.'),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          Xác thực email
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Mã gồm 6 chữ số đã được gửi tới {email}. Mã có hiệu lực trong ít phút.
        </Text>
      </View>

      <TextField
        autoFocus
        error={errors.otp}
        keyboardType="number-pad"
        label="Mã xác thực"
        maxLength={6}
        onChangeText={(text) => {
          if (verify.error) verify.reset();
          setField('otp', text);
        }}
        onSubmitEditing={() => void submit()}
        placeholder="123456"
        returnKeyType="done"
        value={values.otp}
      />

      {verify.error ? <InlineAlert message={toOtpErrorMessage(verify.error)} /> : null}
      {resend.error ? <InlineAlert message={toOtpErrorMessage(resend.error)} /> : null}
      {resentMessage ? <InlineAlert message={resentMessage} tone="success" /> : null}

      <BrandButton loading={isSubmitting} onPress={() => void submit()}>
        Xác thực
      </BrandButton>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={resend.isPending}
          hitSlop={8}
          onPress={handleResend}
        >
          <Text style={[styles.link, { color: theme.primary }]}>
            {resend.isPending ? 'Đang gửi lại…' : 'Gửi lại mã'}
          </Text>
        </Pressable>

        <Pressable accessibilityRole="button" hitSlop={8} onPress={onBack}>
          <Text style={[styles.link, { color: theme.textSecondary }]}>Quay lại</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  intro: { gap: 6 },
  title: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  description: { fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { fontSize: 13, fontWeight: '800' },
});
