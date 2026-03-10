'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useEvents } from '@/hooks/useEvents';
import type { CampusEvent } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const catColor = (cat: string) => {
  const map: Record<string, string> = { technical: COLORS.teal, cultural: COLORS.pink, sports: COLORS.yellow, academic: COLORS.lavender, workshop: COLORS.teal, competition: COLORS.yellow, social: COLORS.pink, seminar: COLORS.lavender };
  return map[cat] || COLORS.teal;
};

export function CalendarView() {
  const { events, fetchPublicEvents } = useEvents();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => { fetchPublicEvents(); }, [fetchPublicEvents]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Map events to their day number for this month
  const eventsByDay = useMemo(() => {
    const map: Record<number, CampusEvent[]> = {};
    events.forEach(evt => {
      if (!evt.startTime?.toDate) return;
      const d = evt.startTime.toDate();
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(evt);
      }
    });
    return map;
  }, [events, year, month]);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(null); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(null); };

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] || []) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter decoration-teal-400 underline decoration-[5px] underline-offset-2">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex gap-2">
          <BrutalButton color="white" className="w-9 h-9" onClick={prev}><ChevronLeft className="w-4 h-4" /></BrutalButton>
          <BrutalButton color={COLORS.yellow} className="px-4 h-9 text-[9px]" onClick={() => { setYear(new Date().getFullYear()); setMonth(new Date().getMonth()); setSelectedDay(null); }}>Today</BrutalButton>
          <BrutalButton color="white" className="w-9 h-9" onClick={next}><ChevronRight className="w-4 h-4" /></BrutalButton>
        </div>
      </div>

      {/* Calendar Grid */}
      <BrutalCard className="p-0 border-[2.5px] overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b-[2.5px] border-black font-black uppercase text-[8px] bg-black text-white italic tracking-widest">
          {DAYS.map((d) => (
            <div key={d} className="p-3 border-r-[1px] border-white border-opacity-20 last:border-0 text-center">{d}</div>
          ))}
        </div>

        {/* Date Cells */}
        <div className="grid grid-cols-7">
          {[...Array(42)].map((_, i) => {
            const dayNum = i - firstDayOfWeek + 1;
            const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;
            const dayEvents = isValidDay ? (eventsByDay[dayNum] || []) : [];
            const isToday = isValidDay && dayNum === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const isSelected = isValidDay && dayNum === selectedDay;

            return (
              <div
                key={i}
                onClick={() => isValidDay && setSelectedDay(dayNum === selectedDay ? null : dayNum)}
                className={`min-h-[90px] p-2 border-r-[1px] border-b-[1px] border-black border-opacity-10 last:border-r-0 transition-colors cursor-pointer group
                  ${isToday ? 'bg-yellow-50' : ''} ${isSelected ? 'bg-teal-50 ring-2 ring-teal-400 ring-inset' : 'hover:bg-yellow-50'}`}
              >
                {isValidDay && (
                  <>
                    <span className={`font-black text-sm leading-none transition-colors
                      ${isToday ? 'bg-yellow-400 border-[2px] border-black px-1.5 py-0.5 rounded-lg' : 'group-hover:text-pink-500'}`}>
                      {dayNum}
                    </span>
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        className="mt-1 text-[6.5px] font-black uppercase p-1 border-[1.5px] border-black rounded-md leading-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] truncate"
                        style={{ backgroundColor: catColor(evt.category) }}
                      >
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[6px] font-black uppercase opacity-40 mt-0.5 block">+{dayEvents.length - 2} more</span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </BrutalCard>

      {/* Selected Day Detail */}
      {selectedDay && (
        <BrutalCard className="p-5 border-b-[6px] space-y-3" color={COLORS.yellow}>
          <h3 className="text-lg font-black uppercase italic">
            {MONTHS[month]} {selectedDay}, {year} — {selectedEvents.length} Event{selectedEvents.length !== 1 ? 's' : ''}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-[10px] font-black uppercase italic opacity-40">No events on this day</p>
          ) : (
            selectedEvents.map(evt => {
              const time = evt.startTime?.toDate ? evt.startTime.toDate().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }) : '';
              return (
                <div key={evt.id} className="flex items-center gap-3 bg-white border-[2px] border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Badge text={evt.category} color={catColor(evt.category)} />
                  <div className="flex-1">
                    <h4 className="font-black uppercase text-[11px] italic">{evt.title}</h4>
                    <p className="text-[8px] font-bold opacity-40">{evt.venueName} • {time} • {evt.registeredCount}/{evt.capacity} registered</p>
                  </div>
                  <Badge text={evt.status} color={evt.status === 'approved' ? COLORS.green : COLORS.yellow} />
                </div>
              );
            })
          )}
        </BrutalCard>
      )}
    </div>
  );
}
