'use client';

import { useState, useCallback } from 'react';
import {
  queryDocs, updateDocument, getDocument, deleteDocument,
  listenToCollection, where, orderBy, serverTimestamp,
  doc, db
} from '@/lib/firestore';
import { runTransaction, query, collection, getDoc, getDocs } from 'firebase/firestore';
import { uploadFile } from '@/lib/storage';
import { isTimeOverlapping } from '@/lib/utils';
import type { CampusEvent, EventStatus } from '@/types';

export function useEvents() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all approved/public events
  const fetchPublicEvents = useCallback(async (includeArchived = false) => {
    setLoading(true);
    const constraints: any[] = [
      where('status', '==', 'approved'),
      orderBy('startTime', 'asc'),
    ];
    const data = await queryDocs<CampusEvent>('events', constraints);
    const filtered = includeArchived ? data : data.filter(e => !e.archived);
    setEvents(filtered);
    setLoading(false);
    return filtered;
  }, []);

  // Fetch events by organizer
  const fetchOrganizerEvents = useCallback(async (organizerId: string, includeArchived = false) => {
    setLoading(true);
    const data = await queryDocs<CampusEvent>('events', [
      where('organizerId', '==', organizerId),
      orderBy('createdAt', 'desc'),
    ]);
    const filtered = includeArchived ? data : data.filter(e => !e.archived);
    setEvents(filtered);
    setLoading(false);
    return filtered;
  }, []);

  // Fetch events by status (for admin)
  const fetchEventsByStatus = useCallback(async (status: EventStatus, includeArchived = false) => {
    setLoading(true);
    const data = await queryDocs<CampusEvent>('events', [
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
    ]);
    const filtered = includeArchived ? data : data.filter(e => !e.archived);
    setEvents(filtered);
    setLoading(false);
    return filtered;
  }, []);

  // Fetch all events (admin)
  const fetchAllEvents = useCallback(async (includeArchived = true) => {
    setLoading(true);
    const data = await queryDocs<CampusEvent>('events', [
      orderBy('createdAt', 'desc'),
    ]);
    const filtered = includeArchived ? data : data.filter(e => !e.archived);
    setEvents(filtered);
    setLoading(false);
    return filtered;
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

    // Date validation: reject past events and start >= end
    if (data.startTime && data.endTime) {
      const now = Date.now();
      if (data.startTime.toMillis() < now) {
        throw new Error('Event date/time cannot be in the past.');
      }
      if (data.startTime.toMillis() >= data.endTime.toMillis()) {
        throw new Error('Start time must be before end time.');
      }
    }

    // 1. Double-Booking Validation (Outside transaction)
    if (eventType === 'PHYSICAL' && data.venueId) {
      const q = query(collection(db, 'events'), where('venueId', '==', data.venueId), where('status', '==', 'approved'));
      const querySnapshot = await getDocs(q);

      const newStart = data.startTime.toMillis();
      const newEnd = data.endTime.toMillis();

      for (const docSnap of querySnapshot.docs) {
        const evt = docSnap.data() as CampusEvent;
        if (evt.eventType === 'ONLINE') continue;
        const eStart = evt.startTime.toMillis();
        const eEnd = evt.endTime.toMillis();
        if (isTimeOverlapping(newStart, newEnd, eStart, eEnd)) {
          throw new Error("Venue already booked for this time slot");
        }
      }
    }

    await runTransaction(db, async (transaction) => {
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

    if (posterFile) {
      const posterUrl = await uploadFile(`events/${docRefId}/poster.${posterFile.name.split('.').pop()}`, posterFile);
      await updateDocument('events', docRefId, { posterUrl });
    }

    return docRefId;
  }, []);

  const updateEventStatus = useCallback(async (
    eventId: string,
    status: EventStatus,
    comment?: string
  ) => {
    // 1. Double-Booking Check (Outside transaction)
    if (status === 'approved') {
      const snap = await getDoc(doc(db, 'events', eventId));
      if (!snap.exists()) throw new Error("Event not found");
      const currentEvent = snap.data() as CampusEvent;

      if (currentEvent.eventType === 'PHYSICAL' && currentEvent.venueId) {
        const q = query(collection(db, 'events'), where('venueId', '==', currentEvent.venueId), where('status', '==', 'approved'));
        const existingEventsSnap = await getDocs(q);

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

    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'events', eventId);
      transaction.update(eventRef, {
        status,
        ...(comment ? { approvalComment: comment } : {}),
        updatedAt: serverTimestamp(),
      });
    });
  }, []);

  const updateEvent = useCallback(async (
    eventId: string,
    data: Partial<CampusEvent>
  ) => {
    // 1. Double-Booking Check (Outside transaction)
    const snap = await getDoc(doc(db, 'events', eventId));
    if (!snap.exists()) throw new Error("Event not found");
    const currentEvent = snap.data() as CampusEvent;

    // Date validation: reject past events and start >= end
    const newStart = data.startTime ? data.startTime.toMillis() : currentEvent.startTime.toMillis();
    const newEnd = data.endTime ? data.endTime.toMillis() : currentEvent.endTime.toMillis();
    if (newStart < Date.now()) {
      throw new Error('Event date/time cannot be in the past.');
    }
    if (newStart >= newEnd) {
      throw new Error('Start time must be before end time.');
    }

    const eventType = data.eventType !== undefined ? data.eventType : (currentEvent.eventType || 'PHYSICAL');
    const venueId = data.venueId !== undefined ? data.venueId : currentEvent.venueId;

    if (eventType === 'PHYSICAL' && venueId) {
      const q = query(collection(db, 'events'), where('venueId', '==', venueId), where('status', '==', 'approved'));
      const querySnapshot = await getDocs(q);

      const newStart = data.startTime ? data.startTime.toMillis() : currentEvent.startTime.toMillis();
      const newEnd = data.endTime ? data.endTime.toMillis() : currentEvent.endTime.toMillis();

      for (const docSnap of querySnapshot.docs) {
        if (docSnap.id === eventId) continue;
        const evt = docSnap.data() as CampusEvent;
        if (evt.eventType === 'ONLINE') continue;
        const eStart = evt.startTime.toMillis();
        const eEnd = evt.endTime.toMillis();
        if (isTimeOverlapping(newStart, newEnd, eStart, eEnd)) {
          throw new Error("Venue already booked for this time slot");
        }
      }
    }

    await updateDocument('events', eventId, data);
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    await deleteDocument('events', eventId);
  }, []);

  const subscribeToEvents = useCallback((
    constraints: any[] = [orderBy('startTime', 'asc')]
  ) => {
    return listenToCollection<CampusEvent>('events', constraints, setEvents);
  }, []);

  return {
    events, loading,
    fetchPublicEvents, fetchOrganizerEvents, fetchEventsByStatus, fetchAllEvents,
    getEvent, createEvent, updateEventStatus, updateEvent, deleteEvent, subscribeToEvents,
  };
}
