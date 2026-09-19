import { useState } from 'react';

import {
  DEFAULT_DISCOUNT,
  DEFAULT_RADIUS_KM,
  PICKUP_SPLIT_TIME,
} from '@/features/home/constants/deals';
import type { Deal, DealCategoryId, DiscountFilter, PickupFilter } from '@/features/home/types';
import { normalizeText } from '@/lib/text';

function getDiscountPercent(deal: Deal) {
  if (deal.originalPrice <= 0) return 0;

  return Math.round((1 - deal.price / deal.originalPrice) * 100);
}

function matchesPickup(deal: Deal, pickup: PickupFilter) {
  if (pickup === 'before-20') return deal.pickupWindow.start < PICKUP_SPLIT_TIME;
  if (pickup === 'after-20') return deal.pickupWindow.end > PICKUP_SPLIT_TIME;

  return true;
}

export function useDealFilters(deals: Deal[]) {
  const [categoryId, setCategoryId] = useState<DealCategoryId>('all');
  const [query, setQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [minDiscount, setMinDiscount] = useState<DiscountFilter>(DEFAULT_DISCOUNT);
  const [pickup, setPickup] = useState<PickupFilter>('any');

  const keyword = normalizeText(query);
  const hasAdvancedFilters = minDiscount !== DEFAULT_DISCOUNT || pickup !== 'any';
  // Bán kính là bối cảnh "gần bạn" chứ không phải bộ lọc, nên không tính vào đây.
  const isFiltering = categoryId !== 'all' || keyword.length > 0 || hasAdvancedFilters;

  const filteredDeals = deals
    .filter((deal) => deal.distanceKm <= radiusKm)
    .filter((deal) => categoryId === 'all' || deal.categoryId === categoryId)
    .filter(
      (deal) => !keyword || normalizeText(`${deal.name} ${deal.store.name}`).includes(keyword),
    )
    .filter((deal) => getDiscountPercent(deal) >= minDiscount)
    .filter((deal) => matchesPickup(deal, pickup))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const resetFilters = () => {
    setCategoryId('all');
    setQuery('');
    setRadiusKm(DEFAULT_RADIUS_KM);
    setMinDiscount(DEFAULT_DISCOUNT);
    setPickup('any');
  };

  return {
    categoryId,
    setCategoryId,
    query,
    setQuery,
    radiusKm,
    setRadiusKm,
    minDiscount,
    setMinDiscount,
    pickup,
    setPickup,
    hasAdvancedFilters,
    isFiltering,
    filteredDeals,
    resetFilters,
  };
}
