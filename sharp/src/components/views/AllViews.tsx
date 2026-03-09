'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useNotifications } from '@/hooks/useNotifications';
import { useVenues } from '@/hooks/useVenues';
import { useFeedback } from '@/hooks/useFeedback';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { queryDocs, updateDocument, where, orderBy } from '@/lib/firestore';
import type { UserProfile, CampusEvent, Registration, Notification as NotifType, Venue } from '@/types';
import { Bell, Mail, Info, LogIn, Award, MessageSquare, CheckSquare, User, FileText, Users, CheckCircle, BarChart2, MapPin, Settings, Database, Activity, Send, Calendar } from 'lucide-react';

/* ===== Public: Announcements ===== */
export function AnnouncementsPage() {
  const { notifications } = useNotifications(undefined);
  // Show system-level announcements from the notifications collection
  const [announcements, setAnnouncements] = useState<NotifType[]>([]);

  useEffect(() => {
    queryDocs<NotifType>('notifications', [orderBy('createdAt', 'desc')]).then(data => {
      // Show unique messages as announcements
      const seen = new Set<string>();
      const unique = data.filter(n => { if (seen.has(n.message || '')) return false; seen.add(n.message || ''); return true; });
      setAnnouncements(unique.slice(0, 6));
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">Announcements</h2>
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <BrutalCard className="p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">No announcements yet</p></BrutalCard>
        ) : (
          announcements.map((item, i) => (
            <BrutalCard key={item.id || i} className="p-4 hover:bg-yellow-50 border-l-[6px] border-l-black">
              <div className="flex justify-between items-start mb-2">
                <Badge text={item.type || 'System'} color={item.type === 'reminder' ? COLORS.teal : COLORS.pink} />
                <span className="text-[7.5px] font-black opacity-30 italic">
                  {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : ''}
                </span>
              </div>
              <p className="text-[11px] font-bold leading-relaxed">{item.message}</p>
            </BrutalCard>
          ))
        )}
      </div>
    </div>
  );
}

/* ===== Public: About ===== */
export function AboutPage() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase italic tracking-tighter underline decoration-[5px] decoration-teal-400 underline-offset-4">About Sharp</h2>
      <BrutalCard className="p-6 space-y-4 border-b-[6px]">
        <h3 className="text-lg font-black uppercase italic">About Platform</h3>
        <p className="text-[11px] font-bold leading-relaxed opacity-70">
          SHARP is the centralized digital platform designed to streamline the complete lifecycle of campus events in educational institutions. From event creation to approval, registration to attendance tracking, and certificates to analytics — SHARP handles it all.
        </p>
      </BrutalCard>
      <BrutalCard className="p-6 space-y-4 border-b-[6px]" color={COLORS.yellow}>
        <h3 className="text-lg font-black uppercase italic">How It Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Create', desc: 'Organizers propose events with details, venue, and resources.' },
            { step: '02', title: 'Approve', desc: 'Admins review, detect conflicts, and approve or request revisions.' },
            { step: '03', title: 'Engage', desc: 'Students discover, register, attend, and earn certificates.' },
          ].map((item) => (
            <div key={item.step} className="bg-white border-[2.5px] border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl font-black opacity-10 italic">{item.step}</span>
              <h4 className="font-black uppercase text-sm italic mt-1">{item.title}</h4>
              <p className="text-[9px] font-bold opacity-60 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </BrutalCard>
      <BrutalCard className="p-6 space-y-4">
        <h3 className="text-lg font-black uppercase italic">FAQ</h3>
        {[
          { q: 'Who can create events?', a: 'Event Organizers (student clubs/societies) can create event proposals.' },
          { q: 'How do I register for an event?', a: 'Log in with your institutional email and click Register on any event.' },
          { q: 'How are certificates generated?', a: 'Certificates are automatically generated based on QR-verified attendance.' },
        ].map((faq, i) => (
          <div key={i} className="border-b-[2px] border-black border-opacity-10 pb-3 last:border-0">
            <h4 className="font-black uppercase text-[11px] italic">{faq.q}</h4>
            <p className="text-[10px] font-bold opacity-60 mt-1">{faq.a}</p>
          </div>
        ))}
      </BrutalCard>
    </div>
  );
}

/* ===== Public: Auth (legacy — now handled by AuthPageView) ===== */
export function AuthPage() {
  return (
    <div className="max-w-md mx-auto py-8 text-center">
      <p className="font-black uppercase text-[11px] opacity-40 italic">Redirecting to auth...</p>
    </div>
  );
}

/* ===== Student: My Registrations ===== */
export function MyRegistrations() {
  const { profile } = useAuthStore();
  const { registrations, fetchUserRegistrations, cancelRegistration } = useRegistrations();
  const [tab, setTab] = useState('all');

  useEffect(() => {
    if (profile?.uid) fetchUserRegistrations(profile.uid);
  }, [profile?.uid, fetchUserRegistrations]);

  const filtered = tab === 'all' ? registrations : registrations.filter(r => r.status === tab);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">My Registrations</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['all', 'confirmed', 'waitlisted', 'cancelled', 'attended'].map((t, i) => (
          <button key={t} onClick={() => setTab(t)}
            className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${tab === t ? 'bg-yellow-400' : 'bg-white'}`}>
            {t} ({(t === 'all' ? registrations : registrations.filter(r => r.status === t)).length})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <BrutalCard className="p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">No registrations in this category</p></BrutalCard>
        ) : (
          filtered.map((reg) => (
            <BrutalCard key={reg.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-l-[6px] border-l-black">
              <div>
                <h4 className="font-black uppercase text-[12px] italic">{reg.eventTitle || 'Event'}</h4>
                <p className="text-[8px] font-bold opacity-40 uppercase">
                  {reg.registrationTime?.toDate ? reg.registrationTime.toDate().toLocaleDateString() : ''} • {reg.id?.slice(0, 8)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge text={reg.status} color={reg.status === 'confirmed' ? COLORS.green : reg.status === 'cancelled' ? COLORS.red : COLORS.yellow} />
                {reg.status === 'confirmed' && (
                  <BrutalButton color={COLORS.red} className="px-3 py-1 text-[8px]" onClick={() => cancelRegistration(reg.id, reg.eventId)}>Cancel</BrutalButton>
                )}
              </div>
            </BrutalCard>
          ))
        )}
      </div>
    </div>
  );
}

/* ===== Student: Certificates ===== */
export function CertificatesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">Certificates</h2>
      <BrutalCard className="p-6 text-center space-y-3">
        <Award className="w-12 h-12 mx-auto opacity-20" />
        <p className="text-[11px] font-black uppercase italic opacity-40">Certificates will appear here after you attend events</p>
        <p className="text-[9px] font-bold opacity-30">Attend approved events & have your attendance verified to earn certificates</p>
      </BrutalCard>
    </div>
  );
}

/* ===== Student: Feedback ===== */
export function FeedbackPage() {
  const { profile } = useAuthStore();
  const { events, fetchPublicEvents } = useEvents();
  const { submitFeedback } = useFeedback();
  const [eventId, setEventId] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { fetchPublicEvents(); }, [fetchPublicEvents]);

  const handleSubmit = async () => {
    if (!profile || !eventId) return;
    const ratingsObj = {
      content: ratings['Content Quality'] || 0,
      organization: ratings['Organization'] || 0,
      venue: ratings['Venue & Facilities'] || 0,
      speaker: 0,
      overall: ratings['Overall'] || 0,
    };
    await submitFeedback(eventId, anonymous ? null : profile.uid, ratingsObj, comment, anonymous);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">Feedback</h2>
        <BrutalCard className="p-8 text-center space-y-3">
          <div className="w-16 h-16 bg-green-400 border-[3px] border-black rounded-2xl mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><span className="text-2xl">✓</span></div>
          <p className="font-black uppercase text-sm italic">Feedback Submitted!</p>
          <BrutalButton color={COLORS.yellow} onClick={() => { setSubmitted(false); setComment(''); setRatings({}); }}>Submit Another</BrutalButton>
        </BrutalCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">Feedback</h2>
      <BrutalCard className="p-6 space-y-5 border-b-[6px]">
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Select Event</label>
          <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
            <option value="">Choose an event...</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
        {['Content Quality', 'Organization', 'Venue & Facilities', 'Overall'].map((dim) => (
          <div key={dim} className="flex items-center justify-between">
            <span className="font-black uppercase text-[9px] italic opacity-60">{dim}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRatings(prev => ({ ...prev, [dim]: star }))}
                  className={`w-7 h-7 border-[2px] border-black rounded-lg font-black text-[11px] transition-colors ${(ratings[dim] || 0) >= star ? 'bg-yellow-400' : 'hover:bg-yellow-100'}`}>★</button>
              ))}
            </div>
          </div>
        ))}
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Comments</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none" placeholder="Your feedback..." />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" className="w-4 h-4 accent-yellow-400" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
          <span className="font-black uppercase text-[9px] italic opacity-60">Submit Anonymously</span>
        </div>
        <BrutalButton className="w-full py-3" color={COLORS.yellow} onClick={handleSubmit} disabled={!eventId}><Send className="w-4 h-4" /> Submit Feedback</BrutalButton>
      </BrutalCard>
    </div>
  );
}

/* ===== Student: Notifications ===== */
export function NotificationsPage() {
  const { profile } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead } = useNotifications(profile?.uid);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Notifications</h2>
        {notifications.some(n => !n.read) && (
          <BrutalButton color={COLORS.teal} className="text-[8px] px-3 py-1" onClick={markAllAsRead}>Mark All Read</BrutalButton>
        )}
      </div>
      <div className="border-[2.5px] border-black bg-white rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        {notifications.length === 0 ? (
          <div className="p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">No notifications yet</p></div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} onClick={() => !notif.read && markAsRead(notif.id)}
              className={`p-3.5 border-b-[2px] border-black hover:bg-yellow-50 cursor-pointer transition-colors last:border-0 ${!notif.read ? 'border-l-[4px] border-l-yellow-400 bg-yellow-50/50' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <Badge text={notif.type || 'system'} color={notif.type === 'reminder' ? COLORS.teal : notif.type === 'approval' ? COLORS.pink : COLORS.yellow} />
                <span className="text-[7.5px] font-black opacity-30 italic">
                  {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleDateString() : ''}
                </span>
              </div>
              <p className={`text-[10px] leading-tight ${!notif.read ? 'font-black' : 'font-bold'}`}>{notif.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ===== Profile Page (ALL ROLES) — with Role Management ===== */
export function ProfilePage() {
  const { profile, role } = useAuthStore();
  const [name, setName] = useState(profile?.name || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newRole, setNewRole] = useState(role || 'student');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDepartment(profile.department || '');
      setNewRole(profile.role || 'student');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.uid) return;
    setSaving(true);
    await updateDocument('users', profile.uid, { name, department });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRoleChange = async () => {
    if (!profile?.uid) return;
    setSaving(true);
    await updateDocument('users', profile.uid, { role: newRole });
    setSaving(false);
    setSaved(true);
    // Reload to reflect role change
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-lavender underline-offset-4">Profile</h2>

      {/* Profile Info */}
      <BrutalCard className="p-6 border-b-[6px]">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div className="w-24 h-24 border-[3px] border-black rounded-2xl overflow-hidden bg-pink-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 flex items-center justify-center">
            {profile?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoURL} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black">{(profile?.name || 'U')[0].toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Full Name</label>
                <BrutalInput value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Email</label>
                <BrutalInput value={profile?.email || ''} disabled placeholder="Email" />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Department</label>
                <BrutalInput value={department} onChange={e => setDepartment(e.target.value)} placeholder="Computer Science" />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Current Role</label>
                <div className="border-[2.5px] border-black bg-slate-50 p-2.5 font-bold text-xs rounded-xl">
                  <Badge text={role || 'student'} color={role === 'admin' ? COLORS.lavender : role === 'organizer' ? COLORS.teal : COLORS.yellow} />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <BrutalButton color={COLORS.yellow} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
              </BrutalButton>
            </div>
          </div>
        </div>
      </BrutalCard>


    </div>
  );
}

/* ===== Organizer: My Events ===== */
export function OrganizerMyEvents() {
  const { profile } = useAuthStore();
  const { events, fetchOrganizerEvents } = useEvents();
  const [tab, setTab] = useState('all');

  useEffect(() => {
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
  }, [profile?.uid, fetchOrganizerEvents]);

  const filtered = tab === 'all' ? events : events.filter(e => e.status === tab);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">My Events</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['all', 'draft', 'pending', 'approved', 'completed'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${tab === t ? 'bg-yellow-400' : 'bg-white'}`}>
            {t} ({(t === 'all' ? events : events.filter(e => e.status === t)).length})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <BrutalCard className="p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">No events in this category</p></BrutalCard>
        ) : (
          filtered.map((evt) => (
            <BrutalCard key={evt.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-slate-200 border-[2px] border-black rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                  <span className="text-2xl font-black opacity-10">{evt.category[0].toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge text={evt.category} color={COLORS.teal} />
                    <Badge text={evt.status} color={evt.status === 'approved' ? COLORS.green : evt.status === 'pending' ? COLORS.yellow : '#fff'} />
                  </div>
                  <h4 className="font-black uppercase text-[12px] italic">{evt.title}</h4>
                  <p className="text-[8px] font-bold opacity-40 uppercase">{evt.registeredCount}/{evt.capacity} registered</p>
                </div>
              </div>
              <div className="flex gap-2">
                <BrutalButton color={COLORS.teal} className="px-3 py-1 text-[8px]">View</BrutalButton>
              </div>
            </BrutalCard>
          ))
        )}
      </div>
    </div>
  );
}

/* ===== Organizer: Participants ===== */
export function ParticipantsPage() {
  const { profile } = useAuthStore();
  const { events, fetchOrganizerEvents } = useEvents();
  const { registrations, fetchEventParticipants } = useRegistrations();
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
  }, [profile?.uid, fetchOrganizerEvents]);

  useEffect(() => {
    if (selectedEvent) fetchEventParticipants(selectedEvent);
  }, [selectedEvent, fetchEventParticipants]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Participants</h2>
      </div>
      <div className="space-y-1.5">
        <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Select Event</label>
        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
          className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
          <option value="">Choose event...</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title} ({e.registeredCount} registered)</option>)}
        </select>
      </div>
      {selectedEvent && (
        <BrutalCard className="p-0 border-[2.5px] overflow-hidden">
          <table className="w-full text-left font-bold">
            <thead>
              <tr className="border-b-[2.5px] border-black text-[8px] uppercase opacity-40 italic tracking-widest bg-slate-50">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {registrations.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-[10px] font-black uppercase italic opacity-30">No participants yet</td></tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r.id} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50">
                    <td className="p-3 font-black uppercase">{r.userName || 'Unknown'}</td>
                    <td className="p-3">{r.userDepartment || ''}</td>
                    <td className="p-3 text-center"><Badge text={r.status} color={r.status === 'confirmed' ? COLORS.green : COLORS.yellow} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </BrutalCard>
      )}
    </div>
  );
}

/* ===== Organizer: Attendance ===== */
export function AttendancePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-green-400 underline-offset-4">Attendance</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrutalCard className="p-6 border-b-[6px] flex flex-col items-center gap-4">
          <div className="w-48 h-48 border-[3px] border-dashed border-black rounded-2xl flex items-center justify-center bg-slate-50">
            <CheckCircle className="w-16 h-16 opacity-10" />
          </div>
          <p className="text-[10px] font-black uppercase italic opacity-40">QR Scanner — Coming Soon</p>
          <BrutalButton color={COLORS.teal} className="w-full py-3">Start QR Scanner</BrutalButton>
        </BrutalCard>
        <BrutalCard className="p-6 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">How it works</h3>
          <p className="text-[10px] font-bold opacity-60">Students show their QR code at the venue. Scan to mark attendance and auto-update the registration status.</p>
        </BrutalCard>
      </div>
    </div>
  );
}

/* ===== Organizer: Tasks ===== */
export function TasksPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">Tasks</h2>
      <BrutalCard className="p-6 text-center space-y-3">
        <CheckSquare className="w-12 h-12 mx-auto opacity-20" />
        <p className="text-[11px] font-black uppercase italic opacity-40">Task management — coming soon</p>
        <p className="text-[9px] font-bold opacity-30">Create and assign tasks to team members for your events</p>
      </BrutalCard>
    </div>
  );
}

/* ===== Organizer: Event Updates ===== */
export function EventUpdatesPage() {
  const { profile } = useAuthStore();
  const { events, fetchOrganizerEvents } = useEvents();
  const { createNotification } = useNotifications(profile?.uid);
  const [eventId, setEventId] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => { if (profile?.uid) fetchOrganizerEvents(profile.uid); }, [profile?.uid, fetchOrganizerEvents]);

  const handleSend = async () => {
    if (!eventId || !message) return;
    // In production, this would notify all registered users
    // For now, create a notification for the organizer as confirmation
    if (profile) {
      await createNotification(profile.uid, 'Update Sent', `Update for event sent: ${message}`, 'update', eventId);
    }
    setSent(true);
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">Event Updates</h2>
      <BrutalCard className="p-6 space-y-5 border-b-[6px]">
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Select Event</label>
          <select value={eventId} onChange={e => setEventId(e.target.value)}
            className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
            <option value="">Choose event...</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none" placeholder="Type your update..." />
        </div>
        {sent && <div className="bg-green-100 border-[2px] border-green-500 rounded-xl p-2 text-center"><span className="text-[10px] font-black uppercase text-green-700">✓ Update sent!</span></div>}
        <BrutalButton className="w-full py-3" color={COLORS.yellow} onClick={handleSend} disabled={!eventId || !message}><Send className="w-4 h-4" /> Send Notification</BrutalButton>
      </BrutalCard>
    </div>
  );
}

/* ===== Analytics (shared organizer/admin) ===== */
export function AnalyticsPage() {
  const { events, fetchAllEvents } = useEvents();
  const [totalRegs, setTotalRegs] = useState(0);

  useEffect(() => {
    fetchAllEvents().then(evts => {
      if (evts) setTotalRegs(evts.reduce((sum: number, e: CampusEvent) => sum + (e.registeredCount || 0), 0));
    });
  }, [fetchAllEvents]);

  const avgCapacity = events.length > 0 ? Math.round(events.reduce((s, e) => s + ((e.registeredCount || 0) / Math.max(e.capacity, 1)) * 100, 0) / events.length) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Analytics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Registrations', value: String(totalRegs), color: COLORS.teal },
          { label: 'Avg Fill Rate', value: `${avgCapacity}%`, color: COLORS.yellow },
          { label: 'Total Events', value: String(events.length), color: COLORS.pink },
        ].map((stat, i) => (
          <BrutalCard key={i} color={stat.color} className="p-4 border-b-[5px] text-center">
            <span className="text-[7px] font-black uppercase opacity-60 tracking-wider">{stat.label}</span>
            <div className="text-3xl font-black mt-1">{stat.value}</div>
          </BrutalCard>
        ))}
      </div>
      <BrutalCard className="h-48 flex items-end justify-between p-6 gap-2 border-[2.5px] bg-white">
        {events.slice(0, 12).map((e, i) => {
          const pct = e.capacity > 0 ? Math.round((e.registeredCount / e.capacity) * 100) : 10;
          return (
            <div key={i} className="flex-1 bg-black border-[1px] border-white group relative hover:bg-teal-400 transition-all rounded-t-lg" style={{ height: `${Math.max(pct, 5)}%` }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded text-[7px] opacity-0 group-hover:opacity-100 transition-opacity font-bold border border-white">{pct}</div>
            </div>
          );
        })}
        {events.length === 0 && <p className="mx-auto text-[10px] font-black uppercase italic opacity-20">No data yet</p>}
      </BrutalCard>
    </div>
  );
}

/* ===== Admin: Venue Management ===== */
export function VenueManagement() {
  const { venues, loading, fetchVenues, createVenue, deleteVenue, updateVenue } = useVenues();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCapacity, setNewCapacity] = useState('');

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const handleAdd = async () => {
    if (!newName) return;
    await createVenue({ name: newName, location: newLocation, capacity: parseInt(newCapacity) || 50, facilities: [], isActive: true });
    setNewName(''); setNewLocation(''); setNewCapacity('');
    setShowForm(false);
    fetchVenues();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Venue Management</h2>
        <BrutalButton color={COLORS.yellow} className="text-[9px]" onClick={() => setShowForm(!showForm)}>+ Add Venue</BrutalButton>
      </div>

      {showForm && (
        <BrutalCard className="p-5 space-y-4 border-b-[6px]" color={COLORS.yellow}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <BrutalInput placeholder="Venue Name" value={newName} onChange={e => setNewName(e.target.value)} />
            <BrutalInput placeholder="Location" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
            <BrutalInput placeholder="Capacity" type="number" value={newCapacity} onChange={e => setNewCapacity(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <BrutalButton color={COLORS.teal} onClick={handleAdd}>Save Venue</BrutalButton>
            <BrutalButton color="white" onClick={() => setShowForm(false)}>Cancel</BrutalButton>
          </div>
        </BrutalCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.length === 0 && !loading ? (
          <BrutalCard className="col-span-3 p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">No venues. Add one or run the seed API.</p></BrutalCard>
        ) : (
          venues.map((venue) => (
            <BrutalCard key={venue.id} className="p-4 border-b-[5px]">
              <div className="flex justify-between mb-2">
                <h4 className="font-black uppercase text-sm italic">{venue.name}</h4>
                <Badge text={venue.isActive ? 'Active' : 'Inactive'} color={venue.isActive ? COLORS.green : COLORS.red} />
              </div>
              <p className="text-[9px] font-black uppercase opacity-40">Capacity: {venue.capacity}</p>
              {venue.location && <p className="text-[8px] font-bold opacity-30 mt-1">{venue.location}</p>}
              {venue.facilities && venue.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {venue.facilities.map((f) => (
                    <span key={f} className="text-[7px] font-black uppercase bg-slate-100 border-[1.5px] border-black px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <BrutalButton color="white" className="flex-1 text-[8px] py-1" onClick={() => updateVenue(venue.id, { isActive: !venue.isActive }).then(() => fetchVenues())}>
                  {venue.isActive ? 'Disable' : 'Enable'}
                </BrutalButton>
                <BrutalButton color={COLORS.red} className="flex-1 text-[8px] py-1" onClick={() => deleteVenue(venue.id).then(() => fetchVenues())}>Delete</BrutalButton>
              </div>
            </BrutalCard>
          ))
        )}
      </div>
    </div>
  );
}

/* ===== Admin: User Management ===== */
export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const data = await queryDocs<UserProfile>('users', []);
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const changeRole = async (uid: string, newRole: string) => {
    await updateDocument('users', uid, { role: newRole });
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">User Management</h2>
      <BrutalCard className="p-0 border-[2.5px] overflow-hidden">
        <table className="w-full text-left font-bold">
          <thead>
            <tr className="border-b-[2.5px] border-black text-[8px] uppercase opacity-40 italic tracking-widest bg-slate-50">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Department</th>
              <th className="p-3 text-center">Role</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[10px]">
            {users.length === 0 && !loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-[10px] font-black uppercase italic opacity-30">No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.uid} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50">
                  <td className="p-3 font-black uppercase">{u.name || 'Unknown'}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.department || '—'}</td>
                  <td className="p-3 text-center">
                    <Badge text={u.role || 'student'} color={u.role === 'admin' ? COLORS.lavender : u.role === 'organizer' ? COLORS.teal : COLORS.yellow} />
                  </td>
                  <td className="p-3 text-center">
                    <select value={u.role || 'student'} onChange={e => changeRole(u.uid, e.target.value)}
                      className="border-[2px] border-black rounded-lg px-2 py-1 text-[9px] font-black bg-white">
                      <option value="student">Student</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </BrutalCard>
    </div>
  );
}

/* ===== Admin: System Notifications ===== */
export function SystemNotificationsPage() {
  const { profile } = useAuthStore();
  const { createNotification } = useNotifications(profile?.uid);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!profile || !message) return;
    // In a real app, this would send to all users via Cloud Functions
    // For demo, create a notification for the admin
    await createNotification(profile.uid, subject || 'System Notification', message, 'system');
    setSent(true);
    setMessage('');
    setSubject('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">System Notifications</h2>
      <BrutalCard className="p-6 space-y-5 border-b-[6px]">
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Subject</label>
          <BrutalInput placeholder="Notification subject..." value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none" placeholder="Type your announcement..." />
        </div>
        {sent && <div className="bg-green-100 border-[2px] border-green-500 rounded-xl p-2 text-center"><span className="text-[10px] font-black uppercase text-green-700">✓ Sent!</span></div>}
        <BrutalButton className="w-full py-3" color={COLORS.yellow} onClick={handleSend} disabled={!message}><Send className="w-4 h-4" /> Send Announcement</BrutalButton>
      </BrutalCard>
    </div>
  );
}

/* ===== Admin: System Settings (static for now) ===== */
export function SystemSettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">System Settings</h2>
      <BrutalCard className="p-6 space-y-4 border-b-[6px]">
        <h3 className="font-black uppercase text-sm italic">Event Categories</h3>
        <div className="flex flex-wrap gap-2">
          {['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar', 'Competition', 'Social'].map((cat) => (
            <div key={cat} className="flex items-center gap-2 border-[2px] border-black px-3 py-1.5 rounded-xl bg-white">
              <span className="font-black uppercase text-[9px]">{cat}</span>
            </div>
          ))}
        </div>
      </BrutalCard>
    </div>
  );
}

/* ===== Admin: Data Management (static) ===== */
export function DataManagementPage() {
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState('');

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setSeedResult(data.message);
    } catch {
      setSeedResult('Seed failed');
    }
    setSeeding(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Data Management</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrutalCard className="p-6 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">Seed Database</h3>
          <p className="text-[10px] font-bold opacity-60">Populate venues and sample data for testing.</p>
          {seedResult && <div className="bg-yellow-100 border-[2px] border-yellow-500 rounded-xl p-2"><span className="text-[9px] font-black">{seedResult}</span></div>}
          <BrutalButton color={COLORS.yellow} className="w-full py-3" onClick={handleSeed} disabled={seeding}>
            <Database className="w-4 h-4" /> {seeding ? 'Seeding...' : 'Seed Now'}
          </BrutalButton>
        </BrutalCard>
        <BrutalCard className="p-6 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">Export</h3>
          <p className="text-[10px] font-bold opacity-60">Export data as JSON from Firestore.</p>
          <BrutalButton color={COLORS.teal} className="w-full py-3">Export Events</BrutalButton>
        </BrutalCard>
      </div>
    </div>
  );
}

/* ===== Admin: Activity Logs ===== */
export function ActivityLogsPage() {
  const { logs, fetchLogs } = useActivityLogs();

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-lavender underline-offset-4">Activity Logs</h2>
      <BrutalCard className="p-0 border-[2.5px] overflow-hidden">
        <table className="w-full text-left font-bold">
          <thead>
            <tr className="border-b-[2.5px] border-black text-[8px] uppercase opacity-40 italic tracking-widest bg-slate-50">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
            </tr>
          </thead>
          <tbody className="text-[10px]">
            {logs.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-[10px] font-black uppercase italic opacity-30">No activity logged yet</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50">
                  <td className="p-3 font-bold opacity-50">{log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : ''}</td>
                  <td className="p-3"><Badge text={log.role || 'system'} color={log.role === 'admin' ? COLORS.lavender : log.role === 'organizer' ? COLORS.teal : COLORS.yellow} /></td>
                  <td className="p-3 font-black uppercase">{log.action}</td>
                  <td className="p-3">{log.entityType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </BrutalCard>
    </div>
  );
}
