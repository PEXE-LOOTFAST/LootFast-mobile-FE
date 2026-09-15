import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { TextField, type TextFieldProps } from '@/components/ui/text-field';
import { FieldIcon } from '@/features/auth/components/field-icon';
import { AuthIcons } from '@/features/auth/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type PasswordFieldProps = Omit<TextFieldProps, 'secureTextEntry' | 'leading' | 'trailing'>;

export function PasswordField(props: PasswordFieldProps) {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!isVisible}
      leading={<FieldIcon name={AuthIcons.lock} />}
      trailing={
        <Pressable
          accessibilityLabel={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => setIsVisible((visible) => !visible)}
          style={[styles.toggle, { backgroundColor: theme.background }]}
        >
          <FieldIcon name={isVisible ? AuthIcons.hide : AuthIcons.show} color={theme.text} />
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
    borderRadius: 20,
  },
});
