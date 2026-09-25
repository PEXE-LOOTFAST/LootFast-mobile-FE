import type { HomeIconName } from '@/features/home/constants/icons';

// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const AdminIcons = {
  bell: { ios: 'bell', android: 'notifications', web: 'notifications' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  clear: { ios: 'xmark.circle.fill', android: 'close', web: 'close' },
  food: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
  store: { ios: 'storefront', android: 'storefront', web: 'storefront' },
  phone: { ios: 'phone', android: 'call', web: 'call' },
  location: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  document: { ios: 'doc.text', android: 'description', web: 'description' },
  warning: {
    ios: 'exclamationmark.triangle',
    android: 'warning_amber',
    web: 'warning_amber',
  },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  chart: { ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' },
  people: { ios: 'person.2', android: 'group', web: 'group' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  shield: {
    ios: 'checkmark.shield.fill',
    android: 'admin_panel_settings',
    web: 'admin_panel_settings',
  },
  wallet: { ios: 'wallet.pass', android: 'account_balance_wallet', web: 'account_balance_wallet' },
  trendUp: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  shieldCheck: { ios: 'checkmark.shield', android: 'verified_user', web: 'verified_user' },
  person: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
  logout: {
    ios: 'rectangle.portrait.and.arrow.right',
    android: 'logout',
    web: 'logout',
  },
} satisfies Record<string, HomeIconName>;
