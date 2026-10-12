import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { EmptyCard } from '@/components/ui/empty-card';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { LoadingState } from '@/components/ui/loading-state';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth } from '@/constants/theme';
import { BuyerHeader } from '@/features/home/components/buyer-header';
import {
  FAVORITE_CATEGORIES_MAX,
  toPreferencesErrorMessage,
} from '@/features/profile/api/preferences';
import { getProfileErrorMessage } from '@/features/profile/api/profile';
import { useAvatarUpload } from '@/features/profile/api/use-avatar';
import { AreaSelectField } from '@/features/profile/components/area-select-field';
import { useUpdateDiscoveryPreferences } from '@/features/profile/api/use-discovery-preferences';
import { useProfile } from '@/features/profile/api/use-profile';
import { ProfileIcons } from '@/features/profile/constants/icons';
import { getInitials } from '@/features/profile/get-initials';
import { useShopCategories } from '@/features/seller/api/shop-categories';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';

const ROUTE = '/profile-info';

type Draft = { pickupArea: string; categories: string[] };

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((code) => b.includes(code));

// Backend lưu số điện thoại không có số 0 đầu; hiển thị như người dùng vẫn gõ.
const toDisplayPhone = (phone: string | null) =>
  !phone ? '' : phone.startsWith('0') || phone.startsWith('+') ? phone : `0${phone}`;

/**
 * Hồ sơ người mua. Chỉ sửa được những gì backend cho phép: ảnh đại diện và tuỳ chọn khám phá (khu
 * vực nhận món, nhóm món yêu thích). Họ tên, email, số điện thoại hiện chỉ xem vì backend chưa có
 * endpoint cập nhật.
 */
export function ProfileInfoScreen() {
  const theme = useTheme();
  const { user } = useAuthSession();
  const profileQuery = useProfile(Boolean(user));
  const categories = useShopCategories();
  const avatar = useAvatarUpload(ROUTE);
  const update = useUpdateDiscoveryPreferences();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const profile = profileQuery.data;
  const saved: Draft = {
    pickupArea: profile?.pickupArea ?? '',
    categories: profile?.favoriteCategories ?? [],
  };
  const values = draft ?? saved;
  const isDirty =
    draft !== null &&
    (draft.pickupArea.trim() !== saved.pickupArea.trim() ||
      !sameSet(draft.categories, saved.categories));

  const displayName =
    profile?.displayName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const initials = getInitials(displayName);

  const edit = (next: Partial<Draft>) => {
    setJustSaved(false);
    update.reset();
    setDraft({ ...values, ...next });
  };

  const toggleCategory = (code: string) => {
    const selected = values.categories.includes(code);
    if (!selected && values.categories.length >= FAVORITE_CATEGORIES_MAX) return;

    edit({
      categories: selected
        ? values.categories.filter((item) => item !== code)
        : [...values.categories, code],
    });
  };

  const handleSave = () => {
    update.mutate(
      {
        pickupArea: values.pickupArea.trim() || null,
        favoriteCategories: values.categories,
      },
      {
        onSuccess: () => {
          setDraft(null);
          setJustSaved(true);
        },
      },
    );
  };

  const goBack = () => router.navigate('/profile');

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BuyerHeader
          onBack={goBack}
          subtitle="Thông tin tài khoản và gợi ý cho bạn"
          title="Hồ sơ"
        />

        <View style={styles.body}>
          {!user ? (
            <EmptyCard
              description="Đăng nhập để xem và chỉnh sửa hồ sơ của bạn."
              title="Chưa đăng nhập"
            />
          ) : profileQuery.isPending ? (
            <LoadingState label="Đang tải hồ sơ..." />
          ) : profileQuery.isError ? (
            <ErrorState
              message={getProfileErrorMessage(profileQuery.error)}
              onRetry={() => void profileQuery.refetch()}
              retrying={profileQuery.isRefetching}
            />
          ) : (
            <>
              <View
                style={[
                  styles.card,
                  styles.avatarCard,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
                  {profile?.avatarUrl ? (
                    <Image
                      contentFit="cover"
                      source={{ uri: profile.avatarUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={[styles.avatarText, { color: theme.primary }]}>{initials}</Text>
                  )}
                </View>
                <View style={styles.avatarCopy}>
                  <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
                    {displayName}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    disabled={avatar.isUploading}
                    onPress={() => void avatar.pickAndUpload()}
                    style={({ pressed }) => [styles.changePhoto, pressed && styles.pressed]}
                  >
                    {avatar.isUploading ? (
                      <ActivityIndicator color={theme.primary} size="small" />
                    ) : (
                      <Icon name={ProfileIcons.camera} color={theme.primary} size={14} />
                    )}
                    <Text style={[styles.changePhotoText, { color: theme.primary }]}>
                      Đổi ảnh đại diện
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                THÔNG TIN TÀI KHOẢN
              </Text>
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}
              >
                <TextField editable={false} label="Họ và tên" size="compact" value={displayName} />
                <TextField
                  editable={false}
                  label="Email"
                  size="compact"
                  value={profile?.email ?? ''}
                />
                <TextField
                  editable={false}
                  label="Số điện thoại"
                  placeholder="Chưa cập nhật"
                  size="compact"
                  value={toDisplayPhone(profile?.phoneNumber ?? null)}
                />
                <Text style={[styles.hint, { color: theme.textSecondary }]}>
                  Họ tên, email và số điện thoại hiện chưa chỉnh sửa được trong ứng dụng.
                </Text>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                GỢI Ý CHO BẠN
              </Text>
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}
              >
                <AreaSelectField
                  description="Bạn sẽ nhận thông báo khi quán thuộc khu vực này đăng deal mới. Chọn xã, phường hoặc tỉnh/thành có trong địa chỉ quán. Khu vực chỉ dùng để gửi thông báo, không làm thay đổi danh sách deal ở Trang chủ."
                  label="Khu vực nhận món"
                  onChange={(next) => edit({ pickupArea: next })}
                  value={values.pickupArea}
                />

                <View style={styles.group}>
                  <Text style={[styles.groupLabel, { color: theme.text }]}>Món yêu thích</Text>
                  {categories.isLoading ? <ActivityIndicator color={theme.primary} /> : null}
                  {categories.isError ? (
                    <Text style={[styles.errorText, { color: theme.danger }]}>
                      Không tải được danh sách nhóm món.
                    </Text>
                  ) : null}
                  <View style={styles.chips}>
                    {(categories.data ?? []).map((category) => {
                      const isSelected = values.categories.includes(category.code);

                      return (
                        <Pressable
                          key={category.code}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: isSelected }}
                          onPress={() => toggleCategory(category.code)}
                          style={({ pressed }) => [
                            styles.chip,
                            isSelected
                              ? { backgroundColor: theme.primary, borderColor: theme.primary }
                              : { backgroundColor: theme.background, borderColor: theme.border },
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipLabel,
                              { color: isSelected ? '#FFFFFF' : theme.text },
                              isSelected && styles.chipLabelSelected,
                            ]}
                          >
                            {category.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text style={[styles.hint, { color: theme.textSecondary }]}>
                    Chọn tối đa {FAVORITE_CATEGORIES_MAX} nhóm món bạn thích.
                  </Text>
                </View>
              </View>

              {update.isError ? (
                <InlineAlert message={toPreferencesErrorMessage(update.error)} />
              ) : null}
              {justSaved && !isDirty ? (
                <InlineAlert message="Đã lưu thay đổi." tone="success" />
              ) : null}

              <BrandButton disabled={!isDirty} loading={update.isPending} onPress={handleSave}>
                Lưu thay đổi
              </BrandButton>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 110 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 12,
    padding: 16,
  },
  card: { gap: 12, borderWidth: 1, borderRadius: 18, padding: 16 },
  avatarCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 22, fontWeight: '900' },
  avatarCopy: { flex: 1, gap: 6 },
  name: { fontSize: 17, fontWeight: '900' },
  changePhoto: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  changePhotoText: { fontSize: 13, fontWeight: '800' },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 0.4, marginTop: 4 },
  hint: { fontSize: 12, lineHeight: 17 },
  group: { gap: 8 },
  groupLabel: { fontSize: 12, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  chipLabel: { fontSize: 12, fontWeight: '600' },
  chipLabelSelected: { fontWeight: '800' },
  errorText: { fontSize: 12, fontWeight: '600' },
  pressed: { opacity: 0.8 },
});
