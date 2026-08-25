'use client';

import { ReactNode } from 'react';

export function TransitionProvider({ children }: { children: ReactNode }) {
  return (
    <div className="transition-transform duration-0">
      {children}
    </div>
  );
}
