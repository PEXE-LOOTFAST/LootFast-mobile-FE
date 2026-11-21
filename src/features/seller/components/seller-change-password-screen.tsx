import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Spacing } from '@/constants/theme';
import { toPasswordResetErrorMessage } from '@/features/auth/api/auth-error-messages';
import { useRequestPasswordReset } from '@/features/auth/api/use-password-reset';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { useAuthSession } from '@/hooks/use-auth-session';
import { showToast } from '@/lib/toast';

const goToSettings = () => router.navigate('/seller/settings');

/**
 * Backend chưa có API đổi mật khẩu bằng mật khẩu cũ, nhưng có luồng đặt lại qua mã gửi email.
 * Dùng luồng đó cho tài khoản đang đăng nhập: gửi mã tới email của chính họ, rồi nhập mã cùng
 * mật khẩu mới. Vừa đổi được thật, vừa xác minh đúng chủ tài khoản.
 */
export function SellerChangePasswordScreen() {
  const { user } = useAuthSession();
  const email = user?.email ?? '';
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const request = useRequestPasswordReset(() => setStep('confirm'));

  return (
    <SellerPageScaffold
      onPressBack={goToSettings}
      subtitle="Đổi mật khẩu đăng nhập của bạn"
      title="Mật khẩu"
    >
      <SellerFormCard>
        {step === 'request' ? (
          <View style={styles.request}>
            <AppText accessibilityRole="header" variant="bodyLg" weight="bold">
              Xác nhận qua email
            </AppText>
            <AppText tone="textSecondary" variant="bodySm">
              Để chắc chắn là bạn, LootFast sẽ gửi mã 6 chữ số tới {email}. Bước sau bạn nhập mã đó
              cùng mật khẩu mới.
            </AppText>
            {request.error ? (
              <InlineAlert message={toPasswordResetErrorMessage(request.error)} />
            ) : null}
            <BrandButton
              disabled={!email}
              loading={request.isPending}
              onPress={() => request.mutate(email)}
            >
              Gửi mã xác nhận
            </BrandButton>
          </View>
        ) : (
          <ResetPasswordForm
            backLabel="Chưa nhận được mã? Gửi lại"
            email={email}
            onBack={() => setStep('request')}
            onDone={() => {
              showToast('Đã đổi mật khẩu', { tone: 'success' });
              goToSettings();
            }}
          />
        )}
      </SellerFormCard>
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  request: { gap: Spacing.md },
});
