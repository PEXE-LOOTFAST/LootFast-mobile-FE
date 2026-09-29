import type { DealReview } from '@/features/home/types';

// Đánh giá mẫu cho tới khi có API đánh giá. Key là id deal trong kho dữ liệu demo.
const DEAL_REVIEWS: Record<string, DealReview[]> = {
  'deal-com-tam': [
    {
      id: 'r1',
      author: 'Minh Anh',
      rating: 5,
      comment: 'Cơm còn nóng, phần sườn mềm và giá deal rất hợp lý.',
    },
    {
      id: 'r2',
      author: 'Quốc Bảo',
      rating: 5,
      comment: 'Nhận món nhanh, khẩu phần đầy đặn hơn mình mong đợi.',
    },
    {
      id: 'r3',
      author: 'Lan Chi',
      rating: 4,
      comment: 'Món ngon và đóng gói sạch sẽ, sẽ quay lại mua tiếp.',
    },
  ],
  'deal-canh-chua': [
    {
      id: 'r14',
      author: 'Thu Trang',
      rating: 5,
      comment: 'Canh chua đậm vị, cá kho mặn ngọt vừa ăn, hai người ăn thoải mái.',
    },
    {
      id: 'r15',
      author: 'Trọng Nhân',
      rating: 4,
      comment: 'Phần ăn nhiều, hộp đựng chắc nên mang về không bị đổ.',
    },
  ],
  'deal-pho-bo': [
    {
      id: 'r4',
      author: 'Hoàng Nam',
      rating: 5,
      comment: 'Nước dùng đậm đà, thịt bò nhiều, deal quá hời.',
    },
    {
      id: 'r5',
      author: 'Thu Trang',
      rating: 5,
      comment: 'Đến lấy đúng giờ là có ngay, phở vẫn còn nóng.',
    },
  ],
  'deal-banh-mi': [
    {
      id: 'r6',
      author: 'Gia Huy',
      rating: 5,
      comment: 'Bánh mì giòn, combo nhiều loại, để sáng hôm sau vẫn ngon.',
    },
    { id: 'r7', author: 'Ngọc Hân', rating: 4, comment: 'Giá rẻ bất ngờ, chỉ tiếc là hết nhanh.' },
  ],
  'deal-bakery': [
    {
      id: 'r8',
      author: 'Bảo Ngọc',
      rating: 5,
      comment: 'Túi bánh có cả croissant và su kem, rất đáng tiền.',
    },
    {
      id: 'r9',
      author: 'Đức Anh',
      rating: 4,
      comment: 'Bánh ngon, nên hâm lại một chút trước khi ăn.',
    },
  ],
  'deal-tra-trai-cay': [
    {
      id: 'r10',
      author: 'Khánh Linh',
      rating: 4,
      comment: 'Trà thơm, nhiều trái cây, uống rất mát.',
    },
    {
      id: 'r11',
      author: 'Tuấn Kiệt',
      rating: 5,
      comment: 'Quán đóng gói kỹ, mang đi xa không bị đổ.',
    },
  ],
  'deal-salad-chay': [
    { id: 'r12', author: 'Mai Phương', rating: 4, comment: 'Rau tươi, sốt mè rang vừa miệng.' },
    {
      id: 'r13',
      author: 'Thanh Tùng',
      rating: 5,
      comment: 'Lựa chọn healthy mà giá chỉ hơn nửa bình thường.',
    },
  ],
};

export function getDealReviews(dealId: string): DealReview[] {
  return DEAL_REVIEWS[dealId] ?? [];
}
