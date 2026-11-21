import { useEffect, useState } from 'react';

import { AppText } from '@/components/ui/app-text';

// Máy chủ chạy trên gói miễn phí của Render, ngủ khi vắng khách và mất khoảng 30–50 giây để dậy.
// Không giải thích thì người dùng tưởng app treo và thoát ra.
const SLOW_AFTER_MS = 6000;

/** Dòng giải thích hiện ra khi đã chờ quá vài giây; trước đó không chiếm chỗ. */
export function SlowLoadingHint() {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);

    return () => clearTimeout(timer);
  }, []);

  if (!isSlow) return null;

  return (
    <AppText
      accessibilityLiveRegion="polite"
      align="center"
      tone="textSecondary"
      variant="footnote"
    >
      Máy chủ đang khởi động, lần mở đầu có thể mất tới 30 giây. Bạn chờ chút nhé.
    </AppText>
  );
}
