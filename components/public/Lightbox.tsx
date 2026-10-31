'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

export type LightboxPhoto = { src: string; alt: string };

export function Lightbox({ photos, startIndex = 0, onClose }:
  { photos: LightboxPhoto[]; startIndex?: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);

  const nav = useCallback((d: number) => {
    setIdx((cur) => (cur + d + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') nav(-1);
      if (e.key === 'ArrowRight') nav(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [nav, onClose]);

  if (photos.length === 0) return null;
  const photo = photos[idx];

  return (
    <div
      role="dialog" aria-modal="true" aria-label={photo.alt}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ocean-950/95 p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button onClick={onClose} aria-label="Fechar"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-lg text-white transition hover:bg-coral-500">
        ✕
      </button>
      {photos.length > 1 && (
        <button onClick={() => nav(-1)} aria-label="Foto anterior"
          className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-xl text-white transition hover:bg-coral-500">
          ‹
        </button>
      )}
      <div className="relative h-[74vh] w-full max-w-4xl">
        <Image src={photo.src} alt={photo.alt} fill sizes="90vw" className="object-contain" priority />
      </div>
      <p className="mt-4 text-sm font-semibold text-sand-100">
        {photo.alt}{photos.length > 1 ? '  ·  ' + (idx + 1) + '/' + photos.length : ''}
      </p>
      {photos.length > 1 && (
        <button onClick={() => nav(1)} aria-label="Próxima foto"
          className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-xl text-white transition hover:bg-coral-500">
          ›
        </button>
      )}
    </div>
  );
}
