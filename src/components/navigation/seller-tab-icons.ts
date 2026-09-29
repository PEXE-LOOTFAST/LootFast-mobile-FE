import type { IconMap } from '@/components/ui/icon';

// Key trùng với tên file route trong src/app/seller. SF Symbols chỉ có trên iOS,
// Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const SellerTabIcons = {
  index: { ios: 'square.grid.2x2', android: 'dashboard', web: 'dashboard' },
  orders: { ios: 'list.clipboard', android: 'list_alt', web: 'list_alt' },
  'new-deal': { ios: 'plus', android: 'add', web: 'add' },
  reports: { ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' },
  shop: { ios: 'storefront', android: 'storefront', web: 'storefront' },
} satisfies IconMap;

/** Nút giữa nổi lên trên thanh tab thay vì hiển thị như một mục thường. */
export const SELLER_CENTER_TAB = 'new-deal';
