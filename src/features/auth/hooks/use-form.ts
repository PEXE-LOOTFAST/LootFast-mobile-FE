import { useState } from 'react';

import type { FormErrors } from '@/features/auth/types';

type UseFormOptions<T> = {
  initialValues: T;
  validate: (values: T) => FormErrors<T>;
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

  return { values, errors, isSubmitting, setField, submit };
}
