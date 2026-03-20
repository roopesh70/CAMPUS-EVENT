'use client';

import { useState, useCallback } from 'react';
import { queryDocs, addDocument, where, orderBy, updateDocument, deleteDocument, db } from '@/lib/firestore';
import type { Certificate, CertificateTemplate } from '@/types';
import { Timestamp, getDocs, query, collection } from 'firebase/firestore';

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // === CERTIFICATE FETCHING ===
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

  // === TEMPLATE CRUD ===
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const data = await queryDocs<CertificateTemplate>('certificateTemplates', [
      orderBy('createdAt', 'desc'),
    ]);
    setTemplates(data);
    setLoading(false);
    return data;
  }, []);

  const addTemplate = useCallback(async (data: Omit<CertificateTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docRef = await addDocument('certificateTemplates', {
      ...data,
    });
    return docRef;
  }, []);

  const updateTemplate = useCallback(async (templateId: string, data: Partial<CertificateTemplate>) => {
    await updateDocument('certificateTemplates', templateId, data);
  }, []);

  const deleteTemplate = useCallback(async (templateId: string) => {
    await deleteDocument('certificateTemplates', templateId);
  }, []);

  // === GENERATION WITH DUPLICATE PREVENTION ===
  const generateCertificate = useCallback(async (
    payload: Omit<Certificate, 'id' | 'issueDate' | 'verificationCode' | 'status' | 'emailSent'>
  ) => {
    // DUPLICATE PREVENTION GUARD
    const q = query(
      collection(db, 'certificates'),
      where('eventId', '==', payload.eventId),
      where('userId', '==', payload.userId),
      where('type', '==', payload.type)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      // Certificate already exists
      return { skipped: true, existingId: snap.docs[0].id };
    }

    const verificationCode = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Strip undefined values to prevent FirebaseError
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined)
    );

    const docRef = await addDocument('certificates', {
      ...cleanPayload,
      issueDate: new Date(),
      verificationCode,
      status: 'issued',
      emailSent: false,
    });
    return { skipped: false, id: docRef.id, verificationCode };
  }, []);
  
  // === bulk Generation ===
  const bulkGenerate = useCallback(async (
    eventId: string,
    eventTitle: string,
    participants: { userId: string; userName: string; department?: string; year?: number | null }[],
    certType: Certificate['type'],
    templateId: string,
    customizations: { logoUrl?: string; logoUrls?: string[]; backgroundImageUrl?: string; signatureImageUrl?: string; signatureText?: string; primaryColor?: string }
  ) => {
    setLoading(true);
    let generated = 0;
    let skipped = 0;

    for (const p of participants) {
      const result = await generateCertificate({
        eventId,
        eventTitle,
        userId: p.userId,
        userName: p.userName,
        type: certType,
        certificateUrl: '', // generated on client
        templateId,
        ...customizations,
        department: p.department, // Add department from participant
        year: p.year, // Add year from participant
      });

      if (result.skipped) {
        skipped++;
      } else {
        generated++;
      }
    }

    setLoading(false);
    return { generated, skipped };
  }, [generateCertificate]);
  
  const requestReplacement = useCallback(async (certId: string) => {
    await updateDocument('certificates', certId, { status: 'replacement_requested' });
  }, []);

  const revokeCertificate = useCallback(async (certId: string) => {
    await deleteDocument('certificates', certId);
  }, []);

  return {
    certificates, templates, loading,
    fetchUserCertificates, fetchEventCertificates, fetchTemplates,
    addTemplate, updateTemplate, deleteTemplate,
    generateCertificate, bulkGenerate, requestReplacement, revokeCertificate
  };
}
