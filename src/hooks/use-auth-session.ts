import { useSyncExternalStore } from 'react';

import { getSessionState, subscribeSession } from '@/lib/auth-session';

export function useAuthSession() {
  const session = useSyncExternalStore(subscribeSession, getSessionState, getSessionState);

  return { ...session, isAuthenticated: session.status === 'authenticated' };
}
