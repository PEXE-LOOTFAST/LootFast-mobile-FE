import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
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
import { MerchantProfileNotCreated } from '@/features/seller/components/merchant-registration-required';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { ApiException } from '@/lib/api-client';
import { syncSessionRoles } from '@/lib/auth-session';
import { formatShortDate } from '@/lib/format';

const LICENSE_NUMBER_PATTERN = /^\d{10,14}$/;

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
    description: 'Bạn đã có quyền người bán. Đang cập nhật quyền — vui lòng chờ trong giây lát.',
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

export function MerchantRegistrationSection() {
  const { user } = useAuthSession();
  const applicationQuery = useMyMerchantApplication(Boolean(user));

  const notFound =
    applicationQuery.error instanceof ApiException &&
    applicationQuery.error.code === 'MERCHANT_APPLICATION_NOT_FOUND';
  const application = applicationQuery.data;

  // Được duyệt thì làm mới token để route tự redirect sang /seller khi thấy MERCHANT role.
  const isApproved = application?.status === 'APPROVED';
  useEffect(() => {
    if (isApproved) void syncSessionRoles();
  }, [isApproved]);

  if (user?.roles.includes('MERCHANT') && !isApproved) return <MerchantProfileNotCreated />;

  return (
    <>
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
    </>
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

      {isApproved ? <ActivityIndicator /> : null}
    </View>
  );
}

function SubmitApplicationForm() {
  const theme = useTheme();
  const submit = useSubmitMerchantApplication();
  const [licenseNumber, setLicenseNumber] = useState('');
  const [license, setLicense] = useState<{ uri: string; mimeType?: string; name?: string }>();
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
    const asset = result.assets[0];
    setLicense({ uri: asset.uri, mimeType: asset.mimeType, name: asset.fileName ?? undefined });
  };

  const handleSubmit = async () => {
    setFormError(undefined);

    if (!LICENSE_NUMBER_PATTERN.test(licenseNumber.trim())) {
      setFormError('Số giấy phép kinh doanh gồm 10 đến 14 chữ số.');
      return;
    }
    if (!license) {
      setFormError('Vui lòng chọn ảnh giấy phép kinh doanh.');
      return;
    }

    submit.mutate(
      { licenseNumber, license },
      { onError: (error) => setFormError(toMerchantApplicationErrorMessage(error)) },
    );
  };

  return (
    <>
      <Text style={[styles.intro, { color: theme.textSecondary }]}>
        Gửi giấy phép kinh doanh để đăng ký bán hàng. Quản trị viên sẽ xem xét và duyệt hồ sơ của
        bạn.
      </Text>

      <View style={styles.sectionTitle}>
        <Icon name={SellerIcons.verified} color={theme.text} size={14} />
        <Text accessibilityRole="header" style={[styles.sectionLabel, { color: theme.text }]}>
          Giấy phép kinh doanh
        </Text>
      </View>
      <SellerFormCard>
        <TextField
          size="compact"
          keyboardType="number-pad"
          label="Số giấy phép kinh doanh"
          maxLength={14}
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
          {license ? (
            <Image contentFit="cover" source={{ uri: license.uri }} style={styles.preview} />
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

      <BrandButton loading={submit.isPending} onPress={() => void handleSubmit()}>
        Gửi hồ sơ đăng ký
      </BrandButton>
    </>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, lineHeight: 20 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '900' },
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
