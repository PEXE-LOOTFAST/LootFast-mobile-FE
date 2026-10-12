import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { TextField } from '@/components/ui/text-field';
import {
  MAX_DEAL_IMAGES,
  createMerchantDeal,
  publishMerchantDeal,
  toMerchantDealErrorMessage,
  uploadDealImage,
} from '@/features/seller/api/merchant-deals';
import { MERCHANT_DEALS_QUERY_KEY } from '@/features/seller/api/use-merchant-deals';
import { MerchantRegistrationRequired } from '@/features/seller/components/merchant-registration-required';
import { DealImagePicker } from '@/features/seller/components/deal-image-picker';
import { PriceField } from '@/features/seller/components/deal-input-fields';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { TimeInputField } from '@/features/seller/components/time-input-field';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { ShopSetupCard, getShopSetupSteps } from '@/features/seller/components/shop-setup-card';
import { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import type { MerchantOpeningHoursDto, MerchantProfileDto } from '@/features/seller/types/api';
import { validateNewDeal, type NewDealValues } from '@/features/seller/validation';
import { buildDealSchedule, toDealNumber, todayOpeningSlot } from '@/features/seller/deal-schedule';
import { useForm } from '@/hooks/use-form';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';
import { useRecoveredPick } from '@/lib/pick-image';

const NEW_DEAL_ROUTE = '/seller/new-deal';

const INITIAL_VALUES: NewDealValues = {
  name: '',
  portions: '10',
  price: '',
  originalPrice: '',
  open: '18:00',
  close: '21:00',
};

export function SellerNewDealScreen() {
  const theme = useTheme();
  const shop = useMerchantShop();

  const isLoading = shop.isLoading;
  // Hồ sơ quán phải đủ tên, địa chỉ, tọa độ thì backend mới cho đăng (MERCHANT_PROFILE_INCOMPLETE);
  // chặn từ đầu để người bán không nhập cả form rồi mới bị từ chối ở bước đăng.
  const isSetupDone = getShopSetupSteps(shop).every((step) => step.done);

  return (
    <SellerPageScaffold
      onPressBack={() => router.navigate('/seller')}
      subtitle="Chọn món, số phần, mức giảm và khung giờ bán"
      title="Đăng deal mới"
    >
      {isLoading ? <ActivityIndicator color={theme.primary} /> : null}

      {/* Chưa có hồ sơ quán thì danh sách deal cũng trả lỗi 404: đã có thẻ giải thích riêng ở dưới. */}
      {!shop.profileMissing && shop.isError ? (
        <InlineAlert message="Không tải được thông tin quán. Kiểm tra mạng rồi thử lại." />
      ) : null}

      {shop.profileMissing ? <MerchantRegistrationRequired /> : null}

      {!isLoading && !shop.isError && !shop.profileMissing && !isSetupDone ? (
        <ShopSetupCard
          location={shop.location}
          openingHours={shop.openingHours}
          profile={shop.profile}
        />
      ) : null}

      {/* Chờ có đủ dữ liệu quán: useForm chốt giá trị ban đầu ở lần render đầu. */}
      {!isLoading && !shop.isError && !shop.profileMissing && isSetupDone && shop.profile ? (
        <NewDealForm openingHours={shop.openingHours} profile={shop.profile} />
      ) : null}
    </SellerPageScaffold>
  );
}

function NewDealForm({
  profile,
  openingHours,
}: {
  profile: MerchantProfileDto;
  openingHours?: MerchantOpeningHoursDto;
}) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUris, setImageUris] = useState<string[]>([]);
  /** Nhãn tiến trình hiện trên nút trong lúc chạy chuỗi ba bước. */
  const [progress, setProgress] = useState<string | null>(null);
  const slot = todayOpeningSlot(openingHours);

  const { values, errors, isSubmitting, setField, submit } = useForm<NewDealValues>({
    initialValues: INITIAL_VALUES,
    validate: validateNewDeal,
    onSubmit: async (next) => {
      setFormError(null);

      // Nhóm món lấy từ hồ sơ quán — backend bắt buộc categoryCode và form không hỏi lại.
      const categoryCode = profile.businessCategory;
      if (!categoryCode) {
        setFormError('Chưa có nhóm món trong hồ sơ quán. Cập nhật Thông tin quán trước đã.');
        return;
      }

      const schedule = buildDealSchedule(next.open, next.close, { openingHours });
      if ('error' in schedule) {
        setFormError(schedule.error);
        return;
      }

      if (imageUris.length === 0) {
        setFormError('Deal cần ít nhất một ảnh món mới lên sàn được.');
        return;
      }

      // Backend không nhận deal kèm ảnh trong một request: tạo deal phải là JSON, còn endpoint
      // ảnh cần dealId trong URL. Vì vậy chạy tuần tự ba bước và báo tiến trình cho người bán.
      let dealId: string | undefined;

      try {
        setProgress('Đang tạo deal…');
        const deal = await createMerchantDeal({
          name: next.name.trim(),
          categoryCode,
          originalPrice: toDealNumber(next.originalPrice),
          discountedPrice: toDealNumber(next.price),
          totalQuantity: toDealNumber(next.portions),
          // Form chưa hỏi thời gian chuẩn bị; 0 nghĩa là khách đến là lấy được ngay.
          preparationMinutes: 0,
          ...schedule.schedule,
        });
        dealId = deal.dealId;

        // Tải lần lượt chứ không song song: backend gán thứ tự ảnh theo thứ tự nhận được, mà
        // ảnh đầu tiên chính là ảnh đại diện của deal.
        for (const [index, uri] of imageUris.entries()) {
          setProgress(`Đang tải ảnh ${index + 1}/${imageUris.length}…`);
          await uploadDealImage(dealId, uri);
        }

        setProgress('Đang đăng deal…');
        await publishMerchantDeal(dealId);

        await queryClient.invalidateQueries({ queryKey: MERCHANT_DEALS_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: ['deals'] });

        router.navigate('/seller/orders');
        Alert.alert('Đã đăng deal', `"${deal.name}" đã lên sàn, khách đặt giữ được ngay.`);
      } catch (error) {
        const message = toMerchantDealErrorMessage(error);

        // Deal đã tạo mà hỏng ở bước ảnh hoặc bước đăng: bản nháp vẫn nằm trên server, nên đưa
        // người bán sang màn ảnh của chính bản nháp đó để làm tiếp thay vì nhập lại từ đầu.
        if (dealId) {
          await queryClient.invalidateQueries({ queryKey: MERCHANT_DEALS_QUERY_KEY });
          router.navigate({ pathname: '/seller/deal-images', params: { dealId } });
          Alert.alert('Deal đã lưu ở dạng nháp', `${message} Thêm ảnh rồi đăng lại tại đây nhé.`);
          return;
        }

        setFormError(message);
      } finally {
        setProgress(null);
      }
    },
  });

  // Android có thể tắt app khi camera đang mở: lấy lại nội dung đã nhập và ảnh vừa chụp.
  useRecoveredPick<{ values: NewDealValues; imageUris: string[] }>(
    NEW_DEAL_ROUTE,
    ({ assets, draft }) => {
      if (draft) {
        for (const field of Object.keys(draft.values) as (keyof NewDealValues)[]) {
          setField(field, draft.values[field]);
        }
      }

      const restored = [...(draft?.imageUris ?? []), ...assets.map((asset) => asset.uri)];
      setImageUris(restored.slice(0, MAX_DEAL_IMAGES));
    },
  );

  const price = toDealNumber(values.price);
  const originalPrice = toDealNumber(values.originalPrice);
  const discount =
    price > 0 && originalPrice > price
      ? `Giảm ${Math.round((1 - price / originalPrice) * 100)}% so với ${formatPrice(originalPrice)}`
      : 'Nhập giá gốc và giá deal để xem mức giảm.';

  return (
    <>
      <SellerFormCard>
        <TextField
          size="compact"
          error={errors.name}
          label="Tên món"
          onChangeText={(text) => setField('name', text)}
          placeholder="VD: Cơm tấm sườn cuối ngày"
          value={values.name}
        />
        <TextField
          size="compact"
          error={errors.portions}
          keyboardType="number-pad"
          label="Số phần mở bán"
          maxLength={3}
          onChangeText={(text) => setField('portions', text)}
          placeholder="10"
          value={values.portions}
        />

        <View style={styles.row}>
          <View style={styles.cell}>
            <PriceField
              error={errors.originalPrice}
              label="Giá gốc"
              onChange={(digits) => setField('originalPrice', digits)}
              placeholder="65000"
              value={values.originalPrice}
            />
          </View>
          <View style={styles.cell}>
            <PriceField
              error={errors.price}
              label="Giá deal"
              onChange={(digits) => setField('price', digits)}
              placeholder="39000"
              value={values.price}
            />
          </View>
        </View>

        <Text style={[styles.hint, { color: theme.textSecondary }]}>{discount}</Text>

        <View style={styles.row}>
          <View style={styles.cell}>
            <TimeInputField
              defaultTime="18:00"
              error={errors.open}
              label="Mở bán"
              onChange={(time) => setField('open', time)}
              placeholder="18:00"
              value={values.open}
            />
          </View>
          <View style={styles.cell}>
            <TimeInputField
              defaultTime="21:00"
              error={errors.close}
              label="Đóng deal"
              onChange={(time) => setField('close', time)}
              placeholder="21:00"
              value={values.close}
            />
          </View>
        </View>

        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          {slot
            ? `Giờ mở cửa hôm nay: ${slot.opensAt}–${slot.closesAt}. Khung giờ deal phải nằm trong khung này. Khách đặt được tới khi deal đóng và tự chọn giờ đến lấy trong khung đó.`
            : 'Hôm nay quán không mở cửa nên chưa đăng deal được.'}
        </Text>

        <DealImagePicker
          disabled={isSubmitting}
          onChange={setImageUris}
          resume={{ route: NEW_DEAL_ROUTE, draft: { values, imageUris } }}
          uris={imageUris}
        />
      </SellerFormCard>

      {formError ? <InlineAlert message={formError} /> : null}

      <Text style={[styles.note, { color: theme.textSecondary }]}>
        {progress ??
          'Quán đăng được tối đa 10 ảnh mỗi giờ, tính chung cả logo và ảnh bìa, nên chọn vừa đủ ảnh cho mỗi deal.'}
      </Text>

      <BrandButton loading={isSubmitting} onPress={() => void submit()}>
        Đăng deal
      </BrandButton>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  cell: { flex: 1 },
  hint: { fontSize: 12, fontWeight: '600' },
  note: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
