import type { DayOfWeek } from '@/features/seller/types/api';
import { TIME_PATTERN } from '@/lib/validation';

export const WEEK_DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 'MONDAY', label: 'T2' },
  { id: 'TUESDAY', label: 'T3' },
  { id: 'WEDNESDAY', label: 'T4' },
  { id: 'THURSDAY', label: 'T5' },
  { id: 'FRIDAY', label: 'T6' },
  { id: 'SATURDAY', label: 'T7' },
  { id: 'SUNDAY', label: 'CN' },
];

const WEEKDAY_IDS = WEEK_DAYS.slice(0, 5).map((day) => day.id);

/** Danh sách ngày mở cửa lưu dạng chuỗi "MONDAY,TUESDAY" để khớp các ô nhập khác của form. */
export const ALL_OPEN_DAYS = WEEK_DAYS.map((day) => day.id).join(',');
export const WEEKDAYS_ONLY = WEEKDAY_IDS.join(',');

export function parseOpenDays(value: string): DayOfWeek[] {
  const selected = new Set(value.split(','));

  return WEEK_DAYS.filter((day) => selected.has(day.id)).map((day) => day.id);
}

export function toggleOpenDay(value: string, day: DayOfWeek): string {
  const selected = new Set(parseOpenDays(value));
  if (selected.has(day)) selected.delete(day);
  else selected.add(day);

  return WEEK_DAYS.filter((item) => selected.has(item.id))
    .map((item) => item.id)
    .join(',');
}

/**
 * "9" → "09:00", "730" → "07:30", "7:30" → "07:30". Giá trị dở dang như "12:3" hay không thành giờ
 * hợp lệ giữ nguyên để validation báo lỗi, không đoán thay người bán.
 */
export function normalizeTime(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  let padded: string;
  if (trimmed.includes(':')) {
    const [hours = '', minutes = ''] = trimmed.split(':');
    padded = `${hours.padStart(2, '0')}:${minutes}`;
  } else if (trimmed.length <= 2) {
    padded = `${trimmed.padStart(2, '0')}:00`;
  } else {
    padded = `${trimmed.slice(0, -2).padStart(2, '0')}:${trimmed.slice(-2)}`;
  }

  return TIME_PATTERN.test(padded) ? padded : text;
}

export function toMinutes(time: string): number | null {
  if (!TIME_PATTERN.test(time)) return null;
  const [hours, minutes] = time.split(':').map(Number);

  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!minutes) return `${hours} giờ`;

  return hours ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
}

export const HOUR_PRESETS: { label: string; open: string; close: string }[] = [
  { label: 'Sáng', open: '06:00', close: '14:00' },
  { label: 'Hành chính', open: '08:00', close: '17:00' },
  { label: 'Cả ngày', open: '07:00', close: '22:00' },
  { label: 'Chiều tối', open: '16:00', close: '23:00' },
];
