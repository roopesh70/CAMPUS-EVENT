'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Award, BarChart2, Sparkles, Ticket, Trophy, Zap, CheckCircle2, MessageSquare, ChevronRight, XCircle } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useSettings } from '@/hooks/useSettings';
import type { CampusEvent } from '@/types';
import { EventDetailModal } from '@/components/events/EventDetailModal';
import { useUIStore } from '@/stores/uiStore';
import { useNotifications } from '@/hooks/useNotifications';

export function StudentDashboard() {
  const { profile } = useAuthStore();
  const { events, fetchPublicEvents } = useEvents();
  const { registrations, fetchUserRegistrations, registerForEvent } = useRegistrations();
  const { notifications, createNotification } = useNotifications(profile?.uid);
  const { activeTab, setActiveTab } = useUIStore();
  const { settings } = useSettings();
  const [upcoming, setUpcoming] = useState<CampusEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [regId, setRegId] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string[]>([]);

  const getCategoryName = (id: string) => {
    const found = settings?.eventCategories?.find(c => c.id === id);
    return found ? found.name : id;
  };

  const catColor = (catId: string) => {
    const defaultColors = [COLORS.teal, COLORS.pink, COLORS.yellow, COLORS.lavender];
    let sum = 0;
    for (let i = 0; i < catId.length; i++) sum += catId.charCodeAt(i);
    return defaultColors[sum % defaultColors.length];
  };

  const getCategoryIcon = (catId: string) => {
    const defaultIcons = ['✨', '🔥', '🎉', '💡', '🚀', '🎯'];
    let sum = 0;
    for (let i = 0; i < catId.length; i++) sum += catId.charCodeAt(i);
    return defaultIcons[sum % defaultIcons.length];
  };

  useEffect(() => {
    fetchPublicEvents();
    if (profile?.uid) fetchUserRegistrations(profile.uid);
  }, [profile?.uid, fetchPublicEvents, fetchUserRegistrations]);

  useEffect(() => {
    const now = new Date();
    const upcomingEvents = events.filter(e => {
      if (!e.startTime?.toDate) return false;
      return e.startTime.toDate() > now;
    }).slice(0, 10);
    setUpcoming(upcomingEvents);
  }, [events]);


  const handleOpenEvent = (evt: CampusEvent) => {
    setSelectedEvent(evt);
    const existingReg = registrations.find(r => r.eventId === evt.id && (r.status === 'confirmed' || r.status === 'waitlisted'));
    setRegId(existingReg ? (existingReg.registrationId || existingReg.id || null) : null);
  };

  const handleRegister = async (evt: CampusEvent) => {
    if (!profile) return;
    setRegLoading(evt.id);
    try {
      const result = await registerForEvent(
        evt.id, evt.title, profile.uid,
        profile.name || '', profile.department || '', profile.year || null,
        evt.capacity, Math.max(evt.registeredCount || 0, 0)
      );

      if (result.error) {
        await createNotification(profile.uid, 'Registration Failed', result.error, 'system', evt.id);
        return;
      }

      if (!result.duplicate) {
        await createNotification(
          profile.uid,
          result.status === 'confirmed' ? 'Registration Confirmed!' : 'Added to Waitlist',
          result.status === 'confirmed'
            ? `You're registered for "${evt.title}". See you there!`
            : `"${evt.title}" is full. You've been added to the waitlist.`,
          'registration',
          evt.id
        );
      }
      setRegSuccess(prev => [...prev, evt.id]);
      setRegId(result.registrationId || result.id || null);
    } catch (err: any) {
      console.error('[handleRegister] Error:', err);
      await createNotification(profile.uid, 'Registration Error', 'An unexpected error occurred. Please try again.', 'system', evt.id);
    } finally {
      setRegLoading(null);
    }
  };

  const handleShare = async (evt: CampusEvent) => {
    const shareData = { title: evt.title, text: `Check out "${evt.title}" on SHARP!`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { }
    } else {
      await navigator.clipboard.writeText(`${evt.title} — ${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  const isRegisteredFor = (eventId: string) => {
    return registeredEventIds.has(eventId) || regSuccess.includes(eventId);
  };

  const firstName = profile?.name?.split(' ')[0] || 'Student';
  const regCount = registrations.filter(r => r.status === 'confirmed').length;
  const attendedCount = registrations.filter(r => r.attendanceStatus === 'present').length;
  const attendanceRate = regCount > 0 ? Math.round((attendedCount / regCount) * 100) : 0;
  const recentNotifs = notifications.slice(0, 4);

  const registeredEventIds = useMemo(() => new Set(
    registrations.filter(r => r.status === 'confirmed' || r.status === 'waitlisted').map(r => r.eventId)
  ), [registrations]);

  // Past events the student was registered for
  const pastRegistered = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => registeredEventIds.has(e.id) && e.startTime?.toDate && e.startTime.toDate() < now)
      .slice(0, 5);
  }, [events, registeredEventIds]);

  // Story 3 — Auto-reminder notifications for upcoming registered events
  useEffect(() => {
    if (!profile?.uid || registrations.length === 0 || events.length === 0) return;
    const now = Date.now();
    registrations.forEach(reg => {
      if (reg.status !== 'confirmed') return;
      const evt = events.find(e => e.id === reg.eventId);
      if (!evt?.startTime?.toDate) return;
      const start = evt.startTime.toDate().getTime();
      const diff = start - now;
      // Only remind for future events within 24 hours
      if (diff <= 0 || diff > 24 * 3600 * 1000) return;
      const label = diff < 3 * 3600 * 1000 ? '3 hours' : '24 hours';
      // Store a flag in sessionStorage to avoid spamming on every render
      const key = `reminder_${reg.eventId}_${label}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      createNotification(
        profile.uid,
        `⏰ Reminder: ${evt.title}`,
        `Your event "${evt.title}" starts in ${label}! Don't forget to attend.`,
        'reminder',
        evt.id
      );
    });
  }, [registrations, events, profile?.uid, createNotification]);

  // Story 5 — Interest-based recommendations
  // Find top categories from past registrations, then suggest events not yet registered
  const recommendations = useMemo(() => {
    if (registrations.length === 0) {
      // No history — show top 3 by registration count
      return events
        .filter(e => e.status === 'approved' && !registeredEventIds.has(e.id))
        .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
        .slice(0, 3);
    }
    // Count categories from registered events
    const catCount: Record<string, number> = {};
    registrations.forEach(reg => {
      const evt = events.find(e => e.id === reg.eventId);
      if (evt) catCount[evt.category] = (catCount[evt.category] || 0) + 1;
    });
    const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).map(([c]) => c);
    // Get upcoming events from preferred categories that aren't registered
    const now = new Date();
    const recs = events.filter(e =>
      e.status === 'approved' &&
      !registeredEventIds.has(e.id) &&
      e.startTime?.toDate && e.startTime.toDate() > now &&
      topCats.includes(e.category)
    ).slice(0, 3);
    // Fallback to any upcoming if not enough
    if (recs.length < 3) {
      const extra = events.filter(e =>
        e.status === 'approved' &&
        !registeredEventIds.has(e.id) &&
        !recs.some(r => r.id === e.id)
      ).slice(0, 3 - recs.length);
      return [...recs, ...extra];
    }
    return recs;
  }, [events, registrations, registeredEventIds]);

  const formatDate = (ts: CampusEvent['startTime']) => {
    if (!ts?.toDate) return { day: '--', month: '---', time: '' };
    const d = ts.toDate();
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleString('en', { month: 'short' }).toUpperCase(),
      time: d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }),
    };
  };

  // Action Center Logic
  const pendingFeedbackEvents = useMemo(() => {
    return registrations.filter(r =>
      r.attendanceStatus === 'present' &&
      !r.feedbackSubmitted &&
      events.some(e => e.id === r.eventId)
    ).map(r => events.find(e => e.id === r.eventId)!);
  }, [registrations, events]);
  const readyCertificates = useMemo(() => {
    return registrations.filter(r => r.attendanceStatus === 'present').length;
  }, [registrations]);

  // Mini-Calendar Logic (Next 7 Days)
  const miniCalendar = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayEvents = events.filter(e => {
        if (!e.startTime?.toDate) return false;
        const ed = e.startTime.toDate();
        return ed.getDate() === d.getDate() && ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      });
      days.push({
        date: d,
        dayName: d.toLocaleString('en', { weekday: 'short' }),
        dayNum: d.getDate(),
        hasEvent: dayEvents.length > 0,
        eventCount: dayEvents.length
      });
    }
    return days;
  }, [events]);

  // Achievement Logic
  const badges = [
    { id: 'bronze', label: 'Rookie', min: 1, icon: Trophy, color: '#CD7F32' },
    { id: 'silver', label: 'Pro', min: 5, icon: Award, color: '#C0C0C0' },
    { id: 'gold', label: 'Elite', min: 10, icon: Zap, color: '#FFD700' },
    { id: 'legend', label: 'Legend', min: 25, icon: Sparkles, color: COLORS.pink },
  ];
  const earnedBadges = badges.filter(b => attendedCount >= b.min);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <BrutalCard color={COLORS.lavender} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b-[6px] relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-4 -translate-y-4">
          <Zap className="w-40 h-40" />
        </div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">HEY {firstName.toUpperCase()}! 👋</h2>
            {earnedBadges.length > 0 && (
              <Badge text={earnedBadges[earnedBadges.length - 1].label} color={earnedBadges[earnedBadges.length - 1].color} />
            )}
          </div>
          <p className="text-[11px] font-bold uppercase opacity-80 italic">
            Your current spirit level is <span className="underline">{earnedBadges.length > 0 ? earnedBadges[earnedBadges.length - 1].label : 'Neutral'}</span>. Keep moving!
          </p>
          <div className="flex gap-1.5 mt-2">
            {badges.map(b => (
              <div key={b.id} className={`w-6 h-6 rounded-full border-[2px] border-black flex items-center justify-center transition-all ${attendedCount >= b.min ? 'bg-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]' : 'bg-black/10'}`}>
                <b.icon className={`w-3.5 h-3.5 ${attendedCount >= b.min ? 'text-black' : 'opacity-20'}`} style={{ color: attendedCount >= b.min ? b.color : '' }} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 relative z-10">
          {[
            { l: 'COMING', v: String(upcoming.length).padStart(2, '0'), c: COLORS.yellow },
            { l: 'REGS', v: String(regCount).padStart(2, '0'), c: COLORS.teal },
            { l: 'ATTENDED', v: String(attendedCount).padStart(2, '0'), c: COLORS.green },
            { l: 'ATT %', v: `${attendanceRate}%`, c: COLORS.pink },
          ].map((s) => (
            <div key={s.l} className="border-[2px] border-black bg-white p-3 text-center min-w-[85px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl">
              <div className="text-2xl font-black">{s.v}</div>
              <div className="text-[7.5px] font-black uppercase opacity-40 tracking-widest">{s.l}</div>
            </div>
          ))}
        </div>
      </BrutalCard>

      {/* Quick Access & Action Center */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="md:col-span-3">
          {pendingFeedbackEvents.length > 0 ? (
            <BrutalCard color={COLORS.pink} className="p-4 flex items-center justify-between border-b-[5px] animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border-[2.5px] border-black rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs italic">Action Required: Feedback</h4>
                  <p className="text-[9px] font-bold opacity-80 italic">Submit feedback for &quot;{pendingFeedbackEvents[0].title}&quot; to claim your certificate!</p>
                </div>
              </div>
              <BrutalButton color={COLORS.bg} className="px-4 py-1.5 text-[9px] font-black" onClick={() => setActiveTab('feedback')}>
                GO NOW <ChevronRight className="w-3.5 h-3.5" />
              </BrutalButton>
            </BrutalCard>
          ) : (
            <BrutalCard className="p-4 flex items-center gap-4 border-b-[5px] opacity-60 grayscale hover:grayscale-0 transition-all">
              <CheckCircle2 className="w-6 h-6" />
              <p className="text-[10px] font-black uppercase italic">All event actions are up to date! Good job.</p>
            </BrutalCard>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Schedule */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" /> Upcoming Timeline
            </h3>
            <div className="flex gap-1">
              {miniCalendar.map((d, i) => (
                <div key={i} className={`flex flex-col items-center p-1.5 border-[2px] border-black rounded-lg min-w-[42px] transition-all ${i === 0 ? 'bg-black text-white' : 'bg-white'} ${d.hasEvent ? 'shadow-[2.5px_2.5px_0px_0px_rgba(45,212,191,1)]' : ''}`}>
                  <span className="text-[7px] font-black uppercase leading-none">{d.dayName}</span>
                  <span className="text-[12px] font-black">{d.dayNum}</span>
                  {d.hasEvent && <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-0.5 border-[1px] border-black" />}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <BrutalCard className="p-6 text-center">
                <p className="text-[11px] font-black uppercase italic opacity-30">No upcoming events. Explore & register!</p>
                <BrutalButton color={COLORS.teal} className="mt-3 text-[9px]" onClick={() => setActiveTab('discover')}>Explore Events</BrutalButton>
              </BrutalCard>
            ) : (
              upcoming.map((event) => {
                const d = formatDate(event.startTime);
                return (
                  <BrutalCard
                    key={event.id}
                    className="flex items-center gap-5 p-4 border-l-[8px] border-l-black group hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleOpenEvent(event)}
                  >
                    {event.posterUrl ? (
                      <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 border-[2px] border-black flex flex-col items-center justify-center shrink-0 bg-yellow-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none transition-all">
                        <span className="text-lg font-black leading-none">{d.day}</span>
                        <span className="text-[7px] font-black uppercase">{d.month}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-[13px] font-black uppercase italic leading-tight">{event.title}</h4>
                      <p className="text-[9px] font-bold opacity-50 uppercase mt-0.5 tracking-tight">{event.venueName} • {d.time}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {registeredEventIds.has(event.id) && <Badge text="Registered" color={COLORS.green} />}
                    </div>
                  </BrutalCard>
                );
              })
            )}
          </div>

          {/* Participation History */}
          {pastRegistered.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                <Award className="w-5 h-5" /> Participation History
              </h3>
              {pastRegistered.map(evt => {
                const reg = registrations.find(r => r.eventId === evt.id);
                const attended = reg?.attendanceStatus === 'present';
                return (
                  <BrutalCard key={evt.id} className="flex items-center gap-4 p-3 border-l-[6px]" style={{ borderLeftColor: attended ? COLORS.green : COLORS.red }}>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-black uppercase italic">{evt.title}</h4>
                      <p className="text-[8px] font-bold opacity-40">{getCategoryName(evt.category)} • {evt.venueName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {evt.outcomeStatus && (
                        <Badge text={evt.outcomeStatus} color={evt.outcomeStatus === 'success' ? COLORS.green : COLORS.red} />
                      )}
                      <Badge text={attended ? 'Attended' : 'Missed'} color={attended ? COLORS.green : COLORS.red} />
                    </div>
                  </BrutalCard>
                );
              })}
            </div>
          )}

          {/* Story 5 — Recommended Events */}
          {recommendations.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Recommended For You
              </h3>
              {recommendations.map(evt => {
                const color = catColor(evt.category);
                return (
                  <BrutalCard key={evt.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-l-[6px]" style={{ borderLeftColor: color }}
                    onClick={() => handleOpenEvent(evt)}>
                    {evt.posterUrl ? (
                      <div className="w-9 h-9 shrink-0 rounded-lg overflow-hidden border-[2px] border-black">
                        <img src={evt.posterUrl} alt={evt.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg border-[2px] border-black flex items-center justify-center shrink-0 text-md" style={{ backgroundColor: color }}>
                        {getCategoryIcon(evt.category)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-black uppercase italic truncate">{evt.title}</h4>
                      <p className="text-[8px] font-bold opacity-40">{getCategoryName(evt.category)} • {Math.max(evt.registeredCount || 0, 0)}/{evt.capacity} registered</p>
                    </div>
                    <Badge text={getCategoryName(evt.category)} color={color} />
                  </BrutalCard>
                );
              })}
              <p className="text-[8px] font-bold opacity-30 italic text-center">Based on your event history</p>
            </div>
          )}
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

          {/* Quick Stats */}
          <BrutalCard className="p-4 border-b-[5px] space-y-3">
            <h4 className="font-black uppercase text-[10px] italic flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> My Stats</h4>
            <div className="space-y-2">
              {[
                { label: 'Total Registrations', value: regCount, color: COLORS.teal },
                { label: 'Events Attended', value: attendedCount, color: COLORS.green },
                { label: 'Attendance Rate', value: `${attendanceRate}%`, color: COLORS.yellow },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-[8px] font-black uppercase opacity-50">{s.label}</span>
                  <span className="text-[11px] font-black" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </BrutalCard>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => { setSelectedEvent(null); setRegId(null); }}
          isAuthenticated={true}
          isRegistered={isRegisteredFor(selectedEvent.id)}
          regLoading={regLoading === selectedEvent.id}
          onRegister={handleRegister}
          onShare={handleShare}
          onSignInNeeded={() => setSelectedEvent(null)}
          registrationId={regId}
        />
      )}
    </div>
  );
}
