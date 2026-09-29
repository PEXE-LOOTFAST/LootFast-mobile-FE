import type { IconMap } from '@/components/ui/icon';

// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const OrderIcons = {
  lock: { ios: 'lock', android: 'lock', web: 'lock' },
  arrowUpRight: { ios: 'arrow.up.right', android: 'north_east', web: 'north_east' },
  receipt: { ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' },
} satisfies IconMap;
