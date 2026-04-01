'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useEvents } from '@/hooks/useEvents';
import { useUIStore } from '@/stores/uiStore';
import { QrCode, Download, CheckCircle, Clock, AlertTriangle, BarChart2, Calendar, Award } from 'lucide-react';
import type { Registration, CampusEvent } from '@/types';

export function MyQRCode() {
  const { profile } = useAuthStore();
  const { registrations, fetchUserRegistrations } = useRegistrations();
  const { events, fetchPublicEvents } = useEvents();
  const { setActiveTab } = useUIStore();
  const [selectedRegId, setSelectedRegId] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [qrError, setQrError] = useState<string>('');
  const [activeView, setActiveView] = useState<'qr' | 'history'>('qr');

  useEffect(() => {
    fetchPublicEvents();
    if (profile?.uid) fetchUserRegistrations(profile.uid);
  }, [profile?.uid, fetchPublicEvents, fetchUserRegistrations]);

  // Only show confirmed registrations for approved/ongoing events
  const eligibleRegistrations = useMemo(() => {
    return registrations.filter(r => {
      if (r.status !== 'confirmed') return false;
      const event = events.find(e => e.id === r.eventId);
      return event && (event.status === 'approved' || event.status === 'completed');
    });
  }, [registrations, events]);

  // Auto-select if only one eligible registration
  useEffect(() => {
    if (eligibleRegistrations.length === 1 && !selectedRegId) {
      setSelectedRegId(eligibleRegistrations[0].id);
    }
  }, [eligibleRegistrations, selectedRegId]);

  const selectedReg = useMemo(
    () => eligibleRegistrations.find(r => r.id === selectedRegId) || null,
    [eligibleRegistrations, selectedRegId]
  );

  const selectedEvent = useMemo(
    () => (selectedReg ? events.find(e => e.id === selectedReg.eventId) : null),
    [selectedReg, events]
  );

  // Generate QR code when selection changes
  useEffect(() => {
    if (!selectedReg) {
      setQrDataUrl('');
      setQrError('');
      return;
    }

    let isMounted = true;
    setGenerating(true);
    setQrError('');
    const payload = `SHARP_CHECKIN:${selectedReg.eventId}:${selectedReg.registrationId}`;

    import('qrcode').then(QRCode => {
      if (!isMounted) return;
      QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: { dark: '#000000', light: '#FFFBEB' },
        errorCorrectionLevel: 'H',
      })
        .then(url => {
          if (isMounted) {
            setQrDataUrl(url);
            setGenerating(false);
          }
        })
        .catch(err => {
          if (isMounted) {
            console.error('QR Generation failed:', err);
            setQrError('Failed to generate QR code');
            setGenerating(false);
          }
        });
    }).catch(err => {
      if (isMounted) {
        console.error('Failed to load qrcode module:', err);
        setQrError('Failed to load QR generator');
        setGenerating(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedReg]);

  const isCheckedIn = selectedReg?.attendanceStatus === 'present';

  const formatEventTime = (event: CampusEvent | null | undefined) => {
    if (!event?.startTime?.toDate) return '';
    const d = event.startTime.toDate();
    return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
  };

  const handleDownload = () => {
    if (!qrDataUrl || !selectedReg) return;
    const link = document.createElement('a');
    link.download = `qr_${selectedReg.registrationId}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  // ─── Participation Stats ──────────────────────────────────────
  const allConfirmed = registrations.filter(r => r.status === 'confirmed' || r.attendanceStatus === 'present');
  const attendedCount = registrations.filter(r => r.attendanceStatus === 'present').length;
  const totalConfirmed = allConfirmed.length;
  const attendanceRate = totalConfirmed > 0 ? Math.round((attendedCount / totalConfirmed) * 100) : 0;

  // Past events with attendance info
  const participationHistory = useMemo(() => {
    const now = new Date();
    return registrations
      .filter(r => r.status === 'confirmed' || r.status === 'cancelled' || r.attendanceStatus === 'present')
      .map(r => {
        const event = events.find(e => e.id === r.eventId);
        return { reg: r, event };
      })
      .filter(item => item.event)
      .sort((a, b) => {
        const ta = a.event?.startTime?.toDate?.()?.getTime() || 0;
        const tb = b.event?.startTime?.toDate?.()?.getTime() || 0;
        return tb - ta;
      });
  }, [registrations, events]);

  // Department-wise breakdown
  const deptStats = useMemo(() => {
    const map: Record<string, { total: number; attended: number }> = {};
    participationHistory.forEach(({ reg, event }) => {
      const dept = event?.department || 'Other';
      if (!map[dept]) map[dept] = { total: 0, attended: 0 };
      map[dept].total++;
      if (reg.attendanceStatus === 'present') map[dept].attended++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [participationHistory]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">
        Attendance & QR
      </h2>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        {([['qr', '📱 My QR Codes'], ['history', '📊 Participation']] as const).map(([m, label]) => (
          <button key={m} onClick={() => setActiveView(m)}
            className={`flex-1 border-[2px] border-black px-4 py-2 font-black uppercase text-[9px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic ${activeView === m ? 'bg-yellow-400' : 'bg-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ═══════════ QR Code Tab ═══════════ */}
      {activeView === 'qr' && (
        <div className="space-y-6">
          {/* Instructions */}
          <BrutalCard className="p-4 border-l-[6px] border-l-yellow-400">
            <p className="text-[10px] font-bold opacity-60 italic leading-relaxed">
              Show your QR code to the event organizer at the venue for instant check-in.
              Each QR code is unique to your registration and event.
            </p>
          </BrutalCard>

          {/* Event Selector */}
          {eligibleRegistrations.length === 0 ? (
            <BrutalCard className="p-8 text-center space-y-3">
              <AlertTriangle className="w-12 h-12 mx-auto opacity-20" />
              <p className="text-[11px] font-black uppercase italic opacity-40">
                No confirmed registrations found
              </p>
              <p className="text-[9px] font-bold opacity-30">
                Register for an event to get your attendance QR code
              </p>
              <BrutalButton color={COLORS.teal} className="text-[9px] mt-2" onClick={() => setActiveTab('discover')}>
                Discover Events
              </BrutalButton>
            </BrutalCard>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">
                  Select Event
                </label>
                <select
                  value={selectedRegId}
                  onChange={e => setSelectedRegId(e.target.value)}
                  className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic"
                >
                  <option value="">Choose a registered event...</option>
                  {eligibleRegistrations.map(reg => (
                    <option key={reg.id} value={reg.id}>
                      {reg.eventTitle} {reg.attendanceStatus === 'present' ? '✔ Checked In' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* QR Code Display */}
              {selectedReg && (
                <BrutalCard className="p-6 border-b-[6px] space-y-5">
                  {/* Event Info Header */}
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-black uppercase italic tracking-tight">
                      {selectedReg.eventTitle}
                    </h3>
                    {selectedEvent && (
                      <p className="text-[9px] font-bold opacity-50 uppercase">
                        {selectedEvent.venueName} • {formatEventTime(selectedEvent)}
                      </p>
                    )}
                    <div className="flex justify-center gap-2">
                      <Badge
                        text={selectedReg.status}
                        color={COLORS.green}
                      />
                      {isCheckedIn && (
                        <Badge text="Checked In" color={COLORS.teal} />
                      )}
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center space-y-4">
                    {isCheckedIn ? (
                      /* Already checked in state */
                      <div className="w-72 h-72 border-[3px] border-green-500 rounded-2xl bg-green-50 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <p className="font-black uppercase text-sm italic text-green-700">
                          Already Checked In!
                        </p>
                        <p className="text-[8px] font-bold opacity-50">
                          Your attendance has been recorded
                        </p>
                      </div>
                    ) : qrError ? (
                      <div className="w-72 h-72 border-[3px] border-red-500 rounded-2xl bg-red-50 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3 p-4 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                        <p className="font-black uppercase text-[10px] italic text-red-700">
                          {qrError}
                        </p>
                      </div>
                    ) : generating ? (
                      <div className="w-72 h-72 border-[3px] border-black rounded-2xl bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-center space-y-2">
                          <div className="w-8 h-8 border-[3px] border-black border-t-yellow-400 rounded-full animate-spin mx-auto" />
                          <p className="text-[9px] font-black uppercase italic opacity-30">
                            Generating QR...
                          </p>
                        </div>
                      </div>
                    ) : qrDataUrl ? (
                      <div className="inline-block border-[3px] border-black rounded-2xl p-4 bg-[#FFFBEB] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrDataUrl}
                          alt="Your attendance QR code"
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                    ) : null}

                    {/* Registration ID */}
                    <div className="text-center space-y-1">
                      <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">
                        Registration ID
                      </p>
                      <p className="font-black text-sm italic border-[2px] border-black px-4 py-1.5 rounded-lg bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-all">
                        {selectedReg.registrationId}
                      </p>
                      <p className="text-[7px] font-bold opacity-30 italic">
                        You can also share this ID for manual check-in
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isCheckedIn && qrDataUrl && (
                    <div className="flex justify-center">
                      <BrutalButton
                        color={COLORS.yellow}
                        className="text-[9px] px-5"
                        onClick={handleDownload}
                      >
                        <Download className="w-3.5 h-3.5" /> Download QR Code
                      </BrutalButton>
                    </div>
                  )}
                </BrutalCard>
              )}
            </>
          )}

          {/* All Registrations List */}
          {eligibleRegistrations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-black uppercase text-[10px] italic opacity-40 tracking-widest">
                All Confirmed Registrations
              </h3>
              <div className="space-y-2">
                {eligibleRegistrations.map(reg => (
                  <BrutalCard
                    key={reg.id}
                    role="button"
                    tabIndex={0}
                    aria-selected={selectedRegId === reg.id}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedRegId(reg.id);
                      }
                    }}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-yellow-50 transition-colors border-l-[5px] focus:outline-none focus:ring-[3px] focus:ring-black ${
                      selectedRegId === reg.id
                        ? 'border-l-yellow-400 bg-yellow-50'
                        : 'border-l-transparent'
                    }`}
                    onClick={() => setSelectedRegId(reg.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 border-[2px] border-black rounded-lg flex items-center justify-center shrink-0 ${
                        reg.attendanceStatus === 'present' ? 'bg-green-400' : 'bg-teal-300'
                      }`}>
                        {reg.attendanceStatus === 'present' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <QrCode className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black uppercase text-[11px] italic">
                          {reg.eventTitle}
                        </h4>
                        <p className="text-[8px] font-bold opacity-40">
                          {reg.registrationId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reg.attendanceStatus === 'present' ? (
                        <Badge text="Checked In" color={COLORS.green} />
                      ) : (
                        <Badge text="Show QR" color={COLORS.teal} />
                      )}
                    </div>
                  </BrutalCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ Participation History Tab ═══════════ */}
      {activeView === 'history' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <BrutalCard color={COLORS.teal} className="p-3 text-center border-b-[4px]">
              <span className="text-[7px] font-black uppercase opacity-60">Registered</span>
              <div className="text-2xl font-black">{totalConfirmed}</div>
            </BrutalCard>
            <BrutalCard color={COLORS.green} className="p-3 text-center border-b-[4px]">
              <span className="text-[7px] font-black uppercase opacity-60">Attended</span>
              <div className="text-2xl font-black">{attendedCount}</div>
            </BrutalCard>
            <BrutalCard color={COLORS.yellow} className="p-3 text-center border-b-[4px]">
              <span className="text-[7px] font-black uppercase opacity-60">Att. Rate</span>
              <div className="text-2xl font-black">{attendanceRate}%</div>
            </BrutalCard>
            <BrutalCard color={COLORS.pink} className="p-3 text-center border-b-[4px]">
              <span className="text-[7px] font-black uppercase opacity-60">Missed</span>
              <div className="text-2xl font-black">{totalConfirmed - attendedCount}</div>
            </BrutalCard>
          </div>

          {/* Attendance Rate Visual */}
          <BrutalCard className="p-5 border-b-[5px] space-y-3">
            <h3 className="font-black uppercase text-sm italic flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Overall Attendance
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-5 bg-slate-100 border-[2px] border-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-green-400 transition-all duration-500"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
              <span className="font-black text-lg min-w-[50px] text-right">{attendanceRate}%</span>
            </div>
            <p className="text-[8px] font-bold opacity-40 italic">
              {attendedCount} out of {totalConfirmed} confirmed events attended
            </p>
          </BrutalCard>

          {/* Department-wise Breakdown */}
          {deptStats.length > 0 && (
            <BrutalCard className="p-5 border-b-[5px] space-y-4">
              <h3 className="font-black uppercase text-sm italic flex items-center gap-2">
                <Award className="w-4 h-4" /> Department-wise Participation
              </h3>
              <div className="space-y-3">
                {deptStats.map(([dept, stats]) => (
                  <div key={dept} className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase w-28 truncate">{dept}</span>
                    <div className="flex-1 h-3 bg-slate-100 border-[1.5px] border-black rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 max-w-full"
                        style={{ width: stats.total > 0 ? `${(stats.attended / stats.total) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-[9px] font-black w-16 text-right">
                      {stats.attended}/{stats.total}
                    </span>
                  </div>
                ))}
              </div>
            </BrutalCard>
          )}

          {/* Full History Table */}
          <BrutalCard className="p-0 border-[2.5px] overflow-hidden">
            <div className="p-3 border-b-[2.5px] border-black bg-black text-white flex justify-between items-center">
              <h3 className="text-[11px] font-black uppercase italic tracking-widest">Participation History</h3>
              <span className="text-[8px] font-bold opacity-60">{participationHistory.length} events</span>
            </div>
            <table className="w-full text-left font-bold">
              <thead>
                <tr className="border-b-[2px] border-black text-[8px] uppercase opacity-40 italic tracking-widest bg-slate-50">
                  <th className="p-3">Event</th>
                  <th className="p-3 hidden sm:table-cell">Department</th>
                  <th className="p-3 hidden sm:table-cell">Date</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Attendance</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                {participationHistory.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-[10px] font-black uppercase italic opacity-30">No participation records yet</td></tr>
                ) : (
                  participationHistory.map(({ reg, event }) => (
                    <tr key={reg.id} className={`border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50 ${
                      reg.attendanceStatus === 'present' ? 'bg-green-50/50' : reg.status === 'cancelled' ? 'opacity-50 bg-red-50/30' : ''
                    }`}>
                      <td className="p-3 font-black uppercase">{reg.eventTitle}</td>
                      <td className="p-3 hidden sm:table-cell">{event?.department || '—'}</td>
                      <td className="p-3 hidden sm:table-cell text-[8px] opacity-50">
                        {event?.startTime?.toDate ? event.startTime.toDate().toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          text={reg.status === 'cancelled' ? 'Cancelled' : (event?.status === 'completed' ? 'Completed' : 'Upcoming')}
                          color={reg.status === 'cancelled' ? COLORS.red : (event?.status === 'completed' ? COLORS.lavender : COLORS.teal)}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          text={reg.attendanceStatus === 'present' ? 'Present' : reg.attendanceStatus === 'absent' ? 'Absent' : 'Pending'}
                          color={reg.attendanceStatus === 'present' ? COLORS.green : reg.attendanceStatus === 'absent' ? COLORS.red : COLORS.yellow}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </BrutalCard>
        </div>
      )}
    </div>
  );
}
