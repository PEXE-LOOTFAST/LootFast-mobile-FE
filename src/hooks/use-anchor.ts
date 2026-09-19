import { useCallback, useRef, useState } from 'react';
import type { View } from 'react-native';

import type { PopoverAnchor } from '@/components/ui/popover';

// Đo vị trí phần tử neo ngay lúc mở (không đo sẵn) để menu vẫn bám đúng chỗ sau khi cuộn trang.
export function useAnchor() {
  const ref = useRef<View>(null);
  const [anchor, setAnchor] = useState<PopoverAnchor | null>(null);

  const open = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => setAnchor({ x, y, width, height }));
  }, []);

  const close = useCallback(() => setAnchor(null), []);

  return { ref, anchor, open, close };
}
