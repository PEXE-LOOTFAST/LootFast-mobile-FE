import { apiRequest, refreshSession, registerSessionExpiredHandler } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';
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

  // Bỏ dữ liệu của phiên trước (thông báo, đơn, hồ sơ…) để tài khoản mới không thấy nhầm.
  queryClient.clear();

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

  queryClient.clear();

  pendingAction = null;
  setState({ status: 'authenticated', isAdmin: true, isAuthPromptOpen: false, user });
}

export function signOut() {
  pendingAction = null;
  setState({ status: 'guest', isAdmin: false, isAuthPromptOpen: false, user: null });
  queryClient.clear();
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
  queryClient.clear();
});

/**
 * Quyền (roles) nằm trong access token nên đổi quyền ở server — vd. admin vừa duyệt đơn đăng ký
 * bán hàng — không có hiệu lực cho tới khi token được cấp lại. Làm mới token rồi đọc lại quyền
 * để người dùng vào được khu người bán ngay mà không phải đăng nhập lại.
 * Trả về true nếu quyền trong phiên đã thay đổi.
 */
export async function syncSessionRoles(): Promise<boolean> {
  if (state.status !== 'authenticated' || !state.user) return false;

  try {
    if (!(await refreshSession())) return false;

    const me = await apiRequest<{ role: AuthRole; roles: AuthRole[] }>('/users/me');
    const current = state.user;
    const changed =
      me.roles.length !== current.roles.length || me.roles.some((r) => !current.roles.includes(r));
    if (!changed) return false;

    setState({ user: { ...current, role: me.role, roles: me.roles } });
    return true;
  } catch {
    // Lỗi mạng: giữ nguyên phiên, lần mở màn sau sẽ thử lại.
    return false;
  }
}

/**
 * Khôi phục phiên từ token đã lưu khi mở app. Access token thường đã hết hạn sau một thời gian
 * tắt app nên luôn làm mới trước rồi mới đọc `/users/me`. Lỗi mạng thì giữ nguyên trạng thái
 * khách mà không xoá token, lần mở sau sẽ thử lại. Phiên admin không được khôi phục: `isAdmin`
 * chỉ bật qua cổng quản trị nên admin phải đăng nhập lại ở đó.
 */
export async function restoreSession(): Promise<void> {
  if (state.status === 'authenticated') return;

  try {
    if (!(await tokenStorage.getRefreshToken())) return;
    if (!(await refreshSession())) return;

    const me = await apiRequest<{
      firstName: string;
      lastName: string;
      email: string;
      role: AuthRole;
      roles: AuthRole[];
    }>('/users/me');

    // Người dùng có thể đã tự đăng nhập trong lúc chờ; không ghi đè phiên mới đó.
    if (getSessionState().status === 'authenticated') return;

    setState({
      status: 'authenticated',
      user: {
        firstName: me.firstName,
        lastName: me.lastName,
        email: me.email,
        role: me.role,
        roles: me.roles,
      },
    });
  } catch {
    // Giữ trạng thái khách.
  }
}

export function dismissAuthPrompt() {
  pendingAction = null;
  setState({ isAuthPromptOpen: false });
}
