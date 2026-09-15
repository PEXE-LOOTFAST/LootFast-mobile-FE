import { useState } from 'react';

import { LOW_STOCK_THRESHOLD } from '@/features/home/constants/deals';
import type { Deal, DealCategoryId } from '@/features/home/types';

// Dải U+0300–U+036F là các dấu thanh/dấu phụ tách ra sau khi normalize('NFD').
const COMBINING_MARKS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  'g',
);

function normalizeText(value: string) {
  // Người dùng hay gõ không dấu ("com tam") — bỏ dấu ở cả hai phía để vẫn khớp "Cơm tấm".
  return value
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();
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
