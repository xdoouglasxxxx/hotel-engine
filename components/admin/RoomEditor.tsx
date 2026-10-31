'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Room } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { brl } from '@/lib/utils';

// Edição de quartos direto pelo painel (RLS: policy admin_all_rooms).
// Fotos vão para o bucket público "rooms" do Supabase Storage.
export function RoomEditor({ rooms: initial }: { rooms: Room[] }) {
  const [rooms, setRooms] = useState(initial);
  const [editing, setEditing] = useState<Room | null>(null);

  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <article key={room.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white p-4">
          <div>
            <p className="font-bold text-ocean-900">
              {room.name}
              {!room.active && <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs">inativo</span>}
            </p>
            <p className="text-sm text-ocean-900/60">
              {brl(room.price_per_night)}/noite · até {room.capacity} pessoas ·{' '}
              {Array.isArray(room.images) ? room.images.length : 0} foto(s)
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditing(room)}>Editar</Button>
        </article>
      ))}

      {editing && (
        <RoomForm
          room={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function RoomForm({ room, onClose, onSaved }:
  { room: Room; onClose: () => void; onSaved: (r: Room) => void }) {
  const [form, setForm] = useState({
    name: room.name,
    description: room.description ?? '',
    price_per_night: room.price_per_night,
    capacity: room.capacity,
    active: room.active,
    amenities: (Array.isArray(room.amenities) ? room.amenities : []).join(', '),
  });
  const [images, setImages] = useState<string[]>(Array.isArray(room.images) ? room.images : []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function uploadImage(file: File) {
    if (file.size > 5 * 1024 * 1024) { setError('Imagem acima de 5MB.'); return; }
    setBusy(true);
    setError('');
    const supabase = createClient();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = room.id + '/' + Date.now() + '.' + ext;
    const { error: upErr } = await supabase.storage.from('rooms').upload(path, file, { upsert: false });
    if (upErr) { setError('Falha no upload da imagem.'); setBusy(false); return; }
    const { data } = supabase.storage.from('rooms').getPublicUrl(path);
    setImages((prev) => [...prev, data.publicUrl]);
    setBusy(false);
  }

  async function save() {
    setBusy(true);
    setError('');
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price_per_night: Number(form.price_per_night),
      capacity: Number(form.capacity),
      active: form.active,
      amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      images,
    };
    const { data, error: dbErr } = await supabase
      .from('rooms').update(payload).eq('id', room.id).select().single();
    if (dbErr || !data) { setError('Erro ao salvar.'); setBusy(false); return; }
    onSaved(data as Room);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ocean-950/60" onClick={onClose} />
      <div className="relative max-h-[92svh] w-full max-w-lg space-y-3 overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <h3 className="font-display text-xl text-ocean-900">Editar: {room.name}</h3>

        <label className="block text-sm font-semibold text-ocean-900">Nome
          <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block text-sm font-semibold text-ocean-900">Descrição
          <Textarea className="mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-ocean-900">Preço/noite (R$)
            <Input className="mt-1" type="number" min={1} value={form.price_per_night}
                   onChange={(e) => setForm({ ...form, price_per_night: Number(e.target.value) })} />
          </label>
          <label className="block text-sm font-semibold text-ocean-900">Capacidade
            <Input className="mt-1" type="number" min={1} max={12} value={form.capacity}
                   onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
          </label>
        </div>
        <label className="block text-sm font-semibold text-ocean-900">Comodidades (separe por vírgula)
          <Textarea className="mt-1" value={form.amenities}
                    onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
        </label>

        <div>
          <p className="text-sm font-semibold text-ocean-900">Fotos</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-16 w-20 rounded-lg object-cover" />
                <button
                  onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                  aria-label="Remover foto"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                  ×
                </button>
              </div>
            ))}
            <label className="flex h-16 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-sand-300 text-2xl text-sand-500 hover:border-ocean-400">
              +
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                     onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </label>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-ocean-900">
          <input type="checkbox" checked={form.active}
                 onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Visível no site
        </label>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" disabled={busy} onClick={save}>
            {busy ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </div>
    </div>
  );
}
