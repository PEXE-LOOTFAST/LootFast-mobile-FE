import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { UiIcons } from '@/constants/icons';
import { HomeHeaderColors } from '@/features/home/constants/colors';

type TabHeaderProps = {
  title: string;
  /** Một dòng phụ; dài quá sẽ bị cắt để header luôn cùng chiều cao giữa các tab. */
  subtitle?: string;
  subtitleIcon?: IconName;
  /** Có thì hiện nút quay lại bên trái tiêu đề. */
  onBack?: () => void;
  /** Cụm nút hành động bên phải (vd. GPS, thông báo). */
  trailing?: ReactNode;
};

/**
 * Header xanh đậm dùng chung cho các tab của người mua: cùng chiều cao, cùng cấu trúc
 * (tiêu đề + dòng phụ bên trái, hành động bên phải) để chuyển tab không thấy khung nhảy.
 */
export function TabHeader({ title, subtitle, subtitleIcon, onBack, trailing }: TabHeaderProps) {
  const insets = useSafeAreaInsets();

  // Nền xanh đậm cần icon status bar màu sáng. Trả về 'auto' khi rời màn,
  // nếu không các màn nền sáng khác sẽ bị icon trắng chìm mất.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Vòng trang trí nằm trong lớp cắt riêng: nếu tràn trực tiếp trong container, trình duyệt
          coi container cuộn ngang được và dịch cả chữ sang trái khi focus vào nút bên phải. */}
      <View style={styles.decorationLayer}>
        <View style={styles.decoration} />
      </View>

      <View style={styles.row}>
        {onBack ? (
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={4}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Icon name={UiIcons.back} color={HomeHeaderColors.text} size={18} />
          </Pressable>
        ) : null}

        <View style={styles.copy}>
          <Text
            accessibilityRole="header"
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            numberOfLines={1}
            style={styles.title}
          >
            {title}
          </Text>
          {subtitle ? (
            <View style={styles.subtitleRow}>
              {subtitleIcon ? (
                <Icon name={subtitleIcon} color={HomeHeaderColors.textMuted} size={13} />
              ) : null}
              <Text numberOfLines={1} style={styles.subtitle}>
                {subtitle}
              </Text>
            </View>
          ) : null}
        </View>

        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: HomeHeaderColors.background,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  decorationLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  decoration: {
    position: 'absolute',
    width: 150,
    height: 150,
    top: -50,
    right: -50,
    borderRadius: 75,
    backgroundColor: HomeHeaderColors.decoration,
    opacity: 0.5,
  },
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  pressed: { opacity: 0.8 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copy: { flex: 1, minWidth: 0, gap: 1 },
  title: { color: HomeHeaderColors.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subtitle: { flexShrink: 1, color: HomeHeaderColors.textMuted, fontSize: 12, fontWeight: '600' },
});
