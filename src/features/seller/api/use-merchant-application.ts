import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getMyMerchantApplication,
  submitMerchantApplication,
} from '@/features/seller/api/merchant-application';
import { ApiException, type UploadFile } from '@/lib/api-client';

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
    // Ảnh đang tải lên thì vài giây là xong; hồ sơ chờ duyệt thì xem lại mỗi phút để khách không
    // phải thoát ra vào lại mới biết kết quả.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'UPLOADING') return 5_000;
      if (status === 'PENDING') return 60_000;

      return false;
    },
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
    mutationFn: ({ licenseNumber, license }: { licenseNumber: string; license: UploadFile }) =>
      submitMerchantApplication(licenseNumber, license),
    onSuccess: (application) => queryClient.setQueryData(MY_APPLICATION_KEY, application),
  });
}
