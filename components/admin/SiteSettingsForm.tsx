'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { SiteSettings } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatTimeBR, siteAssetUrl } from '@/lib/site-public';

type ImageKind = 'logo' | 'hero';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const IMAGE_EXT_TO_TYPE: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
};
const MAX_IMAGE_BYTES: Record<ImageKind, number> = { logo: 2 * 1024 * 1024, hero: 5 * 1024 * 1024 };

// Formulário de site_settings. Imagens vão para o bucket público "site" pelo
// cliente anon (RLS: admin_*_site_images); os campos são salvos pela rota
// /api/admin/site-settings, que valida com zod e grava pela sessão do admin.
export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    published: initial.published,
    name: initial.name,
    tagline: initial.tagline ?? '',
    description: initial.description ?? '',
    address: initial.address ?? '',
    city: initial.city ?? '',
    state: initial.state ?? '',
    phone_public: initial.phone_public ?? '',
    email_public: initial.email_public ?? '',
    instagram: initial.instagram ?? '',
    domain: initial.domain ?? '',
    logo_path: initial.logo_path,
    hero_image_path: initial.hero_image_path,
    checkin_time: formatTimeBR(initial.checkin_time),
    checkout_time: formatTimeBR(initial.checkout_time),
    min_nights: initial.min_nights,
    cancellation_free_days: initial.cancellation_free_days,
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<ImageKind | null>(null);
  // Último estado gravado em site_settings. O upload grava só a imagem sobre este
  // estado (edições pendentes do formulário não vão junto) e só os caminhos daqui
  // podem ser removidos do storage.
  const [savedValues, setSavedValues] = useState(form);
  // Trava síncrona: um upload ou um "Salvar" por vez (o estado React chega tarde).
  const lock = useRef(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Valida extensão E content-type (têm de concordar) e o tamanho por tipo de imagem.
  function validateImage(kind: ImageKind, file: File): string | null {
    const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
    if (!Object.hasOwn(IMAGE_EXT_TO_TYPE, ext) || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Formato não aceito. Envie uma imagem JPEG, PNG ou WebP.';
    }
    if (IMAGE_EXT_TO_TYPE[ext] !== file.type) {
      return 'A extensão do arquivo não corresponde ao tipo da imagem.';
    }
    const limit = MAX_IMAGE_BYTES[kind];
    if (file.size > limit) {
      return (kind === 'logo' ? 'Logo' : 'Foto') + ' acima de ' + limit / (1024 * 1024) + ' MB.';
    }
    return null;
  }

  // Ordem: envia a nova, grava em site_settings e só então remove a antiga.
  // Qualquer falha antes do fim deixa o arquivo antigo no storage.
  async function upload(kind: ImageKind, file: File) {
    if (lock.current) return;
    setError(''); setMsg('');
    const invalid = validateImage(kind, file);
    if (invalid) { setError(invalid); return; }
    lock.current = true;
    setUploading(kind);
    const field = kind === 'logo' ? 'logo_path' : 'hero_image_path';
    const supabase = createClient();
    try {
      const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
      const path = kind + '/' + Date.now() + '.' + ext;
      const { error: upErr } = await supabase.storage
        .from('site')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) { setError('Falha no upload da imagem.'); return; }

      const next = { ...savedValues, [field]: path };
      try {
        await persist(next);
      } catch (e) {
        // Só um 4xx garante que site_settings não aponta para o arquivo novo. Em 5xx ou
        // erro de rede o estado é incerto (a gravação pode ter ocorrido): não remove nada.
        const status = (e as { status?: number }).status;
        if (status !== undefined && status >= 400 && status < 500) {
          await supabase.storage.from('site').remove([path]);
          setError(e instanceof Error ? e.message : 'Não foi possível salvar a nova imagem.');
        } else {
          setError('Não foi possível confirmar o salvamento da imagem. Recarregue a página para conferir.');
        }
        return;
      }
      const previous = savedValues[field];
      setSavedValues(next);
      set(field, path);
      if (previous && previous !== path) {
        const { data: removed, error: rmErr } = await supabase.storage.from('site').remove([previous]);
        if (rmErr || !removed?.length) {
          setMsg('Imagem trocada. O arquivo antigo não pôde ser removido do armazenamento.');
        }
      }
      setMsg((prev) => prev || 'Imagem salva.');
      router.refresh();
    } catch {
      setError('Falha no upload da imagem. Verifique a conexão e tente novamente.');
    } finally {
      lock.current = false;
      setUploading(null);
    }
  }

  async function persist(values: typeof form) {
    const res = await fetch('/api/admin/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        min_nights: Number(values.min_nights),
        cancellation_free_days:
          values.cancellation_free_days === null || (values.cancellation_free_days as unknown) === ''
            ? null
            : Number(values.cancellation_free_days),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw Object.assign(new Error(data.error || 'Não foi possível salvar.'), { status: res.status });
    }
  }

  async function save() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true); setError(''); setMsg('');
    try {
      await persist(form);
      setSavedValues(form);
      setMsg('Alterações salvas. O site já reflete os novos valores.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); save(); }}>
      {/* ---------- Site e marca ---------- */}
      <section className="rounded-3xl border border-sand-200 bg-white p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl text-ocean-900">Site e marca</h2>
          <p className="text-xs text-ocean-900/50">Moeda e fuso: BRL · {initial.timezone}</p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Nome do hotel" htmlFor="ss-name">
            <Input id="ss-name" required maxLength={120} value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Slogan" htmlFor="ss-tagline">
            <Input id="ss-tagline" maxLength={160} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Slogan curto" />
          </Field>
        </div>

        <Field className="mt-4" label='Descrição (aparece em "Sobre" e nos buscadores)' htmlFor="ss-description">
          <Textarea id="ss-description" maxLength={2000} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </Field>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Endereço" htmlFor="ss-address">
            <Input id="ss-address" maxLength={240} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Rua, número, bairro" />
          </Field>
          <Field label="Cidade" htmlFor="ss-city">
            <Input id="ss-city" maxLength={80} value={form.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label="UF" htmlFor="ss-state">
            <Input id="ss-state" maxLength={40} value={form.state} onChange={(e) => set('state', e.target.value)} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="WhatsApp público (com DDI, só números)" htmlFor="ss-phone">
            <Input id="ss-phone" inputMode="tel" value={form.phone_public} onChange={(e) => set('phone_public', e.target.value)} placeholder="55 DDD número" />
          </Field>
          <Field label="E-mail público" htmlFor="ss-email">
            <Input id="ss-email" type="email" maxLength={160} value={form.email_public} onChange={(e) => set('email_public', e.target.value)} />
          </Field>
          <Field label="Instagram (sem @)" htmlFor="ss-instagram">
            <Input id="ss-instagram" maxLength={31} value={form.instagram} onChange={(e) => set('instagram', e.target.value.replace(/^@/, ''))} placeholder="usuario" />
          </Field>
        </div>

        <Field className="mt-4" label="Domínio do site (opcional, sem https://)" htmlFor="ss-domain">
          <Input id="ss-domain" value={form.domain} onChange={(e) => set('domain', e.target.value.toLowerCase())} placeholder="meuhotel.com.br" />
        </Field>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <ImageField
            label="Logo" hint={`quadrado, até ${MAX_IMAGE_BYTES.logo / (1024 * 1024)} MB`}
            path={form.logo_path} busy={uploading === 'logo'} locked={busy || uploading !== null}
            onPick={(f) => upload('logo', f)} onClear={() => set('logo_path', null)}
            preview="h-24 w-24"
          />
          <ImageField
            label="Foto principal" hint={`1600 × 900, até ${MAX_IMAGE_BYTES.hero / (1024 * 1024)} MB`}
            path={form.hero_image_path} busy={uploading === 'hero'} locked={busy || uploading !== null}
            onPick={(f) => upload('hero', f)} onClear={() => set('hero_image_path', null)}
            preview="h-24 w-full"
          />
        </div>

        <label className="mt-6 flex items-center gap-2 text-sm font-semibold text-ocean-900">
          <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
          Site publicado (desmarcado, o público não vê marca, textos nem contatos)
        </label>
      </section>

      {/* ---------- Políticas e horários ---------- */}
      <section className="rounded-3xl border border-sand-200 bg-white p-6">
        <h2 className="font-display text-xl text-ocean-900">Políticas e horários</h2>
        <p className="mt-1 text-sm text-ocean-900/60">
          Mínimo de noites e janela de cancelamento são aplicados no banco, não só na tela.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Check-in a partir de" htmlFor="ss-checkin">
            <Input id="ss-checkin" type="time" required value={form.checkin_time} onChange={(e) => set('checkin_time', e.target.value)} />
          </Field>
          <Field label="Check-out até" htmlFor="ss-checkout">
            <Input id="ss-checkout" type="time" required value={form.checkout_time} onChange={(e) => set('checkout_time', e.target.value)} />
          </Field>
          <Field label="Mínimo de noites" htmlFor="ss-min-nights">
            <Input id="ss-min-nights" type="number" min={1} max={30} required value={form.min_nights}
                   onChange={(e) => set('min_nights', Number(e.target.value))} />
          </Field>
          <Field label="Hóspede pode cancelar pelo site até (dias antes do check-in)" htmlFor="ss-cancel-days">
            <Input id="ss-cancel-days" type="number" min={0} max={365}
                   value={form.cancellation_free_days ?? ''}
                   onChange={(e) => set('cancellation_free_days', e.target.value === '' ? null : Number(e.target.value))}
                   placeholder="vazio = sem limite" />
          </Field>
        </div>
      </section>

      {msg && <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">{msg}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={busy || uploading !== null}>
          {busy ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, className = '', children }:
  { label: string; htmlFor: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-ocean-900">{label}</label>
      {children}
    </div>
  );
}

function ImageField({ label, hint, path, busy, locked, onPick, onClear, preview }:
  { label: string; hint: string; path: string | null; busy: boolean; locked: boolean;
    onPick: (f: File) => void; onClear: () => void; preview: string }) {
  const url = siteAssetUrl(path);
  return (
    <div>
      <p className="text-sm font-semibold text-ocean-900">{label} <span className="font-normal text-ocean-900/50">· {hint}</span></p>
      <div className="mt-2 flex items-start gap-3">
        {url ? (
          // Preview de arquivo recém-enviado: <img> simples, como no RoomEditor.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className={preview + ' rounded-xl object-cover ring-1 ring-sand-200'} />
        ) : (
          <div className={preview + ' flex items-center justify-center rounded-xl border-2 border-dashed border-sand-300 text-xs text-ocean-900/40'}>
            sem imagem
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer rounded-full border border-ocean-300 bg-white px-4 py-1.5 text-center text-xs font-bold text-ocean-800 hover:bg-ocean-50">
            {busy ? 'Enviando…' : url ? 'Trocar' : 'Enviar'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={locked}
                   onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) onPick(file);
                  }} />
          </label>
          {url && (
            <button type="button" onClick={onClear} disabled={locked}
                    className="rounded-full px-4 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50">
              Remover
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
