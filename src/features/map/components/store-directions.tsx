import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { HomeIcons } from '@/features/home/constants/icons';
import { formatDuration, openDirections, useRoadRoute } from '@/features/map/api/directions';
import { useTheme } from '@/hooks/use-theme';
import { formatDistance } from '@/lib/format';

type StoreDirectionsProps = {
  latitude?: number | null;
  longitude?: number | null;
  /** Địa chỉ chữ: hiện khi chưa có quãng đường, và dùng để chỉ đường khi quán chưa có toạ độ. */
  address: string;
  /** Khoảng cách đường thẳng backend trả, dùng khi chưa tính được đường thật. */
  straightKm?: number;
};

/**
 * Quãng đường tới quán theo đường thật kèm nút mở chỉ đường. Khoảng cách trong danh sách deal là
 * đường thẳng, nên ở đây nói rõ khi nào là đường đi thật, khi nào chỉ là ước lượng.
 */
export function StoreDirections({
  latitude,
  longitude,
  address,
  straightKm,
}: StoreDirectionsProps) {
  const theme = useTheme();
  const route = useRoadRoute({
    latitude: latitude ?? undefined,
    longitude: longitude ?? undefined,
  });

  const [title, subtitle] = route.data
    ? [
        `${formatDistance(route.data.distanceKm)} · ${formatDuration(route.data.durationMinutes)} đi xe máy`,
        'Theo đường đi thực tế từ vị trí của bạn',
      ]
    : straightKm != null
      ? [
          `Cách khoảng ${formatDistance(straightKm)}`,
          'Tính theo đường thẳng, đường đi thực tế có thể xa hơn',
        ]
      : ['Đường đi tới quán', 'Google Maps dẫn đường theo đường thật'];

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
        <Icon name={HomeIcons.directions} color={theme.primary} size={18} />
      </View>

      <View style={styles.copy}>
        <AppText numberOfLines={2} variant="bodySm" weight="bold">
          {title}
        </AppText>
        {subtitle ? (
          <AppText numberOfLines={2} tone="textSecondary" variant="caption">
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <Pressable
        accessibilityHint="Mở Google Maps để chỉ đường tới quán"
        accessibilityRole="button"
        hitSlop={Spacing.xs}
        onPress={() => openDirections({ latitude, longitude, address })}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.primary },
          pressed && styles.pressed,
        ]}
      >
        <AppText color={theme.onPrimary} variant="footnote" weight="heavy">
          Chỉ đường
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  copy: { flex: 1, minWidth: 0, gap: Spacing.xxs },
  button: {
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
  },
  pressed: { opacity: 0.8 },
});
