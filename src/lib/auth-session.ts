export type SessionStatus = 'guest' | 'authenticated';

export type SessionState = {
  status: SessionStatus;
  isAuthPromptOpen: boolean;
};

let state: SessionState = { status: 'guest', isAuthPromptOpen: false };
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

// Chưa có API xác thực nên phiên chỉ nằm trong bộ nhớ: tắt app là quay về trạng thái khách.
export function signIn() {
  const action = pendingAction;
  pendingAction = null;
  setState({ status: 'authenticated', isAuthPromptOpen: false });

  // Chạy sau một nhịp để UI kịp render trạng thái đã đăng nhập (tab hết bị khoá, modal đóng)
  // rồi mới thực hiện thao tác người dùng đã bấm lúc còn là khách.
  if (action) setTimeout(action, 0);
}

export function signOut() {
  pendingAction = null;
  setState({ status: 'guest', isAuthPromptOpen: false });
}

export function dismissAuthPrompt() {
  pendingAction = null;
  setState({ isAuthPromptOpen: false });
}
