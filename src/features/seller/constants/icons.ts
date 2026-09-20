import type { HomeIconName } from '@/features/home/constants/icons';

// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const SellerIcons = {
  revenue: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  bag: { ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' },
  trend: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  help: { ios: 'questionmark', android: 'help', web: 'help' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  minus: { ios: 'minus', android: 'remove', web: 'remove' },
  verified: { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' },
  crown: { ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  qrCode: { ios: 'qrcode.viewfinder', android: 'qr_code_scanner', web: 'qr_code_scanner' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  code: { ios: 'number', android: 'tag', web: 'tag' },
  pause: { ios: 'pause.circle', android: 'pause_circle', web: 'pause_circle' },
} satisfies Record<string, HomeIconName>;
