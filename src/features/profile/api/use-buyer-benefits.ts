import { useQuery } from '@tanstack/react-query';

import { getBuyerBenefits } from '@/features/profile/api/premium';

export function useBuyerBenefits(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ['premium', 'buyer-benefits'],
    queryFn: getBuyerBenefits,
  });
}
