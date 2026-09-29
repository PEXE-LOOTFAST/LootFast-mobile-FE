import type { AppNotification } from '@/features/home/types';

// Thông báo mẫu cho tới khi có API. Nội dung bám theo quán và deal có thật trong kho dữ liệu
// demo (`@/demo/world`) để người xem demo không thấy tên lạ so với những gì đang hiển thị.
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Sắp hết hạn lấy hàng',
    body: 'Đơn cơm tấm sườn bì chả của Cơm Tấm Cô Ba còn 15 phút — hãy đến lấy trước 21:00.',
    timeLabel: '5 phút trước',
    isRead: false,
  },
  {
    id: 'n2',
    title: 'Deal mới gần bạn',
    body: 'Combo bánh mì cuối ngày của Lò Bánh Mì Hòa Mã giảm 50% — cách bạn 0.8km.',
    timeLabel: '1 giờ trước',
    isRead: false,
  },
  {
    id: 'n3',
    title: 'Ưu đãi sắp hết suất',
    body: 'Phở bò tái nạm của Phở Gia Truyền 24 chỉ còn 1 suất cuối ngày.',
    timeLabel: '2 giờ trước',
    isRead: false,
  },
  {
    id: 'n4',
    title: 'Đơn đã sẵn sàng',
    body: 'Cơm Tấm Cô Ba đã chuẩn bị xong đơn combo canh chua cá kho tộ của bạn.',
    timeLabel: '3 giờ trước',
    isRead: true,
  },
  {
    id: 'n5',
    title: 'Gợi ý Cao cấp',
    body: 'Mở khóa gợi ý deal AI cá nhân hóa theo khẩu vị và vị trí của bạn.',
    timeLabel: 'Hôm qua',
    isRead: true,
  },
  {
    id: 'n6',
    title: 'Đánh giá đơn hàng',
    body: 'Bạn thấy túi bánh ngọt của The Daily Bakery thế nào? Chia sẻ đánh giá nhé.',
    timeLabel: 'Hôm qua',
    isRead: true,
  },
];
