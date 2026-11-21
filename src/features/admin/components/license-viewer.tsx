import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontSize, FontWeight, Radius, Spacing, StaticColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LicenseViewerProps = {
  /** Link tải ảnh giấy phép (chỉ sống 5 phút); null là hộp thoại đang đóng. */
  url: string | null;
  onClose: () => void;
};

/** Xem ảnh giấy phép kinh doanh ngay trong app, không đẩy admin sang trình duyệt. */
export function LicenseViewer({ url, onClose }: LicenseViewerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={url !== null}
    >
      <View
        style={[styles.overlay, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
      >
        <Pressable
          accessibilityLabel="Đóng"
          accessibilityRole="button"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            Giấy phép kinh doanh
          </Text>

          {url ? (
            <Image
              accessibilityLabel="Ảnh giấy phép kinh doanh"
              contentFit="contain"
              source={{ uri: url }}
              style={styles.image}
            />
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.close,
              { backgroundColor: theme.background, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.closeLabel, { color: theme.text }]}>Đóng</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  backdrop: { backgroundColor: StaticColors.backdropStrong },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: Spacing.md,
    borderRadius: Radius.xxl,
    padding: 18,
  },
  title: { fontSize: FontSize.title, fontWeight: FontWeight.heavy, letterSpacing: -0.3 },
  image: { width: '100%', height: 420, borderRadius: Radius.lg },
  close: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  closeLabel: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  pressed: { opacity: 0.85 },
});
