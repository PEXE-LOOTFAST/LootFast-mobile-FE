import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { UiIcons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type InlineAlertProps = {
  message: string;
  tone?: 'danger' | 'success';
};

// Banner một dòng nằm ngay trong luồng nội dung (khác Alert hệ thống): báo lỗi gửi form
// hoặc xác nhận một thao tác vừa xong.
export function InlineAlert({ message, tone = 'danger' }: InlineAlertProps) {
  const theme = useTheme();
  const isDanger = tone === 'danger';

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        { backgroundColor: isDanger ? `${theme.danger}1F` : theme.primarySoft },
      ]}
    >
      <Icon
        name={isDanger ? UiIcons.warning : UiIcons.success}
        color={isDanger ? theme.danger : theme.primary}
      />
      <AppText
        style={styles.message}
        tone={isDanger ? 'danger' : 'text'}
        variant="bodySm"
        weight={isDanger ? 'bold' : 'medium'}
      >
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  message: { flex: 1, lineHeight: 19 },
});
