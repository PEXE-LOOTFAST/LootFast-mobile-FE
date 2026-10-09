import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { EmptyCard } from '@/components/ui/empty-card';
import { InlineAlert } from '@/components/ui/inline-alert';
import { TextField } from '@/components/ui/text-field';
import {
  toMerchantDealErrorMessage,
  type MerchantDealDto,
} from '@/features/seller/api/merchant-deals';
import { useMerchantDeal, useUpdateMerchantDeal } from '@/features/seller/api/use-merchant-deals';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { buildDealSchedule, toDealNumber, toTimeInput } from '@/features/seller/deal-schedule';
import { validateNewDeal, type NewDealValues } from '@/features/seller/validation';
import { useForm } from '@/hooks/use-form';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

/**
 * Sửa thông tin một bản nháp deal. Backend chỉ cho sửa deal còn ở trạng thái DRAFT; deal đã
 * đăng trả về DEAL_NOT_EDITABLE và chỉ đổi được số lượng ở màn Đơn hàng.
 */
export function SellerEditDealScreen() {
  const theme = useTheme();
  const { dealId } = useLocalSearchParams<{ dealId?: string }>();
  const { deal, isLoading, error } = useMerchantDeal(dealId);

  const backToImages = () =>
    dealId
      ? router.navigate({ pathname: '/seller/deal-images', params: { dealId } })
      : router.navigate('/seller/orders');

  return (
    <SellerPageScaffold
      onPressBack={backToImages}
      subtitle="Đổi tên món, số phần, giá và khung giờ nhận"
      title="Sửa bản nháp"
    >
      {isLoading ? <ActivityIndicator color={theme.primary} /> : null}
      {error ? <InlineAlert message={toMerchantDealErrorMessage(error)} /> : null}

      {!isLoading && !deal ? (
        <EmptyCard
          description="Deal có thể đã bị gỡ. Quay lại danh sách để chọn deal khác."
          title="Không tìm thấy deal"
        />
      ) : null}

      {deal && deal.status !== 'DRAFT' ? (
        <EmptyCard
          description="Deal đã lên sàn nên không sửa được thông tin nữa. Bạn vẫn đổi được số phần ở trang Đơn hàng."
          title="Deal đã đăng"
        />
      ) : null}

      {/* Chờ tải xong mới dựng form: useForm chốt giá trị ban đầu ngay lần render đầu tiên. */}
      {deal && deal.status === 'DRAFT' ? <EditDealForm deal={deal} onSaved={backToImages} /> : null}
    </SellerPageScaffold>
  );
}

function EditDealForm({ deal, onSaved }: { deal: MerchantDealDto; onSaved: () => void }) {
  const theme = useTheme();
  const updateDeal = useUpdateMerchantDeal();
  const [formError, setFormError] = useState<string | null>(null);

  const { values, errors, isSubmitting, setField, submit } = useForm<NewDealValues>({
    initialValues: {
      name: deal.name,
      portions: String(deal.totalQuantity),
      price: String(deal.discountedPrice),
      originalPrice: String(deal.originalPrice),
      open: toTimeInput(deal.pickupStartsAt),
      close: toTimeInput(deal.pickupEndsAt),
    },
    validate: validateNewDeal,
    onSubmit: async (next) => {
      setFormError(null);

      const result = buildDealSchedule(next.open, next.close);
      if ('error' in result) {
        setFormError(result.error);
        return;
      }

      try {
        await updateDeal.mutateAsync({
          dealId: deal.dealId,
          payload: {
            name: next.name.trim(),
            // Giữ nguyên nhóm món và thời gian chuẩn bị của bản nháp, form không hỏi lại.
            categoryCode: deal.categoryCode,
            originalPrice: toDealNumber(next.originalPrice),
            discountedPrice: toDealNumber(next.price),
            totalQuantity: toDealNumber(next.portions),
            preparationMinutes: deal.preparationMinutes,
            ...result.schedule,
          },
        });
        onSaved();
      } catch (error) {
        setFormError(toMerchantDealErrorMessage(error));
      }
    },
  });

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

      <BrandButton loading={isSubmitting} onPress={() => void submit()}>
        Lưu thay đổi
      </BrandButton>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  cell: { flex: 1 },
  hint: { fontSize: 12, fontWeight: '600' },
});
