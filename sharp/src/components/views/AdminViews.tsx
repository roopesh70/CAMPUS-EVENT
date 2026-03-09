'use client';

import React from 'react';
import { LayoutDashboard, Users, ShieldCheck, AlertCircle, Check, X } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Users', value: '4.2k', color: COLORS.teal, icon: Users },
          { label: 'Active Events', value: '38', color: COLORS.yellow, icon: LayoutDashboard },
          { label: 'Pending', value: '12', color: COLORS.pink, icon: ShieldCheck },
          { label: 'Conflicts', value: '0', color: COLORS.lavender, icon: AlertCircle },
        ].map((stat, i) => (
          <BrutalCard key={i} color={stat.color} className="flex items-center justify-between p-5 border-b-[5px] border-black">
            <div className="space-y-0">
              <span className="text-[7px] font-black uppercase opacity-60 tracking-wider leading-none">{stat.label}</span>
              <div className="text-2xl font-black tracking-tighter mt-1">{stat.value}</div>
            </div>
            <div className="bg-white border-[1.5px] border-black p-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <stat.icon className="w-4 h-4" />
            </div>
          </BrutalCard>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Approvals Queue */}
        <BrutalCard className="p-0 border-[2.5px]">
          <div className="p-3.5 border-b-[2.5px] border-black bg-black text-white flex justify-between items-center">
            <h3 className="text-[11px] font-black uppercase italic tracking-widest">Pending Queue</h3>
            <Badge text="Action Required" color={COLORS.pink} pulsing />
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left font-bold">
              <thead>
                <tr className="border-b-[2px] border-black text-[8px] uppercase opacity-40 italic tracking-widest">
                  <th className="p-2.5">Proposal Name</th>
                  <th className="p-2.5 text-center">Venue</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                {[
                  { name: 'Quantum Hackathon', venue: 'Lab 4' },
                  { name: 'Neo-Jazz Night', venue: 'Hall' },
                  { name: 'Startup Pitch', venue: 'Room A' },
                ].map((row, i) => (
                  <tr key={i} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 font-black uppercase truncate max-w-[120px]">{row.name}</td>
                    <td className="p-2.5 text-center"><Badge text={row.venue} color="#fff" /></td>
                    <td className="p-2.5 flex gap-1.5 justify-end">
                      <button className="w-7 h-7 bg-green-400 border-[2px] border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:shadow-none transition-all">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 bg-red-400 border-[2px] border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:shadow-none transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BrutalCard>

        {/* Stats Summary — Donut Chart */}
        <BrutalCard className="flex flex-col items-center justify-center p-6 gap-6 text-center bg-white border-[2.5px]">
          <h3 className="text-lg font-black uppercase italic underline decoration-2 underline-offset-4 tracking-tight">Stats Summary</h3>
          <div className="relative w-40 h-40 border-[5px] border-black rounded-full flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-slate-100 overflow-hidden group">
            <div className="absolute inset-0 border-[25px] border-teal-400" style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
            <div className="absolute inset-0 border-[25px] border-pink-400" style={{ clipPath: 'polygon(50% 50%, 0 0, 50% 0)' }}></div>
            <div className="z-10 bg-white border-[3px] border-black w-20 h-20 rounded-full flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-xl font-black leading-none italic">86%</span>
              <span className="text-[6.5px] font-black uppercase opacity-40">Growth</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {['Academic', 'Cultural', 'Athletic'].map((t, i) => (
              <div key={t} className="flex items-center gap-1.5 font-black text-[8px] uppercase tracking-tighter">
                <div className="w-2.5 h-2.5 border-[1.5px] border-black rounded-sm" style={{ backgroundColor: [COLORS.teal, COLORS.pink, COLORS.yellow][i] }}></div>
                {t}
              </div>
            ))}
          </div>
        </BrutalCard>
      </div>
    </div>
  );
}

export function AdminApprovals() {
  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-2 border-b-[3px] border-black pb-0">
        <button className="px-6 py-2.5 font-black uppercase text-xs italic bg-yellow-400 border-x-[2.5px] border-t-[2.5px] border-black rounded-t-xl -mb-[3px] z-10">Pending</button>
        <button className="px-6 py-2.5 font-black uppercase text-xs italic hover:bg-slate-50 opacity-40">History</button>
      </div>

      {/* Approval Cards */}
      <div className="grid grid-cols-1 gap-4">
        {[
          { title: 'AI Ethics Symposium 2026', desc: 'Exploring the intersections of machine intelligence and human morality with faculty experts.', cat: 'Academic', time: '2h ago' },
          { title: 'Quantum Computing Workshop', desc: 'Hands-on workshop covering qubits, gates, and quantum circuits for beginners and intermediates.', cat: 'Technical', time: '5h ago' },
          { title: 'Campus Art Exhibition', desc: 'Student artwork showcase featuring paintings, sculptures, and digital art from all departments.', cat: 'Cultural', time: '1d ago' },
        ].map((item, i) => (
          <BrutalCard key={i} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-24 h-24 bg-slate-200 border-[2px] border-black rounded-lg shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://picsum.photos/seed/appr${i}/200/200`} className="w-full h-full object-cover grayscale" alt="proposal" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge text={item.cat} color={item.cat === 'Academic' ? COLORS.teal : item.cat === 'Technical' ? COLORS.yellow : COLORS.pink} />
                <span className="text-[8px] font-black opacity-30 italic">SUBMITTED {item.time.toUpperCase()}</span>
              </div>
              <h4 className="text-lg font-black uppercase italic leading-none">{item.title}</h4>
              <p className="text-[10px] font-bold opacity-60 leading-tight line-clamp-2">{item.desc}</p>
            </div>
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
              <BrutalButton color="#4ADE80" className="flex-1 px-4 py-2">Approve</BrutalButton>
              <BrutalButton color="#F87171" className="flex-1 px-4 py-2">Reject</BrutalButton>
            </div>
          </BrutalCard>
        ))}
      </div>
    </div>
  );
}
