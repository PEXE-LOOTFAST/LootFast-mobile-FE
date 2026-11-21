import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/ui/brand-button';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { LoadingState } from '@/components/ui/loading-state';
import {
  FontSize,
  FontWeight,
  MaxContentWidth,
  Radius,
  RatingColor,
  Spacing,
} from '@/constants/theme';
import { getDealErrorMessage } from '@/features/home/api/deals';
import { useDeal } from '@/features/home/api/use-deals';
import { useFavorites, useToggleFavoriteDeal } from '@/features/profile/api/use-favorites';
import { useAuthSession } from '@/hooks/use-auth-session';
import { requireAuth } from '@/lib/auth-session';
import { DealDetailHero } from '@/features/home/components/deal-detail-hero';
import { DealMeta } from '@/features/home/components/deal-meta';
import { StoreReviewsCard } from '@/features/review/components/store-reviews-card';
import { DetailCard } from '@/features/home/components/detail-card';
import { PickupSlotPicker } from '@/features/home/components/pickup-slot-picker';
import { QuantityStepper } from '@/features/home/components/quantity-stepper';
import {
  ReservationInfoCard,
  ReservedNotice,
} from '@/features/home/components/reservation-info-card';
import { ReserveBar } from '@/features/home/components/reserve-bar';
import { ORDER_MAX_QUANTITY } from '@/features/order/api/orders';
import { HomeIcons } from '@/features/home/constants/icons';
import { useReservation } from '@/features/home/hooks/use-reservation';
import { buildPickupSlots } from '@/features/home/pickup-slots';
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
  const { user } = useAuthSession();

  // Khung giờ co lại theo thời gian thực nên tính lại mỗi phút; lát đã qua tự biến mất.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);

    return () => clearInterval(timer);
  }, []);

  const slots = useMemo(
    () => buildPickupSlots(deal.pickupWindowIso.start, deal.pickupWindowIso.end, now),
    [deal.pickupWindowIso.start, deal.pickupWindowIso.end, now],
  );
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  // Lát đang chọn có thể trôi mất khi tới giờ: tự lùi về lát sớm nhất còn đặt được.
  const selectedSlot = slots.find((slot) => slot.from === selectedSlotKey) ?? slots[0];

  // Số phần tối đa: theo giới hạn của backend và theo số phần deal còn lại.
  const maxQuantity = Math.max(1, Math.min(ORDER_MAX_QUANTITY, deal.remaining));
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  // Số phần còn lại có thể giảm khi người khác đặt: tự kéo số đang chọn về mức còn đặt được.
  const quantity = Math.min(requestedQuantity, maxQuantity);
  const reservation = useReservation(deal.id, selectedSlot, quantity);

  // Danh sách yêu thích là nguồn sự thật cho nút trái tim: lưu ở màn khác thì vào đây vẫn đúng.
  const favoritesQuery = useFavorites(Boolean(user));
  const toggleFavorite = useToggleFavoriteDeal();
  const isFavorite = (favoritesQuery.data?.items ?? []).some(
    (item) => item.type === 'DEAL' && item.deal?.dealId === deal.id,
  );

  const savings = deal.originalPrice - deal.price;
  const total = deal.price * quantity;

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
          onToggleFavorite={() =>
            requireAuth(() => toggleFavorite.mutate({ dealId: deal.id, isSaved: isFavorite }))
          }
        />

        <View style={styles.cards}>
          <DetailCard>
            <Text accessibilityRole="header" style={[styles.name, { color: theme.text }]}>
              {deal.name}
            </Text>

            <Pressable
              accessibilityHint="Mở hồ sơ cửa hàng"
              accessibilityRole="button"
              onPress={() =>
                router.navigate({
                  pathname: '/store/[id]',
                  params: { id: deal.store.merchantId },
                })
              }
              style={styles.storeRow}
            >
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
                      {deal.store.reviewCount})
                    </Text>
                  </View>
                  <DealMeta icon={HomeIcons.distance} label={formatDistance(deal.distanceKm)} />
                  <DealMeta
                    icon={HomeIcons.clock}
                    label={`${deal.pickupWindow.start}–${deal.pickupWindow.end}`}
                  />
                </View>
              </View>
            </Pressable>

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
                Còn {deal.remaining} phần
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

          <DetailCard>
            <View style={styles.quantityRow}>
              <View style={styles.quantityCopy}>
                <Text
                  accessibilityRole="header"
                  style={[styles.quantityTitle, { color: theme.text }]}
                >
                  Bạn muốn đặt mấy phần?
                </Text>
                <Text style={[styles.quantityHint, { color: theme.textSecondary }]}>
                  {deal.remaining < ORDER_MAX_QUANTITY
                    ? `Tối đa ${maxQuantity} phần (deal còn ${deal.remaining} phần)`
                    : `Tối đa ${ORDER_MAX_QUANTITY} phần mỗi lần đặt`}
                </Text>
              </View>
              <QuantityStepper
                disabled={reservation.status !== 'idle'}
                max={maxQuantity}
                onChange={setRequestedQuantity}
                value={quantity}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <PickupSlotPicker
              disabled={reservation.status !== 'idle'}
              onSelect={(slot) => setSelectedSlotKey(slot.from)}
              selected={selectedSlot}
              slots={slots}
            />
          </DetailCard>

          <ReservationInfoCard now={now} slot={selectedSlot} total={total} />

          <DetailCard>
            <View style={styles.location}>
              <Icon name={HomeIcons.location} color={theme.primary} size={18} />
              <Text numberOfLines={2} style={[styles.address, { color: theme.text }]}>
                {deal.store.address}
              </Text>
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
                <Icon name={HomeIcons.location} color={theme.onPrimary} size={14} />
                <Text style={[styles.mapButtonText, { color: theme.onPrimary }]}>Bản đồ</Text>
              </Pressable>
            </View>
          </DetailCard>

          <StoreReviewsCard
            merchantId={deal.store.merchantId}
            reviewCount={deal.store.reviewCount}
            storeName={deal.store.name}
          />
        </View>
      </ScrollView>

      {reservation.error ? (
        <View style={styles.bottomNotice}>
          <InlineAlert message={reservation.error} />
        </View>
      ) : null}

      {reservation.status === 'reserved' ? (
        <View style={styles.bottomNotice}>
          <ReservedNotice
            slotLabel={selectedSlot?.label}
            storeName={deal.store.name}
            total={total}
          />
        </View>
      ) : null}

      <ReserveBar
        disabled={!selectedSlot}
        onReserve={reservation.reserve}
        onViewOrder={() =>
          reservation.order
            ? router.navigate({
                pathname: '/order/[id]',
                params: { id: reservation.order.orderId },
              })
            : router.navigate('/orders')
        }
        status={reservation.status}
        total={total}
      />
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
      <LoadingState fill label="Đang tải deal..." />
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
      <ErrorState message={message} onRetry={onRetry} retrying={retrying} />
      <BrandButton onPress={goBack} variant="secondary">
        Quay lại
      </BrandButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomNotice: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  quantityCopy: { flex: 1, gap: 3 },
  quantityTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  quantityHint: { fontSize: FontSize.footnote, lineHeight: 16 },
  screen: { flex: 1 },
  content: { paddingBottom: 96 },
  cards: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 10,
    marginTop: 10,
    paddingHorizontal: Spacing.md,
  },
  name: { fontSize: FontSize.title, fontWeight: FontWeight.heavy, letterSpacing: -0.3 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  storeIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  storeCopy: { flex: 1, gap: 3 },
  storeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  storeName: { flexShrink: 1, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: Spacing.md,
    rowGap: Spacing.xxs,
  },
  rating: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  ratingText: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  divider: { height: StyleSheet.hairlineWidth },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
  price: { fontSize: FontSize.headline, fontWeight: FontWeight.heavy },
  originalPrice: { fontSize: FontSize.bodySm, textDecorationLine: 'line-through' },
  stockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stock: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  savings: { borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 3 },
  savingsText: { fontSize: FontSize.caption, fontWeight: FontWeight.bold },
  location: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  address: { flex: 1, fontSize: FontSize.bodySm, lineHeight: 18, fontWeight: FontWeight.medium },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.full,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  mapButtonText: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  pressed: { opacity: 0.85 },
  notFound: { flex: 1, justifyContent: 'center', gap: Spacing.md, padding: Spacing.xxl },
  notFoundTitle: { fontSize: FontSize.headline, fontWeight: FontWeight.heavy, textAlign: 'center' },
  notFoundText: { fontSize: FontSize.body, textAlign: 'center', marginBottom: Spacing.sm },
  feedback: { flex: 1, justifyContent: 'center', gap: 14, padding: Spacing.xxl },
});
