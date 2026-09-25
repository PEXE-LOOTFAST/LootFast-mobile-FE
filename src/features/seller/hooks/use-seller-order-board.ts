import { useMemo, useState } from 'react';

import type {
  SellerDeal,
  SellerOrder,
  SellerOrderStatus,
  SellerPickupBucket,
} from '@/features/seller/types';

const pad = (value: number) => value.toString().padStart(2, '0');

/** "20/09/2026" — định dạng ngày người bán gõ và đọc trên bộ lọc. */
export function formatDateInput(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// Đơn đã huỷ coi như khách không đến nhận; đơn chưa xác nhận vẫn nằm ở nhóm chờ lấy.
const BUCKET_BY_STATUS: Record<SellerOrderStatus, SellerPickupBucket> = {
  pending: 'waiting',
  confirmed: 'waiting',
  completed: 'picked',
  cancelled: 'no-show',
  'no-show': 'no-show',
};

const EMPTY_COUNTS: Record<SellerPickupBucket, number> = { waiting: 0, picked: 0, 'no-show': 0 };

const remainingOf = (deal: SellerDeal) => Math.max(deal.portionsTotal - deal.portionsSold, 0);

// Toàn bộ trạng thái của trang Đơn hàng người bán: bộ lọc ngày/mã, nhóm đơn và số phần
// còn lại đang sửa tại chỗ. Dữ liệu vẫn là mock, chưa gọi API.
export function useSellerOrderBoard(deals: SellerDeal[], orders: SellerOrder[]) {
  // Chốt ngày lúc mount để nút "Hôm nay" không đổi nghĩa giữa các lần render.
  const [today] = useState(() => formatDateInput(new Date()));
  const [date, setDate] = useState(today);
  const [code, setCode] = useState('');
  const [bucket, setBucket] = useState<SellerPickupBucket>('waiting');
  // Sửa số phần chỉ nằm trên máy cho tới khi có API cập nhật deal.
  const [portionsLeft, setPortionsLeft] = useState<Record<string, number>>(() =>
    Object.fromEntries(deals.map((deal) => [deal.id, remainingOf(deal)])),
  );

  const { counts, visibleOrders } = useMemo(() => {
    const matched = orders.filter((order) => {
      const sameDay = formatDateInput(new Date(order.createdAt)) === date;

      return sameDay && (code.length === 0 || order.code.includes(code));
    });

    const grouped = matched.reduce(
      (acc, order) => {
        const key = BUCKET_BY_STATUS[order.status];

        return { ...acc, [key]: acc[key] + 1 };
      },
      { ...EMPTY_COUNTS },
    );

    return {
      counts: grouped,
      visibleOrders: matched.filter((order) => BUCKET_BY_STATUS[order.status] === bucket),
    };
  }, [orders, date, code, bucket]);

  return {
    date,
    setDate,
    today,
    isToday: date === today,
    resetToToday: () => setDate(today),
    code,
    setCode,
    bucket,
    setBucket,
    counts,
    visibleOrders,
    portionsLeftOf: (deal: SellerDeal) => portionsLeft[deal.id] ?? remainingOf(deal),
    setPortionsLeftOf: (dealId: string, value: number) =>
      setPortionsLeft((current) => ({ ...current, [dealId]: value })),
  };
}
