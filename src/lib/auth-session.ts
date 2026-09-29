import { apiRequest } from '@/lib/api-client';
import { tokenStorage } from '@/lib/storage';

export type SessionStatus = 'guest' | 'authenticated';

export type AuthRole = 'BUYER' | 'MERCHANT' | 'ADMIN';

export type AuthUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: AuthRole;
  roles: AuthRole[];
};

export type SessionState = {
  status: SessionStatus;
  /** Phiên đăng nhập qua cổng quản trị — chỉ khi này mới được vào khu vực /admin. */
  isAdmin: boolean;
  isAuthPromptOpen: boolean;
  /** Chỉ có khi đăng nhập bằng API thật; tài khoản demo không có thông tin này. */
  user: AuthUser | null;
};

let state: SessionState = {
  status: 'guest',
  isAdmin: false,
  isAuthPromptOpen: false,
  user: null,
};
let pendingAction: (() => void) | null = null;
const listeners = new Set<() => void>();

function setState(next: Partial<SessionState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function getSessionState(): SessionState {
  return state;
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function requireAuth(action?: () => void): boolean {
  if (state.status === 'authenticated') {
    action?.();
    return true;
  }

  pendingAction = action ?? null;
  setState({ isAuthPromptOpen: true });
  return false;
}

export function withAuth(action?: () => void) {
  return () => {
    requireAuth(action);
  };
}

/**
 * Đăng nhập thật: lưu token rồi mở phiên. Phải await tokenStorage.save trước khi đổi state,
 * nếu không request đầu tiên sau điều hướng có thể chạy trước lúc token kịp ghi.
 */
export async function authenticate(
  tokens: { accessToken: string; refreshToken: string },
  user: AuthUser,
) {
  await tokenStorage.save(tokens.accessToken, tokens.refreshToken);

  const action = pendingAction;
  pendingAction = null;
  setState({ status: 'authenticated', isAuthPromptOpen: false, user });

  if (action) setTimeout(action, 0);
}

// Tài khoản demo: phiên chỉ nằm trong bộ nhớ, tắt app là quay về trạng thái khách.
export function signIn() {
  const action = pendingAction;
  pendingAction = null;
  setState({ status: 'authenticated', isAuthPromptOpen: false });

  // Chạy sau một nhịp để UI kịp render trạng thái đã đăng nhập (tab hết bị khoá, modal đóng)
  // rồi mới thực hiện thao tác người dùng đã bấm lúc còn là khách.
  if (action) setTimeout(action, 0);
}

// Tách khỏi signIn vì signIn được truyền thẳng làm callback của form (nhận giá trị form làm
// tham số), thêm tham số vai trò vào đó sẽ bị nhận nhầm.
export function signInAsAdmin() {
  pendingAction = null;
  setState({ status: 'authenticated', isAdmin: true, isAuthPromptOpen: false });
}

export function signOut() {
  pendingAction = null;
  setState({ status: 'guest', isAdmin: false, isAuthPromptOpen: false, user: null });
  // Không await: signOut được gắn thẳng làm onPress, UI phải về trạng thái khách ngay.
  void revokeSession();
}

/**
 * Thu hồi refresh session ở server rồi xoá token dưới máy. Lỗi mạng chỉ được bỏ qua chứ không
 * chặn đăng xuất: phiên local phải đóng bằng mọi giá, và endpoint logout là idempotent nên
 * lần đăng nhập sau gọi lại cũng không sao. Tài khoản demo không có token nên bỏ qua bước gọi API.
 */
async function revokeSession() {
  try {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      await apiRequest<void>('/auth/logout', { method: 'POST', body: { refreshToken } });
    }
  } catch {
    // Bỏ qua: token dưới máy vẫn bị xoá ở finally.
  } finally {
    await tokenStorage.clear();
  }
}

export function dismissAuthPrompt() {
  pendingAction = null;
  setState({ isAuthPromptOpen: false });
}
