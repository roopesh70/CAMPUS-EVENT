'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useEvents } from '@/hooks/useEvents';
import { QrCode, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { Registration, CampusEvent } from '@/types';

export function MyQRCode() {
  const { profile } = useAuthStore();
  const { registrations, fetchUserRegistrations } = useRegistrations();
  const { events, fetchPublicEvents } = useEvents();
  const [selectedRegId, setSelectedRegId] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [qrError, setQrError] = useState<string>('');

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-[4px] decoration-teal-400 underline-offset-4">
        My QR Code
      </h2>

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
                  {reg.eventTitle} {reg.attendanceStatus === 'present' ? '✓ Checked In' : ''}
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
  );
}
