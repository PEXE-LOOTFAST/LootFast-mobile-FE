import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';
import { AdminHeader } from '@/features/admin/components/admin-header';
import { StoreApplicationCard } from '@/features/admin/components/store-application-card';
import { STORE_APPROVAL_TABS } from '@/features/admin/constants/store-approval-tabs';
import { MOCK_STORE_APPLICATIONS } from '@/features/admin/data/mock-store-applications';
import { useStoreApprovals } from '@/features/admin/hooks/use-store-approvals';
import type { StoreApplicationStatus } from '@/features/admin/types';
import { SegmentedTabs } from '@/features/seller/components/segmented-tabs';
import { SellerEmptyCard } from '@/features/seller/components/seller-empty-card';
import { useLightStatusBar } from '@/features/seller/hooks/use-light-status-bar';
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
};

export function StoreApprovalScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<StoreApplicationStatus>('pending');
  const { grouped, approve, reject, undo } = useStoreApprovals(MOCK_STORE_APPLICATIONS);
  const visible = grouped[tab];
  // Chỉ đếm hàng chờ: đó là việc admin còn phải làm, hai nhóm kia chỉ để tra lại.
  const tabs = STORE_APPROVAL_TABS.map((item) =>
    item.id === 'pending' ? { ...item, label: `${item.label} (${grouped.pending.length})` } : item,
  );

  useLightStatusBar();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trung tâm thông báo của admin sẽ làm ở nhánh riêng, tạm báo trước. */}
        <AdminHeader
          date={new Date()}
          hasUnread={grouped.pending.length > 0}
          onPressNotifications={() => Alert.alert('Thông báo', 'Trung tâm thông báo sẽ sớm có.')}
        />

        <View style={styles.body}>
          <SegmentedTabs items={tabs} onChange={setTab} value={tab} />

          {visible.length > 0 ? (
            visible.map((application) => (
              <StoreApplicationCard
                key={application.id}
                application={application}
                onApprove={() => approve(application.id)}
                onReject={() => reject(application.id)}
                onUndo={() => undo(application.id)}
              />
            ))
          ) : (
            <SellerEmptyCard {...EMPTY_STATES[tab]} />
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
});
