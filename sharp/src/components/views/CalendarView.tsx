'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, List, Grid3X3 } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useAuthStore } from '@/stores/authStore';
import type { CampusEvent } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CATEGORIES = ['all', 'technical', 'cultural', 'sports', 'academic', 'workshop', 'competition', 'social', 'seminar'];

const catColor = (cat: string) => {
  const map: Record<string, string> = { technical: COLORS.teal, cultural: COLORS.pink, sports: COLORS.yellow, academic: COLORS.lavender, workshop: COLORS.teal, competition: COLORS.yellow, social: COLORS.pink, seminar: COLORS.lavender };
  return map[cat] || COLORS.teal;
};

export function CalendarView() {
  const { events, fetchPublicEvents, fetchOrganizerEvents, fetchAllEvents } = useEvents();
  const { registrations, fetchUserRegistrations } = useRegistrations();
  const { profile, isAuthenticated, role } = useAuthStore();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [catFilter, setCatFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [showMine, setShowMine] = useState(false);

  useEffect(() => {
    if (showMine && role === 'organizer' && profile?.uid) {
      fetchOrganizerEvents(profile.uid);
    } else if (showMine && role === 'admin') {
      fetchAllEvents();
    } else {
      fetchPublicEvents();
    }
  }, [showMine, role, profile?.uid, fetchOrganizerEvents, fetchAllEvents, fetchPublicEvents]);

  useEffect(() => {
    if (profile?.uid && showMine && role !== 'organizer' && role !== 'admin') {
      fetchUserRegistrations(profile.uid);
    }
  }, [profile?.uid, showMine, role, fetchUserRegistrations]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const registeredEventIds = useMemo(() => new Set(registrations.map(r => r.eventId)), [registrations]);

  const filteredEvents = useMemo(() => {
    let evts = catFilter === 'all' ? events : events.filter(e => e.category === catFilter);
    if (showMine && isAuthenticated && profile) {
      if (role === 'organizer') {
        evts = evts.filter(e => e.organizerId === profile.uid);
      } else if (role !== 'admin') {
        evts = evts.filter(e => registeredEventIds.has(e.id));
      }
    }
    return evts;
  }, [events, catFilter, showMine, isAuthenticated, registeredEventIds, role, profile]);

  // Map events to their day number for this month
  const eventsByDay = useMemo(() => {
    const map: Record<number, CampusEvent[]> = {};
    filteredEvents.forEach(evt => {
      if (!evt.startTime?.toDate) return;
      const d = evt.startTime.toDate();
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(evt);
      }
    });
    return map;
  }, [filteredEvents, year, month]);

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
          {isAuthenticated && (
            <BrutalButton color={showMine ? COLORS.teal : 'white'} className="px-3 h-9 text-[8px]" onClick={() => setShowMine(!showMine)}>
              {role === 'admin' ? (showMine ? 'All Statuses' : 'Approved Only') : (showMine ? 'My Events' : 'All Events')}
            </BrutalButton>
          )}
          <BrutalButton color={viewMode === 'list' ? COLORS.yellow : 'white'} className="h-9 px-3 flex items-center gap-2 text-[8px] uppercase font-black" onClick={() => setViewMode(viewMode === 'month' ? 'list' : 'month')}>
            {viewMode === 'month' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            <span className="hidden sm:inline">{viewMode === 'month' ? 'List View' : 'Month View'}</span>
          </BrutalButton>
          <BrutalButton color="white" className="px-3 h-9 text-[8px] flex items-center gap-1" onClick={prev}><ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">Prev</span></BrutalButton>
          <BrutalButton color={COLORS.yellow} className="px-4 h-9 text-[9px]" onClick={() => { setYear(new Date().getFullYear()); setMonth(new Date().getMonth()); setSelectedDay(null); }}>Today</BrutalButton>
          <BrutalButton color="white" className="px-3 h-9 text-[8px] flex items-center gap-1" onClick={next}><span className="hidden sm:inline">Next</span><ChevronRight className="w-4 h-4" /></BrutalButton>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)}
            className={`whitespace-nowrap border-[2px] border-black px-3 py-1 font-black uppercase text-[8px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${catFilter === cat ? 'bg-yellow-400' : 'bg-white'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Calendar Grid - Month View */}
      {viewMode === 'month' && (
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
                          className="mt-1 text-[6.5px] font-black uppercase p-1 border-[1.5px] border-black rounded-md leading-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] truncate flex items-center gap-0.5"
                          style={{ backgroundColor: catColor(evt.category) }}
                        >
                          {evt.outcomeStatus === 'success' && <span>✅</span>}
                          {evt.outcomeStatus === 'failed' && <span>❌</span>}
                          {evt.status && evt.status !== 'approved' && <span className="opacity-60 cursor-help" title={evt.status}>[{evt.status.slice(0, 1)}]</span>}
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
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {(() => {
            const monthEvents = filteredEvents
              .filter(e => {
                if (!e.startTime?.toDate) return false;
                const d = e.startTime.toDate();
                return d.getFullYear() === year && d.getMonth() === month;
              })
              .sort((a, b) => {
                const at = a.startTime?.toDate?.().getTime() || 0;
                const bt = b.startTime?.toDate?.().getTime() || 0;
                return at - bt;
              });
            if (monthEvents.length === 0) {
              return <BrutalCard className="p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">No events this month</p></BrutalCard>;
            }
            return monthEvents.map(evt => {
              const time = evt.startTime?.toDate ? evt.startTime.toDate().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }) : '';
              const day = evt.startTime?.toDate ? evt.startTime.toDate().getDate() : 0;
              return (
                <div key={evt.id} className="flex items-center gap-4 bg-white border-[2px] border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
                  <div className="w-10 h-12 border-[2px] border-black rounded-lg flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: catColor(evt.category) }}>
                    <span className="text-lg font-black leading-none">{day}</span>
                    <span className="text-[6px] font-black uppercase">{MONTHS[month].slice(0, 3)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Badge text={evt.category} color={catColor(evt.category)} />
                      {evt.outcomeStatus && <Badge text={evt.outcomeStatus} color={evt.outcomeStatus === 'success' ? COLORS.green : COLORS.red} />}
                    </div>
                    <h4 className="font-black uppercase text-[11px] italic truncate">{evt.title}</h4>
                    <p className="text-[8px] font-bold opacity-40">{evt.venueName} • {time} • {Math.max(evt.registeredCount || 0, 0)}/{evt.capacity}</p>
                  </div>
                  <Badge text={evt.status} color={evt.status === 'approved' ? COLORS.green : COLORS.yellow} />
                </div>
              );
            });
          })()}
        </div>
      )}

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
                    <p className="text-[8px] font-bold opacity-40">{evt.venueName} • {time} • {Math.max(evt.registeredCount || 0, 0)}/{evt.capacity} registered</p>
                  </div>
                  <div className="flex gap-1">
                    {evt.outcomeStatus && (
                      <Badge text={evt.outcomeStatus} color={evt.outcomeStatus === 'success' ? COLORS.green : COLORS.red} />
                    )}
                    <Badge text={evt.status} color={evt.status === 'approved' ? COLORS.green : COLORS.yellow} />
                  </div>
                </div>
              );
            })
          )}
        </BrutalCard>
      )}
    </div>
  );
}
