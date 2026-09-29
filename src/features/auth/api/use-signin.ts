import { useMutation } from '@tanstack/react-query';

import { signinRequest, toAuthUser, type SigninPayload } from '@/features/auth/api/signin';
import { authenticate } from '@/lib/auth-session';

export function useSignin(onSuccess: () => void) {
  return useMutation({
    mutationFn: (payload: SigninPayload) => signinRequest(payload),
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
