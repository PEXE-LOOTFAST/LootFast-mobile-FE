import type { IconMap } from '@/components/ui/icon';

// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const AuthIcons = {
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  leaf: { ios: 'leaf', android: 'eco', web: 'eco' },
  mail: { ios: 'envelope', android: 'mail', web: 'mail' },
  person: { ios: 'person', android: 'person', web: 'person' },
  phone: { ios: 'phone', android: 'call', web: 'call' },
  google: { ios: 'g.circle', android: 'account_circle', web: 'account_circle' },
  buyer: { ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' },
  seller: { ios: 'storefront', android: 'storefront', web: 'storefront' },
} satisfies IconMap;
