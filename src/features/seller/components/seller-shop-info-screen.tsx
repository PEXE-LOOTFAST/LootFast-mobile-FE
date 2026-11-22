import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { MaxContentWidth, Shadow, Spacing } from '@/constants/theme';
import { geocodeAddress } from '@/features/map/api/geocode';
import {
  saveShopInfo,
  toShopErrorMessage,
  toShopInfoValues,
} from '@/features/seller/api/shop-info-save';
import { MerchantProfileNotCreated } from '@/features/seller/components/merchant-registration-required';
import { SellerHeader } from '@/features/seller/components/seller-header';
import { ShopInfoFields, type ShopSection } from '@/features/seller/components/shop-info-fields';
import { ShopSummaryCard } from '@/features/seller/components/shop-summary-card';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import { clearShopInfoDraft, loadShopInfoDraft } from '@/features/seller/shop-info-draft';
import { validateShopInfo, type ShopInfoValues } from '@/features/seller/validation';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';
import { showToast } from '@/lib/toast';
import type { FormErrors } from '@/types/form';

type MerchantShop = ReturnType<typeof useMerchantShop>;

/** Ô nào thuộc khối nào, để lưu lỗi thì cuộn tới khối đầu tiên có ô sai. */
const SECTION_FIELDS: Record<ShopSection, (keyof ShopInfoValues)[]> = {
  profile: ['storeName', 'description', 'businessCategory'],
  contact: ['contactEmail', 'contactPhone'],
  location: ['addressLine', 'ward', 'district', 'city', 'latitude', 'longitude'],
  hours: ['open', 'close', 'openDays'],
};

const SECTION_ORDER: ShopSection[] = ['profile', 'contact', 'location', 'hours'];

export function SellerShopInfoScreen() {
  const theme = useTheme();
  const shop = useMerchantShop();
  const storeName = shop.profile?.storeName?.trim();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SellerHeader
        subtitle={storeName || 'Hồ sơ, địa chỉ và giờ mở cửa'}
        subtitleIcon={storeName ? SellerIcons.store : undefined}
        title="Cửa hàng"
      />

      {shop.isLoading ? (
        <StatusBody>
          <ActivityIndicator color={theme.primary} />
        </StatusBody>
      ) : shop.isError ? (
        <StatusBody>
          <InlineAlert
            message={toShopErrorMessage(shop.error, 'Không tải được hồ sơ quán. Thử lại sau.')}
          />
          <BrandButton onPress={() => void shop.refetch()}>Tải lại</BrandButton>
        </StatusBody>
      ) : shop.profileMissing ? (
        <StatusBody>
          <MerchantProfileNotCreated />
        </StatusBody>
      ) : (
        <ShopInfoGate shop={shop} />
      )}
    </View>
  );
}

function StatusBody({ children }: { children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.body}>{children}</View>
    </ScrollView>
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
      <StatusBody>
        <ActivityIndicator color={theme.primary} />
        {phase === 'applying' ? (
          <AppText align="center" tone="textSecondary" variant="bodySm">
            Đang lưu thông tin quán bạn đã nhập khi đăng ký…
          </AppText>
        ) : null}
      </StatusBody>
    );
  }

  return <ShopInfoForm applyError={applyError} fallback={pendingDraft} shop={shop} />;
}

type ShopInfoFormProps = {
  shop: MerchantShop;
  /** Bản nháp lúc đăng ký chưa lưu được: nạp vào form để người bán bấm lưu lại. */
  fallback?: ShopInfoValues;
  applyError?: string;
};

function ShopInfoForm({ shop, fallback, applyError }: ShopInfoFormProps) {
  const theme = useTheme();
  // Mốc "đã lưu": so với giá trị đang sửa để biết có thay đổi chưa lưu, và để chỉ gửi phần đã đổi.
  const [saved, setSaved] = useState<ShopInfoValues>(() => toShopInfoValues(shop));
  const [values, setValues] = useState(fallback ?? saved);
  const [errors, setErrors] = useState<FormErrors<ShopInfoValues>>({});
  const [submitError, setSubmitError] = useState<string>();
  // Đổi key để dựng lại các ô (gồm trạng thái khoá địa chỉ bên trong) khi hoàn tác.
  const [fieldsKey, setFieldsKey] = useState(0);
  const isDirty = JSON.stringify(values) !== JSON.stringify(saved);

  const scrollRef = useRef<ScrollView | null>(null);
  const sectionY = useRef<Partial<Record<ShopSection, number>>>({});
  const pendingSection = useRef<ShopSection | null>(null);

  const scrollToSection = useCallback((section: ShopSection) => {
    const y = sectionY.current[section];
    if (y === undefined) return false;
    scrollRef.current?.scrollTo({ y, animated: true });
    return true;
  }, []);

  // Mở từ danh sách "Hoàn tất hồ sơ quán" (?section=hours…) thì cuộn thẳng tới phần còn thiếu.
  const { section } = useLocalSearchParams<{ section?: ShopSection }>();
  useFocusEffect(
    useCallback(() => {
      if (!section) return;
      if (!scrollToSection(section)) pendingSection.current = section;
      router.setParams({ section: undefined });
    }, [section, scrollToSection]),
  );

  const handleSectionLayout = (key: ShopSection, y: number) => {
    sectionY.current[key] = y;
    if (pendingSection.current === key) {
      pendingSection.current = null;
      requestAnimationFrame(() => scrollToSection(key));
    }
  };

  function setField<K extends keyof ShopInfoValues>(field: K, value: ShopInfoValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }

  function discardChanges() {
    setValues(saved);
    setErrors({});
    setSubmitError(undefined);
    setFieldsKey((key) => key + 1);
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
    const firstInvalid = SECTION_ORDER.find((key) =>
      SECTION_FIELDS[key].some((field) => nextErrors[field]),
    );
    if (firstInvalid) {
      haptics.error();
      scrollToSection(firstInvalid);
      return;
    }

    setSubmitError(undefined);

    try {
      await saveShopInfo(shop, current, saved);
      setSaved(current);
      haptics.success();
      showToast('Đã lưu thông tin quán', { tone: 'success' });
    } catch (error) {
      haptics.error();
      setSubmitError(toShopErrorMessage(error));
    }
  }

  return (
    <>
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          <ShopSummaryCard onPressSection={scrollToSection} shop={shop} />

          {applyError ? (
            <InlineAlert
              message={`Chưa lưu được thông tin quán đã nhập khi đăng ký: ${applyError} Bấm "Lưu thay đổi" để thử lại.`}
            />
          ) : null}

          <ShopInfoFields
            key={fieldsKey}
            errors={errors}
            onChange={setField}
            onSectionLayout={handleSectionLayout}
            values={values}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Thanh lưu chỉ hiện khi có thay đổi: form dài, nút lưu ở cuối trang rất dễ bị bỏ sót. */}
      {isDirty ? (
        <View
          style={[
            styles.saveBar,
            { backgroundColor: theme.backgroundElement, borderTopColor: theme.border },
          ]}
        >
          <View style={styles.saveInner}>
            {submitError ? <InlineAlert message={submitError} /> : null}
            <View style={styles.saveRow}>
              <BrandButton onPress={discardChanges} style={styles.discard} variant="outline">
                Hoàn tác
              </BrandButton>
              <BrandButton loading={shop.isSaving} onPress={submit} style={styles.save}>
                Lưu thay đổi
              </BrandButton>
            </View>
          </View>
        </View>
      ) : null}
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
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  // Nút "Đăng deal" giữa thanh tab nhô lên trên ~24px, nên chừa đáy để không đè lên nút lưu.
  saveBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    boxShadow: Shadow.tabBar,
  },
  saveInner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.sm },
  saveRow: { flexDirection: 'row', gap: Spacing.md },
  discard: { flex: 1 },
  save: { flex: 2 },
});
