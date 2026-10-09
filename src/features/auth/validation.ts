import type {
  ForgotPasswordValues,
  LoginValues,
  OtpValues,
  RegisterValues,
  ResetPasswordValues,
} from '@/features/auth/types';
import type { FormErrors } from '@/types/form';
import { BACKEND_PHONE_PATTERN, toBackendPhone } from '@/lib/phone';
import {
  MIN_PASSWORD_LENGTH,
  checkEmail,
  checkFullName,
  checkPasswordMatch,
} from '@/lib/validation';

/** Backend chỉ nhận địa chỉ Gmail khi đăng ký (SignupRequest), nên chặn sớm ở client. */
const GMAIL_PATTERN = /^[A-Z0-9._%+-]+@gmail\.com$/i;

const OTP_PATTERN = /^\d{6}$/;

function checkSignupEmail(value: string) {
  const invalidFormat = checkEmail(value);
  if (invalidFormat) return invalidFormat;

  return GMAIL_PATTERN.test(value.trim()) ? undefined : 'Hiện chỉ hỗ trợ đăng ký bằng Gmail';
}

function checkNewPassword(value: string) {
  return value.length >= MIN_PASSWORD_LENGTH
    ? undefined
    : `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`;
}

function checkSignupPhone(value: string) {
  if (!value.trim()) return 'Vui lòng nhập số điện thoại';

  return BACKEND_PHONE_PATTERN.test(toBackendPhone(value))
    ? undefined
    : 'Nhập 9 chữ số hoặc 10 chữ số bắt đầu bằng 0';
}

function checkOtp(value: string) {
  if (!value.trim()) return 'Vui lòng nhập mã xác thực';

  return OTP_PATTERN.test(value.trim()) ? undefined : 'Mã xác thực gồm 6 chữ số';
}

export function validateLogin(values: LoginValues): FormErrors<LoginValues> {
  // Backend chỉ nhận email (POST /auth/signin), không có đăng nhập bằng username.
  return {
    email: checkEmail(values.email),
    // Không kiểm tra độ dài ở màn đăng nhập: tài khoản cũ có thể được tạo trước khi áp quy tắc mới.
    password: values.password ? undefined : 'Vui lòng nhập mật khẩu',
  };
}

export function validateRegister(values: RegisterValues): FormErrors<RegisterValues> {
  return {
    fullName: checkFullName(values.fullName),
    email: checkSignupEmail(values.email),
    phone: checkSignupPhone(values.phone),
    password: checkNewPassword(values.password),
    confirmPassword: checkPasswordMatch(values.confirmPassword, values.password),
  };
}

export function validateOtp(values: OtpValues): FormErrors<OtpValues> {
  return { otp: checkOtp(values.otp) };
}

export function validateForgotPassword(
  values: ForgotPasswordValues,
): FormErrors<ForgotPasswordValues> {
  return { email: checkEmail(values.email) };
}

export function validateResetPassword(
  values: ResetPasswordValues,
): FormErrors<ResetPasswordValues> {
  return {
    otp: checkOtp(values.otp),
    newPassword: checkNewPassword(values.newPassword),
    confirmPassword: checkPasswordMatch(values.confirmPassword, values.newPassword),
  };
}
