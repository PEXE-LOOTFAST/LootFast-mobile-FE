import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { TextField } from '@/components/ui/text-field';
import { toMerchantDealErrorMessage } from '@/features/seller/api/merchant-deals';
import {
  useCreateMerchantDeal,
  usePublishMerchantDeal,
} from '@/features/seller/api/use-merchant-deals';
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
  const createDeal = useCreateMerchantDeal();
  const publishDeal = usePublishMerchantDeal();
  const [formError, setFormError] = useState<string | null>(null);

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

      try {
        const deal = await createDeal.mutateAsync({
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

        // Deal tạo ra ở trạng thái nháp; backend chỉ cho đăng khi đã có ít nhất một ảnh, mà
        // app chưa có bước chọn ảnh cho deal. Vẫn thử đăng để deal nào đủ điều kiện thì lên
        // sàn luôn, không đủ thì báo rõ là đã lưu nháp.
        try {
          await publishDeal.mutateAsync(deal.dealId);
          router.navigate('/seller/orders');
          Alert.alert('Đã đăng deal', `"${deal.name}" đã lên sàn, khách đặt giữ được ngay.`);
        } catch (publishError) {
          router.navigate('/seller/orders');
          Alert.alert(
            'Đã lưu bản nháp',
            `"${deal.name}" chưa lên sàn: ${toMerchantDealErrorMessage(publishError)}`,
          );
        }
      } catch (error) {
        setFormError(toMerchantDealErrorMessage(error));
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
      </SellerFormCard>

      {formError ? <InlineAlert message={formError} /> : null}

      <Text style={[styles.note, { color: theme.textSecondary }]}>
        Deal chỉ lên sàn khi đã có ảnh món. App chưa có bước thêm ảnh cho deal, nên deal có thể được
        lưu ở dạng bản nháp.
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
