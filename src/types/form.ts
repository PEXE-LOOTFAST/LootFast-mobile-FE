/** Lỗi của một form: mỗi trường có thể có hoặc không có thông báo lỗi. */
export type FormErrors<T> = Partial<Record<keyof T, string>>;

/** Hàm kiểm tra dữ liệu của một form, trả về lỗi cho từng trường. */
export type Validate<T> = (values: T) => FormErrors<T>;
