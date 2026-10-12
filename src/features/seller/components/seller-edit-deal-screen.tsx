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
import { PriceField } from '@/features/seller/components/deal-input-fields';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { TimeInputField } from '@/features/seller/components/time-input-field';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { buildDealSchedule, toDealNumber, toTimeInput } from '@/features/seller/deal-schedule';
import { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import type { MerchantOpeningHoursDto } from '@/features/seller/types/api';
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
  const { deal, isLoading: isDealLoading, error } = useMerchantDeal(dealId);
  const shop = useMerchantShop();
  const isLoading = isDealLoading || shop.isLoading;

  const backToImages = () =>
    dealId
      ? router.navigate({ pathname: '/seller/deal-images', params: { dealId } })
      : router.navigate('/seller/orders');

  return (
    <SellerPageScaffold
      onPressBack={backToImages}
      subtitle="Đổi tên món, số phần, giá và khung giờ bán"
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
      {deal && deal.status === 'DRAFT' && !isLoading ? (
        <EditDealForm deal={deal} onSaved={backToImages} openingHours={shop.openingHours} />
      ) : null}
    </SellerPageScaffold>
  );
}

function EditDealForm({
  deal,
  onSaved,
  openingHours,
}: {
  deal: MerchantDealDto;
  onSaved: () => void;
  openingHours?: MerchantOpeningHoursDto;
}) {
  const theme = useTheme();
  const updateDeal = useUpdateMerchantDeal();
  const [formError, setFormError] = useState<string | null>(null);

  const { values, errors, isSubmitting, setField, submit } = useForm<NewDealValues>({
    initialValues: {
      name: deal.name,
      portions: String(deal.totalQuantity),
      price: String(deal.discountedPrice),
      originalPrice: String(deal.originalPrice),
      open: toTimeInput(deal.saleStartsAt),
      close: toTimeInput(deal.saleEndsAt),
    },
    validate: validateNewDeal,
    onSubmit: async (next) => {
      setFormError(null);

      const result = buildDealSchedule(next.open, next.close, { openingHours });
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
