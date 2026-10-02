import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createMerchantDeal,
  listMerchantDeals,
  publishMerchantDeal,
  removeDealImage,
  reorderDealImages,
  updateMerchantDealQuantity,
  uploadDealImage,
  type CreateMerchantDealPayload,
  type MerchantDealDto,
} from '@/features/seller/api/merchant-deals';
import type { SellerDeal } from '@/features/seller/types';

export const MERCHANT_DEALS_QUERY_KEY = ['merchant', 'deals'];

function toTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';

  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Backend có 5 trạng thái, màn Đơn hàng chỉ chia hai nhóm: còn bán được hay không. DRAFT cũng
 * xếp vào "đang chạy" để người bán thấy bản nháp mình vừa tạo mà bấm vào đăng tiếp.
 */
export function toSellerDeal(deal: MerchantDealDto): SellerDeal {
  const isRunning = deal.status === 'ACTIVE' || deal.status === 'DRAFT';

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
      start: toTimeLabel(deal.pickupStartsAt),
      end: toTimeLabel(deal.pickupEndsAt),
    },
    ...(isRunning
      ? {}
      : { endedReason: deal.status === 'SOLD_OUT' ? ('sold-out' as const) : ('expired' as const) }),
  };
}

export function useMerchantDeals() {
  return useQuery({
    queryKey: MERCHANT_DEALS_QUERY_KEY,
    queryFn: () => listMerchantDeals(),
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

/** Một deal cụ thể của quán, dùng ở màn quản lý ảnh. */
export function useMerchantDeal(dealId: string | undefined) {
  const dealsQuery = useMerchantDeals();

  return {
    ...dealsQuery,
    deal: dealsQuery.data?.items.find((item) => item.dealId === dealId),
  };
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
