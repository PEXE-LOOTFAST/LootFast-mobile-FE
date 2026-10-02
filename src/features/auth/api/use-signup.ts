import { useMutation } from '@tanstack/react-query';

import {
  resendOtpRequest,
  signupRequest,
  verifyOtpRequest,
  type SignupPayload,
} from '@/features/auth/api/signup';

export function useSignup(onSuccess: (email: string) => void) {
  return useMutation({
    mutationFn: (payload: SignupPayload) => signupRequest(payload),
    // Backend trả lại email đã chuẩn hoá; dùng chính nó cho bước nhập OTP để không lệch hoa thường.
    onSuccess: (response) => onSuccess(response.email),
  });
}

export function useVerifyOtp(onSuccess: () => void) {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => verifyOtpRequest(email, otp),
    onSuccess: () => onSuccess(),
  });
}

export function useResendOtp() {
  return useMutation({ mutationFn: (email: string) => resendOtpRequest(email) });
}
