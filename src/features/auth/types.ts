export type AuthTab = 'login' | 'register';

/** Vai trò của tài khoản demo — mỗi vai trò đưa vào một khu vực riêng của app. */
export type DemoRole = 'buyer' | 'seller';

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
