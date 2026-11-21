import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { TextField, type TextFieldProps } from '@/components/ui/text-field';
import { UiIcons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PasswordFieldProps = Omit<TextFieldProps, 'secureTextEntry' | 'trailing'>;

// Ô mật khẩu kèm nút hiện/ẩn. Bản `compact` bỏ icon ổ khoá ở đầu ô và dùng nút nhỏ hơn,
// vì form dài của người bán có nhiều ô mật khẩu liên tiếp.
export function PasswordField({ size = 'default', leading, ...props }: PasswordFieldProps) {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const isCompact = size === 'compact';

  return (
    <TextField
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      size={size}
      secureTextEntry={!isVisible}
      leading={leading ?? (isCompact ? undefined : <Icon name={UiIcons.lock} />)}
      trailing={
        <Pressable
          accessibilityLabel={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          accessibilityRole="button"
          hitSlop={Spacing.xs}
          onPress={() => setIsVisible((visible) => !visible)}
          style={
            isCompact
              ? styles.compactToggle
              : [styles.toggle, { backgroundColor: theme.background }]
          }
        >
          <Icon name={isVisible ? UiIcons.hide : UiIcons.show} color={theme.text} />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  compactToggle: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
