import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { MAX_DEAL_IMAGES } from '@/features/seller/api/merchant-deals';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';
import { pickImages, type PickResume } from '@/lib/pick-image';

type DealImagePickerProps = {
  /** URI ảnh đang chọn, chưa gửi lên server. */
  uris: string[];
  onChange: (uris: string[]) => void;
  disabled?: boolean;
  /** Màn và nội dung form cần khôi phục nếu Android tắt app lúc đang mở camera. */
  resume?: PickResume;
};

/**
 * Chọn ảnh món ngay trong form đăng deal. Ảnh chỉ nằm trên máy cho tới lúc bấm đăng — backend
 * cần dealId trong URL mới nhận ảnh, mà dealId chỉ có sau khi deal được tạo.
 *
 * Ảnh đầu tiên trở thành ảnh chính vì backend gán thứ tự theo đúng thứ tự tải lên.
 */
export function DealImagePicker({
  uris,
  onChange,
  disabled = false,
  resume,
}: DealImagePickerProps) {
  const theme = useTheme();
  const isFull = uris.length >= MAX_DEAL_IMAGES;

  const addImages = async () => {
    const assets = await pickImages({ selectionLimit: MAX_DEAL_IMAGES - uris.length, resume });
    if (assets.length === 0) return;

    // Cắt lại lần nữa phòng khi nền tảng bỏ qua selectionLimit.
    onChange([...uris, ...assets.map((asset) => asset.uri)].slice(0, MAX_DEAL_IMAGES));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>Ảnh món</Text>

      <View style={styles.grid}>
        {uris.map((uri, index) => (
          <View
            key={uri}
            style={[styles.tile, { borderColor: index === 0 ? theme.primary : theme.border }]}
          >
            <Image contentFit="cover" source={{ uri }} style={styles.photo} />

            {index === 0 ? (
              <View style={[styles.primaryBadge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.primaryLabel, { color: theme.onPrimary }]}>Ảnh chính</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityLabel={`Bỏ ảnh thứ ${index + 1}`}
              accessibilityRole="button"
              disabled={disabled}
              hitSlop={6}
              onPress={() => onChange(uris.filter((item) => item !== uri))}
              style={[styles.removeButton, { backgroundColor: theme.backgroundElement }]}
            >
              <Icon name={SellerIcons.close} color={theme.danger} size={14} />
            </Pressable>
          </View>
        ))}

        {isFull ? null : (
          <Pressable
            accessibilityLabel="Thêm ảnh món"
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => void addImages()}
            style={({ pressed }) => [
              styles.tile,
              styles.addTile,
              { borderColor: theme.border, backgroundColor: theme.background },
              (pressed || disabled) && styles.pressed,
            ]}
          >
            <Icon name={SellerIcons.camera} color={theme.primary} size={22} />
            <Text style={[styles.addLabel, { color: theme.textSecondary }]}>Thêm ảnh</Text>
          </Pressable>
        )}
      </View>

      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        {`Chọn tối đa ${MAX_DEAL_IMAGES} ảnh. Ảnh đầu tiên là ảnh khách thấy trên trang chủ.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: 96,
    height: 96,
    overflow: 'hidden',
    borderWidth: 2,
    borderRadius: 14,
  },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  addLabel: { fontSize: 11, fontWeight: '700' },
  photo: { width: '100%', height: '100%' },
  primaryBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 3,
  },
  primaryLabel: { fontSize: 10, fontWeight: '800', textAlign: 'center' },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  hint: { fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.7 },
});
