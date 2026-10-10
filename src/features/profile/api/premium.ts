import { apiRequest } from '@/lib/api-client';

// Khớp SavedFilterService.Benefits của backend (GET /api/v1/buyers/me/premium/benefits).
export type BuyerBenefitsResponse = {
  savedFilters: boolean;
  savedFilterLimit: number;
};

export function getBuyerBenefits() {
  return apiRequest<BuyerBenefitsResponse>('/buyers/me/premium/benefits');
}
