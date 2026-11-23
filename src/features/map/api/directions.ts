import { useQuery } from '@tanstack/react-query';
import { Linking } from 'react-native';

import { useUserLocation, type Coordinate } from '@/hooks/use-user-location';
import { goongApiUrl, isGoongApiConfigured } from '@/lib/goong';

export type RoadRoute = { distanceKm: number; durationMinutes: number };

type DirectionResponse = {
  routes?: { legs?: { distance?: { value?: number }; duration?: { value?: number } }[] }[];
};

const toParam = ({ latitude, longitude }: Coordinate) => `${latitude},${longitude}`;

/**
 * Quãng đường và thời gian đi xe máy theo đường thật (Goong Direction). Khoảng cách backend trả là
 * đường thẳng giữa hai điểm, thường ngắn hơn đường phải đi.
 */
export async function getRoadRoute(origin: Coordinate, destination: Coordinate) {
  const response = await fetch(
    goongApiUrl('/Direction', {
      origin: toParam(origin),
      destination: toParam(destination),
      vehicle: 'bike',
    }),
  );
  if (!response.ok) throw new Error(`Direction ${response.status}`);

  const leg = ((await response.json()) as DirectionResponse).routes?.[0]?.legs?.[0];
  const meters = leg?.distance?.value;
  const seconds = leg?.duration?.value;
  if (meters == null || seconds == null) throw new Error('Direction: no route');

  return {
    distanceKm: meters / 1000,
    durationMinutes: Math.max(1, Math.round(seconds / 60)),
  } satisfies RoadRoute;
}

// Làm tròn vị trí người dùng (~100m) để đi vài bước không gọi lại API.
const roundCoord = ({ latitude, longitude }: Coordinate) => ({
  latitude: Math.round(latitude * 1000) / 1000,
  longitude: Math.round(longitude * 1000) / 1000,
});

/** Đường đi từ vị trí hiện tại tới quán; chưa có GPS hoặc chưa cấu hình Goong thì không gọi. */
export function useRoadRoute(destination: Partial<Coordinate> | null | undefined) {
  const { coords } = useUserLocation();
  const origin = coords ? roundCoord(coords) : null;
  const target =
    destination?.latitude != null && destination.longitude != null
      ? { latitude: destination.latitude, longitude: destination.longitude }
      : null;

  return useQuery({
    enabled: isGoongApiConfigured && Boolean(origin && target),
    queryKey: ['road-route', origin, target],
    queryFn: () => getRoadRoute(origin as Coordinate, target as Coordinate),
    staleTime: 10 * 60_000,
    retry: false,
  });
}

/**
 * Mở chỉ đường theo đường thật trong Google Maps (app nếu có, không thì trình duyệt). Có toạ độ thì
 * dẫn tới đúng điểm, không thì tìm theo địa chỉ chữ.
 */
export function openDirections(destination: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
}) {
  const target =
    destination.latitude != null && destination.longitude != null
      ? `${destination.latitude},${destination.longitude}`
      : destination.address?.trim();
  if (!target) return;

  const query = new URLSearchParams({ api: '1', destination: target, travelmode: 'driving' });
  void Linking.openURL(`https://www.google.com/maps/dir/?${query.toString()}`);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}
