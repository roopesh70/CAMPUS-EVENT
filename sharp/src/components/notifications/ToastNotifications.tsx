'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/authStore';
import { COLORS } from '@/lib/constants';
import type { Notification, NotificationType } from '@/types';

type ToastItem = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
};

const TYPE_COLORS: Record<NotificationType, string> = {
  approval: COLORS.teal,
  registration: COLORS.yellow,
  reminder: COLORS.lavender,
  update: COLORS.pink,
  cancellation: COLORS.red,
  certificate: COLORS.green,
  system: '#ffffff',
};

export default function ToastNotifications() {
  const { profile, isAuthenticated } = useAuthStore();
  const userId = profile?.uid;
  const enableInApp = profile?.preferences?.notifications?.inApp ?? true;
  const { notifications } = useNotifications(userId);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const initializedRef = useRef(false);

  useEffect(() => {
    seenIdsRef.current = new Set();
    initializedRef.current = false;
    setToasts([]);
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current.clear();
  }, [userId]);

  useEffect(() => {
    if (!isAuthenticated || !userId || !enableInApp) return;
    if (!initializedRef.current) {
      notifications.forEach((n) => seenIdsRef.current.add(n.id));
      initializedRef.current = true;
      return;
    }

    const newItems = notifications.filter((n) => !seenIdsRef.current.has(n.id) && !n.read);
    if (newItems.length === 0) return;

    newItems.forEach((n) => {
      seenIdsRef.current.add(n.id);
      pushToast(n);
    });
  }, [notifications, isAuthenticated, userId, enableInApp]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, []);

  const pushToast = (notif: Notification) => {
    const toast: ToastItem = {
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
    };

    setToasts((prev) => [toast, ...prev].slice(0, 4));
    const timeout = setTimeout(() => removeToast(toast.id), 6000);
    timeoutsRef.current.set(toast.id, timeout);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeout = timeoutsRef.current.get(id);
    if (timeout) clearTimeout(timeout);
    timeoutsRef.current.delete(id);
  };

  const stack = useMemo(() => toasts, [toasts]);

  if (!isAuthenticated || !enableInApp || stack.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:top-4 sm:bottom-auto z-50 flex w-[92vw] max-w-[360px] flex-col gap-3 pointer-events-none">
      {stack.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto relative border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden transition-all duration-300"
          style={{
            animation: 'toast-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <div className="flex items-start gap-3 p-4">
            <div
              className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-[2px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              style={{ background: TYPE_COLORS[toast.type] }}
            />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-black uppercase italic leading-none pt-0.5">{toast.title}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="absolute top-3 right-3 rounded-full border-[2px] border-black bg-white p-1 text-[10px] font-black hover:bg-yellow-200 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[1px] active:translate-x-[1px]"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <p className="mt-1.5 text-[11px] font-medium leading-snug text-slate-700 pr-5">{toast.message}</p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400">
                <Bell className="h-2.5 w-2.5" />
                <span>In-App Notification</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
