import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import logoMark from '@/assets/images/logo-mark.png';
import { useTheme } from '@/hooks/use-theme';

/** Logo chú chuột hamster của app, viền sáng để tách khỏi dải xanh cùng tông phía sau. */
export function BrandMark({ size }: { size: number }) {
  const theme = useTheme();

  return (
    <Image
      accessibilityIgnoresInvertColors
      accessible={false}
      source={logoMark}
      style={[
        styles.logo,
        { width: size, height: size, borderRadius: size / 3, borderColor: theme.onHero },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  logo: { borderWidth: 2 },
});
