// Header giữ màu xanh đậm ở cả light lẫn dark mode: theme.primary bản dark là xanh nhạt,
// đặt chữ trắng lên sẽ không đủ tương phản.
export const HomeHeaderColors = {
  background: '#12703F',
  decoration: '#1D8A52',
  text: '#FFFFFF',
  textMuted: '#CFEBDA',
} as const;

// Chấm trạng thái trên nút (vd. GPS): đủ sáng để nổi trên cả nền header xanh đậm lẫn nền thẻ.
export const IndicatorColor = {
  on: '#34D27B',
  off: '#F59E0B',
} as const;

// Sao đánh giá dùng xanh dương để tách khỏi màu giá (xanh lá) và nhãn giảm giá (đỏ).
export const RatingColor = '#1B9FC9';
