'use client';

import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications } from '@/hooks/useNotifications';
import { BrutalInput } from '@/components/ui/BrutalInput';

export function Topbar() {
  const { toggleSidebar, setActiveTab } = useUIStore();
  const { profile, role, isAuthenticated } = useAuthStore();
  const { unreadCount } = useNotifications(profile?.uid);

  const handleBellClick = () => {
    setActiveTab('notifications');
  };

  return (
    <header className="h-14 border-b-[3px] border-black bg-white flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-1 border-[2.5px] border-black rounded-lg hover:bg-yellow-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
        >
          <Menu className="w-4 h-4" />
        </button>
        <BrutalInput
          placeholder="Quick search..."
          icon={Search}
          className="hidden sm:flex max-w-xs w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated && profile ? (
          <>
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-[7.5px] font-black uppercase opacity-30 leading-none">{role}</span>
              <span className="text-xs font-black uppercase italic tracking-tighter truncate max-w-[120px]">
                {profile.name || 'User'}
              </span>
            </div>
            <button
              onClick={handleBellClick}
              className="relative p-1.5 border-[2.5px] border-black rounded-lg hover:bg-teal-400 transition-all bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 border-[1.5px] border-black rounded-full text-white text-[7px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 border-[2.5px] border-black rounded-xl overflow-hidden bg-pink-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {profile.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoURL} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-sm">
                  {(profile.name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-[7.5px] font-black uppercase opacity-30 leading-none">Guest</span>
            <span className="text-xs font-black uppercase italic tracking-tighter">SHARP</span>
          </div>
        )}
      </div>
    </header>
  );
}

