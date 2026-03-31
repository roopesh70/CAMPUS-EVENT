'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, X, MapPin, Clock, Users, ArrowUpDown, Share2, TrendingUp, Timer, Mail, Phone } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useSettings } from '@/hooks/useSettings';
import type { CampusEvent } from '@/types';
import { EventDetailModal } from '@/components/events/EventDetailModal';

export function ExploreEvents() {
  const { events, fetchPublicEvents } = useEvents();
  const { registerForEvent, fetchUserRegistrations, registrations: userRegs } = useRegistrations();
  const { profile, isAuthenticated } = useAuthStore();
  const { createNotification } = useNotifications(useAuthStore.getState().profile?.uid);
  const { setActiveTab, targetEventId, setTargetEventId } = useUIStore();
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'popularity'>('date');
  const [regLoading, setRegLoading] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string[]>([]);
  const [regId, setRegId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  // Load user's existing registrations from Firestore so Register button reflects real state
  useEffect(() => {
    fetchPublicEvents();
    if (profile?.uid && isAuthenticated) {
      fetchUserRegistrations(profile.uid);
    }
  }, [fetchPublicEvents, fetchUserRegistrations, profile?.uid, isAuthenticated]);

  // Merge Firestore registrations + in-session new registrations for guard
  const registeredEventIds = useMemo(() => {
    const fromDB = new Set(userRegs.filter(r => r.status === 'confirmed' || r.status === 'waitlisted').map(r => r.eventId));
    regSuccess.forEach(id => fromDB.add(id));
    return fromDB;
  }, [userRegs, regSuccess]);

  // Handle deep-linking from UI State
  useEffect(() => {
    if (targetEventId && events.length > 0) {
      const evt = events.find(e => e.id === targetEventId);
      if (evt) {
        setSelectedEvent(evt);
        setTargetEventId(null);
      }
    }
  }, [targetEventId, events, setTargetEventId]);

  const isRegisteredFor = (eventId: string) => registeredEventIds.has(eventId);

  const categories = [
    { id: 'all', name: 'All' },
    ...((settings?.eventCategories?.length ? settings.eventCategories : null) ?? [
      { id: 'technical', name: 'Technical' },
      { id: 'cultural', name: 'Cultural' },
      { id: 'sports', name: 'Sports' }
    ])
  ];

  const getCategoryName = (id: string) => {
    if (id === 'all') return 'All';
    const found = settings?.eventCategories?.find(c => c.id === id);
    return found ? found.name : id;
  };

  // Trending: top 3 by registrations
  const trending = useMemo(() =>
    [...events]
      .filter(e => e.status === 'approved')
      .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
      .slice(0, 3),
    [events]
  );

  const filtered = events
    .filter(e => {
      const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()) || (e.venueName || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'all' || e.category === catFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') return (b.registeredCount || 0) - (a.registeredCount || 0);
      const at = a.startTime?.toDate ? a.startTime.toDate().getTime() : 0;
      const bt = b.startTime?.toDate ? b.startTime.toDate().getTime() : 0;
      return at - bt;
    });

  const handleOpenEvent = (evt: CampusEvent) => {
    setSelectedEvent(evt);
    const existingReg = userRegs.find(r => r.eventId === evt.id && (r.status === 'confirmed' || r.status === 'waitlisted'));
    setRegId(existingReg ? (existingReg.registrationId || existingReg.id || null) : null);
  };

  const handleRegister = async (evt: CampusEvent) => {
    if (!profile) return;
    // Guard: don't register if already registered (UI defence)
    if (isRegisteredFor(evt.id)) {
      setRegLoading(null);
      return;
    }
    setRegLoading(evt.id);
    try {
      const result = await registerForEvent(
        evt.id, evt.title, profile.uid,
        profile.name || '', profile.department || '', profile.year || null,
        evt.capacity, Math.max(evt.registeredCount || 0, 0)
      );

      if (result.error) {
        console.error('[Registration block]', result.error);
        await createNotification(profile.uid, 'Registration Failed', result.error, 'system', evt.id);
        return;
      }

      // If server returned duplicate flag, just mark as registered without creating another notification
      if (result.duplicate) {
        setRegSuccess(prev => [...prev, evt.id]);
        setRegId(result.registrationId || result.id || null);
        return;
      }
      await createNotification(
        profile.uid,
        result.status === 'confirmed' ? 'Registration Confirmed!' : 'Added to Waitlist',
        result.status === 'confirmed'
          ? `You're registered for "${evt.title}". See you there!`
          : `"${evt.title}" is full. You've been added to the waitlist.`,
        'registration',
        evt.id
      );
      setRegSuccess(prev => [...prev, evt.id]);
      setRegId(result.registrationId || result.id || null);
    } catch (err: any) {
      console.error('[handleRegister Error]', err);
      // Fail gracefully: notify user and log
      await createNotification(profile.uid, 'Registration Error', 'An unexpected error occurred. Please try again.', 'system', evt.id);
    } finally {
      setRegLoading(null);
    }
  };

  const handleShare = async (evt: CampusEvent) => {
    const shareData = { title: evt.title, text: `Check out "${evt.title}" on CAMEVE!`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { }
    } else {
      await navigator.clipboard.writeText(`${evt.title} — ${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  const catColor = (cat: string) => {
    const defaultColors = [COLORS.teal, COLORS.pink, COLORS.yellow, COLORS.lavender];
    let sum = 0;
    for (let i = 0; i < cat.length; i++) sum += cat.charCodeAt(i);
    return defaultColors[sum % defaultColors.length];
  };

  // Countdown helper
  const getCountdown = (evt: CampusEvent) => {
    if (!evt.startTime?.toDate) return null;
    const now = Date.now();
    const start = evt.startTime.toDate().getTime();
    const diff = start - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Deadline check
  const isPastDeadline = (evt: CampusEvent) => {
    if (!evt.registrationDeadline?.toDate) return false;
    return Date.now() > evt.registrationDeadline.toDate().getTime();
  };

  // Past event check — event has already started/ended
  const isPastEvent = (evt: CampusEvent) => {
    if (!evt.startTime?.toDate) return false;
    return Date.now() > evt.startTime.toDate().getTime();
  };

  const formatDate = (evt: CampusEvent) => {
    if (!evt.startTime?.toDate) return '';
    const d = evt.startTime.toDate();
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (evt: CampusEvent) => {
    if (!evt.startTime?.toDate) return '';
    const s = evt.startTime.toDate();
    const e = evt.endTime?.toDate ? evt.endTime.toDate() : null;
    const start = s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const end = e ? e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
    return end ? `${start} — ${end}` : start;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">Explore Events</h2>

      {/* Trending Section */}
      {trending.length > 0 && !search && catFilter === 'all' && (
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase italic flex items-center gap-1.5 opacity-60"><TrendingUp className="w-4 h-4" /> Trending Now</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {trending.map((evt, i) => (
              <div key={evt.id} onClick={() => handleOpenEvent(evt)}
                className="min-w-[240px] border-[2.5px] border-black rounded-xl p-3 bg-gradient-to-br from-yellow-50 to-pink-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:shadow-none transition-all flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 border-[2px] border-black rounded-lg flex items-center justify-center font-black text-lg shrink-0">
                  {i === 0 ? '🔥' : i === 1 ? '⚡' : '✨'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-black uppercase italic truncate">{evt.title}</h4>
                  <p className="text-[8px] font-bold opacity-40">{Math.max(evt.registeredCount || 0, 0)} registered • {getCategoryName(evt.category)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <BrutalInput placeholder="Search events, venues..." icon={Search} value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
        <button onClick={() => setSortBy(sortBy === 'date' ? 'popularity' : 'date')}
          className="flex items-center gap-1.5 border-[2.5px] border-black px-4 py-2 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic bg-white whitespace-nowrap">
          <ArrowUpDown className="w-3.5 h-3.5" /> {sortBy === 'date' ? 'By Date' : 'By Popularity'}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setCatFilter(cat.id)}
            className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${catFilter === cat.id ? 'bg-yellow-400' : 'bg-white'}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-[8px] font-black uppercase italic opacity-30">{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Event Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <BrutalCard className="col-span-3 p-8 text-center">
            <p className="text-[11px] font-black uppercase italic opacity-30">{events.length === 0 ? 'No events yet. Be the first to create one!' : 'No events match your filters.'}</p>
          </BrutalCard>
        ) : (
          filtered.map((evt) => {
            const isRegistered = isRegisteredFor(evt.id);
            return (
              <BrutalCard key={evt.id} className="p-0 group overflow-hidden border-b-[5px]" onClick={() => handleOpenEvent(evt)}>
                <div className="h-32 border-b-[2px] border-black bg-slate-100 overflow-hidden flex items-center justify-center relative">
                  {evt.posterUrl ? (
                    <img src={evt.posterUrl} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-5xl font-black opacity-5 uppercase group-hover:scale-110 transition-transform">{evt.category}</span>
                  )}
                  <div className="absolute top-2 right-2"><Badge text={evt.status} color={evt.status === 'approved' ? COLORS.green : COLORS.yellow} /></div>
                </div>
                <div className="p-4 space-y-2">
                  <Badge text={getCategoryName(evt.category)} color={catColor(evt.category)} />
                  <h4 className="text-sm font-black uppercase italic leading-tight">{evt.title}</h4>
                  <div className="flex items-center gap-3 text-[8px] font-bold opacity-40 uppercase">
                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {formatDate(evt)}</span>
                    <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {evt.venueName || '—'}</span>
                  </div>
                  <p className="text-[8px] font-bold opacity-40 uppercase flex items-center gap-0.5"><Users className="w-2.5 h-2.5" /> {Math.max(evt.registeredCount || 0, 0)}/{evt.capacity} registered</p>
                  {isAuthenticated && evt.status === 'approved' && !isRegistered ? (
                    <BrutalButton className="w-full mt-2 text-[9px]" color={COLORS.teal} disabled={regLoading === evt.id} onClick={(e) => { e.stopPropagation(); handleRegister(evt); }}>
                      {regLoading === evt.id ? 'Registering...' : 'Register Now'}
                    </BrutalButton>
                  ) : isRegistered ? (
                    <BrutalButton className="w-full mt-2 text-[9px]" color={COLORS.green} disabled>✓ Registered</BrutalButton>
                  ) : (
                    <BrutalButton className="w-full mt-2 text-[9px]" color="white">View Details</BrutalButton>
                  )}
                </div>
              </BrutalCard>
            );
          })
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => { setSelectedEvent(null); setRegId(null); }}
          isAuthenticated={isAuthenticated}
          isRegistered={isRegisteredFor(selectedEvent.id)}
          regLoading={regLoading === selectedEvent.id}
          onRegister={handleRegister}
          onShare={handleShare}
          onSignInNeeded={() => { setSelectedEvent(null); setActiveTab('auth'); }}
          registrationId={regId}
        />
      )}
    </div>
  );
}
