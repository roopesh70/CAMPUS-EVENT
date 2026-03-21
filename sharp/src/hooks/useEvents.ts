'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  queryDocs, addDocument, updateDocument, getDocument, deleteDocument,
  listenToCollection, where, orderBy, limit, serverTimestamp, increment,
  doc, db,
} from '@/lib/firestore';
import { updateDoc, runTransaction, query, collection } from 'firebase/firestore';
import { uploadFile } from '@/lib/storage';
import { isTimeOverlapping } from '@/lib/utils';
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

  const createEvent = useCallback(async (
    data: Omit<CampusEvent, 'id' | 'createdAt' | 'updatedAt' | 'registeredCount' | 'attendanceCount' | 'conflictFlag'>,
    posterFile?: File
  ) => {
    const eventType = data.eventType || 'PHYSICAL';
    let docRefId = '';

    await runTransaction(db, async (transaction) => {
      // 1. Double-Booking Validation
      if (eventType === 'PHYSICAL' && data.venueId) {
        // Find events in the same venue that are PHYSICAL and not draft/rejected
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('venueId', '==', data.venueId));
        // @ts-ignore - firebase/firestore transaction.get supports query, but types might be outdated
        const querySnapshot = await transaction.get(q) as any;

        const newStart = data.startTime.toMillis();
        const newEnd = data.endTime.toMillis();

        for (const docSnap of querySnapshot.docs) {
          const evt = docSnap.data() as CampusEvent;
          // Only block if the overlapping event is actually APPROVED
          if (evt.status !== 'approved') continue;
          if (evt.eventType === 'ONLINE') continue;

          const eStart = evt.startTime.toMillis();
          const eEnd = evt.endTime.toMillis();

          if (isTimeOverlapping(newStart, newEnd, eStart, eEnd)) {
            throw new Error("Venue already booked for this time slot");
          }
        }
      }

      // Generate a new reference
      const newDocRef = doc(collection(db, 'events'));
      docRefId = newDocRef.id;

      transaction.set(newDocRef, {
        ...data,
        eventType,
        registeredCount: 0,
        attendanceCount: 0,
        conflictFlag: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    let posterUrl = '';
    if (posterFile) {
      posterUrl = await uploadFile(`events/${docRefId}/poster.${posterFile.name.split('.').pop()}`, posterFile);
      await updateDocument('events', docRefId, { posterUrl });
    }

    return docRefId;
  }, []);

  // Update event status (admin approve/reject)
  const updateEventStatus = useCallback(async (
    eventId: string,
    status: EventStatus,
    comment?: string
  ) => {
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'events', eventId);
      const currentEventSnap = await transaction.get(eventRef);
      if (!currentEventSnap.exists()) throw new Error("Event not found");
      const currentEvent = currentEventSnap.data() as CampusEvent;

      // If approving, strictly enforce double-booking prevention against other approved events
      if (status === 'approved') {
        if (currentEvent.eventType === 'PHYSICAL' && currentEvent.venueId) {
          const eventsRef = collection(db, 'events');
          const q = query(
            eventsRef,
            where('venueId', '==', currentEvent.venueId),
            where('status', '==', 'approved')
          );
          // @ts-ignore - firebase/firestore transaction.get supports query, but types might be outdated
          const existingEventsSnap = await transaction.get(q) as any;

          const newStart = currentEvent.startTime.toMillis();
          const newEnd = currentEvent.endTime.toMillis();

          for (const docSnap of existingEventsSnap.docs) {
            if (docSnap.id === eventId) continue;
            const evt = docSnap.data() as CampusEvent;
            if (evt.eventType === 'ONLINE') continue;

            const eStart = evt.startTime.toMillis();
            const eEnd = evt.endTime.toMillis();

            if (isTimeOverlapping(newStart, newEnd, eStart, eEnd)) {
              throw new Error(`Venue is already allotted to "${evt.title}" for this time slot.`);
            }
          }
        }
      }

      transaction.update(eventRef, {
        status,
        ...(comment ? { approvalComment: comment } : {}),
        updatedAt: serverTimestamp(),
      });
    });
  }, []);

  // Update event data
  const updateEvent = useCallback(async (
    eventId: string,
    data: Partial<CampusEvent>
  ) => {
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'events', eventId);
      const currentEventSnap = await transaction.get(eventRef);
      if (!currentEventSnap.exists()) throw new Error("Event not found");
      const currentEvent = currentEventSnap.data() as CampusEvent;

      const eventType = data.eventType !== undefined ? data.eventType : (currentEvent.eventType || 'PHYSICAL');
      const venueId = data.venueId !== undefined ? data.venueId : currentEvent.venueId;

      if (eventType === 'PHYSICAL' && venueId) {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('venueId', '==', venueId));
        // @ts-ignore - firebase/firestore transaction.get supports query, but types might be outdated
        const querySnapshot = await transaction.get(q) as any;

        const newStart = data.startTime ? data.startTime.toMillis() : currentEvent.startTime.toMillis();
        const newEnd = data.endTime ? data.endTime.toMillis() : currentEvent.endTime.toMillis();

        for (const docSnap of querySnapshot.docs) {
          if (docSnap.id === eventId) continue; // skip self
          const evt = docSnap.data() as CampusEvent;
          if (evt.status !== 'approved') continue; // Only block on APPROVED events
          if (evt.eventType === 'ONLINE') continue;

          const eStart = evt.startTime.toMillis();
          const eEnd = evt.endTime.toMillis();

          if (isTimeOverlapping(newStart, newEnd, eStart, eEnd)) {
            throw new Error("Venue already booked for this time slot");
          }
        }
      }

      transaction.update(eventRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    });
  }, []);

  // Delete event
  const deleteEvent = useCallback(async (eventId: string) => {
    await deleteDocument('events', eventId);
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
    getEvent, createEvent, updateEventStatus, updateEvent, deleteEvent, subscribeToEvents,
  };
}
