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
import { useCloudinary } from '@/hooks/useCloudinary';
import { useActivityLogs } from '@/hooks/useActivityLogs';
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
  const { uploadImage, uploading, progress: uploadProgress } = useCloudinary();
  const { logActivity } = useActivityLogs();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);

  // Form state — PRD 5.2.1 complete
  const [eventType, setEventType] = useState<'PHYSICAL' | 'ONLINE'>('PHYSICAL');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('technical');
  const [department, setDepartment] = useState(profile?.department || '');
  const [targetAudience, setTargetAudience] = useState('');
  const [expectedAttendance, setExpectedAttendance] = useState('');
  const [venueId, setVenueId] = useState('');
  const [venueName, setVenueName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [regDeadline, setRegDeadline] = useState('');
  const [resources, setResources] = useState<string[]>([]);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [description, setDescription] = useState('');
  const [coOrganizers, setCoOrganizers] = useState('');
  const [contactEmail, setContactEmail] = useState(profile?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [eligDepts, setEligDepts] = useState<string[]>([]);
  const [eligYears, setEligYears] = useState<number[]>([]);

  useEffect(() => { fetchVenues(); fetchPublicEvents(); }, [fetchVenues, fetchPublicEvents]);

  const toggleResource = (res: string) => {
    setResources(prev => prev.includes(res) ? prev.filter(r => r !== res) : [...prev, res]);
  };

  const handlePosterSelect = (file: File) => {
    setPosterFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPosterPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Conflict detection + suggested alternatives
  const checkConflicts = () => {
    if (eventType === 'ONLINE') return null; // ONLINE events bypass conflict checks
    if (!venueId || !date || !startTime || !endTime) return null;
    const newStart = new Date(`${date}T${startTime}`).getTime();
    const newEnd = new Date(`${date}T${endTime}`).getTime();

    let conflictMsg: string | null = null;
    const busyVenueIds = new Set<string>();

    for (const evt of allEvents) {
      if (evt.status === 'rejected' || evt.status === 'draft') continue;
      const eStart = evt.startTime?.toDate?.().getTime() || 0;
      const eEnd = evt.endTime?.toDate?.().getTime() || 0;
      if (newStart < eEnd && newEnd > eStart) {
        if (evt.venueId) {
          busyVenueIds.add(evt.venueId);
          if (evt.venueId === venueId) {
            conflictMsg = `Conflicts with "${evt.title}" at the same venue`;
          }
        }
      }
    }

    // Suggest available venues
    const available = venues
      .filter(v => v.isActive && !busyVenueIds.has(v.id) && v.id !== venueId)
      .map(v => v.name)
      .slice(0, 3);
    setAlternatives(available);
    return conflictMsg;
  };

  useEffect(() => {
    if (step === 5 && venueId && date) {
      setConflict(checkConflicts());
    }
  }, [step]);

  const handleSubmit = async () => {
    if (!profile) return;
    setSubmitError(null);
    setSubmitting(true);

    // Upload poster to Cloudinary if selected
    let posterUrl = '';
    if (posterFile) {
      try {
        posterUrl = await uploadImage(posterFile);
      } catch {
        posterUrl = posterPreview; // fallback to base64
      }
    }

    const startTs = Timestamp.fromDate(new Date(`${date}T${startTime || '09:00'}`));
    const endTs = Timestamp.fromDate(new Date(`${date}T${endTime || '17:00'}`));

    try {
      const newEventId = await createEvent({
        title,
        description,
        category,
        eventType,
        organizerId: profile.uid,
        organizerName: profile.name || profile.email,
        venueId: eventType === 'ONLINE' ? '' : venueId,
        venueName: eventType === 'ONLINE' ? 'Online' : venueName,
        department,
        startTime: startTs,
        endTime: endTs,
        capacity: parseInt(capacity) || 100,
        status: 'pending',
        outcomeStatus: null,
        eligibility: { departments: eligDepts, years: eligYears },
        resources,
        posterUrl,
        approvalComment: '',
        // PRD 5.2.1 new fields
        targetAudience,
        expectedAttendance: parseInt(expectedAttendance) || 0,
        coOrganizers,
        contactEmail,
        contactPhone,
        budget,
        ...(regDeadline ? { registrationDeadline: Timestamp.fromDate(new Date(`${regDeadline}T23:59`)) } : {}),
      });

      await logActivity(profile.uid, profile.name || profile.email, 'organizer', 'create_event', newEventId, 'event', title);

      setSubmitting(false);
      setSuccess(true);
      setSubmitError(null);
    } catch (error: any) {
      setSubmitting(false);
      if (error.message === "Venue already booked for this time slot") {
        setSubmitError("❌ This venue is already booked for the selected time.");
      } else {
        setSubmitError(error.message || "Failed to create event");
      }
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-24 h-24 border-[4px] border-black rounded-2xl bg-green-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mx-auto flex items-center justify-center">
          <span className="text-4xl">✓</span>
        </div>
        <h2 className="text-2xl font-black uppercase italic">Event Submitted!</h2>
        <p className="text-[11px] font-bold opacity-60">Your event has been submitted for admin approval.</p>
        <BrutalButton color={COLORS.yellow} onClick={() => { setSuccess(false); setStep(1); setTitle(''); setDescription(''); setPosterFile(null); setPosterPreview(''); setEventType('PHYSICAL'); setSubmitError(null); }}>
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
          {['Event Details', 'Venue & Time', 'Resources & Media', 'Description & Contact', 'Review & Submit'][step - 1]}
        </h2>

        {/* Step 1: Event Details */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-5 mt-2">
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Title</label>
              <BrutalInput placeholder="e.g. Winter Code Sprint" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Event Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="PHYSICAL" checked={eventType === 'PHYSICAL'} onChange={() => setEventType('PHYSICAL')} className="accent-yellow-400 w-4 h-4" />
                  <span className="font-black text-sm">PHYSICAL</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="ONLINE" checked={eventType === 'ONLINE'} onChange={() => { setEventType('ONLINE'); setVenueId(''); setVenueName(''); }} className="accent-yellow-400 w-4 h-4" />
                  <span className="font-black text-sm">ONLINE</span>
                </label>
              </div>
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
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Department / Club Affiliation</label>
              <BrutalInput placeholder="e.g. Computer Science Dept" value={department} onChange={e => setDepartment(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Target Audience</label>
                <BrutalInput placeholder="e.g. All Students" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Expected Attendance</label>
                <BrutalInput type="number" placeholder="e.g. 150" value={expectedAttendance} onChange={e => setExpectedAttendance(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Venue & Time */}
        {step === 2 && (
          <div className="grid grid-cols-1 gap-5 mt-2">
            <div className={`space-y-1.5 ${eventType === 'ONLINE' ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Venue {eventType === 'ONLINE' && '(Not required)'}</label>
              <select value={venueId} onChange={e => { setVenueId(e.target.value); setVenueName(venues.find(v => v.id === e.target.value)?.name || ''); }}
                disabled={eventType === 'ONLINE'}
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
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Registration Deadline</label>
              <BrutalInput type="date" value={regDeadline} onChange={e => setRegDeadline(e.target.value)} />
              <p className="text-[8px] font-bold opacity-30 italic">Leave empty for no deadline</p>
            </div>
          </div>
        )}

        {/* Step 3: Resources & Media */}
        {step === 3 && (
          <div className="grid grid-cols-1 gap-5 mt-2">
            <div>
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Resources Needed</label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {['AV Equipment', 'Catering', 'Extra Seating', 'Stage Setup', 'Whiteboard', 'Projector'].map((res) => (
                  <label key={res} className="flex items-center gap-3 p-2.5 border-[2px] border-black rounded-xl hover:bg-yellow-50 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 accent-yellow-400" checked={resources.includes(res)} onChange={() => toggleResource(res)} />
                    <span className="font-black uppercase text-[10px]">{res}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Poster Upload */}
            <div className="space-y-2">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Event Poster / Banner</label>
              <div
                className={`border-[2.5px] border-dashed border-black rounded-xl p-6 text-center cursor-pointer transition-colors ${posterPreview ? 'bg-green-50' : 'hover:bg-yellow-50'}`}
                onClick={() => document.getElementById('poster-input')?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handlePosterSelect(f); }}
              >
                {posterPreview ? (
                  <div className="space-y-3">
                    <img src={posterPreview} alt="Poster preview" className="max-h-48 mx-auto rounded-lg border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
                    <p className="text-[9px] font-black uppercase opacity-40">Click or drag to replace</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 border-[2px] border-black rounded-xl bg-yellow-400 mx-auto flex items-center justify-center text-xl">📷</div>
                    <p className="text-[10px] font-black uppercase italic">Drop poster here or click to browse</p>
                    <p className="text-[8px] font-bold opacity-30">JPG, PNG, WebP — Max file size: 10MB</p>
                  </div>
                )}
              </div>
              <input id="poster-input" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePosterSelect(f); }} />
              {uploading && (
                <div className="w-full bg-slate-200 border-[2px] border-black rounded-full h-4 overflow-hidden">
                  <div className="h-full bg-yellow-400 transition-all font-black text-[7px] flex items-center justify-center" style={{ width: `${uploadProgress}%` }}>
                    {uploadProgress}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Description & Contact */}
        {step === 4 && (
          <div className="grid grid-cols-1 gap-5 mt-2">
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Full Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-28 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none"
                placeholder="Describe your event in detail..." />
            </div>
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Co-organizers</label>
              <BrutalInput placeholder="e.g. Tech Club, Design Society" value={coOrganizers} onChange={e => setCoOrganizers(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Contact Email</label>
                <BrutalInput placeholder="organizer@campus.edu" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Contact Phone</label>
                <BrutalInput placeholder="+91 9876543210" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Budget Estimation (Optional)</label>
              <BrutalInput placeholder="e.g. ₹5,000" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Eligibility — Departments</label>
              <div className="flex flex-wrap gap-2">
                {['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'MBA', 'All Departments'].map(d => (
                  <button key={d} onClick={() => { if (d === 'All Departments') { setEligDepts([]); } else { setEligDepts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]); } }}
                    className={`border-[2px] border-black px-3 py-1 text-[8px] font-black uppercase rounded-xl transition-all ${d === 'All Departments' ? (eligDepts.length === 0 ? 'bg-yellow-400' : 'bg-white') : (eligDepts.includes(d) ? 'bg-teal-400' : 'bg-white')}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Eligibility — Years</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(y => (
                  <button key={y} onClick={() => setEligYears(prev => prev.includes(y) ? prev.filter(x => x !== y) : [...prev, y])}
                    className={`w-10 h-10 border-[2px] border-black font-black rounded-xl transition-all ${eligYears.includes(y) ? 'bg-teal-400' : 'bg-white'}`}>
                    {y}
                  </button>
                ))}
                <button onClick={() => setEligYears([])}
                  className={`px-4 h-10 border-[2px] border-black font-black text-[8px] uppercase rounded-xl transition-all ${eligYears.length === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
                  All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <div className="mt-2 space-y-4">
            {submitError && (
              <div className="border-[2.5px] border-red-600 rounded-xl p-4 bg-red-100 space-y-2">
                <p className="text-[12px] font-black uppercase italic text-red-700">{submitError}</p>
              </div>
            )}
            {conflict && (
              <div className="border-[2.5px] border-red-600 rounded-xl p-4 bg-red-50 space-y-2">
                <p className="text-[10px] font-black uppercase italic text-red-700">⚠ Scheduling Conflict: {conflict}</p>
                <p className="text-[8px] font-bold opacity-50">You can still submit, but the admin may reject due to this conflict.</p>
                {alternatives.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[8px] font-black uppercase opacity-60">💡 Available alternatives:</p>
                    <div className="flex gap-1.5 mt-1">{alternatives.map(a => (
                      <span key={a} className="bg-green-100 border-[1.5px] border-green-500 rounded-lg px-2 py-0.5 text-[8px] font-black">{a}</span>
                    ))}</div>
                  </div>
                )}
              </div>
            )}
            <div className="border-[2.5px] border-black rounded-xl p-4 bg-yellow-50">
              <p className="text-[10px] font-black uppercase italic text-center">Review your event details before submitting</p>
            </div>
            {posterPreview && (
              <img src={posterPreview} alt="Event poster" className="max-h-40 mx-auto rounded-lg border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Title', v: title || '—' },
                { l: 'Type', v: eventType },
                { l: 'Category', v: category },
                { l: 'Department', v: department || '—' },
                { l: 'Venue', v: eventType === 'ONLINE' ? 'ONLINE' : (venueName || '—') },
                { l: 'Date', v: date || '—' },
                { l: 'Time', v: startTime && endTime ? `${startTime} — ${endTime}` : '—' },
                { l: 'Capacity', v: capacity || '—' },
                { l: 'Expected', v: expectedAttendance || '—' },
                { l: 'Deadline', v: regDeadline || 'No deadline' },
                { l: 'Resources', v: resources.join(', ') || 'None' },
                { l: 'Co-organizers', v: coOrganizers || 'None' },
                { l: 'Budget', v: budget || 'Not specified' },
              ].map((item) => (
                <div key={item.l} className="border-[2px] border-black rounded-lg p-2.5">
                  <span className="text-[7px] font-black uppercase opacity-30 italic">{item.l}</span>
                  <p className="text-[10px] font-black uppercase truncate">{item.v}</p>
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
            <BrutalButton className="px-8" color={COLORS.green} onClick={handleSubmit} disabled={submitting || uploading}>
              {submitting ? (uploading ? `Uploading... ${uploadProgress}%` : 'Submitting...') : 'Submit Event'}
            </BrutalButton>
          ) : (
            <BrutalButton className="px-8" onClick={() => setStep(step + 1)}>Continue</BrutalButton>
          )}
        </div>
      </BrutalCard>
    </div>
  );
}
