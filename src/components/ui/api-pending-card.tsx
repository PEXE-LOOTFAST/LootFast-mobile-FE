import { EmptyCard } from '@/components/ui/empty-card';

/**
 * Màn đã dựng xong giao diện nhưng backend chưa có endpoint tương ứng. Thay vì bịa dữ liệu
 * mẫu, màn nói thẳng là đang chờ API — nối xong chỉ việc thay thẻ này bằng dữ liệu thật.
 */
export function ApiPendingCard({ feature }: { feature: string }) {
  return (
    <EmptyCard
      description={`Backend chưa có API cho phần này. ${feature} sẽ hiển thị ngay khi endpoint sẵn sàng.`}
      title="Chưa có dữ liệu thật"
    />
  );
}
