import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useUnreadCount } from '@/api/notifications';
import { Icon, type IconName } from '@/components/ui/icon';
import { TabHeader } from '@/components/ui/tab-header';
import { HeaderColors } from '@/constants/theme';
import { IconButton } from '@/components/ui/icon-button';
import { NotificationSheet } from '@/features/home/components/notification-sheet';
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
        variant="seller"
        trailing={
          <IconButton
            accessibilityLabel="Thông báo"
            badgeCount={unreadCount}
            headerVariant="seller"
            icon={HomeIcons.bell}
            onPress={() => setIsNotificationsOpen(true)}
            tone="header"
          />
        }
      />

      <NotificationSheet
        onClose={() => setIsNotificationsOpen(false)}
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
      variant="seller"
      trailing={
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={onPressAction}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Icon name={actionIcon} color={HeaderColors.seller.text} size={16} />
          <Text style={[styles.actionLabel, { color: HeaderColors.seller.text }]}>
            {actionLabel}
          </Text>
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
    backgroundColor: HeaderColors.seller.control,
    borderWidth: 1,
    borderColor: HeaderColors.seller.controlBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionLabel: { fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
