'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  queryDocs, addDocument, updateDocument, getDocument, deleteDocument,
  listenToCollection, where, orderBy, limit, serverTimestamp, increment,
  doc, db,
} from '@/lib/firestore';
import { updateDoc } from 'firebase/firestore';
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
    // 1. Double-Booking Validation
    const eventType = data.eventType || 'PHYSICAL';
    if (eventType === 'PHYSICAL' && data.venueId) {
      // Find events in the same venue that are PHYSICAL and not draft/rejected
      const existingEvents = await queryDocs<CampusEvent>('events', [
        where('venueId', '==', data.venueId)
      ]);

      const newStart = data.startTime.toMillis();
      const newEnd = data.endTime.toMillis();

      for (const evt of existingEvents) {
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

    let posterUrl = '';
    const docRef = await addDocument('events', {
      ...data,
      eventType,
      registeredCount: 0,
      attendanceCount: 0,
      conflictFlag: false,
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
    // If approving, strictly enforce double-booking prevention against other approved events
    if (status === 'approved') {
      const currentEvent = await getDocument<CampusEvent>('events', eventId);
      if (!currentEvent) throw new Error("Event not found");

      if (currentEvent.eventType === 'PHYSICAL' && currentEvent.venueId) {
        const existingEvents = await queryDocs<CampusEvent>('events', [
          where('venueId', '==', currentEvent.venueId),
          where('status', '==', 'approved')
        ]);

        const newStart = currentEvent.startTime.toMillis();
        const newEnd = currentEvent.endTime.toMillis();

        for (const evt of existingEvents) {
          if (evt.id === eventId) continue;
          if (evt.eventType === 'ONLINE') continue;

          const eStart = evt.startTime.toMillis();
          const eEnd = evt.endTime.toMillis();

          if (isTimeOverlapping(newStart, newEnd, eStart, eEnd)) {
            throw new Error(`Venue is already allotted to "${evt.title}" for this time slot.`);
          }
        }
      }
    }

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
    // We need the current event to check if we are updating a physical event, and if times have changed.
    const currentEvent = await getDocument<CampusEvent>('events', eventId);
    if (!currentEvent) throw new Error("Event not found");

    const eventType = data.eventType !== undefined ? data.eventType : (currentEvent.eventType || 'PHYSICAL');
    const venueId = data.venueId !== undefined ? data.venueId : currentEvent.venueId;
    
    if (eventType === 'PHYSICAL' && venueId) {
      const existingEvents = await queryDocs<CampusEvent>('events', [
        where('venueId', '==', venueId)
      ]);

      const newStart = data.startTime ? data.startTime.toMillis() : currentEvent.startTime.toMillis();
      const newEnd = data.endTime ? data.endTime.toMillis() : currentEvent.endTime.toMillis();

      for (const evt of existingEvents) {
        if (evt.id === eventId) continue; // skip self
        if (evt.status !== 'approved') continue; // Only block on APPROVED events
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
