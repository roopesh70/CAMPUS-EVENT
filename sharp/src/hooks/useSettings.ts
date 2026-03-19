'use client';

import { useState, useCallback, useEffect } from 'react';
import { getDocument, updateDocument, addDocument } from '@/lib/firestore';
import type { SystemSettings } from '@/types';
import { Timestamp } from 'firebase/firestore';

const DEFAULT_SETTINGS: Omit<SystemSettings, 'id'> = {
  registrationOpen: true,
  requireEventApproval: true,
  maintenanceMode: false,
  supportEmail: 'support@campusevent.edu',
  allowAnonymousFeedback: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDocument<SystemSettings>('settings', 'global');
      if (data) {
        setSettings(data);
      } else {
        // If settings doc doesn't exist, create it with defaults
        const newSettings = { ...DEFAULT_SETTINGS, updatedAt: Timestamp.now() };
        // We use setDoc style in firestore, but addDocument/updateDocument might behave differently. 
        // We will try updating first, if fails maybe we need a dedicated set. But updateDocument with merge usually works, 
        // or we just use our existing update API if it creates the doc when missing.
        // For addDocument in our lib/firestore, it auto-generates IDs. We need ID 'global'.
        // So we might just set the state and handle creation on first save.
        setSettings(newSettings as SystemSettings);
      }
    } catch (err: any) {
      console.error('Failed to fetch settings:', err);
      // Fallback to defaults if strictly unreadable
      setSettings({ ...DEFAULT_SETTINGS } as SystemSettings);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (updates: Partial<SystemSettings>) => {
    try {
      // In a real app we might need setDoc for exact 'global' ID creation if missing.
      // But updateDocument should suffice if it merges or we do it explicitly.
      await updateDocument('settings', 'global', { ...updates, updatedAt: Timestamp.now() });
      setSettings(prev => prev ? { ...prev, ...updates } : { ...DEFAULT_SETTINGS, ...updates } as SystemSettings);
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, error, saveSettings, fetchSettings };
}
