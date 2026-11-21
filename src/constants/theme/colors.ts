/**
 * Màu theo chế độ sáng/tối. Lấy qua `useTheme()` thay vì import trực tiếp để tự đổi theo hệ thống.
 */
export const Colors = {
  light: {
    text: '#17211B',
    background: '#F7F8F3',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E2F3E8',
    textSecondary: '#667069',
    primary: '#16794B',
    primarySoft: '#DDF2E5',
    /** Chữ/icon đặt trên nền `primary`. */
    onPrimary: '#FFFFFF',
    accent: '#F3A83B',
    border: '#E2E7E2',
    danger: '#C44636',
    /** Chữ/icon đặt trên nền `danger`. */
    onDanger: '#FFFFFF',
  },
  dark: {
    text: '#F4F7F4',
    background: '#101713',
    backgroundElement: '#19231D',
    backgroundSelected: '#243C2D',
    textSecondary: '#AAB7AE',
    primary: '#5BD08B',
    primarySoft: '#203D2B',
    // primary/danger bản dark là màu sáng: chữ trắng trên đó chỉ đạt ~2:1, nên dùng chữ tối (~8:1).
    onPrimary: '#0B1F14',
    accent: '#F2B85E',
    border: '#2A382F',
    danger: '#FF8A78',
    onDanger: '#2B0B06',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export type HeaderPalette = {
  background: string;
  decoration: string;
  text: string;
  textMuted: string;
  /** Nền nút trong suốt đặt trên header (vd. nút quay lại). */
  control: string;
  controlBorder: string;
};

/**
 * Header giữ màu xanh đậm ở cả light lẫn dark mode: theme.primary bản dark là xanh nhạt,
 * đặt chữ trắng lên sẽ không đủ tương phản.
 */
export const HeaderColors = {
  buyer: {
    background: '#12703F',
    decoration: '#1D8A52',
    text: '#FFFFFF',
    textMuted: '#CFEBDA',
    control: 'rgba(255, 255, 255, 0.16)',
    controlBorder: 'rgba(255, 255, 255, 0.3)',
  },
  seller: {
    background: '#1A5C3A',
    decoration: '#D4943A',
    text: '#FFFFFF',
    textMuted: '#C8DDD0',
    control: 'rgba(255, 255, 255, 0.16)',
    controlBorder: 'rgba(255, 255, 255, 0.3)',
  },
} as const satisfies Record<string, HeaderPalette>;

export type HeaderVariant = keyof typeof HeaderColors;

// Chấm trạng thái trên nút (vd. GPS): đủ sáng để nổi trên cả nền header xanh đậm lẫn nền thẻ.
export const IndicatorColor = {
  on: '#34D27B',
  off: '#F59E0B',
} as const;

// Sao đánh giá dùng xanh dương để tách khỏi màu giá (xanh lá) và nhãn giảm giá (đỏ).
export const RatingColor = '#1B9FC9';

/**
 * Màu không đổi theo chế độ sáng/tối: lớp phủ, nền camera, chữ trên ảnh.
 */
export const StaticColors = {
  white: '#FFFFFF',
  black: '#000000',
  /** Nền mờ phía sau dialog, bottom sheet. */
  backdrop: 'rgba(10, 20, 14, 0.55)',
  backdropStrong: 'rgba(10, 20, 14, 0.7)',
  /** Lớp tối đặt trên ảnh để chữ/icon trắng đọc được. */
  imageScrim: 'rgba(23, 33, 27, 0.4)',
} as const;
