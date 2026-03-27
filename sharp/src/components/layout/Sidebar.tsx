'use client';

import React from 'react';
import { Compass, X, LogOut, LogIn, QrCode } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { NAV_CONFIG } from '@/lib/constants';

export function Sidebar() {
  const { isAuthenticated, profile, role } = useAuthStore();
  const { activeTab, sidebarOpen, setActiveTab, setSidebarOpen, setShowQR } = useUIStore();
  const { logout } = useAuth();

  // Determine which nav to show based on real role
  const navRole = isAuthenticated ? (role as keyof typeof NAV_CONFIG) : 'public';
  const navItems = NAV_CONFIG[navRole] || NAV_CONFIG.public;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`border-r-[3px] border-black bg-white transition-all duration-300 z-50 fixed md:relative h-full md:h-screen ${
          sidebarOpen
            ? 'w-60 translate-x-0'
            : 'w-0 -translate-x-full md:w-20 md:translate-x-0'
        } overflow-hidden shrink-0`}
      >
        {/* Logo Header */}
        <div className="p-5 border-b-[3px] border-black flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 bg-red-500 border-[2px] border-black rounded-full flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Compass className="text-white w-3.5 h-3.5" />
            </div>
            {sidebarOpen && (
              <h1 className="text-lg font-black italic tracking-tighter uppercase">SHARP</h1>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(window.innerWidth >= 768);
              }}
              className={`w-full flex items-center gap-3 p-2.5 border-[2px] transition-all font-black rounded-xl group ${
                activeTab === item.id
                  ? 'bg-black text-white border-black translate-x-1 shadow-[2.5px_2.5px_0px_0px_rgba(250,204,21,1)]'
                  : 'border-transparent hover:border-black hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {sidebarOpen && (
                <span className="uppercase text-[9.5px] tracking-tight">{item.label}</span>
              )}
            </button>
          ))}

          {/* Auth Action */}
          <div className="pt-6 border-t-[2px] border-black border-opacity-10 mt-6">
            {isAuthenticated ? (
              <div className="space-y-2">
                {sidebarOpen && profile && (
                  <div className="px-3 py-2">
                    <p className="text-[9px] font-black uppercase opacity-30 leading-none">Signed in as</p>
                    <p className="text-[10px] font-black uppercase italic truncate mt-0.5">
                      {profile.name || profile.email}
                    </p>
                    <p className="text-[8px] font-black uppercase text-yellow-600 mt-0.5">
                      {role}
                    </p>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 p-2.5 border-[2px] border-transparent hover:border-red-400 hover:bg-red-50 font-black rounded-xl transition-all text-red-500"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  {sidebarOpen && (
                    <span className="uppercase text-[9.5px] tracking-tight">Logout</span>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="w-full flex items-center gap-3 p-2.5 border-[2px] border-black bg-yellow-400 font-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                {sidebarOpen && (
                  <span className="uppercase text-[9.5px] tracking-tight">Login / Register</span>
                )}
              </button>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
