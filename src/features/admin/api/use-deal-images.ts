import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removeViolatingDealImage } from '@/features/admin/api/deal-images';

export function useRemoveViolatingImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ imageId, reason }: { imageId: string; reason: string }) =>
      removeViolatingDealImage(imageId, reason),
    // Gỡ ảnh đổi ảnh đại diện của deal, nên feed người mua phải tải lại.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });
}
