import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type DealImageProps = {
  uri: string;
  emoji: string;
  emojiSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function DealImage({ uri, emoji, emojiSize = 44, style }: DealImageProps) {
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);
  // Deal chưa có ảnh trả `uri` rỗng; expo-image trên web không báo lỗi với nguồn rỗng nên phải tự
  // xét, nếu không thẻ chỉ còn một mảng màu trống.
  const showFallback = !uri || hasError;

  return (
    <View style={[styles.container, { backgroundColor: theme.primarySoft }, style]}>
      {showFallback ? (
        <Text style={{ fontSize: emojiSize }}>{emoji}</Text>
      ) : (
        <Image
          contentFit="cover"
          onError={() => setHasError(true)}
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          transition={200}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
