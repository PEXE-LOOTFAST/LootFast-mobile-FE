import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyCard } from '@/components/ui/empty-card';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { LoadingState } from '@/components/ui/loading-state';
import { StoreReviewsCard } from '@/features/review/components/store-reviews-card';
import { MaxContentWidth } from '@/constants/theme';
import { toDeal } from '@/features/home/api/deals';
import { toStoreErrorMessage, type OpeningHourSlot } from '@/features/home/api/stores';
import { useStore } from '@/features/home/api/use-store';
import { DealCard } from '@/features/home/components/deal-card';
import { RatingColor } from '@/features/home/constants/colors';
import { HomeIcons } from '@/features/home/constants/icons';
import { useFavorites, useToggleFavoriteStore } from '@/features/profile/api/use-favorites';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';

const WEEKDAY_LABELS: Record<OpeningHourSlot['dayOfWeek'], string> = {
  MONDAY: 'Thứ Hai',
  TUESDAY: 'Thứ Ba',
  WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu',
  SATURDAY: 'Thứ Bảy',
  SUNDAY: 'Chủ Nhật',
};

/** Hồ sơ cửa hàng công khai: thông tin quán, giờ mở cửa và các deal đang bán. */
export function StoreScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const storeQuery = useStore(id);
  const { user } = useAuthSession();

  const favoritesQuery = useFavorites(Boolean(user));
  const toggleStore = useToggleFavoriteStore();

  const store = storeQuery.data;
  const isSaved = (favoritesQuery.data?.items ?? []).some(
    (item) => item.type === 'STORE' && item.store?.merchantId === id,
  );

  const address = store
    ? [store.address.addressLine, store.address.ward, store.address.district, store.address.city]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <Icon name={HomeIcons.chevronLeft} color={theme.text} size={22} />
        </Pressable>
        <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.text }]}>
          {store?.storeName ?? 'Cửa hàng'}
        </Text>

        {user && store ? (
          <Pressable
            accessibilityLabel={isSaved ? 'Bỏ lưu cửa hàng' : 'Lưu cửa hàng'}
            accessibilityRole="button"
            disabled={toggleStore.isPending}
            hitSlop={8}
            onPress={() => toggleStore.mutate({ merchantId: store.merchantId, isSaved })}
          >
            <Icon
              name={HomeIcons.heart}
              color={isSaved ? theme.danger : theme.textSecondary}
              size={22}
            />
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {storeQuery.isLoading ? <LoadingState /> : null}
        {storeQuery.error ? (
          <ErrorState
            message={toStoreErrorMessage(storeQuery.error)}
            onRetry={() => void storeQuery.refetch()}
            retrying={storeQuery.isRefetching}
          />
        ) : null}
        {toggleStore.error ? (
          <InlineAlert message="Không lưu được cửa hàng. Vui lòng thử lại." />
        ) : null}

        {store ? (
          <>
            {store.coverUrl ? (
              <Image contentFit="cover" source={{ uri: store.coverUrl }} style={styles.cover} />
            ) : null}

            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            >
              <View style={styles.titleRow}>
                <Text accessibilityRole="header" style={[styles.name, { color: theme.text }]}>
                  {store.storeName}
                </Text>
                {store.verified ? (
                  <Icon name={HomeIcons.verified} color={theme.primary} size={18} />
                ) : null}
              </View>

              {store.rating ? (
                <View style={styles.ratingRow}>
                  <Icon name={HomeIcons.star} color={RatingColor} size={14} />
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>
                    {store.rating.averageRating
                      ? `${store.rating.averageRating.toFixed(1)} (${store.rating.reviewCount} đánh giá)`
                      : 'Chưa có đánh giá'}
                  </Text>
                </View>
              ) : null}

              {store.description ? (
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                  {store.description}
                </Text>
              ) : null}

              {address ? (
                <View style={styles.infoRow}>
                  <Icon name={HomeIcons.location} color={theme.textSecondary} size={15} />
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>{address}</Text>
                </View>
              ) : null}

              {store.contactPhone ? (
                <Pressable
                  accessibilityHint="Gọi cho cửa hàng"
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(`tel:${store.contactPhone}`)}
                  style={styles.infoRow}
                >
                  <Icon name={HomeIcons.phone} color={theme.textSecondary} size={15} />
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>
                    {store.contactPhone}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {store.openingHours.length > 0 ? (
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}
              >
                <Text accessibilityRole="header" style={[styles.section, { color: theme.text }]}>
                  Giờ mở cửa
                </Text>
                {store.openingHours.map((slot) => (
                  <View key={`${slot.dayOfWeek}-${slot.opensAt}`} style={styles.hourRow}>
                    <Text style={[styles.meta, { color: theme.textSecondary }]}>
                      {WEEKDAY_LABELS[slot.dayOfWeek]}
                    </Text>
                    <Text style={[styles.meta, { color: theme.text }]}>
                      {slot.opensAt}–{slot.closesAt}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={[styles.section, { color: theme.text }]}>Deal đang bán</Text>

            {store.activeDeals.items.length > 0 ? (
              <View style={styles.deals}>
                {store.activeDeals.items.map((item) => {
                  const deal = toDeal(item);

                  return (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onPress={() =>
                        router.navigate({ pathname: '/deal/[id]', params: { id: deal.id } })
                      }
                    />
                  );
                })}
              </View>
            ) : (
              <EmptyCard
                description="Quán chưa mở deal nào trong hôm nay. Ghé lại sau nhé."
                title="Chưa có deal"
              />
            )}

            <StoreReviewsCard
              merchantId={store.merchantId}
              reviewCount={store.rating?.reviewCount}
              storeName={store.storeName}
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    padding: 16,
    paddingBottom: 48,
  },
  cover: { width: '100%', height: 160, borderRadius: 18 },
  card: { gap: 10, borderWidth: 1, borderRadius: 18, padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  description: { fontSize: 13, lineHeight: 19 },
  meta: { flexShrink: 1, fontSize: 13 },
  section: { fontSize: 15, fontWeight: '900', letterSpacing: -0.2 },
  hourRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deals: { gap: 14 },
});
