'use client';

import React, { useEffect, useState } from 'react';
import { PlusCircle, ChevronRight, MoreVertical } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useEvents } from '@/hooks/useEvents';
import { useVenues } from '@/hooks/useVenues';
import { useTasks } from '@/hooks/useTasks';
import { useUIStore } from '@/stores/uiStore';
import type { CampusEvent, EventCategory } from '@/types';
import { Timestamp } from 'firebase/firestore';

export function OrganizerDashboard() {
  const { profile } = useAuthStore();
  const { events, fetchOrganizerEvents } = useEvents();
  const { setActiveTab } = useUIStore();

  useEffect(() => {
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
  }, [profile?.uid, fetchOrganizerEvents]);

  const active = events.filter(e => e.status === 'approved').length;
  const drafts = events.filter(e => e.status === 'draft').length;
  const completed = events.filter(e => e.status === 'completed').length;
  const pending = events.filter(e => e.status === 'pending' || e.status === 'revision').length;

  const statusCards = [
    { status: 'Active', num: String(active).padStart(2, '0'), color: COLORS.teal },
    { status: 'Drafts', num: String(drafts).padStart(2, '0'), color: COLORS.yellow },
    { status: 'Completed', num: String(completed).padStart(2, '0'), color: COLORS.lavender },
    { status: 'Review', num: String(pending).padStart(2, '0'), color: COLORS.pink },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none underline decoration-[4px] decoration-yellow-400 underline-offset-4">
          Event Center
        </h2>
        <BrutalButton color={COLORS.yellow} className="px-6 py-2 text-[10px]" onClick={() => setActiveTab('create')}>
          <PlusCircle className="w-4 h-4" /> New Proposal
        </BrutalButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {statusCards.map((card, i) => (
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

          {/* Performance */}
          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase italic flex items-center gap-2">Performance Flow</h3>
            <BrutalCard className="h-40 flex items-end justify-between p-6 gap-2 border-[2.5px] bg-white">
              {events.slice(0, 9).map((e, i) => {
                const pct = e.registeredCount > 0 ? Math.min(Math.round((e.registeredCount / Math.max(e.capacity, 1)) * 100), 100) : (10 + i * 10);
                return (
                  <div key={i} className="flex-1 bg-black border-[1.5px] border-white group relative hover:bg-yellow-400 transition-all rounded-t-lg" style={{ height: `${pct}%` }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded text-[7px] opacity-0 group-hover:opacity-100 transition-opacity font-bold border border-white">
                      {pct}%
                    </div>
                  </div>
                );
              })}
              {events.length === 0 && Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex-1 bg-slate-200 border-[1.5px] border-slate-300 rounded-t-lg" style={{ height: '20%' }} />
              ))}
            </BrutalCard>
          </div>
        </div>

        {/* Recent Events */}
        <div className="space-y-5">
          <h3 className="text-lg font-black uppercase italic">Recent Events</h3>
          <div className="space-y-3">
            {events.length === 0 ? (
              <BrutalCard className="p-4 text-center">
                <p className="text-[10px] font-black uppercase italic opacity-30">No events yet. Create your first!</p>
              </BrutalCard>
            ) : (
              events.slice(0, 3).map((evt, i) => (
                <BrutalCard key={evt.id} className="border-l-[10px] border-l-black hover:translate-x-1 transition-all p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-[7.5px] font-black uppercase opacity-30 italic">{evt.category}</span>
                    <Badge text={evt.status} color={evt.status === 'approved' ? COLORS.green : evt.status === 'pending' ? COLORS.yellow : '#fff'} />
                  </div>
                  <h4 className="font-black uppercase text-[12px] italic tracking-tight leading-tight">{evt.title}</h4>
                  <p className="text-[8px] font-bold opacity-40 mt-1">{evt.registeredCount}/{evt.capacity} registered</p>
                </BrutalCard>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateEventFlow() {
  const { profile } = useAuthStore();
  const { events: allEvents, createEvent, fetchPublicEvents } = useEvents();
  const { venues, fetchVenues } = useVenues();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('technical');
  const [description, setDescription] = useState('');
  const [venueId, setVenueId] = useState('');
  const [venueName, setVenueName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [resources, setResources] = useState<string[]>([]);

  useEffect(() => { fetchVenues(); fetchPublicEvents(); }, [fetchVenues, fetchPublicEvents]);

  const toggleResource = (res: string) => {
    setResources(prev => prev.includes(res) ? prev.filter(r => r !== res) : [...prev, res]);
  };

  // Check for venue/time conflicts
  const checkConflicts = () => {
    if (!venueId || !date || !startTime || !endTime) return null;
    const newStart = new Date(`${date}T${startTime}`).getTime();
    const newEnd = new Date(`${date}T${endTime}`).getTime();

    for (const evt of allEvents) {
      if (evt.venueId !== venueId) continue;
      if (evt.status === 'rejected' || evt.status === 'draft') continue;
      const eStart = evt.startTime?.toDate?.().getTime() || 0;
      const eEnd = evt.endTime?.toDate?.().getTime() || 0;
      // Check overlap
      if (newStart < eEnd && newEnd > eStart) {
        return `Conflicts with "${evt.title}" at the same venue`;
      }
    }
    return null;
  };

  // Run conflict check when venue/time step is completed
  useEffect(() => {
    if (step === 3 && venueId && date) {
      setConflict(checkConflicts());
    }
  }, [step]);

  const handleSubmit = async () => {
    if (!profile) return;
    setSubmitting(true);

    const startTs = Timestamp.fromDate(new Date(`${date}T${startTime || '09:00'}`));
    const endTs = Timestamp.fromDate(new Date(`${date}T${endTime || '17:00'}`));

    await createEvent({
      title,
      description,
      category,
      organizerId: profile.uid,
      organizerName: profile.name || profile.email,
      venueId,
      venueName,
      department: profile.department || '',
      startTime: startTs,
      endTime: endTs,
      capacity: parseInt(capacity) || 100,
      status: 'pending',
      outcomeStatus: null,
      eligibility: { departments: [], years: [] },
      resources,
      posterUrl: '',
      approvalComment: '',
    });

    setSubmitting(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-24 h-24 border-[4px] border-black rounded-2xl bg-green-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mx-auto flex items-center justify-center">
          <span className="text-4xl">✓</span>
        </div>
        <h2 className="text-2xl font-black uppercase italic">Event Submitted!</h2>
        <p className="text-[11px] font-bold opacity-60">Your event has been submitted for admin approval.</p>
        <BrutalButton color={COLORS.yellow} onClick={() => { setSuccess(false); setStep(1); setTitle(''); setDescription(''); }}>
          Create Another
        </BrutalButton>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      {/* Step Indicator */}
      <div className="flex justify-between relative px-2">
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-black -translate-y-1/2 z-0"></div>
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} onClick={() => setStep(s)}
            className={`relative z-10 w-10 h-10 border-[3px] border-black flex items-center justify-center font-black text-md cursor-pointer transition-all rounded-2xl ${step >= s ? 'bg-yellow-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}`}
          >{s}</div>
        ))}
      </div>

      <BrutalCard className="p-6 md:p-8 space-y-5 border-b-[8px] border-b-black">
        <h2 className="text-2xl font-black uppercase italic leading-none">
          {['Event Details', 'Venue & Time', 'Resources', 'Description', 'Review & Submit'][step - 1]}
        </h2>

        {step === 1 && (
          <div className="grid grid-cols-1 gap-5 mt-2">
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Title</label>
              <BrutalInput placeholder="e.g. Winter Code Sprint" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as EventCategory)}
                className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
                <option value="technical">Technical Workshop</option>
                <option value="cultural">Cultural Festival</option>
                <option value="sports">Sports Tournament</option>
                <option value="academic">Academic Seminar</option>
                <option value="competition">Competition</option>
                <option value="social">Social Event</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-5 mt-2">
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Venue</label>
              <select value={venueId} onChange={e => { setVenueId(e.target.value); setVenueName(venues.find(v => v.id === e.target.value)?.name || ''); }}
                className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
                <option value="">Select Venue...</option>
                {venues.map(v => <option key={v.id} value={v.id}>{v.name} (cap: {v.capacity})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Date</label>
                <BrutalInput type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Capacity</label>
                <BrutalInput placeholder="e.g. 200" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Start Time</label>
                <BrutalInput type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">End Time</label>
                <BrutalInput type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-4 mt-2">
            <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Resources Needed</label>
            {['AV Equipment', 'Catering', 'Extra Seating', 'Stage Setup', 'Whiteboard', 'Projector'].map((res) => (
              <label key={res} className="flex items-center gap-3 p-2.5 border-[2px] border-black rounded-xl hover:bg-yellow-50 cursor-pointer transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-yellow-400" checked={resources.includes(res)} onChange={() => toggleResource(res)} />
                <span className="font-black uppercase text-[10px]">{res}</span>
              </label>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-1.5 mt-2">
            <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Full Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-32 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none"
              placeholder="Describe your event in detail..." />
          </div>
        )}

        {step === 5 && (
          <div className="mt-2 space-y-4">
            {conflict && (
              <div className="border-[2.5px] border-red-600 rounded-xl p-4 bg-red-50">
                <p className="text-[10px] font-black uppercase italic text-red-700">⚠ Scheduling Conflict: {conflict}</p>
                <p className="text-[8px] font-bold opacity-50 mt-1">You can still submit, but the admin may reject due to this conflict.</p>
              </div>
            )}
            <div className="border-[2.5px] border-black rounded-xl p-4 bg-yellow-50">
              <p className="text-[10px] font-black uppercase italic text-center">Review your event details before submitting</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Title', v: title || '—' },
                { l: 'Category', v: category },
                { l: 'Venue', v: venueName || '—' },
                { l: 'Date', v: date || '—' },
                { l: 'Capacity', v: capacity || '—' },
                { l: 'Resources', v: resources.join(', ') || 'None' },
              ].map((item) => (
                <div key={item.l} className="border-[2px] border-black rounded-lg p-2.5">
                  <span className="text-[7px] font-black uppercase opacity-30 italic">{item.l}</span>
                  <p className="text-[11px] font-black uppercase">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-6">
          <button onClick={() => step > 1 && setStep(step - 1)}
            className={`font-black uppercase italic underline decoration-2 underline-offset-2 text-[10px] opacity-40 hover:opacity-100 ${step === 1 ? 'invisible' : ''}`}>
            &larr; Previous
          </button>
          {step === 5 ? (
            <BrutalButton className="px-8" color={COLORS.green} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Event'}
            </BrutalButton>
          ) : (
            <BrutalButton className="px-8" onClick={() => setStep(step + 1)}>Continue</BrutalButton>
          )}
        </div>
      </BrutalCard>
    </div>
  );
}
