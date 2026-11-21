import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { MenuSection } from '@/components/ui/menu-section';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Spacing } from '@/constants/theme';
import {
  setThemePreference,
  useThemePreference,
  type ThemePreference,
} from '@/lib/theme-preference';

const OPTIONS: { id: ThemePreference; label: string }[] = [
  { id: 'light', label: 'Sáng' },
  { id: 'dark', label: 'Tối' },
  { id: 'system', label: 'Theo máy' },
];

/** Khối chọn giao diện sáng/tối, dùng chung ở Cài đặt của người mua, người bán và admin. */
export function AppearanceSection() {
  const preference = useThemePreference();

  return (
    <MenuSection title="GIAO DIỆN">
      <View style={styles.body}>
        <SegmentedTabs items={OPTIONS} onChange={setThemePreference} value={preference} />
        <AppText tone="textSecondary" variant="footnote">
          {preference === 'system'
            ? 'Tự đổi theo chế độ sáng/tối của điện thoại.'
            : 'Chỉ áp dụng trên máy này.'}
        </AppText>
      </View>
    </MenuSection>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.sm, padding: Spacing.lg },
});
