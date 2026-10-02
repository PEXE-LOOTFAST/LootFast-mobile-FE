import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  listFavorites,
  removeFavoriteDeal,
  removeFavoriteStore,
  saveFavoriteDeal,
  saveFavoriteStore,
} from '@/features/profile/api/favorites';

export const FAVORITES_QUERY_KEY = ['favorites'];

export function useFavorites(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => listFavorites(),
  });
}

function useFavoriteMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY }),
  });
}

/** Bật/tắt lưu deal trong một lần gọi, vì giao diện chỉ có một nút trái tim. */
export function useToggleFavoriteDeal() {
  return useFavoriteMutation(({ dealId, isSaved }: { dealId: string; isSaved: boolean }) =>
    isSaved ? removeFavoriteDeal(dealId) : saveFavoriteDeal(dealId),
  );
}

export function useToggleFavoriteStore() {
  return useFavoriteMutation(({ merchantId, isSaved }: { merchantId: string; isSaved: boolean }) =>
    isSaved ? removeFavoriteStore(merchantId) : saveFavoriteStore(merchantId),
  );
}
