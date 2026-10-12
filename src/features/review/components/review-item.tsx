import { StyleSheet, Text, View } from 'react-native';

import type { ReviewDto } from '@/features/review/api/reviews';
import { StarRating } from '@/features/review/components/star-rating';
import { getInitials } from '@/features/profile/get-initials';
import { useTheme } from '@/hooks/use-theme';
import { formatShortDate } from '@/lib/format';

type ReviewItemProps = {
  review: ReviewDto;
};

/** Một đánh giá: người viết, số sao, ngày, nhận xét và phản hồi của quán (nếu có). */
export function ReviewItem({ review }: ReviewItemProps) {
  const theme = useTheme();
  const author = review.authorName.trim() || 'Khách hàng';
  const createdAt = new Date(review.createdAt);

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
        <Text style={[styles.initials, { color: theme.primary }]}>{getInitials(author)}</Text>
      </View>

      <View style={styles.copy}>
        <View style={styles.header}>
          <Text numberOfLines={1} style={[styles.author, { color: theme.text }]}>
            {author}
          </Text>
          <StarRating value={review.rating} size={12} />
          {Number.isNaN(createdAt.getTime()) ? null : (
            <Text style={[styles.date, { color: theme.textSecondary }]}>
              {formatShortDate(createdAt)}
            </Text>
          )}
        </View>

        {review.comment ? (
          <Text style={[styles.comment, { color: theme.text }]}>{review.comment}</Text>
        ) : null}

        {review.merchantReply ? (
          <View style={[styles.reply, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.replyLabel, { color: theme.primary }]}>Phản hồi từ quán</Text>
            <Text style={[styles.replyText, { color: theme.text }]}>{review.merchantReply}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  initials: { fontSize: 12, fontWeight: '800' },
  copy: { flex: 1, gap: 4 },
  header: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  author: { flexShrink: 1, fontSize: 14, fontWeight: '700' },
  date: { fontSize: 12 },
  comment: { fontSize: 14, lineHeight: 21 },
  reply: { gap: 2, borderRadius: 12, padding: 10 },
  replyLabel: { fontSize: 12, fontWeight: '800' },
  replyText: { fontSize: 13, lineHeight: 19 },
});
