import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Icon, type IconName } from '@/components/ui/icon';
import { Popover } from '@/components/ui/popover';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useAnchor } from '@/hooks/use-anchor';
import { useTheme } from '@/hooks/use-theme';

type MetricCardProps = {
  label: string;
  value: string;
  caption?: string;
  icon: IconName;
  /** Nội dung popover "?" giải thích con số được tính từ đâu. */
  hint: string;
};

const HINT_WIDTH = 240;

// Thẻ số liệu nửa chiều ngang: nhãn + nút "?" + icon ở trên, con số lớn ở giữa, chú thích ở dưới.
export function MetricCard({ label, value, caption, icon, hint }: MetricCardProps) {
  const theme = useTheme();
  const { ref, anchor, open, close } = useAnchor();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.topRow}>
        <Text numberOfLines={2} style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>

        <Pressable
          ref={ref}
          accessibilityLabel={`Giải thích ${label}`}
          accessibilityRole="button"
          hitSlop={8}
          onPress={open}
          style={({ pressed }) => [
            styles.help,
            { borderColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <Icon name={SellerIcons.help} color={theme.textSecondary} size={11} />
        </Pressable>

        <View style={[styles.iconBadge, { backgroundColor: theme.primarySoft }]}>
          <Icon name={icon} color={theme.primary} size={16} />
        </View>
      </View>

      <Text numberOfLines={1} style={[styles.value, { color: theme.text }]}>
        {value}
      </Text>

      {caption ? (
        <Text numberOfLines={2} style={[styles.caption, { color: theme.textSecondary }]}>
          {caption}
        </Text>
      ) : null}

      <Popover align="right" anchor={anchor} onClose={close} width={HINT_WIDTH}>
        <Text style={[styles.hintTitle, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.hintBody, { color: theme.textSecondary }]}>{hint}</Text>
      </Popover>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexShrink: 1,
    // 50% trừ nửa khoảng cách 12 giữa hai cột.
    flexBasis: '47%',
    gap: 6,
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: 14,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  label: { flex: 1, fontSize: FontSize.bodySm, fontWeight: FontWeight.bold, lineHeight: 18 },
  help: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
    marginTop: Spacing.xxs,
  },
  iconBadge: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  value: { fontSize: FontSize.display, fontWeight: FontWeight.heavy, letterSpacing: -0.8 },
  caption: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium, lineHeight: 16 },
  hintTitle: { fontSize: FontSize.bodySm, fontWeight: FontWeight.bold },
  hintBody: { fontSize: FontSize.footnote, lineHeight: 17 },
  pressed: { opacity: 0.6 },
});
