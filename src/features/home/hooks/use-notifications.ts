import { useState } from 'react';

import type { AppNotification } from '@/features/home/types';

export function useNotifications(initialNotifications: AppNotification[]) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
  };

  return { notifications, unreadCount, markAsRead };
}
