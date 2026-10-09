import { apiRequest } from '@/lib/api-client';

export { toBackendPhone } from '@/lib/phone';

/**
 * Phiên bản điều khoản gửi kèm lúc đăng ký. Backend chỉ lưu lại chuỗi này cùng thời điểm
 * người dùng đồng ý, không đối chiếu với danh sách nào — đổi nội dung điều khoản thì tăng
 * số ở đây để biết ai đã đồng ý với bản nào.
 */
export const TERMS_VERSION = '1.0';
export const PRIVACY_POLICY_VERSION = '1.0';

export type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  /** Đúng 9 chữ số, cho phép số 0 đứng đầu — khớp SignupRequest của backend. */
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

export type SignupResponse = {
  message: string;
  email: string;
};

/**
 * "Nguyễn Văn A" → firstName "Nguyễn", lastName "Văn A".
 *
 * Backend dựng tên hiển thị bằng CONCAT(first_name, ' ', last_name), nên tách theo thứ tự này
 * thì tên hiện lại đúng nguyên văn người dùng đã gõ. Người chỉ nhập một từ thì lastName lấy
 * lại chính từ đó, vì backend bắt cả hai trường không được rỗng.
 */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const words = fullName.trim().split(/\s+/);
  const [first, ...rest] = words;

  return {
    firstName: first ?? '',
    lastName: rest.length > 0 ? rest.join(' ') : (first ?? ''),
  };
}

export function signupRequest(payload: SignupPayload) {
  return apiRequest<SignupResponse>('/auth/signup', {
    method: 'POST',
    body: {
      ...payload,
      // Màn đăng ký nêu rõ "bằng việc đăng ký, bạn đồng ý với..." ngay trên nút gửi, nên bấm
      // nút chính là hành vi đồng ý. Backend chỉ cần biết đồng ý với bản nào, lúc nào.
      termsAccepted: true,
      termsVersion: TERMS_VERSION,
      privacyPolicyAccepted: true,
      privacyPolicyVersion: PRIVACY_POLICY_VERSION,
    },
  });
}

/** Backend trả về một map thông báo; màn hình không dùng tới nội dung đó. */
export function verifyOtpRequest(email: string, otp: string) {
  return apiRequest<Record<string, string>>('/auth/verify-otp', {
    method: 'POST',
    body: { email: email.trim(), otp: otp.trim() },
  });
}

export function resendOtpRequest(email: string) {
  return apiRequest<Record<string, string>>('/auth/resend-otp', {
    method: 'POST',
    body: { email: email.trim() },
  });
}
