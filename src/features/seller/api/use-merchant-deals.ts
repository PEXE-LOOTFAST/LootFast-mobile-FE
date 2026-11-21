import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createMerchantDeal,
  getMerchantDeal,
  listMerchantDeals,
  publishMerchantDeal,
  removeDealImage,
  reorderDealImages,
  updateMerchantDeal,
  updateMerchantDealQuantity,
  uploadDealImage,
  type CreateMerchantDealPayload,
  type MerchantDealDto,
} from '@/features/seller/api/merchant-deals';
import { toTimeInput, vietnamDateKey } from '@/features/seller/deal-schedule';
import type { SellerDeal } from '@/features/seller/types';
import { formatTime } from '@/lib/format';

export const MERCHANT_DEALS_QUERY_KEY = ['merchant', 'deals'];

/**
 * Backend có 5 trạng thái, màn Đơn hàng chỉ chia hai nhóm: còn bán được hay không. DRAFT cũng
 * xếp vào "đang chạy" để người bán thấy bản nháp mình vừa tạo mà bấm vào đăng tiếp.
 *
 * ACTIVE chỉ là "đang bán" khi chưa hết khung giờ deal: backend không tự đổi trạng thái khi hết
 * giờ mà chỉ ẩn deal khỏi trang người mua, nên phải tự xét giờ ở đây để màn người bán khớp với
 * những gì khách thấy.
 */
export function toSellerDeal(deal: MerchantDealDto): SellerDeal {
  const isOpen = Date.now() < new Date(deal.saleEndsAt).getTime();
  const isRunning = deal.status === 'DRAFT' || (deal.status === 'ACTIVE' && isOpen);
  const endedReason: SellerDeal['endedReason'] =
    deal.status === 'SOLD_OUT' ? 'sold-out' : 'expired';

  return {
    id: deal.dealId,
    name: deal.name,
    // Backend không lưu emoji; DealImage tự dùng ảnh thay thế khi thiếu.
    emoji: '🍱',
    imageUrl: deal.primaryImageUrl ?? '',
    status: isRunning ? 'running' : 'ended',
    portionsTotal: deal.totalQuantity,
    portionsSold: deal.totalQuantity - deal.remainingQuantity,
    price: deal.discountedPrice,
    originalPrice: deal.originalPrice,
    pickupWindow: {
      start: formatTime(deal.saleStartsAt),
      end: formatTime(deal.saleEndsAt),
    },
    saleEndsLabel: `${toTimeInput(deal.saleEndsAt)} · ${vietnamDateKey(deal.saleEndsAt)
      .slice(5)
      .split('-')
      .reverse()
      .join('/')}`,
    ...(isRunning ? {} : { endedReason }),
  };
}

export function useMerchantDeals() {
  return useQuery({
    queryKey: MERCHANT_DEALS_QUERY_KEY,
    queryFn: () => listMerchantDeals(),
    // Deal tự chuyển sang "đã kết thúc" theo giờ mà không có thay đổi nào từ server.
    refetchInterval: 60 * 1000,
  });
}

function useDealMutation<TVariables, TData>(mutationFn: (variables: TVariables) => Promise<TData>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    // Deal của quán đổi thì feed người mua cũng đổi theo.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MERCHANT_DEALS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useCreateMerchantDeal() {
  return useDealMutation((payload: CreateMerchantDealPayload) => createMerchantDeal(payload));
}

export function usePublishMerchantDeal() {
  return useDealMutation((dealId: string) => publishMerchantDeal(dealId));
}

export function useUploadDealImage() {
  return useDealMutation(({ dealId, imageUri }: { dealId: string; imageUri: string }) =>
    uploadDealImage(dealId, imageUri),
  );
}

export function useRemoveDealImage() {
  return useDealMutation(({ dealId, imageId }: { dealId: string; imageId: string }) =>
    removeDealImage(dealId, imageId),
  );
}

export function useReorderDealImages() {
  return useDealMutation(({ dealId, imageIds }: { dealId: string; imageIds: string[] }) =>
    reorderDealImages(dealId, imageIds),
  );
}

/**
 * Một deal cụ thể của quán. Hỏi thẳng backend chứ không lọc trong danh sách đã nạp, vì danh
 * sách chỉ lấy 50 deal đầu — deal cũ hơn sẽ không tìm thấy, và mở thẳng bằng URL cũng hỏng.
 */
export function useMerchantDeal(dealId: string | undefined) {
  const query = useQuery({
    enabled: Boolean(dealId),
    queryKey: [...MERCHANT_DEALS_QUERY_KEY, dealId],
    queryFn: () => getMerchantDeal(dealId as string),
  });

  return { ...query, deal: query.data };
}

export function useUpdateMerchantDeal() {
  return useDealMutation(
    ({ dealId, payload }: { dealId: string; payload: CreateMerchantDealPayload }) =>
      updateMerchantDeal(dealId, payload),
  );
}

export function useUpdateDealQuantity() {
  return useDealMutation(
    ({
      dealId,
      totalQuantity,
      expectedVersion,
    }: {
      dealId: string;
      totalQuantity: number;
      expectedVersion: number;
    }) => updateMerchantDealQuantity(dealId, totalQuantity, expectedVersion),
  );
}
