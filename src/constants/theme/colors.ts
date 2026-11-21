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
    /** Chữ/icon đặt trên nền `accent` (cam nhạt ở cả hai chế độ nên luôn là chữ tối). */
    onAccent: '#3B2400',
    border: '#E6EAE6',
    danger: '#C44636',
    /** Chữ/icon đặt trên nền `danger`. */
    onDanger: '#FFFFFF',
  },
  // Dark trung tính: nền xám than, các lớp sáng dần để thẻ tách khỏi nền; màu xanh chỉ dùng để
  // nhấn (nút chính, mục đang chọn, giá) thay vì phủ lên mọi lớp như bản cũ.
  dark: {
    text: '#F2F3F2',
    background: '#0E0F0F',
    backgroundElement: '#1A1C1B',
    backgroundSelected: '#1F3328',
    textSecondary: '#A3A8A5',
    primary: '#3DD68C',
    primarySoft: '#173A27',
    // primary/danger bản dark là màu sáng: chữ trắng trên đó không đủ tương phản, nên dùng chữ tối.
    onPrimary: '#04210F',
    accent: '#F2B85E',
    onAccent: '#3B2400',
    border: '#2A2D2B',
    danger: '#FF7369',
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

/**
 * Bảng màu xanh dương riêng của gói Cao cấp, để thẻ Premium tách khỏi màu xanh lá thương hiệu.
 * Nút mua giữ cùng màu ở hai chế độ.
 */
export const PremiumColors = {
  light: {
    cardBg: '#DDF2FC',
    cardBorder: '#8BC8E8',
    accent: '#12659A',
    accentSoft: '#247EA9',
    badgeBg: '#C4E4F5',
    buyButton: '#126FA6',
    onBuyButton: '#FFFFFF',
  },
  dark: {
    cardBg: '#132A3A',
    cardBorder: '#2A5A7A',
    accent: '#6DC0E8',
    accentSoft: '#5AACDA',
    badgeBg: '#1A3A50',
    buyButton: '#126FA6',
    onBuyButton: '#FFFFFF',
  },
} as const;

// Chấm trạng thái trên nút (vd. GPS): đủ sáng để nổi trên cả nền header xanh đậm lẫn nền thẻ.
export const IndicatorColor = {
  on: '#34D27B',
  off: '#F59E0B',
} as const;

// Chấm vị trí người dùng trên bản đồ: xanh dương như các app bản đồ quen thuộc, tách khỏi ghim deal xanh lá.
export const UserLocationColor = '#2563EB';

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
  /** Lớp tối quanh khung quét trên nền camera. */
  cameraScrim: 'rgba(0, 0, 0, 0.55)',
} as const;
