'use client';

import { useState, useCallback } from 'react';
import { queryDocs, addDocument, where, orderBy, limit } from '@/lib/firestore';
import type { ActivityLog } from '@/types';

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async (maxItems = 50) => {
    setLoading(true);
    const data = await queryDocs<ActivityLog>('activityLogs', [
      orderBy('createdAt', 'desc'),
      limit(maxItems),
    ]);
    setLogs(data);
    setLoading(false);
    return data;
  }, []);

  const logActivity = useCallback(async (
    actorId: string,
    actorName: string,
    role: string,
    action: string,
    entityId: string,
    entityType: ActivityLog['entityType'],
    entityName?: string
  ) => {
    await addDocument('activityLogs', {
      actorId,
      actorName,
      role,
      action,
      entityId,
      entityType,
      ...(entityName && { entityName })
    });
  }, []);

  return { logs, loading, fetchLogs, logActivity };
}
