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

export const MERCHANT_QUERY_KEYS = {
  profile: ['merchant', 'profile'] as const,
  location: ['merchant', 'location'] as const,
  openingHours: ['merchant', 'openingHours'] as const,
  currentUser: ['merchant', 'currentUser'] as const,
};

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
  });

  const locationQuery = useQuery<MerchantLocationDto>({
    queryKey: MERCHANT_QUERY_KEYS.location,
    queryFn: merchantApi.getLocation,
  });

  const openingHoursQuery = useQuery<MerchantOpeningHoursDto>({
    queryKey: MERCHANT_QUERY_KEYS.openingHours,
    queryFn: merchantApi.getOpeningHours,
  });

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
    isError: profileQuery.isError || locationQuery.isError || openingHoursQuery.isError,
    error: profileQuery.error ?? locationQuery.error ?? openingHoursQuery.error,

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
