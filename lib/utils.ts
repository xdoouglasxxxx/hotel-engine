import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function waLink(phone: string, text: string) {
  return 'https://wa.me/' + phone.replace(/\D/g, '') + '?text=' + encodeURIComponent(text);
}

export function formatDateBR(iso: string) {
  const [y, m, d] = iso.split('-');
  return d + '/' + m + '/' + y;
}
