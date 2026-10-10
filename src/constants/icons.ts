import type { IconMap } from '@/components/ui/icon';

// Icon của các thành phần UI dùng chung (ô nhập, banner…), không thuộc riêng feature nào.
// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon khai báo đủ cả hai tên.
export const UiIcons = {
  lock: { ios: 'lock', android: 'lock', web: 'lock' },
  show: { ios: 'eye', android: 'visibility', web: 'visibility' },
  hide: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
  warning: { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' },
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  success: { ios: 'checkmark.seal.fill', android: 'check_circle', web: 'check_circle' },
} satisfies IconMap;
