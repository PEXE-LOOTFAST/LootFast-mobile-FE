import type { ManagedAccount } from '@/features/admin/types';

// Dữ liệu mẫu cho trang Quản lý cho tới khi có API tài khoản.
export const MOCK_MANAGED_ACCOUNTS: ManagedAccount[] = [
  { id: 'store-1', kind: 'store', name: 'Cơm Tấm Sài Gòn 24h', detail: 'Q.10', status: 'active' },
  { id: 'store-2', kind: 'store', name: 'Trà Sữa Mây Nhỏ', detail: 'Phú Nhuận', status: 'locked' },
  { id: 'store-3', kind: 'store', name: 'Bún Đậu Cô Tư', detail: 'Q.7', status: 'active' },
  { id: 'user-1', kind: 'user', name: 'Nguyễn Hoài An', detail: '24 deal', status: 'active' },
  { id: 'user-2', kind: 'user', name: 'Lý Gia Bảo', detail: '8 deal', status: 'locked' },
  { id: 'user-3', kind: 'user', name: 'Phạm Mỹ Duyên', detail: '61 deal', status: 'active' },
];
