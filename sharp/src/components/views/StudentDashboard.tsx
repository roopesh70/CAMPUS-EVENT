'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';

export function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <BrutalCard color={COLORS.lavender} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b-[6px]">
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">HEY ALEX!</h2>
          <p className="text-[11px] font-bold uppercase opacity-80 italic">
            You have <span className="underline">4 events</span> today. Don&apos;t be late.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { l: 'COMING', v: '04', c: COLORS.yellow },
            { l: 'REGS', v: '12', c: COLORS.teal },
            { l: 'BADGES', v: '05', c: COLORS.pink },
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
            {[
              { day: '24', month: 'OCT', name: 'AI & Creative Design Workshop', loc: 'Auditorium • 10:30 AM' },
              { day: '24', month: 'OCT', name: 'AI & Creative Design Workshop', loc: 'Auditorium • 10:30 AM' },
              { day: '26', month: 'OCT', name: 'Campus Music Night', loc: 'Grand Arena • 7:00 PM' },
            ].map((event, i) => (
              <BrutalCard key={i} className="flex items-center gap-5 p-4 border-l-[8px] border-l-black group hover:bg-slate-50">
                <div className="w-12 h-12 border-[2px] border-black flex flex-col items-center justify-center shrink-0 bg-yellow-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none transition-all">
                  <span className="text-lg font-black leading-none">{event.day}</span>
                  <span className="text-[7px] font-black uppercase">{event.month}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-black uppercase italic leading-tight">{event.name}</h4>
                  <p className="text-[9px] font-bold opacity-50 uppercase mt-0.5 tracking-tight">{event.loc}</p>
                </div>
                <BrutalButton color={COLORS.teal} className="hidden sm:flex px-5 h-8">Join</BrutalButton>
              </BrutalCard>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-5">
          <h3 className="text-xl font-black uppercase italic">Alerts</h3>
          <div className="border-[2.5px] border-black bg-white rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3.5 border-b-[2px] border-black hover:bg-yellow-50 cursor-pointer transition-colors last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <Badge text="System" color={COLORS.yellow} />
                  <span className="text-[7.5px] font-black opacity-30 italic">4m ago</span>
                </div>
                <p className="text-[10px] font-bold leading-tight">
                  Request for <span className="underline">Creative Lab</span> approved!
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
