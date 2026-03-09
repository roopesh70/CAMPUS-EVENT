'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useAuthStore } from '@/stores/authStore';
import type { CampusEvent, EventCategory } from '@/types';

export function ExploreEvents() {
  const { events, fetchPublicEvents } = useEvents();
  const { registerForEvent } = useRegistrations();
  const { profile, isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [regLoading, setRegLoading] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string[]>([]);

  useEffect(() => { fetchPublicEvents(); }, [fetchPublicEvents]);

  const categories = ['all', 'technical', 'cultural', 'sports', 'academic', 'workshop', 'competition', 'social', 'seminar'];

  const filtered = events.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || e.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleRegister = async (evt: CampusEvent) => {
    if (!profile) return;
    setRegLoading(evt.id);
    await registerForEvent(evt.id, evt.title, profile.uid, profile.name || '', profile.department || '', evt.capacity, evt.registeredCount || 0);
    setRegLoading(null);
    setRegSuccess(prev => [...prev, evt.id]);
  };

  const catColor = (cat: string) => {
    const map: Record<string, string> = { technical: COLORS.teal, cultural: COLORS.pink, sports: COLORS.yellow, academic: COLORS.lavender, workshop: COLORS.teal, competition: COLORS.yellow, social: COLORS.pink, seminar: COLORS.lavender };
    return map[cat] || COLORS.teal;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">Explore Events</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <BrutalInput placeholder="Search events..." icon={Search} value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
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
              <BrutalCard key={evt.id} className="p-0 group overflow-hidden border-b-[5px]">
                <div className="h-32 border-b-[2px] border-black bg-slate-100 overflow-hidden flex items-center justify-center">
                  <span className="text-5xl font-black opacity-5 uppercase group-hover:scale-110 transition-transform">{evt.category}</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge text={evt.category} color={catColor(evt.category)} />
                    <Badge text={evt.status} color={evt.status === 'approved' ? COLORS.green : COLORS.yellow} />
                  </div>
                  <h4 className="text-sm font-black uppercase italic leading-tight">{evt.title}</h4>
                  <p className="text-[8px] font-bold opacity-40 uppercase">{evt.venueName} • {evt.registeredCount || 0}/{evt.capacity}</p>
                  {isAuthenticated && evt.status === 'approved' && !isRegistered ? (
                    <BrutalButton className="w-full mt-2 text-[9px]" color={COLORS.teal} disabled={regLoading === evt.id} onClick={() => handleRegister(evt)}>
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
    </div>
  );
}
