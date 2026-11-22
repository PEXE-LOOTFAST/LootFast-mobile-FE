import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TabHeader } from '@/components/ui/tab-header';
import { EmptyCard } from '@/components/ui/empty-card';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { LoadingState } from '@/components/ui/loading-state';
import { FontSize, FontWeight, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { toDeal } from '@/features/home/api/deals';
import { DealCard } from '@/features/home/components/deal-card';
import { toFavoriteErrorMessage, type FavoriteItemDto } from '@/features/profile/api/favorites';
import {
  useFavorites,
  useToggleFavoriteDeal,
  useToggleFavoriteStore,
} from '@/features/profile/api/use-favorites';
import { ProfileIcons } from '@/features/profile/constants/icons';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';

/**
 * Deal và cửa hàng đã lưu. Backend trả chung một danh sách phân loại bằng `type`, nên màn
 * tách ra hai nhóm để deal hiển thị bằng đúng thẻ deal của trang chủ.
 */
export function FavoritesScreen() {
  const theme = useTheme();
  const { user } = useAuthSession();
  const favoritesQuery = useFavorites(Boolean(user));
  const toggleDeal = useToggleFavoriteDeal();
  const toggleStore = useToggleFavoriteStore();

  const items = favoritesQuery.data?.items ?? [];
  const deals = items.filter((item) => item.type === 'DEAL' && item.deal);
  const stores = items.filter((item) => item.type === 'STORE' && item.store);
  const actionError = toggleDeal.error ?? toggleStore.error;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <TabHeader onBack={() => router.navigate('/profile')} title="Món yêu thích" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!user ? (
          <EmptyCard
            description="Đăng nhập để lưu deal và cửa hàng bạn thích."
            title="Chưa đăng nhập"
          />
        ) : null}

        {favoritesQuery.isLoading ? <LoadingState /> : null}

        {favoritesQuery.error ? (
          <ErrorState
            message={toFavoriteErrorMessage(favoritesQuery.error)}
            onRetry={() => void favoritesQuery.refetch()}
            retrying={favoritesQuery.isRefetching}
          />
        ) : null}
        {actionError ? <InlineAlert message={toFavoriteErrorMessage(actionError)} /> : null}

        {user && !favoritesQuery.isLoading && items.length === 0 ? (
          <EmptyCard
            description="Bấm trái tim ở deal hoặc cửa hàng để lưu lại xem sau."
            title="Chưa lưu gì cả"
          />
        ) : null}

        {deals.length > 0 ? (
          <>
            <Text style={[styles.section, { color: theme.textSecondary }]}>DEAL ĐÃ LƯU</Text>
            <View style={styles.deals}>
              {deals.map((item) => {
                const deal = toDeal(item.deal!);

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
          </>
        ) : null}

        {stores.length > 0 ? (
          <>
            <Text style={[styles.section, { color: theme.textSecondary }]}>CỬA HÀNG ĐÃ LƯU</Text>
            <View style={styles.stores}>
              {stores.map((item) => (
                <StoreRow
                  key={item.store!.merchantId}
                  item={item}
                  onRemove={() =>
                    toggleStore.mutate({ merchantId: item.store!.merchantId, isSaved: true })
                  }
                />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function StoreRow({ item, onRemove }: { item: FavoriteItemDto; onRemove: () => void }) {
  const theme = useTheme();
  const store = item.store!;
  const address = [store.addressLine, store.ward, store.district, store.city]
    .filter(Boolean)
    .join(', ');

  return (
    <View
      style={[
        styles.storeRow,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.navigate({ pathname: '/store/[id]', params: { id: store.merchantId } })
        }
        style={styles.storeCopy}
      >
        <Text numberOfLines={1} style={[styles.storeName, { color: theme.text }]}>
          {store.storeName}
        </Text>
        {address ? (
          <Text numberOfLines={1} style={[styles.storeAddress, { color: theme.textSecondary }]}>
            {address}
          </Text>
        ) : null}
      </Pressable>

      <Pressable
        accessibilityLabel={`Bỏ lưu ${store.storeName}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={onRemove}
      >
        <Icon name={ProfileIcons.favorites} color={theme.danger} size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  section: { fontSize: FontSize.caption, fontWeight: FontWeight.bold, letterSpacing: 0.6 },
  deals: { gap: 10 },
  stores: { gap: 10 },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: Spacing.md,
  },
  storeCopy: { flex: 1, gap: Spacing.xxs },
  storeName: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.bold },
  storeAddress: { fontSize: FontSize.footnote },
});
