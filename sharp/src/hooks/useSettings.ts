'use client';

import { useState, useCallback, useEffect } from 'react';
import { getDocument, updateDocument, addDocument, mergeDocument, listenToDoc } from '@/lib/firestore';
import type { SystemSettings } from '@/types';
import { Timestamp, serverTimestamp } from 'firebase/firestore';
import DOMPurify from 'isomorphic-dompurify';

const DEFAULT_SETTINGS: Omit<SystemSettings, 'id'> = {
  registrationOpen: true,
  requireEventApproval: true,
  maintenanceMode: false,
  supportEmail: 'support@campusevent.edu',
  allowAnonymousFeedback: true,
  restrictedRoles: [],
  // Social Links
  twitterUrl: 'https://twitter.com/sharp',
  instagramUrl: 'https://instagram.com/sharp',
  githubUrl: 'https://github.com/sharp',
  youtubeUrl: 'https://youtube.com/sharp',
  campusWebsiteUrl: 'https://campus.edu',
  // Legal Content (HTML supported)
  privacyPolicy: `
    <h1 class="text-3xl font-black uppercase mb-6 italic underline decoration-[6px] decoration-yellow-400">Privacy Policy</h1>
    <div class="space-y-6 text-sm leading-relaxed text-black/80">
      <section>
        <h2 class="text-xl font-black uppercase mb-3 italic underline decoration-[4px] decoration-teal-400">1. Data Collection</h2>
        <p>SHARP collects essential information to manage campus events. This includes your name, institutional email, department, and academic year. We also collect activity logs for event registrations and attendance.</p>
      </section>
      <section>
        <h2 class="text-xl font-black uppercase mb-3 italic underline decoration-[4px] decoration-yellow-400">2. Usage</h2>
        <p>Your data is used solely for event organization, certificate issuance, and institutional reporting. Organizers only see data necessary for managing their specific events.</p>
      </section>
      <section>
        <h2 class="text-xl font-black uppercase mb-3 italic underline decoration-[4px] decoration-red-400">3. Security</h2>
        <p>We implement industry-standard security measures provided by Google Firebase to protect your information. Your data is restricted through robust server-side security rules.</p>
      </section>
    </div>
  `,
  cookieSettings: `
    <h1 class="text-3xl font-black uppercase mb-6 italic underline decoration-[6px] decoration-teal-400">Cookie Settings</h1>
    <div class="space-y-6 text-sm leading-relaxed text-black/80">
      <section>
        <h2 class="text-xl font-black uppercase mb-3 italic underline decoration-[4px] decoration-yellow-400">1. Essential Cookies</h2>
        <p>These cookies are required for the platform to function. They handle authentication and maintain your session across the platform.</p>
      </section>
      <section>
        <h2 class="text-xl font-black uppercase mb-3 italic underline decoration-[4px] decoration-teal-400">2. Functionality Cookies</h2>
        <p>Used to remember your preferences (like categories and theme settings) for a more personalized experience.</p>
      </section>
      <section>
        <h2 class="text-xl font-black uppercase mb-3 italic underline decoration-[4px] decoration-red-400">3. Management</h2>
        <p>You can control cookies through your browser settings, but disabling essential cookies will prevent authentication.</p>
      </section>
    </div>
  `,
  termsOfUse: `
    <h1 class="text-3xl font-black uppercase mb-6 italic underline decoration-[6px] decoration-red-400">Terms of Use</h1>
    <div class="space-y-6 text-sm leading-relaxed text-black/80">
      <section>
        <h2 class="text-xl font-black uppercase mb-3 italic underline decoration-[4px] decoration-yellow-400">1. Conduct</h2>
        <p>Users must adhere to the institution's professional code of conduct. Misuse of the platform for unauthorized event promotion or fake registrations is strictly prohibited.</p>
      </section>
      <section>
        <h2 class="text-xl font-black uppercase mb-3 italic underline decoration-[4px] decoration-teal-400">2. Certificates</h2>
        <p>Certificates issued through SHARP are official digital records. Authenticity can be verified via unique codes. Tampering with certificates is a serious violation.</p>
      </section>
      <section>
        <h2 class="text-xl font-black uppercase mb-3 italic underline decoration-[4px] decoration-red-400">3. Accountability</h2>
        <p>The institution reserves the right to restrict access to users who violate these terms or engage in disruptive behavior.</p>
      </section>
    </div>
  `,
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
      // Sanitize legal content before persisting to Firestore to prevent XSS
      const cleanUpdates = { ...updates };
      if (cleanUpdates.privacyPolicy) cleanUpdates.privacyPolicy = DOMPurify.sanitize(cleanUpdates.privacyPolicy);
      if (cleanUpdates.cookieSettings) cleanUpdates.cookieSettings = DOMPurify.sanitize(cleanUpdates.cookieSettings);
      if (cleanUpdates.termsOfUse) cleanUpdates.termsOfUse = DOMPurify.sanitize(cleanUpdates.termsOfUse);

      // Use mergeDocument to handle creation if it doesn't exist
      await mergeDocument('settings', 'global', cleanUpdates);
      // State updates automatically via listenToDoc onSnapshot
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      throw err;
    }
  }, []);

  return { settings, loading, error, saveSettings };
}
