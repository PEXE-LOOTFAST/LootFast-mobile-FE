export type DayOfWeek =
  'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type MerchantProfileDto = {
  storeName: string;
  description: string | null;
  businessCategory: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string | null;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateMerchantProfilePayload = {
  storeName: string;
  description?: string;
  businessCategory: string;
  contactEmail: string;
  contactPhone: string;
};

export type MerchantLocationDto = {
  addressLine: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type UpdateMerchantLocationPayload = {
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
};

export type OpeningHourSlotDto = {
  dayOfWeek: DayOfWeek;
  opensAt: string;
  closesAt: string;
};

export type MerchantOpeningHoursDto = {
  slots: OpeningHourSlotDto[];
};

export type UpdateOpeningHoursPayload = {
  slots: OpeningHourSlotDto[];
};

/** Khớp MerchantImageResponse của backend. */
export type MerchantImageDto = {
  imageType: 'LOGO' | 'COVER';
  url: string;
};

export type CurrentUserDto = {
  publicId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  roles: string[];
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
};
