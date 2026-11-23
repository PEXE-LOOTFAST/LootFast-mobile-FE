import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

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

// Trên web React Query tự biết tab được mở lại; trên máy thì phải báo theo AppState. Nhờ vậy quay lại
// app là dữ liệu cũ (đơn, thông báo) được tải lại ngay, và các truy vấn tự làm mới định kỳ tạm dừng
// khi app chạy nền thay vì tốn pin và dữ liệu.
if (Platform.OS !== 'web') {
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener('change', (state) => {
      handleFocus(state === 'active');
    });

    return () => subscription.remove();
  });
}
