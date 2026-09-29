import type { IconMap } from '@/components/ui/icon';

// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const ProfileIcons = {
  premium: { ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' },
  rewards: { ios: 'star.fill', android: 'stars', web: 'stars' },
  orders: { ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' },
  location: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  favorites: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  payment: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  support: { ios: 'questionmark.circle.fill', android: 'help', web: 'help' },
  seller: { ios: 'storefront.fill', android: 'storefront', web: 'storefront' },
  camera: { ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' },
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  check: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
} satisfies IconMap;
