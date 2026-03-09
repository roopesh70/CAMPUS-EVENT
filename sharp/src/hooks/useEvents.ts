'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  queryDocs, addDocument, updateDocument, getDocument,
  listenToCollection, where, orderBy, limit, serverTimestamp, increment,
  doc, db,
} from '@/lib/firestore';
import { updateDoc } from 'firebase/firestore';
import { uploadFile } from '@/lib/storage';
import type { CampusEvent, EventStatus } from '@/types';

export function useEvents() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all approved/public events
  const fetchPublicEvents = useCallback(async () => {
    setLoading(true);
    const data = await queryDocs<CampusEvent>('events', [
      where('status', '==', 'approved'),
      orderBy('startTime', 'asc'),
    ]);
    setEvents(data);
    setLoading(false);
    return data;
  }, []);

  // Fetch events by organizer
  const fetchOrganizerEvents = useCallback(async (organizerId: string) => {
    setLoading(true);
    const data = await queryDocs<CampusEvent>('events', [
      where('organizerId', '==', organizerId),
      orderBy('createdAt', 'desc'),
    ]);
    setEvents(data);
    setLoading(false);
    return data;
  }, []);

  // Fetch events by status (for admin)
  const fetchEventsByStatus = useCallback(async (status: EventStatus) => {
    setLoading(true);
    const data = await queryDocs<CampusEvent>('events', [
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
    ]);
    setEvents(data);
    setLoading(false);
    return data;
  }, []);

  // Fetch all events (admin)
  const fetchAllEvents = useCallback(async () => {
    setLoading(true);
    const data = await queryDocs<CampusEvent>('events', [
      orderBy('createdAt', 'desc'),
    ]);
    setEvents(data);
    setLoading(false);
    return data;
  }, []);

  // Get single event
  const getEvent = useCallback(async (eventId: string) => {
    return getDocument<CampusEvent>('events', eventId);
  }, []);

  // Create event
  const createEvent = useCallback(async (
    data: Omit<CampusEvent, 'id' | 'createdAt' | 'updatedAt' | 'registeredCount' | 'attendanceCount' | 'conflictFlag'>,
    posterFile?: File
  ) => {
    let posterUrl = '';
    const docRef = await addDocument('events', {
      ...data,
      registeredCount: 0,
      attendanceCount: 0,
      conflictFlag: false,
      posterUrl: '',
      updatedAt: serverTimestamp(),
    });

    if (posterFile) {
      posterUrl = await uploadFile(`events/${docRef.id}/poster.${posterFile.name.split('.').pop()}`, posterFile);
      await updateDocument('events', docRef.id, { posterUrl });
    }

    return docRef.id;
  }, []);

  // Update event status (admin approve/reject)
  const updateEventStatus = useCallback(async (
    eventId: string,
    status: EventStatus,
    comment?: string
  ) => {
    await updateDocument('events', eventId, {
      status,
      ...(comment ? { approvalComment: comment } : {}),
    });
  }, []);

  // Update event data
  const updateEvent = useCallback(async (
    eventId: string,
    data: Partial<CampusEvent>
  ) => {
    await updateDocument('events', eventId, data);
  }, []);

  // Listen to events in real-time
  const subscribeToEvents = useCallback((
    constraints: Parameters<typeof listenToCollection>[1] = [orderBy('startTime', 'asc')]
  ) => {
    return listenToCollection<CampusEvent>('events', constraints, setEvents);
  }, []);

  return {
    events, loading,
    fetchPublicEvents, fetchOrganizerEvents, fetchEventsByStatus, fetchAllEvents,
    getEvent, createEvent, updateEventStatus, updateEvent, subscribeToEvents,
  };
}
