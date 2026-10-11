import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';

/** Khớp SystemReportResponse của backend (GET /admin/reports/overview), chỉ giữ trường màn dùng. */
export type SystemReportDto = {
  accounts: { totalAccounts: number; lockedAccounts: number; newAccounts: number };
  stores: { totalStores: number; approvedStores: number; pendingApplications: number };
  completedOrders: number;
  completedTransactionValue: number;
  daily: { date: string; discountedPortions: number }[];
};

export const REPORT_DAYS = 7;

const pad = (value: number) => value.toString().padStart(2, '0');

// Backend tính theo múi giờ Việt Nam và nhận yyyy-MM-dd; toISOString sẽ lệch ngày theo UTC.
const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function fetchReport() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (REPORT_DAYS - 1));

  return apiRequest<SystemReportDto>(
    `/admin/reports/overview?from=${toIsoDate(from)}&to=${toIsoDate(to)}`,
  );
}

// Backend giới hạn 10 báo cáo/admin/phút nên không tự làm mới nền; chỉ tải lại khi admin kéo lại.
export function useSystemReport() {
  return useQuery({
    queryKey: ['admin', 'system-report'],
    queryFn: fetchReport,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
