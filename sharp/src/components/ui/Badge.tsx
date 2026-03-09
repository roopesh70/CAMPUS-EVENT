'use client';

import React from 'react';
import { COLORS } from '@/lib/constants';

interface BadgeProps {
  text: string;
  color?: string;
  pulsing?: boolean;
  className?: string;
}

export function Badge({ text, color = COLORS.pink, pulsing = false, className = '' }: BadgeProps) {
  return (
    <span
      className={`border-[1.5px] border-black px-2 py-0.5 font-black text-[8.5px] uppercase rounded-full inline-flex items-center gap-1.5 ${pulsing ? 'animate-pulse' : ''} ${className}`}
      style={{ backgroundColor: color }}
    >
      {pulsing && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
      {text}
    </span>
  );
}
