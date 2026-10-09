import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueries, useQuery } from '@tanstack/react-query';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { EmptyCard } from '@/components/ui/empty-card';
import { getDeals, DEFAULT_DEAL_LOCATION } from '@/features/home/api/deals';
import { getStore } from '@/features/home/api/stores';
import { useTheme } from '@/hooks/use-theme';

const RADIUS_KM = 5;

type Coordinate = { latitude: number; longitude: number };

export function MapScreen() {
  const theme = useTheme();
  const [location, setLocation] = useState<Coordinate>(DEFAULT_DEAL_LOCATION);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function requestLocation() {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!active) return;

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocationMessage('Chưa cấp quyền vị trí. Đang hiển thị deal quanh khu vực mặc định.');
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      if (active) {
        setLocation({ latitude: current.coords.latitude, longitude: current.coords.longitude });
      }
    }

    void requestLocation().catch(() => {
      if (active) setLocationMessage('Không lấy được vị trí. Đang dùng khu vực mặc định.');
    });

    return () => {
      active = false;
    };
  }, []);

  const dealsQuery = useQuery({
    queryKey: ['map-deals', location],
    queryFn: () =>
      getDeals({
        latitude: location.latitude,
        longitude: location.longitude,
        radiusKm: RADIUS_KM,
      }),
  });

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

  const markers = useMemo(() => {
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

  const mapRegion: Region = {
    ...location,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };
  const selectedDeal = dealsQuery.data?.find((deal) => deal.id === selectedDealId);
  const storesLoading = storeQueries.some((query) => query.isPending);
  const storesError = storeQueries.find((query) => query.error)?.error;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Bản đồ</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Tìm deal cuối ngày quanh bạn
        </Text>

        {locationMessage ? <InlineAlert message={locationMessage} /> : null}
        {dealsQuery.isError ? (
          <View style={styles.feedback}>
            <InlineAlert message="Không thể tải deal quanh đây. Vui lòng thử lại." />
            <BrandButton
              loading={dealsQuery.isRefetching}
              onPress={() => void dealsQuery.refetch()}
            >
              Thử lại
            </BrandButton>
          </View>
        ) : dealsQuery.isPending || storesLoading ? (
          <View style={styles.feedback}>
            <ActivityIndicator color={theme.primary} size="large" />
            <Text style={{ color: theme.textSecondary }}>Đang tìm deal quanh bạn...</Text>
          </View>
        ) : dealsQuery.data.length === 0 ? (
          <EmptyCard
            description="Thử di chuyển đến khu vực khác hoặc quay lại sau."
            title="Chưa có deal quanh đây"
          />
        ) : storesError ? (
          <View style={styles.feedback}>
            <InlineAlert message="Không thể tải vị trí cửa hàng. Vui lòng thử lại." />
            <BrandButton loading={storesLoading} onPress={() => void dealsQuery.refetch()}>
              Thử lại
            </BrandButton>
          </View>
        ) : markers.length === 0 ? (
          <EmptyCard
            description="Backend chưa trả đủ tọa độ cửa hàng để ghim deal trên bản đồ."
            title="Chưa thể hiển thị ghim"
          />
        ) : (
          <>
            <MapView
              initialRegion={mapRegion}
              region={mapRegion}
              showsUserLocation
              style={styles.map}
            >
              {markers.map(({ deal, latitude, longitude }) => (
                <Marker
                  key={deal.id}
                  coordinate={{ latitude, longitude }}
                  onPress={() => setSelectedDealId(deal.id)}
                >
                  <Callout onPress={() => router.push(`/deal/${deal.id}`)}>
                    <View style={styles.callout}>
                      <Text style={styles.calloutName}>{deal.name}</Text>
                      <Text>{deal.store.name}</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>
            {selectedDeal ? (
              <Pressable
                onPress={() => router.push(`/deal/${selectedDeal.id}`)}
                style={[styles.quickView, { backgroundColor: theme.backgroundElement }]}
              >
                <Text style={[styles.quickName, { color: theme.text }]}>{selectedDeal.name}</Text>
                <Text style={{ color: theme.textSecondary }}>{selectedDeal.store.name}</Text>
                <Text style={{ color: theme.primary }}>Chạm để xem chi tiết</Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, gap: 10, padding: 20 },
  title: { marginTop: 10, fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { marginBottom: 4, fontSize: 14 },
  feedback: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  map: { flex: 1, minHeight: 360, overflow: 'hidden', borderRadius: 22 },
  callout: { gap: 4, maxWidth: 200, padding: 4 },
  calloutName: { fontWeight: '800' },
  quickView: {
    gap: 5,
    borderRadius: 16,
    padding: 14,
    boxShadow: '0px 4px 12px rgba(23, 33, 27, 0.12)',
  },
  quickName: { fontSize: 15, fontWeight: '800' },
});
