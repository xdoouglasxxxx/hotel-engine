'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/Logo';
import { FALLBACK_SITE_NAME } from '@/lib/site-public';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('E-mail ou senha incorretos.');
      setLoading(false);
      return;
    }
    router.push(params.get('next') || '/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-ocean-900">E-mail</label>
        <Input id="email" type="email" required value={email}
               onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-ocean-900">Senha</label>
        <Input id="password" type="password" required value={password}
               onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </div>
      {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? 'Entrando…' : 'Entrar no painel'}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-sand-50 px-5">
      <Logo name={FALLBACK_SITE_NAME} size={64} />
      <h1 className="mt-4 font-display text-3xl text-ocean-900">Painel do anfitrião</h1>
      <p className="mb-8 mt-1 text-sm text-ocean-900/60">Acesso restrito à equipe do hotel</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
