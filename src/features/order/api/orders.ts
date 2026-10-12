import { ApiException, apiRequest } from '@/lib/api-client';
import { createIdempotencyKey } from '@/lib/idempotency';

export type OrderStatusDto =
  'RESERVED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'MERCHANT_CANCELLED';

export type OrderListStatusDto = 'RESERVED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type PaymentMethodDto = 'BANK_TRANSFER' | 'CASH';

export type PaymentStatusDto = 'UNPAID' | 'CONFIRMED' | 'REVIEW_REQUIRED';

/** Khớp OrderResponse của backend. */
export type OrderDto = {
  orderId: string;
  dealId: string;
  storeId: string;
  dealName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  /** Khung giờ của deal. */
  pickupStart: string;
  pickupEnd: string;
  /** Khoảng giờ khách đã hẹn đến lấy, nằm trong khung của deal. */
  pickupFrom: string;
  pickupTo: string;
  orderStatus: OrderStatusDto;
  paymentMethod: PaymentMethodDto;
  paymentStatus: PaymentStatusDto;
  paymentReference: string | null;
  pickupCode: string | null;
  pickupQrPayload: string | null;
  createdAt: string;
  finalizedAt: string | null;
};

export type CreateOrderPayload = {
  dealId: string;
  /** Backend giới hạn 1–5 suất mỗi đơn. */
  quantity: number;
  paymentMethod: PaymentMethodDto;
  /** Khoảng giờ khách hẹn đến lấy; bắt buộc và phải nằm trong khung giờ của deal. */
  pickupFrom: string;
  pickupTo: string;
};

export type PagedOrdersDto = {
  items: OrderDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export function createOrder(payload: CreateOrderPayload) {
  return apiRequest<OrderDto>('/orders', {
    method: 'POST',
    body: payload,
    headers: { 'Idempotency-Key': createIdempotencyKey() },
  });
}

export function getOrder(orderId: string) {
  return apiRequest<OrderDto>(`/orders/${orderId}`);
}

export function getOrders(status: OrderListStatusDto, page: number, size = 10) {
  const query = new URLSearchParams({
    status,
    page: String(page),
    size: String(size),
  });

  return apiRequest<PagedOrdersDto>(`/orders?${query.toString()}`);
}

export function cancelOrder(orderId: string) {
  return apiRequest<OrderDto>(`/orders/${orderId}/cancellation`, { method: 'POST' });
}

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang tiếng Việt ở đây.
const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  DEAL_NOT_FOUND: 'Deal không còn tồn tại.',
  DEAL_NOT_RESERVABLE: 'Deal này hiện không nhận đặt giữ.',
  INSUFFICIENT_STOCK: 'Deal đã hết suất. Thử lại với deal khác nhé.',
  ORDER_PICKUP_TIME_INVALID: 'Giờ đến lấy không hợp lệ. Chọn lại một khung giờ của deal.',
  RESERVED_ORDER_LIMIT: 'Bạn đang giữ quá nhiều đơn. Hoàn tất bớt rồi đặt tiếp.',
  RESERVED_QUANTITY_LIMIT: 'Vượt quá số suất được giữ cùng lúc.',
  IDEMPOTENCY_CONFLICT: 'Đơn đang được xử lý. Chờ một chút rồi thử lại.',
  IDEMPOTENCY_KEY_EXPIRED: 'Yêu cầu đã hết hạn. Vui lòng đặt lại.',
  RESOURCE_BUSY: 'Deal đang có nhiều người đặt. Thử lại sau giây lát.',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn này.',
  ORDER_NOT_CANCELLABLE: 'Đơn này không huỷ được nữa.',
  ORDER_CANCEL_WINDOW_CLOSED: 'Đã quá hạn huỷ — chỉ huỷ được trước giờ hẹn lấy 30 phút.',
};

export function toOrderErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return MESSAGES[error.code] ?? 'Thao tác không thành công. Vui lòng thử lại.';
  }

  // Không phải lỗi từ backend: mất mạng, sai EXPO_PUBLIC_API_URL, server chưa chạy...
  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
