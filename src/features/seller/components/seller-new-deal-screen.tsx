import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { AppText } from '@/components/ui/app-text';
import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { TextField } from '@/components/ui/text-field';
import { DealCard } from '@/features/home/components/deal-card';
import type { Deal } from '@/features/home/types';
import {
  MAX_DEAL_IMAGES,
  createMerchantDeal,
  publishMerchantDeal,
  toMerchantDealErrorMessage,
  uploadDealImage,
} from '@/features/seller/api/merchant-deals';
import { MERCHANT_DEALS_QUERY_KEY } from '@/features/seller/api/use-merchant-deals';
import { MerchantRegistrationRequired } from '@/features/seller/components/merchant-registration-required';
import { DealHowItWorks } from '@/features/seller/components/deal-how-it-works';
import { DealImagePicker } from '@/features/seller/components/deal-image-picker';
import { PriceField } from '@/features/seller/components/deal-input-fields';
import { FormSteps } from '@/features/seller/components/form-steps';
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
import { showToast } from '@/lib/toast';

const NEW_DEAL_ROUTE = '/seller/new-deal';

const INITIAL_VALUES: NewDealValues = {
  name: '',
  portions: '10',
  price: '',
  originalPrice: '',
  open: '18:00',
  close: '21:00',
};

const STEPS = ['Món', 'Giá', 'Giờ bán', 'Xem lại'] as const;
const REVIEW_STEP = STEPS.length - 1;

// Ô thuộc từng bước: kiểm tra trước khi sang bước sau, để lỗi hiện ngay chỗ vừa nhập thay vì
// dồn hết về lúc bấm đăng ở cuối.
const STEP_FIELDS: readonly (keyof NewDealValues)[][] = [
  ['name'],
  ['originalPrice', 'price', 'portions'],
  ['open', 'close'],
  [],
];

const NEED_IMAGE =
  'Thêm ít nhất một ảnh món: khách chọn deal qua ảnh, deal không ảnh không lên sàn được.';

export function SellerNewDealScreen() {
  const theme = useTheme();
  const shop = useMerchantShop();

  const isLoading = shop.isLoading;
  // Hồ sơ quán phải đủ tên, địa chỉ, tọa độ thì backend mới cho đăng (MERCHANT_PROFILE_INCOMPLETE);
  // chặn từ đầu để người bán không nhập cả form rồi mới bị từ chối ở bước đăng.
  const isSetupDone = getShopSetupSteps(shop).every((step) => step.done);
  const canPost = !isLoading && !shop.isError && !shop.profileMissing && isSetupDone;

  return (
    <SellerPageScaffold
      subtitle={
        isLoading
          ? 'Đang kiểm tra hồ sơ quán…'
          : canPost
            ? 'Bốn bước ngắn, xem trước rồi mới đăng'
            : 'Cần hồ sơ quán đầy đủ trước khi đăng'
      }
      title="Đăng deal mới"
    >
      {isLoading ? <ActivityIndicator color={theme.primary} /> : null}

      {/* Chưa có hồ sơ quán thì danh sách deal cũng trả lỗi 404: đã có thẻ giải thích riêng ở dưới. */}
      {!shop.profileMissing && shop.isError ? (
        <InlineAlert message="Không tải được thông tin quán. Kiểm tra mạng rồi thử lại." />
      ) : null}

      {shop.profileMissing ? <MerchantRegistrationRequired /> : null}

      {!isLoading && !shop.isError && !shop.profileMissing && !isSetupDone ? (
        <>
          <ShopSetupCard
            location={shop.location}
            openingHours={shop.openingHours}
            profile={shop.profile}
          />
          <DealHowItWorks />
        </>
      ) : null}

      {shop.profileMissing ? <DealHowItWorks /> : null}

      {/* Chờ có đủ dữ liệu quán: useForm chốt giá trị ban đầu ở lần render đầu. */}
      {canPost && shop.profile ? (
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
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUris, setImageUris] = useState<string[]>([]);
  /** Nhãn tiến trình hiện dưới nút trong lúc chạy chuỗi ba bước gửi lên backend. */
  const [progress, setProgress] = useState<string | null>(null);
  const slot = todayOpeningSlot(openingHours);

  const { values, errors, isSubmitting, setField, submit, validateFields } = useForm<NewDealValues>(
    {
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

        // Giờ đã kiểm tra ở bước 3, nhưng người bán có thể để màn xem lại quá giờ mở bán.
        const schedule = buildDealSchedule(next.open, next.close, { openingHours });
        if ('error' in schedule) {
          setStep(2);
          setFormError(schedule.error);
          return;
        }

        if (imageUris.length === 0) {
          setStep(0);
          setFormError(NEED_IMAGE);
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
          showToast(`Đã đăng "${deal.name}". Khách quanh đây đặt giữ được ngay.`, {
            tone: 'success',
          });
        } catch (error) {
          const message = toMerchantDealErrorMessage(error);

          // Deal đã tạo mà hỏng ở bước ảnh hoặc bước đăng: bản nháp vẫn nằm trên server, nên đưa
          // người bán sang màn ảnh của chính bản nháp đó để làm tiếp thay vì nhập lại từ đầu.
          if (dealId) {
            await queryClient.invalidateQueries({ queryKey: MERCHANT_DEALS_QUERY_KEY });
            router.navigate({ pathname: '/seller/deal-images', params: { dealId } });
            showToast(`${message} Deal đã lưu nháp, thêm ảnh rồi đăng lại ở đây nhé.`, {
              tone: 'error',
              durationMs: 7000,
            });
            return;
          }

          setFormError(message);
        } finally {
          setProgress(null);
        }
      },
    },
  );

  // Android có thể tắt app khi camera đang mở: lấy lại nội dung đã nhập và ảnh vừa chụp. Ảnh chỉ
  // chọn ở bước đầu, nên mở lại ở bước đầu là đúng chỗ người bán đang làm.
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
  const portions = toDealNumber(values.portions);
  const hasDiscount = price > 0 && originalPrice > price;
  const isReview = step === REVIEW_STEP;

  const goTo = (next: number) => {
    setFormError(null);
    setStep(next);
  };

  const goNext = () => {
    if (!validateFields(STEP_FIELDS[step] ?? [])) return;

    if (step === 0 && imageUris.length === 0) {
      setFormError(NEED_IMAGE);
      return;
    }

    if (step === 2) {
      const schedule = buildDealSchedule(values.open, values.close, { openingHours });
      if ('error' in schedule) {
        setFormError(schedule.error);
        return;
      }
    }

    goTo(step + 1);
  };

  // Thẻ deal y như trên trang chủ của khách, dựng từ chính những gì người bán vừa nhập.
  const previewDeal: Deal = {
    id: 'preview',
    name: values.name.trim(),
    categoryId: 'other',
    store: {
      merchantId: '',
      name: profile.storeName,
      rating: 0,
      reviewCount: 0,
      isVerified: profile.verified,
      address: '',
    },
    imageUrl: imageUris[0] ?? '',
    emoji: '🍱',
    price,
    originalPrice,
    pickupWindow: { start: values.open, end: values.close },
    pickupWindowIso: { start: '', end: '' },
    distanceKm: 0,
    remaining: portions,
  };

  return (
    <>
      <FormSteps current={step} steps={STEPS} />

      {step === 0 ? (
        <SellerFormCard>
          <StepTitle
            description="Đặt tên dễ hiểu và chọn ảnh thật của món, khách chọn deal chủ yếu qua ảnh."
            title="Bán món gì?"
          />
          <TextField
            size="compact"
            error={errors.name}
            label="Tên món"
            onChangeText={(text) => setField('name', text)}
            placeholder="VD: Cơm tấm sườn cuối ngày"
            value={values.name}
          />
          <DealImagePicker
            disabled={isSubmitting}
            onChange={(uris) => {
              setFormError(null);
              setImageUris(uris);
            }}
            resume={{ route: NEW_DEAL_ROUTE, draft: { values, imageUris } }}
            uris={imageUris}
          />
          <AppText tone="textSecondary" variant="footnote">
            Quán đăng được tối đa 10 ảnh mỗi giờ, tính chung cả logo và ảnh bìa, nên chọn vừa đủ ảnh
            cho mỗi deal.
          </AppText>
        </SellerFormCard>
      ) : null}

      {step === 1 ? (
        <SellerFormCard>
          <StepTitle
            description="Mức giảm càng rõ, khách càng dễ chọn deal của quán."
            title="Giá và số phần"
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

          <AppText
            tone={hasDiscount ? 'primary' : 'textSecondary'}
            variant="footnote"
            weight={hasDiscount ? 'bold' : 'medium'}
          >
            {hasDiscount
              ? `Khách được giảm ${Math.round((1 - price / originalPrice) * 100)}%, tiết kiệm ${formatPrice(originalPrice - price)} mỗi phần.`
              : 'Nhập giá gốc và giá deal để xem mức giảm.'}
          </AppText>

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
        </SellerFormCard>
      ) : null}

      {step === 2 ? (
        <SellerFormCard>
          <StepTitle
            description={
              slot
                ? `Quán mở cửa hôm nay ${slot.opensAt}–${slot.closesAt}. Khung giờ deal phải nằm trong khung này.`
                : 'Hôm nay quán không mở cửa nên chưa đăng deal được.'
            }
            title="Giờ bán hôm nay"
          />
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
          <AppText tone="textSecondary" variant="footnote">
            Khách đặt được tới khi deal đóng và tự chọn giờ đến lấy trong khung này.
          </AppText>
        </SellerFormCard>
      ) : null}

      {isReview ? (
        <>
          <StepTitle
            description="Thẻ deal hiện trên trang chủ của khách quanh quán. Kiểm tra lại rồi đăng."
            title="Khách sẽ thấy"
          />
          <DealCard deal={previewDeal} showDistance={false} />

          <SellerFormCard compact>
            <ReviewRow
              label="Món"
              onEdit={() => goTo(0)}
              value={`${previewDeal.name} · ${imageUris.length} ảnh`}
            />
            <ReviewRow
              label="Giá"
              onEdit={() => goTo(1)}
              value={`${formatPrice(price)} thay vì ${formatPrice(originalPrice)} · ${portions} phần`}
            />
            <ReviewRow
              label="Giờ bán"
              onEdit={() => goTo(2)}
              value={`Hôm nay ${values.open}–${values.close}`}
            />
          </SellerFormCard>
        </>
      ) : null}

      {formError ? <InlineAlert message={formError} /> : null}

      {progress ? (
        <AppText align="center" tone="textSecondary" variant="footnote" weight="bold">
          {progress}
        </AppText>
      ) : null}

      <View style={styles.footer}>
        {step > 0 ? (
          <BrandButton
            disabled={isSubmitting}
            onPress={() => goTo(step - 1)}
            style={styles.footerButton}
            variant="outline"
          >
            Quay lại
          </BrandButton>
        ) : null}
        {isReview ? (
          <BrandButton
            loading={isSubmitting}
            onPress={() => void submit()}
            style={styles.footerButton}
          >
            Đăng deal
          </BrandButton>
        ) : (
          <BrandButton onPress={goNext} style={styles.footerButton}>
            Tiếp
          </BrandButton>
        )}
      </View>
    </>
  );
}

function StepTitle({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.stepTitle}>
      <AppText accessibilityRole="header" variant="headline" weight="heavy">
        {title}
      </AppText>
      <AppText tone="textSecondary" variant="bodySm">
        {description}
      </AppText>
    </View>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewText}>
        <AppText tone="textSecondary" variant="footnote">
          {label}
        </AppText>
        <AppText weight="bold">{value}</AppText>
      </View>
      <Pressable
        accessibilityLabel={`Sửa ${label.toLowerCase()}`}
        accessibilityRole="button"
        hitSlop={12}
        onPress={onEdit}
      >
        <AppText tone="primary" weight="bold">
          Sửa
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md },
  cell: { flex: 1 },
  stepTitle: { gap: Spacing.xxs },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  reviewText: { flex: 1, gap: Spacing.xxs },
  footer: { flexDirection: 'row', gap: Spacing.sm },
  footerButton: { flex: 1 },
});
