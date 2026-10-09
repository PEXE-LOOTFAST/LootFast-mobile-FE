import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  /** Hiện hộp thoại xin quyền ngay khi mount. Mặc định chỉ đọc quyền đã cấp, không làm phiền. */
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
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      status: 'granted',
      coords: { latitude: current.coords.latitude, longitude: current.coords.longitude },
      canAskAgain: true,
    };
  } catch {
    return { status: 'unavailable', coords: null, canAskAgain: true };
  }
}

/** Đọc nhanh hai cờ quyền + dịch vụ vị trí, không đo toạ độ. */
async function observeStatus(): Promise<LocationStatus> {
  const permission = await Location.getForegroundPermissionsAsync();
  if (!permission.granted) return 'denied';

  return (await Location.hasServicesEnabledAsync()) ? 'granted' : 'gps-off';
}

export function useUserLocation({ autoRequest = false }: Options = {}) {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    status: 'checking',
    coords: null,
    canAskAgain: true,
  });
  const statusRef = useRef<LocationStatus>('checking');

  const commit = useCallback((next: Snapshot) => {
    statusRef.current = next.status;
    setSnapshot(next);
  }, []);

  useEffect(() => {
    let active = true;

    void readLocation(autoRequest).then((next) => {
      if (active) commit(next);
    });

    // Người dùng có thể bật/tắt GPS hoặc đổi quyền ở Cài đặt / thanh trạng thái khi app vẫn mở,
    // nên đối chiếu định kỳ và mỗi lần app quay lại để bộ lọc khoá/mở đúng theo thực tế.
    const sync = async () => {
      if (AppState.currentState !== 'active') return;

      try {
        const current = statusRef.current;
        if (current === 'checking') return;

        const observed = await observeStatus();
        if (observed === current) return;
        // Đã báo "không đọc được vị trí" thì chỉ thử lại khi người dùng bấm nút, tránh lặp vô hạn.
        if (current === 'unavailable' && observed === 'granted') return;

        const next = await readLocation(false);
        if (active) commit(next);
      } catch {
        // Bỏ qua: lần đối chiếu sau sẽ thử lại.
      }
    };

    const interval = setInterval(() => void sync(), SYNC_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void sync();
    });

    return () => {
      active = false;
      clearInterval(interval);
      subscription.remove();
    };
  }, [autoRequest, commit]);

  /**
   * Xin quyền / bật GPS / đọc lại vị trí tuỳ tình huống. Khi hệ điều hành không cho hỏi lại
   * (đã chọn "đừng hỏi lại") hoặc không có hộp thoại bật GPS (iOS) thì đưa vào Cài đặt.
   */
  const request = useCallback(async () => {
    const { status, canAskAgain } = snapshot;

    if (status === 'gps-off') {
      if (Platform.OS !== 'android') {
        await Linking.openSettings();
        return;
      }

      try {
        await Location.enableNetworkProviderAsync();
      } catch {
        // Người dùng từ chối hộp thoại bật GPS: chỉ báo trạng thái hiện tại, không ép.
      }
      commit(await readLocation(false));
      return;
    }

    if (status === 'denied' && !canAskAgain) {
      await Linking.openSettings();
      return;
    }

    commit(await readLocation(true));
  }, [commit, snapshot]);

  return {
    status: snapshot.status,
    coords: snapshot.coords,
    isReady: snapshot.status === 'granted' && snapshot.coords !== null,
    canAskAgain: snapshot.canAskAgain,
    request,
  };
}
