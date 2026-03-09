'use client';

import React from 'react';
import { Compass, Twitter, Instagram, Github, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-white p-8 md:p-10 rounded-t-[2rem] mt-12 border-t-[3px] border-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-500 border-2 border-white rounded-full flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,1)]">
              <Compass className="text-white w-4 h-4" />
            </div>
            <h2 className="text-xl font-black italic tracking-tighter">SHARP</h2>
          </div>
          <div className="flex flex-col gap-1 font-bold uppercase text-[8px] opacity-60">
            <a href="#" className="hover:text-yellow-400 hover:opacity-100 transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-yellow-400 hover:opacity-100 transition-all">Cookies Settings</a>
            <a href="#" className="hover:text-yellow-400 hover:opacity-100 transition-all">Terms of Use</a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest">Newsletter</h3>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email..."
              className="flex-1 bg-white border-[2px] border-white p-2 rounded-xl text-black font-bold text-[10px] outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
            />
            <button className="bg-yellow-400 text-black border-[2px] border-black px-4 py-2 rounded-xl font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:shadow-none transition-all">
              Join
            </button>
          </div>
        </div>

        {/* Connect */}
        <div className="space-y-4 md:text-right">
          <h3 className="text-xs font-black uppercase tracking-widest">Connect</h3>
          <div className="flex md:justify-end gap-3">
            {[Twitter, Instagram, Github, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-8 h-8 border-[2px] border-white rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black hover:border-black transition-all"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[8px] font-bold uppercase opacity-30 mt-10 text-center italic">
        © Sharp Campus 2026. Experience the Edge.
      </p>
    </footer>
  );
}
