import { apiRequest } from '@/lib/api-client';
import { tokenStorage } from '@/lib/storage';
import type {
  CurrentUserDto,
  MerchantImageDto,
  MerchantLocationDto,
  MerchantOpeningHoursDto,
  MerchantProfileDto,
  UpdateMerchantLocationPayload,
  UpdateMerchantProfilePayload,
  UpdateOpeningHoursPayload,
} from '@/features/seller/types/api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const merchantApi = {
  getProfile: () => apiRequest<MerchantProfileDto>('/merchants/me'),

  updateProfile: (body: UpdateMerchantProfilePayload) =>
    apiRequest<MerchantProfileDto>('/merchants/me', { method: 'PUT', body }),

  getLocation: () => apiRequest<MerchantLocationDto>('/merchants/me/location'),

  updateLocation: (body: UpdateMerchantLocationPayload) =>
    apiRequest<MerchantLocationDto>('/merchants/me/location', { method: 'PUT', body }),

  getOpeningHours: () => apiRequest<MerchantOpeningHoursDto>('/merchants/me/opening-hours'),

  updateOpeningHours: (body: UpdateOpeningHoursPayload) =>
    apiRequest<MerchantOpeningHoursDto>('/merchants/me/opening-hours', { method: 'PUT', body }),

  getCurrentUser: () => apiRequest<CurrentUserDto>('/users/me'),

  uploadImage: async (type: 'logo' | 'cover', fileUri: string): Promise<string> => {
    if (!BASE_URL) throw new Error('EXPO_PUBLIC_API_URL chưa được cấu hình');

    const accessToken = await tokenStorage.getAccessToken();

    const formData = new FormData();
    const filename = fileUri.split('/').pop() ?? `${type}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match?.[1] ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

    // @ts-expect-error: React Native specific FormData entry format
    formData.append('file', { uri: fileUri, name: filename, type: mimeType });

    const res = await fetch(`${BASE_URL}/merchants/me/${type}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken ?? ''}` },
      body: formData,
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.code ?? 'UPLOAD_FAILED');
    }
    return (json.data as MerchantImageDto).imageUrl;
  },
};
