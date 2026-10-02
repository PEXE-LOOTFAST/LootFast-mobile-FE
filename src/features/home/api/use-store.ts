import { useQuery } from '@tanstack/react-query';

import { getStore } from '@/features/home/api/stores';

export function useStore(merchantId: string | undefined) {
  return useQuery({
    enabled: Boolean(merchantId),
    queryKey: ['store', merchantId],
    queryFn: () => getStore(merchantId as string),
  });
}
