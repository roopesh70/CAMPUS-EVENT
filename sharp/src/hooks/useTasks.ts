'use client';

import { useState, useCallback } from 'react';
import { queryDocs, addDocument, updateDocument, where, orderBy } from '@/lib/firestore';
import type { EventTask, TaskStatus } from '@/types';

export function useTasks() {
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEventTasks = useCallback(async (eventId: string) => {
    setLoading(true);
    const data = await queryDocs<EventTask>('tasks', [
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc'),
    ]);
    setTasks(data);
    setLoading(false);
    return data;
  }, []);

  const createTask = useCallback(async (data: Omit<EventTask, 'id' | 'createdAt'>) => {
    const docRef = await addDocument('tasks', data);
    return docRef.id;
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    await updateDocument('tasks', taskId, { status });
  }, []);

  return { tasks, loading, fetchEventTasks, createTask, updateTaskStatus };
}
