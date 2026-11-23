import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { TabHeader } from '@/components/ui/tab-header';
import { EmptyCard } from '@/components/ui/empty-card';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { LoadingState } from '@/components/ui/loading-state';
import { StoreReviewsCard } from '@/features/review/components/store-reviews-card';
import {
  FontSize,
  FontWeight,
  MaxContentWidth,
  Radius,
  RatingColor,
  Spacing,
} from '@/constants/theme';
import { toDeal } from '@/features/home/api/deals';
import { toStoreErrorMessage } from '@/features/home/api/stores';
import { useStore } from '@/features/home/api/use-store';
import { DealCard } from '@/features/home/components/deal-card';
import { HomeIcons } from '@/features/home/constants/icons';
import { groupOpeningHours } from '@/features/home/opening-hours';
import { StoreDirections } from '@/features/map/components/store-directions';
import { useFavorites, useToggleFavoriteStore } from '@/features/profile/api/use-favorites';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';

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

  const hourGroups = store ? groupOpeningHours(store.openingHours) : [];
  const address = store
    ? [store.address.addressLine, store.address.ward, store.address.district, store.address.city]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <TabHeader
        onBack={() => router.back()}
        title={store?.storeName ?? 'Cửa hàng'}
        trailing={
          user && store ? (
            // Đã lưu thì nút sáng lên; bấm lúc đang gửi thì bỏ qua để không gửi hai lần.
            <IconButton
              accessibilityLabel={isSaved ? 'Bỏ lưu cửa hàng' : 'Lưu cửa hàng'}
              icon={HomeIcons.heart}
              isActive={isSaved}
              onPress={() =>
                toggleStore.isPending ||
                toggleStore.mutate({ merchantId: store.merchantId, isSaved })
              }
              tone="hero"
            />
          ) : undefined
        }
      />

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

              {address || store.address.latitude != null ? (
                <StoreDirections
                  address={address}
                  latitude={store.address.latitude}
                  longitude={store.address.longitude}
                />
              ) : null}

              {hourGroups.length > 0 ? (
                <View style={styles.hoursBlock}>
                  <View style={styles.infoRow}>
                    <Icon name={HomeIcons.clock} color={theme.textSecondary} size={15} />
                    <Text style={[styles.meta, { color: theme.textSecondary }]}>
                      {hourGroups.length === 1 ? 'Mở cửa' : 'Giờ mở cửa'}
                    </Text>
                    {hourGroups.length === 1 ? (
                      <Text style={[styles.meta, styles.hoursValue, { color: theme.text }]}>
                        {hourGroups[0]?.label} · {hourGroups[0]?.hours}
                      </Text>
                    ) : null}
                  </View>
                  {hourGroups.length > 1
                    ? hourGroups.map((group) => (
                        <View key={group.label} style={styles.hourRow}>
                          <Text style={[styles.meta, { color: theme.textSecondary }]}>
                            {group.label}
                          </Text>
                          <Text style={[styles.meta, { color: theme.text }]}>{group.hours}</Text>
                        </View>
                      ))
                    : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 10,
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  cover: { width: '100%', height: 120, borderRadius: Radius.lg },
  card: { gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.lg, padding: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  name: {
    flexShrink: 1,
    fontSize: FontSize.title,
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.3,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  description: { fontSize: FontSize.bodySm, lineHeight: 19 },
  meta: { flexShrink: 1, fontSize: FontSize.bodySm },
  section: { fontSize: FontSize.body, fontWeight: FontWeight.heavy, letterSpacing: -0.2 },
  hoursBlock: { gap: Spacing.xs },
  hoursValue: { marginLeft: 'auto', fontWeight: FontWeight.bold },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 23,
  },
  deals: { gap: 10 },
});
