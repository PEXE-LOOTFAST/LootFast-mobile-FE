import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createOrderReview,
  getMyOrderReview,
  getStoreReviews,
  type CreateReviewPayload,
} from '@/features/review/api/reviews';
import { ApiException } from '@/lib/api-client';

const PAGE_SIZE = 5;

/** Danh sách đánh giá công khai của cửa hàng, tải thêm từng trang. */
export function useStoreReviews(merchantId: string | undefined) {
  return useInfiniteQuery({
    enabled: Boolean(merchantId),
    queryKey: ['reviews', 'store', merchantId],
    queryFn: ({ pageParam }) => getStoreReviews(merchantId as string, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.page + 1 < last.totalPages ? last.page + 1 : undefined),
  });
}

export function useMyOrderReview(orderId: string | undefined, enabled: boolean) {
  return useQuery({
    enabled: Boolean(orderId) && enabled,
    queryKey: ['reviews', 'order', orderId],
    queryFn: () => getMyOrderReview(orderId as string),
  });
}

export function useCreateReview(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createOrderReview(orderId, payload),
    onError: (error) => {
      // Đơn đã có đánh giá (gửi từ máy khác): tải lại để hiện đánh giá đó thay vì để nguyên form.
      if (error instanceof ApiException && error.code === 'REVIEW_ALREADY_EXISTS') {
        void queryClient.invalidateQueries({ queryKey: ['reviews', 'order', orderId] });
      }
    },
    onSuccess: (created) => {
      // Hiện ngay đánh giá vừa gửi, không chờ tải lại.
      queryClient.setQueryData(['reviews', 'order', orderId], created);
      void queryClient.invalidateQueries({ queryKey: ['reviews', 'store'] });
      // Điểm trung bình và số lượt đánh giá nằm trong chi tiết deal và hồ sơ cửa hàng.
      void queryClient.invalidateQueries({ queryKey: ['deal'] });
      void queryClient.invalidateQueries({ queryKey: ['store'] });
    },
  });
}
