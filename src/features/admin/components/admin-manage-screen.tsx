import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ApiPendingCard } from '@/components/ui/api-pending-card';
import { MaxContentWidth } from '@/constants/theme';
import { AdminHeader } from '@/features/admin/components/admin-header';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useTheme } from '@/hooks/use-theme';

/**
 * Quản lý quán và người dùng. Backend chưa có endpoint liệt kê tài khoản, cũng chưa có
 * endpoint khoá / mở khoá — quyền quản trị hiện mới dừng ở duyệt hồ sơ người bán.
 *
 * Ô tìm kiếm và dòng tài khoản đã dựng sẵn ở `admin-search-bar` và `managed-account-row`,
 * khi có API chỉ cần nối danh sách vào.
 */
export function AdminManageScreen() {
  const theme = useTheme();
  const [today] = useState(() => new Date());

  useLightStatusBar();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trung tâm thông báo của admin sẽ làm ở nhánh riêng, tạm báo trước. */}
        <AdminHeader
          date={today}
          hasUnread={false}
          onPressNotifications={() => Alert.alert('Thông báo', 'Trung tâm thông báo sẽ sớm có.')}
        />

        <View style={styles.body}>
          <ApiPendingCard feature="Danh sách quán, người dùng và thao tác khoá tài khoản" />
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
    gap: 14,
    marginTop: 16,
    paddingHorizontal: 16,
  },
});
