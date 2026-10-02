import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { EmptyCard } from '@/components/ui/empty-card';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { TextField } from '@/components/ui/text-field';
import {
  toMerchantApplicationErrorMessage,
  type MerchantApplicationStatusDto,
  type MyMerchantApplicationDto,
} from '@/features/seller/api/merchant-application';
import {
  useMyMerchantApplication,
  useSubmitMerchantApplication,
} from '@/features/seller/api/use-merchant-application';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { ApiException } from '@/lib/api-client';
import { formatShortDate } from '@/lib/format';

const STATUS_COPY: Record<MerchantApplicationStatusDto, { title: string; description: string }> = {
  UPLOADING: {
    title: 'Đang tải giấy phép lên',
    description: 'Ảnh giấy phép đang được xử lý. Quay lại sau ít phút để xem kết quả.',
  },
  UPLOAD_FAILED: {
    title: 'Tải giấy phép thất bại',
    description: 'Ảnh giấy phép chưa lên được hệ thống. Hãy gửi lại hồ sơ với ảnh rõ nét hơn.',
  },
  PENDING: {
    title: 'Hồ sơ đang chờ duyệt',
    description:
      'Quản trị viên sẽ xem xét giấy phép của bạn. Bạn sẽ dùng được khu người bán ngay khi hồ sơ được duyệt.',
  },
  APPROVED: {
    title: 'Hồ sơ đã được duyệt',
    description:
      'Bạn đã có quyền người bán. Đăng nhập lại để quyền mới có hiệu lực, rồi mở khu người bán.',
  },
  REJECTED: {
    title: 'Hồ sơ bị từ chối',
    description: 'Xem lý do bên dưới, chuẩn bị lại giấy tờ rồi gửi hồ sơ mới.',
  },
};

function toDateLabel(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '--/--/----' : formatShortDate(date);
}

/**
 * Người mua gửi giấy phép kinh doanh để xin quyền bán hàng. Đây chính là nguồn dữ liệu cho
 * hàng chờ ở màn Duyệt quán của quản trị.
 *
 * Backend chỉ cho mỗi tài khoản có một hồ sơ đang mở, nên màn này tự chuyển giữa hai dạng:
 * form gửi mới khi chưa có hồ sơ hoặc hồ sơ cũ đã bị từ chối, và thẻ trạng thái khi đã gửi.
 */
export function MerchantApplicationScreen() {
  const { user } = useAuthSession();
  const applicationQuery = useMyMerchantApplication(Boolean(user));

  const notFound =
    applicationQuery.error instanceof ApiException &&
    applicationQuery.error.code === 'MERCHANT_APPLICATION_NOT_FOUND';
  const application = applicationQuery.data;

  return (
    <SellerPageScaffold
      onPressBack={() => router.navigate('/profile')}
      subtitle="Gửi giấy phép kinh doanh để mở khu người bán"
      title="Đăng ký bán hàng"
    >
      {/* Khách chưa đăng nhập thì không hỏi API, và màn cũng không có gì để hiện. */}
      {!user ? (
        <EmptyCard
          description="Đăng nhập bằng tài khoản người mua rồi quay lại đây để gửi hồ sơ."
          title="Cần đăng nhập"
        />
      ) : null}

      {applicationQuery.isLoading ? <ActivityIndicator /> : null}

      {applicationQuery.error && !notFound ? (
        <InlineAlert message={toMerchantApplicationErrorMessage(applicationQuery.error)} />
      ) : null}

      {application && application.status !== 'REJECTED' ? (
        <ApplicationStatusCard application={application} />
      ) : null}

      {application?.status === 'REJECTED' ? (
        <>
          <ApplicationStatusCard application={application} />
          <SubmitApplicationForm />
        </>
      ) : null}

      {notFound ? <SubmitApplicationForm /> : null}
    </SellerPageScaffold>
  );
}

function ApplicationStatusCard({ application }: { application: MyMerchantApplicationDto }) {
  const theme = useTheme();
  const copy = STATUS_COPY[application.status];
  const isApproved = application.status === 'APPROVED';
  const isProblem = application.status === 'REJECTED' || application.status === 'UPLOAD_FAILED';
  const accent = isApproved ? theme.primary : isProblem ? theme.danger : theme.text;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.cardHeader}>
        <Icon name={SellerIcons.store} color={accent} size={20} />
        <Text accessibilityRole="header" style={[styles.cardTitle, { color: accent }]}>
          {copy.title}
        </Text>
      </View>

      <Text style={[styles.cardBody, { color: theme.textSecondary }]}>{copy.description}</Text>

      <View style={styles.facts}>
        <Text style={[styles.fact, { color: theme.textSecondary }]}>
          Số giấy phép: {application.businessLicenseNumber}
        </Text>
        <Text style={[styles.fact, { color: theme.textSecondary }]}>
          Gửi ngày {toDateLabel(application.submittedAt)}
        </Text>
        {application.reviewedAt ? (
          <Text style={[styles.fact, { color: theme.textSecondary }]}>
            Xử lý ngày {toDateLabel(application.reviewedAt)}
          </Text>
        ) : null}
      </View>

      {application.rejectionReason ? (
        <InlineAlert message={`Lý do từ chối: ${application.rejectionReason}`} />
      ) : null}

      {isApproved ? (
        <BrandButton onPress={() => router.navigate('/seller')}>Mở khu người bán</BrandButton>
      ) : null}
    </View>
  );
}

function SubmitApplicationForm() {
  const theme = useTheme();
  const submit = useSubmitMerchantApplication();
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseUri, setLicenseUri] = useState<string>();
  const [formError, setFormError] = useState<string>();

  const pickLicense = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Cần quyền truy cập',
        'Vui lòng cấp quyền truy cập thư viện ảnh trong Cài đặt hệ thống.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setFormError(undefined);
    setLicenseUri(result.assets[0].uri);
  };

  const handleSubmit = () => {
    setFormError(undefined);

    if (!licenseNumber.trim()) {
      setFormError('Vui lòng nhập số giấy phép kinh doanh.');
      return;
    }
    if (!licenseUri) {
      setFormError('Vui lòng chọn ảnh giấy phép kinh doanh.');
      return;
    }

    submit.mutate(
      { licenseNumber, licenseUri },
      { onError: (error) => setFormError(toMerchantApplicationErrorMessage(error)) },
    );
  };

  return (
    <>
      <SellerFormCard>
        <TextField
          size="compact"
          autoCapitalize="characters"
          label="Số giấy phép kinh doanh"
          onChangeText={(text) => {
            setFormError(undefined);
            setLicenseNumber(text);
          }}
          placeholder="VD: 0312345678"
          value={licenseNumber}
        />

        <Pressable
          accessibilityLabel="Chọn ảnh giấy phép kinh doanh"
          accessibilityRole="button"
          onPress={() => void pickLicense()}
          style={({ pressed }) => [
            styles.picker,
            { borderColor: theme.border, backgroundColor: theme.background },
            pressed && styles.pressed,
          ]}
        >
          {licenseUri ? (
            <Image contentFit="cover" source={{ uri: licenseUri }} style={styles.preview} />
          ) : (
            <View style={styles.pickerEmpty}>
              <Icon name={SellerIcons.camera} color={theme.primary} size={22} />
              <Text style={[styles.pickerLabel, { color: theme.text }]}>
                Chọn ảnh giấy phép kinh doanh
              </Text>
              <Text style={[styles.pickerHint, { color: theme.textSecondary }]}>
                Ảnh JPEG hoặc PNG, tối đa 5 MB
              </Text>
            </View>
          )}
        </Pressable>
      </SellerFormCard>

      {formError ? <InlineAlert message={formError} /> : null}

      <BrandButton loading={submit.isPending} onPress={handleSubmit}>
        Gửi hồ sơ
      </BrandButton>
    </>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, borderWidth: 1, borderRadius: 20, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  cardBody: { fontSize: 13, lineHeight: 20 },
  facts: { gap: 4 },
  fact: { fontSize: 13, fontWeight: '500' },
  picker: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  pickerEmpty: { alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 28 },
  pickerLabel: { fontSize: 14, fontWeight: '800' },
  pickerHint: { fontSize: 12 },
  preview: { width: '100%', height: 200 },
  pressed: { opacity: 0.85 },
});
