import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { BrandButton } from '@/components/ui/brand-button';
import { EmptyCard } from '@/components/ui/empty-card';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { DEFAULT_DEAL_LOCATION } from '@/features/home/api/deals';
import { HomeIcons } from '@/features/home/constants/icons';
import { geocodeAddress, reverseGeocode, toGeocodeErrorMessage } from '@/features/map/api/geocode';
import { buildPickerHtml } from '@/features/map/components/goong-picker-html';
import type { LocationPickerModalProps } from '@/features/map/components/location-picker.types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { peekUserLocation, useUserLocation, type Coordinate } from '@/hooks/use-user-location';
import { goongStyleUrl, isGoongApiConfigured, isGoongConfigured } from '@/lib/goong';

const LOOKUP_DELAY_MS = 600;
const OVERVIEW_ZOOM = 14;
const PIN_ZOOM = 17;

type PickerMessage =
  { type: 'ready' | 'error' | 'moving' } | { type: 'pick'; lat: number; lng: number };

function parseMessage(raw: string): PickerMessage | null {
  try {
    const message = JSON.parse(raw) as { type?: unknown; lat?: unknown; lng?: unknown };

    if (message.type === 'ready' || message.type === 'error' || message.type === 'moving') {
      return { type: message.type };
    }
    if (
      message.type === 'pick' &&
      typeof message.lat === 'number' &&
      typeof message.lng === 'number' &&
      Number.isFinite(message.lat) &&
      Number.isFinite(message.lng)
    ) {
      return { type: 'pick', lat: message.lat, lng: message.lng };
    }
  } catch {
    // Không phải tin nhắn của trang chọn vị trí: bỏ qua.
  }

  return null;
}

/**
 * Cho người bán chọn vị trí quán trên bản đồ Goong: kéo bản đồ để căn ghim giữa màn hình vào đúng
 * chỗ, hoặc nhảy tới GPS / địa chỉ đã nhập. Dùng chung nền bản đồ với tab Bản đồ của người mua nên
 * ghim hiện đúng chỗ khi khách xem.
 */
export function LocationPickerModal({
  visible,
  initial,
  addressHint,
  onConfirm,
  onClose,
}: LocationPickerModalProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent={false}
      visible={visible}
    >
      {/* Chỉ dựng nội dung khi mở để mỗi lần mở bắt đầu từ toạ độ quán mới nhất. */}
      {visible ? (
        <PickerBody
          addressHint={addressHint}
          initial={initial}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      ) : null}
    </Modal>
  );
}

type PickerBodyProps = Pick<
  LocationPickerModalProps,
  'initial' | 'addressHint' | 'onConfirm' | 'onClose'
>;

function PickerBody({ initial, addressHint, onConfirm, onClose }: PickerBodyProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const userLocation = useUserLocation();
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Bắt đầu tại toạ độ quán đã lưu; chưa có thì tại GPS (coi như đã chọn, vì thường quán ở gần chỗ
  // seller đang đứng); chưa có GPS thì ở khu vực mặc định và chưa chọn gì cho tới khi họ kéo bản đồ.
  const [start] = useState<{ center: Coordinate; picked: Coordinate | null }>(() => {
    if (initial) return { center: initial, picked: initial };
    if (userLocation.coords) return { center: userLocation.coords, picked: userLocation.coords };

    return { center: DEFAULT_DEAL_LOCATION, picked: null };
  });
  const [picked, setPicked] = useState<Coordinate | null>(start.picked);
  const [isMoving, setIsMoving] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [fillAddress, setFillAddress] = useState(true);
  const [lookupTarget, setLookupTarget] = useState<Coordinate | null>(null);

  const html = buildPickerHtml({
    styleUrl: goongStyleUrl(scheme),
    center: start.center,
    zoom: initial ? PIN_ZOOM : OVERVIEW_ZOOM,
    pinColor: theme.primary,
  });

  // Chờ người bán ngừng kéo rồi mới tra địa chỉ, để mỗi lần chọn chỉ tốn một lượt trong hạn mức
  // Goong. Toạ độ quán đã lưu (chưa đổi) không tra lại.
  useEffect(() => {
    if (!picked || !isGoongApiConfigured || picked === initial) return;

    const timer = setTimeout(() => setLookupTarget(picked), LOOKUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [picked, initial]);

  const addressQuery = useQuery({
    enabled: lookupTarget !== null,
    queryKey: [
      'reverse-geocode',
      lookupTarget?.latitude.toFixed(5),
      lookupTarget?.longitude.toFixed(5),
    ],
    queryFn: ({ signal }) => reverseGeocode(lookupTarget as Coordinate, signal),
    staleTime: Infinity,
    retry: false,
  });

  // Chỉ coi kết quả là của điểm đang chọn khi đã tra xong đúng điểm đó.
  const isCurrentLookup = lookupTarget !== null && lookupTarget === picked;
  const isLookingUp =
    isGoongApiConfigured &&
    picked !== null &&
    picked !== initial &&
    (!isCurrentLookup || addressQuery.isFetching);
  const resolvedAddress = isCurrentLookup ? addressQuery.data : undefined;
  const lookupError = isCurrentLookup && addressQuery.isError ? addressQuery.error : null;

  const handleMessage = (event: WebViewMessageEvent) => {
    const message = parseMessage(event.nativeEvent.data);
    if (!message) return;

    switch (message.type) {
      case 'ready':
        setIsReady(true);
        break;
      case 'error':
        setHasFailed(true);
        break;
      case 'moving':
        setIsMoving(true);
        setHasMoved(true);
        setSearchError(null);
        break;
      case 'pick':
        setIsMoving(false);
        setPicked({ latitude: message.lat, longitude: message.lng });
        break;
    }
  };

  const moveTo = (coordinate: Coordinate) => {
    setPicked(coordinate);
    webViewRef.current?.injectJavaScript(
      `window.__setCenter(${coordinate.longitude}, ${coordinate.latitude}); true;`,
    );
  };

  // Xin quyền vị trí đúng lúc người bán bấm nút GPS, không hỏi trước khi họ cần.
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setSearchError(null);
    try {
      if (!userLocation.isReady) await userLocation.request();

      const { coords } = peekUserLocation();
      if (coords) moveTo(coords);
    } finally {
      setIsLocating(false);
    }
  };

  // Một lượt tra theo địa chỉ seller đã gõ trong form: bản đồ nhảy tới đó để họ chỉ cần căn lại ghim.
  const handleSearchAddress = async () => {
    setIsSearching(true);
    setSearchError(null);
    try {
      moveTo(await geocodeAddress(addressHint));
    } catch (error) {
      setSearchError(toGeocodeErrorMessage(error));
    } finally {
      setIsSearching(false);
    }
  };

  const retry = () => {
    setHasFailed(false);
    setIsReady(false);
    setReloadKey((key) => key + 1);
  };

  const canSearchAddress = isGoongApiConfigured && addressHint.trim().length > 0;
  const status = isMoving
    ? 'Thả tay để chốt vị trí'
    : !picked
      ? 'Kéo bản đồ để đưa ghim tới đúng vị trí quán'
      : isLookingUp
        ? 'Đang tra địa chỉ…'
        : (resolvedAddress?.formattedAddress ?? null);
  const errorText = searchError ?? (lookupError ? toGeocodeErrorMessage(lookupError) : null);

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          accessibilityLabel="Đóng"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClose}
        >
          <Text style={[styles.cancel, { color: theme.primary }]}>Huỷ</Text>
        </Pressable>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          Chọn vị trí quán
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.mapArea}>
        {isGoongConfigured ? (
          <>
            <WebView
              key={`${scheme}-${reloadKey}`}
              ref={webViewRef}
              javaScriptEnabled
              onLoadStart={() => setIsReady(false)}
              onMessage={handleMessage}
              originWhitelist={['*']}
              overScrollMode="never"
              scrollEnabled={false}
              source={{ html, baseUrl: 'https://localhost' }}
              style={[styles.webView, { backgroundColor: theme.background }]}
            />

            {!hasMoved && isReady ? (
              <View style={[styles.layer, styles.top]}>
                <View style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
                  <Text style={[styles.chipText, { color: theme.text }]}>
                    Kéo bản đồ để đưa ghim tới đúng vị trí quán
                  </Text>
                </View>
              </View>
            ) : null}

            {hasFailed ? (
              <View style={styles.overlay}>
                <ErrorState
                  message="Không tải được bản đồ. Kiểm tra mạng và khoá Goong rồi thử lại."
                  onRetry={retry}
                />
              </View>
            ) : null}

            <View style={[styles.layer, styles.bottom]}>
              <View style={styles.actions}>
                {canSearchAddress ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={!isReady || isSearching}
                    onPress={() => void handleSearchAddress()}
                    style={({ pressed }) => [
                      styles.searchButton,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                      (!isReady || isSearching) && styles.disabled,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Icon name={HomeIcons.search} color={theme.primary} size={15} />
                    <Text style={[styles.searchLabel, { color: theme.text }]}>
                      {isSearching ? 'Đang tìm…' : 'Tìm theo địa chỉ đã nhập'}
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  accessibilityLabel="Về vị trí của tôi"
                  accessibilityRole="button"
                  disabled={!isReady || isLocating}
                  onPress={() => void handleUseCurrentLocation()}
                  style={({ pressed }) => [
                    styles.gps,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                    (!isReady || isLocating) && styles.disabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Icon
                    name={userLocation.isReady ? HomeIcons.gpsOn : HomeIcons.gpsOff}
                    color={userLocation.isReady ? theme.primary : theme.textSecondary}
                    size={22}
                  />
                </Pressable>
              </View>

              <View
                style={[
                  styles.sheet,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}
              >
                {status ? (
                  <Text
                    accessibilityLiveRegion="polite"
                    numberOfLines={2}
                    style={[
                      resolvedAddress && !isMoving && !isLookingUp ? styles.address : styles.status,
                      {
                        color:
                          resolvedAddress && !isMoving && !isLookingUp
                            ? theme.text
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    {status}
                  </Text>
                ) : null}
                {errorText ? (
                  <Text
                    accessibilityLiveRegion="polite"
                    style={[styles.status, { color: theme.danger }]}
                  >
                    {errorText}
                  </Text>
                ) : null}
                {picked ? (
                  <Text style={[styles.coordinates, { color: theme.textSecondary }]}>
                    {picked.latitude.toFixed(6)}, {picked.longitude.toFixed(6)}
                  </Text>
                ) : null}

                {!isMoving && !isLookingUp && resolvedAddress ? (
                  <View style={styles.switchRow}>
                    <Text style={[styles.switchLabel, { color: theme.text }]}>
                      Điền địa chỉ này vào form
                    </Text>
                    <Switch
                      accessibilityLabel="Điền địa chỉ này vào form"
                      onValueChange={setFillAddress}
                      trackColor={{ true: theme.primary }}
                      value={fillAddress}
                    />
                  </View>
                ) : null}

                <BrandButton
                  disabled={!picked || isMoving || isLookingUp}
                  onPress={() =>
                    picked &&
                    onConfirm(picked, fillAddress && resolvedAddress ? resolvedAddress.parts : null)
                  }
                >
                  Xác nhận vị trí này
                </BrandButton>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.overlay}>
            <EmptyCard
              description="Thêm EXPO_PUBLIC_GOONG_MAPTILES_KEY vào file .env rồi chạy lại. Bạn vẫn nhập địa chỉ, toạ độ sẽ tự xác định khi lưu."
              title="Chưa cấu hình bản đồ Goong"
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cancel: { fontSize: 15, fontWeight: '800' },
  title: { fontSize: 17, fontWeight: '900' },
  headerSpacer: { width: 32 },
  mapArea: { flex: 1 },
  webView: { flex: 1 },
  // Lớp phủ để các nút trên bản đồ nhận chạm, còn vùng trống vẫn kéo/chạm được bản đồ bên dưới.
  layer: { position: 'absolute', right: 0, left: 0, padding: 12, pointerEvents: 'box-none' },
  top: { top: 0, alignItems: 'flex-start' },
  bottom: { bottom: 0, gap: 10 },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    padding: 24,
  },
  chip: {
    maxWidth: '78%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    boxShadow: '0px 4px 12px rgba(23, 33, 27, 0.18)',
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    boxShadow: '0px 4px 12px rgba(23, 33, 27, 0.18)',
  },
  searchLabel: { fontSize: 13, fontWeight: '700' },
  gps: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 24,
    boxShadow: '0px 4px 12px rgba(23, 33, 27, 0.18)',
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
  sheet: {
    gap: 8,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    boxShadow: '0px 10px 24px rgba(23, 33, 27, 0.2)',
  },
  address: { fontSize: 15, fontWeight: '800', lineHeight: 21 },
  status: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  coordinates: { fontSize: 12 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
});
