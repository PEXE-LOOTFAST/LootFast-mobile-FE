import type { Deal } from '@/features/home/types';
import type { Coordinate } from '@/hooks/use-user-location';

export type DealPinData = { deal: Deal; latitude: number; longitude: number };

export type DealMapProps = {
  /** Tâm bản đồ: vị trí của người dùng, hoặc khu vực mặc định khi chưa có GPS. */
  center: Coordinate;
  pins: DealPinData[];
  selectedDealId: string | null;
  /** null khi người dùng chạm vào chỗ trống để bỏ chọn. */
  onSelectDeal: (dealId: string | null) => void;
  /** Tăng giá trị này để đưa camera về lại `center` (nút "vị trí của tôi"). */
  recenterKey: number;
  /** Chỉ vẽ chấm vị trí người dùng khi đã có quyền và GPS bật. */
  showUserLocation: boolean;
};
