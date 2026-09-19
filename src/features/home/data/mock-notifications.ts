import type { AppNotification } from '@/features/home/types';

// Dữ liệu mẫu cho tới khi có API thông báo.
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Sắp hết hạn lấy hàng',
    body: 'Đơn bún bò Huế còn 15 phút — hãy đến lấy trước 19:30.',
    timeLabel: '5 phút trước',
    isRead: false,
  },
  {
    id: 'n2',
    title: 'Deal mới gần bạn',
    body: 'Cơm tấm sườn giảm 45% — cách bạn 0.8km.',
    timeLabel: '1 giờ trước',
    isRead: false,
  },
  {
    id: 'n3',
    title: 'Ưu đãi sắp hết suất',
    body: 'Bánh mì thịt nướng còn 2 suất cuối ngày.',
    timeLabel: '2 giờ trước',
    isRead: false,
  },
  {
    id: 'n4',
    title: 'Đơn đã sẵn sàng',
    body: 'Quán Phở Hà Nội đã chuẩn bị xong đơn combo phở bò tái của bạn.',
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
