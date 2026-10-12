import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProfile } from '@/features/profile/api/profile';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    // Phản hồi là hồ sơ đầy đủ mới nhất nên ghi thẳng vào cache, không cần tải lại.
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile', 'me'], profile);
    },
  });
}
