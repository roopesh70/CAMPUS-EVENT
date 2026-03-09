'use client';

import { useState, useCallback } from 'react';
import { queryDocs, addDocument, where, orderBy } from '@/lib/firestore';
import type { Feedback } from '@/types';

export function useFeedback() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEventFeedback = useCallback(async (eventId: string) => {
    setLoading(true);
    const data = await queryDocs<Feedback>('feedback', [
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc'),
    ]);
    setFeedbackList(data);
    setLoading(false);
    return data;
  }, []);

  const submitFeedback = useCallback(async (
    eventId: string,
    userId: string | null,
    ratings: Feedback['ratings'],
    comment: string,
    anonymous: boolean
  ) => {
    const docRef = await addDocument('feedback', {
      eventId,
      userId: anonymous ? null : userId,
      ratings,
      comment,
      anonymous,
    });
    return docRef.id;
  }, []);

  return { feedbackList, loading, fetchEventFeedback, submitFeedback };
}
