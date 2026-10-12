import { ApiException, apiRequest } from '@/lib/api-client';
import type { PagedResponse } from '@/types/api';

/** Khớp PublicReview của backend. */
export type ReviewDto = {
  reviewId: string;
  merchantId: string;
  /** Tên (first name) của người đánh giá. */
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  merchantReply: string | null;
  repliedAt: string | null;
};

/** Khớp ManagedReview của backend: đánh giá của chính buyer cho một đơn. */
export type ManagedReviewDto = {
  review: ReviewDto;
  orderId: string;
  hidden: boolean;
};

export type CreateReviewPayload = {
  /** 1–5 sao. */
  rating: number;
  /** Tối đa 1000 ký tự, có thể bỏ trống. */
  comment?: string;
};

export const REVIEW_COMMENT_MAX_LENGTH = 1000;

/** Backend không cho chủ quán đánh giá chính quán của mình (kể cả khi tự đặt món ở quán đó). */
export const OWN_STORE_MESSAGE = 'Bạn không thể đánh giá quán của chính mình.';

export function getStoreReviews(merchantId: string, page: number, size = 10) {
  const query = new URLSearchParams({ page: String(page), size: String(size) });

  return apiRequest<PagedResponse<ReviewDto>>(`/stores/${merchantId}/reviews?${query.toString()}`);
}

/** Đánh giá của chính mình cho đơn; null nếu chưa đánh giá (backend trả 404 REVIEW_NOT_FOUND). */
export async function getMyOrderReview(orderId: string): Promise<ManagedReviewDto | null> {
  try {
    return await apiRequest<ManagedReviewDto>(`/orders/${orderId}/review`);
  } catch (error) {
    if (error instanceof ApiException && error.code === 'REVIEW_NOT_FOUND') return null;
    throw error;
  }
}

export function createOrderReview(orderId: string, payload: CreateReviewPayload) {
  return apiRequest<ManagedReviewDto>(`/orders/${orderId}/review`, {
    method: 'POST',
    body: payload,
  });
}

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang tiếng Việt ở đây.
const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn này.',
  REVIEW_NOT_ALLOWED: 'Không đánh giá được đơn này.',
  REVIEW_ALREADY_EXISTS: 'Bạn đã đánh giá đơn này rồi.',
  VALIDATION_FAILED: 'Đánh giá chưa hợp lệ. Chọn từ 1 đến 5 sao và nhận xét tối đa 1000 ký tự.',
  MERCHANT_PROFILE_NOT_FOUND: 'Cửa hàng không còn tồn tại.',
};

export function toReviewErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    // Backend dùng chung một mã REVIEW_NOT_ALLOWED cho hai lý do khác nhau; chỉ message mới phân
    // biệt được, nên đọc nó để báo đúng lý do thay vì luôn nói "đơn chưa hoàn tất".
    if (error.code === 'REVIEW_NOT_ALLOWED') {
      const reason = error.message.toLowerCase();
      if (reason.includes('own store')) return OWN_STORE_MESSAGE;
      if (reason.includes('completed')) return 'Chỉ đơn đã hoàn tất mới đánh giá được.';
    }

    return MESSAGES[error.code] ?? 'Không thực hiện được. Vui lòng thử lại.';
  }

  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
