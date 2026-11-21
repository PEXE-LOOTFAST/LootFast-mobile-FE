import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { Icon } from '@/components/ui/icon';
import { MaxContentWidth } from '@/constants/theme';
import { AdminHeader } from '@/features/admin/components/admin-header';
import { AdminIcons } from '@/features/admin/constants/icons';
import { useProfile } from '@/features/profile/api/use-profile';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';
import { confirmSignOut } from '@/lib/confirm-sign-out';

// Lấy chữ cái đầu của hai từ đầu tiên, vd. "Nguyễn Quản Trị" → "NQ".
function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

type SettingSwitchRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SettingSwitchRow({ label, value, onValueChange }: SettingSwitchRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: theme.primarySoft, true: theme.primary }}
        value={value}
        // Web tô màu thumb theo activeThumbColor thay vì thumbColor.
        {...{ activeThumbColor: '#FFFFFF' }}
      />
    </View>
  );
}

export function AdminSettingsScreen() {
  const theme = useTheme();
  const [today] = useState(() => new Date());
  // Chỉ giữ trên máy cho tới khi có API cấu hình hệ thống.
  const [notifyNewStores, setNotifyNewStores] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { user } = useAuthSession();
  const profileQuery = useProfile(true);
  const profile = profileQuery.data;

  const accountName =
    profile?.displayName?.trim() ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const accountEmail = profile?.email ?? user?.email ?? '';
  // Nhãn vai trò lấy từ role backend trả về thay vì gán cứng.
  const accountRole = (profile?.roles ?? user?.roles ?? []).includes('ADMIN')
    ? 'Quản trị viên'
    : 'Tài khoản';

  useLightStatusBar();

  // Bật bảo trì sẽ chặn toàn bộ người mua và người bán nên hỏi lại trước; tắt thì làm luôn.
  const toggleMaintenance = (value: boolean) => {
    if (!value) {
      setMaintenanceMode(false);
      return;
    }
    confirmAction({
      title: 'Bật chế độ bảo trì',
      message: 'Người mua và người bán sẽ tạm thời không dùng được ứng dụng. Tiếp tục?',
      confirmLabel: 'Bật bảo trì',
      isDestructive: true,
      onConfirm: () => setMaintenanceMode(true),
    });
  };

  // Đăng xuất xong quay lại cổng quản trị để người dùng tiếp theo đăng nhập lại.
  const handleSignOut = () =>
    confirmSignOut({
      message: 'Bạn muốn đăng xuất khỏi khu vực quản trị?',
      redirectTo: '/admin-login',
    });

  const cardStyle = [
    styles.card,
    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
  ];
  const divider = <View style={[styles.divider, { backgroundColor: theme.border }]} />;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Trung tâm thông báo của admin sẽ làm ở nhánh riêng, tạm báo trước. */}
      <AdminHeader
        date={today}
        hasUnread={false}
        onPressNotifications={() => Alert.alert('Thông báo', 'Trung tâm thông báo sẽ sớm có.')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={[cardStyle, styles.account]}>
            <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.initials, { color: theme.primary }]}>
                {getInitials(accountName)}
              </Text>
            </View>
            <View style={styles.accountCopy}>
              {profileQuery.isLoading ? (
                <ActivityIndicator color={theme.primary} size="small" />
              ) : (
                <>
                  <Text numberOfLines={1} style={[styles.accountName, { color: theme.text }]}>
                    {accountName}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.accountEmail, { color: theme.textSecondary }]}
                  >
                    {accountEmail}
                  </Text>
                  <View style={[styles.roleBadge, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.roleLabel, { color: theme.onPrimary }]}>
                      {accountRole}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={cardStyle}>
            <SettingSwitchRow
              label="Tự động thông báo quán mới"
              onValueChange={setNotifyNewStores}
              value={notifyNewStores}
            />
            {divider}
            <SettingSwitchRow
              label="Chế độ bảo trì"
              onValueChange={toggleMaintenance}
              value={maintenanceMode}
            />
            {divider}
            {/* Trang nhật ký sẽ làm ở nhánh riêng, tạm báo trước. */}
            <Pressable
              accessibilityRole="button"
              onPress={() => Alert.alert('Nhật ký hoạt động', 'Nhật ký quản trị sẽ sớm có.')}
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: theme.background },
              ]}
            >
              <Text style={[styles.rowLabel, { color: theme.text }]}>
                Nhật ký hoạt động quản trị
              </Text>
              <Icon name={AdminIcons.chevronRight} color={theme.textSecondary} size={18} />
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel="Đăng xuất"
            accessibilityRole="button"
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOut,
              { backgroundColor: `${theme.danger}14` },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={AdminIcons.logout} color={theme.danger} size={16} />
            <Text style={[styles.signOutLabel, { color: theme.danger }]}>Đăng xuất</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    gap: 16,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 22,
    boxShadow: '0px 4px 14px rgba(23, 33, 27, 0.06)',
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
  },
  initials: { fontSize: 17, fontWeight: '900' },
  accountCopy: { flex: 1, gap: 3 },
  accountName: { fontSize: 15, fontWeight: '900' },
  accountEmail: { fontSize: 13, fontWeight: '500' },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleLabel: { fontSize: 11, fontWeight: '800' },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth },
  signOut: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
  },
  signOutLabel: { fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
