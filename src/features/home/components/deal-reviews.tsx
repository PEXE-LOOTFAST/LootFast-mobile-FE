import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { DetailCard } from '@/features/home/components/detail-card';
import { RatingColor } from '@/features/home/constants/colors';
import { HomeIcons } from '@/features/home/constants/icons';
import type { DealReview } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';

  return `${first}${last}`.toUpperCase();
}

type DealReviewsProps = {
  /**
   * Backend chưa có endpoint danh sách đánh giá nên nơi gọi hiện không truyền gì; thẻ vẫn giữ
   * chỗ và tự hiện trạng thái trống. Có API rồi thì truyền danh sách vào là đủ.
   */
  reviews?: DealReview[];
};

export function DealReviews({ reviews = [] }: DealReviewsProps) {
  const theme = useTheme();

  return (
    <DetailCard
      action={
        <Text style={[styles.count, { color: theme.textSecondary }]}>
          {reviews.length} đánh giá
        </Text>
      }
      title="Đánh giá"
    >
      {reviews.length === 0 ? (
        <Text style={[styles.comment, { color: theme.textSecondary }]}>
          Backend chưa có API đánh giá — phần này sẽ hiện nhận xét thật khi endpoint sẵn sàng.
        </Text>
      ) : (
        reviews.map((review, index) => (
          <View
            key={review.id}
            style={[styles.review, index > 0 && [styles.divided, { borderTopColor: theme.border }]]}
          >
            <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.initials, { color: theme.primary }]}>
                {getInitials(review.author)}
              </Text>
            </View>

            <View style={styles.copy}>
              <View style={styles.reviewHeader}>
                <Text style={[styles.author, { color: theme.text }]}>{review.author}</Text>
                <View accessibilityLabel={`${review.rating} sao`} style={styles.stars}>
                  {Array.from({ length: review.rating }, (_, starIndex) => (
                    <Icon key={starIndex} name={HomeIcons.star} color={RatingColor} size={12} />
                  ))}
                </View>
              </View>
              <Text style={[styles.comment, { color: theme.text }]}>{review.comment}</Text>
            </View>
          </View>
        ))
      )}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  count: { fontSize: 12 },
  review: { flexDirection: 'row', gap: 12 },
  divided: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  avatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  initials: { fontSize: 12, fontWeight: '800' },
  copy: { flex: 1, gap: 4 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  author: { fontSize: 14, fontWeight: '700' },
  stars: { flexDirection: 'row', gap: 1 },
  comment: { fontSize: 14, lineHeight: 21 },
});
