import { useQueries, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyCard } from '@/components/ui/empty-card';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { LoadingState } from '@/components/ui/loading-state';
import { DEFAULT_DEAL_LOCATION, getDeals } from '@/features/home/api/deals';
import { getStore } from '@/features/home/api/stores';
import { BuyerHeader } from '@/features/home/components/buyer-header';
import { LocationPrompt } from '@/features/home/components/location-prompt';
import { HomeIcons } from '@/features/home/constants/icons';
import { DealMap } from '@/features/map/components/deal-map';
import type { DealPinData } from '@/features/map/components/deal-map.types';
import { DealQuickView } from '@/features/map/components/deal-quick-view';
import { useTheme } from '@/hooks/use-theme';
import { useUserLocation, type Coordinate } from '@/hooks/use-user-location';
import { isGoongConfigured } from '@/lib/goong';

const RADIUS_KM = 5;

export function MapScreen() {
  const theme = useTheme();
  // Xin quyền ngay khi người dùng mở tab Bản đồ (lúc họ thật sự cần vị trí), không xin lúc mở app.
  // Từ chối thì bản đồ vẫn dùng khu vực mặc định và thẻ nhắc bên dưới cho họ bật lại sau.
  const userLocation = useUserLocation({ autoRequest: true });
  const location: Coordinate = userLocation.coords ?? DEFAULT_DEAL_LOCATION;
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [recenterKey, setRecenterKey] = useState(0);

  const dealsQuery = useQuery({
    enabled: isGoongConfigured,
    queryKey: ['map-deals', location],
    queryFn: () =>
      getDeals({
        latitude: location.latitude,
        longitude: location.longitude,
        radiusKm: RADIUS_KM,
      }),
  });

  // Feed deal không kèm toạ độ quán nên phải đọc hồ sơ từng quán để ghim đúng chỗ.
  const merchantIds = useMemo(
    () => [...new Set((dealsQuery.data ?? []).map((deal) => deal.store.merchantId))],
    [dealsQuery.data],
  );
  const storeQueries = useQueries({
    queries: merchantIds.map((merchantId) => ({
      queryKey: ['map-store-location', merchantId, location],
      queryFn: () => getStore(merchantId, location),
    })),
  });

  const pins = useMemo<DealPinData[]>(() => {
    const stores = new Map(
      storeQueries
        .map((query) => query.data)
        .filter((store): store is NonNullable<typeof store> => Boolean(store))
        .map((store) => [store.merchantId, store]),
    );

    return (dealsQuery.data ?? []).flatMap((deal) => {
      const store = stores.get(deal.store.merchantId);
      const latitude = store?.address.latitude;
      const longitude = store?.address.longitude;

      return latitude != null && longitude != null ? [{ deal, latitude, longitude }] : [];
    });
  }, [dealsQuery.data, storeQueries]);

  const selectedDeal = pins.find((pin) => pin.deal.id === selectedDealId)?.deal;
  const storesLoading = storeQueries.some((query) => query.isPending);
  const storesFailed = storeQueries.some((query) => query.isError);
  const isLoading = dealsQuery.isPending || storesLoading;
  const hasNoDeals = dealsQuery.isSuccess && dealsQuery.data.length === 0;
  const hasNoPins = dealsQuery.isSuccess && !hasNoDeals && !storesLoading && pins.length === 0;

  const handleRecenter = () => {
    if (userLocation.isReady) setRecenterKey((key) => key + 1);
    else void userLocation.request();
  };

  const handleOpenDeal = (dealId: string) =>
    router.navigate({ pathname: '/deal/[id]', params: { id: dealId } });

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BuyerHeader subtitle="Tìm deal cuối ngày quanh bạn" title="Bản đồ" />

      <View style={styles.mapArea}>
        {isGoongConfigured ? (
          <DealMap
            center={location}
            onSelectDeal={setSelectedDealId}
            pins={pins}
            recenterKey={recenterKey}
            selectedDealId={selectedDealId}
            showUserLocation={userLocation.isReady}
          />
        ) : (
          <View style={styles.setup}>
            <EmptyCard
              description="Thêm EXPO_PUBLIC_GOONG_MAPTILES_KEY vào file .env rồi chạy lại: npx expo start --clear"
              title="Chưa cấu hình bản đồ Goong"
            />
          </View>
        )}

        {isGoongConfigured ? (
          <>
            <View style={[styles.layer, styles.top]}>
              <LocationPrompt
                canAskAgain={userLocation.canAskAgain}
                onRequest={() => void userLocation.request()}
                purpose="xem deal quanh bạn"
                status={userLocation.status}
              />

              {dealsQuery.isError ? (
                <View style={[styles.panel, { backgroundColor: theme.backgroundElement }]}>
                  <ErrorState
                    message="Không thể tải deal quanh đây. Vui lòng thử lại."
                    onRetry={() => void dealsQuery.refetch()}
                    retrying={dealsQuery.isRefetching}
                  />
                </View>
              ) : null}

              {storesFailed && !dealsQuery.isError ? (
                <View style={[styles.panel, { backgroundColor: theme.backgroundElement }]}>
                  <ErrorState
                    message="Một số cửa hàng chưa hiện được vị trí. Vui lòng thử lại."
                    onRetry={() =>
                      storeQueries.forEach((query) => {
                        if (query.isError) void query.refetch();
                      })
                    }
                  />
                </View>
              ) : null}

              {isLoading && !dealsQuery.isError ? (
                <View style={[styles.panel, { backgroundColor: theme.backgroundElement }]}>
                  <LoadingState label="Đang tìm deal quanh bạn..." size="small" />
                </View>
              ) : null}

              {hasNoDeals ? (
                <EmptyCard
                  description="Thử di chuyển đến khu vực khác hoặc quay lại sau."
                  title="Chưa có deal quanh đây"
                />
              ) : null}

              {hasNoPins ? (
                <EmptyCard
                  description="Chưa lấy được toạ độ cửa hàng để ghim deal lên bản đồ."
                  title="Chưa thể hiển thị ghim"
                />
              ) : null}
            </View>

            <View style={[styles.layer, styles.bottom]}>
              <Pressable
                accessibilityLabel="Về vị trí của tôi"
                accessibilityRole="button"
                onPress={handleRecenter}
                style={({ pressed }) => [
                  styles.recenter,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  pressed && styles.pressed,
                ]}
              >
                <Icon
                  name={userLocation.isReady ? HomeIcons.gpsOn : HomeIcons.gpsOff}
                  color={userLocation.isReady ? theme.primary : theme.textSecondary}
                  size={22}
                />
              </Pressable>

              {selectedDeal ? (
                <DealQuickView
                  deal={selectedDeal}
                  onClose={() => setSelectedDealId(null)}
                  onOpen={() => handleOpenDeal(selectedDeal.id)}
                />
              ) : null}
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  mapArea: { flex: 1 },
  setup: { flex: 1, padding: 16 },
  // Lớp phủ để các nút cạnh bản đồ nhận chạm, còn vùng trống bên dưới vẫn kéo/chạm được bản đồ.
  layer: {
    position: 'absolute',
    right: 0,
    left: 0,
    gap: 10,
    padding: 12,
    pointerEvents: 'box-none',
  },
  top: { top: 0 },
  bottom: { bottom: 0, alignItems: 'flex-end' },
  panel: { borderRadius: 18, padding: 12 },
  recenter: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    boxShadow: '0px 6px 16px rgba(23, 33, 27, 0.2)',
  },
  pressed: { opacity: 0.8 },
});
