import { useMemo, useState } from 'react';

import type { StoreApplication, StoreApplicationStatus } from '@/features/admin/types';

// Giữ trạng thái duyệt ngay trên máy cho tới khi có API: phê duyệt / từ chối chỉ đổi status,
// "Hoàn tác" đưa hồ sơ về lại hàng chờ để admin xét lại.
export function useStoreApprovals(initial: StoreApplication[]) {
  const [applications, setApplications] = useState(initial);

  const setStatusOf = (id: string, status: StoreApplicationStatus) =>
    setApplications((current) =>
      current.map((application) =>
        application.id === id ? { ...application, status } : application,
      ),
    );

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
    approve: (id: string) => setStatusOf(id, 'approved'),
    reject: (id: string) => setStatusOf(id, 'rejected'),
    undo: (id: string) => setStatusOf(id, 'pending'),
  };
}
