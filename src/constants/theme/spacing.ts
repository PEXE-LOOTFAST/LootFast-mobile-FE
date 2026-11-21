/**
 * Khoảng cách theo lưới 4pt (thêm bậc 2 cho chi tiết rất nhỏ). Dùng cho padding, margin, gap.
 * Giá trị lệch lưới cũ (6, 10, 14…) khi chuyển sang token thì làm tròn về bậc gần nhất.
 */
export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export type SpacingToken = keyof typeof Spacing;

/** Lề trái/phải chuẩn của nội dung màn hình. */
export const ScreenGutter = Spacing.lg;

/** Bề rộng tối đa của nội dung trên màn lớn (tablet, web). */
export const MaxContentWidth = 800;
