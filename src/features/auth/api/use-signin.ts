import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { signinRequest, toAuthUser, type SigninPayload } from '@/features/auth/api/signin';
import { authenticate, authenticateAsAdmin } from '@/lib/auth-session';

export function useSignin(onSuccess: () => void) {
  return useMutation({
    mutationFn: (payload: SigninPayload) => signinRequest(payload),
    // Lưu token trước khi gọi onSuccess: điều hướng xong là mọi request sau đã có Authorization.
    onSuccess: async (response) => {
      // Tài khoản quản trị đăng nhập ở cổng nào cũng vào thẳng khu /admin.
      if (response.roles.includes('ADMIN')) {
        await authenticateAsAdmin(
          { accessToken: response.accessToken, refreshToken: response.refreshToken },
          toAuthUser(response),
        );
        router.replace('/admin/overview');
        return;
      }

      await authenticate(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        toAuthUser(response),
      );
      onSuccess();
    },
  });
}
