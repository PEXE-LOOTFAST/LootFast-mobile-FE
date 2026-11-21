import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { TextField } from '@/components/ui/text-field';
import { FontSize, FontWeight, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { toDealImageErrorMessage } from '@/features/admin/api/admin-error-messages';
import { MAX_REMOVAL_REASON_LENGTH } from '@/features/admin/api/deal-images';
import { useRemoveViolatingImage } from '@/features/admin/api/use-deal-images';
import { AdminHeader } from '@/features/admin/components/admin-header';
import { useTheme } from '@/hooks/use-theme';

/**
 * Gỡ ảnh deal vi phạm (POST /admin/deal-images/{imageId}/remove).
 *
 * Màn này nhận mã ảnh gõ tay vì backend chưa có đường nào cho admin tra ra mã đó: endpoint
 * deal công khai không trả danh sách ảnh kèm id, còn danh sách ảnh có id thì chỉ chính chủ
 * quán đọc được. Hiện mã ảnh đến từ bên ngoài app — báo cáo của người dùng, log, hoặc tra DB.
 * Khi backend bổ sung id ảnh vào chi tiết deal thì thay ô nhập này bằng danh sách bấm chọn.
 */
export function AdminModerationScreen() {
  const theme = useTheme();
  const [today] = useState(() => new Date());
  const [imageId, setImageId] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string>();
  const remove = useRemoveViolatingImage();

  const trimmedReason = reason.trim();
  const removedDeal = remove.data;

  const handleRemove = () => {
    setFormError(undefined);

    if (!imageId.trim()) {
      setFormError('Vui lòng nhập mã ảnh cần gỡ.');
      return;
    }
    if (!trimmedReason) {
      setFormError('Vui lòng ghi lý do gỡ ảnh — lý do được lưu lại cùng thao tác.');
      return;
    }

    remove.mutate(
      { imageId: imageId.trim(), reason: trimmedReason },
      {
        onSuccess: () => {
          setImageId('');
          setReason('');
        },
        onError: (error) => setFormError(toDealImageErrorMessage(error)),
      },
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Trung tâm thông báo của admin sẽ làm ở nhánh riêng, tạm báo trước. */}
      <AdminHeader
        date={today}
        hasUnread={false}
        onPressNotifications={() => Alert.alert('Thông báo', 'Trung tâm thông báo sẽ sớm có.')}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}
          >
            <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
              Gỡ ảnh deal vi phạm
            </Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Ảnh bị gỡ sẽ biến mất khỏi deal ngay. Lý do được lưu lại cùng thao tác nên hãy ghi rõ
              ràng.
            </Text>

            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              label="Mã ảnh"
              onChangeText={(text) => {
                setFormError(undefined);
                setImageId(text);
              }}
              placeholder="VD: 3f2a1c9e-..."
              size="compact"
              value={imageId}
            />

            <TextField
              label="Lý do gỡ"
              maxLength={MAX_REMOVAL_REASON_LENGTH}
              multiline
              numberOfLines={3}
              onChangeText={(text) => {
                setFormError(undefined);
                setReason(text);
              }}
              placeholder="VD: Ảnh không phải món ăn, vi phạm quy định nội dung."
              size="compact"
              value={reason}
            />
            <Text style={[styles.counter, { color: theme.textSecondary }]}>
              {trimmedReason.length}/{MAX_REMOVAL_REASON_LENGTH}
            </Text>
          </View>

          {formError ? <InlineAlert message={formError} /> : null}

          <BrandButton loading={remove.isPending} onPress={handleRemove}>
            Gỡ ảnh
          </BrandButton>

          {removedDeal ? (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            >
              <InlineAlert message={`Đã gỡ ảnh khỏi deal "${removedDeal.name}".`} tone="success" />

              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {removedDeal.images.length > 0
                  ? `Deal còn ${removedDeal.images.length} ảnh.`
                  : 'Deal không còn ảnh nào — quán cần bổ sung ảnh mới.'}
              </Text>

              {removedDeal.primaryImageUrl ? (
                <Image
                  contentFit="cover"
                  source={{ uri: removedDeal.primaryImageUrl }}
                  style={styles.preview}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 120 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  card: { gap: Spacing.md, borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.lg },
  title: { fontSize: FontSize.subtitle, fontWeight: FontWeight.heavy, letterSpacing: -0.2 },
  description: { fontSize: FontSize.bodySm, lineHeight: 19 },
  counter: {
    alignSelf: 'flex-end',
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.medium,
    marginTop: -6,
  },
  preview: { width: '100%', height: 160, borderRadius: Radius.md },
});
