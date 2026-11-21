import { router } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow, Spacing, StaticColors } from '@/constants/theme';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { updateSellerNotifications } from '@/features/seller/data/seller-profile-store';
import { useSellerProfile } from '@/features/seller/hooks/use-seller-profile';
import type { SellerNotificationSettings } from '@/features/seller/types';
import { useTheme } from '@/hooks/use-theme';

const OPTIONS: { key: keyof SellerNotificationSettings; title: string; description: string }[] = [
  {
    key: 'newOrders',
    title: 'Thông báo đơn hàng mới',
    description: 'Nhận thông báo ngay khi cửa hàng có đơn hàng đến',
  },
  {
    key: 'dealAlerts',
    title: 'Cảnh báo vận hành deal',
    description: 'Nhận nhắc nhở khi deal sắp hết giờ nhận hoặc gần hết số lượng',
  },
];

export function SellerNotificationSettingsScreen() {
  const theme = useTheme();
  const { notifications } = useSellerProfile();

  return (
    <SellerPageScaffold
      onPressBack={() => router.navigate('/seller/settings')}
      subtitle="Quản lý thông báo đơn hàng và vận hành cửa hàng"
      title="Cài đặt thông báo"
    >
      <View
        style={[
          styles.card,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      >
        {OPTIONS.map((option, index) => (
          <Fragment key={option.key}>
            {index > 0 ? (
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            ) : null}
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={[styles.title, { color: theme.text }]}>{option.title}</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                  {option.description}
                </Text>
              </View>
              <Switch
                accessibilityLabel={option.title}
                onValueChange={(value) => updateSellerNotifications({ [option.key]: value })}
                thumbColor={StaticColors.white}
                trackColor={{ false: theme.border, true: theme.primary }}
                value={notifications[option.key]}
                // Web tô màu thumb theo activeThumbColor thay vì thumbColor.
                {...{ activeThumbColor: StaticColors.white }}
              />
            </View>
          </Fragment>
        ))}
      </View>
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Radius.xl,
    boxShadow: Shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  copy: { flex: 1, gap: 3 },
  title: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  description: { fontSize: FontSize.footnote, lineHeight: 17 },
  divider: { height: 1 },
});
