import type { IconMap } from '@/components/ui/icon';

// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const PremiumIcons = {
  crown: { ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' },
  check: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  qr: { ios: 'qrcode', android: 'qr_code_2', web: 'qr_code_2' },
} satisfies IconMap;
