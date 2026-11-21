import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { BrandButton } from '@/components/ui/brand-button';
import { EmptyCard } from '@/components/ui/empty-card';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { LoadingState } from '@/components/ui/loading-state';
import { TextField } from '@/components/ui/text-field';
import { FontSize, FontWeight, MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { BuyerHeader } from '@/features/home/components/buyer-header';
import {
  FAVORITE_CATEGORIES_MAX,
  toPreferencesErrorMessage,
} from '@/features/profile/api/preferences';
import {
  getProfileErrorMessage,
  toUpdateProfileErrorMessage,
} from '@/features/profile/api/profile';
import { useAvatarUpload } from '@/features/profile/api/use-avatar';
import { AreaSelectField } from '@/features/profile/components/area-select-field';
import { useUpdateDiscoveryPreferences } from '@/features/profile/api/use-discovery-preferences';
import { useProfile } from '@/features/profile/api/use-profile';
import { useUpdateProfile } from '@/features/profile/api/use-update-profile';
import { ProfileIcons } from '@/features/profile/constants/icons';
import { getInitials } from '@/features/profile/get-initials';
import {
  buildProfilePayload,
  NAME_MAX_LENGTH,
  toProfileFormValues,
  validateProfileForm,
  type ProfileFormErrors,
  type ProfileFormValues,
} from '@/features/profile/profile-form';
import { useShopCategories } from '@/features/seller/api/shop-categories';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { useTheme } from '@/hooks/use-theme';
import { ApiException } from '@/lib/api-client';

const ROUTE = '/profile-info';
// Chiều cao xấp xỉ của dải lưu nổi (nút + đệm), để ô đang nhập được cuộn lên trên cả dải này.
const SAVE_BAR_HEIGHT = 72;

type Draft = { pickupArea: string; categories: string[] };

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((code) => b.includes(code));

/**
 * Hồ sơ người mua: đổi ảnh đại diện, "Họ & Tên" (displayName), số điện thoại (PUT /users/me/profile) và
 * tuỳ chọn khám phá (khu vực nhận món, nhóm món yêu thích). Email chỉ xem vì đổi email cần luồng OTP
 * riêng. Một nút "Lưu thay đổi" gửi những phần đã sửa.
 */
export function ProfileInfoScreen() {
  const theme = useTheme();
  const { user } = useAuthSession();
  const profileQuery = useProfile(Boolean(user));
  const categories = useShopCategories();
  const avatar = useAvatarUpload(ROUTE);
  const updatePrefs = useUpdateDiscoveryPreferences();
  const updateProfileMutation = useUpdateProfile();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [profileDraft, setProfileDraft] = useState<ProfileFormValues | null>(null);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [justSaved, setJustSaved] = useState(false);

  const profile = profileQuery.data;
  const saved: Draft = {
    pickupArea: profile?.pickupArea ?? '',
    categories: profile?.favoriteCategories ?? [],
  };
  const values = draft ?? saved;
  const savedProfile = toProfileFormValues(profile);
  const profileValues = profileDraft ?? savedProfile;

  const isPrefsDirty =
    draft !== null &&
    (draft.pickupArea.trim() !== saved.pickupArea.trim() ||
      !sameSet(draft.categories, saved.categories));
  const isProfileDirty =
    profileDraft !== null && buildProfilePayload(profileDraft, savedProfile) !== null;
  const isDirty = isPrefsDirty || isProfileDirty;
  const isSaving = updatePrefs.isPending || updateProfileMutation.isPending;

  const isDuplicatePhone =
    updateProfileMutation.error instanceof ApiException &&
    updateProfileMutation.error.code === 'DUPLICATE_PHONE';

  const phoneServerError = isDuplicatePhone
    ? toUpdateProfileErrorMessage(updateProfileMutation.error)
    : undefined;

  const displayName =
    profile?.displayName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const initials = getInitials(displayName);

  const resetStatus = () => {
    setJustSaved(false);
    updatePrefs.reset();
    updateProfileMutation.reset();
  };

  const edit = (next: Partial<Draft>) => {
    resetStatus();
    setDraft({ ...values, ...next });
  };

  const editProfile = (next: Partial<ProfileFormValues>) => {
    resetStatus();
    // Sửa ô nào thì xoá lỗi của ô đó.
    setErrors((current) => {
      const updated = { ...current };
      for (const key of Object.keys(next) as (keyof ProfileFormValues)[]) delete updated[key];

      return updated;
    });
    setProfileDraft({ ...profileValues, ...next });
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

  const handleSave = async () => {
    resetStatus();

    const formErrors = profileDraft ? validateProfileForm(profileDraft, savedProfile) : {};
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    try {
      const payload = profileDraft ? buildProfilePayload(profileDraft, savedProfile) : null;
      if (payload) {
        await updateProfileMutation.mutateAsync(payload);
        setProfileDraft(null);
      }
      if (isPrefsDirty) {
        await updatePrefs.mutateAsync({
          pickupArea: values.pickupArea.trim() || null,
          favoriteCategories: values.categories,
        });
        setDraft(null);
      }
      setJustSaved(true);
    } catch {
      // Lỗi hiện bên dưới qua trạng thái của từng thao tác lưu.
    }
  };

  const goBack = () => router.navigate('/profile');
  const keyboardHeight = useKeyboardHeight();

  // Dải lưu nổi ở đáy: chỉ hiện khi có gì để lưu hoặc cần báo kết quả, để màn hình bình thường gọn.
  const showSaveBar = isDirty || justSaved || updateProfileMutation.isError || updatePrefs.isError;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <KeyboardAwareScrollView
        bottomOffset={showSaveBar ? SAVE_BAR_HEIGHT : 0}
        contentContainerStyle={[styles.content, showSaveBar && styles.contentWithBar]}
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
                  <Text numberOfLines={1} style={[styles.email, { color: theme.textSecondary }]}>
                    {profile?.email}
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
                      <Icon name={ProfileIcons.camera} color={theme.primary} size={13} />
                    )}
                    <Text style={[styles.changePhotoText, { color: theme.primary }]}>
                      Đổi ảnh đại diện
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                THÔNG TIN CÁ NHÂN
              </Text>
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}
              >
                <TextField
                  autoCapitalize="words"
                  error={errors.displayName}
                  label="Họ & Tên"
                  maxLength={NAME_MAX_LENGTH}
                  onChangeText={(text) => editProfile({ displayName: text })}
                  size="compact"
                  value={profileValues.displayName}
                />
                <TextField
                  error={errors.phone ?? phoneServerError}
                  keyboardType="phone-pad"
                  label="Số điện thoại"
                  maxLength={16}
                  onChangeText={(text) => editProfile({ phone: text })}
                  placeholder="0912345678"
                  size="compact"
                  value={profileValues.phone}
                />
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
                  description="Nhận thông báo khi quán trong khu vực này đăng deal mới."
                  detail="Bạn sẽ nhận thông báo khi quán thuộc khu vực này đăng deal mới. Chọn xã, phường hoặc tỉnh/thành có trong địa chỉ quán. Khu vực chỉ dùng để gửi thông báo, không làm thay đổi danh sách deal ở Trang chủ."
                  label="Khu vực nhận món"
                  onChange={(next) => edit({ pickupArea: next })}
                  value={values.pickupArea}
                />

                <View style={styles.group}>
                  <View style={styles.groupHeader}>
                    <Text style={[styles.groupLabel, { color: theme.text }]}>Món yêu thích</Text>
                    <Text style={[styles.count, { color: theme.textSecondary }]}>
                      {values.categories.length}/{FAVORITE_CATEGORIES_MAX}
                    </Text>
                  </View>
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
                        <Chip
                          key={category.code}
                          label={category.name}
                          onPress={() => toggleCategory(category.code)}
                          role="checkbox"
                          selected={isSelected}
                        />
                      );
                    })}
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </KeyboardAwareScrollView>

      {showSaveBar ? (
        <View
          style={[
            styles.saveBar,
            // Nằm ngay trên bàn phím khi đang nhập, thay vì bị bàn phím che.
            {
              bottom: keyboardHeight,
              backgroundColor: theme.backgroundElement,
              borderTopColor: theme.border,
            },
          ]}
        >
          {updateProfileMutation.isError && !isDuplicatePhone ? (
            <InlineAlert message={toUpdateProfileErrorMessage(updateProfileMutation.error)} />
          ) : null}
          {updatePrefs.isError ? (
            <InlineAlert message={toPreferencesErrorMessage(updatePrefs.error)} />
          ) : null}
          {justSaved && !isDirty ? <InlineAlert message="Đã lưu thay đổi." tone="success" /> : null}

          {isDirty ? (
            <BrandButton
              loading={isSaving}
              onPress={() => void handleSave()}
              style={styles.saveButton}
            >
              Lưu thay đổi
            </BrandButton>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: Spacing.xxl },
  // Chừa chỗ cho dải lưu nổi để phần cuối không bị che.
  contentWithBar: { paddingBottom: 150 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 10,
    padding: Spacing.md,
  },
  card: { gap: 10, borderWidth: 1, borderRadius: Radius.lg, padding: 14 },
  avatarCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: FontSize.titleLg, fontWeight: FontWeight.heavy },
  avatarCopy: { flex: 1, minWidth: 0, gap: Spacing.xxs },
  name: { fontSize: FontSize.subtitle, fontWeight: FontWeight.heavy },
  email: { fontSize: FontSize.footnote },
  changePhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: Spacing.xxs,
  },
  changePhotoText: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  sectionTitle: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.4,
    marginTop: Spacing.xxs,
  },
  group: { gap: Spacing.sm },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupLabel: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  count: { fontSize: FontSize.footnote },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  errorText: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  pressed: { opacity: 0.8 },
  saveBar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    boxShadow: Shadow.tabBar,
  },
  saveButton: { minHeight: 46 },
});
