import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { InlineAlert } from '@/components/ui/inline-alert';
import { MaxContentWidth } from '@/constants/theme';
import { AdminHeader } from '@/features/admin/components/admin-header';
import { LicenseViewer } from '@/features/admin/components/license-viewer';
import { RejectApplicationDialog } from '@/features/admin/components/reject-application-dialog';
import { StoreApplicationCard } from '@/features/admin/components/store-application-card';
import { STORE_APPROVAL_TABS } from '@/features/admin/constants/store-approval-tabs';
import { useStoreApprovalQueue } from '@/features/admin/hooks/use-store-approval-queue';
import type { StoreApplicationStatus } from '@/features/admin/types';
import { SegmentedTabs } from '@/features/seller/components/segmented-tabs';
import { EmptyCard } from '@/components/ui/empty-card';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useTheme } from '@/hooks/use-theme';

const EMPTY_STATES: Record<StoreApplicationStatus, { title: string; description: string }> = {
  pending: {
    title: 'Không còn hồ sơ chờ duyệt',
    description: 'Hồ sơ đăng ký quán mới sẽ xuất hiện tại đây.',
  },
  approved: {
    title: 'Chưa duyệt quán nào',
    description: 'Quán được phê duyệt sẽ được liệt kê tại đây.',
  },
  rejected: {
    title: 'Chưa từ chối quán nào',
    description: 'Hồ sơ bị từ chối sẽ được liệt kê tại đây.',
  },
  'upload-failed': {
    title: 'Không có hồ sơ lỗi tải lên',
    description: 'Hồ sơ mà ảnh giấy phép không lên được hệ thống sẽ xuất hiện tại đây.',
  },
};

export function StoreApprovalScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<StoreApplicationStatus>('pending');
  const queue = useStoreApprovalQueue(tab);
  // Hồ sơ đang chờ admin gõ lý do từ chối; null là hộp thoại đang đóng.
  const [rejecting, setRejecting] = useState<{ id: string; title: string } | null>(null);

  // Chỉ đếm hàng chờ: đó là việc admin còn phải làm, hai nhóm kia chỉ để tra lại.
  const tabs = STORE_APPROVAL_TABS.map((item) =>
    item.id === 'pending' ? { ...item, label: `${item.label} (${queue.pendingCount})` } : item,
  );

  useLightStatusBar();

  const confirmReject = (reason: string) => {
    if (!rejecting) return;

    queue.reject(rejecting.id, reason);
    setRejecting(null);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Trung tâm thông báo của admin sẽ làm ở nhánh riêng, tạm báo trước. */}
      <AdminHeader
        date={new Date()}
        hasUnread={queue.pendingCount > 0}
        onPressNotifications={() => Alert.alert('Thông báo', 'Trung tâm thông báo sẽ sớm có.')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <SegmentedTabs items={tabs} onChange={setTab} value={tab} />

          {queue.actionError ? <InlineAlert message={queue.actionError} /> : null}

          {queue.isLoading ? (
            <ActivityIndicator color={theme.primary} size="large" style={styles.loader} />
          ) : queue.loadError ? (
            <View style={styles.errorBlock}>
              <InlineAlert message={queue.loadError} />
              <Pressable
                accessibilityRole="button"
                onPress={queue.refetch}
                style={({ pressed }) => [
                  styles.retry,
                  { borderColor: theme.border },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.retryLabel, { color: theme.primary }]}>Thử lại</Text>
              </Pressable>
            </View>
          ) : queue.items.length > 0 ? (
            queue.items.map((application) => (
              <StoreApplicationCard
                key={application.id}
                application={application}
                isBusy={queue.busyId === application.id}
                onApprove={() => queue.approve(application.id)}
                onReject={() => setRejecting({ id: application.id, title: application.title })}
                onViewLicense={
                  queue.canViewLicense(application.status)
                    ? () => queue.viewLicense(application.id)
                    : undefined
                }
              />
            ))
          ) : (
            <EmptyCard {...EMPTY_STATES[tab]} />
          )}

          {queue.hasMore ? (
            <Pressable
              accessibilityRole="button"
              disabled={queue.isLoadingMore}
              onPress={queue.loadMore}
              style={({ pressed }) => [
                styles.retry,
                { borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.retryLabel, { color: theme.primary }]}>
                {queue.isLoadingMore ? 'Đang tải…' : 'Tải thêm hồ sơ'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <LicenseViewer onClose={queue.closeLicense} url={queue.licenseUrl} />

      {/* key theo hồ sơ: mỗi lần mở là một ô lý do trống. */}
      <RejectApplicationDialog
        key={rejecting?.id ?? 'closed'}
        applicationTitle={rejecting?.title ?? null}
        isSubmitting={queue.busyId !== null && queue.busyId === rejecting?.id}
        onCancel={() => setRejecting(null)}
        onConfirm={confirmReject}
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
    marginTop: 16,
    paddingHorizontal: 16,
  },
  loader: { marginTop: 24 },
  errorBlock: { gap: 10 },
  retry: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryLabel: { fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
