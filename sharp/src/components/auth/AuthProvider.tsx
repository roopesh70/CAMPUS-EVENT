'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize auth listener — this runs once and syncs Firebase Auth → authStore
  useAuth();

  return <>{children}</>;
}
