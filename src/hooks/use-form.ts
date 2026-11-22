import { useState } from 'react';

import type { FormErrors, Validate } from '@/types/form';

type UseFormOptions<T> = {
  initialValues: T;
  validate: Validate<T>;
  onSubmit: (values: T) => void | Promise<void>;
};

export function useForm<T extends Record<string, string>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof T>(field: K, value: T[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    // Xoá lỗi ngay khi người dùng sửa ô đó, không bắt họ bấm gửi lại mới thấy lỗi biến mất.
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }

  /**
   * Kiểm tra riêng vài ô, cho form chia nhiều bước: chỉ hiện lỗi của các ô thuộc bước đang làm,
   * không làm đỏ những ô người dùng chưa tới. Trả về true khi các ô đó đều hợp lệ.
   */
  function validateFields(fields: readonly (keyof T)[]) {
    const all = validate(values);
    const fieldErrors: FormErrors<T> = {};
    for (const field of fields) fieldErrors[field] = all[field];

    setErrors((current) => ({ ...current, ...fieldErrors }));
    return fields.every((field) => !all[field]);
  }

  async function submit() {
    if (isSubmitting) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { values, errors, isSubmitting, setField, submit, validateFields };
}
