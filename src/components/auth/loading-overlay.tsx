'use client';

import { useEffect, useState } from 'react';

export function LoadingOverlay({
  isVisible,
  message = 'Logging in...',
  subtitle = 'Please wait while we authenticate you',
}: {
  isVisible: boolean;
  message?: string;
  subtitle?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-amber-300/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-amber-300 border-t-transparent rounded-full animate-spin" />
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-amber-50 font-semibold text-lg mb-1">{message}</p>
          <p className="text-amber-200 text-sm">{subtitle}</p>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
}
