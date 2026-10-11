import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { toAvatarErrorMessage, uploadAvatar } from '@/features/profile/api/avatar';
import { pickImages, useRecoveredPick } from '@/lib/pick-image';

const PROFILE_ROUTE = '/profile';

/**
 * Chụp ảnh hoặc chọn từ thư viện rồi đổi ảnh đại diện. Cắt vuông sẵn vì mọi chỗ hiển thị avatar đều
 * bo tròn, để người dùng thấy đúng phần ảnh sẽ được dùng.
 */
export function useAvatarUpload() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (imageUri: string) => uploadAvatar(imageUri),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', 'me'] }),
    onError: (error) => Alert.alert('Đổi ảnh thất bại', toAvatarErrorMessage(error)),
  });

  const pickAndUpload = async () => {
    const [asset] = await pickImages({
      allowsEditing: true,
      aspect: [1, 1],
      resume: { route: PROFILE_ROUTE },
    });
    if (!asset) return;

    mutation.mutate(asset.uri);
  };

  // Android có thể tắt app khi camera đang mở: đổi tiếp ảnh đại diện bằng ảnh vừa chụp.
  useRecoveredPick(PROFILE_ROUTE, ({ assets }) => {
    const [asset] = assets;
    if (asset) mutation.mutate(asset.uri);
  });

  return { pickAndUpload, isUploading: mutation.isPending };
}
