import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import {
  saveShopInfo,
  toShopErrorMessage,
  toShopInfoValues,
} from '@/features/seller/api/shop-info-save';
import { MerchantProfileNotCreated } from '@/features/seller/components/merchant-registration-required';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { ShopInfoFields } from '@/features/seller/components/shop-info-fields';
import { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import { clearShopInfoDraft, loadShopInfoDraft } from '@/features/seller/shop-info-draft';
import { validateShopInfo, type ShopInfoValues } from '@/features/seller/validation';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import type { FormErrors } from '@/types/form';

const goBack = () => (router.canGoBack() ? router.back() : router.navigate('/seller/reports'));

type MerchantShop = ReturnType<typeof useMerchantShop>;

/**
 * Trang Thông tin quán — gộp cả đăng ký bán hàng. Chưa có hồ sơ quán thì hiện form đăng ký (thông
 * tin quán + giấy phép); đã có thì hiện form sửa. Thông tin quán lưu qua ba API của backend:
 * hồ sơ (`PUT /merchants/me`), vị trí (`/location`) và giờ mở cửa (`/opening-hours`).
 *
 * Form chỉ dựng sau khi cả ba request tải xong: giá trị ban đầu nằm trong useState nên mount
 * sớm thì các ô sẽ trống dù dữ liệu về sau đó.
 */
export function SellerShopInfoScreen() {
  const theme = useTheme();
  const shop = useMerchantShop();

  return (
    <SellerPageScaffold
      onPressBack={goBack}
      subtitle="Đăng ký bán hàng, hồ sơ, địa chỉ và giờ mở cửa của quán"
      title="Thông tin quán"
    >
      {shop.isLoading ? <ActivityIndicator color={theme.primary} /> : null}

      {shop.isError ? (
        <>
          <InlineAlert
            message={toShopErrorMessage(shop.error, 'Không tải được hồ sơ quán. Thử lại sau.')}
          />
          <BrandButton onPress={() => void shop.refetch()}>Tải lại</BrandButton>
        </>
      ) : null}

      {shop.profileMissing ? <MerchantProfileNotCreated /> : null}

      {shop.isLoading || shop.isError || shop.profileMissing ? null : <ShopInfoGate shop={shop} />}
    </SellerPageScaffold>
  );
}

/**
 * Hồ sơ quán vừa được tạo (sau khi admin duyệt) thì còn trống. Nếu người bán đã nhập thông tin quán
 * lúc đăng ký, bản nháp trên máy được gửi lên ngay ở đây, rồi mới hiện form sửa với dữ liệu thật.
 * Gửi lỗi thì giữ nguyên bản nháp, điền sẵn vào form để người bán bấm lưu lại.
 */
function ShopInfoGate({ shop }: { shop: MerchantShop }) {
  const theme = useTheme();
  const { user } = useAuthSession();
  const email = user?.email;
  const [phase, setPhase] = useState<'checking' | 'applying' | 'ready'>('checking');
  const [pendingDraft, setPendingDraft] = useState<ShopInfoValues>();
  const [applyError, setApplyError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!email) return;
      const draft = await loadShopInfoDraft(email);
      if (cancelled) return;

      if (!draft) {
        setPhase('ready');
        return;
      }
      // Hồ sơ đã có dữ liệu thì bản nháp cũ không còn giá trị: bỏ đi, không đè lên dữ liệu thật.
      if (shop.profile?.storeName) {
        await clearShopInfoDraft(email);
        if (!cancelled) setPhase('ready');
        return;
      }

      setPhase('applying');
      try {
        await saveShopInfo(shop, draft, toShopInfoValues(shop));
        await clearShopInfoDraft(email);
      } catch (error) {
        setPendingDraft(draft);
        setApplyError(toShopErrorMessage(error));
      }
      if (!cancelled) setPhase('ready');
    })();

    return () => {
      cancelled = true;
    };
    // Chỉ chạy một lần khi trang mở: hồ sơ lưu xong sẽ đổi `shop`, không được kích hoạt lại.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  if (phase !== 'ready') {
    return (
      <>
        <ActivityIndicator color={theme.primary} />
        {phase === 'applying' ? (
          <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>
            Đang lưu thông tin quán bạn đã nhập khi đăng ký…
          </Text>
        ) : null}
      </>
    );
  }

  return (
    <>
      {applyError ? (
        <InlineAlert
          message={`Chưa lưu được thông tin quán đã nhập khi đăng ký: ${applyError} Bấm "Lưu thay đổi" để thử lại.`}
        />
      ) : null}
      <ShopInfoForm shop={shop} fallback={pendingDraft} />
    </>
  );
}

function ShopInfoForm({ shop, fallback }: { shop: MerchantShop; fallback?: ShopInfoValues }) {
  // `initial` là giá trị đang lưu ở server (để biết phần nào đã sửa); `fallback` là bản nháp chưa
  // gửi được, điền sẵn vào ô nhập nhưng vẫn so với `initial` nên bấm lưu sẽ gửi lại đủ.
  const [initial] = useState<ShopInfoValues>(() => toShopInfoValues(shop));
  const [values, setValues] = useState(fallback ?? initial);
  const [errors, setErrors] = useState<FormErrors<ShopInfoValues>>({});
  const [submitError, setSubmitError] = useState<string>();
  const [saved, setSaved] = useState(false);

  function setField<K extends keyof ShopInfoValues>(field: K, value: ShopInfoValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
    setSaved(false);
  }

  async function submit() {
    const nextErrors = validateShopInfo(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitError(undefined);
    setSaved(false);

    try {
      await saveShopInfo(shop, values, initial);
      setSaved(true);
    } catch (error) {
      setSubmitError(toShopErrorMessage(error));
    }
  }

  return (
    <>
      <ShopInfoFields errors={errors} onChange={setField} values={values} />

      {submitError ? <InlineAlert message={submitError} /> : null}
      {saved ? <InlineAlert message="Đã lưu thông tin quán." tone="success" /> : null}

      <BrandButton loading={shop.isSaving} onPress={submit}>
        Lưu thay đổi
      </BrandButton>
    </>
  );
}
