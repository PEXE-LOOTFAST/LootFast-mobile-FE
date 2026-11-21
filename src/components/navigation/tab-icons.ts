import type { IconMap } from '@/components/ui/icon';

// Key trùng với tên file route trong src/app/(tabs). SF Symbols chỉ có trên iOS,
// Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const TabIcons = {
  index: { ios: 'house', android: 'home', web: 'home' },
  orders: { ios: 'list.bullet.rectangle', android: 'receipt_long', web: 'receipt_long' },
  map: { ios: 'map', android: 'map', web: 'map' },
  profile: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
} satisfies IconMap;
