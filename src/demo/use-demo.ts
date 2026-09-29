import { useMemo, useSyncExternalStore } from 'react';

import {
  selectAdminAlerts,
  selectAdminStats,
  selectBuyerDeal,
  selectBuyerDeals,
  selectBuyerOrders,
  selectManagedAccounts,
  selectPlatformSales,
  selectPlatformSalesGrowth,
  selectSellerDeals,
  selectSellerOrders,
  selectSellerOwner,
  selectSellerPlan,
  selectSellerShop,
  selectStoreApplications,
} from '@/demo/selectors';
import { getDemoState, subscribeDemo } from '@/demo/store';
import type { DemoState } from '@/demo/types';

/** State thô của phiên demo. Component nào subscribe cũng vẽ lại khi có vai trò khác thao tác. */
export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribeDemo, getDemoState, getDemoState);
}

export function useBuyerDeals() {
  const state = useDemoState();

  return useMemo(() => selectBuyerDeals(state), [state]);
}

export function useBuyerDeal(dealId: string | undefined) {
  const state = useDemoState();

  return useMemo(() => (dealId ? selectBuyerDeal(state, dealId) : undefined), [state, dealId]);
}

export function useBuyerOrders() {
  const state = useDemoState();

  return useMemo(() => selectBuyerOrders(state), [state]);
}

export function useSellerDemo() {
  const state = useDemoState();

  return useMemo(
    () => ({
      shop: selectSellerShop(state),
      owner: selectSellerOwner(state),
      plan: selectSellerPlan(state),
      deals: selectSellerDeals(state),
      orders: selectSellerOrders(state),
    }),
    [state],
  );
}

export function useAdminDemo() {
  const state = useDemoState();

  return useMemo(
    () => ({
      applications: selectStoreApplications(state),
      accounts: selectManagedAccounts(state),
      stats: selectAdminStats(state),
      dailySales: selectPlatformSales(state),
      salesGrowth: selectPlatformSalesGrowth(state),
      alerts: selectAdminAlerts(state),
    }),
    [state],
  );
}
