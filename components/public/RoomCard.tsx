'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Room } from '@/types/database';
import { brl } from '@/lib/utils';

export function RoomCard({ room, onBook, onViewPhotos }:
  { room: Room; onBook: () => void; onViewPhotos: () => void }) {
  const cover = Array.isArray(room.images) ? room.images[0] : undefined;
  const photoCount = Array.isArray(room.images) ? room.images.length : 0;
  const amenities = Array.isArray(room.amenities) ? room.amenities : [];
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? amenities : amenities.slice(0, 4);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-sand-200 bg-sand-50 transition-shadow hover:shadow-xl">
      <button
        type="button"
        onClick={cover ? onViewPhotos : undefined}
        aria-label={'Ver fotos: ' + room.name}
        className={
          'relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-ocean-700 to-ocean-500 ' +
          (cover ? 'cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500' : 'cursor-default')
        }
      >
        {cover ? (
          <Image src={cover} alt={'Foto: ' + room.name} fill sizes="(max-width:768px) 100vw, 33vw"
                 className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span aria-hidden="true" className="font-display text-6xl text-white/25">
            {room.name.trim().charAt(0).toUpperCase()}
          </span>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ocean-800">
          Até {room.capacity} pessoas
        </span>
        {photoCount > 0 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-ocean-950/70 px-3 py-1 text-[11px] font-bold text-white">
            📷 {photoCount} {photoCount === 1 ? 'foto' : 'fotos'}
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl text-ocean-900">{room.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ocean-900/70">{room.description}</p>

        {amenities.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {visible.map((a) => (
              <li key={a} className="rounded-full bg-ocean-100 px-2.5 py-1 text-[11px] font-semibold text-ocean-800">
                {a}
              </li>
            ))}
            {amenities.length > 4 && (
              <li>
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  aria-expanded={showAll}
                  aria-label={showAll ? 'Mostrar menos comodidades' : 'Mostrar todas as comodidades'}
                  className="rounded-full bg-sand-200 px-2.5 py-1 text-[11px] font-bold text-coral-600 transition hover:bg-sand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
                >
                  {showAll ? '− mostrar menos' : '+' + (amenities.length - 4) + ' comodidades'}
                </button>
              </li>
            )}
          </ul>
        )}

        <div className="mt-5 flex items-end justify-between">
          <p>
            <span className="font-display text-2xl text-ocean-900">{brl(room.price_per_night)}</span>
            <span className="text-xs text-ocean-900/60"> / noite</span>
          </p>
          <button onClick={onBook}
            className="rounded-full bg-coral-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-coral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-600 focus-visible:ring-offset-2">
            Ver datas
          </button>
        </div>
      </div>
    </article>
  );
}
