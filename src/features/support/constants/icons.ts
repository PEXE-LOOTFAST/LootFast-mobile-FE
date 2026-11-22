import type { IconMap } from '@/components/ui/icon';

export const SupportIcons = {
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  mail: { ios: 'envelope', android: 'mail', web: 'mail' },
  deleteAccount: {
    ios: 'person.crop.circle.badge.xmark',
    android: 'person_remove',
    web: 'person_remove',
  },
  privacy: { ios: 'lock.shield', android: 'shield_lock', web: 'shield_lock' },
} satisfies IconMap;
