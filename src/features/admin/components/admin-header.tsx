import { TabHeader } from '@/components/ui/tab-header';
import { formatFullDate } from '@/lib/format';

type AdminHeaderProps = {
  /** Tên tab đang mở, để admin biết mình đang ở đâu thay vì chỉ thấy "LootFast Admin". */
  title: string;
  date: Date;
};

// Cùng header với khu người mua và người bán, thêm nhãn "Quản trị" để admin luôn biết mình đang ở
// khu vực có quyền cao. Không có chuông thông báo: backend chưa gửi thông báo nào cho admin, một
// nút bấm vào chỉ để báo "sắp có" là ngõ cụt.
export function AdminHeader({ title, date }: AdminHeaderProps) {
  return <TabHeader subtitle={formatFullDate(date)} title={title} variant="admin" />;
}
