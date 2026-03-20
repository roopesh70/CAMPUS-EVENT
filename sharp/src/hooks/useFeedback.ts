'use client';

import { useState, useCallback } from 'react';
import { queryDocs, addDocument, updateDocument, where, orderBy } from '@/lib/firestore';
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

  const fetchAllFeedback = useCallback(async () => {
    setLoading(true);
    const data = await queryDocs<Feedback>('feedback', [
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
    // ─── Guard: Must have attended the event to submit feedback ───
    if (userId) {
      const existing = await queryDocs<any>('registrations', [
        where('eventId', '==', eventId),
        where('userId', '==', userId),
      ]);
      const reg = existing[0];
      if (!reg || reg.attendanceStatus !== 'present') {
        return { error: 'You must have attended this event to submit feedback' };
      }
      
      // Also prevent duplicate feedback
      if (reg.feedbackSubmitted) {
        return { error: 'You have already submitted feedback for this event' };
      }
    }
    // ──────────────────────────────────────────────────────────────

    const docRef = await addDocument('feedback', {
      eventId,
      userId: anonymous ? null : userId,
      ratings,
      comment,
      anonymous,
    });

    if (userId) {
      // Mark feedback as submitted in the registration doc
      const existing = await queryDocs<any>('registrations', [
        where('eventId', '==', eventId),
        where('userId', '==', userId),
      ]);
      if (existing.length > 0) {
        await updateDocument('registrations', existing[0].id, { feedbackSubmitted: true });
      }
    }

    return { id: docRef.id };
  }, []);

  return { feedbackList, loading, fetchEventFeedback, fetchAllFeedback, submitFeedback };
}

// Helper for basic sentiment analysis
export function analyzeSentiment(comment: string): 'positive' | 'neutral' | 'negative' {
  if (!comment) return 'neutral';
  const text = comment.toLowerCase();
  
  const positiveWords = ['great', 'excellent', 'good', 'awesome', 'amazing', 'loved', 'helpful', 'informative', 'perfect', 'fantastic', 'best', 'enjoyed', 'insightful'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'boring', 'unorganized', 'waste', 'disappointing', 'worst', 'confusing', 'unhelpful', 'needs improvement'];
  
  let score = 0;
  positiveWords.forEach(w => { if (text.includes(w)) score++; });
  negativeWords.forEach(w => { if (text.includes(w)) score--; });
  
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}
