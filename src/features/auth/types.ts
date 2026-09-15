export type AuthTab = 'login' | 'register';

export type LoginValues = {
  identifier: string;
  password: string;
};

export type RegisterValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type FormErrors<T> = Partial<Record<keyof T, string>>;
