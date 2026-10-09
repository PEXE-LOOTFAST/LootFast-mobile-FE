import { router } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { MaxContentWidth } from '@/constants/theme';
import { getDealErrorMessage } from '@/features/home/api/deals';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { BuyerHeader } from '@/features/home/components/buyer-header';
import { DealCard } from '@/features/home/components/deal-card';
import { DealFilterButton } from '@/features/home/components/deal-filter-button';
import { EmptyDeals } from '@/features/home/components/empty-deals';
import { LocationPrompt } from '@/features/home/components/location-prompt';
import { SearchPanel } from '@/features/home/components/search-panel';
import { SectionHeader } from '@/features/home/components/section-header';
import { useDeals } from '@/features/home/api/use-deals';
import { DEAL_CATEGORIES } from '@/features/home/constants/deal-categories';
import { HomeIcons } from '@/features/home/constants/icons';
import { filterDeals, useDealFilters } from '@/features/home/hooks/use-deal-filters';
import type { Deal } from '@/features/home/types';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { useUserLocation } from '@/hooks/use-user-location';
import { requireAuth, withAuth } from '@/lib/auth-session';
import { formatRadius } from '@/lib/format';

const HORIZONTAL_INSET = 16;

export function HomeScreen() {
  const theme = useTheme();
  const { isAuthenticated } = useAuthSession();
  const filters = useDealFilters([]);
  const location = useUserLocation();
  const dealsQuery = useDeals({
    ...(location.coords ?? {}),
    categoryCode: filters.categoryId === 'all' ? undefined : filters.categoryId,
    keyword: filters.query,
    radiusKm: filters.radiusKm,
  });
  const deals = dealsQuery.data ?? [];
  const filteredDeals = filterDeals(deals, filters);

  // Bộ lọc cần cả đăng nhập lẫn GPS: không có vị trí thì "gần bạn" và bán kính không có nghĩa.
  const canFilter = isAuthenticated && location.isReady;
  const unlockFilters = () => requireAuth(() => void location.request());

  const openDeal = (deal: Deal) => {
    requireAuth(() => router.navigate({ pathname: '/deal/[id]', params: { id: deal.id } }));
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            colors={[theme.primary]}
            onRefresh={() => void dealsQuery.refetch()}
            refreshing={dealsQuery.isRefetching}
            tintColor={theme.primary}
          />
        }
      >
        <BuyerHeader
          subtitle={
            location.isReady ? `Gần bạn · ${formatRadius(filters.radiusKm)}` : 'Chưa bật vị trí'
          }
          subtitleIcon={HomeIcons.location}
          title="Trang chủ"
        />

        <View style={styles.body}>
          <LocationPrompt
            canAskAgain={location.canAskAgain}
            onRequest={unlockFilters}
            status={location.status}
          />

          <SearchPanel
            categories={DEAL_CATEGORIES}
            isLocked={!canFilter}
            onChangeQuery={filters.setQuery}
            onChangeRadius={filters.setRadiusKm}
            onPressLocked={unlockFilters}
            onSelectCategory={(id) => (canFilter ? filters.setCategoryId(id) : unlockFilters())}
            query={filters.query}
            radiusKm={filters.radiusKm}
            selectedCategoryId={filters.categoryId}
          />

          <View style={styles.section}>
            <SectionHeader
              title={filters.isFiltering ? 'Kết quả tìm kiếm' : 'Gợi ý gần bạn'}
              subtitle={
                filters.isFiltering
                  ? `${filteredDeals.length} deal phù hợp`
                  : 'Ưu tiên món gần, tiết kiệm và được đánh giá cao'
              }
              action={
                <DealFilterButton
                  isActive={filters.hasAdvancedFilters}
                  isLocked={!canFilter}
                  minDiscount={filters.minDiscount}
                  onChangeDiscount={filters.setMinDiscount}
                  onChangePickup={filters.setPickup}
                  onPressLocked={unlockFilters}
                  pickup={filters.pickup}
                />
              }
            />

            {dealsQuery.isPending ? (
              <View style={styles.feedback}>
                <ActivityIndicator color={theme.primary} />
              </View>
            ) : dealsQuery.isError ? (
              <View style={styles.feedback}>
                <InlineAlert message={getDealErrorMessage(dealsQuery.error)} />
                <BrandButton
                  loading={dealsQuery.isRefetching}
                  onPress={() => void dealsQuery.refetch()}
                >
                  Thử lại
                </BrandButton>
              </View>
            ) : filteredDeals.length > 0 ? (
              filteredDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onPress={() => openDeal(deal)} />
              ))
            ) : (
              <EmptyDeals
                isFiltering={filters.isFiltering}
                onReset={withAuth(filters.resetFilters)}
                radiusLabel={formatRadius(filters.radiusKm)}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <AssistantFab />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  // Chừa chỗ để thẻ deal cuối không bị nút trợ lý nổi che mất.
  content: { paddingBottom: 96 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 20,
    marginTop: 16,
    paddingHorizontal: HORIZONTAL_INSET,
  },
  section: { gap: 14 },
  feedback: { gap: 12 },
});
