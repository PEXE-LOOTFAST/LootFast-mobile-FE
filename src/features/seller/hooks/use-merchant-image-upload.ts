import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

import { merchantApi } from '@/features/seller/api/merchant-api';
import { MERCHANT_QUERY_KEYS } from '@/features/seller/hooks/use-merchant-shop';
import { ApiException } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';

// Tên mã khớp đúng ErrorCode của backend; bảng cũ dùng những mã không tồn tại nên mọi lỗi
// đều rơi vào câu mặc định.
function mapUploadError(error: unknown): string {
  if (!(error instanceof ApiException)) {
    return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  }

  const messages: Record<string, string> = {
    INVALID_MERCHANT_IMAGE: 'Ảnh không hợp lệ. Chỉ nhận JPEG hoặc PNG.',
    MERCHANT_IMAGE_TOO_LARGE: 'Ảnh vượt quá 5 MB. Vui lòng chọn ảnh nhỏ hơn.',
    MERCHANT_IMAGE_RATE_LIMITED: 'Đổi ảnh quá nhiều lần. Thử lại sau ít phút.',
    MERCHANT_IMAGE_RATE_LIMIT_UNAVAILABLE: 'Dịch vụ tạm thời bảo trì. Thử lại sau.',
    MERCHANT_IMAGE_UPLOAD_FAILED: 'Không tải được ảnh lên. Vui lòng thử lại.',
    MERCHANT_PROFILE_NOT_FOUND: 'Chưa có hồ sơ quán để gắn ảnh.',
    ACCESS_DENIED: 'Tài khoản chưa được cấp quyền Người bán.',
  };

  return messages[error.code] ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.';
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
    } catch (error) {
      Alert.alert('Upload thất bại', mapUploadError(error));
    } finally {
      setIsUploading(false);
    }
  };

  return { pickAndUpload, isUploading };
}
