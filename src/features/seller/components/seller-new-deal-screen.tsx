import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { TextField } from '@/components/ui/text-field';
import { addSellerDeal } from '@/demo/store';
import { useSellerDemo } from '@/demo/use-demo';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
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

const toNumber = (value: string) => Number(value.replace(/\D/g, ''));

export function SellerNewDealScreen() {
  const theme = useTheme();
  const { plan } = useSellerDemo();
  const hasQuotaLeft = plan.dealPostsUsed < plan.dealPostsLimit;

  const { values, errors, setField, submit } = useForm<NewDealValues>({
    initialValues: INITIAL_VALUES,
    validate: validateNewDeal,
    onSubmit: (next) => {
      const deal = addSellerDeal({
        name: next.name.trim(),
        emoji: '🍽️',
        price: toNumber(next.price),
        originalPrice: toNumber(next.originalPrice),
        portionsTotal: toNumber(next.portions),
        pickupWindow: { start: next.open, end: next.close },
      });

      // Chuyển màn trước rồi mới báo: trên web, Alert nhiều nút không gọi được onPress nên
      // nếu đợi người dùng bấm trong hộp thoại thì sẽ kẹt lại ở form.
      router.navigate('/seller/orders');
      Alert.alert('Đã đăng deal', `"${deal.name}" đã lên sàn, khách quanh đây đặt giữ được ngay.`);
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

      <Text style={[styles.quota, { color: theme.textSecondary }]}>
        {`Đã dùng ${plan.dealPostsUsed}/${plan.dealPostsLimit} lượt đăng deal của gói ${plan.name}.`}
      </Text>

      <BrandButton disabled={!hasQuotaLeft} onPress={submit}>
        {hasQuotaLeft ? 'Đăng deal' : 'Đã hết lượt đăng trong ngày'}
      </BrandButton>
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  cell: { flex: 1 },
  hint: { fontSize: 12, fontWeight: '600' },
  quota: { fontSize: 12, textAlign: 'center' },
});
