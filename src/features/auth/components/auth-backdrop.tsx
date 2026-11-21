import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AuthBackdrop() {
  const theme = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <View style={[styles.blob, styles.warm, { backgroundColor: theme.accent }]} />
      <View style={[styles.blob, styles.fresh, { backgroundColor: theme.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', pointerEvents: 'none' },
  blob: { position: 'absolute', borderRadius: Radius.full },
  warm: { width: 300, height: 300, top: -120, right: -110, opacity: 0.14 },
  fresh: { width: 260, height: 260, top: 260, left: -170, opacity: 0.07 },
});
