import type { OrderDto, PaymentMethodDto } from '@/features/order/api/orders';
import { ApiException, apiRequest } from '@/lib/api-client';

/** Khớp PaymentInstructions của backend. `bank` luôn có để khách còn chuyển khoản tay được. */
export type PaymentInstructionsDto = {
  method: PaymentMethodDto;
  state: string;
  amount: number;
  reference: string | null;
  bank: {
    bankBin: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  } | null;
  qrImageUrl: string | null;
  message: string | null;
};

export function getPaymentInstructions(orderId: string) {
  return apiRequest<PaymentInstructionsDto>(`/orders/${orderId}/payment-instructions`);
}

export function changePaymentMethod(orderId: string, paymentMethod: PaymentMethodDto) {
  return apiRequest<OrderDto>(`/orders/${orderId}/payment-method`, {
    method: 'PUT',
    body: { paymentMethod },
  });
}

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang tiếng Việt ở đây.
const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn này.',
  BANK_ACCOUNT_NOT_FOUND:
    'Quán chưa thêm tài khoản ngân hàng nên chưa nhận chuyển khoản. Bạn trả tiền mặt khi đến lấy món nhé.',
  PAYMENT_NOT_CONFIGURED: 'Quán chưa thiết lập tài khoản nhận tiền.',
  PAYMENT_STATE_CONFLICT: 'Đơn đã thanh toán nên không đổi phương thức được nữa.',
  INVALID_PAYMENT_AMOUNT: 'Số tiền của đơn không hợp lệ.',
  PAYMENT_RETRY_LATER: 'Hệ thống thanh toán đang bận. Thử lại sau giây lát.',
};

export function toPaymentErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return MESSAGES[error.code] ?? 'Thao tác không thành công. Vui lòng thử lại.';
  }

  // Không phải lỗi từ backend: mất mạng, sai EXPO_PUBLIC_API_URL, server chưa chạy...
  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
