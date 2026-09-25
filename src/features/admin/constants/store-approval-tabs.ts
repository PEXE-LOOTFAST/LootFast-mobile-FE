import type { StoreApplicationStatus } from '@/features/admin/types';

export const STORE_APPROVAL_TABS: { id: StoreApplicationStatus; label: string }[] = [
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'approved', label: 'Đã duyệt' },
  { id: 'rejected', label: 'Từ chối' },
];
