import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { MaxContentWidth } from '@/constants/theme';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import {
  saveShopInfo,
  toShopErrorMessage,
  toShopInfoValues,
} from '@/features/seller/api/shop-info-save';
import { geocodeAddress } from '@/features/map/api/geocode';
import { MerchantProfileNotCreated } from '@/features/seller/components/merchant-registration-required';
import { SellerHeader } from '@/features/seller/components/seller-header';
import { ShopInfoFields } from '@/features/seller/components/shop-info-fields';
import { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import { clearShopInfoDraft, loadShopInfoDraft } from '@/features/seller/shop-info-draft';
import { validateShopInfo, type ShopInfoValues } from '@/features/seller/validation';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import type { FormErrors } from '@/types/form';

type MerchantShop = ReturnType<typeof useMerchantShop>;

export function SellerShopInfoScreen() {
  const theme = useTheme();
  const shop = useMerchantShop();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SellerHeader subtitle="Hồ sơ, địa chỉ và giờ mở cửa" title="Thông tin quán" />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
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

          {shop.isLoading || shop.isError || shop.profileMissing ? null : (
            <ShopInfoGate shop={shop} />
          )}
        </View>
      </KeyboardAwareScrollView>

      <AssistantFab bottomOffset={96} />
    </View>
  );
}

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
    let current = values;

    // Chưa có toạ độ (người bán chỉ nhập địa chỉ) thì tra từ địa chỉ; tra lỗi thì để validate báo.
    if (!current.latitude.trim() || !current.longitude.trim()) {
      const address = [current.addressLine, current.ward, current.district, current.city]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(', ');

      try {
        const { latitude, longitude } = await geocodeAddress(address);
        current = { ...current, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) };
        setValues(current);
      } catch {}
    }

    const nextErrors = validateShopInfo(current);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitError(undefined);
    setSaved(false);

    try {
      await saveShopInfo(shop, current, initial);
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 120 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 16,
  },
});
