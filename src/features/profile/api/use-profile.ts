import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from '@/features/profile/api/profile';

export function useProfile(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ['profile', 'me'],
    queryFn: getCurrentUser,
  });
}
