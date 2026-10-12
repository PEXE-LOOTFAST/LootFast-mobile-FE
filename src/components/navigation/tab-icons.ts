import type { IconMap } from '@/components/ui/icon';

// Key trùng với tên file route trong src/app/(tabs). SF Symbols chỉ có trên iOS,
// Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const TabIcons = {
  index: { ios: 'house', android: 'home', web: 'home' },
  orders: { ios: 'dollarsign.square', android: 'request_quote', web: 'request_quote' },
  map: { ios: 'map', android: 'map', web: 'map' },
  profile: { ios: 'gearshape', android: 'settings', web: 'settings' },
} satisfies IconMap;
