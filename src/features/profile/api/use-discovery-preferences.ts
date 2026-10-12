import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateDiscoveryPreferences } from '@/features/profile/api/preferences';

export function useUpdateDiscoveryPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDiscoveryPreferences,
    // Hồ sơ là nguồn sự thật của hai trường này, nên tải lại thay vì tự ghép dữ liệu.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', 'me'] }),
  });
}
