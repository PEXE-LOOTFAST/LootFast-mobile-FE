import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius } from '@/constants/theme';
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

// Thẻ số liệu nửa chiều ngang: icon + nút "?" ở trên, rồi nhãn một dòng, con số lớn, chú thích.
// Nhãn có hàng riêng để không bị icon và nút "?" ép xuống hai dòng ở màn hẹp.
export function MetricCard({ label, value, caption, icon, hint }: MetricCardProps) {
  const theme = useTheme();
  const { ref, anchor, open, close } = useAnchor();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBadge, { backgroundColor: theme.primarySoft }]}>
          <Icon name={icon} color={theme.primary} size={16} />
        </View>

        <Pressable
          ref={ref}
          accessibilityLabel={`Giải thích ${label}`}
          accessibilityRole="button"
          // Nút "?" nhỏ 18px; nới vùng chạm cho đủ 44px.
          hitSlop={13}
          onPress={open}
          style={({ pressed }) => [
            styles.help,
            { borderColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <Icon name={SellerIcons.help} color={theme.textSecondary} size={11} />
        </Pressable>
      </View>

      <Text numberOfLines={1} style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>

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
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: FontSize.bodySm, fontWeight: FontWeight.bold, lineHeight: 18 },
  help: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
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
