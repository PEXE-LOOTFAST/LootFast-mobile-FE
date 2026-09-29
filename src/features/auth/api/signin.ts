import { apiRequest } from '@/lib/api-client';
import type { AuthRole, AuthUser } from '@/lib/auth-session';

export type SigninPayload = {
  email: string;
  password: string;
};

// Khớp SigninResponse của backend (POST /api/v1/auth/signin).
export type SigninResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  firstName: string;
  lastName: string;
  email: string;
  role: AuthRole;
  roles: AuthRole[];
};

export function signinRequest(payload: SigninPayload) {
  return apiRequest<SigninResponse>('/auth/signin', { method: 'POST', body: payload });
}

export function toAuthUser(response: SigninResponse): AuthUser {
  return {
    firstName: response.firstName,
    lastName: response.lastName,
    email: response.email,
    role: response.role,
    roles: response.roles,
  };
}
