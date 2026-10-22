import { useQuery } from '@tanstack/react-query';

// Dữ liệu đơn vị hành chính mới của Việt Nam (tỉnh/thành → phường/xã, đã bỏ cấp quận/huyện), cùng
// hệ với kết quả Goong V2 nên tên tỉnh/phường chọn ở đây khớp với địa chỉ bản đồ trả về.
const BASE_URL = 'https://provinces.open-api.vn/api/v2';

export type ProvinceDto = { code: number; name: string };
export type WardDto = { code: number; name: string };

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) throw new Error(`Administrative units: ${response.status}`);

  return (await response.json()) as T;
}

// Bỏ tiền tố "Thành phố/Tỉnh" và dấu cách thừa để khớp tên Goong ("Hồ Chí Minh") với tên chuẩn.
const normalize = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/^(thành phố|tỉnh|tp\.?)\s+/, '');

export function useProvinces() {
  return useQuery({
    queryKey: ['administrative-units', 'provinces'],
    queryFn: () => getJson<ProvinceDto[]>('/p/'),
    staleTime: Infinity,
  });
}

export function findProvince(provinces: ProvinceDto[] | undefined, name: string) {
  const key = normalize(name);

  return key ? provinces?.find((province) => normalize(province.name) === key) : undefined;
}

export function useWards(provinceCode: number | undefined) {
  return useQuery({
    queryKey: ['administrative-units', 'wards', provinceCode],
    queryFn: () =>
      getJson<{ wards: WardDto[] }>(`/p/${provinceCode}?depth=2`).then(
        (province) => province.wards,
      ),
    enabled: provinceCode != null,
    staleTime: Infinity,
  });
}
