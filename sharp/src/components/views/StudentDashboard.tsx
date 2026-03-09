'use client';

import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useNotifications } from '@/hooks/useNotifications';
import type { CampusEvent } from '@/types';

export function StudentDashboard() {
  const { profile } = useAuthStore();
  const { events, fetchPublicEvents } = useEvents();
  const { registrations, fetchUserRegistrations } = useRegistrations();
  const { notifications } = useNotifications(profile?.uid);
  const [upcoming, setUpcoming] = useState<CampusEvent[]>([]);

  useEffect(() => {
    fetchPublicEvents();
    if (profile?.uid) fetchUserRegistrations(profile.uid);
  }, [profile?.uid, fetchPublicEvents, fetchUserRegistrations]);

  useEffect(() => {
    setUpcoming(events.slice(0, 5));
  }, [events]);

  const firstName = profile?.name?.split(' ')[0] || 'Student';
  const regCount = registrations.filter(r => r.status === 'confirmed').length;
  const recentNotifs = notifications.slice(0, 4);

  const formatDate = (ts: CampusEvent['startTime']) => {
    if (!ts?.toDate) return { day: '--', month: '---', time: '' };
    const d = ts.toDate();
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleString('en', { month: 'short' }).toUpperCase(),
      time: d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }),
    };
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <BrutalCard color={COLORS.lavender} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b-[6px]">
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">HEY {firstName.toUpperCase()}!</h2>
          <p className="text-[11px] font-bold uppercase opacity-80 italic">
            You have <span className="underline">{upcoming.length} events</span> coming up. Don&apos;t be late.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { l: 'COMING', v: String(upcoming.length).padStart(2, '0'), c: COLORS.yellow },
            { l: 'REGS', v: String(regCount).padStart(2, '0'), c: COLORS.teal },
            { l: 'NOTIFS', v: String(notifications.length).padStart(2, '0'), c: COLORS.pink },
          ].map((s) => (
            <div key={s.l} className="border-[2px] border-black bg-white p-3 text-center min-w-[85px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl">
              <div className="text-2xl font-black">{s.v}</div>
              <div className="text-[7.5px] font-black uppercase opacity-40 tracking-widest">{s.l}</div>
            </div>
          ))}
        </div>
      </BrutalCard>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Schedule */}
        <div className="lg:col-span-2 space-y-5">
          <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Upcoming Timeline
          </h3>
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <BrutalCard className="p-6 text-center">
                <p className="text-[11px] font-black uppercase italic opacity-30">No upcoming events. Explore & register!</p>
              </BrutalCard>
            ) : (
              upcoming.map((event) => {
                const d = formatDate(event.startTime);
                return (
                  <BrutalCard key={event.id} className="flex items-center gap-5 p-4 border-l-[8px] border-l-black group hover:bg-slate-50">
                    <div className="w-12 h-12 border-[2px] border-black flex flex-col items-center justify-center shrink-0 bg-yellow-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none transition-all">
                      <span className="text-lg font-black leading-none">{d.day}</span>
                      <span className="text-[7px] font-black uppercase">{d.month}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[13px] font-black uppercase italic leading-tight">{event.title}</h4>
                      <p className="text-[9px] font-bold opacity-50 uppercase mt-0.5 tracking-tight">{event.venueName} • {d.time}</p>
                    </div>
                    <BrutalButton color={COLORS.teal} className="hidden sm:flex px-5 h-8">View</BrutalButton>
                  </BrutalCard>
                );
              })
            )}
          </div>
        </div>

        {/* Alerts / Notifications */}
        <div className="space-y-5">
          <h3 className="text-xl font-black uppercase italic">Alerts</h3>
          <div className="border-[2.5px] border-black bg-white rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {recentNotifs.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-[10px] font-black uppercase italic opacity-30">No notifications yet</p>
              </div>
            ) : (
              recentNotifs.map((n, i) => (
                <div key={n.id || i} className="p-3.5 border-b-[2px] border-black hover:bg-yellow-50 cursor-pointer transition-colors last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <Badge text={n.type || 'System'} color={COLORS.yellow} />
                    <span className="text-[7.5px] font-black opacity-30 italic">
                      {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : 'now'}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold leading-tight">{n.message || n.title}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
