/**
 * Bo góc. Quy ước: chip/badge dùng `full`, ô nhập/nút nhỏ `md`, nút chính/thẻ `lg`,
 * thẻ lớn/section `xl`, sheet/dialog `xxl`.
 */
export const Radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

export type RadiusToken = keyof typeof Radius;
