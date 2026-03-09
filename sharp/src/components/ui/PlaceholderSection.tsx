'use client';

import React from 'react';
import { Compass } from 'lucide-react';

interface PlaceholderSectionProps {
  title: string;
}

export function PlaceholderSection({ title }: PlaceholderSectionProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center py-16 px-6 text-center space-y-6">
      <div className="w-32 h-32 border-[5px] border-black rounded-[3rem] bg-slate-100 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-6 group transition-transform hover:rotate-0">
        <Compass className="w-16 h-16 animate-spin-slow text-teal-500" />
      </div>
      <div className="space-y-1">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{title}</h2>
        <p className="text-[13px] font-bold opacity-30 uppercase tracking-[0.15em] italic">Campus_Node / Ready</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-2xl mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-[2px] border-black p-3 font-black uppercase text-[8.5px] bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl hover:bg-yellow-400 transition-colors italic">
            Module_ {i + 20}
          </div>
        ))}
      </div>
    </div>
  );
}
