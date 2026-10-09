import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';

/** Khớp CategoryView của backend. `code` là giá trị lưu vào businessCategory của quán. */
export type ShopCategoryDto = {
  code: string;
  name: string;
  enabled: boolean;
  sortOrder: number;
};

type PagedCategories = { items: ShopCategoryDto[] };

// Backend chỉ trả nhóm món đang bật và chỉ cho phép đăng deal theo các mã này, nên chip chọn
// nhóm món phải lấy từ đây thay vì danh sách tự đặt trong app.
export function useShopCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiRequest<PagedCategories>('/categories?size=50'),
    select: (page) => [...page.items].sort((a, b) => a.sortOrder - b.sortOrder),
    staleTime: 5 * 60 * 1000,
  });
}
