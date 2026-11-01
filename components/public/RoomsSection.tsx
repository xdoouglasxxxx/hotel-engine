'use client';

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import type { Room } from '@/types/database';
import { AvailabilitySearch } from './AvailabilitySearch';
import { RoomCard } from './RoomCard';
import { BookingDialog } from './BookingDialog';
import { Lightbox } from './Lightbox';

export function RoomsSection({ rooms }: { rooms: Room[] }) {
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [bookingRange, setBookingRange] = useState<DateRange | undefined>();
  const [photoRoom, setPhotoRoom] = useState<Room | null>(null);

  function book(room: Room, range?: DateRange) {
    setBookingRange(range);
    setBookingRoom(room);
  }

  return (
    <section id="suites" className="scroll-mt-20 bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="section-eyebrow">Acomodações</p>
        <h2 className="mt-3 font-display text-3xl text-ocean-900 sm:text-4xl">
          Escolha sua suíte e veja as datas livres
        </h2>
        <p className="mt-4 max-w-2xl text-ocean-900/70">
          O calendário mostra a disponibilidade real. Escolha as datas, envie a
          pré-reserva e receba a confirmação pelo WhatsApp.
        </p>

        {rooms.length > 0 && (
          <AvailabilitySearch
            maxGuests={Math.max(...rooms.map((r) => r.capacity))}
            onBook={(roomId, range) => {
              const room = rooms.find((r) => r.id === roomId);
              if (room) book(room, range);
            }}
          />
        )}

        {rooms.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-sand-300 p-10 text-center text-ocean-900/60">
            As acomodações aparecerão aqui assim que forem cadastradas.
            Fale conosco pelo WhatsApp para reservar.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={() => book(room)}
                onViewPhotos={() => setPhotoRoom(room)}
              />
            ))}
          </div>
        )}
      </div>

      {bookingRoom && (
        <BookingDialog room={bookingRoom} initialRange={bookingRange} onClose={() => setBookingRoom(null)} />
      )}

      {photoRoom && Array.isArray(photoRoom.images) && photoRoom.images.length > 0 && (
        <Lightbox
          photos={photoRoom.images.map((src, i) => ({
            src,
            alt: photoRoom.name + ' — foto ' + (i + 1),
          }))}
          onClose={() => setPhotoRoom(null)}
        />
      )}
    </section>
  );
}
