import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  approveMerchantApplication,
  createLicenseDownloadUrl,
  listMerchantApplications,
  rejectMerchantApplication,
  type ReviewableApplicationStatus,
} from '@/features/admin/api/merchant-applications';

const QUERY_KEY = ['admin', 'merchant-applications'];

function applicationsKey(status: ReviewableApplicationStatus) {
  return [...QUERY_KEY, status];
}

/** Hàng chờ duyệt theo từng trạng thái. */
export function useMerchantApplications(status: ReviewableApplicationStatus) {
  return useQuery({
    queryKey: applicationsKey(status),
    queryFn: () => listMerchantApplications({ status, size: 50 }),
  });
}

/**
 * Duyệt hoặc từ chối đều làm hồ sơ rời hàng chờ và rơi vào một tab khác, nên làm mới cả ba
 * tab thay vì chỉ tab đang xem.
 */
function useReviewMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useApproveApplication() {
  return useReviewMutation((applicationId: string) => approveMerchantApplication(applicationId));
}

export function useRejectApplication() {
  return useReviewMutation(({ applicationId, reason }: { applicationId: string; reason: string }) =>
    rejectMerchantApplication(applicationId, reason),
  );
}

/**
 * Link xem giấy phép chỉ sống 5 phút nên xin mới mỗi lần bấm, không cache bằng useQuery.
 */
export function useLicenseDownloadUrl() {
  return useMutation({
    mutationFn: (applicationId: string) => createLicenseDownloadUrl(applicationId),
  });
}
