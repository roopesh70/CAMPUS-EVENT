'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  queryDocs, addDocument, updateDocument,
  listenToCollection, where, orderBy,
} from '@/lib/firestore';
import type { Notification } from '@/types';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Real-time listener for user notifications
  useEffect(() => {
    if (!userId) return;
    const unsub = listenToCollection<Notification>(
      'notifications',
      [where('userId', '==', userId), orderBy('createdAt', 'desc')],
      (items) => {
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.read).length);
        setLoading(false);
      }
    );
    setLoading(true);
    return () => unsub();
  }, [userId]);

  // Mark as read
  const markAsRead = useCallback(async (notifId: string) => {
    await updateDocument('notifications', notifId, { read: true });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => updateDocument('notifications', n.id, { read: true })));
  }, [notifications]);

  // Create notification
  const createNotification = useCallback(async (
    targetUserId: string,
    title: string,
    message: string,
    type: Notification['type'],
    eventId?: string
  ) => {
    await addDocument('notifications', {
      userId: targetUserId,
      title,
      message,
      type,
      read: false,
      eventId: eventId || null,
    });
  }, []);

  return {
    notifications, unreadCount, loading,
    markAsRead, markAllAsRead, createNotification,
  };
}
