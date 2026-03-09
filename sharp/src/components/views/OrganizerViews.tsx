'use client';

import React, { useState } from 'react';
import { PlusCircle, ChevronRight, MoreVertical } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';

export function OrganizerDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none underline decoration-[4px] decoration-yellow-400 underline-offset-4">
          Event Center
        </h2>
        <BrutalButton color={COLORS.yellow} className="px-6 py-2 text-[10px]">
          <PlusCircle className="w-4 h-4" /> New Proposal
        </BrutalButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Status Cards + Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { status: 'Active', num: '02', color: COLORS.teal },
              { status: 'Drafts', num: '03', color: COLORS.yellow },
              { status: 'History', num: '04', color: COLORS.lavender },
              { status: 'Review', num: '05', color: COLORS.pink },
            ].map((card, i) => (
              <BrutalCard key={i} color={card.color} className="flex flex-col justify-between min-h-[140px] group border-b-[6px] border-b-black">
                <div className="flex justify-between items-start">
                  <span className="text-3xl font-black italic tracking-tighter opacity-10 leading-none">{card.num}</span>
                  <Badge text={card.status} color="white" />
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-black uppercase text-md leading-none tracking-tight">{card.status} Events</span>
                  <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </BrutalCard>
            ))}
          </div>

          {/* Performance Flow */}
          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase italic flex items-center gap-2">Performance Flow</h3>
            <BrutalCard className="h-40 flex items-end justify-between p-6 gap-2 border-[2.5px] bg-white">
              {[45, 80, 35, 95, 60, 85, 40, 100, 20].map((h, i) => (
                <div key={i} className="flex-1 bg-black border-[1.5px] border-white group relative hover:bg-yellow-400 transition-all rounded-t-lg" style={{ height: `${h}%` }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded text-[7px] opacity-0 group-hover:opacity-100 transition-opacity font-bold border border-white">
                    {h}%
                  </div>
                </div>
              ))}
            </BrutalCard>
          </div>
        </div>

        {/* Right Column — Pending Tasks */}
        <div className="space-y-5">
          <h3 className="text-lg font-black uppercase italic">Pending Tasks</h3>
          <div className="space-y-3">
            {[
              { t: 'Security Log', e: 'Tech Fest', d: 'Today' },
              { t: 'Art Proofs', e: 'Jazz Night', d: '2 days' },
              { t: 'Catering Log', e: 'Art Gala', d: 'Tomorrow' },
            ].map((task, i) => (
              <BrutalCard key={i} className="border-l-[10px] border-l-black hover:translate-x-1 transition-all p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-[7.5px] font-black uppercase opacity-30 italic">{task.e}</span>
                  <Badge text={task.d} color={COLORS.yellow} />
                </div>
                <h4 className="font-black uppercase text-[12px] italic tracking-tight leading-tight">{task.t}</h4>
                <div className="mt-3 flex gap-2">
                  <BrutalButton className="flex-1 py-1.5 text-[8px]" color="white">Verify</BrutalButton>
                  <button className="p-1.5 border-[2px] border-black rounded-lg hover:bg-slate-50 transition-colors">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </BrutalCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateEventFlow() {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      {/* Step Indicator */}
      <div className="flex justify-between relative px-2">
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-black -translate-y-1/2 z-0"></div>
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            onClick={() => setStep(s)}
            className={`relative z-10 w-10 h-10 border-[3px] border-black flex items-center justify-center font-black text-md cursor-pointer transition-all rounded-2xl ${
              step >= s ? 'bg-yellow-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <BrutalCard className="p-6 md:p-8 space-y-5 border-b-[8px] border-b-black">
        <h2 className="text-2xl font-black uppercase italic leading-none">
          {['Event Details', 'Venue', 'Resources', 'Upload Poster', 'Submit'][step - 1]}
        </h2>

        {step === 1 && (
          <div className="grid grid-cols-1 gap-5 mt-2">
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Title</label>
              <BrutalInput placeholder="e.g. Winter Code Sprint" />
            </div>
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Category</label>
              <select className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
                <option>Technical Workshop</option>
                <option>Cultural Festival</option>
                <option>Sports Tournament</option>
                <option>Academic Seminar</option>
                <option>Competition</option>
                <option>Social Event</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Brief Description</label>
              <textarea
                className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none"
                placeholder="Target audience..."
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-5 mt-2">
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Venue</label>
              <select className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
                <option>Auditorium</option>
                <option>Lab 4</option>
                <option>Grand Arena</option>
                <option>Room 10</option>
                <option>Open Ground</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Date</label>
                <BrutalInput type="date" />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Capacity</label>
                <BrutalInput placeholder="e.g. 200" type="number" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Start Time</label>
                <BrutalInput type="time" />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">End Time</label>
                <BrutalInput type="time" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-4 mt-2">
            <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Resources Needed</label>
            {['AV Equipment', 'Catering', 'Extra Seating', 'Stage Setup', 'Whiteboard', 'Projector'].map((res) => (
              <label key={res} className="flex items-center gap-3 p-2.5 border-[2px] border-black rounded-xl hover:bg-yellow-50 cursor-pointer transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-yellow-400" />
                <span className="font-black uppercase text-[10px]">{res}</span>
              </label>
            ))}
            <div className="space-y-1.5 mt-2">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Additional Notes</label>
              <textarea className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none" placeholder="Any special requirements..." />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-2">
            <div className="border-[3px] border-dashed border-black rounded-[1.5rem] p-16 text-center hover:bg-yellow-50 transition-colors cursor-pointer">
              <p className="font-black uppercase text-lg italic opacity-20">Drop Poster Here</p>
              <p className="text-[9px] font-bold uppercase opacity-30 mt-2">JPG, PNG, PDF • Max 5MB</p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="mt-2 space-y-4">
            <div className="border-[2.5px] border-black rounded-xl p-4 bg-yellow-50">
              <p className="text-[10px] font-black uppercase italic text-center">Review your event details before submitting</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Title', v: 'Winter Code Sprint' },
                { l: 'Category', v: 'Technical Workshop' },
                { l: 'Venue', v: 'Lab 4' },
                { l: 'Date', v: 'Oct 28, 2026' },
                { l: 'Capacity', v: '200' },
                { l: 'Resources', v: 'AV, Projector' },
              ].map((item) => (
                <div key={item.l} className="border-[2px] border-black rounded-lg p-2.5">
                  <span className="text-[7px] font-black uppercase opacity-30 italic">{item.l}</span>
                  <p className="text-[11px] font-black uppercase">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            className={`font-black uppercase italic underline decoration-2 underline-offset-2 text-[10px] opacity-40 hover:opacity-100 ${step === 1 ? 'invisible' : ''}`}
          >
            &larr; Previous
          </button>
          <BrutalButton className="px-8" onClick={() => step < 5 && setStep(step + 1)}>
            {step === 5 ? 'Confirm' : 'Continue'}
          </BrutalButton>
        </div>
      </BrutalCard>
    </div>
  );
}
