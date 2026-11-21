/**
 * Đổ bóng (cú pháp `boxShadow` của React Native 0.76+). Màu bóng không đổi theo dark mode:
 * trên nền tối bóng gần như chìm, đó là chủ ý.
 */
export const Shadow = {
  /** Thẻ nằm trên nền màn hình. */
  card: '0px 4px 12px rgba(23, 33, 27, 0.05)',
  /** Phần tử nổi nhẹ bên trong một khối (vd. tab đang chọn). */
  raised: '0px 2px 8px rgba(23, 33, 27, 0.1)',
  /** Nút/thẻ nổi trên bản đồ hoặc ảnh. */
  floating: '0px 4px 12px rgba(23, 33, 27, 0.18)',
  /** Dialog, popover, bottom sheet. */
  overlay: '0px 16px 36px rgba(23, 33, 27, 0.18)',
  /** Thanh tab đáy (bóng hắt lên trên). */
  tabBar: '0px -6px 20px rgba(23, 33, 27, 0.06)',
  /** Nút chính màu thương hiệu. */
  brand: '0px 8px 18px rgba(22, 121, 75, 0.25)',
  brandStrong: '0px 12px 28px rgba(22, 121, 75, 0.32)',
} as const;

export type ShadowToken = keyof typeof Shadow;
