'use client';

import { useState, useCallback } from 'react';
import { queryDocs, addDocument, updateDocument, where, orderBy } from '@/lib/firestore';
import type { EventTask, TaskStatus } from '@/types';

export function useTasks() {
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEventTasks = useCallback(async (eventId: string) => {
    setLoading(true);
    try {
      const data = await queryDocs<EventTask>('tasks', [
        where('eventId', '==', eventId),
        orderBy('createdAt', 'desc'),
      ]);
      setTasks(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrganizerTasks = useCallback(async (eventIds: string[]) => {
    if (eventIds.length === 0) return [];
    setLoading(true);

    try {
      // Chunked queries for 'in' support (max 10)
      const chunkedEventIds = [];
      for (let i = 0; i < eventIds.length; i += 10) {
        chunkedEventIds.push(eventIds.slice(i, i + 10));
      }

      const allTasks: EventTask[] = [];
      for (const chunk of chunkedEventIds) {
        const data = await queryDocs<EventTask>('tasks', [
          where('eventId', 'in', chunk),
          orderBy('createdAt', 'desc'),
        ]);
        allTasks.push(...data);
      }

      setTasks(allTasks);
      return allTasks;
    } finally {
      setLoading(false);
    }
}, []);

  const createTask = useCallback(async (data: Omit<EventTask, 'id' | 'createdAt'>) => {
  const docRef = await addDocument('tasks', data);
  return docRef.id;
}, []);

const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
  await updateDocument('tasks', taskId, { status });
}, []);

return { tasks, loading, fetchEventTasks, fetchOrganizerTasks, createTask, updateTaskStatus };
}
