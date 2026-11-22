import type {
  OrderStatusDto,
  PaymentMethodDto,
  PaymentStatusDto,
} from '@/features/order/api/orders';
import { ApiException, apiRequest } from '@/lib/api-client';
import type { PagedResponse } from '@/types/api';

/** Khớp MerchantOrderResponse của backend. Không có tên khách hay mã lấy hàng: backend không trả. */
export type MerchantOrderDto = {
  orderId: string;
  dealName: string;
  quantity: number;
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
  paymentReportedAt: string | null;
  paymentConfirmedAt: string | null;
  createdAt: string;
  finalizedAt: string | null;
};

const BASE_PATH = '/merchants/me/orders';

/** Backend chỉ nhận tối đa 100 đơn mỗi trang; một ngày của một quán hiếm khi vượt mức này. */
export const MERCHANT_ORDERS_PAGE_SIZE = 100;

/** Mã lấy hàng dạng `LF-` + 6 ký tự chữ hoa hoặc số; người bán chỉ gõ phần 6 ký tự. */
export const PICKUP_CODE_PREFIX = 'LF-';

export function listMerchantOrders(pickupFrom: Date, pickupTo: Date) {
  const params = new URLSearchParams({
    pickupFrom: pickupFrom.toISOString(),
    pickupTo: pickupTo.toISOString(),
    size: String(MERCHANT_ORDERS_PAGE_SIZE),
  });

  return apiRequest<PagedResponse<MerchantOrderDto>>(`${BASE_PATH}?${params.toString()}`);
}

export function confirmMerchantPickup(credential: string) {
  return apiRequest<MerchantOrderDto>(`${BASE_PATH}/pickup-confirmations`, {
    method: 'POST',
    body: { credential },
  });
}

export function confirmMerchantPayment(orderId: string) {
  return apiRequest<MerchantOrderDto>(`${BASE_PATH}/${orderId}/payment-confirmation`, {
    method: 'POST',
  });
}

export function rejectMerchantPayment(orderId: string, reason: string) {
  return apiRequest<MerchantOrderDto>(`${BASE_PATH}/${orderId}/payment-rejection`, {
    method: 'POST',
    body: { reason },
  });
}

/** "dd/mm/yyyy" → khoảng [00:00 ngày đó, 00:00 ngày kế) theo giờ máy; null nếu ngày không hợp lệ. */
export function parseDayRange(text: string): { from: Date; to: Date } | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;

  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const from = new Date(year, month - 1, day);
  // new Date tự "tràn" ngày 31/02 sang tháng sau nên phải so lại để loại ngày không có thật.
  if (from.getFullYear() !== year || from.getMonth() !== month - 1 || from.getDate() !== day) {
    return null;
  }

  return { from, to: new Date(year, month - 1, day + 1) };
}

const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ACCESS_DENIED: 'Tài khoản chưa được cấp quyền Người bán.',
  MERCHANT_PROFILE_NOT_FOUND: 'Chưa có hồ sơ quán nên chưa có đơn nào.',
  INVALID_PICKUP_WINDOW: 'Ngày xem đơn không hợp lệ.',
  INVALID_PICKUP_CREDENTIAL: 'Mã lấy hàng không đúng định dạng. Mã gồm LF- và 6 ký tự.',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn ứng với mã này ở quán của bạn.',
  ORDER_NOT_COMPLETABLE: 'Đơn này đã được xử lý rồi, không xác nhận thêm được.',
  PAYMENT_STATE_CONFLICT:
    'Đơn chuyển khoản cần xác nhận đã nhận tiền trước khi khách nhận món. Kiểm tra trạng thái thanh toán của đơn.',
  VALIDATION_FAILED: 'Thông tin gửi lên chưa hợp lệ. Kiểm tra lại rồi thử lại.',
  PICKUP_CONFIRMATION_RATE_LIMITED: 'Bạn nhập mã quá nhiều lần. Đợi một lát rồi thử lại.',
  PICKUP_CONFIRMATION_UNAVAILABLE: 'Chưa xác nhận được lúc này. Thử lại sau giây lát.',
  PAYMENT_RETRY_LATER: 'Hệ thống thanh toán đang bận. Thử lại sau giây lát.',
};

export function toMerchantOrderErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return MESSAGES[error.code] ?? 'Thao tác không thành công. Vui lòng thử lại.';
  }

  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
