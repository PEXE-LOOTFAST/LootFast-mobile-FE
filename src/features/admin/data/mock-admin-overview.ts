import type { AdminAlert, AdminStat, DailyDealApproval } from '@/features/admin/types';

// Dữ liệu mẫu cho trang Tổng quan cho tới khi có API thống kê toàn sàn.
export const MOCK_ADMIN_STATS: AdminStat[] = [
  {
    id: 'stores',
    label: 'Quán hoạt động',
    value: '128',
    caption: '+4 tuần này',
    icon: 'store',
    tone: 'primary',
  },
  {
    id: 'users',
    label: 'Người dùng',
    value: '3.420',
    caption: '+186 tháng này',
    icon: 'people',
    tone: 'primary',
  },
  {
    id: 'rescued',
    label: 'Deal đã cứu',
    value: '8.910',
    caption: 'suất',
    icon: 'food',
    tone: 'primary',
  },
  {
    id: 'revenue',
    label: 'Doanh thu sàn',
    value: '45.2M',
    caption: 'VNĐ',
    icon: 'wallet',
    tone: 'accent',
  },
];

export const MOCK_DEAL_APPROVALS: DailyDealApproval[] = [
  { key: 'mon', label: 'T2', count: 42 },
  { key: 'tue', label: 'T3', count: 58 },
  { key: 'wed', label: 'T4', count: 35 },
  { key: 'thu', label: 'T5', count: 64 },
  { key: 'fri', label: 'T6', count: 71 },
  { key: 'sat', label: 'T7', count: 88 },
  { key: 'sun', label: 'CN', count: 76 },
];

/** Mức tăng so với tuần trước, tính theo phần trăm. */
export const MOCK_DEAL_APPROVAL_GROWTH = 12;

export const MOCK_ADMIN_ALERTS: AdminAlert[] = [
  {
    id: 'alert-1',
    kind: 'warning',
    message: '3 quán quá hạn nộp giấy ATTP',
    timeLabel: '10 phút trước',
  },
  {
    id: 'alert-2',
    kind: 'info',
    message: 'Bếp Chay An Nhiên vừa gửi hồ sơ mới',
    timeLabel: '1 giờ trước',
  },
  {
    id: 'alert-3',
    kind: 'info',
    message: 'Doanh thu hôm nay vượt mốc 2 triệu',
    timeLabel: '3 giờ trước',
  },
];
