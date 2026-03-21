'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
import { useFeedback, analyzeSentiment } from '@/hooks/useFeedback';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useTasks } from '@/hooks/useTasks';
import { useCertificates } from '@/hooks/useCertificates';
import { useSettings } from '@/hooks/useSettings';
import { useCloudinary } from '@/hooks/useCloudinary';
import { updateDocument, deleteDocument, queryDocs, addDocument, where, orderBy } from '@/lib/firestore';
import type { UserProfile, CampusEvent, Registration, Notification as NotifType, Venue, Certificate, CertificateTemplate } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { Bell, Mail, Info, LogIn, Award, MessageSquare, CheckSquare, User, FileText, Users, CheckCircle, BarChart2, MapPin, Settings, Database, Activity, Send, Calendar, Search, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { renderCertificateDataUrl } from '@/lib/certificateRenderer';

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
  const [tab, setTab] = useState('confirmed');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [optimisticCancelled, setOptimisticCancelled] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (profile?.uid) fetchUserRegistrations(profile.uid);
  }, [profile?.uid, fetchUserRegistrations]);

  const handleCancel = async (regId: string, eventId: string) => {
    if (cancellingId) return;
    setCancellingId(regId);
    // Optimistic: immediately mark as cancelled in UI
    setOptimisticCancelled(prev => new Set(prev).add(regId));
    setCancellingId(null);
    // Fire-and-forget the actual Firestore cancel + refresh
    cancelRegistration(regId, eventId, profile?.uid).then(result => {
      if (result?.error) {
        console.warn('Cancel failed:', result.error);
        // Revert optimistic update on failure
        setOptimisticCancelled(prev => { const next = new Set(prev); next.delete(regId); return next; });
      }
      if (profile?.uid) fetchUserRegistrations(profile.uid);
    });
  };

  // Merge Firestore data with optimistic cancellations
  const effectiveRegistrations = registrations.map(r =>
    optimisticCancelled.has(r.id) ? { ...r, status: 'cancelled' as const } : r
  );

  const filtered = tab === 'all' ? effectiveRegistrations : effectiveRegistrations.filter(r => r.status === tab);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">My Registrations</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['all', 'confirmed', 'waitlisted', 'cancelled', 'attended'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${tab === t ? 'bg-yellow-400' : 'bg-white'}`}>
            {t} ({(t === 'all' ? effectiveRegistrations : effectiveRegistrations.filter(r => r.status === t)).length})
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
                  {reg.registrationTime?.toDate ? reg.registrationTime.toDate().toLocaleDateString() : ''}
                  {reg.registrationId ? ` • ${reg.registrationId}` : ` • ${reg.id?.slice(0, 8)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge text={reg.status} color={reg.status === 'confirmed' ? COLORS.green : reg.status === 'waitlisted' ? COLORS.yellow : reg.status === 'cancelled' ? COLORS.red : COLORS.teal} />
                {reg.attendanceStatus && reg.attendanceStatus !== 'pending' && (
                  <Badge text={reg.attendanceStatus} color={reg.attendanceStatus === 'present' ? COLORS.green : '#e5e7eb'} />
                )}
                {reg.status === 'confirmed' && reg.attendanceStatus !== 'present' && (
                  <BrutalButton
                    color={COLORS.red}
                    className="px-3 py-1 text-[8px]"
                    disabled={cancellingId === reg.id}
                    onClick={() => handleCancel(reg.id, reg.eventId)}
                  >
                    {cancellingId === reg.id ? 'Cancelling…' : 'Cancel'}
                  </BrutalButton>
                )}
              </div>
            </BrutalCard>
          ))
        )}
      </div>
    </div>
  );
}

/* ===== Certificates: Organizer & Student ===== */
export function CertificatesPage() {
  const { profile, role } = useAuthStore();
  const { certificates, templates, loading, fetchUserCertificates, fetchEventCertificates, fetchTemplates, bulkGenerate, requestReplacement, revokeCertificate } = useCertificates();
  const { events, fetchOrganizerEvents } = useEvents();
  const { registrations, fetchEventParticipants } = useRegistrations();
  
  // Organizer state
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<{ generated: number; skipped: number } | null>(null);
  const [fixing, setFixing] = useState(false);
  
  // Customizations
  const { uploadImage } = useCloudinary();
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [sigText, setSigText] = useState('');
  
  // Preview
  const [previewUrl, setPreviewUrl] = useState('');

  // Notifications
  const { createNotification } = useNotifications(profile?.uid);

  useEffect(() => {
    if (profile?.uid) {
      if (role === 'student' || role === 'public') {
        fetchUserCertificates(profile.uid);
      } else if (role === 'organizer') {
        fetchOrganizerEvents(profile.uid);
        fetchTemplates();
      } else {
        fetchTemplates(); // Admins might want to see them
      }
    }
  }, [profile?.uid, role, fetchUserCertificates, fetchOrganizerEvents, fetchTemplates]);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventParticipants(selectedEvent);
      fetchEventCertificates(selectedEvent);
    }
  }, [selectedEvent, fetchEventParticipants, fetchEventCertificates]);

  // Live preview for Organizer
  useEffect(() => {
    if (role === 'organizer' && selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      const evt = events.find(e => e.id === selectedEvent);
      if (!template) return;

      const renderPreview = async () => {
        try {
          const mockCert: Partial<Certificate> = {
            userName: 'Participant Name',
            eventTitle: evt?.title || 'Selected Event',
            type: 'participation',
            verificationCode: 'SAMPLE-1234'
          };
          
          let logoUrlsToUse = undefined;
          if (logoFiles.length > 0) {
             logoUrlsToUse = logoFiles.map(f => URL.createObjectURL(f));
          }
          
          let bgToUse = undefined;
          if (bgFile) bgToUse = URL.createObjectURL(bgFile);
          
          let sigToUse = undefined;
          if (sigFile) sigToUse = URL.createObjectURL(sigFile);

          const url = await renderCertificateDataUrl(mockCert, template, {
            logoUrls: logoUrlsToUse,
            backgroundImageUrl: bgToUse,
            signatureImageUrl: sigToUse,
            signatureText: sigText || template.signatureText
          });
          setPreviewUrl(url);
        } catch (e) {
          console.error("Preview render failed:", e);
        }
      };
      
      const timer = setTimeout(renderPreview, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedTemplate, selectedEvent, logoFiles, bgFile, sigFile, sigText, templates, events, role]);

  const downloadCert = async (cert: Certificate) => {
    // Determine template (fallback to classic hardcoded generation if old data)
    let template = templates.find(t => t.id === cert.templateId);
    
    if (!template && cert.templateId) {
       // if not in current state, fetch it
       const fetchedData = await fetchTemplates();
       template = fetchedData.find(t => t.id === cert.templateId);
    }

    if (template) {
      // Use new generator
      const { downloadCertificate } = await import('@/lib/certificateRenderer');
      await downloadCertificate(cert, template, {
        logoUrl: cert.logoUrl,
        signatureImageUrl: cert.signatureImageUrl,
        signatureText: cert.signatureText
      });
    } else {
      // Fallback for v1 certificates
      const canvas = document.createElement('canvas');
      canvas.width = 1200; canvas.height = 850;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#FFFBEB'; ctx.fillRect(0, 0, 1200, 850);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.strokeRect(30, 30, 1140, 790);
      ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 3; ctx.strokeRect(45, 45, 1110, 760);
      ctx.fillStyle = '#000'; ctx.font = 'bold 48px monospace'; ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF', 600, 150);
      ctx.font = 'bold italic 56px monospace';
      ctx.fillText(cert.type.toUpperCase(), 600, 220);
      ctx.fillStyle = '#FACC15'; ctx.fillRect(350, 250, 500, 4);
      ctx.fillStyle = '#000'; ctx.font = '22px monospace'; ctx.fillText('This is to certify that', 600, 320);
      ctx.font = 'bold 40px monospace'; ctx.fillText(cert.userName, 600, 390);
      ctx.font = '22px monospace'; ctx.fillText('has successfully participated in', 600, 450);
      ctx.font = 'bold 32px monospace'; ctx.fillText(cert.eventTitle, 600, 520);
      ctx.font = '18px monospace'; ctx.fillStyle = '#666';
      const dateStr = cert.issueDate?.toDate ? cert.issueDate.toDate().toLocaleDateString() : new Date().toLocaleDateString();
      ctx.fillText(`Date: ${dateStr}`, 600, 620);
      ctx.fillText(`Verification: ${cert.verificationCode}`, 600, 660);
      ctx.fillStyle = '#000'; ctx.font = 'bold 28px monospace'; ctx.fillText('SHARP — Campus Events', 600, 750);
      const link = document.createElement('a');
      link.download = `certificate_${cert.verificationCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleBulkGenerate = async () => {
    if (!selectedEvent || !selectedTemplate) return;
    const evt = events.find(e => e.id === selectedEvent);
    if (!evt) return;
    
    setGenerating(true);
    setGenResult(null);

    let finalLogoUrls: string[] | undefined = undefined;
    let finalBg: string | undefined = undefined;
    let finalSig: string | undefined = undefined;

    try {
      if (logoFiles.length > 0) {
        finalLogoUrls = [];
        for (const file of logoFiles) {
          const url = await uploadImage(file);
          if (url) finalLogoUrls.push(url);
        }
      }
      if (bgFile) finalBg = await uploadImage(bgFile);
      if (sigFile) finalSig = await uploadImage(sigFile);
    } catch (e) {
      console.error("Upload failed", e);
      alert("Failed to upload custom graphics.");
      setGenerating(false);
      return;
    }

    const present = registrations.filter(r => r.attendanceStatus === 'present');
    const parts = present.map(r => ({ 
      userId: r.userId, 
      userName: r.userName, 
      department: r.userDepartment, 
      year: r.userYear 
    }));

    const res = await bulkGenerate(
      evt.id,
      evt.title,
      parts,
      'participation',
      selectedTemplate,
      { logoUrls: finalLogoUrls?.length ? finalLogoUrls : undefined, backgroundImageUrl: finalBg, signatureImageUrl: finalSig, signatureText: sigText }
    );
    
    // Auto-distribute: Send notification to all users who got a newly generated certificate
    if (res.generated > 0) {
      const generatedUsers = present.slice(0, res.generated); // Simplification: assume first N were generated
      for (const u of generatedUsers) {
         await createNotification(u.userId, 'Certificate Ready', `Your participation certificate for ${evt.title} is ready to download!`, 'certificate', evt.id);
      }
    }

    setGenerating(false);
    setGenResult(res);
    setTimeout(() => setGenResult(null), 8000);
    
    fetchEventCertificates(evt.id);
  };

  const handleFixAttendance = async () => {
    if (!selectedEvent) return;
    setFixing(true);
    const presentCount = registrations.filter(r => r.attendanceStatus === 'present').length;
    await updateDocument('events', selectedEvent, { attendanceCount: presentCount });
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
    setFixing(false);
  };

  const handleRequestReplacement = async (certId: string) => {
    if (confirm("Request a custom reprint/replacement for this certificate? The organizer will be notified.")) {
      await requestReplacement(certId);
      if (profile?.uid) fetchUserCertificates(profile.uid);
    }
  };

  const handleRevoke = async (certId: string) => {
    if (confirm("Revoke & discard this certificate? The student's current version will instantly become invalid, allowing you to generate a new copy with updated details.")) {
      await revokeCertificate(certId);
      if (selectedEvent) fetchEventCertificates(selectedEvent);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">Certificates</h2>

      {/* Organizer: Generate Certificates */}
      {role === 'organizer' && (
        <BrutalCard color={COLORS.yellow} className="p-5 border-b-[5px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">Issue Certificates</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] opacity-50">1. Select Event</label>
              <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
                className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
                <option value="">Choose event...</option>
                {events.filter(e => e.status === 'approved' || e.status === 'completed').map(e => <option key={e.id} value={e.id}>{e.title} ({e.attendanceCount || 0} attended)</option>)}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] opacity-50">2. Select Template</label>
              <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} disabled={!selectedEvent}
                className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic disabled:opacity-50">
                <option value="">Choose template...</option>
                {templates.filter(t => t.isActive).map(t => <option key={t.id} value={t.id}>{t.name} ({t.eventType})</option>)}
              </select>
            </div>
          </div>

          {selectedEvent && selectedTemplate && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t-[2.5px] border-black border-opacity-20">
              
              {/* Customizations */}
              <div className="space-y-3 lg:col-span-1">
                <h4 className="font-black uppercase text-[10px] italic">3. Customizations (Optional)</h4>
                
                <div className="space-y-1.5">
                  <label className="font-black uppercase text-[8px] opacity-70">Override Logos (Select one or more) • Max 5MB</label>
                  <input type="file" multiple accept="image/*" onChange={e => {
                    const newFiles = e.target.files ? Array.from(e.target.files) : [];
                    setLogoFiles(prev => [...prev, ...newFiles]);
                    e.target.value = ''; // Reset input to allow re-selecting same file
                  }} className="w-full text-[9px] font-bold bg-white border-[2px] border-black p-1 rounded-lg" />
                  {logoFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {logoFiles.map((f, i) => (
                        <span key={i} className="text-[7px] font-bold bg-yellow-200 border border-black px-1.5 py-0.5 rounded flex items-center gap-1 group">
                          {f.name}
                          <button onClick={() => setLogoFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500 font-black">×</button>
                        </span>
                      ))}
                      <button onClick={() => setLogoFiles([])} className="text-[7px] font-black uppercase underline ml-1 opacity-40 hover:opacity-100 transition-opacity">Clear All</button>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="font-black uppercase text-[8px] opacity-70">Override Background • Max 5MB</label>
                  <input type="file" accept="image/*" onChange={e => setBgFile(e.target.files?.[0] || null)} className="w-full text-[9px] font-bold bg-white border-[2px] border-black p-1 rounded-lg" />
                </div>
                
                <div className="space-y-1">
                  <label className="font-black uppercase text-[8px] opacity-50">Override Signature Image • Max 5MB</label>
                  <input type="file" accept="image/*" onChange={e => setSigFile(e.target.files?.[0] || null)} className="w-full text-[9px] font-bold bg-white border-[2px] border-black p-1 rounded-lg" />
                </div>

                <div className="space-y-1">
                  <label className="font-black uppercase text-[8px] opacity-50">Override Signature Name</label>
                  <BrutalInput value={sigText} onChange={e => setSigText(e.target.value)} placeholder="e.g. Dr. John Smith" className="text-xs py-1.5" />
                </div>

                <div className="pt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-tight">{registrations.filter(r => r.attendanceStatus === 'present').length} eligible attendees</span>
                  </div>
                  <p className="text-[7px] font-bold text-red-600 mt-1 uppercase italic">* Duplicate prevention is active. Only new unique attendees will receive certificates.</p>
                </div>

                <BrutalButton color={COLORS.teal} className="w-full py-3 mt-2" onClick={handleBulkGenerate} disabled={generating || registrations.filter(r => r.attendanceStatus === 'present').length === 0}>
                  {generating ? 'Generating & Distributing...' : 'Generate & Send All'}
                </BrutalButton>

                {genResult && (
                  <div className={`p-3 border-[2.5px] border-black rounded-xl font-black text-[9px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${genResult.generated > 0 ? 'bg-green-300' : 'bg-yellow-100'}`}>
                    <CheckCircle className="w-4 h-4 mb-1 inline-block mr-1" />
                    Issued: {genResult.generated} <br/>
                    Skipped (Duplicates): {genResult.skipped}
                  </div>
                )}
                
                <BrutalButton color="white" className="w-full text-[8px] py-1 border-[2px]" onClick={handleFixAttendance} disabled={fixing}>
                  {fixing ? 'Syncing...' : 'Sync Attendance Count'}
                </BrutalButton>
              </div>

              {/* Live Preview */}
              <div className="lg:col-span-2 space-y-2">
                <h4 className="font-black uppercase text-[10px] italic">Preview</h4>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl bg-white" />
                ) : (
                  <div className="w-full aspect-[1.41] border-[4px] border-black border-dashed flex items-center justify-center bg-white opacity-50 rounded-xl">
                    <span className="font-black italic uppercase text-xs">Loading Preview...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </BrutalCard>
      )}

      {/* Certificate List (Issued) */}
      {loading ? (
        <BrutalCard className="p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">Loading certificates...</p></BrutalCard>
      ) : certificates.length === 0 ? (
        <BrutalCard className="p-8 text-center space-y-3">
          <Award className="w-12 h-12 mx-auto opacity-20" />
          <p className="text-[11px] font-black uppercase italic opacity-40">No certificates found</p>
          <p className="text-[9px] font-bold opacity-30">Attend events to earn certificates.</p>
        </BrutalCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <BrutalCard key={cert.id} className="p-5 border-b-[5px] space-y-2 flex flex-col">
              <div className="flex justify-between items-start">
                <Badge text={cert.type} color={cert.type === 'participation' ? COLORS.teal : cert.type === 'winner' ? COLORS.yellow : COLORS.pink} />
                <span className="text-[7.5px] font-black uppercase opacity-30">{cert.issueDate?.toDate ? cert.issueDate.toDate().toLocaleDateString() : ''}</span>
              </div>
              <h4 className="font-black uppercase text-[12px] italic leading-tight flex-1">{cert.eventTitle}</h4>
              
              {role === 'organizer' && (
                <p className="text-[10px] font-bold mt-1">
                  Owner: <span className="font-black uppercase">{cert.userName}</span>
                </p>
              )}
              
              <p className="text-[8px] font-bold opacity-40 font-mono tracking-tighter">ID: {cert.verificationCode}</p>
              
              {cert.status === 'replacement_requested' && (
                <div className="bg-red-100 border-[2px] border-red-500 text-red-700 text-[8px] p-2 font-bold uppercase rounded-lg">
                  Replacement Requested
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-auto pt-3">
                <BrutalButton color={COLORS.yellow} className="text-[9px] py-1.5 col-span-2" onClick={() => downloadCert(cert)}>
                  <FileText className="w-3.5 h-3.5" /> Download
                </BrutalButton>
                {role === 'student' && cert.status !== 'replacement_requested' && (
                  <BrutalButton color="white" className="text-[8px] py-1 col-span-2 border-[2px]" onClick={() => handleRequestReplacement(cert.id)}>
                    Request Reprint
                  </BrutalButton>
                )}
                {role === 'organizer' && cert.status === 'replacement_requested' && (
                  <BrutalButton color={COLORS.red} className="text-[8px] py-1 col-span-2 opacity-90" onClick={() => handleRevoke(cert.id)}>
                    <Trash2 className="w-3 h-3" /> Revoke & Discard Request
                  </BrutalButton>
                )}
              </div>
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
  const { registrations: userRegs, fetchUserRegistrations } = useRegistrations();
  const { submitFeedback } = useFeedback();
  const { createNotification } = useNotifications(profile?.uid);
  const [eventId, setEventId] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPublicEvents();
    if (profile?.uid) fetchUserRegistrations(profile.uid);
  }, [fetchPublicEvents, fetchUserRegistrations, profile?.uid]);

  // Derive attended events
  const attendedEvents = useMemo(() => {
    const attendedIds = new Set(
      userRegs
        .filter(r => r.status === 'confirmed' && r.attendanceStatus === 'present' && !r.feedbackSubmitted)
        .map(r => r.eventId)
    );
    return events.filter(e => attendedIds.has(e.id));
  }, [events, userRegs]);

  const handleSubmit = async () => {
    if (!profile || !eventId) return;
    setSubmitting(true);
    const ratingsObj = {
      content: ratings['Content Quality'] || 0,
      organization: ratings['Organization'] || 0,
      venue: ratings['Venue & Facilities'] || 0,
      speaker: ratings['Speaker/Facilitator'] || 0,
      overall: ratings['Overall'] || 0,
    };
    const result = await submitFeedback(eventId, anonymous ? null : profile.uid, ratingsObj, comment, anonymous);
    setSubmitting(false);
    
    if (result.error) {
      console.error('[Feedback error]', result.error);
      await createNotification(profile.uid, 'Feedback Failed', result.error, 'system', eventId);
      return;
    }
    
    setSubmitted(true);
    if (profile?.uid) fetchUserRegistrations(profile.uid); // refresh local feedbackSubmitted state
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
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Select Attended Event</label>
          {attendedEvents.length === 0 ? (
            <div className="border-[2.5px] border-black p-3 bg-slate-50 text-[10px] font-bold opacity-50 rounded-xl italic">
              No eligible events found. You must attend an event before leaving feedback.
            </div>
          ) : (
            <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
              <option value="">Choose an attended event...</option>
              {attendedEvents.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          )}
        </div>
        {['Content Quality', 'Organization', 'Venue & Facilities', 'Speaker/Facilitator', 'Overall'].map((dim) => (
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
        <BrutalButton className="w-full py-3" color={COLORS.yellow} onClick={handleSubmit} disabled={!eventId || submitting}>
          <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Feedback'}
        </BrutalButton>
      </BrutalCard>
    </div>
  );
}

/* ===== Student: Notifications ===== */
export function NotificationsPage() {
  const { profile, role } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead } = useNotifications(profile?.uid);

  const displayNotifs = role === 'admin' 
    ? notifications.filter(n => !(n.userId || '').startsWith('broadcast')) 
    : notifications;

  const markDisplayedAsRead = async () => {
    const unread = displayNotifs.filter(n => !n.read);
    await Promise.all(unread.map(n => markAsRead(n.id)));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Notifications</h2>
        {displayNotifs.some(n => !n.read) && (
          <BrutalButton color={COLORS.teal} className="text-[8px] px-3 py-1" onClick={markDisplayedAsRead}>Mark All Read</BrutalButton>
        )}
      </div>
      <div className="border-[2.5px] border-black bg-white rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        {displayNotifs.length === 0 ? (
          <div className="p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">No notifications yet</p></div>
        ) : (
          displayNotifs.map((notif) => (
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
  const { profile, role, setProfile } = useAuthStore();
  const [name, setName] = useState(profile?.name || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [year, setYear] = useState<number | null>(profile?.year ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newRole, setNewRole] = useState(role || 'student');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDepartment(profile.department || '');
      setYear(profile.year ?? null);
      setNewRole(profile.role || 'student');
    }
  }, [profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.uid) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB');
      return;
    }
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Using Cloudinary instead of Firebase Storage as requested
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'sharp_unsigned');
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxh9eys8x'; // Using default or env
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Cloudinary upload failed');
      const data = await response.json();
      const downloadURL = data.secure_url;
      
      await updateDocument('users', profile.uid, { photoURL: downloadURL });
      // Update local auth store so topbar avatar refreshes
      setProfile({ ...profile, photoURL: downloadURL });
    } catch (err) {
      console.error('Photo upload failed:', err);
      setPhotoPreview(null);
      alert('Failed to upload photo to Cloudinary. Please try again.');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!profile?.uid) return;
    setSaving(true);
    await updateDocument('users', profile.uid, { name, department, year });
    // Update local auth store
    setProfile({ ...profile, name, department, year });
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
    setTimeout(() => window.location.reload(), 1000);
  };

  const displayPhoto = photoPreview || profile?.photoURL;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-lavender underline-offset-4">Profile</h2>

      {/* Profile Info */}
      <BrutalCard className="p-6 border-b-[6px]">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Clickable avatar for photo upload */}
          <div className="relative group">
            <div className="w-24 h-24 border-[3px] border-black rounded-2xl overflow-hidden bg-pink-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              {displayPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayPhoto} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black">{(profile?.name || 'U')[0].toUpperCase()}</span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xl">📷</span>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-[9px] font-black uppercase animate-pulse">Uploading...</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <p className="text-[7px] font-black uppercase opacity-30 text-center mt-1">Click to change • Max 5MB</p>
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
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Current Year</label>
                <select
                  value={year ?? ''}
                  onChange={e => setYear(e.target.value ? Number(e.target.value) : null)}
                  className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic"
                >
                  <option value="">Select year...</option>
                  {[1, 2, 3, 4, 5, 6].map(y => (
                    <option key={y} value={y}>{y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : `${y}th`} Year</option>
                  ))}
                </select>
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
  const { events, fetchOrganizerEvents, deleteEvent, updateEvent } = useEvents();
  const { venues, fetchVenues } = useVenues();
  const { uploadImage, uploading, progress: uploadProgress } = useCloudinary();
  const { logActivity } = useActivityLogs();
  
  const [tab, setTab] = useState('all');
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [editForm, setEditForm] = useState<Partial<CampusEvent>>({});
  const [editError, setEditError] = useState<string | null>(null);
  
  // Date/Time States
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [regDeadline, setRegDeadline] = useState('');
  
  // Poster State
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState('');
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  useEffect(() => {
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
  }, [profile?.uid, fetchOrganizerEvents]);

  const handleOutcome = async (eventId: string, outcome: 'success' | 'failed') => {
    await updateDocument('events', eventId, { outcomeStatus: outcome, status: 'completed' });
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
  };

  const handleDelete = async (evt: CampusEvent) => {
    if (confirm(`Are you sure you want to completely delete "${evt.title}"?\nThis action cannot be undone.`)) {
      await deleteEvent(evt.id);
      if (profile) await logActivity(profile.uid, profile.name, 'organizer', 'delete_event', evt.id, 'event', evt.title);
      if (profile?.uid) fetchOrganizerEvents(profile.uid);
    }
  };

  const handleEditSave = async () => {
    if (!editingEvent || !profile) return;
    setSaving(true);
    
    let venueName = editingEvent.venueName;
    if (editForm.venueId && editForm.venueId !== editingEvent.venueId) {
      const v = venues.find(x => x.id === editForm.venueId);
      if (v) venueName = v.name;
    }

    let finalPosterUrl = editingEvent.posterUrl;
    if (posterFile) {
      try { finalPosterUrl = await uploadImage(posterFile); }
      catch { finalPosterUrl = posterPreview; }
    }

    const startTs = Timestamp.fromDate(new Date(`${date}T${startTime || '09:00'}`));
    const endTs = Timestamp.fromDate(new Date(`${date}T${endTime || '17:00'}`));

    const payload: Partial<CampusEvent> = { 
      ...editForm, 
      ...(editForm.venueId ? { venueName } : {}),
      startTime: startTs,
      endTime: endTs,
      posterUrl: finalPosterUrl,
    };
    
    if (regDeadline) {
      payload.registrationDeadline = Timestamp.fromDate(new Date(`${regDeadline}T23:59`));
    }

    try {
      await updateEvent(editingEvent.id, payload);
      await logActivity(profile.uid, profile.name, 'organizer', 'update_event', editingEvent.id, 'event', editForm.title || editingEvent.title);
      
      setEditingEvent(null);
      setEditForm({});
      setSaving(false);
      setEditError(null);
      fetchOrganizerEvents(profile.uid);
    } catch (error: any) {
      setSaving(false);
      if (error.message === "Venue already booked for this time slot") {
        setEditError("❌ This venue is already booked for the selected time.");
      } else {
        setEditError(error.message || "Failed to update event");
      }
    }
  };

  const handlePosterSelect = (file: File) => {
    setPosterFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPosterPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const openEdit = (evt: CampusEvent) => {
    setEditingEvent(evt);
    setEditError(null);
    setEditForm({
      title: evt.title,
      description: evt.description,
      capacity: evt.capacity,
      venueId: evt.venueId,
      eventType: evt.eventType || 'PHYSICAL',
      category: evt.category,
      department: evt.department,
      targetAudience: evt.targetAudience,
      expectedAttendance: evt.expectedAttendance,
      budget: evt.budget,
      coOrganizers: evt.coOrganizers,
    });
    
    if (evt.startTime?.toDate) {
      const startD = evt.startTime.toDate();
      setDate(`${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`);
      setStartTime(`${String(startD.getHours()).padStart(2, '0')}:${String(startD.getMinutes()).padStart(2, '0')}`);
    } else { setDate(''); setStartTime(''); }

    if (evt.endTime?.toDate) {
      const endD = evt.endTime.toDate();
      setEndTime(`${String(endD.getHours()).padStart(2, '0')}:${String(endD.getMinutes()).padStart(2, '0')}`);
    } else { setEndTime(''); }

    if (evt.registrationDeadline?.toDate) {
      const dD = evt.registrationDeadline.toDate();
      setRegDeadline(`${dD.getFullYear()}-${String(dD.getMonth() + 1).padStart(2, '0')}-${String(dD.getDate()).padStart(2, '0')}`);
    } else { setRegDeadline(''); }

    setPosterFile(null);
    setPosterPreview(evt.posterUrl || '');
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
                {evt.posterUrl ? (
                  <div className="w-16 h-16 border-[2px] border-black rounded-lg shrink-0 overflow-hidden">
                    <img src={evt.posterUrl} alt={evt.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-slate-200 border-[2px] border-black rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                    <span className="text-2xl font-black opacity-10">{evt.category[0].toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge text={evt.category} color={COLORS.teal} />
                    <Badge text={evt.status} color={evt.status === 'approved' ? COLORS.green : evt.status === 'pending' ? COLORS.yellow : '#fff'} />
                    {evt.outcomeStatus && (
                      <Badge text={evt.outcomeStatus} color={evt.outcomeStatus === 'success' ? COLORS.green : COLORS.red} />
                    )}
                  </div>
                  <h4 className="font-black uppercase text-[12px] italic">{evt.title}</h4>
                  <p className="text-[8px] font-bold opacity-40 uppercase truncate max-w-[200px]">{evt.venueName} • {Math.max(evt.registeredCount || 0, 0)}/{evt.capacity} registered</p>
                </div>
              </div>
              <div className="flex gap-2">
                <BrutalButton color={COLORS.yellow} className="px-3 py-1 text-[9px]" onClick={() => openEdit(evt)}>Edit</BrutalButton>
                <BrutalButton color={COLORS.red} className="px-3 py-1 text-[9px]" onClick={() => handleDelete(evt)}>Delete</BrutalButton>
                
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

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <BrutalCard className="w-full max-w-2xl max-h-[90vh] flex flex-col p-0 border-[4px] bg-[#FFFBEB]">
            <div className="p-5 border-b-[4px] border-black flex justify-between items-center bg-yellow-400">
              <h3 className="font-black uppercase italic text-xl">Edit Event</h3>
              <button onClick={() => setEditingEvent(null)} className="font-black text-xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              {editError && (
                <div className="border-[2.5px] border-red-600 rounded-xl p-4 bg-red-100 space-y-2 mb-4">
                  <p className="text-[12px] font-black uppercase italic text-red-700">{editError}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Title</label>
                <BrutalInput value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} />
              </div>
              
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Event Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="PHYSICAL" checked={editForm.eventType === 'PHYSICAL' || !editForm.eventType} onChange={() => setEditForm({...editForm, eventType: 'PHYSICAL'})} className="accent-yellow-400 w-4 h-4" />
                    <span className="font-black text-sm">PHYSICAL</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="ONLINE" checked={editForm.eventType === 'ONLINE'} onChange={() => { setEditForm({...editForm, eventType: 'ONLINE', venueId: ''}); }} className="accent-yellow-400 w-4 h-4" />
                    <span className="font-black text-sm">ONLINE</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Category</label>
                  <select value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value as any})}
                    className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
                    <option value="technical">Technical Workshop</option>
                    <option value="cultural">Cultural Festival</option>
                    <option value="sports">Sports</option>
                    <option value="academic">Academic</option>
                    <option value="competition">Competition</option>
                    <option value="social">Social</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                  </select>
                </div>
                <div className={`space-y-1.5 ${editForm.eventType === 'ONLINE' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Venue {editForm.eventType === 'ONLINE' && '(Not required)'}</label>
                  <select value={editForm.venueId || ''} onChange={e => setEditForm({...editForm, venueId: e.target.value})} disabled={editForm.eventType === 'ONLINE'}
                    className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
                    <option value="">Select Venue...</option>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Capacity</label>
                  <BrutalInput type="number" value={editForm.capacity || ''} onChange={e => setEditForm({...editForm, capacity: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Expected Attendance</label>
                  <BrutalInput type="number" value={editForm.expectedAttendance || ''} onChange={e => setEditForm({...editForm, expectedAttendance: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Department</label>
                <BrutalInput value={editForm.department || ''} onChange={e => setEditForm({...editForm, department: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Description</label>
                <textarea 
                  value={editForm.description || ''} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Date</label>
                  <BrutalInput type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Registration Deadline</label>
                  <BrutalInput type="date" value={regDeadline} onChange={e => setRegDeadline(e.target.value)} />
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

              <div className="space-y-2">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Update Poster (Optional)</label>
                <div
                  className={`border-[2.5px] border-dashed border-black rounded-xl p-4 text-center cursor-pointer transition-colors ${posterPreview ? 'bg-green-50' : 'hover:bg-yellow-50'}`}
                  onClick={() => document.getElementById('edit-poster-input')?.click()}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handlePosterSelect(f); }}
                >
                  {posterPreview ? (
                    <div className="space-y-2">
                      <img src={posterPreview} alt="Poster preview" className="max-h-32 mx-auto rounded-lg border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
                      <p className="text-[9px] font-black uppercase opacity-40">Click or drag to replace</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="w-8 h-8 border-[2px] border-black rounded-lg bg-yellow-400 mx-auto flex items-center justify-center text-sm">📷</div>
                      <p className="text-[10px] font-black uppercase italic">Drop poster here or click to browse</p>
                      <p className="text-[8px] font-bold opacity-30">Max file size: 10MB</p>
                    </div>
                  )}
                </div>
                <input id="edit-poster-input" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePosterSelect(f); }} />
                {uploading && (
                  <div className="w-full bg-slate-200 border-[2px] border-black rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-yellow-400 transition-all font-black text-[7px] flex items-center justify-center" style={{ width: `${uploadProgress}%` }}>
                      {uploadProgress}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t-[4px] border-black bg-white flex justify-end gap-3">
              <BrutalButton color={COLORS.pink} onClick={() => setEditingEvent(null)}>Cancel</BrutalButton>
              <BrutalButton color={COLORS.green} onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</BrutalButton>
            </div>
          </BrutalCard>
        </div>
      )}
    </div>
  );
}

/* ===== Organizer: Feedback & Insights ===== */
export function OrganizerFeedbackPage() {
  const { profile } = useAuthStore();
  const { events, fetchOrganizerEvents } = useEvents();
  const { fetchEventFeedback, feedbackList, loading } = useFeedback();
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
  }, [profile?.uid, fetchOrganizerEvents]);

  useEffect(() => {
    if (selectedEvent) fetchEventFeedback(selectedEvent);
  }, [selectedEvent, fetchEventFeedback]);

  const feedbackCount = feedbackList.length;
  let avgOverall = 0;
  let pos = 0, neu = 0, neg = 0;
  
  const dimAvgs = { content: 0, organization: 0, venue: 0, speaker: 0 };
  const wordFreq: Record<string, number> = {};

  if (feedbackCount > 0) {
    avgOverall = feedbackList.reduce((sum, f) => sum + (f.ratings?.overall || 0), 0) / feedbackCount;
    feedbackList.forEach(f => {
      ['content', 'organization', 'venue', 'speaker'].forEach(d => {
        dimAvgs[d as keyof typeof dimAvgs] += (f.ratings as any)?.[d] || 0;
      });
      
      const sentiment = analyzeSentiment(f.comment);
      if (sentiment === 'positive') pos++;
      else if (sentiment === 'negative') neg++;
      else neu++;

      // Basic word extraction
      if (f.comment) {
        const words = f.comment.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
        const stopWords = new Set(['the', 'and', 'is', 'a', 'to', 'of', 'in', 'it', 'for', 'was', 'on', 'that', 'this', 'but', 'are', 'with', 'as', 'at']);
        words.forEach(w => {
          if (w.length > 3 && !stopWords.has(w)) wordFreq[w] = (wordFreq[w] || 0) + 1;
        });
      }
    });

    Object.keys(dimAvgs).forEach(k => dimAvgs[k as keyof typeof dimAvgs] /= feedbackCount);
  }

  const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  
  // Actionable Insights Logic
  const insights = [];
  if (feedbackCount >= 2) { // lowered to 2 for easier testing
    if (dimAvgs.venue < 3.5) insights.push('⚠️ Venue ratings are low. Consider booking a different facility next time.');
    if (dimAvgs.organization < 3.5) insights.push('⚠️ Organization score is low. Try creating more detailed volunteer task lists.');
    if (dimAvgs.content < 3.5) insights.push('⚠️ Content quality rated poorly. Ensure the event topics align with expectations.');
    if (dimAvgs.speaker > 4.5 && avgOverall >= 4.0) insights.push('💡 Excellent speaker performance! Consider inviting them back.');
    if (pos > neg * 2) insights.push('🌟 Overwhelmingly positive sentiment! This format is highly successful.');
    
    if (insights.length === 0) insights.push('👍 Solid performance across all dimensions. Keep it up!');
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">Feedback & Insights</h2>
      
      <div className="space-y-1.5">
        <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Select Managed Event</label>
        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
          className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
          <option value="">Choose event...</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </div>

      {selectedEvent && (
        <>
          {feedbackCount === 0 ? (
            <BrutalCard className="p-8 text-center text-slate-400 font-bold italic">No feedback received for this event yet.</BrutalCard>
          ) : (
            <div className="space-y-6">
              {/* Top Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <BrutalCard color={COLORS.teal} className="p-4 text-center">
                  <span className="text-[8px] font-black uppercase opacity-60">Avg Overall</span>
                  <div className="text-3xl font-black mt-1">{avgOverall.toFixed(1)}</div>
                </BrutalCard>
                <BrutalCard color={COLORS.yellow} className="p-4 text-center">
                  <span className="text-[8px] font-black uppercase opacity-60">Responses</span>
                  <div className="text-3xl font-black mt-1">{feedbackCount}</div>
                </BrutalCard>
                <BrutalCard className="p-4 text-center col-span-2">
                   <span className="text-[8px] font-black uppercase opacity-60">Sentiment Overview</span>
                   <div className="flex justify-around items-center mt-2">
                     <div className="text-center"><span className="text-sm font-black text-green-600">{pos}</span><br/><span className="text-[7px] uppercase font-black opacity-50">Positive</span></div>
                     <div className="text-center"><span className="text-sm font-black text-slate-500">{neu}</span><br/><span className="text-[7px] uppercase font-black opacity-50">Neutral</span></div>
                     <div className="text-center"><span className="text-sm font-black text-red-600">{neg}</span><br/><span className="text-[7px] uppercase font-black opacity-50">Negative</span></div>
                   </div>
                </BrutalCard>
              </div>

              {/* Dimensions & Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BrutalCard className="p-5 border-b-[6px] space-y-4">
                  <h3 className="font-black uppercase text-sm italic">Dimension Averages</h3>
                  <div className="space-y-3">
                    {Object.entries(dimAvgs).map(([dim, avg]) => (
                      <div key={dim} className="flex items-center gap-3">
                        <span className="text-[9px] font-black uppercase w-24 truncate">{dim}</span>
                        <div className="flex-1 h-3 bg-slate-100 border-[1.5px] border-black rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 max-w-full" style={{ width: `${(avg / 5) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-black w-6 text-right">{avg.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </BrutalCard>

                <BrutalCard color={COLORS.lavender} className="p-5 border-b-[6px] space-y-4">
                  <h3 className="font-black uppercase text-sm italic">Actionable Insights</h3>
                  {insights.length > 0 ? (
                    <ul className="space-y-3">
                      {insights.map((ins, i) => (
                        <li key={i} className="text-[11px] font-bold leading-snug">{ins}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[10px] font-bold opacity-50 italic">Need at least 2 feedback responses to generate insights.</p>
                  )}
                </BrutalCard>
              </div>

              {/* Word Cloud / Recurring Themes */}
              {topWords.length > 0 && (
                <BrutalCard className="p-5 border-b-[6px] space-y-4">
                  <h3 className="font-black uppercase text-sm italic">Recurring Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {topWords.map(([word, freq]) => (
                      <span key={word} className="px-3 py-1 bg-white border-[2px] border-black rounded-xl text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            style={{ fontSize: `${Math.min(14, 8 + freq * 1.5)}px` }}>
                        {word} <span className="opacity-40 text-[8px]">x{freq}</span>
                      </span>
                    ))}
                  </div>
                </BrutalCard>
              )}

              {/* Recent Comments */}
              <BrutalCard className="p-5 border-b-[6px] space-y-4">
                <h3 className="font-black uppercase text-sm italic">Recent Comments</h3>
                <div className="space-y-3">
                  {feedbackList.filter(f => f.comment && f.comment.trim().length > 0).slice(0, 5).map((f, idx) => (
                    <div key={idx} className="p-3 bg-white border-[2px] border-black rounded-lg">
                      <p className="text-[10px] font-bold italic">"{f.comment}"</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[7.5px] font-black uppercase opacity-40">{f.anonymous ? 'Anonymous' : 'Student'}</span>
                        <Badge text={analyzeSentiment(f.comment)} color={analyzeSentiment(f.comment) === 'positive' ? COLORS.green : analyzeSentiment(f.comment) === 'negative' ? COLORS.red : COLORS.yellow} />
                      </div>
                    </div>
                  ))}
                  {feedbackList.filter(f => f.comment && f.comment.trim().length > 0).length === 0 && (
                    <p className="text-[10px] font-bold opacity-50 italic">No written comments to display.</p>
                  )}
                </div>
              </BrutalCard>
            </div>
          )}
        </>
      )}
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
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [manualId, setManualId] = useState('');
  const [manualResult, setManualResult] = useState<string>('');
  const [manualSearching, setManualSearching] = useState(false);
  const scannerRef = React.useRef<HTMLDivElement>(null);
  const html5QrRef = React.useRef<any>(null);
  const lastScannedRef = React.useRef<string>('');

  const registrationsRef = React.useRef(registrations);
  const selectedEventRef = React.useRef(selectedEvent);

  useEffect(() => {
    registrationsRef.current = registrations;
  }, [registrations]);

  useEffect(() => {
    selectedEventRef.current = selectedEvent;
  }, [selectedEvent]);

  useEffect(() => {
    if (profile?.uid) fetchOrganizerEvents(profile.uid);
  }, [profile?.uid, fetchOrganizerEvents]);

  useEffect(() => {
    if (selectedEvent) fetchEventParticipants(selectedEvent);
  }, [selectedEvent, fetchEventParticipants]);

  // Start QR scanner — handles both new and old format
  const startScanner = async () => {
    if (!scannerRef.current || !selectedEvent) return;
    setScanning(true);
    setScanResult('');
    lastScannedRef.current = '';

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-scanner-container');
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Prevent duplicate rapid scans of the same code
          if (decodedText === lastScannedRef.current) return;
          lastScannedRef.current = decodedText;

          if (decodedText.startsWith('SHARP_CHECKIN:')) {
            const parts = decodedText.replace('SHARP_CHECKIN:', '').split(':');

            if (parts.length === 2) {
              // New format: SHARP_CHECKIN:{eventId}:{registrationId}
              const [scannedEventId, scannedRegId] = parts;

              // Validate the scanned QR is for the currently selected event
              if (scannedEventId !== selectedEventRef.current) {
                setScanResult('✗ Wrong event — this QR is for a different event');
                setTimeout(() => { setScanResult(''); lastScannedRef.current = ''; }, 3000);
                return;
              }

              const reg = registrationsRef.current.find(r => r.registrationId === scannedRegId);
              if (reg && reg.attendanceStatus !== 'present') {
                await markAttendance(reg.id, selectedEventRef.current, 'present');
                await fetchEventParticipants(selectedEventRef.current);
                setScanResult(`✓ Checked in: ${reg.userName} (${reg.userDepartment || 'N/A'})`);
              } else if (reg) {
                setScanResult(`⚠ Already checked in: ${reg.userName}`);
              } else {
                setScanResult('✗ Registration not found for this event');
              }
            } else if (parts.length === 1) {
              // Old format: SHARP_CHECKIN:{userId}
              const userId = parts[0];
              const reg = registrationsRef.current.find(r => r.userId === userId);
              if (reg && reg.attendanceStatus !== 'present') {
                await markAttendance(reg.id, selectedEventRef.current, 'present');
                await fetchEventParticipants(selectedEventRef.current);
                setScanResult(`✓ Checked in: ${reg.userName} (${reg.userDepartment || 'N/A'})`);
              } else if (reg) {
                setScanResult(`⚠ Already checked in: ${reg.userName}`);
              } else {
                setScanResult('✗ User not registered for this event');
              }
            } else {
              setScanResult('✗ Invalid QR code format');
            }
          } else {
            setScanResult('✗ Invalid QR code — not a SHARP check-in code');
          }
          setTimeout(() => { setScanResult(''); lastScannedRef.current = ''; }, 4000);
        },
        () => {} // ignore scan errors
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

  // Manual ID entry handler
  const handleManualCheckin = async () => {
    const trimmedId = manualId.trim().toUpperCase();
    if (!trimmedId || !selectedEvent) return;
    setManualSearching(true);
    setManualResult('');

    const reg = registrations.find(
      r => r.registrationId?.toUpperCase() === trimmedId ||
           r.id?.toUpperCase() === trimmedId
    );

    if (!reg) {
      setManualResult('✗ No registration found with this ID');
      setManualSearching(false);
      setTimeout(() => setManualResult(''), 4000);
      return;
    }

    if (reg.attendanceStatus === 'present') {
      setManualResult(`⚠ Already checked in: ${reg.userName}`);
      setManualSearching(false);
      setTimeout(() => setManualResult(''), 4000);
      return;
    }

    await markAttendance(reg.id, selectedEvent, 'present');
    await fetchEventParticipants(selectedEvent);
    setManualResult(`✓ Checked in: ${reg.userName} (${reg.userDepartment || 'N/A'})`);
    setManualId('');
    setManualSearching(false);
    setTimeout(() => setManualResult(''), 4000);
  };

  const presentCount = registrations.filter(r => r.attendanceStatus === 'present').length;
  const absentCount = registrations.filter(r => r.attendanceStatus === 'absent').length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-green-400 underline-offset-4">Attendance</h2>
      <div className="space-y-1.5">
        <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Select Event</label>
        <select value={selectedEvent} onChange={e => { stopScanner(); setSelectedEvent(e.target.value); setManualId(''); setManualResult(''); setScanResult(''); }}
          className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
          <option value="">Choose event...</option>
          {events.filter(e => e.status === 'approved').map(e => <option key={e.id} value={e.id}>{e.title} ({e.registeredCount || 0} registered)</option>)}
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
            {([['scan', '📷 Scan QR'], ['manual', '⌨️ Manual Entry']] as const).map(([m, label]) => (
              <button key={m} onClick={() => { if (m !== 'scan') stopScanner(); setMode(m); }}
                className={`flex-1 border-[2px] border-black px-4 py-2 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${mode === m ? 'bg-yellow-400' : 'bg-white'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* QR Scanner Mode */}
          {mode === 'scan' && (
            <BrutalCard className="p-6 border-b-[5px] space-y-4">
              <h3 className="font-black uppercase text-sm italic text-center">Scan Student QR Code</h3>
              <p className="text-[8px] font-bold opacity-50 text-center">
                Point camera at student&apos;s QR code to mark attendance instantly. Duplicate scans are prevented.
              </p>
              <div id="qr-scanner-container" ref={scannerRef} className="border-[2px] border-black rounded-xl overflow-hidden mx-auto" style={{ maxWidth: 400 }} />
              {scanResult && (
                <div className={`border-[2.5px] rounded-xl p-3.5 text-center font-black text-[11px] uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] ${
                  scanResult.includes('✓') ? 'border-green-600 bg-green-50 text-green-700' :
                  scanResult.includes('⚠') ? 'border-yellow-600 bg-yellow-50 text-yellow-700' :
                  'border-red-600 bg-red-50 text-red-700'
                }`}>
                  {scanResult}
                </div>
              )}
              <div className="flex justify-center">
                {!scanning ? (
                  <BrutalButton color={COLORS.teal} className="text-[9px] px-6" onClick={startScanner}>Start Scanner</BrutalButton>
                ) : (
                  <BrutalButton color={COLORS.red} className="text-[9px] px-6" onClick={stopScanner}>Stop Scanner</BrutalButton>
                )}
              </div>
            </BrutalCard>
          )}

          {/* Manual Entry Mode */}
          {mode === 'manual' && (
            <div className="space-y-4">
              {/* Quick ID Entry */}
              <BrutalCard color={COLORS.yellow} className="p-5 border-b-[5px] space-y-3">
                <h3 className="font-black uppercase text-sm italic">Quick Check-in by ID</h3>
                <p className="text-[8px] font-bold opacity-50">Enter the student&apos;s Registration ID (e.g. REG-TECH-ABC123) to mark attendance.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualId}
                    onChange={e => setManualId(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleManualCheckin(); }}
                    placeholder="Enter Registration ID..."
                    className="flex-1 border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none uppercase placeholder:normal-case"
                  />
                  <BrutalButton
                    color={COLORS.green}
                    className="text-[9px] px-5 shrink-0"
                    onClick={handleManualCheckin}
                    disabled={!manualId.trim() || manualSearching}
                  >
                    {manualSearching ? '...' : '✓ Check In'}
                  </BrutalButton>
                </div>
                {manualResult && (
                  <div className={`border-[2.5px] rounded-xl p-3 text-center font-black text-[10px] uppercase italic ${
                    manualResult.includes('✓') ? 'border-green-600 bg-green-50 text-green-700' :
                    manualResult.includes('⚠') ? 'border-yellow-600 bg-yellow-50 text-yellow-700' :
                    'border-red-600 bg-red-50 text-red-700'
                  }`}>
                    {manualResult}
                  </div>
                )}
              </BrutalCard>

              {/* Full Participant List */}
              <BrutalCard className="p-0 border-[2.5px] overflow-hidden">
                <div className="p-3 border-b-[2.5px] border-black bg-black text-white flex justify-between items-center">
                  <h3 className="text-[11px] font-black uppercase italic tracking-widest">All Participants</h3>
                  <span className="text-[8px] font-bold opacity-60">{presentCount}/{registrations.length} present</span>
                </div>
                <table className="w-full text-left font-bold">
                  <thead>
                    <tr className="border-b-[2px] border-black text-[8px] uppercase opacity-40 italic tracking-widest bg-slate-50">
                      <th className="p-3">Name</th>
                      <th className="p-3 hidden sm:table-cell">Dept</th>
                      <th className="p-3 hidden sm:table-cell">Reg ID</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px]">
                    {registrations.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-[10px] font-black uppercase italic opacity-30">No participants registered</td></tr>
                    ) : (
                      registrations.map((r) => (
                        <tr key={r.id} className={`border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50 ${r.attendanceStatus === 'present' ? 'bg-green-50/50' : ''}`}>
                          <td className="p-3 font-black uppercase">{r.userName || 'Unknown'}</td>
                          <td className="p-3 hidden sm:table-cell">{r.userDepartment || '—'}</td>
                          <td className="p-3 hidden sm:table-cell text-[8px] opacity-50">{r.registrationId || r.id?.slice(0, 8)}</td>
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
            </div>
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
  const [newCategory, setNewCategory] = useState('general');
  const [newShiftStart, setNewShiftStart] = useState('');
  const [newShiftEnd, setNewShiftEnd] = useState('');

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
      title: `[${newCategory.toUpperCase()}] ${newTitle}${newShiftStart ? ` (${newShiftStart}–${newShiftEnd})` : ''}`,
      assignedTo: newAssignee || profile.name || 'Unassigned',
      status: 'pending',
    });
    setNewTitle('');
    setNewAssignee('');
    setNewCategory('general');
    setNewShiftStart('');
    setNewShiftEnd('');
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
          <div className="space-y-1.5">
            <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Category</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
              className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
              <option value="general">General</option>
              <option value="registration_desk">Registration Desk</option>
              <option value="logistics">Logistics</option>
              <option value="technical">Technical Setup</option>
              <option value="hospitality">Hospitality</option>
              <option value="cleanup">Cleanup</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Shift Start</label>
              <BrutalInput type="time" value={newShiftStart} onChange={e => setNewShiftStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Shift End</label>
              <BrutalInput type="time" value={newShiftEnd} onChange={e => setNewShiftEnd(e.target.value)} />
            </div>
          </div>
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
  const { fetchAllFeedback, feedbackList } = useFeedback();

  useEffect(() => {
    fetchAllEvents();
    queryDocs<UserProfile>('users', []).then(users => {
      setUserCount(users.length);
      const roleMap: Record<string, number> = {};
      users.forEach(u => { roleMap[u.role || 'student'] = (roleMap[u.role || 'student'] || 0) + 1; });
      setUsersByRole(roleMap);
    });
    fetchAllFeedback();
  }, [fetchAllEvents, fetchAllFeedback]);

  const totalRegs = events.reduce((s, e) => s + (e.registeredCount || 0), 0);
  const avgFill = events.length > 0 ? Math.round(events.reduce((s, e) => s + ((e.registeredCount || 0) / Math.max(e.capacity, 1)) * 100, 0) / events.length) : 0;
  const approved = events.filter(e => e.status === 'approved').length;
  const pending = events.filter(e => e.status === 'pending').length;
  const rejected = events.filter(e => e.status === 'rejected').length;

  // Feedback calculations
  const feedbackCount = feedbackList.length;
  let avgOverall = 0;
  let pos = 0, neu = 0, neg = 0;
  if (feedbackCount > 0) {
    avgOverall = feedbackList.reduce((sum, f) => sum + (f.ratings?.overall || 0), 0) / feedbackCount;
    feedbackList.forEach(f => {
      const sentiment = analyzeSentiment(f.comment);
      if (sentiment === 'positive') pos++;
      else if (sentiment === 'negative') neg++;
      else neu++;
    });
  }

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

      {/* Platform Feedback Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrutalCard className="p-5 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">Global Feedback Ratings</h3>
          {feedbackCount > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black">{avgOverall.toFixed(1)}</div>
                <div className="text-[10px] font-black uppercase opacity-50">Avg Overall<br/>Rating</div>
              </div>
              <div className="space-y-2">
                {['content', 'organization', 'venue', 'speaker'].map(dim => {
                  const dimAvg = feedbackList.reduce((sum, f) => sum + (f.ratings as any)?.[dim] || 0, 0) / feedbackCount;
                  return (
                    <div key={dim} className="flex items-center gap-3">
                      <span className="text-[8px] font-black uppercase w-20 truncate">{dim}</span>
                      <div className="flex-1 h-3 bg-slate-100 border-[1px] border-black rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${(dimAvg / 5) * 100}%` }} />
                      </div>
                      <span className="text-[9px] font-black w-6 text-right">{dimAvg.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-[10px] font-black uppercase italic opacity-30">No feedback submitted yet</p>
          )}
        </BrutalCard>

        <BrutalCard className="p-5 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">Sentiment Analysis</h3>
          {feedbackCount > 0 ? (
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full border-[5px] border-black overflow-hidden flex shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="absolute inset-0 bg-red-400" style={{ clipPath: `polygon(50% 50%, -50% -50%, ${neg > 0 ? '150% 150%' : '-50% 150%'})` }} />
                <div className="absolute inset-0 bg-slate-200" style={{ clipPath: `polygon(50% 50%, 150% 150%, ${neu > 0 ? '150% -50%' : '150% 150%'})` }} />
                <div className="absolute inset-0 bg-green-400" style={{ clipPath: `polygon(50% 50%, ${pos/(feedbackCount||1) * 360}deg 0, 0 0)` /* rough visual */ }} />
                <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center border-[2px] border-black z-10">
                  <span className="text-xl">
                    {pos > neg && pos > neu ? '😄' : neg > pos && neg > neu ? '😡' : '😐'}
                  </span>
                </div>
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-green-600">Positive</span><span className="text-sm font-black">{pos}</span></div>
                <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-slate-500">Neutral</span><span className="text-sm font-black">{neu}</span></div>
                <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-red-600">Negative</span><span className="text-sm font-black">{neg}</span></div>
              </div>
            </div>
          ) : (
             <p className="text-[10px] font-black uppercase italic opacity-30">No comments to analyze</p>
          )}
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
  const [newFacilities, setNewFacilities] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.facilities || []).some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const handleSave = async () => {
    if (!newName.trim()) return;

    const existingDuplicate = venues.find(
      v => 
        v.name.toLowerCase() === newName.toLowerCase().trim() && 
        v.location.toLowerCase() === newLocation.toLowerCase().trim()
    );

    if (existingDuplicate && existingDuplicate.id !== editId) {
      alert('A venue with this name and location already exists!');
      return;
    }

    setSaving(true);
    try {
      const facilitiesArray = newFacilities ? newFacilities.split(',').map(f => f.trim()).filter(Boolean) : [];
      if (editId) {
        await updateVenue(editId, { name: newName.trim(), location: newLocation.trim(), capacity: parseInt(newCapacity) || 50, facilities: facilitiesArray });
      } else {
        await createVenue({ name: newName.trim(), location: newLocation.trim(), capacity: parseInt(newCapacity) || 50, facilities: facilitiesArray, isActive: true });
      }
      resetForm();
      await fetchVenues();
    } catch (error: any) {
      console.error(error);
      alert('Failed to save venue: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNewName(''); setNewLocation(''); setNewCapacity(''); setNewFacilities('');
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (venue: Venue) => {
    setEditId(venue.id);
    setNewName(venue.name);
    setNewLocation(venue.location);
    setNewCapacity(venue.capacity.toString());
    setNewFacilities((venue.facilities || []).join(', '));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Venue Management</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 opacity-40" />
            </div>
            <input
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border-[2.5px] border-black py-2 pl-9 pr-3 text-[10px] font-bold rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:shadow-none transition-all"
            />
          </div>
          <BrutalButton color={COLORS.yellow} className="text-[9px] shrink-0" onClick={() => {
            if (!showForm || editId) {
              resetForm();
            }
            setShowForm(!showForm);
          }}>{showForm && !editId ? 'Cancel' : '+ Add Venue'}</BrutalButton>
        </div>
      </div>

      {showForm && (
        <BrutalCard className="p-5 space-y-4 border-b-[6px]" color={COLORS.yellow}>
          <h3 className="font-black uppercase text-sm italic">{editId ? 'Edit Venue' : 'Create New Venue'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <BrutalInput placeholder="Venue Name" value={newName} onChange={e => setNewName(e.target.value)} />
            <BrutalInput placeholder="Location" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
            <BrutalInput placeholder="Capacity" type="number" value={newCapacity} onChange={e => setNewCapacity(e.target.value)} />
            <BrutalInput placeholder="Facilities (comma-separated)" value={newFacilities} onChange={e => setNewFacilities(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <BrutalButton color={COLORS.teal} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : (editId ? 'Update Venue' : 'Save Venue')}
            </BrutalButton>
            <BrutalButton color="white" onClick={resetForm} disabled={saving}>Cancel</BrutalButton>
          </div>
        </BrutalCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVenues.length === 0 && !loading ? (
          <BrutalCard className="col-span-3 p-6 text-center"><p className="text-[10px] font-black uppercase italic opacity-30">No venues found.</p></BrutalCard>
        ) : (
          filteredVenues.map((venue) => (
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
                <BrutalButton color={COLORS.yellow} className="flex-1 text-[8px] py-1" onClick={() => handleEdit(venue)}>Edit</BrutalButton>
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
  const { profile } = useAuthStore();
  const { createNotification } = useNotifications(profile?.uid);
  const { logActivity } = useActivityLogs();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialLoadRef = useRef(true);

  // Track pending operations to avoid data clobbering from background sync
  const pendingUpdates = useRef<Record<string, string>>({});

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadUsers = useCallback(async () => {
    // Only show loading if we haven't loaded initial data yet
    if (initialLoadRef.current) {
      setLoading(true);
    }
    const data = await queryDocs<UserProfile>('users', []);
    // Merge strategy: preserve optimistic role if user is in pendingUpdates
    setUsers(data.map(serverUser => {
      const uid = serverUser.id || serverUser.uid;
      if (uid && typeof uid === 'string' && pendingUpdates.current[uid]) {
        return { ...serverUser, role: pendingUpdates.current[uid] as any };
      }
      return serverUser;
    }));
    if (initialLoadRef.current) {
      setLoading(false);
      initialLoadRef.current = false;
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const changeRole = async (targetId: string, newRole: string) => {
    try {
      if (!targetId) throw new Error("Invalid user ID");
      
      // Optimistic Update and Mark as Pending
      pendingUpdates.current[targetId] = newRole;
      setUsers(prev => prev.map(u => (u.id || u.uid) === targetId ? { ...u, role: newRole as any } : u));
      
      await updateDocument('users', targetId, { role: newRole });
      if (profile) await logActivity(profile.uid, profile.name, 'admin', 'update_role', targetId, 'user', `${newRole}`);
      
      if (profile?.uid) {
        await createNotification(profile.uid, 'Role Updated', `User role successfully updated to ${newRole}.`, 'system');
      }
    } catch (error: any) {
      console.error("Role update failed:", error);
      if (profile?.uid) {
        await createNotification(profile.uid, 'Update Failed', `Failed to update role: ${error.message}`, 'system');
      }
    } finally {
      // Clear pending state and sync background safely
      if (targetId) delete pendingUpdates.current[targetId];
      loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">User Management</h2>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 opacity-40" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            aria-label="Search users"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full border-[2.5px] border-black py-2 pl-9 pr-3 text-[10px] font-bold rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:shadow-none transition-all"
          />
        </div>
      </div>
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
            {filteredUsers.length === 0 && !loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-[10px] font-black uppercase italic opacity-30">No users found</td></tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id || u.uid} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50">
                  <td className="p-3 font-black uppercase">{u.name || 'Unknown'}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.department || '—'}</td>
                  <td className="p-3 text-center">
                    <Badge text={u.role || 'student'} color={u.role === 'admin' ? COLORS.lavender : u.role === 'organizer' ? COLORS.teal : COLORS.yellow} />
                  </td>
                  <td className="p-3 text-center">
                    <select value={u.role || 'student'} onChange={e => changeRole(u.id || u.uid, e.target.value)}
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
  const { notifications, broadcastNotification, deleteNotification } = useNotifications(profile?.uid);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('broadcast');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!profile || !message) return;
    setSending(true);
    await broadcastNotification(subject || 'System Notification', message, 'system', undefined, audience);
    setSending(false);
    setSent(true);
    setMessage('');
    setSubject('');
    setTimeout(() => setSent(false), 3000);
  };

  // Show broadcast notifications from history
  const broadcastHistory = notifications.filter(n => (n.userId || '').startsWith('broadcast'));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">System Notifications</h2>

      {/* Send form */}
      <BrutalCard className="p-6 space-y-5 border-b-[6px]">
        <div className="flex justify-between items-center">
          <h3 className="font-black uppercase text-sm italic">Broadcast Announcement</h3>
          <select value={audience} onChange={e => setAudience(e.target.value)}
            className="border-[2.5px] border-black rounded-lg px-3 py-1 text-[10px] font-black bg-yellow-400 outline-none uppercase italic shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
            <option value="broadcast">All Users</option>
            <option value="broadcast_student">Students Only</option>
            <option value="broadcast_organizer">Organizers Only</option>
            <option value="broadcast_admin">Admins Only</option>
          </select>
        </div>
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
              <div key={n.id || i} className="p-3.5 border-b-[1.5px] border-black border-opacity-10 last:border-0 hover:bg-yellow-50 relative group flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-black uppercase text-[10px] italic">{n.title}</span>
                    <span className="text-[7.5px] font-black opacity-30 italic sm:hidden">
                      {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : 'just now'}
                    </span>
                  </div>
                  <p className="text-[9px] font-bold opacity-60 leading-tight">{n.message}</p>
                </div>
                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <span className="text-[7.5px] font-black opacity-30 italic hidden sm:block">
                    {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : 'just now'}
                  </span>
                  {n.id && typeof deleteNotification === 'function' && (
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this broadcast for everyone?')) {
                          deleteNotification(n.id);
                        }
                      }} 
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 border border-red-300 px-2 py-1 rounded cursor-pointer self-end sm:self-auto"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </BrutalCard>
    </div>
  );
}

/* ===== Admin: System Settings ===== */
export function SystemSettingsPage() {
  const { events, fetchAllEvents } = useEvents();
  const [userCount, setUserCount] = useState(0);
  const [regCount, setRegCount] = useState(0);
  const { settings, saveSettings, loading: settingsLoading } = useSettings();
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<any>(null);

  useEffect(() => {
    fetchAllEvents();
    queryDocs<{ id: string }>('users', []).then(u => setUserCount(u.length));
    queryDocs<{ id: string }>('registrations', []).then(r => setRegCount(r.length));
  }, [fetchAllEvents]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!localSettings) return;
    setSaving(true);
    try {
      await saveSettings(localSettings);
      alert('Settings saved successfully!');
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">System Settings</h2>

      {/* Configuration Settings */}
      <BrutalCard className="p-6 space-y-5 border-b-[6px]">
        <h3 className="font-black uppercase text-sm italic">Global Configuration</h3>
        {settingsLoading || !localSettings ? (
          <p className="text-[10px] font-bold opacity-50">Loading configuration...</p>
        ) : (
          <div className="space-y-5 max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-sm uppercase">Registration Open</p>
                <p className="text-[9px] font-bold opacity-50">Allow new student registrations platform-wide</p>
              </div>
              <input type="checkbox" checked={localSettings.registrationOpen || false} onChange={e => setLocalSettings({...localSettings, registrationOpen: e.target.checked})} className="w-5 h-5 accent-yellow-400 border-[2px] border-black outline-none cursor-pointer" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-sm uppercase">Require Event Approval</p>
                <p className="text-[9px] font-bold opacity-50">Admin review required for organizer events</p>
              </div>
              <input type="checkbox" checked={localSettings.requireEventApproval || false} onChange={e => setLocalSettings({...localSettings, requireEventApproval: e.target.checked})} className="w-5 h-5 accent-yellow-400 border-[2px] border-black outline-none cursor-pointer" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-sm uppercase">Maintenance Mode</p>
                <p className="text-[9px] font-bold opacity-50">Restrict platform access during updates</p>
              </div>
              <input type="checkbox" checked={localSettings.maintenanceMode || false} onChange={e => setLocalSettings({...localSettings, maintenanceMode: e.target.checked})} className="w-5 h-5 accent-red-500 border-[2px] border-black outline-none cursor-pointer" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-sm uppercase">Anonymous Feedback</p>
                <p className="text-[9px] font-bold opacity-50">Allow students to submit feedback without names</p>
              </div>
              <input type="checkbox" checked={localSettings.allowAnonymousFeedback || false} onChange={e => setLocalSettings({...localSettings, allowAnonymousFeedback: e.target.checked})} className="w-5 h-5 accent-yellow-400 border-[2px] border-black outline-none cursor-pointer" />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="font-black uppercase text-[10px] tracking-widest opacity-80 italic">Support Contact Email</label>
              <BrutalInput type="email" placeholder="support@campusevent.edu" value={localSettings.supportEmail || ''} onChange={e => setLocalSettings({...localSettings, supportEmail: e.target.value})} />
            </div>

            <BrutalButton color={COLORS.teal} className="w-full mt-4 py-3" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </BrutalButton>
          </div>
        )}
      </BrutalCard>

      {/* Collection Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Users', v: userCount, c: COLORS.teal },
          { l: 'Events', v: events.length, c: COLORS.yellow },
          { l: 'Registrations', v: regCount, c: COLORS.pink },
          { l: 'Approved', v: events.filter(e => e.status === 'approved').length, c: COLORS.green },
        ].map(s => (
          <BrutalCard key={s.l} color={s.c} className="p-3 text-center border-b-[4px]">
            <span className="text-[7px] font-black uppercase opacity-60">{s.l}</span>
            <div className="text-xl font-black">{s.v}</div>
          </BrutalCard>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BrutalCard className="p-6 space-y-4 border-b-[6px]">
          <h3 className="font-black uppercase text-sm italic">Event Categories</h3>
          <div className="flex flex-wrap gap-2">
            {['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar', 'Competition', 'Social'].map((cat) => (
              <div key={cat} className="flex items-center gap-2 border-[2px] border-black px-3 py-1.5 rounded-xl bg-white">
                <span className="font-black uppercase text-[9px]">{cat}</span>
                <span className="text-[8px] font-bold opacity-30">{events.filter(e => e.category === cat.toLowerCase()).length}</span>
              </div>
            ))}
          </div>
        </BrutalCard>

        <BrutalCard className="p-6 space-y-4 border-b-[6px]">
          <h3 className="font-black uppercase text-sm italic">User Roles Distribution</h3>
          <div className="flex gap-3 flex-wrap">
            {['student', 'organizer', 'admin'].map(role => (
              <div key={role} className="border-[2px] border-black px-4 py-2 rounded-xl bg-white text-center">
                <span className="text-[10px] font-black uppercase tracking-wider">{role}</span>
              </div>
            ))}
          </div>
        </BrutalCard>
      </div>
    </div>
  );
}

/* ===== Admin: Data Management ===== */
export function DataManagementPage() {
  const { events, fetchAllEvents } = useEvents();
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState('');
  const [cleaning, setCleaning] = useState(false);
  const [cleanLog, setCleanLog] = useState<string[]>([]);

  useEffect(() => { fetchAllEvents(); }, [fetchAllEvents]);

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

  const exportEvents = () => {
    const data = JSON.stringify(events.map(e => ({
      id: e.id, title: e.title, category: e.category, status: e.status,
      organizer: e.organizerName, venue: e.venueName, capacity: e.capacity,
      registered: e.registeredCount, outcomeStatus: e.outcomeStatus,
    })), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'events_export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCleanDuplicates = useCallback(async () => {
    setCleaning(true);
    setCleanLog(['🔍 Fetching all registrations...']);

    // Fetch all registrations
    const allRegs = await queryDocs<Registration>('registrations', []);
    setCleanLog(prev => [...prev, `   Found ${allRegs.length} total registration(s).`]);

    // Group by userId + eventId
    const groups: Record<string, Registration[]> = {};
    for (const reg of allRegs) {
      if (!reg.userId || !reg.eventId) continue;
      const key = `${reg.userId}__${reg.eventId}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(reg);
    }

    const toDelete: Registration[] = [];
    for (const [, regs] of Object.entries(groups)) {
      const active = regs.filter(r => r.status === 'confirmed' || r.status === 'waitlisted');
      if (active.length <= 1) continue;
      // Sort oldest first — keep the first, delete the rest
      active.sort((a, b) =>
        ((a.registrationTime as unknown as { seconds: number })?.seconds || 0) -
        ((b.registrationTime as unknown as { seconds: number })?.seconds || 0)
      );
      const [, ...dupes] = active;
      toDelete.push(...dupes);
    }

    if (toDelete.length === 0) {
      setCleanLog(prev => [...prev, '✅ No duplicate registrations found! Database is already clean.']);
      setCleaning(false);
      return;
    }

    setCleanLog(prev => [...prev, `⚠️  Found ${toDelete.length} duplicate registration(s) to remove.`]);

    // Delete each duplicate and track affected events
    const affectedEventIds = new Set<string>();
    for (const reg of toDelete) {
      await updateDocument('registrations', reg.id, { status: 'cancelled' });
      affectedEventIds.add(reg.eventId);
    }
    setCleanLog(prev => [...prev, `🗑️  Cancelled ${toDelete.length} duplicate(s).`]);

    // Recalculate registeredCount for each affected event
    setCleanLog(prev => [...prev, `🔧 Recalculating counts for ${affectedEventIds.size} event(s)...`]);
    const freshRegs = await queryDocs<Registration>('registrations', []);
    for (const eventId of affectedEventIds) {
      const confirmedCount = freshRegs.filter(r => r.eventId === eventId && r.status === 'confirmed').length;
      await updateDocument('events', eventId, { registeredCount: confirmedCount });
      const evt = events.find(e => e.id === eventId);
      setCleanLog(prev => [...prev, `   "${evt?.title || eventId}": registeredCount → ${confirmedCount}`]);
    }

    setCleanLog(prev => [...prev,
      `🎉 Done! Removed ${toDelete.length} duplicate(s) across ${affectedEventIds.size} event(s).`
    ]);
    fetchAllEvents(); // refresh event list
    setCleaning(false);
  }, [events, fetchAllEvents]);

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
          <h3 className="font-black uppercase text-sm italic">Export Events</h3>
          <p className="text-[10px] font-bold opacity-60">Export all events as JSON ({events.length} events).</p>
          <BrutalButton color={COLORS.teal} className="w-full py-3" onClick={exportEvents}>
            <FileText className="w-4 h-4" /> Export JSON
          </BrutalButton>
        </BrutalCard>

        {/* Clean Duplicate Registrations */}
        <BrutalCard className="p-6 border-b-[6px] space-y-4 lg:col-span-2 border-l-[6px] border-l-red-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black uppercase text-sm italic text-red-700">🧹 Clean Duplicate Registrations</h3>
              <p className="text-[10px] font-bold opacity-60">Find students registered multiple times to the same event, keep oldest, cancel duplicates, and fix participant counts.</p>
            </div>
            <BrutalButton color={COLORS.red} className="px-5 py-2 text-[10px] shrink-0" onClick={handleCleanDuplicates} disabled={cleaning}>
              {cleaning ? 'Cleaning...' : 'Run Cleanup'}
            </BrutalButton>
          </div>
          {cleanLog.length > 0 && (
            <div className="bg-slate-900 text-green-400 font-mono text-[9px] rounded-xl p-4 space-y-1 max-h-48 overflow-y-auto border-[2px] border-black">
              {cleanLog.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
        </BrutalCard>
      </div>
    </div>
  );
}


/* ===== Admin: Activity Logs ===== */
export function ActivityLogsPage() {
  const { logs, fetchLogs, loading } = useActivityLogs();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => { fetchLogs(100); }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    const s = search.toLowerCase();
    const matchSearch = (log.actorName || '').toLowerCase().includes(s) || (log.action || '').toLowerCase().includes(s);
    const matchRole = roleFilter === 'all' || log.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('create') || act.includes('approve') || act.includes('register') || act.includes('present')) return 'text-green-600';
    if (act.includes('delete') || act.includes('reject') || act.includes('cancel') || act.includes('failed')) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-lavender underline-offset-4">Activity Logs</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="border-[2.5px] border-black rounded-xl px-3 py-2 text-[10px] font-black bg-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] outline-none cursor-pointer uppercase italic">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="organizer">Organizer</option>
            <option value="student">Student</option>
            <option value="system">System</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 opacity-40" />
            </div>
            <input
              type="text"
              placeholder="Search actor or action..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border-[2.5px] border-black py-2 pl-9 pr-3 text-[10px] font-bold rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] outline-none focus:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all"
            />
          </div>
        </div>
      </div>
      
      <BrutalCard className="p-0 border-[2.5px] overflow-hidden">
        <table className="w-full text-left font-bold block sm:table">
          <thead className="hidden sm:table-header-group">
            <tr className="border-b-[2.5px] border-black text-[8px] uppercase opacity-40 italic tracking-widest bg-slate-50">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
            </tr>
          </thead>
          <tbody className="text-[10px] block sm:table-row-group">
            {filteredLogs.length === 0 ? (
              <tr className="block sm:table-row"><td colSpan={4} className="p-6 text-center text-[10px] font-black uppercase italic opacity-30 block sm:table-cell">{loading ? 'Loading Logs...' : 'No activity logs found'}</td></tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50 block sm:table-row p-3 sm:p-0">
                  <td className="sm:p-3 font-bold opacity-50 block sm:table-cell text-[8px] sm:text-[10px] mb-1 sm:mb-0">
                    {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : ''}
                  </td>
                  <td className="sm:p-3 block sm:table-cell mb-1 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <div className="font-black uppercase truncate max-w-[150px]" title={log.actorName}>{log.actorName}</div>
                      <Badge text={log.role || 'system'} color={log.role === 'admin' ? COLORS.lavender : log.role === 'organizer' ? COLORS.teal : COLORS.yellow} />
                    </div>
                  </td>
                  <td className={`sm:p-3 font-black uppercase block sm:table-cell mb-1 sm:mb-0 ${getActionColor(log.action)}`}>{log.action}</td>
                  <td className="sm:p-3 block sm:table-cell">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-slate-200 border-[1px] border-black px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase break-none">{log.entityType}</span>
                      {log.entityName ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black tracking-tight" title={log.entityId}>{log.entityName}</span>
                          <span className="text-[7px] opacity-40 font-mono tracking-tighter hidden sm:block">ID: {log.entityId.substring(0, 8)}...</span>
                        </div>
                      ) : (
                        <span className="opacity-60 text-[8px] truncate inline-block max-w-[120px] align-middle" title={log.entityId}>{log.entityId}</span>
                      )}
                    </div>
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

/* ===== Admin: Certificate Templates ===== */
export function AdminCertificateTemplates() {
  const { templates, fetchTemplates, addTemplate, updateTemplate, deleteTemplate } = useCertificates();
  const { uploadImage } = useCloudinary();
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<CertificateTemplate>>({});
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Generate preview whenever form data changes
  useEffect(() => {
    if (editingTemplate || isNew) {
      const renderPreview = async () => {
        try {
          // Minimal mock data for preview
          const mockCert: Partial<Certificate> = {
            userName: 'Jane Doe',
            eventTitle: 'Annual Tech Symposium 2026',
            type: 'participation',
            verificationCode: 'SAMPLE-XYZ123'
          };
          
          let logoUrlsToUse = formData.logoUrls && formData.logoUrls.length > 0 ? formData.logoUrls : (formData.logoUrl ? [formData.logoUrl] : undefined);
          if (logoFiles.length > 0) {
             logoUrlsToUse = logoFiles.map(f => URL.createObjectURL(f));
          }
          
          let bgToUse = formData.backgroundImageUrl;
          if (bgFile) bgToUse = URL.createObjectURL(bgFile);
          
          let sigToUse = formData.signatureImageUrl;
          if (sigFile) sigToUse = URL.createObjectURL(sigFile);

          const url = await renderCertificateDataUrl(mockCert, formData as CertificateTemplate, {
            logoUrls: logoUrlsToUse,
            backgroundImageUrl: bgToUse,
            signatureImageUrl: sigToUse,
            primaryColor: formData.primaryColor,
            textColor: formData.textColor,
            department: 'Computer Science'
          });
          setPreviewUrl(url);
        } catch (e) {
          console.error("Preview render failed:", e);
        }
      };
      
      // Debounce slightly
      const timer = setTimeout(renderPreview, 300);
      return () => clearTimeout(timer);
    }
  }, [formData, logoFiles, bgFile, sigFile, editingTemplate, isNew]);

  const openNew = () => {
    setIsNew(true);
    setEditingTemplate(null);
    setFormData({
      name: 'New Template',
      eventType: 'all',
      layout: 'modern',
      primaryColor: '#FACC15',
      secondaryColor: '#FFFBEB',
      textColor: '#000000',
      borderStyle: 'solid',
      headerText: 'CERTIFICATE OF {{certificationType}}',
      bodyTemplate: 'This is to certify that\n\n{{participantName}}\n\nhas successfully participated in\n\n{{eventTitle}}',
      footerText: 'ID: {{id}} | Date: {{date}}',
      signatureText: 'Authorized Signature',
      isActive: true,
    });
    setLogoFiles([]);
    setBgFile(null);
    setSigFile(null);
  };

  const openEdit = (t: CertificateTemplate) => {
    setIsNew(false);
    setEditingTemplate(t);
    setFormData({ ...t });
    setLogoFiles([]);
    setBgFile(null);
    setSigFile(null);
  };

  const saveTemplate = async () => {
    setSaving(true);
    try {
      let finalLogoUrls = formData.logoUrls && formData.logoUrls.length > 0 ? formData.logoUrls : (formData.logoUrl ? [formData.logoUrl] : undefined);
      if (logoFiles.length > 0) {
        finalLogoUrls = [];
        for (const file of logoFiles) {
          const uploadedUrl = await uploadImage(file);
          if (uploadedUrl) finalLogoUrls.push(uploadedUrl);
        }
      }
      
      let finalBg = formData.backgroundImageUrl;
      if (bgFile) finalBg = await uploadImage(bgFile);
      
      let finalSig = formData.signatureImageUrl;
      if (sigFile) finalSig = await uploadImage(sigFile);

      const rawPayload = {
        ...formData,
        logoUrls: finalLogoUrls?.length ? finalLogoUrls : undefined,
        backgroundImageUrl: finalBg,
        signatureImageUrl: finalSig,
      };
      // Delete legacy key to prefer array going forward
      delete rawPayload.logoUrl;

      // Strip undefined values which crash Firestore
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, v]) => v !== undefined)
      ) as any;

      if (isNew) {
        await addTemplate(payload);
      } else if (editingTemplate) {
        await updateTemplate(editingTemplate.id, payload);
      }
      
      await fetchTemplates();
      setEditingTemplate(null);
      setIsNew(false);
    } catch (e) {
      alert('Failed to save template. Check console.');
      console.error(e);
    }
    setSaving(false);
  };

  const handleDelete = async (t: CertificateTemplate) => {
    if (confirm(`Delete template '${t.name}'?`)) {
      await deleteTemplate(t.id);
      fetchTemplates();
    }
  };

  if (editingTemplate || isNew) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase italic underline decoration-[4px] decoration-lavender">{isNew ? 'Create Template' : 'Edit Template'}</h2>
          <BrutalButton color="white" onClick={() => { setEditingTemplate(null); setIsNew(false); }}>Cancel</BrutalButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Form */}
          <BrutalCard className="p-6 space-y-4 max-h-[70vh] overflow-y-auto border-b-[6px]">
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] opacity-40 italic">Template Name</label>
              <BrutalInput value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] opacity-40 italic">Layout Style</label>
                <select value={formData.layout || 'modern'} onChange={e => setFormData({ ...formData, layout: e.target.value as any })} className="w-full border-[2.5px] border-black p-2 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
                  <option value="modern">Modern</option>
                  <option value="classic">Classic Serif</option>
                  <option value="standard">Standard</option>
                  <option value="minimal">Minimal</option>
                  <option value="elegant">Elegant Serif</option>
                  <option value="bold">Bold & Impactful</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] opacity-40 italic">Event Category</label>
                <select value={formData.eventType || 'all'} onChange={e => setFormData({ ...formData, eventType: e.target.value })} className="w-full border-[2.5px] border-black p-2 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
                  <option value="all">Any Event Type (Default)</option>
                  <option value="technical">Technical</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] opacity-40 italic">Primary Color</label>
                <input type="color" value={formData.primaryColor || '#FACC15'} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="w-full h-10 border-[2.5px] border-black cursor-pointer rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] opacity-40 italic">Bg Color</label>
                <input type="color" value={formData.secondaryColor || '#FFFBEB'} onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })} className="w-full h-10 border-[2.5px] border-black cursor-pointer rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] opacity-40 italic">Text Color</label>
                <input type="color" value={formData.textColor || '#000000'} onChange={e => setFormData({ ...formData, textColor: e.target.value })} className="w-full h-10 border-[2.5px] border-black cursor-pointer rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] opacity-40 italic">Border Style</label>
                <select value={formData.borderStyle || 'solid'} onChange={e => setFormData({ ...formData, borderStyle: e.target.value as any })} className="w-full border-[2.5px] border-black p-2 font-bold text-[10px] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg outline-none italic">
                  <option value="solid">Solid</option>
                  <option value="double">Double</option>
                  <option value="dashed">Dashed</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] opacity-40 italic">Institution/Event Logos (Select one or more) • Max 5MB</label>
              <input type="file" multiple accept="image/*" onChange={e => {
                const newFiles = e.target.files ? Array.from(e.target.files) : [];
                setLogoFiles(prev => [...prev, ...newFiles]);
                e.target.value = ''; // Reset input to allow re-selecting same file
              }} className="w-full text-[10px] font-bold border-[2px] border-black p-1 rounded-lg bg-white" />
              {logoFiles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {logoFiles.map((f, i) => (
                    <span key={i} className="text-[7px] font-bold bg-yellow-100 border border-black px-1.5 py-0.5 rounded flex items-center gap-1 group">
                      {f.name}
                      <button onClick={() => setLogoFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500 font-black">×</button>
                    </span>
                  ))}
                  <button onClick={() => setLogoFiles([])} className="text-[7px] font-black uppercase underline ml-1 opacity-40 hover:opacity-100 transition-opacity">Clear All</button>
                </div>
              )}
              {(formData.logoUrls?.length || formData.logoUrl) && logoFiles.length === 0 && <p className="text-[8px] text-green-600 font-bold">Current logos saved.</p>}
            </div>

            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] opacity-40 italic">Full Background Image • Max 5MB</label>
              <input type="file" accept="image/*" onChange={e => setBgFile(e.target.files?.[0] || null)} className="w-full text-xs font-bold" />
              {formData.backgroundImageUrl && !bgFile && <p className="text-[8px] text-green-600 font-bold">Current background saved.</p>}
            </div>

            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] opacity-40 italic">Header Text (supports {'{{certificationType}}'})</label>
              <BrutalInput value={formData.headerText || ''} onChange={e => setFormData({ ...formData, headerText: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] opacity-40 italic">Body Content (supports {'{{participantName}}, {{eventTitle}}, {{department}}, {{year}}, {{currentYear}}'})</label>
              <textarea value={formData.bodyTemplate || ''} onChange={e => setFormData({ ...formData, bodyTemplate: e.target.value })} className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-32 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none" placeholder="e.g. This is to certify that {{participantName}} of {{department}} ({{year}}) has participated in {{eventTitle}} during {{currentYear}}." />
            </div>

            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] opacity-40 italic">Signature Image (transparent PNG) • Max 5MB</label>
              <input type="file" accept="image/*" onChange={e => setSigFile(e.target.files?.[0] || null)} className="w-full text-xs font-bold" />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] opacity-40 italic">Signature Title / Name</label>
              <BrutalInput value={formData.signatureText || ''} onChange={e => setFormData({ ...formData, signatureText: e.target.value })} />
            </div>

            <div className="flex items-center gap-3 py-2 border-t-[2.5px] border-black">
              <input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 accent-yellow-400 border-black" />
              <label className="font-black uppercase text-xs italic">Template is Active (Available to Organizers)</label>
            </div>

            <BrutalButton color={COLORS.yellow} className="w-full h-12 text-sm" onClick={saveTemplate} disabled={saving}>
              {saving ? 'Saving...' : 'Save Template'}
            </BrutalButton>
          </BrutalCard>

          {/* Live Preview Panel */}
          <div className="space-y-3">
            <h3 className="font-black uppercase text-[10px] opacity-40 italic tracking-widest">Live Preview</h3>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl" />
            ) : (
              <div className="w-full aspect-[1.41] border-[4px] border-black border-dashed flex items-center justify-center bg-slate-50 opacity-50 rounded-xl">
                <span className="font-black italic uppercase text-xs">Generating Preview...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-lavender underline-offset-4">Certificate Templates</h2>
        <BrutalButton color={COLORS.teal} className="px-4 py-2" onClick={openNew}>
          <PlusCircle className="w-4 h-4" /> Create Template
        </BrutalButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map(t => (
          <BrutalCard key={t.id} className={`p-5 flex flex-col justify-between h-48 border-b-[5px] ${!t.isActive ? 'opacity-60' : ''}`} color={t.isActive ? 'white' : '#f1f5f9'}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <Badge text={t.eventType} color={COLORS.yellow} />
                {!t.isActive && <Badge text="Inactive" color={COLORS.red} />}
              </div>
              <h3 className="font-black uppercase text-sm italic">{t.name}</h3>
              <p className="text-[9px] font-bold opacity-50 uppercase mt-1">Layout: {t.layout}</p>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <BrutalButton color={COLORS.lavender} className="flex-1 text-[9px] py-1.5" onClick={() => openEdit(t)}>
                <Edit className="w-3.5 h-3.5" /> Edit
              </BrutalButton>
              <BrutalButton color="white" className="flex-1 text-[9px] py-1.5" onClick={() => updateTemplate(t.id, { isActive: !t.isActive }).then(() => fetchTemplates())}>
                {t.isActive ? 'Disable' : 'Enable'}
              </BrutalButton>
              <BrutalButton color={COLORS.red} className="px-3" onClick={() => handleDelete(t)}>
                <Trash2 className="w-3.5 h-3.5" />
              </BrutalButton>
            </div>
          </BrutalCard>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full border-[4px] border-black border-dashed p-10 text-center rounded-2xl opacity-40">
            <Award className="w-10 h-10 mx-auto mb-2" />
            <h3 className="font-black italic uppercase text-lg">No Templates Found</h3>
            <p className="font-bold text-xs uppercase">Create a template to issue certificates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
