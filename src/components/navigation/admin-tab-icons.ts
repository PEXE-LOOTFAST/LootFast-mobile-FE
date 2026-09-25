import type { TabIconName } from '@/components/navigation/tab-icons';

// Key trùng với tên file route trong src/app/admin. SF Symbols chỉ có trên iOS,
// Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const AdminTabIcons = {
  index: { ios: 'checkmark.shield', android: 'verified_user', web: 'verified_user' },
  overview: { ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' },
  manage: { ios: 'person.2', android: 'group', web: 'group' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
} satisfies Record<string, TabIconName>;
