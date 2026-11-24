import type { IconMap } from '@/components/ui/icon';

// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const ProfileIcons = {
  orders: { ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' },
  favorites: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  profile: { ios: 'person.fill', android: 'person', web: 'person' },
  premium: { ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' },
  support: { ios: 'questionmark.circle.fill', android: 'help', web: 'help' },
  seller: { ios: 'storefront.fill', android: 'storefront', web: 'storefront' },
  camera: { ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' },
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  check: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
} satisfies IconMap;
