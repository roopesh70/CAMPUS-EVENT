'use client';

import { useState, useCallback } from 'react';
import {
  queryDocs, addDocument, updateDocument, deleteDocument,
  where, orderBy, serverTimestamp, increment, doc, db,
} from '@/lib/firestore';
import { updateDoc } from 'firebase/firestore';
import type { Registration, RegistrationStatus, AttendanceStatus } from '@/types';

export function useRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  // Register for event
  const registerForEvent = useCallback(async (
    eventId: string,
    eventTitle: string,
    userId: string,
    userName: string,
    userDepartment: string,
    capacity: number,
    registeredCount: number
  ) => {
    const status: RegistrationStatus = registeredCount >= capacity ? 'waitlisted' : 'confirmed';

    // Generate unique registration ID: REG-{EVENT_PREFIX}-{RANDOM6}
    const prefix = eventTitle.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'EVNT';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const registrationId = `REG-${prefix}-${random}`;

    const docRef = await addDocument('registrations', {
      eventId,
      eventTitle,
      userId,
      userName,
      userDepartment,
      status,
      attendanceStatus: 'pending',
      feedbackSubmitted: false,
      registrationId,
      registrationTime: serverTimestamp(),
    });

    // Increment event registered count
    if (status === 'confirmed') {
      await updateDoc(doc(db, 'events', eventId), {
        registeredCount: increment(1),
      });
    }

    return { id: docRef.id, status, registrationId };
  }, []);

  // Cancel registration (with waitlist auto-promotion)
  const cancelRegistration = useCallback(async (regId: string, eventId: string) => {
    await updateDocument('registrations', regId, { status: 'cancelled' });
    await updateDoc(doc(db, 'events', eventId), {
      registeredCount: increment(-1),
    });

    // Auto-promote first waitlisted registration
    const waitlisted = await queryDocs<Registration>('registrations', [
      where('eventId', '==', eventId),
      where('status', '==', 'waitlisted'),
      orderBy('registrationTime', 'asc'),
    ]);

    if (waitlisted.length > 0) {
      await updateDocument('registrations', waitlisted[0].id, { status: 'confirmed' });
      await updateDoc(doc(db, 'events', eventId), {
        registeredCount: increment(1),
      });
    }
  }, []);

  // Fetch user registrations
  const fetchUserRegistrations = useCallback(async (userId: string) => {
    setLoading(true);
    const data = await queryDocs<Registration>('registrations', [
      where('userId', '==', userId),
      orderBy('registrationTime', 'desc'),
    ]);
    setRegistrations(data);
    setLoading(false);
    return data;
  }, []);

  // Fetch event participants
  const fetchEventParticipants = useCallback(async (eventId: string) => {
    setLoading(true);
    const data = await queryDocs<Registration>('registrations', [
      where('eventId', '==', eventId),
      orderBy('registrationTime', 'asc'),
    ]);
    setRegistrations(data);
    setLoading(false);
    return data;
  }, []);

  // Mark attendance
  const markAttendance = useCallback(async (
    regId: string,
    eventId: string,
    status: AttendanceStatus
  ) => {
    await updateDocument('registrations', regId, { attendanceStatus: status });
    if (status === 'present') {
      await updateDoc(doc(db, 'events', eventId), {
        attendanceCount: increment(1),
      });
    }
  }, []);

  // Check if user is registered for event
  const checkRegistration = useCallback(async (eventId: string, userId: string) => {
    const data = await queryDocs<Registration>('registrations', [
      where('eventId', '==', eventId),
      where('userId', '==', userId),
    ]);
    return data.length > 0 ? data[0] : null;
  }, []);

  return {
    registrations, loading,
    registerForEvent, cancelRegistration,
    fetchUserRegistrations, fetchEventParticipants,
    markAttendance, checkRegistration,
  };
}
