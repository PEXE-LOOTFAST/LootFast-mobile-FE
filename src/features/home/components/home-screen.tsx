import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { getDealErrorMessage } from '@/features/home/api/deals';
import { useDeals } from '@/features/home/api/use-deals';
import { BuyerHeader } from '@/features/home/components/buyer-header';
import { DealCard } from '@/features/home/components/deal-card';
import { DealFilterButton } from '@/features/home/components/deal-filter-button';
import { EmptyDeals } from '@/features/home/components/empty-deals';
import { LocationPrompt } from '@/features/home/components/location-prompt';
import { SearchPanel } from '@/features/home/components/search-panel';
import { SectionHeader } from '@/features/home/components/section-header';
import { DEAL_CATEGORIES } from '@/features/home/constants/deal-categories';
import { HomeIcons } from '@/features/home/constants/icons';
import { filterDeals, useDealFilters } from '@/features/home/hooks/use-deal-filters';
import type { Deal } from '@/features/home/types';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useUserLocation } from '@/hooks/use-user-location';
import { requireAuth, withAuth } from '@/lib/auth-session';
import { formatRadius } from '@/lib/format';

export function HomeScreen() {
  const { isAuthenticated } = useAuthSession();
  const filters = useDealFilters([]);
  const location = useUserLocation();
  const dealsQuery = useDeals({
    ...(location.coords ?? {}),
    categoryCode: filters.categoryId === 'all' ? undefined : filters.categoryId,
    keyword: filters.query,
    radiusKm: filters.radiusKm,
  });
  const filteredDeals = filterDeals(dealsQuery.data ?? [], filters);

  // Bộ lọc cần cả đăng nhập lẫn GPS: không có vị trí thì "gần bạn" và bán kính không có nghĩa.
  const canFilter = isAuthenticated && location.isReady;
  const unlockFilters = () => requireAuth(() => void location.request());

  const openDeal = (deal: Deal) => {
    requireAuth(() => router.navigate({ pathname: '/deal/[id]', params: { id: deal.id } }));
  };

  return (
    <Screen
      header={
        <BuyerHeader
          subtitle={
            location.isReady ? `Gần bạn · ${formatRadius(filters.radiusKm)}` : 'Chưa bật vị trí'
          }
          subtitleIcon={HomeIcons.location}
          title="Trang chủ"
        />
      }
      onRefresh={() => void dealsQuery.refetch()}
      refreshing={dealsQuery.isRefetching}
    >
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

        <QueryBoundary
          empty={
            <EmptyDeals
              isFiltering={filters.isFiltering}
              onReset={withAuth(filters.resetFilters)}
              radiusLabel={formatRadius(filters.radiusKm)}
            />
          }
          errorMessage={getDealErrorMessage}
          isEmpty={() => filteredDeals.length === 0}
          query={dealsQuery}
        >
          {() =>
            filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onPress={() => openDeal(deal)} />
            ))
          }
        </QueryBoundary>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.md },
});
