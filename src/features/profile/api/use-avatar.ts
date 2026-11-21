import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toAvatarErrorMessage, uploadAvatar } from '@/features/profile/api/avatar';
import { pickImages, useRecoveredPick } from '@/lib/pick-image';
import { showToast } from '@/lib/toast';

const PROFILE_ROUTE = '/profile';

/**
 * Chụp ảnh hoặc chọn từ thư viện rồi đổi ảnh đại diện. Cắt vuông sẵn vì mọi chỗ hiển thị avatar đều
 * bo tròn, để người dùng thấy đúng phần ảnh sẽ được dùng.
 */
export function useAvatarUpload(resumeRoute: string = PROFILE_ROUTE) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (imageUri: string) => uploadAvatar(imageUri),
    onSuccess: () => {
      showToast('Đã đổi ảnh đại diện.', { tone: 'success' });
      return queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: (error) => showToast(toAvatarErrorMessage(error), { tone: 'error' }),
  });

  const pickAndUpload = async () => {
    const [asset] = await pickImages({
      allowsEditing: true,
      aspect: [1, 1],
      resume: { route: resumeRoute },
    });
    if (!asset) return;

    mutation.mutate(asset.uri);
  };

  // Android có thể tắt app khi camera đang mở: đổi tiếp ảnh đại diện bằng ảnh vừa chụp.
  useRecoveredPick(resumeRoute, ({ assets }) => {
    const [asset] = assets;
    if (asset) mutation.mutate(asset.uri);
  });

  return { pickAndUpload, isUploading: mutation.isPending };
}
