import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { updateSellerStore } from '@/demo/store';
import { useSellerDemo } from '@/demo/use-demo';
import { MaxContentWidth } from '@/constants/theme';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { SellerMenuList, type SellerMenuItem } from '@/features/seller/components/seller-menu-list';
import { SellerShopHeader } from '@/features/seller/components/seller-shop-header';
import { ShopInfoSheet } from '@/features/seller/components/shop-info-sheet';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useMerchantImageUpload } from '@/features/seller/hooks/use-merchant-image-upload';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import {
  openCloseToSlots,
  slotsToOpenClose,
  useMerchantShop,
} from '@/features/seller/hooks/use-merchant-shop';
import type { SellerShop, SellerShopCategory } from '@/features/seller/types';
import { useTheme } from '@/hooks/use-theme';
import { confirmSignOut } from '@/lib/confirm-sign-out';

function mapErrorCode(code: string): string {
  const messages: Record<string, string> = {
    UNAUTHORIZED: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
    FORBIDDEN: 'Tài khoản chưa được cấp quyền Người bán.',
    MERCHANT_PROFILE_NOT_FOUND: 'Chưa tìm thấy hồ sơ quán.',
    VALIDATION_FAILED: 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.',
    OPENING_HOURS_OVERLAP: 'Khung giờ mở cửa trong ngày không được trùng nhau.',
    FILE_TOO_LARGE: 'Ảnh vượt quá 5 MB. Vui lòng chọn ảnh nhỏ hơn.',
    UPLOAD_RATE_LIMIT_EXCEEDED: 'Đổi ảnh quá nhiều lần. Thử lại sau 1 giờ.',
    SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời bảo trì. Thử lại sau.',
  };
  return messages[code] ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export function SellerShopScreen() {
  const theme = useTheme();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  useLightStatusBar();

  const {
    profile,
    location,
    openingHours,
    isLoading,
    isError,
    isSaving,
    refetch,
    updateProfile,
    updateLocation,
    updateOpeningHours,
  } = useMerchantShop();

  const { pickAndUpload } = useMerchantImageUpload();
  const { shop: demoShop } = useSellerDemo();

  // Không gọi được API người bán (thường là chưa bật backend) thì chạy tiếp bằng kho dữ liệu
  // demo, để buổi demo không dừng ở màn lỗi. Sửa thông tin lúc này ghi vào kho demo.
  const isOffline = isError;

  const shopForForm: SellerShop = isOffline
    ? demoShop
    : {
        name: profile?.storeName ?? '',
        isVerified: profile !== undefined,
        email: profile?.contactEmail ?? '',
        address: location?.addressLine ?? '',
        categories: profile?.businessCategory
          ? [profile.businessCategory as SellerShopCategory]
          : [],
        openingHours: slotsToOpenClose(openingHours),
      };

  async function handleSave(partial: Partial<SellerShop>) {
    if (isOffline) {
      updateSellerStore({
        ...(partial.name !== undefined ? { name: partial.name.trim() } : {}),
        ...(partial.address !== undefined ? { address: partial.address.trim() } : {}),
        ...(partial.categories !== undefined ? { shopCategories: partial.categories } : {}),
        ...(partial.openingHours !== undefined ? { openingHours: partial.openingHours } : {}),
      });
      setIsInfoOpen(false);
      return;
    }

    try {
      if (partial.name !== undefined || partial.categories !== undefined) {
        await updateProfile({
          storeName: partial.name?.trim() ?? profile?.storeName ?? '',
          description: profile?.description ?? undefined,
          businessCategory: partial.categories?.[0] ?? profile?.businessCategory ?? '',
          contactEmail: profile?.contactEmail ?? '',
          contactPhone: profile?.contactPhone ?? '',
        });
      }
      if (partial.address !== undefined) {
        await updateLocation({
          addressLine: partial.address.trim(),
          ward: location?.ward ?? '',
          district: location?.district ?? '',
          city: location?.city ?? '',
          latitude: location?.latitude ?? 0,
          longitude: location?.longitude ?? 0,
        });
      }
      if (partial.openingHours !== undefined) {
        await updateOpeningHours(
          openCloseToSlots(partial.openingHours.open, partial.openingHours.close),
        );
      }
      setIsInfoOpen(false);
    } catch (err) {
      const code = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
      Alert.alert('Lỗi lưu thông tin', mapErrorCode(code));
    }
  }

  const menuItems: SellerMenuItem[] = [
    {
      key: 'info',
      icon: SellerIcons.store,
      title: 'Thông tin quán',
      subtitle: 'Thông tin cửa hàng và hồ sơ xác minh',
      onPress: () => setIsInfoOpen(true),
    },
    {
      key: 'plan',
      icon: SellerIcons.crown,
      title: 'Gói Người bán Cao cấp',
      onPress: () =>
        router.navigate({ pathname: '/seller/plan', params: { from: '/seller/shop' } }),
    },
    {
      key: 'reports',
      icon: SellerIcons.report,
      title: 'Báo cáo',
      onPress: () => router.navigate('/seller/reports'),
    },
    {
      key: 'growth',
      icon: SellerIcons.megaphone,
      title: 'Chương trình tăng trưởng',
      onPress: () => router.navigate('/seller/growth'),
    },
    {
      key: 'settings',
      icon: SellerIcons.settings,
      title: 'Cài đặt',
      onPress: () => router.navigate('/seller/settings'),
    },
    {
      key: 'support',
      icon: SellerIcons.support,
      title: 'Hỗ trợ đối tác',
      onPress: () => Alert.alert('Hỗ trợ đối tác', 'Kênh hỗ trợ đối tác đang được phát triển.'),
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <SellerShopHeader
          email={isOffline ? demoShop.email : isLoading ? '' : (profile?.contactEmail ?? '')}
          onPressAvatar={() => pickAndUpload('logo')}
          shopName={
            isOffline ? demoShop.name : isLoading ? 'Đang tải...' : (profile?.storeName ?? '—')
          }
        />

        <View style={styles.body}>
          <SellerMenuList items={menuItems} title="QUẢN LÝ CỬA HÀNG" />

          <Pressable
            accessibilityLabel="Chuyển sang người mua"
            accessibilityRole="button"
            onPress={() => router.navigate('/profile')}
            style={({ pressed }) => [
              styles.switchButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={SellerIcons.person} color={theme.text} size={16} />
            <Text style={[styles.switchLabel, { color: theme.text }]}>Chuyển sang người mua</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Đăng xuất"
            accessibilityRole="button"
            onPress={() => confirmSignOut()}
            style={({ pressed }) => [
              styles.signOut,
              { backgroundColor: theme.backgroundElement, borderColor: theme.danger },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={SellerIcons.logout} color={theme.danger} size={16} />
            <Text style={[styles.signOutLabel, { color: theme.danger }]}>Đăng xuất</Text>
          </Pressable>
        </View>
      </ScrollView>

      <AssistantFab bottomOffset={96} />

      <ShopInfoSheet
        onClose={() => setIsInfoOpen(false)}
        onSave={handleSave}
        shop={shopForForm}
        visible={isInfoOpen && !isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 120 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    marginTop: 34,
    paddingHorizontal: 16,
  },
  switchButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 22,
    boxShadow: '0px 4px 10px rgba(23, 33, 27, 0.06)',
  },
  switchLabel: { fontSize: 14, fontWeight: '800' },
  signOut: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 22,
  },
  signOutLabel: { fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
