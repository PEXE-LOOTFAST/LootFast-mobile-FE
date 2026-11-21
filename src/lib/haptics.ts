import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Web không rung được; gọi API native ở đó chỉ sinh cảnh báo.
const enabled = Platform.OS !== 'web';

/**
 * Rung nhẹ xác nhận thao tác đã ăn: đặt giữ xong, quét mã thành công, gặp lỗi. Dùng tiết kiệm,
 * chỉ cho kết quả quan trọng, không rung ở mọi lần chạm.
 */
export const haptics = {
  success: () => {
    if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  error: () => {
    if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  /** Chạm nhẹ khi chọn một mục (vd. đổi số phần, chọn khung giờ). */
  select: () => {
    if (enabled) void Haptics.selectionAsync();
  },
};
