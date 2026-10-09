import type { SigninResponse } from '@/features/auth/api/signin';
import { PRIVACY_POLICY_VERSION, TERMS_VERSION } from '@/features/auth/api/signup';
import { apiRequest } from '@/lib/api-client';

export type SocialProvider = 'GOOGLE' | 'APPLE';

export type SocialNonceResponse = {
  nonce: string;
  expiresIn: number;
};

export type SocialLoginPayload = {
  provider: SocialProvider;
  /** JWT id token do Google hoặc Apple cấp; backend tự xác minh chữ ký và `aud`. */
  idToken: string;
  /** Đúng chuỗi nonce vừa xin ở `/auth/social/nonce` — backend đối chiếu với nonce trong token. */
  nonce: string;
  firstName?: string;
  lastName?: string;
};

/**
 * Xin nonce trước khi mở trang đăng nhập của nhà cung cấp. Nonce phải đi kèm trong yêu cầu
 * OAuth để Google nhúng nó vào id token; backend so lại hai bên nên token bị chụp lại từ phiên
 * khác sẽ không dùng được.
 */
export function requestSocialNonce() {
  return apiRequest<SocialNonceResponse>('/auth/social/nonce', { method: 'POST' });
}

export function socialLoginRequest(payload: SocialLoginPayload) {
  return apiRequest<SigninResponse>('/auth/social/login', {
    method: 'POST',
    body: {
      ...payload,
      // Tài khoản tạo lần đầu qua mạng xã hội vẫn phải ghi nhận đồng ý điều khoản; backend trả
      // CONSENT_REQUIRED nếu thiếu.
      termsAccepted: true,
      termsVersion: TERMS_VERSION,
      privacyPolicyAccepted: true,
      privacyPolicyVersion: PRIVACY_POLICY_VERSION,
    },
  });
}
