import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { HomeIcon } from '@/features/home/components/home-icon';
import { SellerMenuList, type SellerMenuItem } from '@/features/seller/components/seller-menu-list';
import { SellerShopHeader } from '@/features/seller/components/seller-shop-header';
import { ShopInfoSheet } from '@/features/seller/components/shop-info-sheet';
import { SellerIcons } from '@/features/seller/constants/icons';
import { updateSellerShop } from '@/features/seller/data/seller-profile-store';
import { useLightStatusBar } from '@/features/seller/hooks/use-light-status-bar';
import { useSellerProfile } from '@/features/seller/hooks/use-seller-profile';
import { useTheme } from '@/hooks/use-theme';

// Tab Hồ sơ quán là trang trung chuyển: mỗi mục mở một trang con có nút quay lại về đây.
export function SellerShopScreen() {
  const theme = useTheme();
  const { shop } = useSellerProfile();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  useLightStatusBar();

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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SellerShopHeader
          email={shop.email}
          // Chưa có thư viện chọn ảnh và API tải ảnh lên.
          onPressAvatar={() =>
            Alert.alert('Ảnh đại diện', 'Tính năng đổi ảnh quán đang được phát triển.')
          }
          shopName={shop.name}
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
            <HomeIcon name={SellerIcons.person} color={theme.text} size={16} />
            <Text style={[styles.switchLabel, { color: theme.text }]}>Chuyển sang người mua</Text>
          </Pressable>
        </View>
      </ScrollView>

      <AssistantFab bottomOffset={96} />

      <ShopInfoSheet
        onClose={() => setIsInfoOpen(false)}
        onSave={updateSellerShop}
        shop={shop}
        visible={isInfoOpen}
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
  pressed: { opacity: 0.8 },
});
