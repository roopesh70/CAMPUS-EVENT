'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserProfile['role'][];
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, allowedRoles, fallback }: AuthGuardProps) {
  const { isAuthenticated, role, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-[4px] border-black rounded-2xl bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce mx-auto flex items-center justify-center">
            <span className="font-black text-xl">S</span>
          </div>
          <p className="font-black uppercase text-[10px] tracking-widest opacity-40 italic">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  if (allowedRoles && !allowedRoles.includes(role as UserProfile['role'])) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]">
        <div className="border-[3px] border-black bg-white p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center space-y-3 max-w-sm">
          <h2 className="text-2xl font-black uppercase italic">Access Denied</h2>
          <p className="text-[11px] font-bold opacity-60">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
