'use client';

import React from 'react';

interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function BrutalCard({ children, color = 'white', className = '', style, ...rest }: BrutalCardProps) {
  return (
    <div
      {...rest}
      className={`border-[2.5px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer p-4 rounded-[1.25rem] overflow-hidden ${className}`}
      style={{ backgroundColor: color, ...style }}
    >
      {children}
    </div>
  );
}
