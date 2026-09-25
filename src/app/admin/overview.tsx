import { AdminPlaceholderScreen } from '@/features/admin/components/admin-placeholder-screen';
import { AdminIcons } from '@/features/admin/constants/icons';

export default function AdminOverviewRoute() {
  return (
    <AdminPlaceholderScreen
      description="Số quán, số đơn và doanh thu toàn hệ thống sẽ hiển thị tại đây."
      icon={AdminIcons.chart}
      title="Tổng quan hệ thống"
    />
  );
}
