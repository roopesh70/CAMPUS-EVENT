'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';

export function ExploreEvents() {
  const categories = ['All', 'Workshops', 'Concerts', 'Sports', 'Hackathons'];
  const events = [
    { title: 'Inter-Campus 3x3 Basketball', date: 'Oct 22 • 10:00 AM', venue: 'Indoor Complex' },
    { title: 'AI Ethics Symposium 2026', date: 'Oct 24 • 2:00 PM', venue: 'Auditorium' },
    { title: 'Neo-Jazz Night', date: 'Oct 25 • 7:00 PM', venue: 'Grand Arena' },
    { title: 'Quantum Hackathon', date: 'Oct 28 • 9:00 AM', venue: 'Lab 4' },
    { title: 'Campus Music Festival', date: 'Nov 1 • 5:00 PM', venue: 'Open Ground' },
    { title: 'Startup Pitch Day', date: 'Nov 5 • 11:00 AM', venue: 'Room 10' },
  ];

  return (
    <div className="space-y-8">
      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <BrutalInput className="flex-1" placeholder="Search by name..." icon={Search} />
        <BrutalButton color={COLORS.teal} className="px-6 py-2.5">
          <Filter className="w-4 h-4" /> Filters
        </BrutalButton>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${
              i === 0 ? 'bg-yellow-400' : 'bg-white hover:bg-yellow-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, i) => (
          <BrutalCard key={i} className="group p-0 overflow-hidden border-b-[5px]">
            <div className="h-40 border-b-[2px] border-black relative overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://picsum.photos/seed/${i + 170}/700/500`}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                alt="event"
              />
              <div className="absolute top-2.5 left-2.5">
                <Badge text="Popular" color={COLORS.yellow} pulsing />
              </div>
            </div>
            <div className="p-5 space-y-2.5">
              <h4 className="text-lg font-black uppercase italic leading-tight">{event.title}</h4>
              <div className="flex items-center justify-between mt-3">
                <div className="text-[7.5px] font-black uppercase opacity-30 italic leading-snug">
                  <p>{event.date}</p>
                  <p>{event.venue}</p>
                </div>
                <BrutalButton className="px-4 py-1 text-[8.5px]" color={COLORS.pink}>Register</BrutalButton>
              </div>
            </div>
          </BrutalCard>
        ))}
      </div>
    </div>
  );
}
