import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { MaxContentWidth } from '@/constants/theme';
import { getDealErrorMessage } from '@/features/home/api/deals';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { DealCard } from '@/features/home/components/deal-card';
import { DealFilterButton } from '@/features/home/components/deal-filter-button';
import { EmptyDeals } from '@/features/home/components/empty-deals';
import { HomeHeader } from '@/features/home/components/home-header';
import { NotificationSheet } from '@/features/home/components/notification-sheet';
import { SearchPanel } from '@/features/home/components/search-panel';
import { SectionHeader } from '@/features/home/components/section-header';
import { DEAL_CATEGORIES } from '@/features/home/data/mock-deals';
import { useDeals } from '@/features/home/api/use-deals';
import { MOCK_NOTIFICATIONS } from '@/features/home/data/mock-notifications';
import { filterDeals, useDealFilters } from '@/features/home/hooks/use-deal-filters';
import { useNotifications } from '@/features/home/hooks/use-notifications';
import type { Deal } from '@/features/home/types';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { requireAuth, withAuth } from '@/lib/auth-session';
import { formatRadius } from '@/lib/format';

const HORIZONTAL_INSET = 16;

export function HomeScreen() {
  const theme = useTheme();
  const { isAuthenticated } = useAuthSession();
  const filters = useDealFilters([]);
  const dealsQuery = useDeals({
    categoryCode: filters.categoryId === 'all' ? undefined : filters.categoryId,
    keyword: filters.query,
    radiusKm: filters.radiusKm,
  });
  const deals = dealsQuery.data ?? [];
  const filteredDeals = filterDeals(deals, filters);
  const { notifications, unreadCount, markAsRead } = useNotifications(MOCK_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Header nền xanh đậm cần icon status bar màu sáng. Trả về 'auto' khi rời màn,
  // nếu không các màn nền sáng khác sẽ bị icon trắng chìm mất.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

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
        <HomeHeader
          isAuthenticated={isAuthenticated}
          locationLabel={`Gần bạn · ${formatRadius(filters.radiusKm)}`}
          onPressNotifications={() => setIsNotificationsOpen(true)}
          onPressSignIn={withAuth()}
          unreadCount={unreadCount}
        />

        <View style={styles.body}>
          <SearchPanel
            categories={DEAL_CATEGORIES}
            isLocked={!isAuthenticated}
            onChangeQuery={filters.setQuery}
            onChangeRadius={filters.setRadiusKm}
            onPressLocked={withAuth()}
            onSelectCategory={(id) => requireAuth(() => filters.setCategoryId(id))}
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
                  isLocked={!isAuthenticated}
                  minDiscount={filters.minDiscount}
                  onChangeDiscount={filters.setMinDiscount}
                  onChangePickup={filters.setPickup}
                  onPressLocked={withAuth()}
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
              <EmptyDeals onReset={withAuth(filters.resetFilters)} />
            )}
          </View>
        </View>
      </ScrollView>

      <AssistantFab />

      <NotificationSheet
        notifications={notifications}
        onClose={() => setIsNotificationsOpen(false)}
        onPressItem={markAsRead}
        visible={isNotificationsOpen}
      />
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
