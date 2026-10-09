import type { IconMap } from '@/components/ui/icon';

// Key trùng với tên file route trong src/app/seller. SF Symbols chỉ có trên iOS,
// Android và web dùng Material Symbols — mỗi icon phải khai báo đủ cả hai tên.
export const SellerTabIcons = {
  reports: { ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' },
  orders: { ios: 'list.clipboard', android: 'list_alt', web: 'list_alt' },
  'new-deal': { ios: 'plus', android: 'add', web: 'add' },
  'shop-info': { ios: 'storefront', android: 'storefront', web: 'storefront' },
  settings: { ios: 'slider.horizontal.3', android: 'tune', web: 'tune' },
} satisfies IconMap;

/** Nút giữa nổi lên trên thanh tab thay vì hiển thị như một mục thường. */
export const SELLER_CENTER_TAB = 'new-deal';
