'use client';

import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, ShieldCheck, AlertCircle, Check, X, Activity, Shield, Zap, BarChart3, Clock, ArrowRight, Settings, Bell, MapPin } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useEvents } from '@/hooks/useEvents';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useNotifications } from '@/hooks/useNotifications';
import { useSettings } from '@/hooks/useSettings';
import { queryDocs, where } from '@/lib/firestore';
import { isTimeOverlapping } from '@/lib/utils';
import type { CampusEvent, UserProfile, ActivityLog } from '@/types';

const notifyCompetingEvents = async (
  event: CampusEvent,
  allEvents: CampusEvent[],
  createNotification: any
) => {
  if (event.eventType === 'ONLINE') return;
  const competingEvents = allEvents.filter(e =>
    e.status === 'pending' && e.id !== event.id && e.venueId === event.venueId && e.eventType !== 'ONLINE' &&
    isTimeOverlapping(event.startTime?.toMillis?.() || 0, event.endTime?.toMillis?.() || 0, e.startTime?.toMillis?.() || 0, e.endTime?.toMillis?.() || 0)
  );
  await Promise.all(competingEvents.map(comp =>
    createNotification(
      comp.organizerId,
      'Venue Allotted',
      `The venue ${comp.venueName} for your proposed event "${comp.title}" has been allotted to another event. Please update your proposal to select a different venue or time.`,
      'system',
      comp.id
    )
  ));
};

export const getConflicts = (evt: CampusEvent, allEvents: CampusEvent[]) => {
  if (evt.eventType === 'ONLINE') return { red: [], orange: [] };

  const eStart = evt.startTime?.toMillis?.() || 0;
  const eEnd = evt.endTime?.toMillis?.() || 0;

  const red: string[] = [];
  const orange: string[] = [];

  for (const other of allEvents) {
    if (other.id === evt.id) continue;
    if (other.eventType === 'ONLINE') continue;
    if (other.venueId !== evt.venueId) continue;

    const oStart = other.startTime?.toMillis?.() || 0;
    const oEnd = other.endTime?.toMillis?.() || 0;

    if (isTimeOverlapping(eStart, eEnd, oStart, oEnd)) {
      if (other.status === 'approved') red.push(other.title);
      else if (other.status === 'pending') orange.push(other.title);
    }
  }
  return { red, orange };
};

export function AdminDashboard() {
  const { events, fetchAllEvents } = useEvents();
  const { logs, fetchLogs } = useActivityLogs();
  const { settings } = useSettings();
  const { setActiveTab } = useUIStore();
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    fetchAllEvents();
    fetchLogs(15);
    queryDocs<UserProfile>('users', []).then(users => setUserCount(users.length));
  }, [fetchAllEvents, fetchLogs]);

  const activeEvents = events.filter(e => e.status === 'approved').length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;
  const conflictEvents = events.filter(e => e.conflictFlag).length;
  const pendingList = events.filter(e => e.status === 'pending').slice(0, 5);

  const successfulEvents = events.filter(e => e.outcomeStatus === 'success').length;
  const failedEvents = events.filter(e => e.outcomeStatus === 'failed').length;

  const stats = [
    { label: 'Total Users', value: String(userCount), color: COLORS.teal, icon: Users },
    { label: 'Active Events', value: String(activeEvents), color: COLORS.yellow, icon: LayoutDashboard },
    { label: 'Pending', value: String(pendingEvents), color: COLORS.pink, icon: ShieldCheck },
    { label: 'Conflicts', value: String(conflictEvents), color: COLORS.lavender, icon: AlertCircle },
  ];

  const quickActions = [
    { label: 'Venues', icon: MapPin, tab: 'venues', color: COLORS.teal },
    { label: 'Broadcast', icon: Bell, tab: 'system-notifications', color: COLORS.yellow },
    { label: 'Settings', icon: Settings, tab: 'settings', color: COLORS.pink },
    { label: 'Users', icon: Users, tab: 'users', color: COLORS.lavender },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Top Bar: Stat Cards */}
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

      {/* 2. System Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Health */}
        <BrutalCard className="p-5 border-b-[5px] space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4" />
            <h3 className="text-[11px] font-black uppercase italic tracking-widest">System Health</h3>
          </div>
          <div className="space-y-3">
            <HealthItem label="Database" status="Green" sub="Firestore Connected" />
            <HealthItem label="Authentication" status="Green" sub="Firebase Auth Live" />
            <HealthItem
              label="Environment"
              status={settings?.maintenanceMode ? 'Yellow' : 'Green'}
              sub={settings?.maintenanceMode ? 'Maintenance Mode ACTIVE' : 'Public Access Live'}
            />
          </div>
        </BrutalCard>

        {/* Quick Actions */}
        <BrutalCard className="p-5 border-b-[5px] lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4" />
            <h3 className="text-[11px] font-black uppercase italic tracking-widest">Quick Management</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.tab}
                onClick={() => setActiveTab(action.tab)}
                className="group flex flex-col items-center gap-3 p-4 border-[2px] border-black rounded-xl hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white active:translate-x-[2px] active:translate-y-[2px]"
                style={{ backgroundColor: action.color + '20' }}
              >
                <div className="bg-white border-[2px] border-black p-2 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black uppercase italic">{action.label}</span>
              </button>
            ))}
          </div>
        </BrutalCard>
      </div>

      {/* 3. Pending Queue & Stats Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BrutalCard className="p-0 border-[2.5px] flex flex-col h-full">
          <div className="p-3.5 border-b-[2.5px] border-black bg-black text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <h3 className="text-[11px] font-black uppercase italic tracking-widest">Pending Approvals</h3>
            </div>
            {pendingEvents > 0 && <Badge text={`${pendingEvents} Pending`} color={COLORS.pink} pulsing />}
          </div>
          <div className="overflow-x-auto p-2 flex-grow">
            {pendingList.length === 0 ? (
              <div className="p-8 text-center h-full flex flex-col justify-center items-center opacity-30">
                <ShieldCheck className="w-10 h-10 mb-2" />
                <p className="text-[10px] font-black uppercase italic">All event proposals reviewed!</p>
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
                    <PendingRow key={evt.id} event={evt} allEvents={events} refresh={fetchAllEvents} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {pendingEvents > 5 && (
            <div className="p-2.5 border-t-[2px] border-black bg-slate-50 text-center">
              <button onClick={() => setActiveTab('approvals')} className="text-[8px] font-black uppercase italic hover:underline flex items-center justify-center gap-1 mx-auto text-pink-600">
                View all {pendingEvents} pending proposals <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </BrutalCard>

        {/* Category Breakdown (Enhanced) */}
        <BrutalCard className="flex flex-col p-6 gap-6 bg-white border-[2.5px] border-b-[6px]">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase italic tracking-widest flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" /> Stats Visualization
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400 border border-black" />
                <span className="text-[8px] font-black uppercase opacity-40">{successfulEvents} OK</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400 border border-black" />
                <span className="text-[8px] font-black uppercase opacity-40">{failedEvents} FAIL</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 justify-center py-4">
            <div className="relative w-36 h-36 border-[5px] border-black rounded-full flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-slate-100 overflow-hidden group">
              {/* Approvals Ratio Chart */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: (() => {
                    const total = events.length || 1;
                    const approvedStop = (activeEvents / total) * 360;
                    const pendingStop = approvedStop + (pendingEvents / total) * 360;
                    const drafts = events.filter(e => e.status === 'draft').length;
                    const draftStop = pendingStop + (drafts / total) * 360;
                    return `conic-gradient(
                      ${COLORS.teal} 0deg ${approvedStop}deg,
                      ${COLORS.pink} ${approvedStop}deg ${pendingStop}deg,
                      ${COLORS.yellow} ${pendingStop}deg ${draftStop}deg,
                      #E2E8F0 ${draftStop}deg 360deg
                    )`;
                  })()
                }}
              />
              <div className="z-10 bg-white border-[3px] border-black w-16 h-16 rounded-full flex flex-col items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                <span className="text-lg font-black leading-none italic">{events.length}</span>
                <span className="text-[6px] font-black uppercase opacity-40">Total</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 flex-grow max-w-[200px]">
              <OutcomeStat label="Successful Events" count={successfulEvents} total={events.length} color={COLORS.green} />
              <OutcomeStat label="Failed / Cancelled" count={failedEvents} total={events.length} color={COLORS.red} />
              <div className="border-t-[1.5px] border-black border-dashed pt-2 mt-2 space-y-2">
                <div className="flex justify-between text-[10px] font-black italic">
                  <span>Approved Rate</span>
                  <span>{events.length > 0 ? Math.round((activeEvents / events.length) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 border border-black rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400" style={{ width: `${events.length > 0 ? (activeEvents / events.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {['Approved', 'Pending', 'Draft'].map((t, i) => (
              <div key={t} className="flex items-center gap-1.5 font-black text-[8px] uppercase tracking-tighter bg-slate-50 px-2 py-1 border-[1.5px] border-black rounded-lg">
                <div className="w-2 h-2 border-[1px] border-black rounded-sm" style={{ backgroundColor: [COLORS.teal, COLORS.pink, COLORS.yellow][i] }}></div>
                {t}: <span className="opacity-60">{[activeEvents, pendingEvents, events.filter(e => e.status === 'draft').length][i]}</span>
              </div>
            ))}
          </div>
        </BrutalCard>
      </div>

      {/* 4. Recent Activity Feed */}
      <BrutalCard className="p-0 border-[2.5px] border-b-[8px]">
        <div className="p-4 border-b-[2.5px] border-black bg-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase italic tracking-widest">Recent Activity Feed</h3>
          </div>
          <button onClick={() => setActiveTab('logs')} className="text-[8px] font-black uppercase italic hover:underline flex items-center gap-1 bg-slate-100 px-3 py-1.5 border-[2px] border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
            Full Audit Log <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
        <div className="max-h-[300px] overflow-y-auto bg-slate-50/50">
          {logs.length === 0 ? (
            <div className="p-10 text-center opacity-20"><p className="text-[10px] font-black uppercase italic">No recent activity detected</p></div>
          ) : (
            <div className="divide-y-[1px] divide-black divide-opacity-10">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-white transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 border-[2px] border-black rounded-full flex items-center justify-center bg-white font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                      {log.actorName?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div className="text-[11px] font-black uppercase italic">
                        <span className="text-pink-600">{log.actorName}</span>
                        <span className="mx-1.5 opacity-30">—</span>
                        <span>{log.action.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="text-[8px] font-bold opacity-40 mt-0.5">
                        {log.entityType.toUpperCase()}: <span className="text-black">{log.entityName || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-black opacity-30 uppercase italic">{log.createdAt?.toDate?.().toLocaleString() || 'just now'}</div>
                    <Badge text={log.role} color={log.role === 'admin' ? COLORS.lavender : COLORS.teal} className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BrutalCard>
    </div>
  );
}

function HealthItem({ label, status, sub }: { label: string, status: 'Green' | 'Yellow' | 'Red', sub: string }) {
  const colorMap = {
    Green: { bg: '#4ADE80', shadow: '#166534' },
    Yellow: { bg: '#FACC15', shadow: '#854d0e' },
    Red: { bg: '#F87171', shadow: '#991b1b' },
  };
  const { bg } = colorMap[status];

  return (
    <div className="flex items-center gap-3 p-3 bg-white border-[2px] border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <div className="relative">
        <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-black shadow-inner" style={{ backgroundColor: bg }} />
        <div className={`absolute inset-0 rounded-full animate-ping opacity-20`} style={{ backgroundColor: bg }} />
      </div>
      <div className="flex-1">
        <div className="text-[9px] font-black uppercase tracking-tight">{label}</div>
        <div className="text-[7px] font-bold opacity-40 leading-none mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function OutcomeStat({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[8px] font-black uppercase italic">
        <span className="opacity-60">{label}</span>
        <span>{count} ({pct}%)</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 border-[1px] border-black rounded-full overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function PendingRow({ event, allEvents, refresh }: { event: CampusEvent, allEvents: CampusEvent[], refresh: () => void }) {
  const { updateEventStatus } = useEvents();
  const { logActivity } = useActivityLogs();
  const { profile } = useAuthStore();
  const { createNotification } = useNotifications(profile?.uid);
  const [acted, setActed] = useState<string | null>(null);

  const handleAction = async (action: 'approved' | 'rejected') => {
    try {
      await updateEventStatus(event.id, action, action === 'rejected' ? 'Rejected by admin' : '');
      if (profile) {
        await logActivity(profile.uid, profile.name, 'admin', `${action}_event`, event.id, 'event', event.title);
        await createNotification(event.organizerId, `Event ${action}`, `Your event "${event.title}" has been ${action}.`, 'approval', event.id);

        if (action === 'approved') {
          await notifyCompetingEvents(event, allEvents, createNotification);
        }
      }
      setActed(action);
      refresh();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
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

  const conflicts = getConflicts(event, allEvents);
  const hasRed = conflicts.red.length > 0;
  const hasOrange = conflicts.orange.length > 0;

  return (
    <tr className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50 transition-colors">
      <td className="p-2.5 font-black uppercase truncate max-w-[120px]">
        {event.title}
        {hasRed ? (
          <span className="ml-1 text-red-600 text-xs" title={`Cannot approve: Venue is already allotted to ${conflicts.red.join(', ')}`}>❌</span>
        ) : hasOrange ? (
          <span className="ml-1 text-orange-500 text-xs" title={`Warning: Event also requested by ${conflicts.orange.join(', ')}`}>⚠️</span>
        ) : null}
      </td>
      <td className="p-2.5 text-center"><Badge text={event.venueName || 'TBD'} color="#fff" /></td>
      <td className="p-2.5 flex gap-1.5 justify-end">
        <button
          onClick={() => handleAction('approved')}
          disabled={hasRed}
          title={hasRed ? "Blocked: conflicts with an approved event" : "Approve"}
          className={`w-7 h-7 ${hasRed ? 'bg-slate-200 cursor-not-allowed opacity-50' : 'bg-green-400 hover:shadow-none'} border-[2px] border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-all`}
        >
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
  const { events: allEvents, fetchAllEvents, updateEventStatus } = useEvents();
  const { logActivity } = useActivityLogs();
  const { profile } = useAuthStore();
  const { createNotification } = useNotifications(profile?.uid);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [comments, setComments] = useState<Record<string, string>>({});
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  // Derive display events based on tab
  const displayEvents = allEvents.filter(e => tab === 'pending' ? e.status === 'pending' : e.status !== 'pending' && e.status !== 'draft');

  const handleApprove = async (evt: CampusEvent) => {
    const comment = comments[evt.id] || '';

    try {
      const { red } = getConflicts(evt, allEvents);
      if (red.length > 0) {
        alert('Cannot approve: venue is already allotted to another event.');
        return;
      }
      await updateEventStatus(evt.id, 'approved', comment);

      if (profile) {
        await logActivity(profile.uid, profile.name, 'admin', 'approved_event', evt.id, 'event', evt.title);
        await createNotification(evt.organizerId, 'Event Approved!', `Your event "${evt.title}" has been approved.${comment ? ` Comment: ${comment}` : ''}`, 'approval', evt.id);

        // Notify competing pending events
        await notifyCompetingEvents(evt, allEvents, createNotification);
      }
      fetchAllEvents();
    } catch (err: any) {
      alert(err.message || 'Error approving event');
    }
  };

  const handleReject = async (evt: CampusEvent) => {
    const comment = comments[evt.id] || 'No reason provided';
    await updateEventStatus(evt.id, 'rejected', comment);
    if (profile) {
      await logActivity(profile.uid, profile.name, 'admin', 'rejected_event', evt.id, 'event', evt.title);
      await createNotification(evt.organizerId, 'Event Rejected', `Your event "${evt.title}" was rejected. Reason: ${comment}`, 'approval', evt.id);
    }
    fetchAllEvents();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b-[3px] border-black pb-0">
        <button onClick={() => setTab('pending')} className={`px-6 py-2.5 font-black uppercase text-xs italic border-x-[2.5px] border-t-[2.5px] border-black rounded-t-xl -mb-[3px] z-10 ${tab === 'pending' ? 'bg-yellow-400' : 'bg-white opacity-40 hover:opacity-60'}`}>Pending</button>
        <button onClick={() => setTab('history')} className={`px-6 py-2.5 font-black uppercase text-xs italic border-x-[2.5px] border-t-[2.5px] border-black rounded-t-xl -mb-[3px] z-10 ${tab === 'history' ? 'bg-yellow-400' : 'bg-white opacity-40 hover:opacity-60'}`}>History</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayEvents.length === 0 ? (
          <BrutalCard className="p-8 text-center">
            <p className="text-[11px] font-black uppercase italic opacity-30">{tab === 'pending' ? 'No pending approvals — all clear!' : 'No history yet.'}</p>
          </BrutalCard>
        ) : (
          displayEvents.map((evt) => {
            const conflicts = tab === 'pending' ? getConflicts(evt, allEvents) : { red: [], orange: [] };
            return (
              <BrutalCard key={evt.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {evt.posterUrl ? (
                  <div className="w-24 h-24 border-[2px] border-black rounded-lg shrink-0 overflow-hidden">
                    <img src={evt.posterUrl} alt={evt.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-slate-200 border-[2px] border-black rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                    <span className="font-black text-3xl opacity-10">{(evt.category?.[0] || '?').toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 space-y-1 w-full">
                  <div className="flex items-center gap-2">
                    <Badge text={evt.eventType || 'PHYSICAL'} color={evt.eventType === 'ONLINE' ? COLORS.lavender : COLORS.teal} />
                    <Badge text={evt.category} color={COLORS.teal} />
                    {evt.archived && <Badge text="Archived" color={COLORS.lavender} />}
                    <span className="text-[8px] font-black opacity-30 italic">BY {evt.organizerName?.toUpperCase() || 'UNKNOWN'}</span>
                  </div>
                  <h4 className="text-lg font-black uppercase italic leading-none">{evt.title}</h4>
                  <p className="text-[10px] font-bold opacity-60 leading-tight line-clamp-2">{evt.description || 'No description provided.'}</p>

                  {tab === 'pending' && conflicts.red.length > 0 && (
                    <p className="text-[10px] font-bold bg-red-100 border-[1.5px] border-red-500 text-red-700 px-2 py-1 rounded-lg mt-1 italic inline-block w-full">
                      ❌ This venue is already allotted to: {conflicts.red.join(', ')}
                    </p>
                  )}
                  {tab === 'pending' && conflicts.red.length === 0 && conflicts.orange.length > 0 && (
                    <p className="text-[10px] font-bold bg-orange-100 border-[1.5px] border-orange-500 text-orange-700 px-2 py-1 rounded-lg mt-1 italic inline-block w-full">
                      ⚠️ This venue is also requested by: {conflicts.orange.join(', ')}
                    </p>
                  )}

                  {evt.approvalComment && tab === 'history' && (
                    <p className="text-[9px] font-bold opacity-50 italic bg-yellow-50 border-[1.5px] border-yellow-400 rounded-lg px-2 py-1 mt-1 block">💬 {evt.approvalComment}</p>
                  )}
                  <div className="mt-2">
                    <BrutalButton color="white" className="text-[9px] px-4 py-1.5" onClick={() => setSelectedEvent(evt)}>
                      {tab === 'pending' ? 'Review & take Action' : 'View full details'}
                    </BrutalButton>
                  </div>
                </div>
                {tab === 'history' && (
                  <Badge text={evt.status} color={evt.status === 'approved' ? COLORS.green : COLORS.red} />
                )}
              </BrutalCard>
            )
          })
        )}
      </div>

      {/* Admin Event Details Modal */}
      {selectedEvent && (() => {
        const conflicts = getConflicts(selectedEvent, allEvents);
        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedEvent(null)}>
            <div className="bg-[#FFFBEB] border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out] flex flex-col" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="border-b-[2.5px] border-black p-5 flex justify-between items-start bg-slate-50 sticky top-0 z-10 shrink-0">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge text={selectedEvent.eventType || 'PHYSICAL'} color={selectedEvent.eventType === 'ONLINE' ? COLORS.lavender : COLORS.teal} />
                    <Badge text={selectedEvent.category} color={COLORS.teal} />
                    <Badge text={selectedEvent.status} color={selectedEvent.status === 'approved' ? COLORS.green : selectedEvent.status === 'pending' ? COLORS.pink : COLORS.yellow} />
                    {selectedEvent.archived && <Badge text="Archived" color={COLORS.lavender} />}
                    <Badge text={selectedEvent.department || 'General'} color={COLORS.lavender} />
                  </div>
                  <h3 className="text-xl font-black uppercase italic">{selectedEvent.title}</h3>
                  <p className="text-[10px] font-bold opacity-50 italic">Submitted by {selectedEvent.organizerName}</p>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="w-8 h-8 shrink-0 border-[2px] border-black rounded-lg bg-white flex items-center justify-center hover:bg-red-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-5 space-y-6 overflow-y-auto">

                {/* Poster */}
                {selectedEvent.posterUrl && (
                  <div className="rounded-xl border-[2.5px] border-black overflow-hidden bg-black flex justify-center max-h-48">
                    <img src={selectedEvent.posterUrl} alt="Event Poster" className="object-contain h-full w-auto" />
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Description</h4>
                  <p className="text-[11px] font-bold leading-relaxed">{selectedEvent.description || 'No description provided.'}</p>
                </div>

                {/* Core Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white border-[2px] border-black rounded-xl p-3">
                    <span className="text-[7px] font-black uppercase opacity-40 block">Date & Time</span>
                    <span className="text-[10px] font-black block">{selectedEvent.startTime?.toDate?.().toLocaleDateString() || 'N/A'}</span>
                    <span className="text-[8px] font-bold opacity-60 block">{selectedEvent.startTime?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}</span>
                  </div>
                  <div className="bg-white border-[2px] border-black rounded-xl p-3">
                    <span className="text-[7px] font-black uppercase opacity-40 block">Venue</span>
                    <span className="text-[10px] font-black block truncate">{selectedEvent.venueName || 'TBD'}</span>
                  </div>
                  <div className="bg-white border-[2px] border-black rounded-xl p-3">
                    <span className="text-[7px] font-black uppercase opacity-40 block">Capacity</span>
                    <span className="text-[10px] font-black block">{selectedEvent.capacity} attendees</span>
                  </div>
                  <div className="bg-white border-[2px] border-black rounded-xl p-3">
                    <span className="text-[7px] font-black uppercase opacity-40 block">Organizer Email</span>
                    <span className="text-[9px] font-black block truncate">{selectedEvent.contactEmail || 'N/A'}</span>
                  </div>
                  <div className="bg-white border-[2px] border-black rounded-xl p-3">
                    <span className="text-[7px] font-black uppercase opacity-40 block">Organizer Phone</span>
                    <span className="text-[9px] font-black block truncate">{selectedEvent.contactPhone || 'N/A'}</span>
                  </div>
                  <div className="bg-white border-[2px] border-black rounded-xl p-3">
                    <span className="text-[7px] font-black uppercase opacity-40 block">Budget Request</span>
                    <span className="text-[9px] font-black block truncate">{selectedEvent.budget || 'None specified'}</span>
                  </div>
                </div>

                {/* Advanced Targeting Details */}
                <div className="bg-slate-100 border-[2px] border-black rounded-xl p-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Planning & Targeting</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-[9px] font-bold">
                    <div><span className="opacity-40 uppercase block text-[7px]">Target Audience</span>{selectedEvent.targetAudience || 'General'}</div>
                    <div><span className="opacity-40 uppercase block text-[7px]">Expected Attendance</span>{selectedEvent.expectedAttendance || selectedEvent.capacity || 'Not set'}</div>
                    <div><span className="opacity-40 uppercase block text-[7px]">Co-Organizers</span>{selectedEvent.coOrganizers || 'None'}</div>
                    <div><span className="opacity-40 uppercase block text-[7px]">Registration Deadline</span>{selectedEvent.registrationDeadline?.toDate?.().toLocaleDateString() || 'N/A'}</div>
                  </div>
                </div>

                {/* Resources */}
                {selectedEvent.resources && selectedEvent.resources.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Required Resources</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.resources.map((r, i) => <Badge key={i} text={r} color="white" />)}
                    </div>
                  </div>
                )}

                {/* Conflict Warnings in Modal */}
                {selectedEvent.status === 'pending' && (
                  <div className="space-y-2">
                    {conflicts.red.length > 0 && (
                      <div className="border-[2px] border-red-500 bg-red-100 p-3 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-[11px] font-black uppercase text-red-700 italic">❌ This venue is already allotted to:</p>
                        <p className="text-[10px] font-bold text-red-800">{conflicts.red.join(', ')}</p>
                        <p className="text-[9px] font-bold opacity-60 mt-1">Approval is blocked until the conflict is resolved.</p>
                      </div>
                    )}
                    {conflicts.red.length === 0 && conflicts.orange.length > 0 && (
                      <div className="border-[2px] border-orange-500 bg-orange-100 p-3 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-[11px] font-black uppercase text-orange-700 italic">⚠️ This venue is also requested by:</p>
                        <p className="text-[10px] font-bold text-orange-800">{conflicts.orange.join(', ')}</p>
                        <p className="text-[9px] font-bold opacity-60 mt-1">Only one event can be approved for this venue/time.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer / Actions - Only show action buttons if status is pending */}
              <div className="p-5 border-t-[2.5px] border-black bg-white sticky bottom-0 z-10 shrink-0">
                {selectedEvent.status === 'pending' ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <BrutalInput
                      type="text"
                      placeholder="Add approval comment / reason..."
                      value={comments[selectedEvent.id] || ''}
                      onChange={e => setComments(prev => ({ ...prev, [selectedEvent.id]: e.target.value }))}
                      className="flex-1 text-[10px]"
                    />
                    <div className="flex gap-2 shrink-0">
                      <BrutalButton color="#4ADE80" className="px-5 py-2 text-xs opacity-90 disabled:opacity-40 disabled:pointer-events-none"
                        onClick={() => { handleApprove(selectedEvent); setSelectedEvent(null); }}
                        disabled={conflicts.red.length > 0}>
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </BrutalButton>
                      <BrutalButton color="#F87171" className="px-5 py-2 text-xs" onClick={() => { handleReject(selectedEvent); setSelectedEvent(null); }}>
                        <X className="w-4 h-4 mr-1" /> Reject
                      </BrutalButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="opacity-50 uppercase italic">Current Status: {selectedEvent.status}</span>
                    {selectedEvent.approvalComment && (
                      <span className="opacity-80">💬 {selectedEvent.approvalComment}</span>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
