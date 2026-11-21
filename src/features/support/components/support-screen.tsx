import { router } from 'expo-router';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Icon, type IconName } from '@/components/ui/icon';
import { SupportPage } from '@/features/support/components/support-page';
import { SupportIcons } from '@/features/support/constants/icons';
import {
  ACCOUNT_DELETION_SUBJECT,
  SUPPORT_EMAIL,
} from '@/features/support/constants/privacy-policy';
import { useTheme } from '@/hooks/use-theme';

/** Mở ứng dụng email; máy không có ứng dụng email thì hiện địa chỉ để người dùng tự chép. */
async function openMail(subject?: string) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  try {
    await Linking.openURL(`mailto:${SUPPORT_EMAIL}${query}`);
  } catch {
    Alert.alert('Không mở được ứng dụng email', `Vui lòng gửi email đến ${SUPPORT_EMAIL}.`);
  }
}

type SupportCardProps = {
  icon: IconName;
  title: string;
  description: string;
  actionLabel: string;
  onPress: () => void;
};

function SupportCard({ icon, title, description, actionLabel, onPress }: SupportCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={actionLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
        <Icon name={icon} color={theme.primary} size={19} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
        <Text style={[styles.action, { color: theme.primary }]}>{actionLabel}</Text>
      </View>
      <Icon name={SupportIcons.chevronRight} color={theme.textSecondary} size={17} />
    </Pressable>
  );
}

export function SupportScreen() {
  return (
    <SupportPage fallbackHref="/profile" title="Hỗ trợ">
      <SupportCard
        actionLabel={SUPPORT_EMAIL}
        description="Gửi câu hỏi, góp ý hoặc báo lỗi về tài khoản, đơn hàng và cửa hàng cho nhóm LootFast."
        icon={SupportIcons.mail}
        onPress={() => void openMail()}
        title="Liên hệ hỗ trợ"
      />
      <SupportCard
        actionLabel="Gửi yêu cầu xóa tài khoản"
        description={`Gửi email với tiêu đề “${ACCOUNT_DELETION_SUBJECT}” và ghi email hoặc số điện thoại đã đăng ký. Chúng tôi sẽ xác minh rồi xóa hoặc ẩn danh dữ liệu của bạn.`}
        icon={SupportIcons.deleteAccount}
        onPress={() => void openMail(ACCOUNT_DELETION_SUBJECT)}
        title="Xóa tài khoản và dữ liệu"
      />
      <SupportCard
        actionLabel="Xem chính sách"
        description="Cách LootFast thu thập, sử dụng, chia sẻ và bảo vệ thông tin của bạn."
        icon={SupportIcons.privacy}
        onPress={() => router.navigate('/privacy-policy')}
        title="Chính sách quyền riêng tư"
      />
    </SupportPage>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: 14,
  },
  pressed: { opacity: 0.7 },
  icon: {
    alignItems: 'center',
    borderRadius: Radius.full,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  copy: { flex: 1, gap: Spacing.xs },
  cardTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  description: { fontSize: FontSize.footnote, lineHeight: 17 },
  action: { fontSize: FontSize.bodySm, fontWeight: FontWeight.bold },
});
