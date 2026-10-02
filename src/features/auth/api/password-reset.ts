import { apiRequest } from '@/lib/api-client';

export type PasswordResetConfirmPayload = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

/**
 * Gửi OTP đặt lại mật khẩu. Backend luôn trả thành công kể cả khi email chưa đăng ký, để
 * người ngoài không dò được tài khoản nào tồn tại — màn hình vì vậy cũng không nói gì khác
 * nhau giữa hai trường hợp.
 */
export function requestPasswordReset(email: string) {
  return apiRequest<Record<string, string>>('/auth/password-reset/request', {
    method: 'POST',
    body: { email: email.trim() },
  });
}

export function confirmPasswordReset(payload: PasswordResetConfirmPayload) {
  return apiRequest<Record<string, string>>('/auth/password-reset/confirm', {
    method: 'POST',
    body: {
      email: payload.email.trim(),
      otp: payload.otp.trim(),
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword,
    },
  });
}
