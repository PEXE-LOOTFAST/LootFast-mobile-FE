import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { MaxContentWidth } from '@/constants/theme';
import { getDealErrorMessage } from '@/features/home/api/deals';
import { useDeal } from '@/features/home/api/use-deals';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { DealDetailHero } from '@/features/home/components/deal-detail-hero';
import { DealMeta } from '@/features/home/components/deal-meta';
import { DealReviews } from '@/features/home/components/deal-reviews';
import { DetailCard } from '@/features/home/components/detail-card';
import { ReserveBar } from '@/features/home/components/reserve-bar';
import { RatingColor } from '@/features/home/constants/colors';
import { HomeIcons } from '@/features/home/constants/icons';
import { getDealReviews } from '@/features/home/data/mock-deals';
import { useReservation } from '@/features/home/hooks/use-reservation';
import { OrderDetailPanel } from '@/features/order/components/order-detail-panel';
import type { PaymentMethod } from '@/features/order/api/orders';
import type { Deal } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';
import { formatDistance, formatPrice } from '@/lib/format';

// Mở thẳng bằng link (web) thì không có lịch sử để quay lại — đưa về Trang chủ.
function goBack() {
  if (router.canGoBack()) router.back();
  else router.navigate('/');
}

export function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dealQuery = useDeal(typeof id === 'string' ? id : undefined);

  // Ảnh món tràn lên dưới status bar nên cần icon sáng, giống Trang chủ.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  if (typeof id !== 'string') return <DealNotFound />;
  if (dealQuery.isPending) return <DealDetailLoading />;
  if (dealQuery.isError) {
    return (
      <DealDetailError
        message={getDealErrorMessage(dealQuery.error)}
        onRetry={() => void dealQuery.refetch()}
        retrying={dealQuery.isRefetching}
      />
    );
  }
  if (!dealQuery.data) return <DealNotFound />;

  // Màn nằm trong tab nên không bị unmount khi mở deal khác: đổi key để reset cuộn,
  // trạng thái yêu thích và đặt giữ về mặc định cho deal mới.
  return <DealDetail key={dealQuery.data.id} deal={dealQuery.data} />;
}

function DealDetail({ deal }: { deal: Deal }) {
  const theme = useTheme();
  const reservation = useReservation(deal.id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [isFavorite, setIsFavorite] = useState(false);
  const [barHeight, setBarHeight] = useState(0);

  // Review đang dùng mock, chờ BE có API danh sách review; rating tổng vẫn lấy từ BE.
  const reviews = getDealReviews(deal.id);
  const savings = deal.originalPrice - deal.price;
  const remaining = reservation.status === 'reserved' ? deal.remaining - 1 : deal.remaining;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${deal.name} chỉ ${formatPrice(deal.price)} tại ${deal.store.name} — săn deal cuối ngày trên LootFast!`,
      });
    } catch {
      // Trình duyệt không hỗ trợ Web Share hoặc người dùng huỷ chia sẻ — không cần báo lỗi.
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DealDetailHero
          deal={deal}
          isFavorite={isFavorite}
          onBack={goBack}
          onShare={handleShare}
          onToggleFavorite={() => setIsFavorite((current) => !current)}
        />

        <View style={styles.cards}>
          <DetailCard>
            <Text accessibilityRole="header" style={[styles.name, { color: theme.text }]}>
              {deal.name}
            </Text>

            <View style={styles.storeRow}>
              <View style={[styles.storeIcon, { backgroundColor: theme.primarySoft }]}>
                <Icon name={HomeIcons.store} color={theme.primary} size={18} />
              </View>
              <View style={styles.storeCopy}>
                <View style={styles.storeNameRow}>
                  <Text numberOfLines={1} style={[styles.storeName, { color: theme.text }]}>
                    {deal.store.name}
                  </Text>
                  {deal.store.isVerified ? (
                    <Icon name={HomeIcons.verified} color={theme.primary} size={15} />
                  ) : null}
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.rating}>
                    <Icon name={HomeIcons.star} color={RatingColor} size={14} />
                    <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                      {deal.store.rating > 0 ? deal.store.rating.toFixed(1) : 'Chưa có đánh giá'} (
                      {reviews.length})
                    </Text>
                  </View>
                  <DealMeta icon={HomeIcons.distance} label={formatDistance(deal.distanceKm)} />
                  <DealMeta
                    icon={HomeIcons.clock}
                    label={`${deal.pickupWindow.start}–${deal.pickupWindow.end}`}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: theme.primary }]}>
                {formatPrice(deal.price)}
              </Text>
              <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
                {formatPrice(deal.originalPrice)}
              </Text>
            </View>

            <View style={styles.stockRow}>
              <Text style={[styles.stock, { color: theme.textSecondary }]}>
                Còn {remaining} phần
              </Text>
              {savings > 0 ? (
                <View style={[styles.savings, { backgroundColor: theme.primarySoft }]}>
                  <Text style={[styles.savingsText, { color: theme.primary }]}>
                    Tiết kiệm {formatPrice(savings)}
                  </Text>
                </View>
              ) : null}
            </View>
          </DetailCard>

          <DetailCard title="Vị trí cửa hàng">
            <View style={[styles.location, { backgroundColor: theme.primarySoft }]}>
              <Icon name={HomeIcons.location} color={theme.primary} size={18} />
              <Text style={[styles.address, { color: theme.text }]}>{deal.store.address}</Text>
              <Pressable
                accessibilityLabel="Xem cửa hàng trên bản đồ"
                accessibilityRole="button"
                onPress={() => router.navigate('/map')}
                style={({ pressed }) => [
                  styles.mapButton,
                  { backgroundColor: theme.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Icon name={HomeIcons.location} color="#FFFFFF" size={14} />
                <Text style={styles.mapButtonText}>Bản đồ</Text>
              </Pressable>
            </View>
          </DetailCard>

          <DealReviews reviews={reviews} />
          {reservation.order ? <OrderDetailPanel orderId={reservation.order.orderId} /> : null}
        </View>
      </ScrollView>

      <ReserveBar
        onLayout={(event) => setBarHeight(event.nativeEvent.layout.height)}
        onPaymentMethodChange={setPaymentMethod}
        onReserve={reservation.reserve}
        onViewOrder={() => router.navigate('/orders')}
        paymentMethod={paymentMethod}
        status={reservation.status}
        total={deal.price}
        errorMessage={reservation.errorMessage}
      />

      {/* Đặt nút trợ lý phía trên thanh đặt giữ để không che nút "Đặt giữ ngay". */}
      <AssistantFab bottomOffset={barHeight + 12} />
    </View>
  );
}

function DealNotFound() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.notFound, { backgroundColor: theme.background }]}>
      <Text style={[styles.notFoundTitle, { color: theme.text }]}>Không tìm thấy deal</Text>
      <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>
        Deal có thể đã hết suất hoặc cửa hàng đã gỡ xuống.
      </Text>
      <BrandButton onPress={goBack} variant="secondary">
        Quay lại
      </BrandButton>
    </SafeAreaView>
  );
}

function DealDetailLoading() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.feedback, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.primary} size="large" />
      <Text style={[styles.feedbackText, { color: theme.textSecondary }]}>Đang tải deal...</Text>
    </SafeAreaView>
  );
}

function DealDetailError({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.feedback, { backgroundColor: theme.background }]}>
      <InlineAlert message={message} />
      <BrandButton loading={retrying} onPress={onRetry}>
        Thử lại
      </BrandButton>
      <BrandButton onPress={goBack} variant="secondary">
        Quay lại
      </BrandButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 96 },
  cards: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  name: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  storeIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  storeCopy: { flex: 1, gap: 3 },
  storeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  storeName: { flexShrink: 1, fontSize: 15, fontWeight: '700' },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 12,
    rowGap: 2,
  },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  price: { fontSize: 28, fontWeight: '900' },
  originalPrice: { fontSize: 15, textDecorationLine: 'line-through' },
  stockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stock: { fontSize: 13, fontWeight: '600' },
  savings: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  savingsText: { fontSize: 12, fontWeight: '800' },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 12,
  },
  address: { flex: 1, fontSize: 14, fontWeight: '600' },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  mapButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.85 },
  notFound: { flex: 1, justifyContent: 'center', gap: 12, padding: 24 },
  notFoundTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  notFoundText: { fontSize: 14, textAlign: 'center', marginBottom: 8 },
  feedback: { flex: 1, justifyContent: 'center', gap: 14, padding: 24 },
  feedbackText: { fontSize: 14, textAlign: 'center' },
});
