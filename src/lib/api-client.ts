import { tokenStorage } from '@/lib/storage';
import type { ApiResponse } from '@/types/api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiException extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error(
      'Thiếu EXPO_PUBLIC_API_URL. Copy .env.example thành .env rồi chạy lại: npx expo start --clear',
    );
  }

  const { method = 'GET', body, headers, signal } = options;
  const accessToken = await tokenStorage.getAccessToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  // 204 không có body: gọi response.json() sẽ ném lỗi parse (vd. POST /auth/logout).
  if (response.status === 204) return undefined as T;

  const payload = (await response.json()) as ApiResponse<T>;

  // Backend luôn bọc response trong ApiResponse, kể cả khi lỗi. Ném theo error.code
  // (enum ổn định) để tầng UI map sang tiếng Việt, không hiển thị thẳng error.message.
  if (!payload.success) {
    throw new ApiException(
      payload.error?.code ?? 'UNKNOWN_ERROR',
      payload.error?.message ?? 'Đã có lỗi xảy ra',
      response.status,
    );
  }

  return payload.data as T;
}
