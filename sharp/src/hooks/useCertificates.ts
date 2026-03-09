'use client';

import { useState, useCallback } from 'react';
import { queryDocs, addDocument, where, orderBy } from '@/lib/firestore';
import type { Certificate } from '@/types';

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserCertificates = useCallback(async (userId: string) => {
    setLoading(true);
    const data = await queryDocs<Certificate>('certificates', [
      where('userId', '==', userId),
      orderBy('issueDate', 'desc'),
    ]);
    setCertificates(data);
    setLoading(false);
    return data;
  }, []);

  const fetchEventCertificates = useCallback(async (eventId: string) => {
    setLoading(true);
    const data = await queryDocs<Certificate>('certificates', [
      where('eventId', '==', eventId),
    ]);
    setCertificates(data);
    setLoading(false);
    return data;
  }, []);

  const generateCertificate = useCallback(async (
    eventId: string,
    eventTitle: string,
    userId: string,
    userName: string,
    type: Certificate['type']
  ) => {
    const verificationCode = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const docRef = await addDocument('certificates', {
      eventId,
      eventTitle,
      userId,
      userName,
      type,
      issueDate: new Date(),
      certificateUrl: '',
      verificationCode,
    });
    return { id: docRef.id, verificationCode };
  }, []);

  return { certificates, loading, fetchUserCertificates, fetchEventCertificates, generateCertificate };
}
