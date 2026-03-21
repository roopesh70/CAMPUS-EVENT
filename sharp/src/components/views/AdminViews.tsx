'use client';

import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, ShieldCheck, AlertCircle, Check, X } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useEvents } from '@/hooks/useEvents';
import { useAuthStore } from '@/stores/authStore';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useNotifications } from '@/hooks/useNotifications';
import { queryDocs, where } from '@/lib/firestore';
import { isTimeOverlapping } from '@/lib/utils';
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
                    <PendingRow key={evt.id} event={evt} allEvents={events} refresh={fetchAllEvents} />
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
          // Notify competing pending events
          const competingEvents = allEvents.filter(e => 
            e.status === 'pending' && e.id !== event.id && e.venueId === event.venueId && e.eventType !== 'ONLINE' &&
            isTimeOverlapping(event.startTime?.toMillis?.() || 0, event.endTime?.toMillis?.() || 0, e.startTime?.toMillis?.() || 0, e.endTime?.toMillis?.() || 0)
          );
          
          for (const comp of competingEvents) {
            await createNotification(
              comp.organizerId, 
              'Venue Allotted', 
              `The venue ${comp.venueName} for your proposed event "${comp.title}" has been allotted to another event. Please update your proposal to select a different venue or time.`,
              'system', 
              comp.id
            );
          }
        }
      }
      setActed(action);
      if (action === 'approved') refresh();
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

  // Helper to find conflicts
  const getConflicts = (evt: CampusEvent) => {
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

  const handleApprove = async (evt: CampusEvent) => {
    const comment = comments[evt.id] || '';
    
    try {
      await updateEventStatus(evt.id, 'approved', comment);
      
      if (profile) {
        await logActivity(profile.uid, profile.name, 'admin', 'approved_event', evt.id, 'event', evt.title);
        await createNotification(evt.organizerId, 'Event Approved!', `Your event "${evt.title}" has been approved.${comment ? ` Comment: ${comment}` : ''}`, 'approval', evt.id);
        
        // Notify competing pending events
        const { orange } = getConflicts(evt);
        if (orange.length > 0) {
          const competingEvents = allEvents.filter(e => 
            e.status === 'pending' && e.id !== evt.id && e.venueId === evt.venueId && e.eventType !== 'ONLINE' &&
            isTimeOverlapping(evt.startTime?.toMillis?.() || 0, evt.endTime?.toMillis?.() || 0, e.startTime?.toMillis?.() || 0, e.endTime?.toMillis?.() || 0)
          );
          
          for (const comp of competingEvents) {
            await createNotification(
              comp.organizerId, 
              'Venue Allotted', 
              `The venue ${comp.venueName} for your proposed event "${comp.title}" has been allotted to another event. Please update your proposal to select a different venue or time.`,
              'system', 
              comp.id
            );
          }
        }
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
            const conflicts = tab === 'pending' ? getConflicts(evt) : { red: [], orange: [] };
            return (
            <BrutalCard key={evt.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {evt.posterUrl ? (
                <div className="w-24 h-24 border-[2px] border-black rounded-lg shrink-0 overflow-hidden">
                  <img src={evt.posterUrl} alt={evt.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-slate-200 border-[2px] border-black rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                  <span className="font-black text-3xl opacity-10">{evt.category[0].toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 space-y-1 w-full">
                <div className="flex items-center gap-2">
                  <Badge text={evt.eventType || 'PHYSICAL'} color={evt.eventType === 'ONLINE' ? COLORS.lavender : COLORS.teal} />
                  <Badge text={evt.category} color={COLORS.teal} />
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
          )})
        )}
      </div>

      {/* Admin Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedEvent(null)}>
          <div className="bg-[#FFFBEB] border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out] flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="border-b-[2.5px] border-black p-5 flex justify-between items-start bg-slate-50 sticky top-0 z-10 shrink-0">
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge text={selectedEvent.eventType || 'PHYSICAL'} color={selectedEvent.eventType === 'ONLINE' ? COLORS.lavender : COLORS.teal} />
                  <Badge text={selectedEvent.category} color={COLORS.teal} />
                  <Badge text={selectedEvent.status} color={selectedEvent.status === 'approved' ? COLORS.green : selectedEvent.status === 'pending' ? COLORS.pink : COLORS.yellow} />
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
                  <span className="text-[8px] font-bold opacity-60 block">{selectedEvent.startTime?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }) || ''}</span>
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
              {(() => {
                if (selectedEvent.status !== 'pending') return null;
                const conflicts = getConflicts(selectedEvent);
                return (
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
                );
              })()}
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
                      disabled={getConflicts(selectedEvent).red.length > 0}>
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
      )}

    </div>
  );
}
