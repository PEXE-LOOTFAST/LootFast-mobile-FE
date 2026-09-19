import { useEffect, useState } from 'react';

import type { ChatMessage } from '@/features/home/types';
import { normalizeText } from '@/lib/text';

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  text: 'Xin chào! Mình là trợ lý LootFast. Bạn cần hỗ trợ gì về deal hay đơn hàng không?',
};

const REPLY_DELAY_MS = 700;

// Chưa có API trợ lý nên trả lời theo từ khoá (đã bỏ dấu). Khi có API, thay hàm này bằng mutation.
function replyTo(question: string) {
  const words = normalizeText(question).split(/\s+/);
  const mentions = (...keywords: string[]) => keywords.some((keyword) => words.includes(keyword));

  if (mentions('don', 'order')) {
    return 'Bạn xem các đơn đang giữ ở tab Đơn hàng nhé. Nhớ đến lấy món đúng khung giờ để cửa hàng phục vụ nhanh nhất!';
  }
  if (mentions('gio', 'lay', 'mo', 'dong')) {
    return 'Mỗi deal có khung giờ lấy riêng, hiện ngay trên thẻ deal. Bạn có thể lọc "Trước 20h" hoặc "Sau 20h" ở nút bộ lọc cạnh mục Gợi ý gần bạn.';
  }
  if (mentions('deal', 'giam', 're', 'uu', 'khuyen')) {
    return 'Quanh bạn đang có nhiều deal giảm sâu. Thử chọn "Giảm ≥50%" trong bộ lọc để xem những món hời nhất nhé!';
  }

  return 'Mình đã ghi nhận câu hỏi. Hiện mình hỗ trợ tốt nhất về deal gần bạn, khung giờ lấy và đơn hàng — bạn hỏi cụ thể hơn giúp mình nhé!';
}

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (pendingQuestion === null) return;

    const timeout = setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `assistant-${current.length}`, role: 'assistant', text: replyTo(pendingQuestion) },
      ]);
      setPendingQuestion(null);
    }, REPLY_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [pendingQuestion]);

  const send = (rawText: string) => {
    const text = rawText.trim();
    if (!text || pendingQuestion !== null) return;

    setMessages((current) => [...current, { id: `user-${current.length}`, role: 'user', text }]);
    setPendingQuestion(text);
  };

  const reset = () => {
    setPendingQuestion(null);
    setMessages([GREETING]);
  };

  return { messages, isReplying: pendingQuestion !== null, send, reset };
}
