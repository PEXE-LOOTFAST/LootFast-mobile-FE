import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import { toAvatarErrorMessage, uploadAvatar } from '@/features/profile/api/avatar';

/**
 * Chọn ảnh từ thư viện rồi đổi ảnh đại diện. Cắt vuông sẵn vì mọi chỗ hiển thị avatar đều
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
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Cần quyền truy cập',
        'Vui lòng cấp quyền truy cập thư viện ảnh trong Cài đặt hệ thống.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    mutation.mutate(result.assets[0].uri);
  };

  return { pickAndUpload, isUploading: mutation.isPending };
}
