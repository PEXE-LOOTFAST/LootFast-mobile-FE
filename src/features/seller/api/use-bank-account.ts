import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getBankAccount,
  updateBankAccount,
  type MerchantBankAccountDto,
  type UpdateBankAccountPayload,
} from '@/features/seller/api/bank-account';
import { ApiException } from '@/lib/api-client';

const BANK_ACCOUNT_KEY = ['merchant', 'bank-account'];

/**
 * Tài khoản nhận tiền của quán; `null` khi quán chưa thiết lập.
 *
 * Backend báo "chưa thiết lập" bằng lỗi BANK_ACCOUNT_NOT_FOUND, nhưng đó là trạng thái bình thường
 * nên đổi thành dữ liệu `null`. Để ở trạng thái lỗi thì mỗi lần tải lại (vd. người bán mở app ngân
 * hàng chép số tài khoản rồi quay lại) React Query đưa truy vấn về "đang tải" và form đang điền bị
 * gỡ ra dựng lại từ đầu.
 */
export function useBankAccount() {
  return useQuery({
    queryKey: BANK_ACCOUNT_KEY,
    queryFn: async (): Promise<MerchantBankAccountDto | null> => {
      try {
        return await getBankAccount();
      } catch (error) {
        if (error instanceof ApiException && error.code === 'BANK_ACCOUNT_NOT_FOUND') return null;
        throw error;
      }
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBankAccountPayload) => updateBankAccount(payload),
    onSuccess: (data) => queryClient.setQueryData(BANK_ACCOUNT_KEY, data),
  });
}
