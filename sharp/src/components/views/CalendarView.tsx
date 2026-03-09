'use client';

import React from 'react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';

export function CalendarView() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const events: Record<number, { label: string; color: string }> = {
    5: { label: 'Art Gala', color: '#F472B6' },
    15: { label: 'Tech Talk', color: '#FACC15' },
    22: { label: 'Music Fest', color: '#2DD4BF' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter decoration-teal-400 underline decoration-[5px] underline-offset-2">
          March 2026
        </h2>
        <div className="flex gap-2">
          <BrutalButton color="white" className="w-9 h-9">&larr;</BrutalButton>
          <BrutalButton color="white" className="w-9 h-9">&rarr;</BrutalButton>
        </div>
      </div>

      {/* Calendar Grid */}
      <BrutalCard className="p-0 border-[2.5px] overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b-[2.5px] border-black font-black uppercase text-[8px] bg-black text-white italic tracking-widest">
          {days.map((d) => (
            <div key={d} className="p-3 border-r-[1px] border-white border-opacity-20 last:border-0 text-center">
              {d}
            </div>
          ))}
        </div>

        {/* Date Cells */}
        <div className="grid grid-cols-7">
          {[...Array(35)].map((_, i) => {
            const dayNum = i - 5; // March 2026 starts on Sunday offset
            const isValidDay = dayNum >= 1 && dayNum <= 31;
            const event = isValidDay ? events[dayNum] : undefined;

            return (
              <div
                key={i}
                className="min-h-[100px] p-2.5 border-r-[1px] border-b-[1px] border-black border-opacity-10 last:border-r-0 hover:bg-yellow-50 transition-colors cursor-pointer group"
              >
                {isValidDay && (
                  <>
                    <span className="font-black text-lg group-hover:text-pink-500 transition-colors leading-none">
                      {dayNum}
                    </span>
                    {event && (
                      <div
                        className="mt-1.5 text-[7px] font-black uppercase p-1.5 border-[1.5px] border-black rounded-lg leading-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        style={{ backgroundColor: event.color }}
                      >
                        {event.label}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </BrutalCard>
    </div>
  );
}
