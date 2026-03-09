'use client';

import React, { useState } from 'react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useUIStore } from '@/stores/uiStore';

export function AuthPageView() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { setActiveTab } = useUIStore();

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
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 font-black uppercase text-xs italic border-x-[2.5px] border-t-[2.5px] border-black rounded-t-xl -mb-[3px] z-10 transition-colors ${
              mode === 'register' ? 'bg-teal-400' : 'bg-white opacity-40 hover:opacity-60'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <div className="pt-2">
          {mode === 'login' ? (
            <LoginForm
              onSwitchToRegister={() => setMode('register')}
              onSuccess={handleSuccess}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setMode('login')}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </BrutalCard>
    </div>
  );
}
