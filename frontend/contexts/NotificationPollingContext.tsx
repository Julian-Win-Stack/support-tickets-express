'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyNotifications } from '@/lib/api';
import { Toast, type ToastItem } from '@/app/components/Toast';
import type { Notification } from '@/types';

const POLL_INTERVAL_MS = 10000; // 10 seconds

export function NotificationPollingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [toast, setToast] = useState<ToastItem | null>(null);
    const lastSeenIdsRef = useRef<Set<number>>(new Set());

    const removeToast = useCallback(() => {
        setToast(null);
    }, []);

    const poll = useCallback(async () => {
        try {
            const { data } = await getMyNotifications();
            const notifications = data as Notification[];
            const currentIds = new Set(notifications.map(n => n.id));
            const prevIds = lastSeenIdsRef.current;

            const newNotifications = notifications.filter(n => !prevIds.has(n.id) && n.read_at === null);

            lastSeenIdsRef.current = currentIds;

            if (newNotifications.length === 1) {
                setToast({
                    subject: newNotifications[0].subject,
                    message: newNotifications[0].message,
                });
            } else if (newNotifications.length >= 2) {
                setToast({
                    subject: `You have got ${newNotifications.length} notifications!`
                });
            }
        } catch (error) {
            console.error(error);
        }
    }, []
    );

    useEffect(() => {
        if (!user || user.role !== 'admin') return;
    
        poll();
    
        const interval = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
      }, [user, poll]);

    return (
        <>
        {children}
        <Toast toast={toast} onRemove={removeToast} />
      </>
    );
}