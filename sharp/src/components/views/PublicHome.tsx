'use client';

import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';

export function PublicHome() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Hero — Yellow */}
        <BrutalCard color={COLORS.yellow} className="relative min-h-[300px] flex flex-col justify-end p-6 group">
          <Badge text="Live" color="#EF4444" pulsing={true} className="absolute top-5 left-5" />
          <div className="space-y-3 z-10">
            <h2 className="text-3xl md:text-4xl font-black leading-[0.95] tracking-tighter uppercase italic">
              MILLIONS OF<br />EXPERIENCES.<br />NOW WE&apos;RE LIVE.
            </h2>
            <BrutalButton color="white" className="w-fit rounded-full px-5 py-2.5 text-[9px]">
              Explore Events <ChevronRight className="w-4 h-4" />
            </BrutalButton>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white border-[4px] border-black rounded-full group-hover:scale-110 transition-all duration-700 opacity-20"></div>
        </BrutalCard>

        {/* Right Hero — Teal */}
        <BrutalCard color={COLORS.teal} className="relative min-h-[300px] flex flex-col items-center justify-center text-center p-6">
          <div className="w-28 h-28 bg-white border-[3px] border-black rounded-[1.5rem] mb-4 flex items-center justify-center shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] rotate-3 transition-transform hover:rotate-0">
            <Zap className="w-10 h-10 text-yellow-500" />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tight underline decoration-2 underline-offset-4">Meaningful Design.</h3>
          <p className="font-bold max-w-xs mt-2 text-[10px] uppercase opacity-70 leading-relaxed italic">Interactive campus systems with a fluid animation engine.</p>
          <div className="mt-5 flex items-center gap-2">
            <div className="w-28 h-2 bg-black rounded-full overflow-hidden border border-black">
              <div className="w-2/3 h-full bg-white animate-pulse"></div>
            </div>
            <span className="font-black text-[9px]">UP NEXT: OCT 24</span>
          </div>
        </BrutalCard>
      </div>

      {/* Top Picks */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-black uppercase underline decoration-[5px] decoration-pink-400 underline-offset-[6px] italic tracking-tight">Top Picks</h3>
          <BrutalButton color="white" className="text-[8px] px-3 py-1.5">Explore More</BrutalButton>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { badge: 'Visual', color: COLORS.teal, title: 'The Cool Crafts Man' },
            { badge: 'Beats', color: COLORS.pink, title: 'The Cool Crafts Man' },
            { badge: 'Code', color: COLORS.lavender, title: 'The Cool Crafts Man' },
            { badge: 'Stage', color: COLORS.yellow, title: 'The Cool Crafts Man' },
          ].map((item, i) => (
            <BrutalCard key={i} className="p-0 group overflow-hidden border-b-[5px]">
              <div className="h-36 border-b-[2px] border-black bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${i + 60}/500/350`}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  alt="event"
                />
              </div>
              <div className="p-4 space-y-2">
                <Badge text={item.badge} color={item.color} />
                <h4 className="text-md font-black uppercase italic leading-tight">{item.title}</h4>
                <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Ralph Edwards • Ep 03</p>
                <BrutalButton className="w-full mt-2 bg-yellow-400 border-2">View Now</BrutalButton>
              </div>
            </BrutalCard>
          ))}
        </div>
      </section>
    </div>
  );
}
