/**
 * Motion + interaction engine.
 * One idea runs through all of it: the aperture — a thin slit of light that opens to a full frame.
 * Runs once per full load, and re-initialises page-level behaviour after each client-side navigation.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE = 'expo.out';
const SHUTTER = 'power4.inOut';

/* ───────────── Smooth scroll (once) ───────────── */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const stopScroll = () => (lenis ? lenis.stop() : (document.documentElement.style.overflow = 'hidden'));
const startScroll = () => (lenis ? lenis.start() : (document.documentElement.style.overflow = ''));

/* ───────────── Cursor (once) ───────────── */
const cursor = document.querySelector<HTMLElement>('.cursor');
if (cursor && finePointer && !reduced) {
  document.documentElement.classList.add('has-cursor');
  const ring = cursor.querySelector<HTMLElement>('.cursor__ring')!;
  const dot = cursor.querySelector<HTMLElement>('.cursor__dot')!;
  const label = cursor.querySelector<HTMLElement>('.cursor__label')!;
  const xr = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' });
  const yr = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' });
  const xl = gsap.quickTo(label, 'x', { duration: 0.55, ease: 'power3' });
  const yl = gsap.quickTo(label, 'y', { duration: 0.55, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    cursor.classList.remove('is-hidden');
    gsap.set(dot, { x: e.clientX, y: e.clientY });
    xr(e.clientX); yr(e.clientY); xl(e.clientX); yl(e.clientY);
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
    if (target) {
      cursor.classList.add('is-active');
      cursor.dataset.mode = target.dataset.cursorMode ?? '';
      label.textContent = target.dataset.cursor ?? '';
    } else {
      cursor.classList.remove('is-active');
      cursor.dataset.mode = '';
    }
  });
  document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
}

/* ───────────── Menu (once — persisted element) ───────────── */
const menu = document.getElementById('menu')!;
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')!;
let menuOpen = false;
function setMenu(open: boolean) {
  menuOpen = open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Close' : 'Menu';
  menu.setAttribute('aria-hidden', String(!open));
  if (open) {
    menu.classList.add('is-open');
    stopScroll();
    gsap.fromTo(menu, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: reduced ? 0 : 0.9, ease: SHUTTER });
    gsap.from('.menu__list li', { yPercent: 60, opacity: 0, stagger: 0.06, duration: 0.9, ease: EASE, delay: 0.3 });
    menu.querySelector<HTMLElement>('a')?.focus();
  } else {
    startScroll();
    gsap.to(menu, { clipPath: 'inset(50% 0 50% 0)', duration: reduced ? 0 : 0.7, ease: SHUTTER, onComplete: () => menu.classList.remove('is-open') });
  }
}
toggle.addEventListener('click', () => setMenu(!menuOpen));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); toggle.focus(); } });

/* ───────────── Page transitions: shutter closes, page swaps, shutter opens ───────────── */
const curtainBars = document.querySelectorAll<HTMLElement>('.curtain i');
const slit = document.querySelector<HTMLElement>('.curtain__slit');

function closeShutter() {
  return new Promise<void>((resolve) => {
    if (reduced) return resolve();
    gsap.timeline({ onComplete: resolve })
      .set(curtainBars, { scaleY: 0 })
      .to(curtainBars, { scaleY: 1, duration: 0.65, ease: SHUTTER })
      .fromTo(slit, { scaleX: 0, opacity: 0.9 }, { scaleX: 1, duration: 0.45, ease: 'power3.out' }, '-=0.25');
  });
}
function openShutter() {
  if (reduced) return;
  gsap.timeline()
    .to(slit, { opacity: 0, duration: 0.25 })
    .to(curtainBars, { scaleY: 0, duration: 0.9, ease: SHUTTER }, '<');
}

document.addEventListener('astro:before-preparation', (ev: any) => {
  if (menuOpen) setMenu(false);
  const original = ev.loader;
  ev.loader = async () => {
    await Promise.all([closeShutter(), original()]);
  };
});
document.addEventListener('astro:after-swap', () => {
  lenis?.scrollTo(0, { immediate: true });
  window.scrollTo(0, 0);
  openShutter();
});

/* ───────────── Page-level setup (every navigation) ───────────── */
let ctx: gsap.Context | null = null;
const cleanups: Array<() => void> = [];

document.addEventListener('astro:before-swap', () => {
  ctx?.revert();
  cleanups.splice(0).forEach((fn) => fn());
  ScrollTrigger.getAll().forEach((t) => t.kill());
});

document.addEventListener('astro:page-load', () => {
  const page = document.body.dataset.page ?? '';
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    if (a.dataset.nav === page) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  ctx = gsap.context(() => {
    if (page === 'home') intro();
    apertures();
    parallax();
    headings();
    statement();
    filmStrip();
    floatPreview();
  });
  hoverPreviews();
  lightbox();
  player();
  filters();
  contactForm();
  heroClock();
  toTop();
  requestAnimationFrame(() => ScrollTrigger.refresh());
});

/* ───────────── Intro: black → a line of light → the frame opens on the reel ───────────── */
function intro() {
  const el = document.querySelector<HTMLElement>('.intro');
  if (!el) return;
  const seen = sessionStorage.getItem('ei-intro') === '1';
  const nameLines = document.querySelectorAll('.hero__name .w');
  const meta = document.querySelectorAll('.hero__meta, .nav');
  if (reduced || seen) {
    el.classList.add('is-done');
    gsap.from(nameLines, { yPercent: 105, duration: 1.2, ease: EASE, stagger: 0.08, delay: 0.25 });
    return;
  }
  sessionStorage.setItem('ei-intro', '1');
  stopScroll();
  const bars = el.querySelectorAll('.intro__bars i');
  const line = el.querySelector('.intro__line');
  const count = el.querySelector<HTMLElement>('.intro__count');
  const media = document.querySelector('.hero__media');
  const counter = { f: 0 };
  gsap.set(meta, { opacity: 0 });
  gsap.set(nameLines, { yPercent: 105 });
  gsap.timeline({ onComplete: () => { el.classList.add('is-done'); startScroll(); } })
    .to(counter, {
      f: 48, duration: 1.4, ease: 'none',
      onUpdate: () => { if (count) count.textContent = `00:00:0${Math.floor(counter.f / 24)}:${String(Math.floor(counter.f % 24)).padStart(2, '0')}`; },
    })
    .to(line, { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, 0.15)
    .to(count, { opacity: 0, duration: 0.3 }, 1.3)
    .to(line, { opacity: 0, duration: 0.2 }, 1.45)
    .to(bars, { scaleY: 0, duration: 1.5, ease: 'expo.inOut' }, 1.35)
    .fromTo(media, { scale: 1.25 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 1.35)
    .to(nameLines, { yPercent: 0, duration: 1.5, ease: EASE, stagger: 0.09 }, 2.05)
    .to(meta, { opacity: 1, duration: 1, ease: 'power2.out' }, 2.6);
}

/* ───────────── Aperture reveals ───────────── */
function apertures() {
  const frames = gsap.utils.toArray<HTMLElement>('[data-aperture]:not(.is-open)');
  if (reduced) { frames.forEach((f) => f.classList.add('is-open')); return; }
  frames.forEach((frame) => {
    // Frames already in view at load (e.g. heroes) open immediately
    const media = frame.querySelector('img, video');
    ScrollTrigger.create({
      trigger: frame,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.timeline({ onComplete: () => { frame.classList.add('is-open'); gsap.set(frame, { clearProps: 'clipPath' }); } })
          .fromTo(frame, { clipPath: 'inset(49.5% 0% 49.5% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
          .from(media, { scale: 1.22, duration: 2.1, ease: EASE }, 0.1);
      },
    });
  });
}

/* ───────────── Parallax ───────────── */
function parallax() {
  if (reduced) return;
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((frame) => {
    const media = frame.querySelector(':scope > img, :scope > video');
    if (!media) return;
    gsap.fromTo(media, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  // Hero media drifts and dims as you leave it
  document.querySelectorAll<HTMLElement>('[data-hero]').forEach((hero) => {
    const media = hero.querySelector('.hero__media, .frame');
    gsap.to(media, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(hero.querySelector('[data-hero-text]'), { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '70% top', scrub: true } });
  });
}

/* ───────────── Headings: lines rise from behind a mask ───────────── */
function headings() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    if (reduced) return;
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    gsap.from(split.lines, {
      yPercent: 110, duration: 1.3, ease: EASE, stagger: 0.08,
      delay: el.dataset.split === 'now' ? 0.35 : 0,
      scrollTrigger: el.dataset.split === 'now' ? undefined : { trigger: el, start: 'top 85%', once: true },
    });
  });
}

/* ───────────── Statement: words come into focus as you read ───────────── */
function statement() {
  const p = document.querySelector<HTMLElement>('[data-statement]');
  if (!p || reduced) return;
  const split = SplitText.create(p, { type: 'words', wordsClass: 'word' });
  gsap.fromTo(split.words, { opacity: 0.16 }, {
    opacity: 1, stagger: 0.08, ease: 'none',
    scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });
}

/* ───────────── Films strip: pinned horizontal travel on desktop ───────────── */
function filmStrip() {
  const strip = document.querySelector<HTMLElement>('[data-strip]');
  if (!strip || reduced) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = strip.querySelector<HTMLElement>('.strip__track')!;
    const distance = () => track.scrollWidth - window.innerWidth;
    gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: { trigger: strip, start: 'top top', end: () => `+=${distance()}`, scrub: 0.6, pin: true, invalidateOnRefresh: true },
    });
  });
}

/* ───────────── Floating preview on the disciplines list ───────────── */
function floatPreview() {
  const list = document.querySelector<HTMLElement>('[data-float-list]');
  const box = document.querySelector<HTMLElement>('.float-preview');
  if (!list || !box || !finePointer) return;
  const imgs = box.querySelectorAll<HTMLImageElement>('img');
  const x = gsap.quickTo(box, 'x', { duration: 0.7, ease: 'power3' });
  const y = gsap.quickTo(box, 'y', { duration: 0.7, ease: 'power3' });
  const move = (e: PointerEvent) => { x(e.clientX + 120); y(e.clientY); };
  list.addEventListener('pointermove', move);
  list.querySelectorAll<HTMLElement>('[data-float]').forEach((a) => {
    a.addEventListener('pointerenter', () => {
      imgs.forEach((im) => im.classList.toggle('is-on', im.dataset.key === a.dataset.float));
    });
  });
  list.addEventListener('pointerenter', () => gsap.to(box, { clipPath: 'inset(0% 0 0% 0)', duration: 0.8, ease: 'expo.out' }));
  list.addEventListener('pointerleave', () => gsap.to(box, { clipPath: 'inset(50% 0 50% 0)', duration: 0.6, ease: 'expo.inOut' }));
}

/* ───────────── Muted video previews on hover ───────────── */
function hoverPreviews() {
  document.querySelectorAll<HTMLElement>('[data-preview]').forEach((card) => {
    const v = card.querySelector('video');
    if (!v || !finePointer) return;
    const on = () => {
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      v.play().then(() => card.classList.add('is-previewing')).catch(() => {});
    };
    const off = () => { card.classList.remove('is-previewing'); v.pause(); };
    card.addEventListener('pointerenter', on);
    card.addEventListener('pointerleave', off);
  });
}

/* ───────────── Lightbox ───────────── */
const lb = document.querySelector<HTMLDialogElement>('[data-lightbox]')!;
const lbImg = lb.querySelector<HTMLImageElement>('[data-lb-img]')!;
const lbCount = lb.querySelector<HTMLElement>('[data-lb-count]')!;
const lbCap = lb.querySelector<HTMLElement>('[data-lb-caption]')!;
const lbProj = lb.querySelector<HTMLAnchorElement>('[data-lb-project]')!;
let lbItems: HTMLElement[] = [];
let lbIndex = 0;

function lbShow(i: number, dir = 0) {
  lbIndex = (i + lbItems.length) % lbItems.length;
  const it = lbItems[lbIndex];
  const swap = () => {
    lbImg.src = it.dataset.full!;
    lbImg.alt = it.dataset.alt ?? '';
    lbCount.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(lbItems.length).padStart(2, '0')}`;
    lbCap.textContent = it.dataset.caption ?? '';
    if (it.dataset.project && it.dataset.projectUrl !== location.pathname) {
      lbProj.hidden = false; lbProj.href = it.dataset.projectUrl!; lbProj.textContent = `From ${it.dataset.project}`;
    } else lbProj.hidden = true;
  };
  if (!dir || reduced) { swap(); return; }
  gsap.timeline()
    .to(lbImg, { clipPath: 'inset(49.5% 0 49.5% 0)', duration: 0.35, ease: 'power3.in' })
    .add(swap)
    .to(lbImg, { clipPath: 'inset(0% 0 0% 0)', duration: 0.6, ease: 'expo.out' }, '+=0.05');
}
function lightbox() {
  lbItems = Array.from(document.querySelectorAll<HTMLElement>('[data-lb-item]'));
  lbItems.forEach((el) => {
    el.addEventListener('click', () => {
      lbItems = Array.from(document.querySelectorAll<HTMLElement>('[data-lb-item]')).filter((n) => !n.closest('[hidden]'));
      lbShow(lbItems.indexOf(el));
      lb.showModal();
      stopScroll();
      if (!reduced) gsap.fromTo(lb, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.9, ease: SHUTTER });
    });
  });
}
lb.querySelectorAll('[data-lb-prev]').forEach((b) => b.addEventListener('click', () => lbShow(lbIndex - 1, -1)));
lb.querySelectorAll('[data-lb-next]').forEach((b) => b.addEventListener('click', () => lbShow(lbIndex + 1, 1)));
lb.querySelector('[data-lb-close]')!.addEventListener('click', () => lb.close());
lb.addEventListener('close', () => { startScroll(); lbItems[lbIndex]?.focus(); });
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') lbShow(lbIndex + 1, 1);
  if (e.key === 'ArrowLeft') lbShow(lbIndex - 1, -1);
});
// Swipe on touch screens
let touchX = 0;
lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
});
lbProj.addEventListener('click', () => lb.close());

/* ───────────── Film player ───────────── */
const pl = document.querySelector<HTMLDialogElement>('[data-player]')!;
const plStage = pl.querySelector<HTMLElement>('[data-player-stage]')!;
const plTitle = pl.querySelector<HTMLElement>('[data-player-title]')!;

function embedUrl(url: string) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&dnt=1`;
  return null;
}
function player() {
  document.querySelectorAll<HTMLElement>('[data-film]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url || '';
      const file = btn.dataset.src || '';
      plTitle.textContent = btn.dataset.title ?? '';
      plStage.innerHTML = '';
      const embed = url ? embedUrl(url) : null;
      if (embed) {
        const f = document.createElement('iframe');
        f.src = embed; f.allow = 'autoplay; fullscreen; picture-in-picture'; f.allowFullscreen = true; f.title = btn.dataset.title ?? 'Film';
        plStage.append(f);
      } else {
        const v = document.createElement('video');
        v.src = url || file; v.controls = true; v.autoplay = true; v.playsInline = true;
        if (btn.dataset.poster) v.poster = btn.dataset.poster;
        plStage.append(v);
      }
      pl.showModal();
      stopScroll();
      if (!reduced) gsap.fromTo(pl, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 1, ease: SHUTTER });
    });
  });
}
pl.querySelector('[data-player-close]')!.addEventListener('click', () => pl.close());
pl.addEventListener('close', () => { plStage.innerHTML = ''; startScroll(); });

/* ───────────── Filters (portfolio + films) with Flip ───────────── */
function filters() {
  document.querySelectorAll<HTMLElement>('[data-filters]').forEach((bar) => {
    const target = document.querySelector<HTMLElement>(bar.dataset.filters!)!;
    const items = Array.from(target.querySelectorAll<HTMLElement>('[data-cat]'));
    const buttons = Array.from(bar.querySelectorAll<HTMLButtonElement>('[data-filter]'));
    const apply = (cat: string, animate = true) => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
      const state = Flip.getState(items);
      items.forEach((it) => { it.hidden = !(cat === 'all' || it.dataset.cat === cat); });
      if (animate && !reduced) {
        Flip.from(state, {
          duration: 0.9, ease: 'expo.inOut', absolute: true, scale: false,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, clipPath: 'inset(50% 0 50% 0)' }, { opacity: 1, clipPath: 'inset(0% 0 0% 0)', duration: 0.9, ease: 'expo.out' }),
          onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.35 }),
          onComplete: () => ScrollTrigger.refresh(),
        });
      } else ScrollTrigger.refresh();
      const url = new URL(location.href);
      if (cat === 'all') url.searchParams.delete('c'); else url.searchParams.set('c', cat);
      history.replaceState(history.state, '', url);
    };
    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter!)));
    const initial = new URLSearchParams(location.search).get('c');
    if (initial && buttons.some((b) => b.dataset.filter === initial)) apply(initial, false);
  });
}

/* ───────────── Contact form ───────────── */
function contactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact]');
  if (!form) return;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const started = form.querySelector<HTMLInputElement>('[name="_t"]')!;
  started.value = String(Date.now());

  const validate = () => {
    let ok = true;
    form.querySelectorAll<HTMLElement>('.field').forEach((f) => {
      const input = f.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea, select');
      const err = f.querySelector<HTMLElement>('.err');
      if (!input || !err) return;
      let msg = '';
      if (input.required && !input.value.trim()) msg = 'This field is needed so I can reply.';
      else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) msg = 'Check the email address, it looks incomplete.';
      err.textContent = msg;
      if (msg) { f.setAttribute('data-invalid', ''); ok = false; } else f.removeAttribute('data-invalid');
    });
    return ok;
  };

  const showDone = () => {
    const done = document.querySelector<HTMLElement>('[data-form-done]');
    if (!done) return;
    gsap.to(form, {
      clipPath: 'inset(50% 0 50% 0)', duration: reduced ? 0 : 0.7, ease: SHUTTER,
      onComplete: () => { form.hidden = true; done.hidden = false; gsap.from(done, { opacity: 0, y: 20, duration: 1, ease: EASE }); done.focus(); },
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) { form.querySelector<HTMLElement>('[data-invalid] input, [data-invalid] textarea')?.focus(); return; }
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    btn.disabled = true;
    status.dataset.state = '';
    status.textContent = 'Sending your message…';
    try {
      if (form.dataset.preview !== undefined) {
        // Static preview: there is no server, so show the confirmation without sending
        await new Promise((r) => setTimeout(r, 900));
        form.dispatchEvent(new CustomEvent('ei:sent'));
        showDone();
        return;
      }
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'The message could not be sent.');
      showDone();
    } catch (err) {
      status.dataset.state = 'error';
      status.textContent = `${(err as Error).message} Please email me directly instead.`;
      btn.disabled = false;
    }
  });
}

/* ───────────── Hero timecode follows the video ───────────── */
function heroClock() {
  const v = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  const tc = document.querySelector<HTMLElement>('[data-timecode]');
  if (!v || !tc) return;
  const fmt = (t: number) => {
    const s = Math.floor(t); const f = Math.floor((t - s) * 24);
    return `00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };
  let raf = 0;
  const tick = () => { tc.textContent = fmt(v.currentTime); raf = requestAnimationFrame(tick); };
  tick();
  cleanups.push(() => cancelAnimationFrame(raf));
  if (reduced) v.pause();
}

function toTop() {
  document.querySelectorAll<HTMLElement>('[data-to-top]').forEach((a) =>
    a.addEventListener('click', (e) => { e.preventDefault(); lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0 }); }),
  );
}
