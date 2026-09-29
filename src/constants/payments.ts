/**
 * Các cách thanh toán một đơn đặt giữ. Ví điện tử trả trước để giữ chỗ chắc chắn, còn
 * 'cash' là trả trực tiếp khi tới quán nhận món.
 */
export type PaymentMethod = 'momo' | 'zalopay' | 'vnpay' | 'cash';

export type PaymentOption = {
  id: PaymentMethod;
  /** Nhãn đầy đủ, dùng ở thẻ đơn hàng và nút thanh toán. */
  label: string;
  /** Nhãn ngắn in trong ô chọn — ví điện tử chỉ cần tên thương hiệu. */
  shortLabel: string;
  /** Chữ cái in trong ô vuông thương hiệu, thay cho logo thật chưa có bản quyền. */
  initial: string;
  /** Màu thương hiệu, giữ nguyên ở cả light lẫn dark mode để khách nhận ra ngay. */
  brandColor: string;
  /** Ví điện tử thu tiền ngay; trả tại quán thì chỉ giữ chỗ. */
  isPrepaid: boolean;
  note: string;
};

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'momo',
    label: 'MoMo',
    shortLabel: 'MoMo',
    initial: 'M',
    brandColor: '#A50064',
    isPrepaid: true,
    note: 'Giữ chỗ 15 phút. Hết giờ chưa nhận món sẽ tự huỷ.',
  },
  {
    id: 'zalopay',
    label: 'ZaloPay',
    shortLabel: 'ZaloPay',
    initial: 'Z',
    brandColor: '#0068FF',
    isPrepaid: true,
    note: 'Giữ chỗ 15 phút. Hết giờ chưa nhận món sẽ tự huỷ.',
  },
  {
    id: 'vnpay',
    label: 'VNPay',
    shortLabel: 'VNPay',
    initial: 'V',
    brandColor: '#E11B22',
    isPrepaid: true,
    note: 'Giữ chỗ 15 phút. Hết giờ chưa nhận món sẽ tự huỷ.',
  },
  {
    id: 'cash',
    label: 'Trả trực tiếp tại quán',
    shortLabel: 'Tại quán',
    initial: 'Đ',
    brandColor: '#16794B',
    isPrepaid: false,
    note: 'Trả tiền mặt khi tới nhận món. Quán giữ suất tới hết giờ lấy.',
  },
];

export function getPaymentOption(method: PaymentMethod): PaymentOption {
  const option = PAYMENT_OPTIONS.find((item) => item.id === method);
  if (!option) throw new Error(`Không có cách thanh toán ${method}`);

  return option;
}
