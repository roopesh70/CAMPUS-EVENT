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
import { useTasks } from '@/hooks/useTasks';
import { useCertificates } from '@/hooks/useCertificates';
import { queryDocs, updateDocument, where, orderBy } from '@/lib/firestore';
import type { UserProfile, CampusEvent, Registration, Notification as NotifType, Venue, Certificate } from '@/types';
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
  const { profile, role } = useAuthStore();
  const { certificates, loading, fetchUserCertificates, generateCertificate } = useCertificates();
  const { events, fetchOrganizerEvents } = useEvents();
  const { registrations, fetchEventParticipants } = useRegistrations();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genDone, setGenDone] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      fetchUserCertificates(profile.uid);
      if (role === 'organizer') fetchOrganizerEvents(profile.uid);
    }
  }, [profile?.uid, role, fetchUserCertificates, fetchOrganizerEvents]);

  useEffect(() => {
    if (selectedEvent) fetchEventParticipants(selectedEvent);
  }, [selectedEvent, fetchEventParticipants]);

  const downloadCert = (cert: Certificate) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Background
    ctx.fillStyle = '#FFFBEB'; ctx.fillRect(0, 0, 1200, 850);
    // Border
    ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.strokeRect(30, 30, 1140, 790);
    ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 3; ctx.strokeRect(45, 45, 1110, 760);
    // Title
    ctx.fillStyle = '#000'; ctx.font = 'bold 48px monospace'; ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF', 600, 150);
    ctx.font = 'bold italic 56px monospace';
    ctx.fillText(cert.type.toUpperCase(), 600, 220);
    // Line
    ctx.fillStyle = '#FACC15'; ctx.fillRect(350, 250, 500, 4);
    // Body
    ctx.fillStyle = '#000'; ctx.font = '22px monospace'; ctx.fillText('This is to certify that', 600, 320);
    ctx.font = 'bold 40px monospace'; ctx.fillText(cert.userName, 600, 390);
    ctx.font = '22px monospace'; ctx.fillText('has successfully participated in', 600, 450);
    ctx.font = 'bold 32px monospace'; ctx.fillText(cert.eventTitle, 600, 520);
    // Date & Code
    ctx.font = '18px monospace'; ctx.fillStyle = '#666';
    const dateStr = cert.issueDate?.toDate ? cert.issueDate.toDate().toLocaleDateString() : new Date().toLocaleDateString();
    ctx.fillText(`Date: ${dateStr}`, 600, 620);
    ctx.fillText(`Verification: ${cert.verificationCode}`, 600, 660);
    // Logo
    ctx.fillStyle = '#000'; ctx.font = 'bold 28px monospace'; ctx.fillText('SHARP — Campus Events', 600, 750);

    const link = document.createElement('a');
    link.download = `certificate_${cert.verificationCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleBulkGenerate = async () => {
    if (!selectedEvent) return;
    const evt = events.find(e => e.id === selectedEvent);
    if (!evt) return;
    setGenerating(true);
    const present = registrations.filter(r => r.attendanceStatus === 'present');
    for (const r of present) {
      await generateCertificate(evt.id, evt.title, r.userId, r.userName, 'participation');
    }
    setGenerating(false);
    setGenDone(true);
    setTimeout(() => setGenDone(false), 4000);
    if (profile?.uid) fetchUserCertificates(profile.uid);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">Certificates</h2>

      {/* Organizer: Generate Certificates */}
      {role === 'organizer' && (
        <BrutalCard color={COLORS.yellow} className="p-5 border-b-[5px] space-y-3">
          <h3 className="font-black uppercase text-sm italic">Generate Certificates</h3>
          <p className="text-[8px] font-bold opacity-50">Select an event to generate participation certificates for all attendees marked as present.</p>
          <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
            className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
            <option value="">Choose event...</option>
            {events.filter(e => e.status === 'approved' || e.status === 'completed').map(e => <option key={e.id} value={e.id}>{e.title} ({e.attendanceCount || 0} attended)</option>)}
          </select>
          {selectedEvent && (
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase opacity-50">{registrations.filter(r => r.attendanceStatus === 'present').length} eligible attendees</span>
              <BrutalButton color={COLORS.teal} className="text-[9px] px-4" onClick={handleBulkGenerate} disabled={generating || registrations.filter(r => r.attendanceStatus === 'present').length === 0}>
                {generating ? 'Generating...' : genDone ? '✓ Generated!' : 'Generate All'}
              </BrutalButton>
            </div>
          )}
        </BrutalCard>
      )}

      {/* Certificate List */}
      {loading ? (
        <BrutalCard className="p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">Loading certificates...</p></BrutalCard>
      ) : certificates.length === 0 ? (
        <BrutalCard className="p-8 text-center space-y-3">
          <Award className="w-12 h-12 mx-auto opacity-20" />
          <p className="text-[11px] font-black uppercase italic opacity-40">No certificates earned yet</p>
          <p className="text-[9px] font-bold opacity-30">Attend events and get your attendance verified to earn certificates</p>
        </BrutalCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <BrutalCard key={cert.id} className="p-5 border-b-[5px] space-y-2">
              <div className="flex justify-between items-start">
                <Badge text={cert.type} color={cert.type === 'participation' ? COLORS.teal : cert.type === 'winner' ? COLORS.yellow : COLORS.pink} />
                <span className="text-[7px] font-black uppercase opacity-30">{cert.issueDate?.toDate ? cert.issueDate.toDate().toLocaleDateString() : ''}</span>
              </div>
              <h4 className="font-black uppercase text-[12px] italic">{cert.eventTitle}</h4>
              <p className="text-[8px] font-bold opacity-40">ID: {cert.verificationCode}</p>
              <BrutalButton color={COLORS.yellow} className="w-full text-[9px] py-2" onClick={() => downloadCert(cert)}>
                <FileText className="w-3.5 h-3.5" /> Download Certificate
              </BrutalButton>
            </BrutalCard>
          ))}
        </div>
      )}
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

  const handleOutcome = async (eventId: string, outcome: 'success' | 'failed') => {
    await updateDocument('events', eventId, { outcomeStatus: outcome, status: 'completed' });
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
  };

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
                    {evt.outcomeStatus && (
                      <Badge text={evt.outcomeStatus} color={evt.outcomeStatus === 'success' ? COLORS.green : COLORS.red} />
                    )}
                  </div>
                  <h4 className="font-black uppercase text-[12px] italic">{evt.title}</h4>
                  <p className="text-[8px] font-bold opacity-40 uppercase">{Math.max(evt.registeredCount || 0, 0)}/{evt.capacity} registered</p>
                </div>
              </div>
              <div className="flex gap-2">
                {evt.status === 'approved' && !evt.outcomeStatus && (
                  <>
                    <BrutalButton color={COLORS.green} className="px-3 py-1 text-[8px]" onClick={() => handleOutcome(evt.id, 'success')}>✓ Success</BrutalButton>
                    <BrutalButton color={COLORS.red} className="px-3 py-1 text-[8px]" onClick={() => handleOutcome(evt.id, 'failed')}>✗ Failed</BrutalButton>
                  </>
                )}
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

  const exportCSV = () => {
    if (registrations.length === 0) return;
    const headers = ['Name', 'Department', 'Status', 'Attendance'];
    const rows = registrations.map(r => [r.userName || 'Unknown', r.userDepartment || '', r.status, r.attendanceStatus || 'pending']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `participants_${selectedEvent}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Participants</h2>
        {selectedEvent && registrations.length > 0 && (
          <BrutalButton color={COLORS.yellow} className="text-[8px] px-3 py-1" onClick={exportCSV}>
            <FileText className="w-3.5 h-3.5" /> Export CSV
          </BrutalButton>
        )}
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
                <th className="p-3">Department</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Attendance</th>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {registrations.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-[10px] font-black uppercase italic opacity-30">No participants yet</td></tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r.id} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50">
                    <td className="p-3 font-black uppercase">{r.userName || 'Unknown'}</td>
                    <td className="p-3">{r.userDepartment || ''}</td>
                    <td className="p-3 text-center"><Badge text={r.status} color={r.status === 'confirmed' ? COLORS.green : COLORS.yellow} /></td>
                    <td className="p-3 text-center"><Badge text={r.attendanceStatus || 'pending'} color={r.attendanceStatus === 'present' ? COLORS.green : r.attendanceStatus === 'absent' ? COLORS.red : COLORS.yellow} /></td>
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

/* ===== Organizer: Attendance (QR + Manual) ===== */
export function AttendancePage() {
  const { profile } = useAuthStore();
  const { events, fetchOrganizerEvents } = useEvents();
  const { registrations, fetchEventParticipants, markAttendance } = useRegistrations();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [marking, setMarking] = useState<string | null>(null);
  const [mode, setMode] = useState<'qr' | 'scan' | 'manual'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const scannerRef = React.useRef<HTMLDivElement>(null);
  const html5QrRef = React.useRef<any>(null);

  useEffect(() => {
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
  }, [profile?.uid, fetchOrganizerEvents]);

  useEffect(() => {
    if (selectedEvent) fetchEventParticipants(selectedEvent);
  }, [selectedEvent, fetchEventParticipants]);

  // Generate QR code when event is selected
  useEffect(() => {
    if (selectedEvent) {
      import('qrcode').then(QRCode => {
        QRCode.toDataURL(`SHARP_ATTENDANCE:${selectedEvent}`, {
          width: 300,
          margin: 2,
          color: { dark: '#000', light: '#FFFBEB' },
        }).then(url => setQrDataUrl(url)).catch(() => {});
      });
    }
  }, [selectedEvent]);

  // Start QR scanner
  const startScanner = async () => {
    if (!scannerRef.current || !selectedEvent) return;
    setScanning(true);
    setScanResult('');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-scanner-container');
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Expected format: SHARP_CHECKIN:{userId}
          if (decodedText.startsWith('SHARP_CHECKIN:')) {
            const userId = decodedText.replace('SHARP_CHECKIN:', '');
            const reg = registrations.find(r => r.userId === userId);
            if (reg && reg.attendanceStatus !== 'present') {
              await markAttendance(reg.id, selectedEvent, 'present');
              await fetchEventParticipants(selectedEvent);
              setScanResult(`✓ Checked in: ${reg.userName}`);
            } else if (reg) {
              setScanResult(`Already checked in: ${reg.userName}`);
            } else {
              setScanResult(`User not registered for this event`);
            }
          } else {
            setScanResult(`Invalid QR code`);
          }
          setTimeout(() => setScanResult(''), 3000);
        },
        () => {} // ignore errors
      );
    } catch (err) {
      setScanResult('Camera access denied or not available');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current = null;
      } catch {}
    }
    setScanning(false);
  };

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const handleMark = async (regId: string, status: 'present' | 'absent') => {
    setMarking(regId);
    await markAttendance(regId, selectedEvent, status);
    await fetchEventParticipants(selectedEvent);
    setMarking(null);
  };

  const presentCount = registrations.filter(r => r.attendanceStatus === 'present').length;
  const absentCount = registrations.filter(r => r.attendanceStatus === 'absent').length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-green-400 underline-offset-4">Attendance</h2>
      <div className="space-y-1.5">
        <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Select Event</label>
        <select value={selectedEvent} onChange={e => { stopScanner(); setSelectedEvent(e.target.value); }}
          className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
          <option value="">Choose event...</option>
          {events.filter(e => e.status === 'approved').map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </div>

      {selectedEvent && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <BrutalCard color={COLORS.teal} className="p-3 text-center border-b-[4px]">
              <span className="text-[7px] font-black uppercase opacity-60">Total</span>
              <div className="text-xl font-black">{registrations.length}</div>
            </BrutalCard>
            <BrutalCard color={COLORS.green} className="p-3 text-center border-b-[4px]">
              <span className="text-[7px] font-black uppercase opacity-60">Present</span>
              <div className="text-xl font-black">{presentCount}</div>
            </BrutalCard>
            <BrutalCard color={COLORS.red} className="p-3 text-center border-b-[4px]">
              <span className="text-[7px] font-black uppercase opacity-60">Absent</span>
              <div className="text-xl font-black">{absentCount}</div>
            </BrutalCard>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2">
            {([['qr', 'QR Code'], ['scan', 'Scanner'], ['manual', 'Manual']] as const).map(([m, label]) => (
              <button key={m} onClick={() => { if (m !== 'scan') stopScanner(); setMode(m); }}
                className={`border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${mode === m ? 'bg-yellow-400' : 'bg-white'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* QR Code Display */}
          {mode === 'qr' && (
            <BrutalCard className="p-6 border-b-[5px] text-center space-y-4">
              <h3 className="font-black uppercase text-sm italic">Event QR Code</h3>
              <p className="text-[8px] font-bold opacity-50">Display this QR code at the venue. Students scan to check in.</p>
              {qrDataUrl ? (
                <div className="inline-block border-[3px] border-black rounded-xl p-3 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <img src={qrDataUrl} alt="Event QR Code" className="w-64 h-64 mx-auto" />
                </div>
              ) : (
                <p className="text-[9px] font-bold opacity-30">Generating QR code...</p>
              )}
              <p className="text-[7px] font-bold opacity-30 uppercase">Event ID: {selectedEvent}</p>
              {qrDataUrl && (
                <BrutalButton color={COLORS.yellow} className="text-[9px]" onClick={() => {
                  const link = document.createElement('a');
                  link.download = `qr_${selectedEvent}.png`;
                  link.href = qrDataUrl;
                  link.click();
                }}>Download QR Code</BrutalButton>
              )}
            </BrutalCard>
          )}

          {/* QR Scanner */}
          {mode === 'scan' && (
            <BrutalCard className="p-6 border-b-[5px] space-y-4">
              <h3 className="font-black uppercase text-sm italic text-center">Scan Student QR</h3>
              <p className="text-[8px] font-bold opacity-50 text-center">Point camera at student&apos;s QR code to mark attendance automatically.</p>
              <div id="qr-scanner-container" ref={scannerRef} className="border-[2px] border-black rounded-xl overflow-hidden mx-auto" style={{ maxWidth: 400 }} />
              {scanResult && (
                <div className={`border-[2px] rounded-xl p-3 text-center font-black text-[10px] uppercase italic ${scanResult.includes('✓') ? 'border-green-600 bg-green-50 text-green-700' : 'border-red-600 bg-red-50 text-red-700'}`}>
                  {scanResult}
                </div>
              )}
              <div className="flex justify-center">
                {!scanning ? (
                  <BrutalButton color={COLORS.teal} className="text-[9px]" onClick={startScanner}>Start Scanner</BrutalButton>
                ) : (
                  <BrutalButton color={COLORS.red} className="text-[9px]" onClick={stopScanner}>Stop Scanner</BrutalButton>
                )}
              </div>
            </BrutalCard>
          )}

          {/* Manual Attendance */}
          {mode === 'manual' && (
            <BrutalCard className="p-0 border-[2.5px] overflow-hidden">
              <div className="p-3 border-b-[2.5px] border-black bg-black text-white">
                <h3 className="text-[11px] font-black uppercase italic tracking-widest">Manual Check-in</h3>
              </div>
              <table className="w-full text-left font-bold">
                <thead>
                  <tr className="border-b-[2px] border-black text-[8px] uppercase opacity-40 italic tracking-widest bg-slate-50">
                    <th className="p-3">Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[10px]">
                  {registrations.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-[10px] font-black uppercase italic opacity-30">No participants registered</td></tr>
                  ) : (
                    registrations.map((r) => (
                      <tr key={r.id} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50">
                        <td className="p-3 font-black uppercase">{r.userName || 'Unknown'}</td>
                        <td className="p-3">{r.userDepartment || '—'}</td>
                        <td className="p-3 text-center">
                          <Badge text={r.attendanceStatus || 'pending'} color={r.attendanceStatus === 'present' ? COLORS.green : r.attendanceStatus === 'absent' ? COLORS.red : COLORS.yellow} />
                        </td>
                        <td className="p-3 flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleMark(r.id, 'present')}
                            disabled={marking === r.id || r.attendanceStatus === 'present'}
                            className="w-7 h-7 bg-green-400 border-[2px] border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:shadow-none transition-all disabled:opacity-30"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMark(r.id, 'absent')}
                            disabled={marking === r.id || r.attendanceStatus === 'absent'}
                            className="w-7 h-7 bg-red-400 border-[2px] border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:shadow-none transition-all disabled:opacity-30"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </BrutalCard>
          )}
        </>
      )}
    </div>
  );
}

/* ===== Organizer: Tasks ===== */
export function TasksPage() {
  const { profile } = useAuthStore();
  const { events, fetchOrganizerEvents } = useEvents();
  const { tasks, loading, fetchEventTasks, createTask, updateTaskStatus } = useTasks();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('');

  useEffect(() => {
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
  }, [profile?.uid, fetchOrganizerEvents]);

  useEffect(() => {
    if (selectedEvent) fetchEventTasks(selectedEvent);
  }, [selectedEvent, fetchEventTasks]);

  const handleCreate = async () => {
    if (!newTitle || !selectedEvent || !profile) return;
    await createTask({
      eventId: selectedEvent,
      title: newTitle,
      assignedTo: newAssignee || profile.name || 'Unassigned',
      status: 'pending',
    });
    setNewTitle('');
    setNewAssignee('');
    setShowForm(false);
    fetchEventTasks(selectedEvent);
  };

  const handleStatusChange = async (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    await updateTaskStatus(taskId, status);
    fetchEventTasks(selectedEvent);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">Tasks</h2>
        {selectedEvent && <BrutalButton color={COLORS.teal} className="text-[8px] px-3 py-1" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Task'}</BrutalButton>}
      </div>

      <div className="space-y-1.5">
        <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Select Event</label>
        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
          className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
          <option value="">Choose event...</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <BrutalCard color={COLORS.yellow} className="p-5 border-b-[5px] space-y-3">
          <h3 className="font-black uppercase text-sm italic">New Task</h3>
          <BrutalInput placeholder="Task title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <BrutalInput placeholder="Assign to..." value={newAssignee} onChange={e => setNewAssignee(e.target.value)} />
          <BrutalButton color={COLORS.teal} className="w-full py-2" onClick={handleCreate} disabled={!newTitle}>Create Task</BrutalButton>
        </BrutalCard>
      )}

      {/* Task List */}
      {selectedEvent && (
        <div className="space-y-2">
          {loading ? (
            <BrutalCard className="p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">Loading tasks...</p></BrutalCard>
          ) : tasks.length === 0 ? (
            <BrutalCard className="p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">No tasks yet. Create one above!</p></BrutalCard>
          ) : (
            tasks.map((task) => (
              <BrutalCard key={task.id} className="flex items-center gap-4 p-4 border-l-[6px]" style={{ borderLeftColor: task.status === 'completed' ? COLORS.green : task.status === 'in_progress' ? COLORS.yellow : '#ddd' }}>
                <div className="flex-1">
                  <h4 className={`font-black uppercase text-[11px] italic ${task.status === 'completed' ? 'line-through opacity-40' : ''}`}>{task.title}</h4>
                  <p className="text-[8px] font-bold opacity-40">Assigned to: {task.assignedTo}</p>
                </div>
                <select
                  value={task.status}
                  onChange={e => handleStatusChange(task.id, e.target.value as 'pending' | 'in_progress' | 'completed')}
                  className="border-[2px] border-black px-2 py-1 text-[8px] font-black uppercase bg-white rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </BrutalCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ===== Organizer: Event Updates ===== */
export function EventUpdatesPage() {
  const { profile } = useAuthStore();
  const { events, fetchOrganizerEvents } = useEvents();
  const { registrations, fetchEventParticipants } = useRegistrations();
  const { createNotification } = useNotifications(profile?.uid);
  const [eventId, setEventId] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { if (profile?.uid) fetchOrganizerEvents(profile.uid); }, [profile?.uid, fetchOrganizerEvents]);

  useEffect(() => { if (eventId) fetchEventParticipants(eventId); }, [eventId, fetchEventParticipants]);

  const selectedEvent = events.find(e => e.id === eventId);

  const handleSend = async () => {
    if (!eventId || !message || !profile) return;
    setSending(true);
    // Send notification to ALL registered participants
    const promises = registrations.map(r =>
      createNotification(r.userId, `Update: ${selectedEvent?.title || 'Event'}`, message, 'update', eventId)
    );
    // Also send to organizer as confirmation
    promises.push(createNotification(profile.uid, 'Update Sent', `You sent: ${message}`, 'update', eventId));
    await Promise.all(promises);
    setSending(false);
    setSent(true);
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">Event Updates</h2>
      <BrutalCard className="p-6 space-y-5 border-b-[6px]">
        <h3 className="font-black uppercase text-sm italic">Send Update to Participants</h3>
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Select Event</label>
          <select value={eventId} onChange={e => setEventId(e.target.value)}
            className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
            <option value="">Choose event...</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title} ({e.registeredCount} registered)</option>)}
          </select>
        </div>
        {eventId && (
          <div className="bg-teal-50 border-[2px] border-teal-400 rounded-xl p-2.5">
            <p className="text-[9px] font-black uppercase italic text-teal-700">This update will be sent to {registrations.length} registered participant{registrations.length !== 1 ? 's' : ''}</p>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none" placeholder="Type your update..." />
        </div>
        {sent && <div className="bg-green-100 border-[2px] border-green-500 rounded-xl p-2 text-center"><span className="text-[10px] font-black uppercase text-green-700">✓ Update sent to {registrations.length} participant{registrations.length !== 1 ? 's' : ''}!</span></div>}
        <BrutalButton className="w-full py-3" color={COLORS.yellow} onClick={handleSend} disabled={!eventId || !message || sending}><Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Notification'}</BrutalButton>
      </BrutalCard>
    </div>
  );
}

/* ===== Organizer: Analytics (own events only) ===== */
export function OrganizerAnalytics() {
  const { profile } = useAuthStore();
  const { events, fetchOrganizerEvents } = useEvents();

  useEffect(() => {
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
  }, [profile?.uid, fetchOrganizerEvents]);

  const totalRegs = events.reduce((s, e) => s + Math.max(e.registeredCount || 0, 0), 0);
  const avgFill = events.length > 0 ? Math.round(events.reduce((s, e) => s + (Math.max(e.registeredCount || 0, 0) / Math.max(e.capacity, 1)) * 100, 0) / events.length) : 0;
  const approved = events.filter(e => e.status === 'approved').length;
  const pending = events.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">My Analytics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'My Events', value: String(events.length), color: COLORS.teal },
          { label: 'Total Registrations', value: String(totalRegs), color: COLORS.yellow },
          { label: 'Avg Fill Rate', value: `${avgFill}%`, color: COLORS.pink },
          { label: 'Approved / Pending', value: `${approved}/${pending}`, color: COLORS.lavender },
        ].map((stat, i) => (
          <BrutalCard key={i} color={stat.color} className="p-4 border-b-[5px] text-center">
            <span className="text-[7px] font-black uppercase opacity-60 tracking-wider">{stat.label}</span>
            <div className="text-3xl font-black mt-1">{stat.value}</div>
          </BrutalCard>
        ))}
      </div>

      {/* Bar chart of event registrations */}
      <BrutalCard className="space-y-3 p-5 border-b-[6px]">
        <h3 className="font-black uppercase text-sm italic">Registration per Event</h3>
        <div className="h-48 flex items-end justify-between gap-2">
          {events.length === 0 ? (
            <p className="mx-auto text-[10px] font-black uppercase italic opacity-20">No events yet</p>
          ) : (
            events.slice(0, 10).map((e) => {
              const pct = e.capacity > 0 ? Math.round((Math.max(e.registeredCount || 0, 0) / e.capacity) * 100) : 5;
              return (
                <div key={e.id} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-black border-[1px] border-white group relative hover:bg-teal-400 transition-all rounded-t-lg" style={{ height: `${Math.max(pct, 5)}%` }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded text-[7px] opacity-0 group-hover:opacity-100 transition-opacity font-bold border border-white whitespace-nowrap">{e.registeredCount}/{e.capacity}</div>
                  </div>
                  <span className="text-[6px] font-black uppercase opacity-30 truncate w-full text-center">{e.title.slice(0, 8)}</span>
                </div>
              );
            })
          )}
        </div>
      </BrutalCard>

      {/* Event Status Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BrutalCard className="p-5 border-b-[5px] space-y-3">
          <h3 className="font-black uppercase text-sm italic">Status Breakdown</h3>
          {['approved', 'pending', 'draft', 'rejected', 'completed'].map(status => {
            const count = events.filter(e => e.status === status).length;
            const pct = events.length > 0 ? Math.round((count / events.length) * 100) : 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="text-[8px] font-black uppercase w-16">{status}</span>
                <div className="flex-1 h-5 bg-slate-100 border-[1.5px] border-black rounded-lg overflow-hidden">
                  <div className="h-full transition-all rounded-lg" style={{ width: `${pct}%`, backgroundColor: status === 'approved' ? COLORS.green : status === 'pending' ? COLORS.yellow : status === 'rejected' ? COLORS.red : COLORS.teal }} />
                </div>
                <span className="text-[9px] font-black w-8 text-right">{count}</span>
              </div>
            );
          })}
        </BrutalCard>
        <BrutalCard className="p-5 border-b-[5px] space-y-3">
          <h3 className="font-black uppercase text-sm italic">Category Mix</h3>
          {['technical', 'cultural', 'sports', 'academic', 'workshop', 'competition'].map(cat => {
            const count = events.filter(e => e.category === cat).length;
            return count > 0 ? (
              <div key={cat} className="flex items-center justify-between">
                <Badge text={cat} color={cat === 'technical' ? COLORS.teal : cat === 'cultural' ? COLORS.pink : cat === 'sports' ? COLORS.yellow : COLORS.lavender} />
                <span className="text-lg font-black">{count}</span>
              </div>
            ) : null;
          })}
          {events.length === 0 && <p className="text-[10px] font-black uppercase italic opacity-30">No data</p>}
        </BrutalCard>
      </div>
    </div>
  );
}

/* ===== Admin: Platform Analytics ===== */
export function AdminAnalytics() {
  const { events, fetchAllEvents } = useEvents();
  const [userCount, setUserCount] = useState(0);
  const [usersByRole, setUsersByRole] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchAllEvents();
    queryDocs<UserProfile>('users', []).then(users => {
      setUserCount(users.length);
      const roleMap: Record<string, number> = {};
      users.forEach(u => { roleMap[u.role || 'student'] = (roleMap[u.role || 'student'] || 0) + 1; });
      setUsersByRole(roleMap);
    });
  }, [fetchAllEvents]);

  const totalRegs = events.reduce((s, e) => s + (e.registeredCount || 0), 0);
  const avgFill = events.length > 0 ? Math.round(events.reduce((s, e) => s + ((e.registeredCount || 0) / Math.max(e.capacity, 1)) * 100, 0) / events.length) : 0;
  const approved = events.filter(e => e.status === 'approved').length;
  const pending = events.filter(e => e.status === 'pending').length;
  const rejected = events.filter(e => e.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">Platform Analytics</h2>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Users', value: String(userCount), color: COLORS.teal },
          { label: 'Events', value: String(events.length), color: COLORS.yellow },
          { label: 'Registrations', value: String(totalRegs), color: COLORS.pink },
          { label: 'Avg Fill', value: `${avgFill}%`, color: COLORS.lavender },
          { label: 'Pending', value: String(pending), color: '#FCA5A5' },
        ].map((stat, i) => (
          <BrutalCard key={i} color={stat.color} className="p-4 border-b-[5px] text-center">
            <span className="text-[7px] font-black uppercase opacity-60 tracking-wider">{stat.label}</span>
            <div className="text-2xl font-black mt-1">{stat.value}</div>
          </BrutalCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <BrutalCard className="p-5 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">User Distribution</h3>
          {Object.entries(usersByRole).map(([role, count]) => {
            const pct = userCount > 0 ? Math.round((count / userCount) * 100) : 0;
            return (
              <div key={role} className="flex items-center gap-3">
                <Badge text={role} color={role === 'admin' ? COLORS.lavender : role === 'organizer' ? COLORS.teal : COLORS.yellow} />
                <div className="flex-1 h-6 bg-slate-100 border-[1.5px] border-black rounded-lg overflow-hidden">
                  <div className="h-full transition-all rounded-lg" style={{ width: `${pct}%`, backgroundColor: role === 'admin' ? COLORS.lavender : role === 'organizer' ? COLORS.teal : COLORS.yellow }} />
                </div>
                <span className="text-sm font-black">{count}</span>
              </div>
            );
          })}
        </BrutalCard>

        {/* Event Status Distribution */}
        <BrutalCard className="p-5 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">Event Status Distribution</h3>
          {[
            { status: 'Approved', count: approved, color: COLORS.green },
            { status: 'Pending', count: pending, color: COLORS.yellow },
            { status: 'Rejected', count: rejected, color: COLORS.red },
            { status: 'Draft', count: events.filter(e => e.status === 'draft').length, color: '#E2E8F0' },
            { status: 'Completed', count: events.filter(e => e.status === 'completed').length, color: COLORS.teal },
          ].map((item) => {
            const pct = events.length > 0 ? Math.round((item.count / events.length) * 100) : 0;
            return (
              <div key={item.status} className="flex items-center gap-3">
                <span className="text-[8px] font-black uppercase w-20">{item.status}</span>
                <div className="flex-1 h-5 bg-slate-100 border-[1.5px] border-black rounded-lg overflow-hidden">
                  <div className="h-full transition-all rounded-lg" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-[9px] font-black w-8 text-right">{item.count}</span>
              </div>
            );
          })}
        </BrutalCard>
      </div>

      {/* Category Breakdown + Registration Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrutalCard className="p-5 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">Events by Category</h3>
          <div className="grid grid-cols-2 gap-3">
            {['technical', 'cultural', 'sports', 'academic', 'workshop', 'seminar', 'competition', 'social'].map(cat => {
              const count = events.filter(e => e.category === cat).length;
              return (
                <div key={cat} className="flex items-center justify-between border-[2px] border-black rounded-xl p-2.5">
                  <Badge text={cat} color={cat === 'technical' ? COLORS.teal : cat === 'cultural' ? COLORS.pink : cat === 'sports' ? COLORS.yellow : COLORS.lavender} />
                  <span className="text-lg font-black">{count}</span>
                </div>
              );
            })}
          </div>
        </BrutalCard>

        <BrutalCard className="p-5 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">Top Events by Registration</h3>
          {events.sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0)).slice(0, 5).map((evt, i) => (
            <div key={evt.id} className="flex items-center gap-3">
              <span className="text-lg font-black opacity-20 italic w-6">{i + 1}</span>
              <div className="flex-1">
                <h4 className="font-black uppercase text-[10px] italic truncate">{evt.title}</h4>
                <p className="text-[7px] font-bold opacity-40">{evt.registeredCount}/{evt.capacity} registered</p>
              </div>
              <div className="w-12 h-8 bg-teal-400 border-[1.5px] border-black rounded-lg flex items-center justify-center">
                <span className="text-[10px] font-black">{evt.registeredCount}</span>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-[10px] font-black uppercase italic opacity-30">No events yet</p>}
        </BrutalCard>
      </div>
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
  const { notifications, broadcastNotification } = useNotifications(profile?.uid);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!profile || !message) return;
    setSending(true);
    await broadcastNotification(subject || 'System Notification', message, 'system');
    setSending(false);
    setSent(true);
    setMessage('');
    setSubject('');
    setTimeout(() => setSent(false), 3000);
  };

  // Show broadcast notifications from history
  const broadcastHistory = notifications.filter(n => n.type === 'system');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">System Notifications</h2>

      {/* Send form */}
      <BrutalCard className="p-6 space-y-5 border-b-[6px]">
        <h3 className="font-black uppercase text-sm italic">Broadcast to All Users</h3>
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Subject</label>
          <BrutalInput placeholder="Notification subject..." value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none" placeholder="Type your announcement..." />
        </div>
        {sent && <div className="bg-green-100 border-[2px] border-green-500 rounded-xl p-2 text-center"><span className="text-[10px] font-black uppercase text-green-700">✓ Broadcast sent to all users!</span></div>}
        <BrutalButton className="w-full py-3" color={COLORS.yellow} onClick={handleSend} disabled={!message || sending}><Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Announcement'}</BrutalButton>
      </BrutalCard>

      {/* Broadcast History */}
      <BrutalCard className="p-0 border-[2.5px] overflow-hidden">
        <div className="p-3 border-b-[2.5px] border-black bg-black text-white flex justify-between items-center">
          <h3 className="text-[11px] font-black uppercase italic tracking-widest">Broadcast History</h3>
          <Badge text={`${broadcastHistory.length} sent`} color={COLORS.teal} />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {broadcastHistory.length === 0 ? (
            <div className="p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">No announcements sent yet</p></div>
          ) : (
            broadcastHistory.map((n, i) => (
              <div key={n.id || i} className="p-3.5 border-b-[1.5px] border-black border-opacity-10 last:border-0 hover:bg-yellow-50">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-black uppercase text-[10px] italic">{n.title}</span>
                  <span className="text-[7.5px] font-black opacity-30 italic">
                    {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : 'just now'}
                  </span>
                </div>
                <p className="text-[9px] font-bold opacity-60 leading-tight">{n.message}</p>
              </div>
            ))
          )}
        </div>
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
