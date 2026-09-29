import { useMemo } from 'react';

import { setStoreApproval } from '@/demo/store';
import { useAdminDemo } from '@/demo/use-demo';
import type { StoreApplication, StoreApplicationStatus } from '@/features/admin/types';

/**
 * Hàng chờ duyệt quán. Duyệt hoặc từ chối ghi thẳng vào kho dữ liệu demo dùng chung, nên
 * quán vừa duyệt xuất hiện luôn ở danh sách Quản lý và deal của quán lên sàn người mua.
 * "Hoàn tác" đưa hồ sơ về lại hàng chờ để admin xét lại.
 */
export function useStoreApprovals() {
  const { applications } = useAdminDemo();

  const grouped = useMemo(() => {
    const groups: Record<StoreApplicationStatus, StoreApplication[]> = {
      pending: [],
      approved: [],
      rejected: [],
    };
    for (const application of applications) groups[application.status].push(application);
    // Hồ sơ gửi sớm nhất lên đầu để không bị bỏ quên dưới đáy danh sách.
    groups.pending.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

    return groups;
  }, [applications]);

  return {
    grouped,
    approve: (id: string) => setStoreApproval(id, 'approved'),
    reject: (id: string) => setStoreApproval(id, 'rejected'),
    undo: (id: string) => setStoreApproval(id, 'pending'),
  };
}
