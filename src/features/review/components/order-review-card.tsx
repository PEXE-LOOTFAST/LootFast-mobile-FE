import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { BrandButton } from '@/components/ui/brand-button';
import { ErrorState } from '@/components/ui/error-state';
import { InlineAlert } from '@/components/ui/inline-alert';
import { LoadingState } from '@/components/ui/loading-state';
import { TextField } from '@/components/ui/text-field';
import { useProfile } from '@/features/profile/api/use-profile';
import {
  OWN_STORE_MESSAGE,
  REVIEW_COMMENT_MAX_LENGTH,
  toReviewErrorMessage,
} from '@/features/review/api/reviews';
import { useCreateReview, useMyOrderReview } from '@/features/review/api/use-reviews';
import { ReviewItem } from '@/features/review/components/review-item';
import { StarRating } from '@/features/review/components/star-rating';
import { useTheme } from '@/hooks/use-theme';

const RATING_LABELS = ['', 'Rất tệ', 'Chưa tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'];

type OrderReviewCardProps = {
  orderId: string;
  /** publicId của chủ quán (storeId trong đơn), để biết đơn có phải của chính quán mình không. */
  storeId: string;
  /** Tên món của đơn, để người dùng biết mình đang đánh giá đơn nào. */
  dealName: string;
  /** Chỉ đơn đã hoàn tất (đã nhận món) mới đánh giá được. */
  isCompleted: boolean;
};

/** Đánh giá của buyer cho một đơn: xem lại đánh giá đã gửi, hoặc viết đánh giá mới (1–5 sao). */
export function OrderReviewCard({ orderId, storeId, dealName, isCompleted }: OrderReviewCardProps) {
  const theme = useTheme();
  const profile = useProfile(true);
  // Một tài khoản vừa mua vừa bán có thể đặt món ở chính quán mình; backend cấm đánh giá trường hợp
  // này nên không hiện form để khỏi bấm gửi rồi mới bị từ chối.
  const isOwnStore = profile.data?.publicId.toLowerCase() === storeId.toLowerCase();
  const myReview = useMyOrderReview(orderId, isCompleted && profile.isSuccess && !isOwnStore);
  const create = useCreateReview(orderId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isCompleted) return null;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
        Đánh giá đơn hàng
      </Text>

      {profile.isPending || (!isOwnStore && myReview.isPending) ? (
        <LoadingState label="Đang tải đánh giá..." size="small" />
      ) : null}

      {isOwnStore ? (
        <Text style={[styles.hint, { color: theme.textSecondary }]}>{OWN_STORE_MESSAGE}</Text>
      ) : null}

      {!isOwnStore && myReview.isError ? (
        <ErrorState
          message={toReviewErrorMessage(myReview.error)}
          onRetry={() => void myReview.refetch()}
          retrying={myReview.isRefetching}
        />
      ) : null}

      {!isOwnStore && myReview.isSuccess && myReview.data ? (
        <>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Cảm ơn bạn đã đánh giá đơn “{dealName}”. Mỗi đơn chỉ đánh giá được một lần, và đánh giá
            hiển thị công khai ở trang của quán.
          </Text>
          <ReviewItem review={myReview.data.review} />
        </>
      ) : null}

      {!isOwnStore && myReview.isSuccess && !myReview.data ? (
        <>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Bạn đang đánh giá đơn “{dealName}”. Đánh giá này tính cho cả quán và hiển thị công khai
            ở trang của quán, giúp người khác chọn đúng quán.
          </Text>

          <View style={styles.starsRow}>
            <StarRating disabled={create.isPending} onChange={setRating} size={32} value={rating} />
            {rating > 0 ? (
              <Text style={[styles.ratingLabel, { color: theme.primary }]}>
                {RATING_LABELS[rating]}
              </Text>
            ) : null}
          </View>

          <TextField
            editable={!create.isPending}
            label="Nhận xét (không bắt buộc)"
            maxLength={REVIEW_COMMENT_MAX_LENGTH}
            multiline
            onChangeText={setComment}
            placeholder="Chia sẻ trải nghiệm của bạn về món và quán"
            size="compact"
            style={styles.multiline}
            value={comment}
          />
          <Text style={[styles.counter, { color: theme.textSecondary }]}>
            {comment.length}/{REVIEW_COMMENT_MAX_LENGTH}
          </Text>

          {create.isError ? <InlineAlert message={toReviewErrorMessage(create.error)} /> : null}

          <BrandButton
            disabled={rating === 0}
            loading={create.isPending}
            onPress={() => create.mutate({ rating, comment: comment.trim() || undefined })}
          >
            Gửi đánh giá
          </BrandButton>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md, borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.lg },
  title: { fontSize: FontSize.subtitle, fontWeight: FontWeight.heavy },
  hint: { fontSize: FontSize.bodySm, lineHeight: 19 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  ratingLabel: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  counter: { fontSize: FontSize.footnote, textAlign: 'right' },
});
