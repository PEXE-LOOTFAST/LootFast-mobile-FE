import type { IconMap } from '@/components/ui/icon';

// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const PremiumIcons = {
  crown: { ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' },
  check: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  checkbox: { ios: 'square', android: 'check_box_outline_blank', web: 'check_box_outline_blank' },
  checkboxOn: { ios: 'checkmark.square.fill', android: 'check_box', web: 'check_box' },
  secure: { ios: 'lock.shield', android: 'verified_user', web: 'verified_user' },
} satisfies IconMap;
