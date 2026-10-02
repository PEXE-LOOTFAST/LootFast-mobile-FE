import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getBankAccount,
  updateBankAccount,
  type UpdateBankAccountPayload,
} from '@/features/seller/api/bank-account';
import { ApiException } from '@/lib/api-client';

const BANK_ACCOUNT_KEY = ['merchant', 'bank-account'];

/**
 * Quán chưa thiết lập tài khoản nhận tiền thì backend trả BANK_ACCOUNT_NOT_FOUND — đó là
 * trạng thái bình thường chứ không phải lỗi, nên không retry và form hiện các ô trống.
 */
export function useBankAccount() {
  return useQuery({
    queryKey: BANK_ACCOUNT_KEY,
    queryFn: getBankAccount,
    retry: (failureCount, error) => {
      if (error instanceof ApiException && error.code === 'BANK_ACCOUNT_NOT_FOUND') return false;

      return failureCount < 1;
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
