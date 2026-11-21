import { router } from 'expo-router';

import { QueryListEmpty } from '@/components/ui/query-boundary';
import { ScreenList } from '@/components/ui/screen';
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
import { useUserLocation } from '@/hooks/use-user-location';
import { formatRadius } from '@/lib/format';

export function HomeScreen() {
  const filters = useDealFilters([]);
  const location = useUserLocation();
  const dealsQuery = useDeals({
    ...(location.coords ?? {}),
    categoryCode: filters.categoryId === 'all' ? undefined : filters.categoryId,
    keyword: filters.query,
    radiusKm: filters.radiusKm,
  });
  const filteredDeals = filterDeals(dealsQuery.data ?? [], filters);

  // Khách xem, tìm và lọc deal thoải mái; chỉ khi đặt giữ hoặc lưu món mới cần đăng nhập. Riêng bán
  // kính cần GPS, vì chưa có vị trí thì "gần bạn" không có nghĩa.
  const requestLocation = () => void location.request();

  const openDeal = (deal: Deal) => {
    router.navigate({ pathname: '/deal/[id]', params: { id: deal.id } });
  };

  return (
    <ScreenList
      data={filteredDeals}
      empty={
        <QueryListEmpty
          empty={
            <EmptyDeals
              isFiltering={filters.isFiltering}
              onReset={filters.resetFilters}
              radiusLabel={formatRadius(filters.radiusKm)}
            />
          }
          errorMessage={getDealErrorMessage}
          query={dealsQuery}
        />
      }
      header={
        <BuyerHeader
          subtitle={
            location.isReady ? `Gần bạn · ${formatRadius(filters.radiusKm)}` : 'Chưa bật vị trí'
          }
          subtitleIcon={HomeIcons.location}
          title="Trang chủ"
        />
      }
      keyExtractor={(deal) => deal.id}
      listHeader={
        <>
          <LocationPrompt
            canAskAgain={location.canAskAgain}
            onRequest={requestLocation}
            status={location.status}
          />

          <SearchPanel
            categories={DEAL_CATEGORIES}
            isRadiusLocked={!location.isReady}
            onChangeQuery={filters.setQuery}
            onChangeRadius={filters.setRadiusKm}
            onPressRadiusLocked={requestLocation}
            onSelectCategory={filters.setCategoryId}
            query={filters.query}
            radiusKm={filters.radiusKm}
            selectedCategoryId={filters.categoryId}
          />

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
                minDiscount={filters.minDiscount}
                onChangeDiscount={filters.setMinDiscount}
                onChangePickup={filters.setPickup}
                pickup={filters.pickup}
              />
            }
          />
        </>
      }
      onRefresh={() => void dealsQuery.refetch()}
      refreshing={dealsQuery.isRefetching}
      renderItem={(deal) => <DealCard deal={deal} onPress={() => openDeal(deal)} />}
    />
  );
}
