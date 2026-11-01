'use client';

import { useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import type { Room } from '@/types/database';
import { BookingForm } from './BookingForm';

export function BookingDialog({ room, onClose, initialRange }:
  { room: Room; onClose: () => void; initialRange?: DateRange }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
         role="dialog" aria-modal="true" aria-label={'Reservar ' + room.name}>
      <div className="absolute inset-0 bg-ocean-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <button onClick={onClose} aria-label="Fechar"
          className="absolute right-4 top-4 rounded-full p-2 text-ocean-900/50 hover:bg-sand-100 hover:text-ocean-900">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <BookingForm room={room} onDone={onClose} initialRange={initialRange} />
      </div>
    </div>
  );
}
