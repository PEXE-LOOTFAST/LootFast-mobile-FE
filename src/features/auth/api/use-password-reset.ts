import { useMutation } from '@tanstack/react-query';

import {
  confirmPasswordReset,
  requestPasswordReset,
  type PasswordResetConfirmPayload,
} from '@/features/auth/api/password-reset';

export function useRequestPasswordReset(onSuccess: (email: string) => void) {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
    onSuccess: (_data, email) => onSuccess(email.trim()),
  });
}

export function useConfirmPasswordReset(onSuccess: () => void) {
  return useMutation({
    mutationFn: (payload: PasswordResetConfirmPayload) => confirmPasswordReset(payload),
    onSuccess: () => onSuccess(),
  });
}
