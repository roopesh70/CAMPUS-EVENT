'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Twitter, Instagram, Github, Youtube, Globe, X } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { COLORS } from '@/lib/constants';
import DOMPurify from 'isomorphic-dompurify';

export function Footer() {
  const { settings } = useSettings();
  const [activeLegal, setActiveLegal] = useState<{ title: string; html: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (activeLegal) {
      // Store current focus
      lastFocusedElement.current = document.activeElement as HTMLElement;

      // Escape key handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setActiveLegal(null);
        }

        // Focus trap
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

      // Focus first element in modal (X button)
      setTimeout(() => {
        const firstBtn = modalRef.current?.querySelector('button');
        if (firstBtn) firstBtn.focus();
      }, 50);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Restore focus
        if (lastFocusedElement.current) {
          lastFocusedElement.current.focus();
        }
      };
    }
  }, [activeLegal]);

  const socialLinks = [
    { Icon: Twitter, url: settings?.twitterUrl, label: 'Twitter' },
    { Icon: Instagram, url: settings?.instagramUrl, label: 'Instagram' },
    { Icon: Github, url: settings?.githubUrl, label: 'Github' },
    { Icon: Youtube, url: settings?.youtubeUrl, label: 'Youtube' },
    { Icon: Globe, url: settings?.campusWebsiteUrl, label: 'Campus' },
  ];

  const legalItems = [
    { id: 'privacy', label: 'Privacy Policy', content: settings?.privacyPolicy },
    { id: 'cookies', label: 'Cookies Settings', content: settings?.cookieSettings },
    { id: 'terms', label: 'Terms of Use', content: settings?.termsOfUse },
  ];

  const currentYear = new Date().getFullYear();
  const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';

  return (
    <footer className="bg-black text-white p-8 md:p-10 rounded-t-[2rem] mt-12 border-t-[3px] border-black relative overflow-hidden">
      {/* Decorative Gradient Flare */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative z-10">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="CAMEVE" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-black italic tracking-tighter">CAMEVE</h2>
          </div>
          <div className="flex flex-col gap-1.5 font-bold uppercase text-[9px] opacity-60">
            {legalItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveLegal({ title: item.label, html: item.content || '' })}
                className="text-left hover:text-yellow-400 hover:tracking-wide transition-all w-fit font-black"
              >
                {item.label}
              </button>
            ))}
            <p className="mt-2 text-[8px] opacity-40 lowercase italic font-normal">support: {settings?.supportEmail || '...'}</p>
          </div>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400">Newsletter</h3>
          <p className="text-[9px] font-bold opacity-50 uppercase leading-tight max-w-[200px]">Get weekly updates on campus events and exclusives.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email address..."
              aria-label="Email address for newsletter"
              className="flex-1 bg-white/5 border-[2px] border-white/20 p-2.5 rounded-xl text-white font-bold text-[10px] outline-none focus:border-yellow-400 transition-all placeholder:opacity-30"
            />
            <button className="bg-yellow-400 text-black border-[2px] border-black px-5 py-2.5 rounded-xl font-black uppercase text-[9px] shadow-[3px_3px_0px_0px_white] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all">
              Join
            </button>
          </div>
        </div>

        {/* Connect */}
        <div className="space-y-4 md:text-right">
          <h3 className="text-xs font-black uppercase tracking-widest text-teal-400">Connect</h3>
          <div className="flex md:justify-end gap-3 flex-wrap">
            {socialLinks.map(({ Icon, url, label }) => (
              url ? (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border-[2px] border-white/20 rounded-xl flex items-center justify-center transition-all hover:bg-white hover:text-black hover:scale-110"
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ) : (
                <span
                  key={label}
                  className="w-9 h-9 border-[2px] border-white/20 rounded-xl flex items-center justify-center opacity-20"
                  title={`${label} (unavailable)`}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" />
                </span>
              )
            ))}
          </div>
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-green-400">Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p className="text-[9px] font-bold uppercase opacity-30 italic">
          © Cameve Campus {currentYear}. Experience the Edge.
        </p>
        <div className="flex gap-6 opacity-30 text-[8px] font-black uppercase">
          <span>v{APP_VERSION}</span>
          <span>Made for Excellence</span>
        </div>
      </div>

      {/* Legal Content Modal */}
      {activeLegal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white text-black w-full max-w-2xl max-h-full overflow-hidden flex flex-col border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-3xl"
          >
            <div className="p-6 border-b-[3px] border-black flex items-center justify-between bg-yellow-400">
              <h2 id="modal-title" className="text-xl font-black uppercase italic">{activeLegal.title}</h2>
              <button
                onClick={() => setActiveLegal(null)}
                className="w-10 h-10 border-[3px] border-black rounded-xl bg-white flex items-center justify-center hover:bg-red-400 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto font-bold max-w-none scroll-smooth custom-scrollbar">
              {/* Sanitizing HTML content to prevent XSS from administrator-managed legal strings */}
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeLegal.html || 'No content available.') }} />
            </div>
            <div className="p-4 bg-gray-50 border-t-[3px] border-black text-center">
              <BrutalButton color={COLORS.yellow} className="px-10 py-2" onClick={() => setActiveLegal(null)}>Close Content</BrutalButton>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
