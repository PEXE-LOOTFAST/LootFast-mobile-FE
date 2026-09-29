import { ApiException, apiRequest } from '@/lib/api-client';

export type PaymentMethod = 'BANK_TRANSFER' | 'CASH';

export type OrderResponse = {
  orderId: string;
  dealId: string;
  storeId: string;
  dealName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  pickupStart: string;
  pickupEnd: string;
  orderStatus: string;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  paymentReference: string | null;
  createdAt: string;
  finalizedAt: string | null;
};

export type CreateOrderRequest = {
  dealId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
};

export function createOrder(request: CreateOrderRequest, idempotencyKey: string) {
  return apiRequest<OrderResponse>('/orders', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: request,
  });
}

export function getOrder(orderId: string) {
  return apiRequest<OrderResponse>(`/orders/${orderId}`);
}

export function cancelOrder(orderId: string) {
  return apiRequest<OrderResponse>(`/orders/${orderId}/cancellation`, { method: 'POST' });
}

export function getOrderErrorMessage(error: unknown) {
  if (!(error instanceof ApiException)) {
    return 'Không thể kết nối máy chủ. Vui lòng thử lại.';
  }

  const messages: Record<string, string> = {
    OUT_OF_STOCK: 'Deal đã hết phần.',
    INSUFFICIENT_STOCK: 'Deal không còn đủ số lượng bạn muốn đặt.',
    RESOURCE_BUSY: 'Deal đang có người đặt. Vui lòng thử lại sau ít giây.',
    PICKUP_CUTOFF: 'Đã quá thời hạn đặt giữ trước giờ nhận món.',
    ORDER_CUTOFF_REACHED: 'Đã quá thời hạn đặt giữ trước giờ nhận món.',
    RESERVED_QUANTITY_LIMIT: 'Bạn đã đạt giới hạn 5 phần chưa nhận của deal này.',
    RESERVED_ORDER_LIMIT: 'Bạn đã đạt giới hạn 3 đơn đang giữ.',
    ORDER_NOT_CANCELLABLE: 'Đơn này không còn được phép hủy.',
    ORDER_CANCEL_WINDOW_CLOSED: 'Đã quá hạn hủy đơn. Chỉ được hủy trước giờ nhận 30 phút.',
    ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng.',
    BANK_ACCOUNT_NOT_FOUND: 'Cửa hàng chưa cấu hình nhận chuyển khoản. Hãy chọn tiền mặt.',
    VALIDATION_FAILED: 'Thông tin đặt giữ chưa hợp lệ.',
  };

  return messages[error.code] ?? 'Không thể xử lý đơn hàng. Vui lòng thử lại.';
}
