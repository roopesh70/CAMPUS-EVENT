'use client';

import { useState, useCallback } from 'react';
import { queryDocs, addDocument, updateDocument, deleteDocument, orderBy } from '@/lib/firestore';
import type { Venue } from '@/types';

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    const data = await queryDocs<Venue>('venues', [orderBy('name', 'asc')]);
    setVenues(data);
    setLoading(false);
    return data;
  }, []);

  const createVenue = useCallback(async (data: Omit<Venue, 'id'>) => {
    const docRef = await addDocument('venues', data);
    return docRef.id;
  }, []);

  const updateVenue = useCallback(async (id: string, data: Partial<Venue>) => {
    await updateDocument('venues', id, data);
  }, []);

  const deleteVenue = useCallback(async (id: string) => {
    await deleteDocument('venues', id);
  }, []);

  return { venues, loading, fetchVenues, createVenue, updateVenue, deleteVenue };
}
