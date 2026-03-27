'use client';

import React, { useEffect, useState } from 'react';
import { QrCode, XCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { BrutalCard } from './BrutalCard';
import { BrutalButton } from './BrutalButton';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { COLORS } from '@/lib/constants';

export function GlobalQRModal() {
  const { profile } = useAuthStore();
  const { showQR, setShowQR } = useUIStore();
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (showQR && profile?.uid) {
      QRCode.toDataURL(profile.uid).then(setQrDataUrl);
    }
  }, [showQR, profile?.uid]);

  if (!showQR) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <BrutalCard className="max-w-xs w-full p-8 space-y-6 animate-in zoom-in-95 duration-200" color="#fff">
         <div className="flex justify-between items-center">
            <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
              <QrCode className="w-5 h-5" /> Ticket
            </h3>
            <BrutalButton color="#f3f4f6" className="p-1" onClick={() => setShowQR(false)}>
              <XCircle className="w-6 h-6" />
            </BrutalButton>
         </div>
         <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
               {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
               ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-slate-50 italic text-[10px] opacity-30">Generating...</div>
               )}
            </div>
            <div className="text-center space-y-1">
               <p className="text-[11px] font-black uppercase italic">{profile?.name || 'STUDENT'}</p>
               <p className="text-[8px] font-bold opacity-40 select-all">{profile?.uid}</p>
            </div>
         </div>
         <p className="text-[9px] font-bold text-center opacity-60 leading-relaxed uppercase italic">
            Scan this code at the event venue <br/>to mark your attendance.
         </p>
         <BrutalButton color={COLORS.yellow} className="w-full py-3 font-black italic" onClick={() => setShowQR(false)}>
            CLOSE TICKET
         </BrutalButton>
      </BrutalCard>
    </div>
  );
}
