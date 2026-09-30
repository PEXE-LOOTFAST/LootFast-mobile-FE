import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { AdminIcons } from '@/features/admin/constants/icons';
import type { StoreApplicationCardModel, StoreApplicationInfoRow } from '@/features/admin/types';
import { useTheme } from '@/hooks/use-theme';

type StoreApplicationCardProps = {
  application: StoreApplicationCardModel;
  onApprove: () => void;
  onReject: () => void;
  onViewLicense: () => void;
  /** Đang gọi API cho chính hồ sơ này: khoá hai nút quyết định để không bấm hai lần. */
  isBusy?: boolean;
};

function InfoRow({ row }: { row: StoreApplicationInfoRow }) {
  const theme = useTheme();
  const tel = row.tel;
  const content = (
    <View style={styles.infoRow}>
      <Icon name={row.icon} color={theme.textSecondary} size={15} />
      <Text numberOfLines={1} style={[styles.infoLabel, { color: theme.textSecondary }]}>
        {row.label}
      </Text>
    </View>
  );

  if (!tel) return content;

  return (
    <Pressable
      accessibilityHint="Gọi cho chủ quán"
      accessibilityRole="link"
      onPress={() => Linking.openURL(`tel:${tel.replace(/\s/g, '')}`)}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

// Một hồ sơ đăng ký người bán. Hồ sơ chờ duyệt có hai nút quyết định; hồ sơ đã xử lý chỉ còn
// nhãn trạng thái và lý do từ chối — API không cho đưa quyết định về lại hàng chờ.
export function StoreApplicationCard({
  application,
  onApprove,
  onReject,
  onViewLicense,
  isBusy = false,
}: StoreApplicationCardProps) {
  const theme = useTheme();
  const { status, rejectionReason } = application;
  const isApproved = status === 'approved';
  // Nền nhạt dựng từ màu theme + độ trong suốt để tự khớp cả light lẫn dark mode.
  const dangerSoft = `${theme.danger}1F`;
  const warningSoft = `${theme.accent}33`;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          <Icon name={AdminIcons.food} color={theme.primary} size={22} />
        </View>

        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={[styles.storeName, { color: theme.text }]}>
            {application.title}
          </Text>
          <View style={styles.tags}>
            {application.tags.map((tag) => {
              const isWarning = tag.tone === 'warning';
              const tagColor = isWarning ? theme.text : theme.primary;

              return (
                <View
                  key={tag.label}
                  style={[
                    styles.tag,
                    { backgroundColor: isWarning ? warningSoft : theme.primarySoft },
                  ]}
                >
                  {tag.icon ? <Icon name={tag.icon} color={tagColor} size={12} /> : null}
                  <Text numberOfLines={1} style={[styles.tagLabel, { color: tagColor }]}>
                    {tag.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.info}>
        {application.rows.map((row) => (
          <InfoRow key={row.label} row={row} />
        ))}
      </View>

      <Pressable
        accessibilityLabel={`Xem giấy phép kinh doanh của ${application.title}`}
        accessibilityRole="button"
        onPress={onViewLicense}
        style={({ pressed }) => [
          styles.licenseButton,
          { borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        <Icon name={AdminIcons.document} color={theme.primary} size={15} />
        <Text style={[styles.licenseLabel, { color: theme.primary }]}>
          Xem giấy phép kinh doanh
        </Text>
      </Pressable>

      {status === 'pending' ? (
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={`Từ chối ${application.title}`}
            accessibilityRole="button"
            disabled={isBusy}
            onPress={onReject}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: dangerSoft },
              (pressed || isBusy) && styles.pressed,
            ]}
          >
            <Icon name={AdminIcons.close} color={theme.danger} size={15} />
            <Text style={[styles.actionLabel, { color: theme.danger }]}>Từ chối</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={`Phê duyệt ${application.title}`}
            accessibilityRole="button"
            disabled={isBusy}
            onPress={onApprove}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.primary },
              (pressed || isBusy) && styles.pressed,
            ]}
          >
            {isBusy ? (
              <ActivityIndicator color={theme.backgroundElement} size="small" />
            ) : (
              <>
                <Icon name={AdminIcons.check} color={theme.backgroundElement} size={15} />
                <Text style={[styles.actionLabel, { color: theme.backgroundElement }]}>
                  Phê duyệt
                </Text>
              </>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.resolved}>
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
          </View>
          {rejectionReason ? (
            <Text style={[styles.reason, { color: theme.textSecondary }]}>
              Lý do: {rejectionReason}
            </Text>
          ) : null}
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
  tagLabel: { flexShrink: 1, fontSize: 11, fontWeight: '800' },
  info: { gap: 7 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { flexShrink: 1, fontSize: 13, fontWeight: '500' },
  licenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 11,
  },
  licenseLabel: { fontSize: 13, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    paddingVertical: 12,
  },
  actionLabel: { fontSize: 14, fontWeight: '800' },
  resolved: { gap: 8 },
  resolvedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  statusLabel: { fontSize: 12, fontWeight: '800' },
  reason: { fontSize: 13, fontWeight: '500', lineHeight: 19 },
  pressed: { opacity: 0.8 },
});
