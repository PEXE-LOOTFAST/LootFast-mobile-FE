import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useUnreadCount } from '@/api/notifications';
import { Icon, type IconName } from '@/components/ui/icon';
import { TabHeader } from '@/components/ui/tab-header';
import { IconButton } from '@/features/home/components/icon-button';
import { NotificationSheet } from '@/features/home/components/notification-sheet';
import { HomeHeaderColors } from '@/features/home/constants/colors';
import { HomeIcons } from '@/features/home/constants/icons';

const BRAND_NAME = 'LootFast';

type SellerHeaderProps = {
  title: string;
  subtitle?: string;
  subtitleIcon?: IconName;
  onBack?: () => void;
};

export function SellerHeader({ title, subtitle, subtitleIcon, onBack }: SellerHeaderProps) {
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.unreadCount ?? 0;
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <>
      <TabHeader
        onBack={onBack}
        subtitle={subtitle}
        subtitleIcon={subtitleIcon}
        title={`${BRAND_NAME} · ${title}`}
        trailing={
          <IconButton
            accessibilityLabel="Thông báo"
            badgeCount={unreadCount}
            icon={HomeIcons.bell}
            onPress={() => setIsNotificationsOpen(true)}
            tone="header"
          />
        }
      />

      <NotificationSheet
        onClose={() => setIsNotificationsOpen(false)}
        role="seller"
        visible={isNotificationsOpen}
      />
    </>
  );
}

type SellerHeaderWithActionProps = SellerHeaderProps & {
  actionLabel: string;
  actionIcon: IconName;
  onPressAction: () => void;
};

export function SellerHeaderWithAction({
  title,
  subtitle,
  subtitleIcon,
  onBack,
  actionLabel,
  actionIcon,
  onPressAction,
}: SellerHeaderWithActionProps) {
  return (
    <TabHeader
      onBack={onBack}
      subtitle={subtitle}
      subtitleIcon={subtitleIcon}
      title={`${BRAND_NAME} · ${title}`}
      trailing={
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={onPressAction}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Icon name={actionIcon} color={HomeHeaderColors.text} size={16} />
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionLabel: { color: HomeHeaderColors.text, fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
