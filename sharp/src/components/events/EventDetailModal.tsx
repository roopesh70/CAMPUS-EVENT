'use client';

import React, { useEffect, useRef } from 'react';
import { X, MapPin, Clock, Users, Timer, Mail, Phone, Share2, Calendar as CalendarIcon, Target, Award, BookOpen } from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/constants';
import { linkify } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';
import type { CampusEvent } from '@/types';

interface EventDetailModalProps {
  event: CampusEvent;
  onClose: () => void;
  isAuthenticated: boolean;
  isRegistered: boolean;
  regLoading: boolean;
  onRegister: (evt: CampusEvent) => void;
  onShare: (evt: CampusEvent) => void;
  onSignInNeeded: () => void;
  registrationId?: string | null;
}

export function EventDetailModal({
  event,
  onClose,
  isAuthenticated,
  isRegistered,
  regLoading,
  onRegister,
  onShare,
  onSignInNeeded,
  registrationId
}: EventDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store current focus
    lastFocusedElement.current = document.activeElement as HTMLElement;

    // Escape listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      
      // Focus Trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus first button (X)
    setTimeout(() => {
      const xBtn = modalRef.current?.querySelector('button');
      if (xBtn) xBtn.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (lastFocusedElement.current) lastFocusedElement.current.focus();
    };
  }, [onClose]);

  const catColor = (cat: string) => {
    const defaultColors = [COLORS.teal, COLORS.pink, COLORS.yellow, COLORS.lavender];
    let sum = 0;
    for (let i = 0; i < cat.length; i++) sum += cat.charCodeAt(i);
    return defaultColors[sum % defaultColors.length];
  };

  const formatDate = (evt: CampusEvent) => {
    if (!evt.startTime?.toDate) return '';
    const d = evt.startTime.toDate();
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (evt: CampusEvent) => {
    if (!evt.startTime?.toDate) return '';
    const s = evt.startTime.toDate();
    const e = evt.endTime?.toDate ? evt.endTime.toDate() : null;
    const start = s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const end = e ? e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
    return end ? `${start} — ${end}` : start;
  };

  const isPastDeadline = (evt: CampusEvent) => {
    if (!evt.registrationDeadline?.toDate) return false;
    return Date.now() > evt.registrationDeadline.toDate().getTime();
  };

  const isPastEvent = (evt: CampusEvent) => {
    if (!evt.startTime?.toDate) return false;
    return Date.now() > evt.startTime.toDate().getTime();
  };

  const getCountdown = (evt: CampusEvent) => {
    if (!evt.startTime?.toDate) return null;
    const now = Date.now();
    const start = evt.startTime.toDate().getTime();
    const diff = start - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h ${mins}m left`;
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="bg-[#FFFBEB] border-[4px] border-black rounded-[2.5rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header Image Section */}
        <div className="relative h-48 md:h-64 shrink-0 overflow-hidden border-b-[4px] border-black group">
          {event.posterUrl ? (
            <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-pink-400 to-lavender-500 flex items-center justify-center opacity-80">
              <Sparkles className="w-32 h-32 text-white/40 animate-pulse" />
            </div>
          )}
          
          {/* Overlay Actions */}
          <div className="absolute top-6 left-6 flex gap-2">
            <Badge text={event.category} color={catColor(event.category)} className="px-3 py-1.5 text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
            {getCountdown(event) && (
              <div className="bg-black text-yellow-400 px-3 py-1.5 rounded-xl border-[2px] border-black text-[10px] font-black uppercase flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                <Timer className="w-3.5 h-3.5" /> {getCountdown(event)}
              </div>
            )}
          </div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 bg-white border-[3px] border-black rounded-2xl flex items-center justify-center hover:bg-red-400 transition-all hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-20 group"
            aria-label="Close Modal"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8">
          {/* Title & Stats */}
          <div className="space-y-4">
            <h2 id="event-modal-title" className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none break-words">
              {event.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Description & Rich Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Info Cards Grid — Restored Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border-[2.5px] border-black p-5 rounded-[1.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 group/card hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl border-[2px] border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/card:bg-yellow-400 transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase opacity-30 block mb-0.5 tracking-widest">Date & Time</span>
                    <p className="text-[11px] font-black uppercase">{formatDate(event)}</p>
                    <p className="text-[9px] font-bold opacity-50">{formatTime(event)}</p>
                  </div>
                </div>

                <div className="bg-white border-[2.5px] border-black p-5 rounded-[1.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 group/card hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl border-[2px] border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/card:bg-teal-400 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase opacity-30 block mb-0.5 tracking-widest">Venue</span>
                    <p className="text-[11px] font-black uppercase">{event.venueName || 'To Be Announced'}</p>
                  </div>
                </div>

                <div className="bg-white border-[2.5px] border-black p-5 rounded-[1.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 group/card hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl border-[2px] border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/card:bg-pink-400 transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase opacity-30 block mb-0.5 tracking-widest">Capacity</span>
                    <p className="text-[11px] font-black uppercase">{Math.max(event.registeredCount || 0, 0)} / {event.capacity}</p>
                  </div>
                </div>

                <div className="bg-white border-[2.5px] border-black p-5 rounded-[1.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 group/card hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl border-[2px] border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/card:bg-lavender-400 transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase opacity-30 block mb-0.5 tracking-widest">Organizer</span>
                    <p className="text-[11px] font-black uppercase">{event.organizerName || 'Secret Service'}</p>
                  </div>
                </div>
              </div>

              {/* Main Description */}
              <div className="bg-white border-[3px] border-black p-8 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group/rundown">
                <div className="absolute top-0 left-0 w-2 h-full bg-teal-400"></div>
                <h3 className="text-[10px] font-black uppercase italic tracking-[0.2em] text-black/30 mb-6 flex items-center gap-3">
                  <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/rundown:bg-yellow-400 transition-colors">
                    <BookOpen className="w-3 h-3 text-black" />
                  </div>
                  The Rundown
                </h3>
                <div className="relative">
                  <p 
                    className="text-sm md:text-base font-bold font-sans leading-relaxed text-black/80 whitespace-pre-wrap break-words selection:bg-yellow-300 selection:text-black"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(linkify(event.description || 'No detailed description provided for this edge-tier event.'), { ADD_ATTR: ['target', 'rel'] }) }}
                  />
                </div>
              </div>

              {/* Multi-section Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.targetAudience && (
                  <div className="bg-teal-50 border-[3px] border-black p-6 rounded-[1.5rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <h4 className="text-[9px] font-black uppercase opacity-40 mb-2 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Target Audience</h4>
                    <p className="text-sm font-black italic">{event.targetAudience}</p>
                  </div>
                )}
                {event.coOrganizers && (
                  <div className="bg-pink-50 border-[3px] border-black p-6 rounded-[1.5rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <h4 className="text-[9px] font-black uppercase opacity-40 mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Co-Organizers</h4>
                    <p className="text-sm font-black italic">{event.coOrganizers}</p>
                  </div>
                )}
              </div>

              {/* Eligibility & Resources */}
              <div className="space-y-4">
                {(event.eligibility?.departments?.length > 0 || event.eligibility?.years?.length > 0) && (
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black uppercase opacity-30 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Who Can Attend?</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.eligibility?.departments?.map(dep => <Badge key={dep} text={dep} color={COLORS.lavender} className="shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />)}
                      {event.eligibility?.years?.map(y => <Badge key={y} text={`Year ${y}`} color={COLORS.pink} className="shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />)}
                    </div>
                  </div>
                )}
                
                {event.resources && event.resources.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black uppercase opacity-30">Resources Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.resources.map(r => <Badge key={r} text={r} color="white" className="border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Actions & Contact */}
            <div className="space-y-6 lg:sticky lg:top-0">
              {/* Registration Card */}
              <div className="bg-black text-white p-6 md:p-8 rounded-[2rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] space-y-6">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase italic text-yellow-400">Secure Your Spot</h4>
                  <p className="text-[10px] font-bold opacity-60">Join <span className="text-white">{event.registeredCount}</span> others who are already in.</p>
                </div>

                {isAuthenticated && event.status === 'approved' && !isRegistered && !isPastDeadline(event) && !isPastEvent(event) ? (
                  <BrutalButton 
                    className="w-full py-4 text-sm tracking-tight"
                    color={COLORS.teal}
                    disabled={regLoading}
                    onClick={() => onRegister(event)}
                  >
                    {regLoading ? 'Processing Request...' : 'Apply for Admission'}
                  </BrutalButton>
                ) : isRegistered ? (
                  <div className="space-y-3">
                    <BrutalButton className="w-full py-4 text-sm" color={COLORS.green} disabled>
                      ✓ Entry Confirmed
                    </BrutalButton>
                    {registrationId && (
                      <div className="border-[2px] border-white/20 bg-white/5 p-4 rounded-2xl text-center">
                        <span className="text-[8px] font-black uppercase opacity-40 block mb-1">Boarding Pass ID</span>
                        <span className="text-lg font-black font-mono tracking-widest select-all">{registrationId}</span>
                      </div>
                    )}
                  </div>
                ) : isPastEvent(event) ? (
                   <BrutalButton className="w-full py-4 text-sm" color="#333" disabled>
                    Archive Mode Only
                   </BrutalButton>
                ) : isPastDeadline(event) ? (
                   <BrutalButton className="w-full py-4 text-sm" color="#333" disabled>
                    Applications Closed
                   </BrutalButton>
                ) : !isAuthenticated ? (
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold italic opacity-60 text-center">Authentication required for registration.</p>
                    <BrutalButton 
                      className="w-full py-4 text-sm" 
                      color={COLORS.yellow} 
                      onClick={onSignInNeeded}
                    >
                      Sign In to Attend
                    </BrutalButton>
                  </div>
                ) : null}

                {/* Event Timecard */}
                <div className="border-t border-white/10 pt-6 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="opacity-40">Start Time</span>
                    <span className="text-teal-400">{formatTime(event).split('—')[0]}</span>
                  </div>
                  {event.registrationDeadline && (
                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="opacity-40">Apply By</span>
                      <span className={isPastDeadline(event) ? 'text-red-400' : 'text-yellow-400'}>
                        {event.registrationDeadline.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Organizer / Contact Info */}
              <div className="bg-white border-[3px] border-black p-6 rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-lavender-100 border-[2px] border-black rounded-full flex items-center justify-center font-black">
                     {event.organizerName?.[0] || 'O'}
                   </div>
                   <div>
                     <h4 className="text-[7px] font-black uppercase opacity-40">Point of Contact</h4>
                     <p className="text-[11px] font-black uppercase italic">{event.organizerName || 'Secret Service'}</p>
                   </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  {event.contactEmail && (
                    <a href={`mailto:${event.contactEmail}`} className="flex items-center gap-2 group">
                      <div className="w-7 h-7 bg-teal-50 border-[2px] border-black rounded-lg flex items-center justify-center group-hover:bg-yellow-400 transition-colors">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold opacity-60 group-hover:opacity-100 transition-opacity truncate">{event.contactEmail}</span>
                    </a>
                  )}
                  {event.contactPhone && (
                    <a href={`tel:${event.contactPhone}`} className="flex items-center gap-2 group">
                      <div className="w-7 h-7 bg-pink-50 border-[2px] border-black rounded-lg flex items-center justify-center group-hover:bg-yellow-400 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold opacity-60 group-hover:opacity-100 transition-opacity">{event.contactPhone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Share */}
              <button 
                onClick={() => onShare(event)}
                className="w-full flex items-center justify-center gap-3 border-[3px] border-black bg-[#FFFBEB] p-4 rounded-[1.5rem] font-black uppercase italic text-xs shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <Share2 className="w-5 h-5" /> Spread the Word
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Footer Info */}
        <div className="p-4 bg-yellow-400 border-t-[4px] border-black text-center shrink-0">
          <p className="text-[9px] font-black uppercase italic tracking-widest">
            CAMEVE HQ • VERIFIED CAMPUS EVENT • SECURE PROTOCOL {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}

const Sparkles = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M3 5h4" />
    <path d="M21 17v4" />
    <path d="M19 19h4" />
  </svg>
);
