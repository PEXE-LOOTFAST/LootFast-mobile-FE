import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { PAYMENT_OPTIONS, getPaymentOption, type PaymentMethod } from '@/constants/payments';
import { DealImage } from '@/features/home/components/deal-image';
import { HomeIcons } from '@/features/home/constants/icons';
import type { Deal } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

type ReserveSheetProps = {
  visible: boolean;
  deal: Deal;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, paymentMethod: PaymentMethod) => void;
};

/**
 * Bước xác nhận trước khi đặt giữ: chọn số lượng, xem lại giờ lấy và chọn cách trả tiền.
 * Ví điện tử trả trước để giữ chỗ chắc chắn, hoặc trả trực tiếp khi tới quán nhận món.
 */
export function ReserveSheet({
  visible,
  deal,
  isSubmitting,
  onClose,
  onConfirm,
}: ReserveSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<PaymentMethod>('momo');

  const payment = getPaymentOption(method);
  const total = deal.price * quantity;
  const originalTotal = deal.originalPrice * quantity;
  const savings = originalTotal - total;
  const maxQuantity = Math.max(deal.remaining, 1);
  const pickupLabel = `${deal.pickupWindow.start}–${deal.pickupWindow.end}`;

  const changeQuantity = (step: number) =>
    setQuantity((current) => Math.min(Math.max(current + step, 1), maxQuantity));

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Đóng đặt giữ"
          accessibilityRole="button"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />

        <Animated.View
          entering={SlideInDown.duration(260)}
          style={[
            styles.sheet,
            { backgroundColor: theme.backgroundElement, paddingBottom: insets.bottom + 12 },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.dealRow, { borderBottomColor: theme.border }]}>
              <DealImage
                emoji={deal.emoji}
                emojiSize={26}
                style={styles.dealImage}
                uri={deal.imageUrl}
              />
              <View style={styles.dealCopy}>
                <Text numberOfLines={1} style={[styles.storeName, { color: theme.primary }]}>
                  {deal.store.name}
                </Text>
                <Text numberOfLines={1} style={[styles.dealName, { color: theme.text }]}>
                  {deal.name}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: theme.primary }]}>
                    {formatPrice(deal.price)}
                  </Text>
                  <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
                    {formatPrice(deal.originalPrice)}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityLabel="Đóng đặt giữ"
                accessibilityRole="button"
                hitSlop={8}
                onPress={onClose}
              >
                <Icon name={HomeIcons.close} color={theme.text} size={20} />
              </Pressable>
            </View>

            <Section title="Số lượng">
              <View style={styles.quantityRow}>
                <StepButton
                  disabled={quantity <= 1}
                  label="Bớt một phần"
                  onPress={() => changeQuantity(-1)}
                  symbol="−"
                />
                <Text style={[styles.quantity, { color: theme.text }]}>{quantity}</Text>
                <StepButton
                  disabled={quantity >= maxQuantity}
                  label="Thêm một phần"
                  onPress={() => changeQuantity(1)}
                  symbol="+"
                />
                <Text style={[styles.remaining, { color: theme.textSecondary }]}>
                  Còn {deal.remaining} phần
                </Text>
              </View>
            </Section>

            <Section title="Giờ lấy">
              <View style={[styles.pickupChip, { backgroundColor: theme.primarySoft }]}>
                <Icon name={HomeIcons.clock} color={theme.primary} size={15} />
                <Text style={[styles.pickupText, { color: theme.primary }]}>{pickupLabel}</Text>
              </View>
              <Text style={[styles.hint, { color: theme.textSecondary }]}>
                Tới quán trong khung giờ này để nhận món.
              </Text>
            </Section>

            <Section title="Thanh toán">
              <View style={styles.methods}>
                {PAYMENT_OPTIONS.map((option) => {
                  const isActive = option.id === method;

                  return (
                    <Pressable
                      key={option.id}
                      accessibilityLabel={option.label}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isActive }}
                      onPress={() => setMethod(option.id)}
                      style={({ pressed }) => [
                        styles.method,
                        {
                          backgroundColor: isActive ? theme.primarySoft : theme.background,
                          borderColor: isActive ? theme.primary : theme.border,
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={[styles.brand, { backgroundColor: option.brandColor }]}>
                        <Text style={styles.brandInitial}>{option.initial}</Text>
                      </View>
                      <Text numberOfLines={1} style={[styles.methodLabel, { color: theme.text }]}>
                        {option.shortLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[styles.hint, { color: theme.textSecondary }]}>{payment.note}</Text>
            </Section>

            <View style={[styles.summary, { borderTopColor: theme.border }]}>
              <SummaryRow
                label={`${deal.name} × ${quantity}`}
                value={formatPrice(total)}
                color={theme.text}
              />
              <SummaryRow
                label="Giá gốc"
                value={formatPrice(originalTotal)}
                color={theme.textSecondary}
                strikethrough
              />
              {savings > 0 ? (
                <SummaryRow
                  label="Tiết kiệm"
                  value={`-${formatPrice(savings)}`}
                  color={theme.primary}
                  bold
                />
              ) : null}

              <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>Tổng cộng</Text>
                <Text style={[styles.totalValue, { color: theme.text }]}>{formatPrice(total)}</Text>
              </View>
            </View>

            <BrandButton loading={isSubmitting} onPress={() => onConfirm(quantity, method)}>
              {payment.isPrepaid ? `Thanh toán qua ${payment.label}` : 'Đặt giữ, trả tại quán'}
            </BrandButton>

            <Text style={[styles.footnote, { color: theme.textSecondary }]}>
              {payment.isPrepaid
                ? 'Huỷ miễn phí trong 15 phút đầu sau khi đặt giữ.'
                : 'Huỷ miễn phí cho tới khi quán soạn xong món.'}
            </Text>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <View style={[styles.section, { borderBottomColor: theme.border }]}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );
}

function StepButton({
  disabled,
  label,
  onPress,
  symbol,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  symbol: string;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.step,
        { backgroundColor: theme.background, borderColor: theme.border },
        disabled && styles.stepDisabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.stepSymbol, { color: theme.text }]}>{symbol}</Text>
    </Pressable>
  );
}

function SummaryRow({
  label,
  value,
  color,
  bold,
  strikethrough,
}: {
  label: string;
  value: string;
  color: string;
  bold?: boolean;
  strikethrough?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text numberOfLines={1} style={[styles.summaryLabel, { color }, bold && styles.bold]}>
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          { color },
          bold && styles.bold,
          strikethrough && styles.strikethrough,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(12, 22, 16, 0.45)' },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  handle: { width: 42, height: 4, alignSelf: 'center', marginBottom: 10, borderRadius: 2 },
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 14,
  },
  dealImage: { width: 56, height: 56, borderRadius: 14 },
  dealCopy: { flex: 1, gap: 2 },
  storeName: { fontSize: 12, fontWeight: '700' },
  dealName: { fontSize: 15, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { fontSize: 16, fontWeight: '900' },
  originalPrice: { fontSize: 13, textDecorationLine: 'line-through' },
  section: { gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 14 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  step: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 19,
  },
  stepDisabled: { opacity: 0.4 },
  stepSymbol: { fontSize: 18, fontWeight: '900' },
  quantity: { minWidth: 24, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  remaining: { flex: 1, fontSize: 12, textAlign: 'right' },
  pickupChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pickupText: { fontSize: 13, fontWeight: '800' },
  hint: { fontSize: 12, lineHeight: 17 },
  methods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  method: {
    flexGrow: 1,
    flexBasis: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  brand: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  brandInitial: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  methodLabel: { flexShrink: 1, fontSize: 13, fontWeight: '800' },
  summary: { gap: 8, borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 14 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: { flexShrink: 1, fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '700' },
  bold: { fontWeight: '900' },
  strikethrough: { textDecorationLine: 'line-through' },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  totalLabel: { fontSize: 15, fontWeight: '800' },
  totalValue: { fontSize: 20, fontWeight: '900' },
  footnote: { marginTop: 10, fontSize: 11, textAlign: 'center' },
  pressed: { opacity: 0.85 },
});
