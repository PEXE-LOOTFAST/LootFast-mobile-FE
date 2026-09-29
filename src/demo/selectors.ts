import { canCancelOrder, hoursAgoToDate } from '@/demo/store';
import type { DemoDeal, DemoOrder, DemoState, DemoStore } from '@/demo/types';
import { DEMO_BUYER_NAME, DEMO_SELLER_STORE_ID } from '@/demo/world';
import type {
  AdminAlert,
  AdminStat,
  DailyPlatformSales,
  ManagedAccount,
  StoreApplication,
} from '@/features/admin/types';
import type { Deal } from '@/features/home/types';
import { WEEKDAY_LABELS } from '@/features/order/constants/order-status';
import type { Order, OrderStatus } from '@/features/order/types';
import type {
  SellerDeal,
  SellerOrder,
  SellerOrderStatus,
  SellerOwner,
  SellerPlan,
  SellerShop,
} from '@/features/seller/types';
import { formatPrice } from '@/lib/format';

// Đổi từ thế giới demo sang đúng shape mà các màn hình đang dùng. Nhờ lớp này, việc gộp dữ
// liệu về một nguồn không bắt component nào phải đổi kiểu dữ liệu.

const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (value: number) => value.toString().padStart(2, '0');

const remainingOf = (deal: DemoDeal) => Math.max(deal.portionsTotal - deal.portionsSold, 0);

/** Quán đang bán được cho khách: hồ sơ đã duyệt và không bị quản trị khoá. */
const isOnMarket = (store: DemoStore) => store.approval === 'approved' && !store.isLocked;

function storeOf(state: DemoState, storeId: string) {
  return state.stores.find((store) => store.id === storeId);
}

function dealOf(state: DemoState, dealId: string) {
  return state.deals.find((deal) => deal.id === dealId);
}

export function placedAt(order: DemoOrder): Date {
  return hoursAgoToDate(order.placedHoursAgo);
}

/** "20:30 hôm nay" / "19:00 hôm qua" / "19:00 · 24/09" — nhãn giờ nhận hiển thị cho khách. */
function pickupLabelOf(order: DemoOrder): string {
  const placed = placedAt(order);
  const days = Math.round((Date.now() - placed.getTime()) / DAY_MS);

  if (days <= 0) return `${order.pickupAt} hôm nay`;
  if (days === 1) return `${order.pickupAt} hôm qua`;

  return `${order.pickupAt} · ${pad(placed.getDate())}/${pad(placed.getMonth() + 1)}`;
}

// ---------------------------------------------------------------- Người mua

/** Deal người mua nhìn thấy: chỉ deal đang chạy của quán đã duyệt và không bị khoá. */
export function selectBuyerDeals(state: DemoState): Deal[] {
  return state.deals
    .filter((deal) => deal.status === 'running')
    .flatMap((deal) => {
      const store = storeOf(state, deal.storeId);
      if (!store || !isOnMarket(store)) return [];

      return [
        {
          id: deal.id,
          name: deal.name,
          categoryId: deal.categoryId,
          store: {
            name: store.name,
            rating: store.rating,
            isVerified: store.isVerified,
            address: store.address,
          },
          imageUrl: deal.imageUrl,
          emoji: deal.emoji,
          price: deal.price,
          originalPrice: deal.originalPrice,
          pickupWindow: deal.pickupWindow,
          distanceKm: store.distanceKm,
          remaining: remainingOf(deal),
        },
      ];
    });
}

export function selectBuyerDeal(state: DemoState, dealId: string): Deal | undefined {
  return selectBuyerDeals(state).find((deal) => deal.id === dealId);
}

// Người bán đánh dấu "đã soạn xong" thì người mua thấy là Sẵn sàng nhận; đơn khách không
// tới lấy được gộp vào Đã hủy vì với người mua thì kết quả là như nhau.
const BUYER_STATUS: Record<DemoOrder['status'], OrderStatus> = {
  pending: 'pending',
  confirmed: 'confirmed',
  ready: 'ready',
  completed: 'completed',
  cancelled: 'cancelled',
  'no-show': 'cancelled',
};

/** Đơn của người mua đang đăng nhập, mới nhất lên đầu. */
export function selectBuyerOrders(state: DemoState): Order[] {
  return state.orders
    .filter((order) => order.customerName === DEMO_BUYER_NAME)
    .flatMap((order) => {
      const deal = dealOf(state, order.dealId);
      const store = deal && storeOf(state, deal.storeId);
      if (!deal || !store) return [];

      return [
        {
          id: order.id,
          code: order.code,
          status: BUYER_STATUS[order.status],
          storeName: store.name,
          storeAddress: store.address,
          emoji: deal.emoji,
          itemName: deal.name,
          quantity: order.quantity,
          price: deal.price * order.quantity,
          originalPrice: deal.originalPrice * order.quantity,
          pickupLabel: pickupLabelOf(order),
          completedAt: order.status === 'completed' ? placedAt(order).toISOString() : undefined,
          canCancel: canCancelOrder(order.status),
        },
      ];
    })
    .sort((a, b) => b.code.localeCompare(a.code));
}

// ---------------------------------------------------------------- Người bán

export function selectSellerStore(state: DemoState): DemoStore {
  const store = storeOf(state, DEMO_SELLER_STORE_ID);
  if (!store) throw new Error('Thiếu quán của tài khoản người bán demo');

  return store;
}

export function selectSellerShop(state: DemoState): SellerShop {
  const store = selectSellerStore(state);

  return {
    name: store.name,
    isVerified: store.isVerified,
    email: store.ownerEmail,
    address: store.address,
    categories: store.shopCategories,
    openingHours: store.openingHours,
  };
}

export function selectSellerOwner(state: DemoState): SellerOwner {
  const store = selectSellerStore(state);

  return {
    fullName: store.ownerName,
    email: store.ownerEmail,
    phone: store.phone.replace(/\s/g, ''),
  };
}

/** Gói dịch vụ của quán demo. Số lượt đã dùng đếm theo deal quán đã đăng. */
export function selectSellerPlan(state: DemoState): SellerPlan {
  const dealCount = state.deals.filter((deal) => deal.storeId === DEMO_SELLER_STORE_ID).length;

  return { name: 'Miễn phí', dealPostsUsed: dealCount, dealPostsLimit: 10 };
}

export function selectSellerDeals(state: DemoState): SellerDeal[] {
  return state.deals
    .filter((deal) => deal.storeId === DEMO_SELLER_STORE_ID)
    .map((deal) => ({
      id: deal.id,
      name: deal.name,
      emoji: deal.emoji,
      imageUrl: deal.imageUrl,
      status: deal.status,
      portionsTotal: deal.portionsTotal,
      portionsSold: deal.portionsSold,
      price: deal.price,
      originalPrice: deal.originalPrice,
      pickupWindow: deal.pickupWindow,
      endedReason: deal.endedReason,
    }));
}

// Với người bán, đơn "đã soạn xong" vẫn là đơn đã xác nhận đang chờ khách tới lấy.
const SELLER_STATUS: Record<DemoOrder['status'], SellerOrderStatus> = {
  pending: 'pending',
  confirmed: 'confirmed',
  ready: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  'no-show': 'no-show',
};

export function selectSellerOrders(state: DemoState): SellerOrder[] {
  const dealIds = new Set(
    state.deals.filter((deal) => deal.storeId === DEMO_SELLER_STORE_ID).map((deal) => deal.id),
  );

  return state.orders
    .filter((order) => dealIds.has(order.dealId))
    .flatMap((order) => {
      const deal = dealOf(state, order.dealId);
      if (!deal) return [];

      return [
        {
          id: order.id,
          code: order.code,
          status: SELLER_STATUS[order.status],
          customerName: order.customerName,
          itemName: deal.name,
          quantity: order.quantity,
          total: deal.price * order.quantity,
          pickupLabel: pickupLabelOf(order),
          createdAt: placedAt(order).toISOString(),
        },
      ];
    });
}

// ---------------------------------------------------------------- Quản trị

export function selectStoreApplications(state: DemoState): StoreApplication[] {
  return state.stores.map((store) => ({
    id: store.id,
    storeName: store.name,
    category: store.categoryLabel,
    ownerName: store.ownerName,
    phone: store.phone,
    address: store.address,
    submittedAt: toDateKey(store.submittedDaysAgo),
    hasFoodSafetyCert: store.hasFoodSafetyCert,
    status: store.approval,
  }));
}

/** "YYYY-MM-DD" của N ngày trước — hồ sơ luôn trông như vừa gửi gần đây. */
function toDateKey(daysAgo: number): string {
  const date = new Date(Date.now() - daysAgo * DAY_MS);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Danh sách quản lý: quán đã duyệt cộng với người mua đã từng đặt đơn. Khoá một quán ở đây
 * làm deal của quán rời sàn người mua ngay.
 */
export function selectManagedAccounts(state: DemoState): ManagedAccount[] {
  const stores: ManagedAccount[] = state.stores
    .filter((store) => store.approval === 'approved')
    .map((store) => ({
      id: store.id,
      kind: 'store',
      name: store.name,
      detail: store.district,
      status: store.isLocked ? 'locked' : 'active',
    }));

  const dealCountByCustomer = new Map<string, number>();
  for (const order of state.orders) {
    if (order.status === 'cancelled') continue;
    dealCountByCustomer.set(
      order.customerName,
      (dealCountByCustomer.get(order.customerName) ?? 0) + order.quantity,
    );
  }

  const users: ManagedAccount[] = [...dealCountByCustomer.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      id: `user-${name}`,
      kind: 'user',
      name,
      detail: `${count} deal`,
      status: 'active',
    }));

  return [...stores, ...users];
}

const isPaid = (order: DemoOrder) =>
  order.status === 'confirmed' || order.status === 'ready' || order.status === 'completed';

/** Số liệu toàn sàn, tính thẳng từ dữ liệu demo nên duyệt hay khoá quán là thấy đổi ngay. */
export function selectAdminStats(state: DemoState): AdminStat[] {
  const activeStores = state.stores.filter(isOnMarket).length;
  const pendingStores = state.stores.filter((store) => store.approval === 'pending').length;
  const customers = new Set(state.orders.map((order) => order.customerName)).size;
  const rescued = state.orders
    .filter((order) => order.status === 'completed')
    .reduce((sum, order) => sum + order.quantity, 0);
  const revenue = state.orders.filter(isPaid).reduce((sum, order) => {
    const deal = dealOf(state, order.dealId);

    return deal ? sum + deal.price * order.quantity : sum;
  }, 0);

  return [
    {
      id: 'stores',
      label: 'Quán hoạt động',
      value: `${activeStores}`,
      caption: `${pendingStores} hồ sơ chờ duyệt`,
      icon: 'store',
      tone: 'primary',
    },
    {
      id: 'users',
      label: 'Người dùng',
      value: `${customers}`,
      caption: 'đã từng đặt deal',
      icon: 'people',
      tone: 'primary',
    },
    {
      id: 'rescued',
      label: 'Suất đã cứu',
      value: `${rescued}`,
      caption: 'từ đơn đã hoàn thành',
      icon: 'food',
      tone: 'primary',
    },
    {
      id: 'revenue',
      label: 'Doanh thu sàn',
      value: formatPrice(revenue),
      caption: 'đơn đã xác nhận',
      icon: 'wallet',
      tone: 'accent',
    },
  ];
}

/** Số suất bán ra toàn sàn trong 7 ngày gần nhất, hôm nay nằm cuối trục. */
export function selectPlatformSales(state: DemoState): DailyPlatformSales[] {
  const paid = state.orders.filter(isPaid);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * DAY_MS);
    const key = date.toDateString();
    const count = paid
      .filter((order) => placedAt(order).toDateString() === key)
      .reduce((sum, order) => sum + order.quantity, 0);

    return { key, label: WEEKDAY_LABELS[date.getDay()] ?? '', count };
  });
}

/** Mức tăng của ba ngày gần nhất so với ba ngày trước đó, tính theo phần trăm. */
export function selectPlatformSalesGrowth(state: DemoState): number {
  const daily = selectPlatformSales(state);
  const sum = (days: DailyPlatformSales[]) => days.reduce((total, day) => total + day.count, 0);
  const previous = sum(daily.slice(1, 4));
  const recent = sum(daily.slice(4));

  if (previous === 0) return recent > 0 ? 100 : 0;

  return Math.round(((recent - previous) / previous) * 100);
}

/** Cảnh báo cho quản trị, sinh từ tình trạng thật của hồ sơ quán và tài khoản đang bị khoá. */
export function selectAdminAlerts(state: DemoState): AdminAlert[] {
  const missingCert = state.stores.filter(
    (store) => store.approval === 'pending' && !store.hasFoodSafetyCert,
  );
  const [newest] = [...state.stores]
    .filter((store) => store.approval === 'pending')
    .sort((a, b) => a.submittedDaysAgo - b.submittedDaysAgo);
  const lockedCount = state.stores.filter((store) => store.isLocked).length;
  const alerts: AdminAlert[] = [];

  if (missingCert.length > 0) {
    alerts.push({
      id: 'alert-cert',
      kind: 'warning',
      message: `${missingCert.length} quán chờ duyệt chưa nộp giấy ATTP`,
      timeLabel: '10 phút trước',
    });
  }
  if (newest) {
    alerts.push({
      id: 'alert-new',
      kind: 'info',
      message: `${newest.name} vừa gửi hồ sơ đăng ký`,
      timeLabel:
        newest.submittedDaysAgo <= 1 ? '1 giờ trước' : `${newest.submittedDaysAgo} ngày trước`,
    });
  }
  if (lockedCount > 0) {
    alerts.push({
      id: 'alert-locked',
      kind: 'warning',
      message: `${lockedCount} quán đang bị khoá, deal không hiển thị với khách`,
      timeLabel: 'Hôm nay',
    });
  }

  return alerts;
}
