import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import type { PagedResponse } from '@/types/api';

/** Khớp AdminUserResponse của backend (GET /admin/users). */
export type AdminUserDto = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  locked: boolean;
  lockReason: string | null;
};

/** Backend chặn size ở 50 (@Max(50)). */
const PAGE_SIZE = 20;
const QUERY_KEY = ['admin', 'users'];

export function useAdminUsers(keyword: string) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEY, keyword],
    queryFn: ({ pageParam }) => {
      const query = new URLSearchParams({ page: String(pageParam), size: String(PAGE_SIZE) });
      if (keyword) query.set('keyword', keyword);

      return apiRequest<PagedResponse<AdminUserDto>>(`/admin/users?${query.toString()}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

/** Khoá và mở khoá đều bắt buộc kèm lý do (tối đa 500 ký tự). */
export function useSetUserLocked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, lock, reason }: { userId: string; lock: boolean; reason: string }) =>
      apiRequest<AdminUserDto>(`/admin/users/${userId}/${lock ? 'lock' : 'unlock'}`, {
        method: 'POST',
        body: { reason },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
