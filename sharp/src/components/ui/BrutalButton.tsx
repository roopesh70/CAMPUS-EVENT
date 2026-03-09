'use client';

import React from 'react';

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  children: React.ReactNode;
}

export function BrutalButton({ color = '#FACC15', children, className = '', ...props }: BrutalButtonProps) {
  return (
    <button
      className={`flex items-center justify-center gap-2 border-[2.5px] border-black px-5 py-2 font-black uppercase text-[10px] tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-y-0 ${className}`}
      style={{ backgroundColor: color }}
      {...props}
    >
      {children}
    </button>
  );
}
