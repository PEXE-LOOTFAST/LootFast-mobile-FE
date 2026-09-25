import { useSyncExternalStore } from 'react';

import {
  getSellerProfile,
  subscribeSellerProfile,
} from '@/features/seller/data/seller-profile-store';

export function useSellerProfile() {
  return useSyncExternalStore(subscribeSellerProfile, getSellerProfile, getSellerProfile);
}
