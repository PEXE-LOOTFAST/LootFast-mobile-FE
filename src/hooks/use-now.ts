import { useEffect, useState } from 'react';

/** Mốc thời gian hiện tại, tự cập nhật theo chu kỳ để chữ đếm ngược và khung giờ không bị cũ. */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
