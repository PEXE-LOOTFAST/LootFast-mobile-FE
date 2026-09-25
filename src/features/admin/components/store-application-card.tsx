import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminIcons } from '@/features/admin/constants/icons';
import type { StoreApplication } from '@/features/admin/types';
import { HomeIcon } from '@/features/home/components/home-icon';
import type { HomeIconName } from '@/features/home/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type StoreApplicationCardProps = {
  application: StoreApplication;
  onApprove: () => void;
  onReject: () => void;
  onUndo: () => void;
};

// "2026-09-20" → "20/09/2026". Tách chuỗi thay vì new Date() để không lệch ngày theo múi giờ.
function formatSubmittedDate(value: string) {
  const [year, month, day] = value.split('-');

  return `${day}/${month}/${year}`;
}

function InfoRow({ icon, label }: { icon: HomeIconName; label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.infoRow}>
      <HomeIcon name={icon} color={theme.textSecondary} size={15} />
      <Text numberOfLines={1} style={[styles.infoLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

// Một hồ sơ đăng ký quán. Hồ sơ chờ duyệt có hai nút quyết định; hồ sơ đã xử lý chỉ còn
// nhãn trạng thái và "Hoàn tác" để đưa về hàng chờ nếu admin bấm nhầm.
export function StoreApplicationCard({
  application,
  onApprove,
  onReject,
  onUndo,
}: StoreApplicationCardProps) {
  const theme = useTheme();
  const { status, hasFoodSafetyCert } = application;
  const isApproved = status === 'approved';
  // Nền nhạt dựng từ màu theme + độ trong suốt để tự khớp cả light lẫn dark mode.
  const dangerSoft = `${theme.danger}1F`;
  const warningSoft = `${theme.accent}33`;
  const certColor = hasFoodSafetyCert ? theme.primary : theme.text;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          <HomeIcon name={AdminIcons.food} color={theme.primary} size={22} />
        </View>

        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={[styles.storeName, { color: theme.text }]}>
            {application.storeName}
          </Text>
          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.tagLabel, { color: theme.primary }]}>
                {application.category}
              </Text>
            </View>
            <View
              style={[
                styles.tag,
                { backgroundColor: hasFoodSafetyCert ? theme.primarySoft : warningSoft },
              ]}
            >
              <HomeIcon
                name={hasFoodSafetyCert ? AdminIcons.document : AdminIcons.warning}
                color={certColor}
                size={12}
              />
              <Text style={[styles.tagLabel, { color: certColor }]}>
                {hasFoodSafetyCert ? 'Đã nộp giấy ATTP' : 'Thiếu giấy ATTP'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <InfoRow icon={AdminIcons.store} label={`Chủ quán: ${application.ownerName}`} />
        <Pressable
          accessibilityHint="Gọi cho chủ quán"
          accessibilityRole="link"
          onPress={() => Linking.openURL(`tel:${application.phone.replace(/\s/g, '')}`)}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <InfoRow icon={AdminIcons.phone} label={application.phone} />
        </Pressable>
        <InfoRow icon={AdminIcons.location} label={application.address} />
        <InfoRow
          icon={AdminIcons.calendar}
          label={`Gửi ngày ${formatSubmittedDate(application.submittedAt)}`}
        />
      </View>

      {status === 'pending' ? (
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={`Từ chối ${application.storeName}`}
            accessibilityRole="button"
            onPress={onReject}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: dangerSoft },
              pressed && styles.pressed,
            ]}
          >
            <HomeIcon name={AdminIcons.close} color={theme.danger} size={15} />
            <Text style={[styles.actionLabel, { color: theme.danger }]}>Từ chối</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={`Phê duyệt ${application.storeName}`}
            accessibilityRole="button"
            onPress={onApprove}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
            ]}
          >
            <HomeIcon name={AdminIcons.check} color={theme.backgroundElement} size={15} />
            <Text style={[styles.actionLabel, { color: theme.backgroundElement }]}>Phê duyệt</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.resolvedRow}>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isApproved ? theme.primarySoft : dangerSoft },
            ]}
          >
            <Text
              style={[styles.statusLabel, { color: isApproved ? theme.primary : theme.danger }]}
            >
              {isApproved ? 'Đã duyệt' : 'Đã từ chối'}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={`Hoàn tác quyết định cho ${application.storeName}`}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onUndo}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={[styles.undoLabel, { color: theme.textSecondary }]}>Hoàn tác</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    boxShadow: '0px 4px 14px rgba(23, 33, 27, 0.06)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
  },
  headerCopy: { flex: 1, gap: 6 },
  storeName: { fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tagLabel: { fontSize: 11, fontWeight: '800' },
  info: { gap: 7 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { flexShrink: 1, fontSize: 13, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    paddingVertical: 12,
  },
  actionLabel: { fontSize: 14, fontWeight: '800' },
  resolvedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  statusLabel: { fontSize: 12, fontWeight: '800' },
  undoLabel: { fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
