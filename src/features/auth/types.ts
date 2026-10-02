export type AuthTab = 'login' | 'register';

/**
 * Các bước trong khung đăng nhập/đăng ký. 'form' là hai tab chính; ba bước còn lại chiếm
 * trọn khung khi đang xác thực email hoặc đặt lại mật khẩu.
 */
export type AuthStep = 'form' | 'verify-otp' | 'forgot-password' | 'reset-password';

export type LoginValues = {
  email: string;
  password: string;
};

export type RegisterValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type OtpValues = {
  otp: string;
};

export type ForgotPasswordValues = {
  email: string;
};

export type ResetPasswordValues = {
  otp: string;
  newPassword: string;
  confirmPassword: string;
};
