import type {
  DemoDeal,
  DemoOrderStatus,
  DemoState,
  DemoStore,
  DemoStoreApproval,
} from '@/demo/types';
import { DEMO_BUYER_NAME, DEMO_SELLER_STORE_ID, createInitialDemoState } from '@/demo/world';

/**
 * Kho dữ liệu demo dùng chung cho cả ba vai trò, theo đúng cách `auth-session` đang làm:
 * state nằm trong bộ nhớ, ai quan tâm thì subscribe. Nhờ vậy thao tác ở một vai trò hiện
 * ngay ở vai trò khác trong cùng một phiên — người mua đặt deal thì người bán thấy đơn,
 * quản trị duyệt quán thì deal của quán lên sàn người mua.
 *
 * Tắt hoặc tải lại app là mọi thứ quay về dữ liệu ban đầu, nên chạy lại kịch bản demo
 * chỉ cần reload.
 */

/**
 * Mốc thời gian của phiên demo, chốt lúc nạp module. Mọi `placedHoursAgo` quy ra ngày giờ
 * thật từ mốc này, nên biểu đồ 7 ngày và các thẻ "hôm nay" luôn có dữ liệu bất kể chạy
 * demo vào ngày nào.
 */
export const DEMO_EPOCH = Date.now();

const HOUR_MS = 60 * 60 * 1000;

export function hoursAgoToDate(hours: number): Date {
  return new Date(DEMO_EPOCH - hours * HOUR_MS);
}

export function daysAgoToDate(days: number): Date {
  return hoursAgoToDate(days * 24);
}

let state: DemoState = createInitialDemoState();
const listeners = new Set<() => void>();

function setState(next: Partial<DemoState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function getDemoState(): DemoState {
  return state;
}

export function subscribeDemo(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const remainingOf = (deal: DemoDeal) => Math.max(deal.portionsTotal - deal.portionsSold, 0);

function mapDeal(dealId: string, update: (deal: DemoDeal) => DemoDeal) {
  setState({ deals: state.deals.map((deal) => (deal.id === dealId ? update(deal) : deal)) });
}

function mapStore(storeId: string, update: (store: DemoStore) => DemoStore) {
  setState({ stores: state.stores.map((store) => (store.id === storeId ? update(store) : store)) });
}

/** Mã đơn tăng dần trong phiên, không đụng dải mã của dữ liệu có sẵn. */
let nextOrderNumber = 7800;

/**
 * Người mua đặt giữ một deal. Đơn mới ở trạng thái chờ quán xác nhận và số phần bán ra
 * tăng ngay, nên trang chủ, tab Đơn hàng và khu người bán cùng cập nhật.
 */
export function placeOrder(dealId: string, quantity = 1): string {
  const deal = state.deals.find((item) => item.id === dealId);
  if (!deal) throw new Error(`Không tìm thấy deal ${dealId}`);

  const bought = Math.min(quantity, remainingOf(deal));
  const code = `#LF${nextOrderNumber++}`;

  setState({
    deals: state.deals.map((item) =>
      item.id === dealId ? { ...item, portionsSold: item.portionsSold + bought } : item,
    ),
    orders: [
      {
        id: `order-${code.slice(1)}`,
        code,
        dealId,
        customerName: DEMO_BUYER_NAME,
        quantity: Math.max(bought, 1),
        status: 'pending',
        placedHoursAgo: 0,
        pickupAt: deal.pickupWindow.end,
      },
      ...state.orders,
    ],
  });

  return code;
}

/**
 * Đơn chỉ huỷ được khi quán chưa soạn xong món: sau khi chuyển sang "Sẵn sàng nhận" thì
 * phần ăn đã được chuẩn bị, huỷ lúc đó chính là phần thức ăn bị bỏ đi mà app muốn tránh.
 */
export function canCancelOrder(status: DemoOrderStatus): boolean {
  return status === 'pending' || status === 'confirmed';
}

/**
 * Người mua huỷ đơn. Suất đã giữ được trả lại cho deal nên khách khác đặt được ngay, và
 * khu người bán thấy đơn chuyển sang đã huỷ cùng lúc.
 */
export function cancelOrder(orderId: string) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order || !canCancelOrder(order.status)) return;

  setState({
    orders: state.orders.map((item) =>
      item.id === orderId ? { ...item, status: 'cancelled' } : item,
    ),
    deals: state.deals.map((deal) =>
      deal.id === order.dealId
        ? { ...deal, portionsSold: Math.max(deal.portionsSold - order.quantity, 0) }
        : deal,
    ),
  });
}

export function setOrderStatus(orderId: string, status: DemoOrderStatus) {
  setState({
    orders: state.orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
  });
}

/** Quản trị duyệt hoặc từ chối hồ sơ quán. Quán được duyệt thì deal của họ lên sàn ngay. */
export function setStoreApproval(storeId: string, approval: DemoStoreApproval) {
  mapStore(storeId, (store) => ({ ...store, approval }));
}

/** Quản trị khoá hoặc mở khoá quán. Quán bị khoá thì deal rời sàn nhưng hồ sơ vẫn còn. */
export function setStoreLocked(storeId: string, isLocked: boolean) {
  mapStore(storeId, (store) => ({ ...store, isLocked }));
}

/** Người bán chỉnh số phần còn lại của một deal; người mua thấy tồn kho đổi theo. */
export function setDealPortionsLeft(dealId: string, portionsLeft: number) {
  mapDeal(dealId, (deal) => ({
    ...deal,
    portionsSold: Math.max(deal.portionsTotal - Math.max(portionsLeft, 0), 0),
  }));
}

export type NewSellerDealInput = {
  name: string;
  emoji: string;
  price: number;
  originalPrice: number;
  portionsTotal: number;
  pickupWindow: { start: string; end: string };
};

/** Người bán đăng deal mới; deal xuất hiện trên sàn người mua ngay trong phiên demo. */
export function addSellerDeal(input: NewSellerDealInput): DemoDeal {
  const store = state.stores.find((item) => item.id === DEMO_SELLER_STORE_ID);
  const deal: DemoDeal = {
    id: `deal-moi-${Date.now()}`,
    storeId: DEMO_SELLER_STORE_ID,
    categoryId: 'rice-noodle',
    imageUrl:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=70&auto=format&fit=crop',
    portionsSold: 0,
    status: 'running',
    ...input,
  };

  setState({ deals: [deal, ...state.deals] });
  // Quán mới đăng deal thì coi như đang hoạt động trở lại, tránh deal đăng xong không thấy đâu.
  if (store?.isLocked) setStoreLocked(store.id, false);

  return deal;
}

/** Người bán sửa hồ sơ quán ở màn Hồ sơ quán khi không có backend. */
export function updateSellerStore(patch: Partial<DemoStore>) {
  mapStore(DEMO_SELLER_STORE_ID, (store) => ({ ...store, ...patch }));
}
