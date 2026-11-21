import { EmptyCard } from '@/components/ui/empty-card';

/**
 * Màn đã dựng xong giao diện nhưng backend chưa có endpoint tương ứng. Không bịa dữ liệu mẫu và
 * không nói chữ kỹ thuật với người dùng: chỉ báo phần này sắp có. Nối API xong thì thay thẻ này.
 */
export function ApiPendingCard({ feature }: { feature: string }) {
  return (
    <EmptyCard
      description={`${feature} sẽ có trong bản cập nhật tới. Hiện bạn chưa cần làm gì ở đây.`}
      title="Sắp ra mắt"
    />
  );
}
