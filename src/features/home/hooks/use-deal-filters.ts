import { useState } from 'react';

import { LOW_STOCK_THRESHOLD } from '@/features/home/constants/deals';
import type { Deal, DealCategoryId } from '@/features/home/types';

function normalizeText(value: string) {
  // Người dùng hay gõ không dấu ("com tam") — bỏ dấu ở cả hai phía để vẫn khớp "Cơm tấm".
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
}

export function useDealFilters(deals: Deal[]) {
  const [categoryId, setCategoryId] = useState<DealCategoryId>('all');
  const [query, setQuery] = useState('');

  const keyword = normalizeText(query);
  const isFiltering = categoryId !== 'all' || keyword.length > 0;

  const filteredDeals = deals
    .filter((deal) => categoryId === 'all' || deal.categoryId === categoryId)
    .filter(
      (deal) => !keyword || normalizeText(`${deal.name} ${deal.store.name}`).includes(keyword),
    )
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const lowStockDeals = deals
    .filter((deal) => deal.remaining <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.remaining - b.remaining);

  const resetFilters = () => {
    setCategoryId('all');
    setQuery('');
  };

  return {
    categoryId,
    setCategoryId,
    query,
    setQuery,
    isFiltering,
    filteredDeals,
    lowStockDeals,
    resetFilters,
  };
}
