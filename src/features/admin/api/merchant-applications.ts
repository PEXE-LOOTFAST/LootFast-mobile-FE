import { apiRequest } from '@/lib/api-client';
import type { PagedResponse } from '@/types/api';

/**
 * Hồ sơ đăng ký người bán, khớp MerchantApplicationResponse của backend
 * (GET /admin/merchant-applications). Backend chỉ lưu người đứng đơn và số giấy phép
 * kinh doanh — tên quán, địa chỉ, giờ mở cửa do người bán khai sau khi được duyệt.
 */
export type MerchantApplicationDto = {
  applicationId: string;
  applicantId: string;
  applicantEmail: string;
  applicantName: string;
  userRoles: string[];
  businessLicenseNumber: string;
  status: MerchantApplicationStatusDto;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedByAdminId: string | null;
};

/**
 * UPLOADING và UPLOAD_FAILED là hai trạng thái lúc giấy phép còn đang tải lên, hồ sơ chưa
 * vào hàng chờ. Màn Duyệt quán chỉ hỏi ba trạng thái admin xử lý được.
 */
export type MerchantApplicationStatusDto =
  'UPLOADING' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'UPLOAD_FAILED';

export type ReviewableApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LicenseDownloadDto = {
  url: string;
  /** Link giấy phép hết hạn sau 5 phút, đừng cache lại để mở lần sau. */
  expiresAt: string;
};

export type MerchantApplicationQuery = {
  status: ReviewableApplicationStatus;
  page?: number;
  size?: number;
};

const BASE_PATH = '/admin/merchant-applications';

export function listMerchantApplications({
  status,
  page = 0,
  size = 20,
}: MerchantApplicationQuery) {
  const query = new URLSearchParams({ status, page: String(page), size: String(size) });

  return apiRequest<PagedResponse<MerchantApplicationDto>>(`${BASE_PATH}?${query.toString()}`);
}

export function approveMerchantApplication(applicationId: string) {
  return apiRequest<MerchantApplicationDto>(`${BASE_PATH}/${applicationId}/approve`, {
    method: 'POST',
  });
}

export function rejectMerchantApplication(applicationId: string, reason: string) {
  return apiRequest<MerchantApplicationDto>(`${BASE_PATH}/${applicationId}/reject`, {
    method: 'POST',
    body: { reason: reason.trim() },
  });
}

export function createLicenseDownloadUrl(applicationId: string) {
  return apiRequest<LicenseDownloadDto>(`${BASE_PATH}/${applicationId}/license-download-url`);
}
