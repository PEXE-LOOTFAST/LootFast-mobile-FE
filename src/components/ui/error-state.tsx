import { StyleSheet, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
  /** Chiếm cả vùng cha và căn giữa; dùng cho màn lỗi toàn trang. */
  fill?: boolean;
};

// Trạng thái lỗi tải dữ liệu dùng chung: thông báo kèm nút "Thử lại" khi có thể thử lại.
export function ErrorState({ message, onRetry, retrying = false, fill = false }: ErrorStateProps) {
  return (
    <View style={[styles.container, fill && styles.fill]}>
      <InlineAlert message={message} />
      {onRetry ? (
        <BrandButton loading={retrying} onPress={onRetry}>
          Thử lại
        </BrandButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  fill: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
});
