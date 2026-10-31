// Identidade do anfitrião, lida apenas de variáveis públicas de ambiente.
// Nenhum nome ou telefone fica no código: sem configuração, os textos usam
// placeholders neutros e os links de WhatsApp do anfitrião não são exibidos.
// Importável de Server e Client Components (só usa NEXT_PUBLIC_*).

/** Dígitos do WhatsApp do anfitrião com DDI (ex.: 55 + DDD + número); vazio se não configurado. */
export const OWNER_WHATSAPP = (process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? '').replace(/\D/g, '');

/** Nome do anfitrião para textos e saudações; vazio se não configurado. */
export const OWNER_NAME = (process.env.NEXT_PUBLIC_OWNER_NAME ?? '').trim();

/** Saudação para mensagens de WhatsApp: "Olá, <nome>!" ou "Olá!". */
export const OWNER_GREETING = OWNER_NAME ? 'Olá, ' + OWNER_NAME + '!' : 'Olá!';

/** Formata dígitos BR para exibição: "(DD) 9DDDD-DDDD". Remove o DDI 55 se presente. */
export function formatWhatsAppBR(digits: string): string {
  const local = digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits;
  const m = local.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  return m ? '(' + m[1] + ') ' + m[2] + '-' + m[3] : local;
}
