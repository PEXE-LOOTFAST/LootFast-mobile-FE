import type { CurrentUserResponse, UpdateProfilePayload } from '@/features/profile/api/profile';

export const NAME_MAX_LENGTH = 100;

// Form chỉ sửa "Họ & Tên" (displayName) và số điện thoại. firstName/lastName của tài khoản giữ nguyên
// như lúc đăng ký, nên không đưa vào form.
export type ProfileFormValues = {
  /** Hiển thị là "Họ & Tên"; gửi lên backend ở trường displayName. */
  displayName: string;
  /** Số điện thoại như người dùng gõ (có thể có số 0 đầu, +84, dấu cách). */
  phone: string;
};

export type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>;

/**
 * Đưa số điện thoại về đúng 9 chữ số backend yêu cầu (không số 0 đầu, không +84, không dấu cách/gạch).
 * Trả null nếu không phải số điện thoại di động hợp lệ.
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/[\s.\-()]/g, '');

  if (digits.startsWith('+84')) digits = digits.slice(3);
  else if (digits.startsWith('84') && digits.length === 11) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);

  return /^\d{9}$/.test(digits) ? digits : null;
}

/** Số điện thoại backend lưu 9 chữ số; hiển thị lại với số 0 đầu như người dùng vẫn gõ. */
export function toDisplayPhone(phone: string | null) {
  if (!phone) return '';

  return phone.startsWith('0') || phone.startsWith('+') ? phone : `0${phone}`;
}

export function toProfileFormValues(profile: CurrentUserResponse | undefined): ProfileFormValues {
  return {
    displayName: profile?.displayName ?? '',
    phone: toDisplayPhone(profile?.phoneNumber ?? null),
  };
}

const requireName = (value: string, label: string) => {
  const text = value.trim();
  if (!text) return `Vui lòng nhập ${label}`;

  return text.length > NAME_MAX_LENGTH ? `Tối đa ${NAME_MAX_LENGTH} ký tự` : undefined;
};

/**
 * Backend coi chuỗi rỗng là "không đổi" nên xoá trắng một ô sẽ bị lờ đi mà không báo lỗi; chặn ngay
 * ở form để người dùng không tưởng mình đã xoá được.
 */
export function validateProfileForm(
  values: ProfileFormValues,
  saved: ProfileFormValues,
): ProfileFormErrors {
  const errors: ProfileFormErrors = {
    displayName: requireName(values.displayName, 'họ và tên'),
  };

  const phone = values.phone.trim();
  if (!phone) {
    if (saved.phone) errors.phone = 'Không thể xoá số điện thoại, chỉ đổi sang số khác được';
  } else if (!normalizePhone(phone)) {
    errors.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0 (ví dụ 0912345678)';
  }

  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

/** Chỉ gửi những trường thật sự đổi; null nếu không có gì để gửi. */
export function buildProfilePayload(
  values: ProfileFormValues,
  saved: ProfileFormValues,
): UpdateProfilePayload | null {
  const payload: UpdateProfilePayload = {};

  if (values.displayName.trim() !== saved.displayName.trim()) {
    payload.displayName = values.displayName.trim();
  }

  const phone = normalizePhone(values.phone.trim());
  if (phone && phone !== normalizePhone(saved.phone)) payload.phoneNumber = phone;

  return Object.keys(payload).length > 0 ? payload : null;
}
