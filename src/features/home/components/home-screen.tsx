import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';
import { DealCard } from '@/features/home/components/deal-card';
import { EmptyDeals } from '@/features/home/components/empty-deals';
import { HomeHeader } from '@/features/home/components/home-header';
import { IconButton } from '@/features/home/components/icon-button';
import { LowStockSection } from '@/features/home/components/low-stock-section';
import { SearchPanel } from '@/features/home/components/search-panel';
import { SectionHeader } from '@/features/home/components/section-header';
import { HomeIcons } from '@/features/home/constants/icons';
import {
  DEAL_CATEGORIES,
  MOCK_DEALS,
  MOCK_LOCATION,
  MOCK_UNREAD_NOTIFICATIONS,
} from '@/features/home/data/mock-deals';
import { useDealFilters } from '@/features/home/hooks/use-deal-filters';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { requireAuth, signOut, withAuth } from '@/lib/auth-session';

const HORIZONTAL_INSET = 16;

export function HomeScreen() {
  const theme = useTheme();
  const { isAuthenticated } = useAuthSession();
  const {
    categoryId,
    setCategoryId,
    query,
    setQuery,
    isFiltering,
    filteredDeals,
    lowStockDeals,
    resetFilters,
  } = useDealFilters(MOCK_DEALS);

  // Header nền xanh đậm cần icon status bar màu sáng. Trả về 'auto' khi rời màn,
  // nếu không các màn nền sáng khác sẽ bị icon trắng chìm mất.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  const handlePressProfile = () => {
    // Không truyền thao tác chờ: nếu không, đăng nhập xong sẽ bật ngay hộp thoại đăng xuất.
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    Alert.alert('Tài khoản', 'Bạn muốn đăng xuất khỏi LootFast?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          address={MOCK_LOCATION.address}
          onPressNotifications={withAuth()}
          onPressProfile={handlePressProfile}
          unreadCount={MOCK_UNREAD_NOTIFICATIONS}
        />

        <View style={styles.body}>
          <SearchPanel
            categories={DEAL_CATEGORIES}
            isSearchLocked={!isAuthenticated}
            onChangeQuery={setQuery}
            onPressLockedSearch={withAuth()}
            onPressRadius={withAuth()}
            onSelectCategory={(id) => requireAuth(() => setCategoryId(id))}
            query={query}
            radiusKm={MOCK_LOCATION.radiusKm}
            selectedCategoryId={categoryId}
          />

          {isFiltering ? null : (
            <LowStockSection
              deals={lowStockDeals}
              horizontalInset={HORIZONTAL_INSET}
              onPressDeal={withAuth()}
            />
          )}

          <View style={styles.section}>
            <SectionHeader
              title={isFiltering ? 'Kết quả tìm kiếm' : 'Gợi ý gần bạn'}
              subtitle={
                isFiltering
                  ? `${filteredDeals.length} deal phù hợp`
                  : 'Ưu tiên món gần, tiết kiệm và được đánh giá cao'
              }
              action={
                <IconButton
                  accessibilityLabel="Bộ lọc nâng cao"
                  icon={HomeIcons.filter}
                  onPress={withAuth()}
                />
              }
            />

            {filteredDeals.length > 0 ? (
              filteredDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onPress={withAuth()} />
              ))
            ) : (
              <EmptyDeals onReset={withAuth(resetFilters)} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 120 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 28,
    marginTop: -44,
    paddingHorizontal: HORIZONTAL_INSET,
  },
  section: { gap: 16 },
});
