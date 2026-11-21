import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { ErrorState } from '@/components/ui/error-state';
import { IndicatorColor, Spacing, UserLocationColor } from '@/constants/theme';
import { buildMapHtml } from '@/features/map/components/goong-map-html';
import type { DealMapProps } from '@/features/map/components/deal-map.types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { goongStyleUrl } from '@/lib/goong';

const DEFAULT_ZOOM = 13.5;
const LOAD_TIMEOUT_MS = 15000;

type PageMessage = { type: 'ready' | 'error' | 'deselect' } | { type: 'select'; id: string };

function parseMessage(raw: string): PageMessage | null {
  try {
    const message = JSON.parse(raw) as { type?: unknown; id?: unknown };

    if (message.type === 'select' && typeof message.id === 'string') {
      return { type: 'select', id: message.id };
    }
    if (message.type === 'ready' || message.type === 'error' || message.type === 'deselect') {
      return { type: message.type };
    }
  } catch {
    // Không phải tin nhắn của trang bản đồ: bỏ qua.
  }

  return null;
}

// Bản đồ Goong dựng trong WebView. App đẩy trạng thái (ghim, ghim đang chọn, tâm bản đồ) vào trang
// qua injectJavaScript, trang gửi lại thao tác chạm qua postMessage. Toạ độ gửi sang trang theo
// thứ tự [kinh độ, vĩ độ] như MapLibre yêu cầu.
export function DealMap({
  center,
  pins,
  selectedDealId,
  onSelectDeal,
  recenterKey,
  showUserLocation,
}: DealMapProps) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Tâm ban đầu chỉ dùng để dựng trang; các lần đổi tâm sau đó đi qua bay camera, không tải lại.
  const [initialCenter] = useState(center);

  const html = useMemo(
    () =>
      buildMapHtml({ styleUrl: goongStyleUrl(scheme), center: initialCenter, zoom: DEFAULT_ZOOM }),
    [scheme, initialCenter],
  );

  // Trang không báo "ready" trong thời gian này (mất mạng, không tải được MapLibre/Goong) thì coi là lỗi.
  useEffect(() => {
    if (isReady || hasFailed) return;

    const timer = setTimeout(() => setHasFailed(true), LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isReady, hasFailed, reloadKey, scheme]);

  useEffect(() => {
    if (!isReady) return;

    const state = {
      pins: pins.map(({ deal, latitude, longitude }) => ({
        id: deal.id,
        lat: latitude,
        lng: longitude,
        label: `${Math.round(deal.price / 1000)}k`,
      })),
      selectedId: selectedDealId,
      center: [center.longitude, center.latitude],
      recenterKey,
      user: showUserLocation ? [center.longitude, center.latitude] : null,
      colors: { pin: theme.primary, selected: IndicatorColor.off, user: UserLocationColor },
    };

    webViewRef.current?.injectJavaScript(`window.__apply(${JSON.stringify(state)}); true;`);
  }, [isReady, pins, selectedDealId, center, recenterKey, showUserLocation, theme.primary]);

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
      case 'deselect':
        onSelectDeal(null);
        break;
      case 'select':
        onSelectDeal(message.id);
        break;
    }
  };

  const retry = () => {
    setHasFailed(false);
    setIsReady(false);
    setReloadKey((key) => key + 1);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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

      {hasFailed ? (
        <View style={styles.error}>
          <ErrorState
            message="Không tải được bản đồ. Kiểm tra mạng và khoá Goong rồi thử lại."
            onRetry={retry}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webView: { flex: 1 },
  error: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
});
