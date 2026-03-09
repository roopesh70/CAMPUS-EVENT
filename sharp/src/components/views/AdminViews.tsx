'use client';

import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, ShieldCheck, AlertCircle, Check, X } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useEvents } from '@/hooks/useEvents';
import { useAuthStore } from '@/stores/authStore';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useNotifications } from '@/hooks/useNotifications';
import { queryDocs, where } from '@/lib/firestore';
import type { CampusEvent, UserProfile } from '@/types';

export function AdminDashboard() {
  const { events, fetchAllEvents } = useEvents();
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    fetchAllEvents();
    // Get user count
    queryDocs<UserProfile>('users', []).then(users => setUserCount(users.length));
  }, [fetchAllEvents]);

  const activeEvents = events.filter(e => e.status === 'approved').length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;
  const conflictEvents = events.filter(e => e.conflictFlag).length;
  const pendingList = events.filter(e => e.status === 'pending').slice(0, 5);

  const stats = [
    { label: 'Total Users', value: String(userCount), color: COLORS.teal, icon: Users },
    { label: 'Active Events', value: String(activeEvents), color: COLORS.yellow, icon: LayoutDashboard },
    { label: 'Pending', value: String(pendingEvents), color: COLORS.pink, icon: ShieldCheck },
    { label: 'Conflicts', value: String(conflictEvents), color: COLORS.lavender, icon: AlertCircle },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
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

      {/* Pending Queue + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BrutalCard className="p-0 border-[2.5px]">
          <div className="p-3.5 border-b-[2.5px] border-black bg-black text-white flex justify-between items-center">
            <h3 className="text-[11px] font-black uppercase italic tracking-widest">Pending Queue</h3>
            {pendingEvents > 0 && <Badge text="Action Required" color={COLORS.pink} pulsing />}
          </div>
          <div className="overflow-x-auto p-2">
            {pendingList.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-[10px] font-black uppercase italic opacity-30">All clear — no pending events!</p>
              </div>
            ) : (
              <table className="w-full text-left font-bold">
                <thead>
                  <tr className="border-b-[2px] border-black text-[8px] uppercase opacity-40 italic tracking-widest">
                    <th className="p-2.5">Proposal Name</th>
                    <th className="p-2.5 text-center">Venue</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[10px]">
                  {pendingList.map((evt) => (
                    <PendingRow key={evt.id} event={evt} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </BrutalCard>

        {/* Category Breakdown */}
        <BrutalCard className="flex flex-col items-center justify-center p-6 gap-6 text-center bg-white border-[2.5px]">
          <h3 className="text-lg font-black uppercase italic underline decoration-2 underline-offset-4 tracking-tight">Stats Summary</h3>
          <div className="relative w-40 h-40 border-[5px] border-black rounded-full flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-slate-100 overflow-hidden group">
            <div className="absolute inset-0 border-[25px] border-teal-400" style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
            <div className="absolute inset-0 border-[25px] border-pink-400" style={{ clipPath: 'polygon(50% 50%, 0 0, 50% 0)' }}></div>
            <div className="z-10 bg-white border-[3px] border-black w-20 h-20 rounded-full flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-xl font-black leading-none italic">{events.length}</span>
              <span className="text-[6.5px] font-black uppercase opacity-40">Total</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {['Approved', 'Pending', 'Draft'].map((t, i) => (
              <div key={t} className="flex items-center gap-1.5 font-black text-[8px] uppercase tracking-tighter">
                <div className="w-2.5 h-2.5 border-[1.5px] border-black rounded-sm" style={{ backgroundColor: [COLORS.teal, COLORS.pink, COLORS.yellow][i] }}></div>
                {t} ({[activeEvents, pendingEvents, events.filter(e => e.status === 'draft').length][i]})
              </div>
            ))}
          </div>
        </BrutalCard>
      </div>
    </div>
  );
}

function PendingRow({ event }: { event: CampusEvent }) {
  const { updateEventStatus } = useEvents();
  const { logActivity } = useActivityLogs();
  const { profile } = useAuthStore();
  const { createNotification } = useNotifications(profile?.uid);
  const [acted, setActed] = useState<string | null>(null);

  const handleAction = async (action: 'approved' | 'rejected') => {
    await updateEventStatus(event.id, action, action === 'rejected' ? 'Rejected by admin' : '');
    if (profile) {
      await logActivity(profile.uid, profile.name, 'admin', `${action}_event`, event.id, 'event');
      await createNotification(event.organizerId, `Event ${action}`, `Your event "${event.title}" has been ${action}.`, 'approval', event.id);
    }
    setActed(action);
  };

  if (acted) {
    return (
      <tr className="border-b-[1px] border-black border-opacity-10">
        <td colSpan={3} className="p-2.5 text-center">
          <Badge text={acted === 'approved' ? '✓ Approved' : '✗ Rejected'} color={acted === 'approved' ? COLORS.green : COLORS.red} />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50 transition-colors">
      <td className="p-2.5 font-black uppercase truncate max-w-[120px]">{event.title}</td>
      <td className="p-2.5 text-center"><Badge text={event.venueName || 'TBD'} color="#fff" /></td>
      <td className="p-2.5 flex gap-1.5 justify-end">
        <button onClick={() => handleAction('approved')} className="w-7 h-7 bg-green-400 border-[2px] border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:shadow-none transition-all">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => handleAction('rejected')} className="w-7 h-7 bg-red-400 border-[2px] border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:shadow-none transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

export function AdminApprovals() {
  const { events, fetchEventsByStatus, updateEventStatus } = useEvents();
  const { logActivity } = useActivityLogs();
  const { profile } = useAuthStore();
  const { createNotification } = useNotifications(profile?.uid);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    if (tab === 'pending') fetchEventsByStatus('pending');
    else fetchEventsByStatus('approved');
  }, [tab, fetchEventsByStatus]);

  const handleApprove = async (evt: CampusEvent) => {
    await updateEventStatus(evt.id, 'approved');
    if (profile) {
      await logActivity(profile.uid, profile.name, 'admin', 'approved_event', evt.id, 'event');
      await createNotification(evt.organizerId, 'Event Approved!', `Your event "${evt.title}" has been approved.`, 'approval', evt.id);
    }
    fetchEventsByStatus('pending');
  };

  const handleReject = async (evt: CampusEvent) => {
    await updateEventStatus(evt.id, 'rejected', 'Rejected by admin');
    if (profile) {
      await logActivity(profile.uid, profile.name, 'admin', 'rejected_event', evt.id, 'event');
      await createNotification(evt.organizerId, 'Event Rejected', `Your event "${evt.title}" has been rejected.`, 'approval', evt.id);
    }
    fetchEventsByStatus('pending');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b-[3px] border-black pb-0">
        <button onClick={() => setTab('pending')} className={`px-6 py-2.5 font-black uppercase text-xs italic border-x-[2.5px] border-t-[2.5px] border-black rounded-t-xl -mb-[3px] z-10 ${tab === 'pending' ? 'bg-yellow-400' : 'bg-white opacity-40 hover:opacity-60'}`}>Pending</button>
        <button onClick={() => setTab('history')} className={`px-6 py-2.5 font-black uppercase text-xs italic border-x-[2.5px] border-t-[2.5px] border-black rounded-t-xl -mb-[3px] z-10 ${tab === 'history' ? 'bg-yellow-400' : 'bg-white opacity-40 hover:opacity-60'}`}>History</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {events.length === 0 ? (
          <BrutalCard className="p-8 text-center">
            <p className="text-[11px] font-black uppercase italic opacity-30">{tab === 'pending' ? 'No pending approvals — all clear!' : 'No history yet.'}</p>
          </BrutalCard>
        ) : (
          events.map((evt) => (
            <BrutalCard key={evt.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-24 h-24 bg-slate-200 border-[2px] border-black rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                <span className="font-black text-3xl opacity-10">{evt.category[0].toUpperCase()}</span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge text={evt.category} color={COLORS.teal} />
                  <span className="text-[8px] font-black opacity-30 italic">BY {evt.organizerName?.toUpperCase() || 'UNKNOWN'}</span>
                </div>
                <h4 className="text-lg font-black uppercase italic leading-none">{evt.title}</h4>
                <p className="text-[10px] font-bold opacity-60 leading-tight line-clamp-2">{evt.description || 'No description provided.'}</p>
              </div>
              {tab === 'pending' && (
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                  <BrutalButton color="#4ADE80" className="flex-1 px-4 py-2" onClick={() => handleApprove(evt)}>Approve</BrutalButton>
                  <BrutalButton color="#F87171" className="flex-1 px-4 py-2" onClick={() => handleReject(evt)}>Reject</BrutalButton>
                </div>
              )}
              {tab === 'history' && (
                <Badge text={evt.status} color={evt.status === 'approved' ? COLORS.green : COLORS.red} />
              )}
            </BrutalCard>
          ))
        )}
      </div>
    </div>
  );
}
