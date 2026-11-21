/**
 * Thang cỡ chữ. Cỡ lẻ cũ (12.5, 17, 19, 21…) khi chuyển sang token thì làm tròn về bậc gần nhất.
 */
export const FontSize = {
  /** Badge số, nhãn rất nhỏ trên ảnh. */
  micro: 10,
  caption: 11,
  footnote: 12,
  bodySm: 13,
  body: 14,
  bodyLg: 15,
  subtitle: 16,
  title: 18,
  titleLg: 20,
  headline: 22,
  display: 28,
  hero: 34,
} as const;

export type FontSizeToken = keyof typeof FontSize;

/**
 * Độ đậm: nội dung thường `regular`/`medium`, nhãn và tiêu đề `bold`, số liệu nổi bật `heavy`.
 * Giữ ở 700/800 thay vì 800/900: chữ quá đậm ở khắp nơi làm màn hình nặng và khó biết đâu là chỗ chính.
 */
export const FontWeight = {
  regular: '400',
  medium: '600',
  bold: '700',
  heavy: '800',
} as const;

export type FontWeightToken = keyof typeof FontWeight;
