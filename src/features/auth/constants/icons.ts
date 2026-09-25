import type { SymbolViewProps } from 'expo-symbols';

export type AuthIconName = Extract<SymbolViewProps['name'], object>;

// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const AuthIcons = {
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  leaf: { ios: 'leaf', android: 'eco', web: 'eco' },
  mail: { ios: 'envelope', android: 'mail', web: 'mail' },
  person: { ios: 'person', android: 'person', web: 'person' },
  phone: { ios: 'phone', android: 'call', web: 'call' },
  lock: { ios: 'lock', android: 'lock', web: 'lock' },
  show: { ios: 'eye', android: 'visibility', web: 'visibility' },
  hide: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
  success: { ios: 'checkmark.seal.fill', android: 'check_circle', web: 'check_circle' },
  buyer: { ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' },
  seller: { ios: 'storefront', android: 'storefront', web: 'storefront' },
  admin: { ios: 'checkmark.shield', android: 'admin_panel_settings', web: 'admin_panel_settings' },
} satisfies Record<string, AuthIconName>;
