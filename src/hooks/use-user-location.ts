import * as Location from 'expo-location';
import { useEffect, useSyncExternalStore } from 'react';
import { AppState, Linking, Platform } from 'react-native';

export type Coordinate = { latitude: number; longitude: number };

/**
 * checking: đang kiểm tra; granted: có quyền, GPS bật và đã có toạ độ; denied: chưa có quyền;
 * gps-off: có quyền nhưng dịch vụ vị trí của thiết bị đang tắt; unavailable: mọi thứ đều bật
 * nhưng vẫn không đọc được vị trí (thường do tín hiệu yếu).
 */
export type LocationStatus = 'checking' | 'granted' | 'denied' | 'gps-off' | 'unavailable';

type Snapshot = { status: LocationStatus; coords: Coordinate | null; canAskAgain: boolean };

type Options = {
  /** Hiện hộp thoại xin quyền khi màn mount (chỉ một lần mỗi lần mở app). Mặc định chỉ đọc quyền đã cấp. */
  autoRequest?: boolean;
};

// Đủ nhanh để người dùng vừa bật GPS từ thanh trạng thái là bộ lọc mở khoá, mà vẫn nhẹ vì chỉ
// hỏi hai cờ của hệ điều hành chứ không đo lại vị trí.
const SYNC_INTERVAL_MS = 4000;

async function readLocation(ask: boolean): Promise<Snapshot> {
  try {
    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted && ask && permission.canAskAgain) {
      permission = await Location.requestForegroundPermissionsAsync();
    }

    if (!permission.granted) {
      return { status: 'denied', coords: null, canAskAgain: permission.canAskAgain };
    }
    if (!(await Location.hasServicesEnabledAsync())) {
      return { status: 'gps-off', coords: null, canAskAgain: true };
    }

    const current = await Location.getCurrentPositionAsync({
      // Android có thể đọc GPS dù người dùng tắt Google Location Accuracy.
      accuracy: Platform.OS === 'android' ? Location.Accuracy.High : Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: false,
    });

    return {
      status: 'granted',
      coords: { latitude: current.coords.latitude, longitude: current.coords.longitude },
      canAskAgain: true,
    };
  } catch (error) {
    if (__DEV__) console.warn('[location] Failed to read current position', error);
    return { status: 'unavailable', coords: null, canAskAgain: true };
  }
}

/** Đọc nhanh hai cờ quyền + dịch vụ vị trí, không đo toạ độ. */
async function observeStatus(): Promise<LocationStatus> {
  const permission = await Location.getForegroundPermissionsAsync();
  if (!permission.granted) return 'denied';

  return (await Location.hasServicesEnabledAsync()) ? 'granted' : 'gps-off';
}

// Trạng thái vị trí dùng chung cho cả app: header của mọi tab, Trang chủ và Bản đồ đọc cùng một
// nguồn nên không tranh nhau xin quyền hay đo GPS, và đổi ở đâu thì mọi nơi đều thấy ngay.
let snapshot: Snapshot = { status: 'checking', coords: null, canAskAgain: true };
const listeners = new Set<() => void>();
// Chỉ kết quả của lần đọc mới nhất được ghi nhận, tránh lần đọc chậm ghi đè lần đọc mới hơn.
let latestRead = 0;
let hasAutoRequested = false;
let stopSync: (() => void) | null = null;

function commit(next: Snapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

async function refresh(ask: boolean) {
  const id = ++latestRead;
  const next = await readLocation(ask);
  if (id === latestRead) commit(next);
}

// Người dùng có thể bật/tắt GPS hoặc đổi quyền ở Cài đặt / thanh trạng thái khi app vẫn mở, nên
// đối chiếu định kỳ và mỗi lần app quay lại để bộ lọc khoá/mở đúng theo thực tế.
async function sync() {
  if (AppState.currentState !== 'active') return;

  try {
    const current = snapshot.status;
    if (current === 'checking') return;

    const observed = await observeStatus();
    if (observed === current) return;
    // Đã báo "không đọc được vị trí" thì chỉ thử lại khi người dùng bấm nút, tránh lặp vô hạn.
    if (current === 'unavailable' && observed === 'granted') return;

    await refresh(false);
  } catch {
    // Bỏ qua: lần đối chiếu sau sẽ thử lại.
  }
}

function startSync() {
  void refresh(false);

  const interval = setInterval(() => void sync(), SYNC_INTERVAL_MS);
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') void sync();
  });

  return () => {
    clearInterval(interval);
    subscription.remove();
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Chỉ chạy vòng đối chiếu khi có màn đang cần vị trí.
  if (listeners.size === 1) stopSync = startSync();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopSync?.();
      stopSync = null;
    }
  };
}

const getSnapshot = () => snapshot;

/** Đọc trạng thái mới nhất ngoài React, dùng sau một `await request()` khi closure đã cũ. */
export const peekUserLocation = () => snapshot;

/**
 * Xin quyền / đọc lại vị trí tuỳ tình huống. Dịch vụ vị trí đang tắt thì mở cài đặt vị trí;
 * quyền bị chặn (đã chọn "đừng hỏi lại") thì mở cài đặt ứng dụng.
 */
async function request() {
  const { status, canAskAgain } = snapshot;

  if (status === 'gps-off') {
    if (Platform.OS === 'android') {
      await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(() =>
        Linking.openSettings(),
      );
    } else {
      await Linking.openSettings();
    }
    return;
  }

  if (status === 'denied' && !canAskAgain) {
    await Linking.openSettings();
    return;
  }

  await refresh(true);
}

export function useUserLocation({ autoRequest = false }: Options = {}) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!autoRequest || hasAutoRequested) return;

    hasAutoRequested = true;
    void refresh(true);
  }, [autoRequest]);

  return {
    status: current.status,
    coords: current.coords,
    isReady: current.status === 'granted' && current.coords !== null,
    canAskAgain: current.canAskAgain,
    request,
  };
}
