import { File } from 'expo-file-system';
import { Platform } from 'react-native';

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

/**
 * Được `auth-session` đăng ký lúc nạp module. Tách qua hàm đăng ký thay vì import thẳng để
 * không tạo vòng phụ thuộc: `auth-session` đã import file này rồi.
 */
let onSessionExpired: (() => void) | null = null;

export function registerSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

/**
 * Chỉ cho một lượt làm mới token chạy tại một thời điểm. Màn hình thường bắn nhiều request
 * song song, hết hạn thì tất cả cùng nhận 401 — nếu mỗi cái tự gọi `/auth/refresh` thì refresh
 * token sẽ bị xoay vòng nhiều lần và các lượt sau nhận token đã bị thu hồi.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function runRefresh(): Promise<boolean> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const payload = (await response.json()) as ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>;

    if (!payload.success || !payload.data) return false;

    await tokenStorage.save(payload.data.accessToken, payload.data.refreshToken);
    return true;
  } catch {
    // Mất mạng giữa chừng: coi như chưa làm mới được, lượt gọi gốc sẽ trả lỗi như bình thường.
    return false;
  }
}

export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= runRefresh().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

async function send(path: string, options: RequestOptions, accessToken: string | null) {
  const { method = 'GET', body, headers, signal } = options;

  return fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export type UploadFile = {
  /** URI local do expo-image-picker trả về. */
  uri: string;
  /** Tên file gửi lên; để trống thì suy ra từ URI. */
  name?: string;
  /** MIME do expo-image-picker báo (asset.mimeType); chính xác hơn việc đoán theo đuôi file. */
  mimeType?: string;
};

type UploadOptions = {
  method?: 'POST' | 'PUT';
  /** Các phần dạng chữ đi kèm file (vd. businessLicenseNumber). */
  fields?: Record<string, string>;
  files: Record<string, UploadFile>;
};

/**
 * Đóng gói một file để gửi multipart. `fetch` toàn cục của Expo (SDK 52+) tự dựng body từ FormData
 * và không hiểu kiểu `{ uri, name, type }` của React Native cũ — gặp là ném "Unsupported
 * FormDataPart implementation". Trên máy dùng `File` của expo-file-system (một Blob đọc từ URI);
 * trên web URI là blob: nên đọc bằng fetch.
 */
async function toFilePart(key: string, file: UploadFile): Promise<Blob> {
  const name = file.name ?? file.uri.split('/').pop() ?? `${key}.jpg`;
  const extension = /\.(\w+)$/.exec(name)?.[1]?.toLowerCase();
  // "image/jpg" không phải MIME hợp lệ; đuôi .jpg/.jpeg đều phải gửi là image/jpeg.
  const guessed = !extension || extension === 'jpg' ? 'jpeg' : extension;
  const type = file.mimeType ?? `image/${guessed}`;

  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();

    return Object.assign(new Blob([blob], { type }), { name });
  }

  return new File(file.uri);
}

/**
 * Gửi multipart/form-data. Tách khỏi `apiRequest` vì FormData phải tự đặt boundary — khai báo
 * Content-Type bằng tay sẽ làm backend không tách được các phần.
 *
 * Dùng chung một đường xử lý lỗi với `apiRequest`, kể cả bước làm mới token khi gặp 401, để
 * ảnh upload giữa chừng phiên hết hạn vẫn đi tiếp thay vì hỏng im lặng.
 */
export async function apiUpload<T>(path: string, options: UploadOptions): Promise<T> {
  if (!BASE_URL) {
    throw new Error(
      'Thiếu EXPO_PUBLIC_API_URL. Copy .env.example thành .env rồi chạy lại: npx expo start --clear',
    );
  }

  const { method = 'POST', fields = {}, files } = options;

  const buildBody = async () => {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) form.append(key, value);
    for (const [key, file] of Object.entries(files)) {
      form.append(key, await toFilePart(key, file));
    }

    return form;
  };

  // Gói lỗi mạng thành ApiException để màn hình phân biệt được "không tới được máy chủ" với
  // lỗi do chính file (không đọc được URI, quá lớn...) thay vì cùng một câu chung chung.
  const sendForm = async (accessToken: string | null) => {
    try {
      return await fetch(`${BASE_URL}${path}`, {
        method,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: await buildBody(),
      });
    } catch (error) {
      throw new ApiException(
        'NETWORK_ERROR',
        error instanceof Error ? error.message : 'Network request failed',
        0,
      );
    }
  };

  const accessToken = await tokenStorage.getAccessToken();
  let response = await sendForm(accessToken);

  if (response.status === 401 && accessToken) {
    const refreshed = await refreshSession();
    if (refreshed) {
      response = await sendForm(await tokenStorage.getAccessToken());
    } else {
      await tokenStorage.clear();
      onSessionExpired?.();
    }
  }

  // Proxy/gateway lỗi (502, 413...) trả HTML chứ không phải ApiResponse nên json() sẽ ném.
  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiException('INVALID_RESPONSE', 'Response was not valid JSON', response.status);
  }

  if (!payload.success) {
    throw new ApiException(
      payload.error?.code ?? 'UNKNOWN_ERROR',
      payload.error?.message ?? 'Đã có lỗi xảy ra',
      response.status,
    );
  }

  return payload.data as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error(
      'Thiếu EXPO_PUBLIC_API_URL. Copy .env.example thành .env rồi chạy lại: npx expo start --clear',
    );
  }

  const accessToken = await tokenStorage.getAccessToken();
  let response = await send(path, options, accessToken);

  // Access token hết hạn: làm mới một lần rồi gọi lại. Bỏ qua nhóm /auth/* vì chúng không cần
  // access token, và gọi lại `/auth/refresh` khi chính nó trả 401 sẽ thành vòng lặp.
  if (response.status === 401 && accessToken && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();

    if (refreshed) {
      response = await send(path, options, await tokenStorage.getAccessToken());
    } else {
      // Refresh token cũng hết hạn hoặc đã bị thu hồi — đóng phiên để người dùng đăng nhập lại.
      await tokenStorage.clear();
      onSessionExpired?.();
    }
  }

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
