import { useMutation } from '@tanstack/react-query';
import { Platform, TurboModuleRegistry } from 'react-native';

import { toAuthUser } from '@/features/auth/api/signin';
import {
  requestSocialNonce,
  socialLoginRequest,
  type SocialProvider,
} from '@/features/auth/api/social-login';
import { ApiException } from '@/lib/api-client';
import { authenticate } from '@/lib/auth-session';

/**
 * Client id loại Web của Google. Android Credential Manager cấp id token với `aud` chính là
 * client id này, nên nó phải nằm trong GOOGLE_CLIENT_IDS của backend. Client loại Android
 * (package name + SHA-1) vẫn phải tạo trên Google Cloud để Google nhận ra app, nhưng không đưa
 * vào code.
 */
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;

/**
 * Module native chỉ có trong development build. Expo Go và bản web không có nó, mà thư viện
 * ném lỗi ngay lúc import — nên phải kiểm tra trước và chỉ `require` khi chắc chắn có, kẻo
 * cả app sập chứ không riêng nút Google.
 */
const hasNativeGoogleModule =
  Platform.OS === 'android' && TurboModuleRegistry.get('CredentialsManager') !== null;

/** App chỉ phát hành trên Android; bản web và Expo Go chỉ dùng để dựng giao diện. */
export const isGoogleLoginConfigured = hasNativeGoogleModule && Boolean(GOOGLE_WEB_CLIENT_ID);

type GoogleModule = typeof import('react-native-credentials-manager');

/**
 * Lấy id token qua hộp chọn tài khoản của hệ thống. Nonce được truyền thẳng vào yêu cầu để
 * Google nhúng vào token — backend đối chiếu lại nên token chụp từ phiên khác sẽ bị từ chối.
 * Trả về null khi người dùng đóng hộp chọn.
 */
async function getGoogleIdToken(nonce: string): Promise<string | null> {
  try {
    // Xem ghi chú ở hasNativeGoogleModule: không import ở đầu file để Expo Go không sập.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const googleModule = require('react-native-credentials-manager') as GoogleModule;
    const { signUpWithGoogle } = googleModule;
    const credential = await signUpWithGoogle({
      serverClientId: GOOGLE_WEB_CLIENT_ID as string,
      nonce,
      // Luôn hiện hộp chọn tài khoản thay vì tự đăng nhập bằng tài khoản dùng lần trước.
      autoSelectEnabled: false,
      filterByAuthorizedAccounts: false,
    });

    return credential.idToken || null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/cancel/i.test(message)) return null;

    throw new ApiException('GOOGLE_SIGNIN_FAILED', message, 500);
  }
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
