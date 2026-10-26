import { t, type Lang } from './i18n';

/** Only real WhatsApp destinations become links; anything else falls back to the caller's default. */
export function whatsappBase(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && ['wa.me', 'api.whatsapp.com'].includes(u.hostname) && u.pathname.length > 1 ? `${u.origin}${u.pathname}` : '';
  } catch { return ''; }
}

/** wa.me link with the booking message prefilled; `date` replaces {d} (the delivery calculator refills it in app.ts). */
export function whatsappHref(value: string, lang: Lang, date?: string) {
  const base = whatsappBase(value);
  if (!base) return '';
  const s = t(lang).bookingUi;
  return `${base}?text=${encodeURIComponent(s.waText.replace('{d}', date || s.waNoDate))}`;
}
