'use client';

import { useState, useCallback } from 'react';
import {
  queryDocs, addDocument, updateDocument, deleteDocument,
  where, orderBy, serverTimestamp, increment, doc, db,
} from '@/lib/firestore';
import { updateDoc, getDoc } from 'firebase/firestore';
import type { Registration, RegistrationStatus, AttendanceStatus, CampusEvent } from '@/types';

export function useRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  // Register for event — with DUPLICATE PREVENTION guard
  const registerForEvent = useCallback(async (
    eventId: string,
    eventTitle: string,
    userId: string,
    userName: string,
    userDepartment: string,
    capacity: number,
    registeredCount: number
  ) => {
    // ─── Guard: Check if event is in the past or registration is closed ───
    const eventSnap = await getDoc(doc(db, 'events', eventId));
    if (!eventSnap.exists()) return { error: 'Event not found' };
    const eventData = eventSnap.data() as CampusEvent;
    
    const now = Date.now();
    if (eventData.startTime?.toDate && eventData.startTime.toDate().getTime() <= now) {
      return { error: 'Event has already started or ended', pastEvent: true };
    }
    if (eventData.registrationDeadline?.toDate && eventData.registrationDeadline.toDate().getTime() <= now) {
      return { error: 'Registration deadline has passed', pastDeadline: true };
    }

    // ─── Guard: Check for existing ACTIVE registration ───────────────
    const existing = await queryDocs<Registration>('registrations', [
      where('eventId', '==', eventId),
      where('userId', '==', userId),
      where('status', 'in', ['confirmed', 'waitlisted']),
    ]);
    if (existing.length > 0) {
      // Already registered — return existing record without writing anything
      return { id: existing[0].id, status: existing[0].status, registrationId: existing[0].registrationId, duplicate: true };
    }
    // ─────────────────────────────────────────────────────────────────

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

    return { id: docRef.id, status, registrationId, duplicate: false };
  }, []);

  // Cancel registration — with VALIDITY GUARD
  const cancelRegistration = useCallback(async (regId: string, eventId: string, userId?: string) => {
    // ─── Guard: Verify registration exists, belongs to userId, and is cancellable ───
    const existing = await queryDocs<Registration>('registrations', [
      where('eventId', '==', eventId),
      ...(userId ? [where('userId', '==', userId)] : []),
    ]);

    const reg = existing.find(r => r.id === regId);
    if (!reg) {
      console.warn('[cancelRegistration] Registration not found:', regId);
      return { error: 'Registration not found' };
    }
    if (reg.status === 'cancelled') {
      console.warn('[cancelRegistration] Already cancelled:', regId);
      return { error: 'Already cancelled' };
    }
    if (reg.attendanceStatus === 'present') {
      console.warn('[cancelRegistration] Cannot cancel an attended registration:', regId);
      return { error: 'Cannot cancel. You have already attended this event.' };
    }
    // ─────────────────────────────────────────────────────────────────

    const wasConfirmed = reg.status === 'confirmed';
    await updateDocument('registrations', regId, { status: 'cancelled' });

    // Only decrement if it was confirmed (not waitlisted)
    if (wasConfirmed) {
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
    }

    return { success: true };
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
    // Get previous status to adjust attendance count properly
    const regSnap = await getDoc(doc(db, 'registrations', regId));
    if (!regSnap.exists()) return;
    const prevStatus = regSnap.data().attendanceStatus;

    await updateDocument('registrations', regId, { attendanceStatus: status });
    
    // Increment only if newly marked present
    if (status === 'present' && prevStatus !== 'present') {
      await updateDoc(doc(db, 'events', eventId), {
        attendanceCount: increment(1),
      });
    } 
    // Decrement if changing from present to something else
    else if (status !== 'present' && prevStatus === 'present') {
      await updateDoc(doc(db, 'events', eventId), {
        attendanceCount: increment(-1),
      });
    }
  }, []);

  // Check if user is registered for event (returns active registration or null)
  const checkRegistration = useCallback(async (eventId: string, userId: string) => {
    const data = await queryDocs<Registration>('registrations', [
      where('eventId', '==', eventId),
      where('userId', '==', userId),
      where('status', 'in', ['confirmed', 'waitlisted']),
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
