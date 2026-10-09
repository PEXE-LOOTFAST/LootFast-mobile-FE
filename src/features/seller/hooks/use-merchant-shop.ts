import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { merchantApi } from '@/features/seller/api/merchant-api';
import type {
  DayOfWeek,
  MerchantLocationDto,
  MerchantOpeningHoursDto,
  MerchantProfileDto,
  UpdateMerchantLocationPayload,
  UpdateMerchantProfilePayload,
  UpdateOpeningHoursPayload,
} from '@/features/seller/types/api';
import { ApiException } from '@/lib/api-client';

export const MERCHANT_QUERY_KEYS = {
  profile: ['merchant', 'profile'] as const,
  location: ['merchant', 'location'] as const,
  openingHours: ['merchant', 'openingHours'] as const,
  currentUser: ['merchant', 'currentUser'] as const,
};

/** Quán chưa có hồ sơ nào (tài khoản chưa là người bán thì BE trả 403 thay vì 404): với người dùng đó là "chưa nhập gì", không phải lỗi tải. */
export function isProfileMissing(error: unknown): boolean {
  return (
    error instanceof ApiException &&
    (error.code === 'MERCHANT_PROFILE_NOT_FOUND' || error.status === 404 || error.status === 403)
  );
}

const retryUnlessMissing = (failureCount: number, error: unknown) =>
  !isProfileMissing(error) && failureCount < 1;

export function slotsToOpenClose(openingHours: MerchantOpeningHoursDto | undefined): {
  open: string;
  close: string;
} {
  const slot = openingHours?.slots.find((s) => s.dayOfWeek === 'MONDAY') ?? openingHours?.slots[0];
  return { open: slot?.opensAt ?? '', close: slot?.closesAt ?? '' };
}

export function openCloseToSlots(open: string, close: string): UpdateOpeningHoursPayload {
  const days: DayOfWeek[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];
  return {
    slots: days.map((dayOfWeek) => ({ dayOfWeek, opensAt: open, closesAt: close })),
  };
}

export function useMerchantShop() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery<MerchantProfileDto>({
    queryKey: MERCHANT_QUERY_KEYS.profile,
    queryFn: merchantApi.getProfile,
    retry: retryUnlessMissing,
  });

  const locationQuery = useQuery<MerchantLocationDto>({
    queryKey: MERCHANT_QUERY_KEYS.location,
    queryFn: merchantApi.getLocation,
    retry: retryUnlessMissing,
  });

  const openingHoursQuery = useQuery<MerchantOpeningHoursDto>({
    queryKey: MERCHANT_QUERY_KEYS.openingHours,
    queryFn: merchantApi.getOpeningHours,
    retry: retryUnlessMissing,
  });

  const loadError =
    [profileQuery.error, locationQuery.error, openingHoursQuery.error].find(
      (error) => error && !isProfileMissing(error),
    ) ?? null;

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateMerchantProfilePayload) => merchantApi.updateProfile(payload),
    onSuccess: (data) => queryClient.setQueryData(MERCHANT_QUERY_KEYS.profile, data),
  });

  const updateLocationMutation = useMutation({
    mutationFn: (payload: UpdateMerchantLocationPayload) => merchantApi.updateLocation(payload),
    onSuccess: (data) => queryClient.setQueryData(MERCHANT_QUERY_KEYS.location, data),
  });

  const updateOpeningHoursMutation = useMutation({
    mutationFn: (payload: UpdateOpeningHoursPayload) => merchantApi.updateOpeningHours(payload),
    onSuccess: (data) => queryClient.setQueryData(MERCHANT_QUERY_KEYS.openingHours, data),
  });

  return {
    profile: profileQuery.data,
    location: locationQuery.data,
    openingHours: openingHoursQuery.data,

    isLoading: profileQuery.isLoading || locationQuery.isLoading || openingHoursQuery.isLoading,
    // Lỗi 404 (chưa có hồ sơ) không tính là lỗi tải — màn hình hiện form trống cho người bán nhập.
    /** Chưa có hồ sơ quán: BE chỉ tạo khi admin duyệt đơn đăng ký bán hàng. */
    profileMissing: isProfileMissing(profileQuery.error),
    isError: loadError !== null,
    error: loadError,

    refetch: () =>
      Promise.all([profileQuery.refetch(), locationQuery.refetch(), openingHoursQuery.refetch()]),

    updateProfile: updateProfileMutation.mutateAsync,
    updateLocation: updateLocationMutation.mutateAsync,
    updateOpeningHours: updateOpeningHoursMutation.mutateAsync,
    isSaving:
      updateProfileMutation.isPending ||
      updateLocationMutation.isPending ||
      updateOpeningHoursMutation.isPending,
  };
}

export function useMerchantCurrentUser() {
  return useQuery({
    queryKey: MERCHANT_QUERY_KEYS.currentUser,
    queryFn: merchantApi.getCurrentUser,
  });
}
