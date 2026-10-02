import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getMyMerchantApplication,
  submitMerchantApplication,
} from '@/features/seller/api/merchant-application';
import { ApiException } from '@/lib/api-client';

const MY_APPLICATION_KEY = ['merchant-application', 'me'];

/**
 * Hồ sơ đăng ký bán hàng của tôi. Chưa gửi hồ sơ nào thì backend trả
 * MERCHANT_APPLICATION_NOT_FOUND — đó là trạng thái bình thường, không phải lỗi, nên không
 * retry và màn hình hiển thị form gửi mới.
 */
export function useMyMerchantApplication(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: MY_APPLICATION_KEY,
    queryFn: getMyMerchantApplication,
    retry: (failureCount, error) => {
      if (error instanceof ApiException && error.code === 'MERCHANT_APPLICATION_NOT_FOUND') {
        return false;
      }

      return failureCount < 1;
    },
  });
}

export function useSubmitMerchantApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ licenseNumber, licenseUri }: { licenseNumber: string; licenseUri: string }) =>
      submitMerchantApplication(licenseNumber, licenseUri),
    onSuccess: (application) => queryClient.setQueryData(MY_APPLICATION_KEY, application),
  });
}
