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

/** Khoảng thời gian admin chọn ở trang Tổng quan. Mỗi kỳ là một cửa sổ tính lùi từ hôm nay. */
export type ReportPeriod = 'week' | 'month' | 'year';

// Số ngày của mỗi kỳ. Backend trả mảng `daily` theo đúng khoảng từ/đến nên không cần tham số khác.
const DAYS_BY_PERIOD: Record<ReportPeriod, number> = { week: 7, month: 30, year: 365 };

export const REPORT_PERIODS: { id: ReportPeriod; label: string }[] = [
  { id: 'week', label: 'Tuần' },
  { id: 'month', label: 'Tháng' },
  { id: 'year', label: 'Năm' },
];

const pad = (value: number) => value.toString().padStart(2, '0');

// Backend tính theo múi giờ Việt Nam và nhận yyyy-MM-dd; toISOString sẽ lệch ngày theo UTC.
const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function fetchReport(period: ReportPeriod) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (DAYS_BY_PERIOD[period] - 1));

  return apiRequest<SystemReportDto>(
    `/admin/reports/overview?from=${toIsoDate(from)}&to=${toIsoDate(to)}`,
  );
}

// Backend giới hạn 10 báo cáo/admin/phút nên không tự làm mới nền; chỉ tải lại khi admin kéo lại.
export function useSystemReport(period: ReportPeriod) {
  return useQuery({
    queryKey: ['admin', 'system-report', period],
    queryFn: () => fetchReport(period),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
