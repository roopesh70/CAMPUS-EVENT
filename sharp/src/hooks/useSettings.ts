'use client';

import { useState, useCallback, useEffect } from 'react';
import { getDocument, updateDocument, addDocument, mergeDocument, listenToDoc } from '@/lib/firestore';
import type { SystemSettings } from '@/types';
import { Timestamp, serverTimestamp } from 'firebase/firestore';

const DEFAULT_SETTINGS: Omit<SystemSettings, 'id'> = {
  registrationOpen: true,
  requireEventApproval: true,
  maintenanceMode: false,
  supportEmail: 'support@campusevent.edu',
  allowAnonymousFeedback: true,
  eventCategories: [
    { id: 'technical', name: 'Technical', isActive: true },
    { id: 'cultural', name: 'Cultural', isActive: true },
    { id: 'sports', name: 'Sports', isActive: true },
    { id: 'academic', name: 'Academic', isActive: true },
    { id: 'workshop', name: 'Workshop', isActive: true },
    { id: 'seminar', name: 'Seminar', isActive: true },
    { id: 'competition', name: 'Competition', isActive: true },
    { id: 'social', name: 'Social', isActive: true },
  ],
};

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    // Use real-time listener for instant updates across lahat ng browser windows
    const unsubscribe = listenToDoc<SystemSettings>('settings', 'global', (data) => {
      if (data) {
        setSettings(data);
      } else {
        // Fallback to defaults with the expected 'global' id
        setSettings({ id: 'global', ...DEFAULT_SETTINGS } as SystemSettings);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveSettings = useCallback(async (updates: Partial<SystemSettings>) => {
    try {
      // Use mergeDocument to handle creation if it doesn't exist
      await mergeDocument('settings', 'global', updates);
      // State updates automatically via listenToDoc onSnapshot
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      throw err;
    }
  }, []);

  return { settings, loading, error, saveSettings };
}
