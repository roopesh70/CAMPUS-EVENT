'use client';

import React, { useEffect, useState } from 'react';
import { Search, X, MapPin, Clock, Users, ArrowUpDown } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/authStore';
import type { CampusEvent } from '@/types';

export function ExploreEvents() {
  const { events, fetchPublicEvents } = useEvents();
  const { registerForEvent } = useRegistrations();
  const { createNotification } = useNotifications(useAuthStore.getState().profile?.uid);
  const { profile, isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'popularity'>('date');
  const [regLoading, setRegLoading] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  useEffect(() => { fetchPublicEvents(); }, [fetchPublicEvents]);

  const categories = ['all', 'technical', 'cultural', 'sports', 'academic', 'workshop', 'competition', 'social', 'seminar'];

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

  const handleRegister = async (evt: CampusEvent) => {
    if (!profile) return;
    setRegLoading(evt.id);
    const result = await registerForEvent(evt.id, evt.title, profile.uid, profile.name || '', profile.department || '', evt.capacity, Math.max(evt.registeredCount || 0, 0));
    // Send notification to student
    await createNotification(
      profile.uid,
      result.status === 'confirmed' ? 'Registration Confirmed!' : 'Added to Waitlist',
      result.status === 'confirmed'
        ? `You're registered for "${evt.title}". See you there!`
        : `"${evt.title}" is full. You've been added to the waitlist.`,
      'registration',
      evt.id
    );
    setRegLoading(null);
    setRegSuccess(prev => [...prev, evt.id]);
    setSelectedEvent(null);
  };

  const catColor = (cat: string) => {
    const map: Record<string, string> = { technical: COLORS.teal, cultural: COLORS.pink, sports: COLORS.yellow, academic: COLORS.lavender, workshop: COLORS.teal, competition: COLORS.yellow, social: COLORS.pink, seminar: COLORS.lavender };
    return map[cat] || COLORS.teal;
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
            const isRegistered = regSuccess.includes(evt.id);
            return (
              <BrutalCard key={evt.id} className="p-0 group overflow-hidden border-b-[5px]" onClick={() => setSelectedEvent(evt)}>
                <div className="h-32 border-b-[2px] border-black bg-slate-100 overflow-hidden flex items-center justify-center relative">
                  <span className="text-5xl font-black opacity-5 uppercase group-hover:scale-110 transition-transform">{evt.category}</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-[#FFFBEB] border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="border-b-[2.5px] border-black p-5 flex justify-between items-start bg-slate-50 rounded-t-2xl">
              <div>
                <div className="flex gap-2 mb-2">
                  <Badge text={selectedEvent.category} color={catColor(selectedEvent.category)} />
                  <Badge text={selectedEvent.status} color={selectedEvent.status === 'approved' ? COLORS.green : COLORS.yellow} />
                </div>
                <h3 className="text-xl font-black uppercase italic">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="w-8 h-8 border-[2px] border-black rounded-lg bg-white flex items-center justify-center hover:bg-red-100 transition-colors">
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
                <p className="text-[11px] font-bold leading-relaxed opacity-70">{selectedEvent.description || 'No description provided.'}</p>
              </div>

              {/* Department */}
              {selectedEvent.department && (
                <div>
                  <h4 className="text-[9px] font-black uppercase italic opacity-40 mb-1">Department</h4>
                  <Badge text={selectedEvent.department} color={COLORS.lavender} />
                </div>
              )}

              {/* Resources */}
              {selectedEvent.resources && selectedEvent.resources.length > 0 && (
                <div>
                  <h4 className="text-[9px] font-black uppercase italic opacity-40 mb-1">Resources</h4>
                  <div className="flex flex-wrap gap-1.5">{selectedEvent.resources.map((r, i) => <Badge key={i} text={r} color="white" />)}</div>
                </div>
              )}

              {/* Register Button */}
              {isAuthenticated && selectedEvent.status === 'approved' && !regSuccess.includes(selectedEvent.id) ? (
                <BrutalButton className="w-full py-3 text-sm" color={COLORS.teal} disabled={regLoading === selectedEvent.id} onClick={() => handleRegister(selectedEvent)}>
                  {regLoading === selectedEvent.id ? 'Registering...' : `Register Now (${Math.max(selectedEvent.registeredCount || 0, 0)}/${selectedEvent.capacity})`}
                </BrutalButton>
              ) : regSuccess.includes(selectedEvent.id) ? (
                <BrutalButton className="w-full py-3 text-sm" color={COLORS.green} disabled>✓ You're Registered!</BrutalButton>
              ) : !isAuthenticated ? (
                <BrutalButton className="w-full py-3 text-sm" color={COLORS.yellow}>Sign In to Register</BrutalButton>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
