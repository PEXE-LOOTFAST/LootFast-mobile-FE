import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { TextField } from '@/components/ui/text-field';
import {
  createMerchantDeal,
  publishMerchantDeal,
  toMerchantDealErrorMessage,
  uploadDealImage,
} from '@/features/seller/api/merchant-deals';
import { MERCHANT_DEALS_QUERY_KEY } from '@/features/seller/api/use-merchant-deals';
import { DealImagePicker } from '@/features/seller/components/deal-image-picker';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import { validateNewDeal, type NewDealValues } from '@/features/seller/validation';
import { useForm } from '@/hooks/use-form';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

const INITIAL_VALUES: NewDealValues = {
  name: '',
  portions: '10',
  price: '',
  originalPrice: '',
  open: '18:00',
  close: '21:00',
};

/** Backend bắt buộc chốt đơn trước giờ nhận ít nhất 15 phút (ORDER_CUTOFF). */
const ORDER_CUTOFF_MS = 15 * 60 * 1000;

const toNumber = (value: string) => Number(value.replace(/\D/g, ''));

/**
 * "18:00" → mốc thời gian hôm nay. Backend bắt cả bốn mốc (bán và nhận) nằm trong cùng một
 * ngày theo lịch Việt Nam, nên chỉ đăng được deal trong ngày và máy phải để đúng múi giờ VN.
 */
function toTodayAt(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);

  return date;
}

export function SellerNewDealScreen() {
  const theme = useTheme();
  const { profile } = useMerchantShop();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUris, setImageUris] = useState<string[]>([]);
  /** Nhãn tiến trình hiện trên nút trong lúc chạy chuỗi ba bước. */
  const [progress, setProgress] = useState<string | null>(null);

  const { values, errors, isSubmitting, setField, submit } = useForm<NewDealValues>({
    initialValues: INITIAL_VALUES,
    validate: validateNewDeal,
    onSubmit: async (next) => {
      setFormError(null);

      // Nhóm món lấy từ hồ sơ quán — backend bắt buộc categoryCode và form không hỏi lại.
      const categoryCode = profile?.businessCategory;
      if (!categoryCode) {
        setFormError('Chưa có nhóm món trong hồ sơ quán. Cập nhật Thông tin quán trước đã.');
        return;
      }

      const pickupStart = toTodayAt(next.open);
      const pickupEnd = toTodayAt(next.close);
      const saleEnd = new Date(pickupStart.getTime() - ORDER_CUTOFF_MS);
      const saleStart = new Date();

      if (saleStart >= saleEnd) {
        setFormError('Giờ bắt đầu nhận phải cách hiện tại ít nhất 15 phút.');
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
          originalPrice: toNumber(next.originalPrice),
          discountedPrice: toNumber(next.price),
          totalQuantity: toNumber(next.portions),
          // Form chưa hỏi thời gian chuẩn bị; 0 nghĩa là khách đến là lấy được ngay.
          preparationMinutes: 0,
          saleStartsAt: saleStart.toISOString(),
          saleEndsAt: saleEnd.toISOString(),
          pickupStartsAt: pickupStart.toISOString(),
          pickupEndsAt: pickupEnd.toISOString(),
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

  const price = toNumber(values.price);
  const originalPrice = toNumber(values.originalPrice);
  const discount =
    price > 0 && originalPrice > price
      ? `Giảm ${Math.round((1 - price / originalPrice) * 100)}% so với ${formatPrice(originalPrice)}`
      : 'Nhập giá gốc và giá deal để xem mức giảm.';

  return (
    <SellerPageScaffold
      onPressBack={() => router.navigate('/seller')}
      subtitle="Chọn món, số phần, mức giảm và khung giờ khách đến nhận"
      title="Đăng deal mới"
    >
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
            <TextField
              size="compact"
              error={errors.originalPrice}
              keyboardType="number-pad"
              label="Giá gốc (đ)"
              maxLength={7}
              onChangeText={(text) => setField('originalPrice', text)}
              placeholder="65000"
              value={values.originalPrice}
            />
          </View>
          <View style={styles.cell}>
            <TextField
              size="compact"
              error={errors.price}
              keyboardType="number-pad"
              label="Giá deal (đ)"
              maxLength={7}
              onChangeText={(text) => setField('price', text)}
              placeholder="39000"
              value={values.price}
            />
          </View>
        </View>

        <Text style={[styles.hint, { color: theme.textSecondary }]}>{discount}</Text>

        <View style={styles.row}>
          <View style={styles.cell}>
            <TextField
              size="compact"
              error={errors.open}
              label="Bắt đầu nhận"
              maxLength={5}
              onChangeText={(text) => setField('open', text)}
              placeholder="18:00"
              value={values.open}
            />
          </View>
          <View style={styles.cell}>
            <TextField
              size="compact"
              error={errors.close}
              label="Kết thúc nhận"
              maxLength={5}
              onChangeText={(text) => setField('close', text)}
              placeholder="21:00"
              value={values.close}
            />
          </View>
        </View>

        <DealImagePicker disabled={isSubmitting} onChange={setImageUris} uris={imageUris} />
      </SellerFormCard>

      {formError ? <InlineAlert message={formError} /> : null}

      <Text style={[styles.note, { color: theme.textSecondary }]}>
        {progress ??
          'Quán đăng được tối đa 10 ảnh mỗi giờ, tính chung cả logo và ảnh bìa, nên chọn vừa đủ ảnh cho mỗi deal.'}
      </Text>

      <BrandButton loading={isSubmitting} onPress={() => void submit()}>
        Đăng deal
      </BrandButton>
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  cell: { flex: 1 },
  hint: { fontSize: 12, fontWeight: '600' },
  note: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
