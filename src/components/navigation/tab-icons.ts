import type { SymbolViewProps } from 'expo-symbols';

export type TabIconName = Extract<SymbolViewProps['name'], object>;

// Key trùng với tên file route trong src/app/(tabs). SF Symbols chỉ có trên iOS,
// Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const TabIcons = {
  index: { ios: 'house', android: 'home', web: 'home' },
  orders: { ios: 'dollarsign.square', android: 'request_quote', web: 'request_quote' },
  map: { ios: 'map', android: 'map', web: 'map' },
  profile: { ios: 'person', android: 'person', web: 'person' },
} satisfies Record<string, TabIconName>;
