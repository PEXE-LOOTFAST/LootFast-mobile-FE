import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Spacing } from '@/constants/theme';
import { BrandButton } from '@/components/ui/brand-button';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { DetailCard } from '@/features/home/components/detail-card';
import { toReviewErrorMessage } from '@/features/review/api/reviews';
import { useStoreReviews } from '@/features/review/api/use-reviews';
import { ReviewItem } from '@/features/review/components/review-item';
import { useTheme } from '@/hooks/use-theme';

type StoreReviewsCardProps = {
  merchantId: string;
  /** Tên quán, dùng trong câu giải thích phạm vi của đánh giá. */
  storeName?: string;
  /** Tổng số đánh giá backend đã tổng hợp (nếu nơi gọi có sẵn), hiện ở góc thẻ. */
  reviewCount?: number;
};

/** Đánh giá công khai của cửa hàng, tải thêm từng trang. Dùng ở chi tiết deal và hồ sơ cửa hàng. */
export function StoreReviewsCard({ merchantId, storeName, reviewCount }: StoreReviewsCardProps) {
  const theme = useTheme();
  const query = useStoreReviews(merchantId);

  const reviews = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.totalElements ?? reviewCount ?? reviews.length;

  return (
    <DetailCard
      action={<Text style={[styles.count, { color: theme.textSecondary }]}>{total} đánh giá</Text>}
      title="Đánh giá của quán"
    >
      <Text style={[styles.scope, { color: theme.textSecondary }]}>
        {storeName ? `Đánh giá chung của ${storeName}` : 'Đánh giá chung của quán'}, do khách viết
        sau khi nhận món. Hiện chưa tách riêng theo từng món.
      </Text>
      {query.isPending ? <LoadingState label="Đang tải đánh giá..." size="small" /> : null}

      {query.isError ? (
        <ErrorState
          message={toReviewErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
        />
      ) : null}

      {query.isSuccess && reviews.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textSecondary }]}>
          Chưa có đánh giá nào. Sau khi nhận món, bạn có thể là người đầu tiên đánh giá quán này.
        </Text>
      ) : null}

      {reviews.map((review, index) => (
        <View
          key={review.reviewId}
          style={index > 0 && [styles.divided, { borderTopColor: theme.border }]}
        >
          <ReviewItem review={review} />
        </View>
      ))}

      {query.hasNextPage ? (
        <BrandButton
          loading={query.isFetchingNextPage}
          onPress={() => void query.fetchNextPage()}
          variant="outline"
        >
          Xem thêm đánh giá
        </BrandButton>
      ) : null}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  count: { fontSize: FontSize.footnote },
  scope: { fontSize: FontSize.footnote, lineHeight: 17 },
  empty: { fontSize: FontSize.body, lineHeight: 21 },
  divided: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.md },
});
