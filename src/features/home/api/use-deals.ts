import { useQuery } from '@tanstack/react-query';

import { getDeal, getDeals, type DealQuery } from '@/features/home/api/deals';

export function useDeals(params: DealQuery) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: () => getDeals(params),
  });
}

export function useDeal(dealId: string | undefined) {
  return useQuery({
    enabled: Boolean(dealId),
    queryKey: ['deal', dealId],
    queryFn: () => getDeal(dealId as string),
  });
}
