import { useMutation } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { toAuthUser } from '@/features/auth/api/signin';
import {
  requestSocialNonce,
  socialLoginRequest,
  type SocialProvider,
} from '@/features/auth/api/social-login';
import { ApiException } from '@/lib/api-client';
import { authenticate } from '@/lib/auth-session';

/**
 * OAuth client id của Google, khai trong .env. Mỗi nền tảng cần một client id riêng và cả ba
 * phải nằm trong GOOGLE_CLIENT_IDS của backend, vì backend đối chiếu `aud` của id token.
 */
const GOOGLE_CLIENT_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
  android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  default: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
});

const REDIRECT_URI = process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI;

export const isGoogleLoginConfigured = Boolean(GOOGLE_CLIENT_ID && REDIRECT_URI);

/**
 * Lấy id token của Google bằng luồng implicit: mở trang đăng nhập, Google trả token ngay trong
 * fragment của URL chuyển hướng. Chọn luồng này vì backend chỉ cần id token đã ký, không cần
 * access token — đổi lại không phải thêm thư viện OAuth nào.
 */
async function getGoogleIdToken(nonce: string): Promise<string | null> {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID as string,
    redirect_uri: REDIRECT_URI as string,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce,
    prompt: 'select_account',
  });

  const result = await WebBrowser.openAuthSessionAsync(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    REDIRECT_URI as string,
  );
  if (result.type !== 'success') return null;

  // Google trả token sau dấu #, không phải query string, nên phải tự tách.
  const fragment = result.url.split('#')[1];

  return fragment ? new URLSearchParams(fragment).get('id_token') : null;
}

/** Tên hiển thị Google nhúng sẵn trong id token; backend dùng khi tạo tài khoản lần đầu. */
function readNameFromIdToken(idToken: string) {
  try {
    const claims = idToken.split('.')[1];
    if (!claims) return {};

    const payload = JSON.parse(
      // atob không hiểu base64url nên đổi hai ký tự khác biệt trước khi giải mã.
      atob(claims.replace(/-/g, '+').replace(/_/g, '/')),
    ) as { given_name?: string; family_name?: string };

    return { firstName: payload.given_name, lastName: payload.family_name };
  } catch {
    // Token lạ định dạng thì bỏ qua phần tên — backend vẫn nhận thiếu hai trường này.
    return {};
  }
}

export function useSocialLogin(onSuccess: () => void) {
  return useMutation({
    mutationFn: async (provider: SocialProvider) => {
      if (provider === 'APPLE') {
        throw new ApiException(
          'APPLE_NOT_CONFIGURED',
          'Apple sign-in requires the native module',
          501,
        );
      }
      if (!isGoogleLoginConfigured) {
        throw new ApiException('GOOGLE_NOT_CONFIGURED', 'Google client id is missing', 501);
      }

      const { nonce } = await requestSocialNonce();
      const idToken = await getGoogleIdToken(nonce);
      if (!idToken) {
        throw new ApiException('SOCIAL_CANCELLED', 'Người dùng đã đóng cửa sổ đăng nhập', 499);
      }

      return socialLoginRequest({ provider, idToken, nonce, ...readNameFromIdToken(idToken) });
    },
    // Lưu token trước khi gọi onSuccess: điều hướng xong là mọi request sau đã có Authorization.
    onSuccess: async (response) => {
      await authenticate(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        toAuthUser(response),
      );
      onSuccess();
    },
  });
}
