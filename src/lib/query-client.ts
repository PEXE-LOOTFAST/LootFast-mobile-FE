import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Mạng di động hay chập chờn nên vẫn retry, nhưng chỉ 1 lần —
      // mặc định 3 lần khiến người dùng chờ khá lâu mới thấy thông báo lỗi.
      retry: 1,
    },
  },
});
