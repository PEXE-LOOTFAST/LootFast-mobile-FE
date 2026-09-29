import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { UiIcons } from '@/constants/icons';
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
      <Text
        style={[
          styles.message,
          { color: isDanger ? theme.danger : theme.text },
          isDanger && styles.strong,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12 },
  message: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 19 },
  strong: { fontWeight: '700' },
});
