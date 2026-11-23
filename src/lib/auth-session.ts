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
  /**
   * Đang đọc phiên đã lưu lúc mở app. Trong lúc này chưa biết là khách hay đã đăng nhập, nên
   * header không hiện nút "Đăng nhập" để khỏi nháy lên rồi biến mất.
   */
  isRestoring: boolean;
};

let state: SessionState = {
  status: 'guest',
  isAdmin: false,
  isAuthPromptOpen: false,
  user: null,
  isRestoring: true,
};
// Tăng mỗi lần phiên đổi chủ (đăng nhập, đăng xuất, hết hạn). Khôi phục phiên chạy nền chỉ ghi
// kết quả khi số này chưa đổi, để không đè lên phiên người dùng vừa tự đăng nhập hay đăng xuất.
let sessionEpoch = 0;
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

/** Nhớ tài khoản trên máy để lần mở app sau hiện ngay, không phải chờ mạng. Lỗi ghi thì bỏ qua. */
function rememberUser(user: AuthUser) {
  void tokenStorage.setSessionUser(JSON.stringify(user)).catch(() => {});
}

function readRememberedUser(json: string | null): AuthUser | null {
  if (!json) return null;
  try {
    const user = JSON.parse(json) as Partial<AuthUser>;
    if (typeof user.email !== 'string' || !Array.isArray(user.roles) || !user.role) return null;
    return {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email,
      role: user.role,
      roles: user.roles,
    };
  } catch {
    return null;
  }
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
  rememberUser(user);
  sessionEpoch++;

  // Bỏ dữ liệu của phiên trước (thông báo, đơn, hồ sơ…) để tài khoản mới không thấy nhầm.
  queryClient.clear();

  const action = pendingAction;
  pendingAction = null;
  setState({ status: 'authenticated', isAuthPromptOpen: false, user, isRestoring: false });

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
  // Ghi cờ để `restoreSession` khôi phục lại khu /admin khi mở lại app.
  await tokenStorage.setAdminGate(true);
  rememberUser(user);
  sessionEpoch++;

  queryClient.clear();

  pendingAction = null;
  setState({
    status: 'authenticated',
    isAdmin: true,
    isAuthPromptOpen: false,
    user,
    isRestoring: false,
  });
}

export function signOut() {
  pendingAction = null;
  sessionEpoch++;
  setState({
    status: 'guest',
    isAdmin: false,
    isAuthPromptOpen: false,
    user: null,
    isRestoring: false,
  });
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
  sessionEpoch++;
  setState({
    status: 'guest',
    isAdmin: false,
    isAuthPromptOpen: false,
    user: null,
    isRestoring: false,
  });
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

    const user = { ...current, role: me.role, roles: me.roles };
    setState({ user });
    rememberUser(user);
    return true;
  } catch {
    // Lỗi mạng: giữ nguyên phiên, lần mở màn sau sẽ thử lại.
    return false;
  }
}

/**
 * Khôi phục phiên từ token đã lưu khi mở app.
 *
 * Có tài khoản đã nhớ trên máy thì mở phiên ngay bằng nó, để header hiện tài khoản thay vì nút
 * "Đăng nhập" trong lúc chờ mạng; sau đó mới làm mới token và đọc lại `/users/me` ở nền để cập
 * nhật tên và quyền. Refresh token đã bị thu hồi thì request đầu tiên nhận 401 và `api-client`
 * đóng phiên như bình thường. Lỗi mạng thì giữ nguyên, lần mở sau sẽ thử lại.
 *
 * Phiên admin được khôi phục khi có cờ cổng quản trị đã lưu VÀ tài khoản vẫn còn role ADMIN —
 * quyền thật vẫn do backend kiểm tra ở /admin/*.
 */
export async function restoreSession(): Promise<void> {
  if (state.status === 'authenticated') {
    setState({ isRestoring: false });
    return;
  }
  const epoch = sessionEpoch;
  const isCurrent = () => epoch === sessionEpoch;

  try {
    if (!(await tokenStorage.getRefreshToken())) return;

    const remembered = readRememberedUser(await tokenStorage.getSessionUser());
    const isAdminGate = await tokenStorage.isAdminGate();
    if (remembered && isCurrent()) {
      setState({
        status: 'authenticated',
        isAdmin: isAdminGate && remembered.roles.includes('ADMIN'),
        user: remembered,
        isRestoring: false,
      });
    }

    // Access token thường đã hết hạn sau một thời gian tắt app nên luôn làm mới trước.
    if (!(await refreshSession())) return;

    const me = await apiRequest<AuthUser>('/users/me');
    // Người dùng có thể đã tự đăng nhập hoặc đăng xuất trong lúc chờ; không ghi đè phiên đó.
    if (!isCurrent()) return;

    const user: AuthUser = {
      firstName: me.firstName,
      lastName: me.lastName,
      email: me.email,
      role: me.role,
      roles: me.roles,
    };
    rememberUser(user);
    // Admin có thể đã bị gỡ quyền trong lúc tắt app.
    setState({ status: 'authenticated', isAdmin: isAdminGate && me.roles.includes('ADMIN'), user });
  } catch {
    // Giữ nguyên trạng thái hiện có (khách, hoặc tài khoản đã nhớ).
  } finally {
    if (state.isRestoring) setState({ isRestoring: false });
  }
}

export function dismissAuthPrompt() {
  pendingAction = null;
  setState({ isAuthPromptOpen: false });
}
