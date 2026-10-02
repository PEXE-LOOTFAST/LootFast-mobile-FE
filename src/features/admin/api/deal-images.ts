import { apiRequest } from '@/lib/api-client';

/** Backend trả về MerchantDealResponse của deal chứa ảnh vừa gỡ. */
export type RemovedImageDealDto = {
  dealId: string;
  name: string;
  primaryImageUrl: string | null;
  images: { imageId: string; imageUrl: string; displayOrder: number }[];
};

/** Backend giới hạn lý do gỡ ảnh ở 500 ký tự, giống lý do từ chối hồ sơ. */
export const MAX_REMOVAL_REASON_LENGTH = 500;

export function removeViolatingDealImage(imageId: string, reason: string) {
  return apiRequest<RemovedImageDealDto>(`/admin/deal-images/${imageId}/remove`, {
    method: 'POST',
    body: { reason: reason.trim() },
  });
}
