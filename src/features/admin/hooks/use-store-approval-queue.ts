import { useState } from 'react';

import { toAdminErrorMessage } from '@/features/admin/api/admin-error-messages';
import type {
  MerchantApplicationDto,
  MerchantApplicationStatusDto,
  ListedApplicationStatus,
} from '@/features/admin/api/merchant-applications';
import {
  useApproveApplication,
  useLicenseDownloadUrl,
  useMerchantApplications,
  useRejectApplication,
} from '@/features/admin/api/use-merchant-applications';
import { AdminIcons } from '@/features/admin/constants/icons';
import type { StoreApplicationCardModel, StoreApplicationStatus } from '@/features/admin/types';
import { formatShortDate } from '@/lib/format';

const STATUS_TO_DTO: Record<StoreApplicationStatus, ListedApplicationStatus> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  'upload-failed': 'UPLOAD_FAILED',
};

// UPLOADING chỉ kéo dài vài giây và không có tab riêng; xếp nó cùng nhóm chờ xử lý để nhánh
// mặc định không trả về undefined nếu backend thêm trạng thái mới.
function toStatus(status: MerchantApplicationStatusDto): StoreApplicationStatus {
  if (status === 'APPROVED') return 'approved';
  if (status === 'REJECTED') return 'rejected';
  if (status === 'UPLOAD_FAILED') return 'upload-failed';

  return 'pending';
}

function toDateLabel(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '--/--/----' : formatShortDate(date);
}

/**
 * Hồ sơ chỉ có người đứng đơn, email và số giấy phép kinh doanh — tên quán, địa chỉ, giờ mở
 * cửa là thứ người bán khai sau khi được duyệt, nên thẻ hiển thị đúng chừng đó.
 */
function toCardModel(application: MerchantApplicationDto): StoreApplicationCardModel {
  return {
    id: application.applicationId,
    title: application.applicantName.trim() || application.applicantEmail,
    tags: [
      {
        label: `GPKD ${application.businessLicenseNumber}`,
        icon: AdminIcons.document,
        tone: 'primary',
      },
    ],
    rows: [
      { icon: AdminIcons.person, label: application.applicantEmail },
      { icon: AdminIcons.calendar, label: `Gửi ngày ${toDateLabel(application.submittedAt)}` },
      ...(application.reviewedAt
        ? [
            {
              icon: AdminIcons.shieldCheck,
              label: `Xử lý ngày ${toDateLabel(application.reviewedAt)}`,
            },
          ]
        : []),
    ],
    status: toStatus(application.status),
    rejectionReason: application.rejectionReason,
  };
}

export type StoreApprovalQueue = {
  isLoading: boolean;
  /** Còn trang sau để tải; màn hiện nút "Tải thêm" khi true. */
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  /** Lỗi tải danh sách; hỏng thì màn hiển thị thông báo kèm nút thử lại. */
  loadError: string | null;
  /** Lỗi của thao tác duyệt / từ chối / xem giấy phép gần nhất. */
  actionError: string | null;
  /** Hồ sơ đang gọi API, dùng để khoá đúng thẻ đó chứ không khoá cả danh sách. */
  busyId: string | null;
  pendingCount: number;
  items: StoreApplicationCardModel[];
  approve: (applicationId: string) => void;
  reject: (applicationId: string, reason: string) => void;
  /** Hồ sơ lỗi tải lên chưa có file trên storage nên không mở được. */
  canViewLicense: (status: StoreApplicationStatus) => boolean;
  viewLicense: (applicationId: string) => void;
  /** Link ảnh giấy phép đang xem trong app; null là chưa mở. */
  licenseUrl: string | null;
  closeLicense: () => void;
  refetch: () => void;
};

/**
 * Hàng chờ duyệt người bán, đọc và ghi thẳng qua API quản trị.
 *
 * Lưu ý về nghiệp vụ: API không có thao tác hoàn tác — duyệt hay từ chối là quyết định cuối,
 * và từ chối bắt buộc kèm lý do.
 */
export function useStoreApprovalQueue(tab: StoreApplicationStatus): StoreApprovalQueue {
  // Luôn hỏi cả tab đang xem lẫn hàng chờ: nhãn tab "Chờ duyệt (n)" cần số lượng kể cả khi
  // admin đang đứng ở tab khác. Cùng queryKey nên ở tab Chờ duyệt chỉ có một request.
  const pendingQuery = useMerchantApplications('PENDING');
  const activeQuery = useMerchantApplications(STATUS_TO_DTO[tab]);

  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();
  const licenseMutation = useLicenseDownloadUrl();
  const [actionError, setActionError] = useState<string | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);

  const busyId = approveMutation.isPending
    ? (approveMutation.variables ?? null)
    : rejectMutation.isPending
      ? (rejectMutation.variables?.applicationId ?? null)
      : null;

  // useInfiniteQuery trả về từng trang; nối lại thành một danh sách phẳng cho màn hình.
  const items = (activeQuery.data?.pages ?? []).flatMap((page) => page.items).map(toCardModel);

  return {
    isLoading: activeQuery.isLoading,
    hasMore: activeQuery.hasNextPage,
    isLoadingMore: activeQuery.isFetchingNextPage,
    loadMore: () => void activeQuery.fetchNextPage(),
    loadError: activeQuery.error ? toAdminErrorMessage(activeQuery.error) : null,
    actionError,
    busyId,
    pendingCount: pendingQuery.data?.pages[0]?.totalElements ?? 0,
    items,
    approve: (applicationId: string) => {
      setActionError(null);
      approveMutation.mutate(applicationId, {
        onError: (error) => setActionError(toAdminErrorMessage(error)),
      });
    },
    reject: (applicationId: string, reason: string) => {
      setActionError(null);
      rejectMutation.mutate(
        { applicationId, reason },
        { onError: (error) => setActionError(toAdminErrorMessage(error)) },
      );
    },
    licenseUrl,
    closeLicense: () => setLicenseUrl(null),
    canViewLicense: (status: StoreApplicationStatus) => status !== 'upload-failed',
    viewLicense: (applicationId: string) => {
      setActionError(null);
      licenseMutation.mutate(applicationId, {
        onSuccess: (response) => setLicenseUrl(response.url),
        onError: (error) => setActionError(toAdminErrorMessage(error)),
      });
    },
    refetch: () => {
      void activeQuery.refetch();
      void pendingQuery.refetch();
    },
  };
}
