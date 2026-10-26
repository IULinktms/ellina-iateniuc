import type { APIRoute } from 'astro';

/**
 * Contact endpoint (runs as a Vercel serverless function).
 *
 * Environment variables (set in Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY        required to actually deliver email (https://resend.com)
 *   CONTACT_TO            inbox that receives inquiries, e.g. hello@ellinaiateniuc.com
 *   CONTACT_FROM          verified sender, e.g. "Website <inquiries@ellinaiateniuc.com>"
 *   TURNSTILE_SECRET_KEY  optional, enables Cloudflare Turnstile verification
 */
export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const hits = new Map<string, number[]>(); // best-effort per-instance rate limit
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const env = import.meta.env;
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'The form data could not be read.' }, 400);
  }
  const get = (k: string) => String(form.get(k) ?? '').trim();

  // 1. Honeypot: real people never see this field
  if (get('website_url')) return json({ ok: true });

  // 2. Too fast to be human (under 3 s) or a stale page (over 2 h)
  const started = Number(get('_t'));
  const elapsed = Date.now() - started;
  if (!started || elapsed < 3000) return json({ ok: false, error: 'That was a little too quick.' }, 400);

  // 3. Rate limit: 5 messages per 10 minutes per address
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  if (recent.length >= 5) return json({ ok: false, error: 'Too many messages in a short time.' }, 429);
  hits.set(ip, [...recent, now]);

  // 4. Cloudflare Turnstile (only if configured)
  if (env.TURNSTILE_SECRET_KEY) {
    const token = get('cf-turnstile-response');
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    }).then((res) => res.json() as Promise<{ success: boolean }>).catch(() => ({ success: false }));
    if (!r.success) return json({ ok: false, error: 'The spam check did not pass.' }, 400);
  }

  // 5. Validation
  const name = get('name').slice(0, 120);
  const email = get('email').slice(0, 200);
  const message = get('message').slice(0, 5000);
  const type = get('type').slice(0, 80);
  const date = get('date').slice(0, 20);
  const location = get('location').slice(0, 160);
  const organisation = get('organisation').slice(0, 160);
  const guests = get('guests').slice(0, 20);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'Name, a valid email and a message are needed.' }, 400);
  }
  const links = (message.match(/https?:\/\//g) ?? []).length;
  if (links > 3) return json({ ok: false, error: 'Please include fewer links.' }, 400);

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) {
    console.warn('[contact] RESEND_API_KEY or CONTACT_TO not set — inquiry logged only', { name, email, type });
    return json({ ok: false, error: 'The form is not connected to an inbox yet.' }, 503);
  }

  const rows: [string, string][] = [['Name', name], ['Email', email], ['Organisation', organisation], ['Event type', type], ['Date', date], ['Location', location], ['Guests', guests]];
  const html = `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#111">
    <h2 style="font-weight:400">New inquiry from ${esc(name)}</h2>
    <table style="border-collapse:collapse">${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#777">${k}</td><td>${esc(v)}</td></tr>`).join('')}</table>
    <p style="white-space:pre-wrap;margin-top:24px">${esc(message)}</p></div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM || 'Website <onboarding@resend.dev>',
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `Event inquiry: ${type || 'Event'}${date ? ` on ${date}` : ''} — ${organisation || name}`,
      html,
      text: `${rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${message}`,
    }),
  });
  if (!res.ok) {
    console.error('[contact] Resend error', res.status, await res.text());
    return json({ ok: false, error: 'The message could not be delivered.' }, 502);
  }
  return json({ ok: true });
};

export const ALL: APIRoute = () => json({ ok: false, error: 'Method not allowed' }, 405);
