import { ApiException, apiUpload } from '@/lib/api-client';

export type AvatarDto = { avatarUrl: string };

export function uploadAvatar(imageUri: string) {
  return apiUpload<AvatarDto>('/users/me/avatar', {
    method: 'PUT',
    files: { file: { uri: imageUri } },
  });
}

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang tiếng Việt ở đây.
const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  INVALID_AVATAR: 'Ảnh không hợp lệ. Chỉ nhận JPEG hoặc PNG.',
  AVATAR_TOO_LARGE: 'Ảnh vượt quá dung lượng cho phép. Chọn ảnh nhỏ hơn.',
  AVATAR_UPLOAD_FAILED: 'Không tải được ảnh lên. Vui lòng thử lại.',
};

export function toAvatarErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return MESSAGES[error.code] ?? 'Đổi ảnh đại diện không thành công. Vui lòng thử lại.';
  }

  // Không phải lỗi từ backend: mất mạng, sai EXPO_PUBLIC_API_URL, server chưa chạy...
  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
