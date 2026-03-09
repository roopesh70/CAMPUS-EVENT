'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

export function BrutalInput({ icon: Icon, className = '', ...props }: BrutalInputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {Icon && <Icon className="absolute left-4 w-4 h-4 text-black" />}
      <input
        className={`w-full border-[2.5px] border-black bg-white p-2.5 ${Icon ? 'pl-11' : 'pl-4'} font-bold text-xs focus:outline-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all rounded-xl`}
        {...props}
      />
    </div>
  );
}
