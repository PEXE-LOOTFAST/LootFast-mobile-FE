import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

import { merchantApi } from '@/features/seller/api/merchant-api';
import { MERCHANT_QUERY_KEYS } from '@/features/seller/hooks/use-merchant-shop';
import { queryClient } from '@/lib/query-client';

function mapUploadError(code: string): string {
  const messages: Record<string, string> = {
    FILE_TOO_LARGE: 'Ảnh vượt quá 5 MB. Vui lòng chọn ảnh nhỏ hơn.',
    UPLOAD_RATE_LIMIT_EXCEEDED: 'Đổi ảnh quá nhiều lần. Thử lại sau 1 giờ.',
    SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời bảo trì. Thử lại sau.',
    UPLOAD_FAILED: 'Không thể upload ảnh. Vui lòng thử lại.',
  };
  return messages[code] ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export function useMerchantImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const pickAndUpload = async (type: 'logo' | 'cover') => {
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
      aspect: type === 'logo' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setIsUploading(true);
    try {
      await merchantApi.uploadImage(type, result.assets[0].uri);
      await queryClient.invalidateQueries({ queryKey: MERCHANT_QUERY_KEYS.profile });
    } catch (err) {
      const code = err instanceof Error ? err.message : 'UPLOAD_FAILED';
      Alert.alert('Upload thất bại', mapUploadError(code));
    } finally {
      setIsUploading(false);
    }
  };

  return { pickAndUpload, isUploading };
}
