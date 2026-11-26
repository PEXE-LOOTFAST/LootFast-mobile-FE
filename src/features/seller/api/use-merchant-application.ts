import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getMyMerchantApplication,
  submitMerchantApplication,
  type MyMerchantApplicationDto,
} from '@/features/seller/api/merchant-application';
import { ApiException, type UploadFile } from '@/lib/api-client';

const MY_APPLICATION_KEY = ['merchant-application', 'me'];

/**
 * Hồ sơ đăng ký bán hàng của tôi; `null` khi chưa gửi hồ sơ nào.
 *
 * Backend báo "chưa có hồ sơ" bằng lỗi MERCHANT_APPLICATION_NOT_FOUND, nhưng đó là trạng thái bình
 * thường nên đổi thành dữ liệu `null` thay vì để truy vấn ở trạng thái lỗi. Truy vấn lỗi mà chưa có
 * dữ liệu thì mỗi lần tải lại (vd. quay về app sau khi chọn ảnh) React Query xoá lỗi và chuyển về
 * "đang tải", làm form đăng ký bị gỡ ra rồi dựng lại: mất số giấy phép và ảnh vừa chọn.
 */
export function useMyMerchantApplication(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: MY_APPLICATION_KEY,
    queryFn: async (): Promise<MyMerchantApplicationDto | null> => {
      try {
        return await getMyMerchantApplication();
      } catch (error) {
        if (error instanceof ApiException && error.code === 'MERCHANT_APPLICATION_NOT_FOUND') {
          return null;
        }
        throw error;
      }
    },
    // Ảnh đang tải lên thì vài giây là xong; hồ sơ chờ duyệt thì xem lại mỗi phút để khách không
    // phải thoát ra vào lại mới biết kết quả.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'UPLOADING') return 5_000;
      if (status === 'PENDING') return 60_000;

      return false;
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
