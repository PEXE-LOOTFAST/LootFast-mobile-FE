import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { EmptyCard } from '@/components/ui/empty-card';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { MAX_DEAL_IMAGES, toMerchantDealErrorMessage } from '@/features/seller/api/merchant-deals';
import {
  useMerchantDeal,
  usePublishMerchantDeal,
  useRemoveDealImage,
  useReorderDealImages,
  useUploadDealImage,
} from '@/features/seller/api/use-merchant-deals';
import { DealInfoCard } from '@/features/seller/components/deal-info-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';
import { pickImages, useRecoveredPick } from '@/lib/pick-image';

/**
 * Quản lý ảnh của một deal. Backend bắt deal phải có ít nhất một ảnh mới đăng được, nên màn
 * này cũng là nơi đẩy bản nháp lên sàn.
 *
 * Ảnh chính là ảnh đứng đầu danh sách — đổi ảnh chính chính là gọi lại endpoint sắp xếp với
 * ảnh được chọn đưa lên đầu.
 */
export function DealImagesScreen() {
  const theme = useTheme();
  const { dealId } = useLocalSearchParams<{ dealId?: string }>();
  const { deal, isLoading, error } = useMerchantDeal(dealId);

  const upload = useUploadDealImage();
  const remove = useRemoveDealImage();
  const reorder = useReorderDealImages();
  const publish = usePublishMerchantDeal();

  const screenRoute = `/seller/deal-images?dealId=${dealId ?? ''}`;
  const images = deal?.images ?? [];
  const isBusy = upload.isPending || remove.isPending || reorder.isPending;
  const actionError = upload.error ?? remove.error ?? reorder.error ?? publish.error;

  const pickAndUpload = async () => {
    if (!dealId) return;

    if (images.length >= MAX_DEAL_IMAGES) {
      Alert.alert('Đã đủ ảnh', `Mỗi deal chỉ đăng được tối đa ${MAX_DEAL_IMAGES} ảnh.`);
      return;
    }

    const [asset] = await pickImages({ resume: { route: screenRoute } });
    if (!asset) return;

    upload.mutate({ dealId, imageUri: asset.uri });
  };

  // Android có thể tắt app khi camera đang mở: tải tiếp ảnh vừa chụp lên deal này.
  useRecoveredPick(screenRoute, ({ assets }) => {
    const [asset] = assets;
    if (dealId && asset) upload.mutate({ dealId, imageUri: asset.uri });
  });

  const askToRemove = (imageId: string) =>
    confirmAction({
      title: 'Xoá ảnh',
      message: 'Xoá ảnh này khỏi deal? Thao tác không hoàn tác được.',
      confirmLabel: 'Xoá',
      isDestructive: true,
      onConfirm: () => dealId && remove.mutate({ dealId, imageId }),
    });

  const setPrimary = (imageId: string) => {
    if (!dealId) return;

    const rest = images.filter((image) => image.imageId !== imageId).map((image) => image.imageId);
    reorder.mutate({ dealId, imageIds: [imageId, ...rest] });
  };

  return (
    <SellerPageScaffold
      onPressBack={() => router.navigate('/seller/orders')}
      subtitle={deal?.name ?? 'Thông tin và ảnh món hiển thị với khách'}
      title="Chi tiết deal"
    >
      {isLoading ? <ActivityIndicator color={theme.primary} /> : null}

      {error ? <InlineAlert message={toMerchantDealErrorMessage(error)} /> : null}
      {actionError ? <InlineAlert message={toMerchantDealErrorMessage(actionError)} /> : null}

      {!isLoading && !deal ? (
        <EmptyCard
          description="Deal có thể đã bị gỡ. Quay lại danh sách để chọn deal khác."
          title="Không tìm thấy deal"
        />
      ) : null}

      {deal ? (
        <>
          <DealInfoCard deal={deal} />

          {images.length === 0 ? (
            <EmptyCard
              description="Deal cần ít nhất một ảnh trước khi lên sàn."
              title="Chưa có ảnh nào"
            />
          ) : (
            <View style={styles.grid}>
              {images.map((image, index) => (
                <View
                  key={image.imageId}
                  style={[styles.tile, { borderColor: index === 0 ? theme.primary : theme.border }]}
                >
                  <Image contentFit="cover" source={{ uri: image.imageUrl }} style={styles.photo} />

                  {index === 0 ? (
                    <View style={[styles.primaryBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.primaryLabel}>Ảnh chính</Text>
                    </View>
                  ) : null}

                  <View style={styles.tileActions}>
                    {index === 0 ? null : (
                      <Pressable
                        accessibilityLabel="Đặt làm ảnh chính"
                        accessibilityRole="button"
                        disabled={isBusy}
                        hitSlop={6}
                        onPress={() => setPrimary(image.imageId)}
                      >
                        <Text style={[styles.tileAction, { color: theme.primary }]}>Ảnh chính</Text>
                      </Pressable>
                    )}
                    <Pressable
                      accessibilityLabel="Xoá ảnh"
                      accessibilityRole="button"
                      disabled={isBusy}
                      hitSlop={6}
                      onPress={() => askToRemove(image.imageId)}
                    >
                      <Text style={[styles.tileAction, { color: theme.danger }]}>Xoá</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            {`Đã có ${images.length}/${MAX_DEAL_IMAGES} ảnh. Ảnh đầu tiên là ảnh khách nhìn thấy trên trang chủ.`}
          </Text>

          <BrandButton
            loading={upload.isPending}
            onPress={() => void pickAndUpload()}
            variant="outline"
          >
            Thêm ảnh
          </BrandButton>

          {deal.status === 'DRAFT' ? (
            <BrandButton
              onPress={() =>
                router.navigate({
                  pathname: '/seller/edit-deal',
                  params: { dealId: deal.dealId },
                })
              }
              variant="outline"
            >
              Sửa thông tin deal
            </BrandButton>
          ) : null}

          {deal.status === 'DRAFT' ? (
            <BrandButton
              disabled={images.length === 0}
              loading={publish.isPending}
              onPress={() =>
                publish.mutate(deal.dealId, {
                  onSuccess: () => router.navigate('/seller/orders'),
                })
              }
            >
              Đăng deal lên sàn
            </BrandButton>
          ) : (
            <View style={styles.liveRow}>
              <Icon name={SellerIcons.store} color={theme.primary} size={16} />
              <Text style={[styles.liveLabel, { color: theme.textSecondary }]}>
                Deal đang hiển thị với khách.
              </Text>
            </View>
          )}
        </>
      ) : null}
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47%', overflow: 'hidden', borderWidth: 2, borderRadius: 16 },
  photo: { width: '100%', height: 120 },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  primaryLabel: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  tileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tileAction: { fontSize: 12, fontWeight: '800' },
  hint: { fontSize: 12, lineHeight: 18 },
  liveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  liveLabel: { fontSize: 13, fontWeight: '600' },
});
