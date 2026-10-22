import type { Coordinate } from '@/hooks/use-user-location';
import { goongApiUrl, isGoongApiConfigured } from '@/lib/goong';

/** Địa chỉ tách theo bốn ô trong form địa chỉ quán. */
export type AddressParts = {
  addressLine: string;
  ward: string;
  district: string;
  city: string;
};

export type GeocodeErrorCode = 'NOT_CONFIGURED' | 'NETWORK' | 'DENIED' | 'QUOTA' | 'NOT_FOUND';

export class GeocodeError extends Error {
  constructor(readonly code: GeocodeErrorCode) {
    super(code);
    this.name = 'GeocodeError';
  }
}

// Chỉ khai báo các trường dùng tới. V2 trả đơn vị hành chính mới (xã/phường, tỉnh/thành, không còn
// cấp quận); khi bật has_deprecated_administrative_unit thì kèm tên cũ trong deprecated_compound.
type GeocodeResult = {
  formatted_address?: string;
  compound?: { commune?: string; district?: string; province?: string };
  deprecated_compound?: { commune?: string; district?: string; province?: string };
};

type GeocodeResponse = { status?: string; results?: GeocodeResult[] };

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// Bỏ phần tử cuối nếu đúng là `name`, để phần còn lại chính là số nhà + đường.
function stripTrailing(parts: string[], name: string) {
  const last = parts[parts.length - 1];
  if (name && parts.length > 1 && last && sameName(last, name)) parts.pop();
}

/**
 * Tách kết quả của Goong thành bốn ô địa chỉ. Chỉ là gợi ý: người bán luôn xem và sửa được trước khi
 * lưu, vì Goong có thể trả thiếu cấp hoặc chưa chính xác ở hẻm nhỏ.
 */
export function parseGoongAddress(result: GeocodeResult): AddressParts {
  const formatted = (result.formatted_address ?? '').trim();
  const parts = formatted
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const compound = result.compound ?? {};
  const deprecated = result.deprecated_compound ?? {};

  let city = compound.province ?? '';
  let ward = compound.commune ?? '';
  let district = compound.district ?? deprecated.district ?? '';

  if (!city) {
    // Địa chỉ dạng cũ "số nhà, phường, quận, thành phố": chỉ tách theo vị trí khi đủ bốn phần, thiếu
    // thì để nguyên chuỗi ở ô đầu còn các ô cấp hành chính để trống cho người bán tự nhập.
    if (parts.length < 4) return { addressLine: formatted, ward: '', district: '', city: '' };

    city = parts.pop() ?? '';
    district = district || (parts.pop() ?? '');
    ward = ward || (parts.pop() ?? '');

    return { addressLine: parts.join(', '), ward, district, city };
  }

  stripTrailing(parts, city);
  stripTrailing(parts, district);
  stripTrailing(parts, ward);

  return { addressLine: parts.join(', '), ward, district, city };
}

// Gọi Goong Geocode V2 (cả hai chiều) và trả kết quả đầu tiên, gộp mọi lỗi mạng/khoá/hạn mức vào
// GeocodeError để nơi gọi chỉ cần hiển thị thông báo.
async function fetchFirstResult(
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<GeocodeResult & { geometry?: { location?: { lat: number; lng: number } } }> {
  if (!isGoongApiConfigured) throw new GeocodeError('NOT_CONFIGURED');

  let response: Response;
  try {
    response = await fetch(goongApiUrl('/v2/geocode', params), { signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new GeocodeError('NETWORK');
  }

  if (response.status === 401 || response.status === 403) throw new GeocodeError('DENIED');
  if (response.status === 429) throw new GeocodeError('QUOTA');
  if (!response.ok) throw new GeocodeError('NETWORK');

  const payload = (await response.json()) as GeocodeResponse & {
    results?: { geometry?: { location?: { lat: number; lng: number } } }[];
  };
  const first = payload.results?.[0];

  if ((payload.status && payload.status !== 'OK') || !first) throw new GeocodeError('NOT_FOUND');

  return first;
}

/** Đổi toạ độ ra địa chỉ bằng Goong Reverse Geocode (V2). */
export async function reverseGeocode(
  coordinate: Coordinate,
  signal?: AbortSignal,
): Promise<{ formattedAddress: string; parts: AddressParts }> {
  const first = await fetchFirstResult(
    {
      latlng: `${coordinate.latitude},${coordinate.longitude}`,
      has_deprecated_administrative_unit: 'true',
    },
    signal,
  );
  if (!first.formatted_address) throw new GeocodeError('NOT_FOUND');

  return { formattedAddress: first.formatted_address, parts: parseGoongAddress(first) };
}

/** Đổi địa chỉ chữ ra toạ độ bằng Goong Geocode (V2), dùng để bản đồ nhảy tới địa chỉ đã nhập. */
export async function geocodeAddress(address: string, signal?: AbortSignal): Promise<Coordinate> {
  const first = await fetchFirstResult({ address }, signal);
  const location = first.geometry?.location;

  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
    throw new GeocodeError('NOT_FOUND');
  }

  return { latitude: location.lat, longitude: location.lng };
}

export type AddressSuggestion = { placeId: string; description: string };

/** Gợi ý địa chỉ thật ở Việt Nam theo chữ người bán đang gõ (Goong Place AutoComplete). */
export async function suggestAddresses(
  input: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  if (!isGoongApiConfigured) throw new GeocodeError('NOT_CONFIGURED');

  let response: Response;
  try {
    response = await fetch(goongApiUrl('/Place/AutoComplete', { input }), { signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new GeocodeError('NETWORK');
  }
  if (!response.ok) throw new GeocodeError('NETWORK');

  const payload = (await response.json()) as {
    predictions?: { place_id?: string; description?: string }[];
  };

  return (payload.predictions ?? []).flatMap((item) =>
    item.place_id && item.description
      ? [{ placeId: item.place_id, description: item.description }]
      : [],
  );
}

/** Lấy toạ độ và địa chỉ tách ô của một gợi ý đã chọn (Goong Place Detail). */
export async function getSuggestedPlace(
  placeId: string,
  signal?: AbortSignal,
): Promise<{ coordinate: Coordinate; parts: AddressParts }> {
  if (!isGoongApiConfigured) throw new GeocodeError('NOT_CONFIGURED');

  let response: Response;
  try {
    response = await fetch(goongApiUrl('/Place/Detail', { place_id: placeId }), { signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new GeocodeError('NETWORK');
  }
  if (!response.ok) throw new GeocodeError('NETWORK');

  const { result } = (await response.json()) as {
    result?: GeocodeResult & { geometry?: { location?: { lat: number; lng: number } } };
  };
  const location = result?.geometry?.location;

  if (!result || !location) throw new GeocodeError('NOT_FOUND');

  return {
    coordinate: { latitude: location.lat, longitude: location.lng },
    parts: parseGoongAddress(result),
  };
}

export function toGeocodeErrorMessage(error: unknown): string {
  if (error instanceof GeocodeError) {
    const messages: Record<GeocodeErrorCode, string> = {
      NOT_CONFIGURED: 'Chưa cấu hình khoá Goong API.',
      NETWORK: 'Không lấy được địa chỉ. Kiểm tra mạng rồi chọn lại vị trí.',
      DENIED: 'Khoá Goong API bị từ chối. Kiểm tra khoá và giới hạn của khoá.',
      QUOTA: 'Đã hết lượt tra địa chỉ hôm nay. Hãy nhập địa chỉ bằng tay.',
      NOT_FOUND: 'Chưa tìm thấy địa chỉ phù hợp. Hãy nhập địa chỉ bằng tay.',
    };

    return messages[error.code];
  }

  return 'Không lấy được địa chỉ. Hãy nhập địa chỉ bằng tay.';
}
