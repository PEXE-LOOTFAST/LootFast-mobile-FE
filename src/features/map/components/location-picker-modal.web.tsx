import { Modal, StyleSheet, View } from 'react-native';

import { Radius, Spacing, StaticColors } from '@/constants/theme';
import { BrandButton } from '@/components/ui/brand-button';
import { EmptyCard } from '@/components/ui/empty-card';
import type { LocationPickerModalProps } from '@/features/map/components/location-picker.types';
import { useTheme } from '@/hooks/use-theme';

// WebView native không có trên web: chỉ báo để người bán nhập địa chỉ, toạ độ tự xác định khi lưu.
export function LocationPickerModal({ visible, onClose }: LocationPickerModalProps) {
  const theme = useTheme();

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.background }]}>
          <EmptyCard
            description="Chọn vị trí bằng bản đồ chỉ có trên ứng dụng Android và iOS. Hãy nhập địa chỉ, toạ độ sẽ tự xác định khi lưu."
            title="Chưa hỗ trợ trên web"
          />
          <BrandButton onPress={onClose} variant="outline">
            Đóng
          </BrandButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: StaticColors.backdrop,
    padding: Spacing.xxl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    gap: Spacing.md,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
  },
});
