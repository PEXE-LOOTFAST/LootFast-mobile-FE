import type { SymbolViewProps } from 'expo-symbols';

export type HomeIconName = Extract<SymbolViewProps['name'], object>;

// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const HomeIcons = {
  location: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  bell: { ios: 'bell', android: 'notifications', web: 'notifications' },
  person: { ios: 'person', android: 'person', web: 'person' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  clear: { ios: 'xmark.circle.fill', android: 'close', web: 'close' },
  chevronDown: { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' },
  filter: { ios: 'slider.horizontal.3', android: 'tune', web: 'tune' },
  store: { ios: 'storefront', android: 'storefront', web: 'storefront' },
  verified: { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' },
  star: { ios: 'star.fill', android: 'star', web: 'star' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  distance: { ios: 'location', android: 'near_me', web: 'near_me' },
  flame: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
} satisfies Record<string, HomeIconName>;
