import { apiRequest, registerSessionExpiredHandler } from '@/lib/api-client';
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
  /** Thông tin tài khoản backend trả về lúc đăng nhập. */
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

/**
 * Đăng nhập thật qua cổng quản trị. Tách khỏi `authenticate` vì chỉ đường này mới được bật
 * `isAdmin` — người dùng đăng nhập ở cổng người mua dù có role ADMIN cũng không vào khu /admin.
 * Quyền thật vẫn do backend kiểm tra ở từng endpoint /admin/*.
 */
export async function authenticateAsAdmin(
  tokens: { accessToken: string; refreshToken: string },
  user: AuthUser,
) {
  await tokenStorage.save(tokens.accessToken, tokens.refreshToken);

  pendingAction = null;
  setState({ status: 'authenticated', isAdmin: true, isAuthPromptOpen: false, user });
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
 * lần đăng nhập sau gọi lại cũng không sao.
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

/**
 * Token đã hết hạn và làm mới cũng không được: đưa phiên về trạng thái khách. `api-client` gọi
 * hàm này ngay khi phát hiện, nên mọi màn đang mở cùng thấy và hiện lại nút đăng nhập.
 */
registerSessionExpiredHandler(() => {
  pendingAction = null;
  setState({ status: 'guest', isAdmin: false, isAuthPromptOpen: false, user: null });
});

export function dismissAuthPrompt() {
  pendingAction = null;
  setState({ isAuthPromptOpen: false });
}
