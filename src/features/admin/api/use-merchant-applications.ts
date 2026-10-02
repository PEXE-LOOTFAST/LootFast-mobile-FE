import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  approveMerchantApplication,
  createLicenseDownloadUrl,
  listMerchantApplications,
  rejectMerchantApplication,
  type ListedApplicationStatus,
} from '@/features/admin/api/merchant-applications';

const QUERY_KEY = ['admin', 'merchant-applications'];

/** Backend chặn size ở 50 (@Max(50)), nên muốn xem tiếp phải sang trang chứ không nới số này. */
const PAGE_SIZE = 20;

function applicationsKey(status: ListedApplicationStatus) {
  return [...QUERY_KEY, status];
}

/**
 * Hàng chờ duyệt theo từng trạng thái, tải dần theo trang. Trước đây màn gọi cứng size 50 nên
 * hồ sơ thứ 51 trở đi không bao giờ hiện ra.
 */
export function useMerchantApplications(status: ListedApplicationStatus) {
  return useInfiniteQuery({
    queryKey: applicationsKey(status),
    queryFn: ({ pageParam }) =>
      listMerchantApplications({ status, page: pageParam, size: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

/**
 * Duyệt hoặc từ chối đều làm hồ sơ rời hàng chờ và rơi vào một tab khác, nên làm mới cả bốn
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
