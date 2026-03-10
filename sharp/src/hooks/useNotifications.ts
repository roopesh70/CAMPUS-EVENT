'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  queryDocs, addDocument, updateDocument,
  listenToCollection, where, orderBy,
} from '@/lib/firestore';
import type { Notification } from '@/types';

export function useNotifications(userId: string | undefined) {
  const [personalNotifs, setPersonalNotifs] = useState<Notification[]>([]);
  const [broadcastNotifs, setBroadcastNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Listener 1: Personal notifications (userId == current user)
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const unsub = listenToCollection<Notification>(
      'notifications',
      [where('userId', '==', userId), orderBy('createdAt', 'desc')],
      (items) => {
        setPersonalNotifs(items);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [userId]);

  // Listener 2: Broadcast notifications (userId == 'broadcast') — visible to everyone
  useEffect(() => {
    if (!userId) return;
    const unsub = listenToCollection<Notification>(
      'notifications',
      [where('userId', '==', 'broadcast'), orderBy('createdAt', 'desc')],
      (items) => {
        setBroadcastNotifs(items);
      }
    );
    return () => unsub();
  }, [userId]);

  // Merge personal + broadcast, sort by createdAt desc
  const notifications = [...personalNotifs, ...broadcastNotifs].sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() ? a.createdAt.toDate().getTime() : 0;
    const bTime = b.createdAt?.toDate?.() ? b.createdAt.toDate().getTime() : 0;
    return bTime - aTime;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark as read
  const markAsRead = useCallback(async (notifId: string) => {
    await updateDocument('notifications', notifId, { read: true });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => updateDocument('notifications', n.id, { read: true })));
  }, [notifications]);

  // Create notification for a specific user
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

  // Broadcast notification (visible to ALL users)
  const broadcastNotification = useCallback(async (
    title: string,
    message: string,
    type: Notification['type'],
    eventId?: string
  ) => {
    await addDocument('notifications', {
      userId: 'broadcast',
      title,
      message,
      type,
      read: false,
      eventId: eventId || null,
    });
  }, []);

  return {
    notifications, unreadCount, loading,
    markAsRead, markAllAsRead, createNotification, broadcastNotification,
  };
}
