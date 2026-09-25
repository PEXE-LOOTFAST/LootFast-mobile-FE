import { AdminPlaceholderScreen } from '@/features/admin/components/admin-placeholder-screen';
import { AdminIcons } from '@/features/admin/constants/icons';

export default function AdminManageRoute() {
  return (
    <AdminPlaceholderScreen
      description="Quản lý tài khoản người mua, người bán và các quán đang hoạt động."
      icon={AdminIcons.people}
      title="Quản lý"
    />
  );
}
