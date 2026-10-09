import type { AddressParts } from '@/features/map/api/geocode';
import type { Coordinate } from '@/hooks/use-user-location';

export type LocationPickerModalProps = {
  visible: boolean;
  /** Toạ độ quán đã có (nếu hợp lệ): bản đồ mở tại đây và đặt sẵn ghim. */
  initial: Coordinate | null;
  /** Địa chỉ người bán đã nhập trong form (rỗng nếu chưa nhập); dùng cho nút "Tìm theo địa chỉ đã nhập". */
  addressHint: string;
  /** `address` chỉ có khi tra được địa chỉ và người bán bật "Điền địa chỉ theo vị trí này". */
  onConfirm: (coordinate: Coordinate, address: AddressParts | null) => void;
  onClose: () => void;
};
