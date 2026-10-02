import type { ChatMessage } from '@/features/home/types';

/**
 * Trợ lý chưa có endpoint ở backend. Trước đây màn này trả lời theo từ khoá viết cứng trong
 * app — nghe như trợ lý thật nhưng không đọc dữ liệu nào, nên đã gỡ. Panel giờ nói thẳng là
 * tính năng chưa bật và khoá ô nhập, thay vì trả lời bịa.
 *
 * Khi có API: đổi `messages` thành state, `send` thành mutation gọi endpoint trợ lý, và trả
 * `isAvailable: true` để panel mở lại ô nhập.
 */
const UNAVAILABLE_NOTICE: ChatMessage = {
  id: 'assistant-unavailable',
  role: 'assistant',
  text: 'Trợ lý chưa hoạt động: backend chưa có API cho phần này. Bạn vẫn có thể tìm deal bằng ô tìm kiếm và bộ lọc ở trang chủ nhé.',
};

export function useAssistantChat() {
  return {
    messages: [UNAVAILABLE_NOTICE],
    isReplying: false,
    isAvailable: false,
    send: () => {},
    reset: () => {},
  };
}
