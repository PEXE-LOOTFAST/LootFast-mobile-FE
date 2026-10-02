import { apiUpload, apiRequest } from '@/lib/api-client';
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
    // Backend trả MerchantImageResponse { imageType, url } — không phải { imageUrl }.
    const image = await apiUpload<MerchantImageDto>(`/merchants/me/${type}`, {
      method: 'PUT',
      files: { file: { uri: fileUri } },
    });

    return image.url;
  },
};
