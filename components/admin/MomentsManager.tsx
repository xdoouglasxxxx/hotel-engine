'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { GalleryPhoto } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// "Momentos": galeria viva alimentada pelo anfitrião.
// Fotos vão para o bucket público "rooms" (pasta momentos/) e a
// referência fica na tabela gallery_photos (RLS: admin_write_gallery).
export function MomentsManager() {
  const supabase = createClient();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setPhotos((data ?? []) as GalleryPhoto[]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function publish() {
    if (!file) { setError('Escolha uma foto primeiro.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Foto muito grande (máx. 5 MB).'); return; }
    setBusy(true); setError(''); setMsg('');

    const ext = file.name.split('.').pop() || 'jpg';
    const path = 'momentos/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;

    const { error: upErr } = await supabase.storage.from('rooms').upload(path, file, { upsert: false });
    if (upErr) { setError('Falha no upload da foto.'); setBusy(false); return; }

    const { data: pub } = supabase.storage.from('rooms').getPublicUrl(path);
    const { data, error: insErr } = await supabase
      .from('gallery_photos')
      .insert({ url: pub.publicUrl, caption: caption.trim() || null })
      .select()
      .single();

    if (insErr || !data) { setError('Foto enviada, mas não foi possível publicar.'); setBusy(false); return; }

    setPhotos((prev) => [data as GalleryPhoto, ...prev]);
    setCaption(''); setFile(null);
    setMsg('Momento publicado! Já está no site. 🌊');
    setBusy(false);
  }

  async function toggle(p: GalleryPhoto) {
    const { error: err } = await supabase
      .from('gallery_photos').update({ active: !p.active }).eq('id', p.id);
    if (!err) setPhotos((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !p.active } : x)));
  }

  async function remove(p: GalleryPhoto) {
    if (!window.confirm('Excluir este momento do site? Essa ação não pode ser desfeita.')) return;
    const { error: err } = await supabase.from('gallery_photos').delete().eq('id', p.id);
    if (err) { setError('Não foi possível excluir.'); return; }
    // tenta remover o arquivo do Storage (best-effort)
    const marker = '/rooms/';
    const i = p.url.indexOf(marker);
    if (i > -1) {
      const path = decodeURIComponent(p.url.slice(i + marker.length));
      supabase.storage.from('rooms').remove([path]);
    }
    setPhotos((prev) => prev.filter((x) => x.id !== p.id));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-sand-200 bg-white p-6">
        <h2 className="font-display text-xl text-ocean-900">Compartilhar um momento</h2>
        <p className="mt-1 text-sm text-ocean-900/60">
          A foto aparece na hora na seção “Momentos” do site. Café da manhã,
          área de lazer, detalhes da hospedagem — o dia a dia atrai hóspedes.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <input
              type="file" accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-ocean-900/70 file:mr-3 file:rounded-full file:border-0 file:bg-ocean-800 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-ocean-700"
            />
            <Input
              placeholder="Legenda (opcional) — ex: Café da manhã de hoje"
              value={caption} maxLength={140}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <Button onClick={publish} disabled={busy || !file} className="self-end">
            {busy ? 'Publicando…' : 'Publicar no site'}
          </Button>
        </div>

        {msg && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{msg}</p>}
        {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl text-ocean-900">
          Momentos publicados {photos.length > 0 && '(' + photos.length + ')'}
        </h2>
        {photos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sand-300 p-10 text-center text-ocean-900/60">
            Nenhum momento ainda. Publique a primeira foto acima!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p) => (
              <div key={p.id}
                className={'overflow-hidden rounded-2xl border bg-white ' + (p.active ? 'border-sand-200' : 'border-sand-300 opacity-50')}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.caption ?? 'Momento publicado'} className="h-36 w-full object-cover" />
                <div className="p-3">
                  {p.caption && <p className="mb-2 line-clamp-2 text-xs text-ocean-900/70">{p.caption}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => toggle(p)}
                      className="rounded-full bg-sand-200 px-3 py-1 text-[11px] font-bold text-ocean-800 hover:bg-sand-300">
                      {p.active ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button onClick={() => remove(p)}
                      className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
