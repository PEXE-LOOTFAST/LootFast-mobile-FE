import type { OpeningHourSlot } from '@/features/home/api/stores';

type DayOfWeek = OpeningHourSlot['dayOfWeek'];

const WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const WEEKDAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Thứ Hai',
  TUESDAY: 'Thứ Ba',
  WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu',
  SATURDAY: 'Thứ Bảy',
  SUNDAY: 'Chủ Nhật',
};

export type OpeningHourGroup = {
  /** "Hằng ngày", "Thứ Hai – Thứ Sáu" hoặc một ngày lẻ. */
  label: string;
  /** "08:00–21:00", nhiều khung trong ngày nối bằng dấu phẩy. */
  hours: string;
};

/**
 * Gộp các ngày liên tiếp có cùng giờ mở cửa thành một dòng để khỏi liệt kê 7 dòng y hệt nhau.
 * Cả tuần giống nhau thì chỉ còn đúng một dòng "Hằng ngày".
 */
export function groupOpeningHours(slots: OpeningHourSlot[]): OpeningHourGroup[] {
  const byDay = new Map<DayOfWeek, string[]>();
  for (const slot of slots) {
    byDay.set(slot.dayOfWeek, [
      ...(byDay.get(slot.dayOfWeek) ?? []),
      `${slot.opensAt}–${slot.closesAt}`,
    ]);
  }

  const runs: { days: DayOfWeek[]; hours: string }[] = [];
  for (const day of WEEK) {
    const ranges = byDay.get(day);
    if (!ranges) continue;

    const hours = [...ranges].sort().join(', ');
    const last = runs[runs.length - 1];
    const previousDay = last?.days[last.days.length - 1];

    // Chỉ nối khi liền kề nhau trong tuần và cùng giờ.
    if (
      last &&
      previousDay &&
      WEEK.indexOf(previousDay) === WEEK.indexOf(day) - 1 &&
      last.hours === hours
    ) {
      last.days.push(day);
    } else {
      runs.push({ days: [day], hours });
    }
  }

  if (runs.length === 1 && runs[0]?.days.length === WEEK.length) {
    return [{ label: 'Hằng ngày', hours: runs[0].hours }];
  }

  return runs.map(({ days, hours }) => {
    const first = days[0];
    const lastDay = days[days.length - 1];
    if (!first || !lastDay) return { label: '', hours };

    return {
      label:
        days.length === 1
          ? WEEKDAY_LABELS[first]
          : `${WEEKDAY_LABELS[first]} – ${WEEKDAY_LABELS[lastDay]}`,
      hours,
    };
  });
}
