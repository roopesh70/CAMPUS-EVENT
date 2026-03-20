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
import type { CampusEvent } from '@/types';

export function ExploreEvents() {
  const { events, fetchPublicEvents } = useEvents();
  const { registerForEvent, fetchUserRegistrations, registrations: userRegs } = useRegistrations();
  const { profile, isAuthenticated } = useAuthStore();
  const { createNotification } = useNotifications(useAuthStore.getState().profile?.uid);
  const { setActiveTab, targetEventId, setTargetEventId } = useUIStore();
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

  const categories = ['all', 'technical', 'cultural', 'sports', 'academic', 'workshop', 'competition', 'social', 'seminar'];

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
    const result = await registerForEvent(
      evt.id, evt.title, profile.uid,
      profile.name || '', profile.department || '',
      evt.capacity, Math.max(evt.registeredCount || 0, 0)
    );
    setRegLoading(null);

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
  };

  const handleShare = async (evt: CampusEvent) => {
    const shareData = { title: evt.title, text: `Check out "${evt.title}" on SHARP!`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(`${evt.title} — ${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  const catColor = (cat: string) => {
    const map: Record<string, string> = { technical: COLORS.teal, cultural: COLORS.pink, sports: COLORS.yellow, academic: COLORS.lavender, workshop: COLORS.teal, competition: COLORS.yellow, social: COLORS.pink, seminar: COLORS.lavender };
    return map[cat] || COLORS.teal;
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
                  <p className="text-[8px] font-bold opacity-40">{Math.max(evt.registeredCount || 0, 0)} registered • {evt.category}</p>
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
          <button key={cat} onClick={() => setCatFilter(cat)}
            className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${catFilter === cat ? 'bg-yellow-400' : 'bg-white'}`}>
            {cat}
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
                  <Badge text={evt.category} color={catColor(evt.category)} />
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]" onClick={() => { setSelectedEvent(null); setRegId(null); }}>
          <div className="bg-[#FFFBEB] border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
            {/* Poster Banner */}
            {selectedEvent.posterUrl && (
              <img src={selectedEvent.posterUrl} alt="Event poster" className="w-full max-h-52 object-cover rounded-t-2xl border-b-[2.5px] border-black" />
            )}

            {/* Header */}
            <div className="border-b-[2.5px] border-black p-5 flex justify-between items-start bg-slate-50">
              <div>
                <div className="flex gap-2 mb-2">
                  <Badge text={selectedEvent.category} color={catColor(selectedEvent.category)} />
                  <Badge text={selectedEvent.status} color={selectedEvent.status === 'approved' ? COLORS.green : COLORS.yellow} />
                  {getCountdown(selectedEvent) && (
                    <span className="flex items-center gap-1 bg-orange-100 border-[1.5px] border-orange-400 rounded-lg px-2 py-0.5">
                      <Timer className="w-3 h-3" />
                      <span className="text-[8px] font-black">{getCountdown(selectedEvent)}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black uppercase italic">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => { setSelectedEvent(null); setRegId(null); }} className="w-8 h-8 border-[2px] border-black rounded-lg bg-white flex items-center justify-center hover:bg-red-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-white border-[2px] border-black rounded-xl p-3">
                  <Clock className="w-4 h-4 opacity-40" />
                  <div>
                    <span className="text-[7px] font-black uppercase opacity-40 block">Date & Time</span>
                    <span className="text-[10px] font-black">{formatDate(selectedEvent)}</span>
                    <span className="text-[8px] font-bold opacity-50 block">{formatTime(selectedEvent)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border-[2px] border-black rounded-xl p-3">
                  <MapPin className="w-4 h-4 opacity-40" />
                  <div>
                    <span className="text-[7px] font-black uppercase opacity-40 block">Venue</span>
                    <span className="text-[10px] font-black">{selectedEvent.venueName || 'TBD'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border-[2px] border-black rounded-xl p-3">
                  <Users className="w-4 h-4 opacity-40" />
                  <div>
                    <span className="text-[7px] font-black uppercase opacity-40 block">Capacity</span>
                    <span className="text-[10px] font-black">{Math.max(selectedEvent.registeredCount || 0, 0)} / {selectedEvent.capacity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border-[2px] border-black rounded-xl p-3">
                  <Users className="w-4 h-4 opacity-40" />
                  <div>
                    <span className="text-[7px] font-black uppercase opacity-40 block">Organizer</span>
                    <span className="text-[10px] font-black">{selectedEvent.organizerName || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[9px] font-black uppercase italic opacity-40 mb-1">About this event</h4>
                <p className="text-[11px] font-bold leading-relaxed opacity-70 whitespace-pre-wrap">{selectedEvent.description || 'No description provided.'}</p>
              </div>

              {/* Target Audience */}
              {selectedEvent.targetAudience && (
                <div>
                  <h4 className="text-[9px] font-black uppercase italic opacity-40 mb-1">Target Audience</h4>
                  <p className="text-[11px] font-bold leading-relaxed opacity-70">{selectedEvent.targetAudience}</p>
                </div>
              )}

              {/* Co-Organizers */}
              {selectedEvent.coOrganizers && (
                <div>
                  <h4 className="text-[9px] font-black uppercase italic opacity-40 mb-1">Co-Organizers</h4>
                  <p className="text-[11px] font-bold leading-relaxed opacity-70">{selectedEvent.coOrganizers}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-6">
                {/* Department */}
                {selectedEvent.department && (
                  <div>
                    <h4 className="text-[9px] font-black uppercase italic opacity-40 mb-1">Department</h4>
                    <Badge text={selectedEvent.department} color={COLORS.lavender} />
                  </div>
                )}

                {/* Eligibility */}
                {(selectedEvent.eligibility?.departments?.length > 0 || selectedEvent.eligibility?.years?.length > 0) && (
                  <div>
                    <h4 className="text-[9px] font-black uppercase italic opacity-40 mb-1">Eligibility</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEvent.eligibility?.departments?.map((dep, i) => (
                        <Badge key={`dep-${i}`} text={dep} color={COLORS.lavender} />
                      ))}
                      {selectedEvent.eligibility?.years?.map((year, i) => (
                        <Badge key={`year-${i}`} text={`Year ${year}`} color={COLORS.pink} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resources */}
              {selectedEvent.resources && selectedEvent.resources.length > 0 && (
                <div>
                  <h4 className="text-[9px] font-black uppercase italic opacity-40 mb-1">Resources</h4>
                  <div className="flex flex-wrap gap-1.5">{selectedEvent.resources.map((r, i) => <Badge key={`res-${i}`} text={r} color="white" />)}</div>
                </div>
              )}

              {/* Contact Info */}
              {(selectedEvent.contactEmail || selectedEvent.contactPhone) && (
                <div className="bg-white border-[2px] border-black rounded-xl p-3">
                  <h4 className="text-[9px] font-black uppercase italic opacity-40 mb-2">Contact / Support</h4>
                  <div className="flex flex-col gap-1.5 text-[10px] font-black">
                    {selectedEvent.contactEmail && (
                      <a href={`mailto:${selectedEvent.contactEmail}`} className="flex items-center gap-2 hover:underline decoration-2 underline-offset-2 w-fit">
                        <span className="w-5 h-5 bg-teal-100 rounded flex items-center justify-center border-[1.5px] border-black"><Mail className="w-2.5 h-2.5" /></span> {selectedEvent.contactEmail}
                      </a>
                    )}
                    {selectedEvent.contactPhone && (
                      <a href={`tel:${selectedEvent.contactPhone}`} className="flex items-center gap-2 hover:underline decoration-2 underline-offset-2 w-fit">
                        <span className="w-5 h-5 bg-yellow-100 rounded flex items-center justify-center border-[1.5px] border-black"><Phone className="w-2.5 h-2.5" /></span> {selectedEvent.contactPhone}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Registration Deadline */}
              {selectedEvent.registrationDeadline?.toDate && (
                <div className={`flex items-center gap-2 p-2 rounded-lg border-[1.5px] ${isPastDeadline(selectedEvent) ? 'border-red-400 bg-red-50' : 'border-teal-400 bg-teal-50'}`}>
                  <Timer className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase italic">
                    {isPastDeadline(selectedEvent) ? '⛔ Registration Closed' : `Deadline: ${selectedEvent.registrationDeadline.toDate().toLocaleDateString()}`}
                  </span>
                </div>
              )}

              {/* Register Button */}
              {isAuthenticated && selectedEvent.status === 'approved' && !isRegisteredFor(selectedEvent.id) && !isPastDeadline(selectedEvent) && !isPastEvent(selectedEvent) ? (
                <BrutalButton className="w-full py-3 text-sm" color={COLORS.teal} disabled={regLoading === selectedEvent.id} onClick={() => handleRegister(selectedEvent)}>
                  {regLoading === selectedEvent.id ? 'Registering...' : `Register Now (${Math.max(selectedEvent.registeredCount || 0, 0)}/${selectedEvent.capacity})`}
                </BrutalButton>
              ) : isRegisteredFor(selectedEvent.id) ? (
                <div className="space-y-2">
                  <BrutalButton className="w-full py-3 text-sm" color={COLORS.green} disabled>✓ You're Registered!</BrutalButton>
                  {regId && (
                    <div className="text-center p-2 bg-green-50 border-[2px] border-green-500 rounded-xl">
                      <span className="text-[8px] font-black uppercase block opacity-40">Registration ID</span>
                      <span className="text-sm font-black font-mono">{regId}</span>
                    </div>
                  )}
                </div>
              ) : isPastEvent(selectedEvent) ? (
                <BrutalButton className="w-full py-3 text-sm" color="#e5e7eb" disabled>⏰ Event Has Ended</BrutalButton>
              ) : isPastDeadline(selectedEvent) ? (
                <BrutalButton className="w-full py-3 text-sm" color="#e5e7eb" disabled>Registration Closed</BrutalButton>
              ) : !isAuthenticated ? (
                <div className="bg-slate-50 border-[2.5px] border-black p-4 rounded-xl text-center space-y-3">
                  <p className="text-xs font-bold italic opacity-60">Log in to register and save your spot</p>
                  <BrutalButton className="w-full py-3 text-sm" color={COLORS.yellow} onClick={() => { setSelectedEvent(null); setActiveTab('auth'); }}>Sign In to Register</BrutalButton>
                </div>
              ) : null}

              {/* Share Button */}
              <button onClick={() => handleShare(selectedEvent)}
                className="w-full flex items-center justify-center gap-2 border-[2px] border-black px-4 py-2 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic bg-white">
                <Share2 className="w-3.5 h-3.5" /> Share Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
