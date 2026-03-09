'use client';

import React from 'react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { Bell, Mail, Info, LogIn, Award, MessageSquare, CheckSquare, User, FileText, Users, CheckCircle, BarChart2, MapPin, Settings, Database, Activity, Send, Calendar } from 'lucide-react';

/* ===== Public: Announcements ===== */
export function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">Announcements</h2>
      <div className="space-y-3">
        {[
          { type: 'Event Update', msg: 'Venue for Jazz Night has been changed to Hall B. All registered participants have been notified.', time: '2h ago' },
          { type: 'Campus Notice', msg: 'Library hours extended to 11 PM during exam week. Booking system available online.', time: '5h ago' },
          { type: 'Event Update', msg: 'Registration for Quantum Hackathon closes tomorrow. Only 20 spots remaining.', time: '1d ago' },
          { type: 'Important Alert', msg: 'System maintenance scheduled for Sunday 2 AM - 4 AM. Brief downtime expected.', time: '2d ago' },
        ].map((item, i) => (
          <BrutalCard key={i} className="p-4 hover:bg-yellow-50 border-l-[6px] border-l-black">
            <div className="flex justify-between items-start mb-2">
              <Badge text={item.type} color={item.type.includes('Alert') ? COLORS.red : item.type.includes('Notice') ? COLORS.teal : COLORS.pink} />
              <span className="text-[7.5px] font-black opacity-30 italic">{item.time}</span>
            </div>
            <p className="text-[11px] font-bold leading-relaxed">{item.msg}</p>
          </BrutalCard>
        ))}
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

/* ===== Public: Auth ===== */
export function AuthPage() {
  return (
    <div className="max-w-md mx-auto py-8">
      <BrutalCard className="p-6 md:p-8 border-b-[8px] space-y-6">
        <div className="flex gap-0 border-b-[3px] border-black pb-0">
          <button className="flex-1 py-2.5 font-black uppercase text-xs italic bg-yellow-400 border-x-[2.5px] border-t-[2.5px] border-black rounded-t-xl -mb-[3px] z-10">Login</button>
          <button className="flex-1 py-2.5 font-black uppercase text-xs italic hover:bg-slate-50 opacity-40">Register</button>
        </div>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Institutional Email</label>
            <BrutalInput placeholder="you@campus.edu.in" icon={Mail} />
          </div>
          <div className="space-y-1.5">
            <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Password</label>
            <BrutalInput placeholder="••••••••" type="password" />
          </div>
          <BrutalButton className="w-full py-3 text-[11px]" color={COLORS.yellow}>
            <LogIn className="w-4 h-4" /> Sign In
          </BrutalButton>
          <p className="text-center text-[9px] font-bold uppercase opacity-40 italic cursor-pointer hover:opacity-100 transition-opacity">
            Forgot Password?
          </p>
        </div>
      </BrutalCard>
    </div>
  );
}

/* ===== Student: My Registrations ===== */
export function MyRegistrations() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">My Registrations</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Registered', 'Waitlist', 'Cancelled', 'Attended'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {[
          { name: 'AI Ethics Symposium', date: 'Oct 24', venue: 'Auditorium', status: 'Confirmed', id: 'REG-001' },
          { name: 'Campus Music Festival', date: 'Nov 1', venue: 'Open Ground', status: 'Confirmed', id: 'REG-002' },
          { name: 'Startup Pitch Day', date: 'Nov 5', venue: 'Room 10', status: 'Waitlisted', id: 'REG-003' },
        ].map((reg, i) => (
          <BrutalCard key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-l-[6px] border-l-black">
            <div>
              <h4 className="font-black uppercase text-[12px] italic">{reg.name}</h4>
              <p className="text-[8px] font-bold opacity-40 uppercase">{reg.date} • {reg.venue} • {reg.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge text={reg.status} color={reg.status === 'Confirmed' ? COLORS.green : COLORS.yellow} />
              <BrutalButton color={COLORS.red} className="px-3 py-1 text-[8px]">Cancel</BrutalButton>
            </div>
          </BrutalCard>
        ))}
      </div>
    </div>
  );
}

/* ===== Student: Certificates ===== */
export function CertificatesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">Certificates</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Download', 'Verify', 'History'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { event: 'Design Workshop', date: 'Sep 15', type: 'Participation', code: 'CERT-A1B2C3' },
          { event: 'Hackathon 2025', date: 'Aug 20', type: 'Winner', code: 'CERT-D4E5F6' },
          { event: 'Tech Talk Series', date: 'Jul 10', type: 'Participation', code: 'CERT-G7H8I9' },
        ].map((cert, i) => (
          <BrutalCard key={i} className="p-4 border-b-[5px]">
            <div className="flex justify-between mb-2">
              <Badge text={cert.type} color={cert.type === 'Winner' ? COLORS.yellow : COLORS.teal} />
              <span className="text-[7px] font-black opacity-30 italic">{cert.date}</span>
            </div>
            <h4 className="font-black uppercase text-sm italic">{cert.event}</h4>
            <p className="text-[8px] font-bold opacity-30 mt-1 uppercase">Code: {cert.code}</p>
            <BrutalButton color={COLORS.yellow} className="w-full mt-3 text-[9px]"><Award className="w-3.5 h-3.5" /> Download</BrutalButton>
          </BrutalCard>
        ))}
      </div>
    </div>
  );
}

/* ===== Student: Feedback ===== */
export function FeedbackPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">Feedback</h2>
      <BrutalCard className="p-6 space-y-5 border-b-[6px]">
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Select Event</label>
          <select className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
            <option>Design Workshop with Google</option>
            <option>AI Ethics Symposium</option>
            <option>Campus Music Festival</option>
          </select>
        </div>
        {['Content Quality', 'Organization', 'Venue & Facilities', 'Overall'].map((dim) => (
          <div key={dim} className="flex items-center justify-between">
            <span className="font-black uppercase text-[9px] italic opacity-60">{dim}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="w-7 h-7 border-[2px] border-black rounded-lg font-black text-[11px] hover:bg-yellow-400 transition-colors">
                  ★
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Comments</label>
          <textarea className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none" placeholder="Your feedback..." />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" className="w-4 h-4 accent-yellow-400" />
          <span className="font-black uppercase text-[9px] italic opacity-60">Submit Anonymously</span>
        </div>
        <BrutalButton className="w-full py-3" color={COLORS.yellow}><Send className="w-4 h-4" /> Submit Feedback</BrutalButton>
      </BrutalCard>
    </div>
  );
}

/* ===== Student: Notifications ===== */
export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Notifications</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Event Updates', 'Reminders'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="border-[2.5px] border-black bg-white rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        {[
          { type: 'Reminder', msg: 'AI Ethics Symposium starts in 3 hours. Don\'t forget!', time: '1h ago', unread: true },
          { type: 'System', msg: 'Your registration for Campus Music Festival has been confirmed.', time: '3h ago', unread: true },
          { type: 'Alert', msg: 'Venue for Jazz Night changed to Hall B.', time: '5h ago', unread: false },
          { type: 'System', msg: 'Certificate ready for Design Workshop. Download now.', time: '1d ago', unread: false },
          { type: 'Reminder', msg: 'Quantum Hackathon registration closes tomorrow.', time: '1d ago', unread: false },
        ].map((notif, i) => (
          <div key={i} className={`p-3.5 border-b-[2px] border-black hover:bg-yellow-50 cursor-pointer transition-colors last:border-0 ${notif.unread ? 'border-l-[4px] border-l-yellow-400 bg-yellow-50/50' : ''}`}>
            <div className="flex justify-between items-start mb-1">
              <Badge text={notif.type} color={notif.type === 'Reminder' ? COLORS.teal : notif.type === 'Alert' ? COLORS.pink : COLORS.yellow} />
              <span className="text-[7.5px] font-black opacity-30 italic">{notif.time}</span>
            </div>
            <p className={`text-[10px] leading-tight ${notif.unread ? 'font-black' : 'font-bold'}`}>{notif.msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Student: Profile ===== */
export function ProfilePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-lavender underline-offset-4">Profile</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Personal Info', 'Preferences', 'History', 'Settings'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <BrutalCard className="p-6 border-b-[6px]">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div className="w-24 h-24 border-[3px] border-black rounded-2xl overflow-hidden bg-pink-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=student" alt="avatar" className="w-full h-full" />
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Full Name</label>
                <BrutalInput placeholder="Alex Johnson" />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Student ID</label>
                <BrutalInput placeholder="STU-2026-001" />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Department</label>
                <BrutalInput placeholder="Computer Science" />
              </div>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Email</label>
                <BrutalInput placeholder="alex@campus.edu.in" />
              </div>
            </div>
            <BrutalButton color={COLORS.yellow} className="px-8">Save Changes</BrutalButton>
          </div>
        </div>
      </BrutalCard>
    </div>
  );
}

/* ===== Organizer: My Events ===== */
export function OrganizerMyEvents() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">My Events</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Draft', 'Pending Approval', 'Approved', 'Completed'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {[
          { name: 'Winter Code Sprint', status: 'Draft', cat: 'Technical', date: 'Oct 28' },
          { name: 'AI Ethics Symposium', status: 'Pending', cat: 'Academic', date: 'Oct 24' },
          { name: 'Campus Music Night', status: 'Approved', cat: 'Cultural', date: 'Nov 1' },
        ].map((evt, i) => (
          <BrutalCard key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-200 border-[2px] border-black rounded-lg shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://picsum.photos/seed/evt${i}/100/100`} className="w-full h-full object-cover grayscale" alt="event" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge text={evt.cat} color={evt.cat === 'Technical' ? COLORS.yellow : evt.cat === 'Academic' ? COLORS.teal : COLORS.pink} />
                  <Badge text={evt.status} color={evt.status === 'Draft' ? '#fff' : evt.status === 'Pending' ? COLORS.yellow : COLORS.green} />
                </div>
                <h4 className="font-black uppercase text-[12px] italic">{evt.name}</h4>
                <p className="text-[8px] font-bold opacity-40 uppercase">{evt.date}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <BrutalButton color="white" className="px-3 py-1 text-[8px]">Edit</BrutalButton>
              <BrutalButton color={COLORS.teal} className="px-3 py-1 text-[8px]">View</BrutalButton>
            </div>
          </BrutalCard>
        ))}
      </div>
    </div>
  );
}

/* ===== Organizer: Participants ===== */
export function ParticipantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Participants</h2>
        <div className="flex gap-2">
          <BrutalButton color="white" className="text-[8px] px-3 py-1">CSV</BrutalButton>
          <BrutalButton color="white" className="text-[8px] px-3 py-1">Excel</BrutalButton>
          <BrutalButton color="white" className="text-[8px] px-3 py-1">PDF</BrutalButton>
        </div>
      </div>
      <BrutalCard className="p-0 border-[2.5px] overflow-hidden">
        <table className="w-full text-left font-bold">
          <thead>
            <tr className="border-b-[2.5px] border-black text-[8px] uppercase opacity-40 italic tracking-widest bg-slate-50">
              <th className="p-3">Name</th>
              <th className="p-3">Student ID</th>
              <th className="p-3">Department</th>
              <th className="p-3">Registered</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-[10px]">
            {[
              { name: 'Alex Johnson', id: 'STU-001', dept: 'CS', date: 'Oct 20', status: 'Confirmed' },
              { name: 'Sarah Kim', id: 'STU-002', dept: 'Design', date: 'Oct 21', status: 'Confirmed' },
              { name: 'Mike Chen', id: 'STU-003', dept: 'EE', date: 'Oct 22', status: 'Waitlisted' },
            ].map((p, i) => (
              <tr key={i} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50">
                <td className="p-3 font-black uppercase">{p.name}</td>
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.dept}</td>
                <td className="p-3">{p.date}</td>
                <td className="p-3 text-center"><Badge text={p.status} color={p.status === 'Confirmed' ? COLORS.green : COLORS.yellow} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </BrutalCard>
    </div>
  );
}

/* ===== Organizer: Attendance ===== */
export function AttendancePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-green-400 underline-offset-4">Attendance</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['QR Scan', 'Manual Entry', 'Upload CSV'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrutalCard className="p-6 border-b-[6px] flex flex-col items-center gap-4">
          <div className="w-48 h-48 border-[3px] border-dashed border-black rounded-2xl flex items-center justify-center bg-slate-50">
            <CheckCircle className="w-16 h-16 opacity-10" />
          </div>
          <p className="text-[10px] font-black uppercase italic opacity-40">Camera preview appears here</p>
          <BrutalButton color={COLORS.teal} className="w-full py-3">Start QR Scanner</BrutalButton>
        </BrutalCard>
        <BrutalCard className="p-6 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">Live Count</h3>
          <div className="text-5xl font-black text-center py-4">127 <span className="text-lg opacity-30">/ 200</span></div>
          <div className="h-3 bg-slate-100 border-[2px] border-black rounded-full overflow-hidden">
            <div className="h-full bg-teal-400 rounded-full" style={{ width: '64%' }}></div>
          </div>
          <p className="text-[9px] font-black uppercase opacity-40 text-center italic">63.5% Checked In</p>
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
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Task List', 'Assign Tasks', 'Task Status'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {[
          { name: 'Setup registration desk', assigned: 'Sarah K.', due: 'Oct 24, 9AM', status: 'Pending' },
          { name: 'Test AV equipment', assigned: 'Mike C.', due: 'Oct 24, 8AM', status: 'In Progress' },
          { name: 'Prepare name badges', assigned: 'Alex J.', due: 'Oct 23', status: 'Completed' },
        ].map((task, i) => (
          <BrutalCard key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-l-[8px] border-l-black">
            <div>
              <h4 className="font-black uppercase text-[12px] italic">{task.name}</h4>
              <p className="text-[8px] font-bold opacity-40 uppercase">Assigned: {task.assigned} • Due: {task.due}</p>
            </div>
            <Badge text={task.status} color={task.status === 'Completed' ? COLORS.green : task.status === 'In Progress' ? COLORS.teal : COLORS.yellow} />
          </BrutalCard>
        ))}
      </div>
    </div>
  );
}

/* ===== Organizer: Event Updates / Analytics ===== */
export function EventUpdatesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">Event Updates</h2>
      <BrutalCard className="p-6 space-y-5 border-b-[6px]">
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Select Event</label>
          <select className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
            <option>AI Ethics Symposium</option>
            <option>Campus Music Festival</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Update Type</label>
          <select className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
            <option>Venue Change</option>
            <option>Time Change</option>
            <option>Cancellation</option>
            <option>General Update</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Message</label>
          <textarea className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none" placeholder="Type your update..." />
        </div>
        <BrutalButton className="w-full py-3" color={COLORS.yellow}><Send className="w-4 h-4" /> Send Notification</BrutalButton>
      </BrutalCard>
    </div>
  );
}

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Analytics</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Registration Stats', 'Attendance Rate', 'Feedback Results'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Registrations', value: '342', color: COLORS.teal },
          { label: 'Attendance Rate', value: '78%', color: COLORS.yellow },
          { label: 'Avg Rating', value: '4.2★', color: COLORS.pink },
        ].map((stat, i) => (
          <BrutalCard key={i} color={stat.color} className="p-4 border-b-[5px] text-center">
            <span className="text-[7px] font-black uppercase opacity-60 tracking-wider">{stat.label}</span>
            <div className="text-3xl font-black mt-1">{stat.value}</div>
          </BrutalCard>
        ))}
      </div>
      <BrutalCard className="h-48 flex items-end justify-between p-6 gap-2 border-[2.5px] bg-white">
        {[30, 55, 45, 80, 65, 95, 70, 85, 50, 75, 60, 90].map((h, i) => (
          <div key={i} className="flex-1 bg-black border-[1px] border-white group relative hover:bg-teal-400 transition-all rounded-t-lg" style={{ height: `${h}%` }}>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded text-[7px] opacity-0 group-hover:opacity-100 transition-opacity font-bold border border-white">
              {h}
            </div>
          </div>
        ))}
      </BrutalCard>
    </div>
  );
}

/* ===== Admin view stubs: Venue, Users, AdminAnalytics, SysNotifications, Settings, Data, Logs ===== */
export function VenueManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Venue Management</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Venue List', 'Add Venue', 'Availability', 'Maintenance'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'Auditorium', cap: 500, facilities: ['Projector', 'AC', 'Stage'], active: true },
          { name: 'Lab 4', cap: 60, facilities: ['Computers', 'Projector'], active: true },
          { name: 'Grand Arena', cap: 2000, facilities: ['Stage', 'Sound System', 'Lighting'], active: true },
          { name: 'Room 10', cap: 40, facilities: ['Whiteboard', 'AC'], active: false },
        ].map((venue, i) => (
          <BrutalCard key={i} className="p-4 border-b-[5px]">
            <div className="flex justify-between mb-2">
              <h4 className="font-black uppercase text-sm italic">{venue.name}</h4>
              <Badge text={venue.active ? 'Active' : 'Inactive'} color={venue.active ? COLORS.green : COLORS.red} />
            </div>
            <p className="text-[9px] font-black uppercase opacity-40">Capacity: {venue.cap}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {venue.facilities.map((f) => (
                <span key={f} className="text-[7px] font-black uppercase bg-slate-100 border-[1.5px] border-black px-2 py-0.5 rounded-full">{f}</span>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <BrutalButton color="white" className="flex-1 text-[8px] py-1">Edit</BrutalButton>
              <BrutalButton color={COLORS.teal} className="flex-1 text-[8px] py-1">Schedule</BrutalButton>
            </div>
          </BrutalCard>
        ))}
      </div>
    </div>
  );
}

export function UserManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-pink-400 underline-offset-4">User Management</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Students', 'Organizers', 'Role Assignment', 'User Activity'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <BrutalCard className="p-0 border-[2.5px] overflow-hidden">
        <table className="w-full text-left font-bold">
          <thead>
            <tr className="border-b-[2.5px] border-black text-[8px] uppercase opacity-40 italic tracking-widest bg-slate-50">
              <th className="p-3">Name</th>
              <th className="p-3">ID</th>
              <th className="p-3">Department</th>
              <th className="p-3 text-center">Role</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-[10px]">
            {[
              { name: 'Alex Johnson', id: 'STU-001', dept: 'CS', role: 'Student', active: true },
              { name: 'Prof. Sarah Kim', id: 'ORG-001', dept: 'Design', role: 'Organizer', active: true },
              { name: 'Dr. Mike Chen', id: 'ADM-001', dept: 'Admin', role: 'Admin', active: true },
            ].map((u, i) => (
              <tr key={i} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50">
                <td className="p-3 font-black uppercase">{u.name}</td>
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.dept}</td>
                <td className="p-3 text-center"><Badge text={u.role} color={u.role === 'Admin' ? COLORS.lavender : u.role === 'Organizer' ? COLORS.teal : COLORS.yellow} /></td>
                <td className="p-3 text-center"><Badge text={u.active ? 'Active' : 'Inactive'} color={u.active ? COLORS.green : COLORS.red} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </BrutalCard>
    </div>
  );
}

export function SystemNotificationsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">System Notifications</h2>
      <BrutalCard className="p-6 space-y-5 border-b-[6px]">
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Recipient</label>
          <select className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
            <option>All Students</option>
            <option>All Organizers</option>
            <option>Everyone</option>
            <option>Specific Department</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Subject</label>
          <BrutalInput placeholder="Notification subject..." />
        </div>
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Message</label>
          <textarea className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none" placeholder="Type your announcement..." />
        </div>
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Channel</label>
          <div className="flex gap-3">
            {['In-App', 'Email', 'SMS'].map((ch) => (
              <label key={ch} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-yellow-400" defaultChecked={ch === 'In-App'} />
                <span className="font-black uppercase text-[9px]">{ch}</span>
              </label>
            ))}
          </div>
        </div>
        <BrutalButton className="w-full py-3" color={COLORS.yellow}><Send className="w-4 h-4" /> Send Announcement</BrutalButton>
      </BrutalCard>
    </div>
  );
}

export function SystemSettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-yellow-400 underline-offset-4">System Settings</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Event Categories', 'Academic Calendar', 'Notification Templates', 'Security'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <BrutalCard className="p-6 space-y-4 border-b-[6px]">
        <h3 className="font-black uppercase text-sm italic">Event Categories</h3>
        <div className="flex flex-wrap gap-2">
          {['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar', 'Competition', 'Social'].map((cat) => (
            <div key={cat} className="flex items-center gap-2 border-[2px] border-black px-3 py-1.5 rounded-xl bg-white">
              <span className="font-black uppercase text-[9px]">{cat}</span>
              <button className="text-red-500 font-black text-sm">×</button>
            </div>
          ))}
        </div>
        <BrutalButton color={COLORS.teal} className="text-[9px]">+ Add Category</BrutalButton>
      </BrutalCard>
      <BrutalCard className="p-6 space-y-4 border-b-[6px]">
        <h3 className="font-black uppercase text-sm italic">Security Settings</h3>
        <div className="space-y-3">
          {[
            { label: 'MFA for Admins', enabled: true },
            { label: 'MFA for Organizers', enabled: true },
            { label: 'Session Timeout (8h)', enabled: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between border-[2px] border-black rounded-xl p-3">
              <span className="font-black uppercase text-[9px]">{setting.label}</span>
              <div className={`w-10 h-5 rounded-full border-[2px] border-black cursor-pointer transition-colors ${setting.enabled ? 'bg-green-400' : 'bg-slate-200'}`}>
                <div className={`w-3.5 h-3.5 bg-white border-[1.5px] border-black rounded-full transform transition-transform mt-[0.5px] ${setting.enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
              </div>
            </div>
          ))}
        </div>
      </BrutalCard>
    </div>
  );
}

export function DataManagementPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">Data Management</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Database Backup', 'Data Export', 'Data Retention'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrutalCard className="p-6 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">Last Backup</h3>
          <p className="text-[11px] font-bold opacity-60">March 9, 2026 — 02:00 AM (Auto)</p>
          <BrutalButton color={COLORS.yellow} className="w-full py-3"><Database className="w-4 h-4" /> Backup Now</BrutalButton>
        </BrutalCard>
        <BrutalCard className="p-6 border-b-[6px] space-y-4">
          <h3 className="font-black uppercase text-sm italic">Export Data</h3>
          <select className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
            <option>Users</option>
            <option>Events</option>
            <option>Registrations</option>
            <option>Certificates</option>
          </select>
          <BrutalButton color={COLORS.teal} className="w-full py-3">Export as JSON</BrutalButton>
        </BrutalCard>
      </div>
    </div>
  );
}

export function ActivityLogsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-lavender underline-offset-4">Activity Logs</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['User Activity', 'Event Actions', 'System Audit'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${i === 0 ? 'bg-yellow-400' : 'bg-white'}`}>
            {tab}
          </button>
        ))}
      </div>
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
            {[
              { time: '09:15 AM', actor: 'Admin', action: 'Approved Event', entity: 'AI Symposium' },
              { time: '08:45 AM', actor: 'Organizer', action: 'Created Event', entity: 'Code Sprint' },
              { time: '08:30 AM', actor: 'Student', action: 'Registered', entity: 'Music Fest' },
              { time: '08:00 AM', actor: 'System', action: 'Auto Backup', entity: 'Database' },
            ].map((log, i) => (
              <tr key={i} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50">
                <td className="p-3 font-bold opacity-50">{log.time}</td>
                <td className="p-3"><Badge text={log.actor} color={log.actor === 'Admin' ? COLORS.lavender : log.actor === 'Organizer' ? COLORS.teal : log.actor === 'Student' ? COLORS.yellow : '#fff'} /></td>
                <td className="p-3 font-black uppercase">{log.action}</td>
                <td className="p-3">{log.entity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </BrutalCard>
    </div>
  );
}
