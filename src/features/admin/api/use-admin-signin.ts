import { useMutation } from '@tanstack/react-query';

import { signinRequest, toAuthUser, type SigninPayload } from '@/features/auth/api/signin';
import { ApiException } from '@/lib/api-client';
import { authenticateAsAdmin } from '@/lib/auth-session';

/**
 * Đăng nhập cổng quản trị dùng chung endpoint /auth/signin — backend chưa có endpoint riêng
 * cho admin. Tài khoản không có role ADMIN thì coi như đăng nhập hỏng: không lưu token, không
 * mở phiên, để người dùng thường không vô tình đứng trong khu quản trị.
 *
 * Đây chỉ là chặn ở giao diện; mọi endpoint /admin/* vẫn tự kiểm tra role ở server.
 */
export function useAdminSignin(onSuccess: () => void) {
  return useMutation({
    mutationFn: async (payload: SigninPayload) => {
      const response = await signinRequest(payload);
      if (!response.roles.includes('ADMIN')) {
        throw new ApiException('ACCESS_DENIED', 'Account is not an administrator', 403);
      }

      return response;
    },
    // Lưu token trước khi điều hướng: request đầu tiên trong khu /admin đã có Authorization.
    onSuccess: async (response) => {
      await authenticateAsAdmin(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        toAuthUser(response),
      );
      onSuccess();
    },
  });
}
