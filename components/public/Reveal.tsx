'use client';

import { useEffect, useRef, useState } from 'react';

// Revela o conteúdo com fade + subida suave ao entrar na tela.
// IMPORTANTE: após a animação, o transform é REMOVIDO do wrapper.
// Um elemento com transform vira o "containing block" de descendentes
// position:fixed — o que quebrava o Lightbox e o modal de pré-reserva
// (overlay descentralizado no desktop e foto fora da área no mobile).
export function Reveal({ children, delay = 0 }:
  { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'hidden' | 'in' | 'done'>('hidden');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Sem suporte/preferência por menos movimento: entrega direto.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('done');
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPhase('in');
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Rede de segurança: remove o transform mesmo se o evento não disparar.
  useEffect(() => {
    if (phase !== 'in') return;
    const t = setTimeout(() => setPhase('done'), 900 + delay);
    return () => clearTimeout(t);
  }, [phase, delay]);

  return (
    <div
      ref={ref}
      onTransitionEnd={() => setPhase('done')}
      style={phase === 'in' ? { transitionDelay: delay + 'ms' } : undefined}
      className={
        phase === 'done'
          ? undefined
          : phase === 'in'
          ? 'translate-y-0 opacity-100 transition-all duration-700 ease-out'
          : 'translate-y-8 opacity-0'
      }
    >
      {children}
    </div>
  );
}
