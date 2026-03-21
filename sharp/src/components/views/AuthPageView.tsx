'use client';

import React, { useState } from 'react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { COLORS } from '@/lib/constants';
import { useUIStore } from '@/stores/uiStore';
import { useSettings } from '@/hooks/useSettings';

export function AuthPageView() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { setActiveTab } = useUIStore();
  const { settings } = useSettings();

  const isRegOpen = settings?.registrationOpen !== false; // Active by default if loading

  const handleSuccess = () => {
    // Auth state change will trigger role-based redirect automatically
    setActiveTab('dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <BrutalCard className="p-6 md:p-8 border-b-[8px] space-y-6">
        {/* Tab Bar */}
        <div className="flex gap-0 border-b-[3px] border-black pb-0">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 font-black uppercase text-xs italic border-x-[2.5px] border-t-[2.5px] border-black rounded-t-xl -mb-[3px] z-10 transition-colors ${
              mode === 'login' ? 'bg-yellow-400' : 'bg-white opacity-40 hover:opacity-60'
            }`}
          >
            Login
          </button>
          {isRegOpen && (
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 font-black uppercase text-xs italic border-x-[2.5px] border-t-[2.5px] border-black rounded-t-xl -mb-[3px] z-10 transition-colors ${
                mode === 'register' ? 'bg-teal-400' : 'bg-white opacity-40 hover:opacity-60'
              }`}
            >
              Register
            </button>
          )}
        </div>

        {/* Form */}
        <div className="pt-2">
          {mode === 'login' ? (
            <LoginForm
              onSwitchToRegister={() => setMode('register')}
              onSuccess={handleSuccess}
              showRegisterLink={isRegOpen}
            />
          ) : isRegOpen ? (
            <RegisterForm
              onSwitchToLogin={() => setMode('login')}
              onSuccess={handleSuccess}
            />
          ) : (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-red-100 border-[2.5px] border-black rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                🚫
              </div>
              <h4 className="font-black uppercase italic text-xl">Registration Closed</h4>
              <p className="text-[10px] font-bold opacity-50 uppercase leading-snug">New student registrations are currently restricted by administrators. Please contact support if you believe this is an error.</p>
              <BrutalButton color={COLORS.yellow} className="w-full mt-4" onClick={() => setMode('login')}>Back to Login</BrutalButton>
            </div>
          )}
        </div>
      </BrutalCard>
    </div>
  );
}
