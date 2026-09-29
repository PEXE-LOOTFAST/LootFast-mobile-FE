import { Fragment, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';
import { AdminHeader } from '@/features/admin/components/admin-header';
import { AdminSearchBar } from '@/features/admin/components/admin-search-bar';
import { ManagedAccountRow } from '@/features/admin/components/managed-account-row';
import { MOCK_ADMIN_ALERTS } from '@/features/admin/data/mock-admin-overview';
import { MOCK_MANAGED_ACCOUNTS } from '@/features/admin/data/mock-managed-accounts';
import type { ManagedAccount } from '@/features/admin/types';
import { SellerEmptyCard } from '@/features/seller/components/seller-empty-card';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useTheme } from '@/hooks/use-theme';

// So khớp không phân biệt hoa thường và dấu, để gõ "com tam" vẫn ra "Cơm Tấm".
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function AdminManageScreen() {
  const theme = useTheme();
  const [today] = useState(() => new Date());
  const [query, setQuery] = useState('');
  const [accounts, setAccounts] = useState(MOCK_MANAGED_ACCOUNTS);

  const keyword = normalize(query);
  const visible = keyword
    ? accounts.filter((account) => normalize(account.name).includes(keyword))
    : accounts;

  useLightStatusBar();

  // Chỉ đổi trạng thái trên máy cho tới khi có API khoá/mở khoá tài khoản.
  const toggleLock = (account: ManagedAccount) => {
    const willLock = account.status === 'active';
    Alert.alert(
      willLock ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      `${willLock ? 'Khóa' : 'Mở khóa'} "${account.name}"?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: willLock ? 'Khóa' : 'Mở khóa',
          style: willLock ? 'destructive' : 'default',
          onPress: () =>
            setAccounts((current) =>
              current.map((item) =>
                item.id === account.id ? { ...item, status: willLock ? 'locked' : 'active' } : item,
              ),
            ),
        },
      ],
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Trung tâm thông báo của admin sẽ làm ở nhánh riêng, tạm báo trước. */}
        <AdminHeader
          date={today}
          hasUnread={MOCK_ADMIN_ALERTS.length > 0}
          onPressNotifications={() => Alert.alert('Thông báo', 'Trung tâm thông báo sẽ sớm có.')}
        />

        <View style={styles.body}>
          <AdminSearchBar
            onChange={setQuery}
            placeholder="Tìm quán hoặc người dùng"
            value={query}
          />

          {visible.length > 0 ? (
            <View
              style={[
                styles.list,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            >
              {visible.map((account, index) => (
                <Fragment key={account.id}>
                  {index > 0 ? (
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                  ) : null}
                  <ManagedAccountRow account={account} onPress={() => toggleLock(account)} />
                </Fragment>
              ))}
            </View>
          ) : (
            <SellerEmptyCard
              description="Thử tìm bằng tên quán hoặc tên người dùng khác."
              title="Không tìm thấy kết quả"
            />
          )}
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
  list: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 22,
    boxShadow: '0px 4px 14px rgba(23, 33, 27, 0.06)',
  },
  divider: { height: StyleSheet.hairlineWidth },
});
