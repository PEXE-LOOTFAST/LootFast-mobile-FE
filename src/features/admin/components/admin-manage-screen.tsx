import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EmptyCard } from '@/components/ui/empty-card';
import { InlineAlert } from '@/components/ui/inline-alert';
import { FontSize, FontWeight, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { toUserErrorMessage } from '@/features/admin/api/admin-error-messages';
import {
  useAdminUsers,
  useSetUserLocked,
  type AdminUserDto,
} from '@/features/admin/api/admin-users';
import { AccountDetailDialog } from '@/features/admin/components/account-detail-dialog';
import { AdminHeader } from '@/features/admin/components/admin-header';
import { AdminSearchBar } from '@/features/admin/components/admin-search-bar';
import { ManagedAccountRow } from '@/features/admin/components/managed-account-row';
import { RejectApplicationDialog } from '@/features/admin/components/reject-application-dialog';
import type { ManagedAccount } from '@/features/admin/types';
import { useTheme } from '@/hooks/use-theme';
import { toDisplayPhone, toSearchKeyword } from '@/lib/phone';

/** Chờ người dùng ngừng gõ rồi mới gọi API, tránh một request cho mỗi phím. */
const SEARCH_DEBOUNCE_MS = 400;

function toAccount(user: AdminUserDto): ManagedAccount {
  return {
    id: user.userId,
    kind: user.roles.includes('MERCHANT') ? 'store' : 'user',
    name: `${user.firstName} ${user.lastName}`.trim() || user.email,
    detail: user.email,
    phone: toDisplayPhone(user.phoneNumber),
    verified: user.verificationStatus === 'VERIFIED',
    status: user.locked ? 'locked' : 'active',
    lockReason: user.lockReason,
  };
}

/** Quản lý tài khoản: tìm kiếm, khoá / mở khoá (bắt buộc kèm lý do) qua /admin/users. */
export function AdminManageScreen() {
  const theme = useTheme();
  const [today] = useState(() => new Date());
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  // Tài khoản đang chờ admin gõ lý do; null là hộp thoại đang đóng.
  const [target, setTarget] = useState<ManagedAccount | null>(null);
  // Tài khoản đang xem chi tiết; null là hộp thoại đang đóng.
  const [detail, setDetail] = useState<ManagedAccount | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const users = useAdminUsers(keyword);
  const setLocked = useSetUserLocked();

  useEffect(() => {
    // Chuẩn hoá để gõ số điện thoại kiểu nội địa (0xxxxxxxxx) vẫn khớp dữ liệu 9 chữ số của backend.
    const timer = setTimeout(() => setKeyword(toSearchKeyword(search)), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  const accounts = (users.data?.pages ?? []).flatMap((page) => page.items).map(toAccount);
  const isLocking = target?.status === 'active';

  const confirm = (reason: string) => {
    if (!target) return;

    setActionError(null);
    setLocked.mutate(
      { userId: target.id, lock: target.status === 'active', reason },
      { onError: (error) => setActionError(toUserErrorMessage(error)) },
    );
    setTarget(null);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <AdminHeader date={today} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={users.isRefetching}
            onRefresh={() => void users.refetch()}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          <AdminSearchBar
            onChange={setSearch}
            placeholder="Tìm theo tên, email hoặc số điện thoại"
            value={search}
          />

          {actionError ? <InlineAlert message={actionError} /> : null}

          {users.isLoading ? (
            <ActivityIndicator color={theme.primary} size="large" style={styles.loader} />
          ) : users.error ? (
            <View style={styles.errorBlock}>
              <InlineAlert message={toUserErrorMessage(users.error)} />
              <Pressable
                accessibilityRole="button"
                onPress={() => void users.refetch()}
                style={[styles.button, { borderColor: theme.border }]}
              >
                <Text style={[styles.buttonLabel, { color: theme.primary }]}>Thử lại</Text>
              </Pressable>
            </View>
          ) : accounts.length > 0 ? (
            <View
              style={[
                styles.list,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            >
              {accounts.map((account, index) => (
                <View
                  key={account.id}
                  style={index > 0 && { borderTopWidth: 1, borderTopColor: theme.border }}
                >
                  <ManagedAccountRow
                    account={account}
                    onPress={() => {
                      setActionError(null);
                      setDetail(account);
                    }}
                  />
                </View>
              ))}
            </View>
          ) : (
            <EmptyCard
              title="Không tìm thấy tài khoản"
              description="Thử từ khoá khác hoặc xoá ô tìm kiếm."
            />
          )}

          {users.hasNextPage ? (
            <Pressable
              accessibilityRole="button"
              disabled={users.isFetchingNextPage}
              onPress={() => void users.fetchNextPage()}
              style={[styles.button, { borderColor: theme.border }]}
            >
              <Text style={[styles.buttonLabel, { color: theme.primary }]}>
                {users.isFetchingNextPage ? 'Đang tải…' : 'Tải thêm'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <AccountDetailDialog
        account={detail}
        onClose={() => setDetail(null)}
        onToggleLock={(account) => {
          setDetail(null);
          setTarget(account);
        }}
      />

      {/* key theo tài khoản: mỗi lần mở là một ô lý do trống. */}
      <RejectApplicationDialog
        key={target?.id ?? 'closed'}
        applicationTitle={target?.name ?? null}
        confirmLabel={isLocking ? 'Khoá tài khoản' : 'Mở khoá'}
        isSubmitting={setLocked.isPending}
        message={
          isLocking
            ? 'Tài khoản sẽ bị đăng xuất và không đăng nhập được. Ghi rõ lý do khoá.'
            : 'Tài khoản phải đăng nhập lại sau khi mở khoá. Ghi rõ lý do mở khoá.'
        }
        onCancel={() => setTarget(null)}
        onConfirm={confirm}
        placeholder={isLocking ? 'Nhập lý do khoá tài khoản' : 'Nhập lý do mở khoá tài khoản'}
        title={isLocking ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}
      />
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
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  list: { borderWidth: 1, borderRadius: Radius.xxl, overflow: 'hidden' },
  loader: { marginTop: Spacing.xxl },
  errorBlock: { gap: 10 },
  button: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
  },
  buttonLabel: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
});
