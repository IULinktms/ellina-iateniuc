/**
 * Motion + interaction engine.
 * One idea runs through all of it: the aperture — a thin slit of light that opens to a full frame.
 * Runs once per full load, and re-initialises page-level behaviour after each client-side navigation.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase);
/* Base.astro imports this bundle after the first paint, so on a fast load the first astro:page-load
   (fired on window load) may already be over: then run the handler once this module has finished
   evaluating (a microtask), when every top-level const below exists. */
const onPageLoad = (fn: () => void) => {
  document.addEventListener('astro:page-load', fn);
  if (document.readyState === 'complete') queueMicrotask(fn);
};
// Strong custom curves (Emil Kowalski): ease-out for UI, ease-in-out for things moving on screen
CustomEase.create('uiOut', '0.23, 1, 0.32, 1');
CustomEase.create('uiInOut', '0.77, 0, 0.175, 1');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE = 'uiOut';
/* Interface strings for the current language, embedded by Base.astro */
type Strings = ReturnType<typeof import('../lib/i18n').clientStrings>;
const tx = (): Strings => {
  try { return JSON.parse(document.getElementById('i18n')?.textContent || '{}'); } catch { return {} as Strings; }
};
const fill = (tpl: string, v: Record<string, string>) => tpl.replace(/\{(\w)\}/g, (_, k) => v[k] ?? '');
const SHUTTER = 'uiInOut';

/* ───────────── Smooth scroll (once) ───────────── */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
let scrollLock: { y: number; body: HTMLElement; style: string; overflow: string; minHeight: string } | null = null;
const stopScroll = () => {
  if (scrollLock) return;
  const body = document.body;
  scrollLock = { y: window.scrollY, body, style: body.style.cssText, overflow: document.documentElement.style.overflow, minHeight: document.documentElement.style.minHeight };
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';
  // iOS ignores overflow-only locks. Fix the body at its existing visual position on touch.
  if (!finePointer) {
    // Keep the scroll range so fixing the body does not overwrite Router history with scrollY=0.
    document.documentElement.style.minHeight = `${document.documentElement.scrollHeight}px`;
    Object.assign(body.style, { position: 'fixed', top: `${-scrollLock.y}px`, left: '0', right: '0', width: '100%', overflow: 'hidden' });
  }
};
const startScroll = () => {
  const lock = scrollLock;
  scrollLock = null;
  if (lock) {
    lock.body.style.cssText = lock.style;
    document.documentElement.style.overflow = lock.overflow;
    document.documentElement.style.minHeight = lock.minHeight;
  }
  lenis?.start();
  if (lock && !finePointer) {
    lenis?.resize();
    if (lenis) lenis.scrollTo(lock.y, { immediate: true, force: true });
    else window.scrollTo({ top: lock.y, behavior: 'instant' });
  }
};

/* ───────────── Viewfinder (once): appears only over photographs and films ───────────── */
const cursor = document.querySelector<HTMLElement>('.cursor');
if (cursor && finePointer && !reduced) {
  document.documentElement.classList.add('has-cursor');
  const ring = cursor.querySelector<HTMLElement>('.cursor__ring')!;
  const label = cursor.querySelector<HTMLElement>('.cursor__label')!;
  const xr = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' });
  const yr = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' });
  const xl = gsap.quickTo(label, 'x', { duration: 0.35, ease: 'power3' });
  const yl = gsap.quickTo(label, 'y', { duration: 0.35, ease: 'power3' });
  let active = false;
  window.addEventListener('pointermove', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
    if (target) {
      if (!active) gsap.set([ring, label], { x: e.clientX, y: e.clientY }); // appear in place, no fly-in
      active = true;
      cursor.classList.add('is-active');
      cursor.dataset.mode = target.dataset.cursorMode ?? '';
      label.textContent = target.dataset.cursor ?? '';
    } else {
      active = false;
      cursor.classList.remove('is-active');
    }
    xr(e.clientX); yr(e.clientY); xl(e.clientX); yl(e.clientY);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { active = false; cursor.classList.remove('is-active'); });
}

/* ───────────── Menu (once — persisted element) ───────────── */
const menu = document.getElementById('menu')!;
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')!;
let menuOpen = false;
function setMenu(open: boolean) {
  menuOpen = open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? (tx().close || 'Close') : (tx().menu || 'Menu');
  menu.setAttribute('aria-hidden', String(!open));
  gsap.killTweensOf([menu, ...menu.querySelectorAll('.menu__list li')]);
  gsap.set(menu.querySelectorAll('.menu__list li'), { clearProps: 'transform,opacity' });
  if (open) {
    menu.classList.add('is-open');
    stopScroll();
    gsap.fromTo(menu, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: reduced ? 0 : 0.5, ease: SHUTTER });
    if (!reduced) gsap.from('.menu__list li', { y: 24, opacity: 0, stagger: 0.05, duration: 0.5, ease: EASE, delay: 0.15 });
    menu.querySelector<HTMLElement>('a')?.focus();
  } else {
    startScroll();
    // exits are quicker than entrances
    gsap.to(menu, { clipPath: 'inset(50% 0 50% 0)', duration: reduced ? 0 : 0.32, ease: SHUTTER, onComplete: () => menu.classList.remove('is-open') });
  }
}
toggle.addEventListener('click', () => setMenu(!menuOpen));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); toggle.focus(); } });

/* ───────────── Page transitions: the browser's view transitions (Astro ClientRouter).
   The clicked event photo morphs into the next page's cover via transition:name. ───────────── */
let restoringHistory = false;
document.addEventListener('astro:before-preparation', (e) => {
  restoringHistory = (e as Event & { navigationType: string }).navigationType === 'traverse';
  if (menuOpen) setMenu(false);
});
// ClientRouter owns scroll restoration, including back/forward and hash links.
// Synchronize Lenis after restoration rather than forcing every history entry to zero.

/* ───────────── Page-level setup (every navigation) ───────────── */
let ctx: gsap.Context | null = null;
const cleanups: Array<() => void> = [];

document.addEventListener('astro:before-swap', () => {
  // Unlock synchronously: a dialog's queued close event must not restore the old page's scroll later.
  startScroll();
  cleanups.splice(0).forEach((fn) => fn());
  ctx?.revert();
  ctx = null;
  initializedMain = null;
  cursor?.classList.remove('is-active');
  ScrollTrigger.getAll().forEach((t) => t.kill());
});

let initializedMain: Element | null = null;
let clientArrival = false;
function setupPage() {
  const main = document.querySelector('main');
  if (!main || initializedMain === main) return;
  initializedMain = main;
  // ClientRouter replaces html attributes; restore enhancement flags before measuring layout.
  document.documentElement.classList.add('js');
  document.documentElement.classList.toggle('has-cursor', !!cursor && finePointer && !reduced);
  if (lenis) document.documentElement.classList.add('lenis');
  const page = document.body.dataset.page ?? '';
  // Persisted language navigation must follow the current story, not the entry page.
  const rest = location.pathname.replace(/^\/(ro|en)(?=\/|$)/, '') || '/';
  document.querySelectorAll<HTMLAnchorElement>('.lang a[hreflang]').forEach((a) => {
    const prefix = a.hreflang === 'ru' ? '' : `/${a.hreflang}`;
    a.href = `${prefix}${rest}${location.search}${location.hash}`;
  });
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    if (a.dataset.nav === page) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  ctx = gsap.context(() => {
    if (page === 'home') intro();
    apertures();
    parallax();
    headings();
    reveals();
    filmStrip();
    floatPreview();
    contactSheet();
    marquee();
    projectStory();
    homeShutter();
    proofNumbers();
    viewfinder();
    magnetic();
    hoverPreviews();
    lightbox();
    player();
    filters();
    contactForm();
    mobileBooking();
    heroClock();
    deliveryCalc();
    runOfShow();
    toTop();
  });
  document.documentElement.classList.add('motion-ready');
  let alive = true, refreshFrame = 0;
  const refresh = () => {
    if (!alive || refreshFrame) return;
    refreshFrame = requestAnimationFrame(() => { refreshFrame = 0; if (alive) { ScrollTrigger.sort(); ScrollTrigger.refresh(true); } });
  };
  const imageLoaded = (e: Event) => { if (e.target instanceof HTMLImageElement) refresh(); };
  document.addEventListener('load', imageLoaded, true);
  document.fonts.ready.then(refresh);
  refresh();
  cleanups.push(() => { alive = false; cancelAnimationFrame(refreshFrame); document.removeEventListener('load', imageLoaded, true); });
}
// Initialize the incoming DOM before the transition snapshot, never after it has opened.
document.addEventListener('astro:after-swap', () => {
  // The browser may clamp history scroll before our pin spacers exist. Save the target first.
  const restoredY = restoringHistory ? (history.state?.scrollY ?? window.scrollY) : window.scrollY;
  clientArrival = true;
  setupPage();
  lenis?.resize();
  if (lenis) lenis.scrollTo(restoredY, { immediate: true, force: true });
  else window.scrollTo({ top: restoredY, behavior: 'instant' });
  ScrollTrigger.update();
});
document.addEventListener('astro:page-load', () => {
  setupPage();
  lenis?.resize();
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
  // Safari can retain focus on the first link after pointer navigation. Keep keyboard skip navigation intact.
  if (clientArrival && document.activeElement?.matches('.skip-link')) (document.activeElement as HTMLElement).blur();
});

/* ───────────── Intro: black → a line of light → the frame opens on the reel.
   Once per visit, about 1.6 s, and any key, click or scroll skips it. ───────────── */
function intro() {
  // WS3: the aperture happens on first scroll; the opening proposition is readable immediately.
  document.querySelector('.intro')?.classList.add('is-done');
}

/* ───────────── Section entrances: heading, then text, then picture (once) ───────────── */
function reveals() {
  if (reduced) return;
  gsap.utils.toArray<HTMLElement>('[data-reveal], .spread__text, .section-head, .page-head__row, .p-facts, .principles li, .process li, .film-card, .session').forEach((group) => {
    const parts = group.matches('[data-reveal], .spread__text, .page-head__row') ? Array.from(group.children) : [group];
    if (group.getBoundingClientRect().top < innerHeight) { gsap.set(parts, { opacity: 1, y: 0 }); return; }
    gsap.fromTo(parts, { y: 24, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.07,
      scrollTrigger: { trigger: group, start: 'top 88%', once: true },
    });
  });
}

/* ───────────── Aperture reveals ───────────── */
function apertures() {
  const frames = gsap.utils.toArray<HTMLElement>('[data-aperture]:not(.is-open)');
  if (reduced) { frames.forEach((f) => f.classList.add('is-open')); return; }
  frames.forEach((frame) => {
    // Never hide media already in view; the page aperture/shared-photo morph owns navigation entry.
    const alreadyPainted = getComputedStyle(frame).clipPath === 'inset(0px 0px 0px 0px)';
    if (alreadyPainted || frame.getBoundingClientRect().top < innerHeight) { frame.classList.add('is-open'); return; }
    const media = frame.querySelector('img, video');
    let opening: gsap.core.Timeline | undefined;
    let alive = true;
    cleanups.push(() => { alive = false; opening?.kill(); });
    ScrollTrigger.create({
      trigger: frame,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        const open = () => {
          if (!alive || !frame.isConnected) return;
          frame.classList.add('is-opening');
          frame.classList.remove('is-pending', 'is-loaded');
          opening = gsap.timeline({ onComplete: () => {
            frame.classList.add('is-open'); frame.classList.remove('is-opening');
            gsap.set(frame, { clearProps: 'clipPath' });
            if (media && !frame.hasAttribute('data-parallax') && !frame.closest('.p-hero, .g-full')) gsap.set(media, { clearProps: 'transform' });
          } })
            .fromTo(frame, { clipPath: 'inset(49.5% 0% 49.5% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' });
          if (media && !frame.closest('.p-hero, .g-full')) opening.from(media, { scale: 1.18, duration: 1.8, ease: 'expo.out' }, 0.05);
        };
        if (media instanceof HTMLImageElement) { media.loading = 'eager'; media.decode().then(open, open); }
        else open();
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
  if (reduced) return;
  let alive = true;
  const render = () => {
    if (!alive) return;
    ctx?.add(() => splitHeadings());
  };
  if (document.fonts.status === 'loaded') splitHeadings();
  else document.fonts.ready.then(render);
  cleanups.push(() => { alive = false; });
}
function splitHeadings() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    if (reduced) return;
    if (el.dataset.split === 'now' || el.getBoundingClientRect().top < innerHeight) return;
    bindNbsp(el);
    let revealed = false;
    const split = SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
      aria: /^H[1-6]$/.test(el.tagName) ? 'auto' : 'none',
      onSplit: (self) => {
        // A resize/font resplit must not conceal words that have already entered.
        if (revealed || el.getBoundingClientRect().top < innerHeight) {
          revealed = true;
          return gsap.set(self.lines, { yPercent: 0 });
        }
        return gsap.fromTo(self.lines, { yPercent: 110 }, {
          yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06,
          onStart: () => { revealed = true; },
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      },
    });
    cleanups.push(() => split.revert());
  });
}

/* SplitText re-wraps with ordinary spaces, losing the typesetter's no-break spaces (lib/typography.mjs):
   „sau o” would end a line again. Words bound by U+00A0 go into a nowrap span first, which SplitText keeps. */
function bindNbsp(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) if ((walker.currentNode as Text).data.includes('\u00A0')) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const frag = document.createDocumentFragment();
    for (const part of node.data.split(/(\S+(?:\u00A0\S+)+)/)) {
      if (!part) continue;
      if (part.includes('\u00A0')) {
        const span = document.createElement('span');
        span.style.whiteSpace = 'nowrap';
        span.textContent = part.replace(/\u00A0/g, ' ');
        frag.append(span);
      } else frag.append(part);
    }
    node.replaceWith(frag);
  }
  // A bound group wider than its line (big display type on a phone) would overflow: let it break
  const width = el.clientWidth;
  el.querySelectorAll<HTMLElement>(':scope span[style*="nowrap"]').forEach((span) => {
    if (span.getBoundingClientRect().width > width) span.replaceWith(span.textContent ?? '');
  });
}

/* ───────────── Films strip: pinned horizontal travel on desktop ───────────── */
function filmStrip() {
  const strip = document.querySelector<HTMLElement>('[data-strip]');
  if (!strip || reduced || (!clientArrival && strip.getBoundingClientRect().top < innerHeight)) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = strip.querySelector<HTMLElement>('.strip__track')!;
    const distance = () => track.scrollWidth - window.innerWidth;
    // The track travels its full width over 40% of that in scroll: a short pin, still easy to follow
    gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: { trigger: strip, start: 'top top', end: () => `+=${Math.round(distance() * 0.4)}`, scrub: 0.6, pin: true, pinType: 'transform', anticipatePin: 1, pinSpacing: true, invalidateOnRefresh: true },
    });
  });
}

/* ───────────── Floating preview on the disciplines list ───────────── */
function floatPreview() {
  const list = document.querySelector<HTMLElement>('[data-float-list]');
  const box = document.querySelector<HTMLElement>('.float-preview');
  if (!list || !box || !finePointer || reduced) return;
  const imgs = box.querySelectorAll<HTMLImageElement>('img');
  const x = gsap.quickTo(box, 'x', { duration: 0.7, ease: 'power3' });
  const y = gsap.quickTo(box, 'y', { duration: 0.7, ease: 'power3' });
  let open = false;
  let lastX = -1, lastY = -1;
  const move = (e: PointerEvent) => { lastX = e.clientX; lastY = e.clientY; x(e.clientX + 120); y(e.clientY); };
  const show = (e: PointerEvent) => {
    // Never open at the box's resting spot (0,0 = top-left corner): jump to the pointer first
    lastX = e.clientX; lastY = e.clientY;
    gsap.set(box, { x: e.clientX + 120, y: e.clientY });
    open = true;
    gsap.to(box, { clipPath: 'inset(0% 0 0% 0)', duration: 0.8, ease: 'expo.out', overwrite: 'auto' });
  };
  const hide = () => {
    if (!open) return;
    open = false;
    gsap.to(box, { clipPath: 'inset(50% 0 50% 0)', duration: 0.5, ease: 'expo.inOut', overwrite: 'auto' });
  };
  list.addEventListener('pointermove', move);
  list.querySelectorAll<HTMLElement>('[data-float]').forEach((a) => {
    a.addEventListener('pointerenter', () => {
      imgs.forEach((im) => im.classList.toggle('is-on', im.dataset.key === a.dataset.float));
    });
  });
  list.addEventListener('pointerenter', show);
  list.addEventListener('pointerleave', hide);
  // Scrolling moves the list away from a still pointer without any pointerleave: close if it is no longer under it
  const onScroll = () => {
    if (!open) return;
    const r = list.getBoundingClientRect();
    if (lastX < r.left || lastX > r.right || lastY < r.top || lastY > r.bottom) hide();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('blur', hide);
  cleanups.push(() => {
    list.removeEventListener('pointermove', move);
    list.removeEventListener('pointerenter', show);
    list.removeEventListener('pointerleave', hide);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('blur', hide);
    gsap.killTweensOf(box);
    gsap.set(box, { clipPath: 'inset(50% 0 50% 0)' });
  });
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

let lbRequest = 0;
let lbAnimation: gsap.core.Timeline | undefined;
async function lbShow(i: number, dir = 0) {
  if (!lbItems.length) return;
  const request = ++lbRequest;
  lbAnimation?.kill();
  gsap.killTweensOf(lbImg);
  gsap.set(lbImg, { opacity: 1, x: 0 });
  lbIndex = (i + lbItems.length) % lbItems.length;
  const index = lbIndex;
  const it = lbItems[index];
  const status = lb.querySelector<HTMLElement>('[data-lb-status]')!;
  status.textContent = tx().loading;
  const decoded = new Image();
  decoded.src = it.dataset.full!;
  try { await decoded.decode(); } catch {
    if (request === lbRequest) status.textContent = tx().imageError;
    return;
  }
  if (request !== lbRequest || !lb.open) return;
  const swap = () => {
    resetPhotoZoom();
    lbImg.src = decoded.src;
    lbImg.alt = it.dataset.alt ?? '';
    status.textContent = '';
    lbCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(lbItems.length).padStart(2, '0')}`;
    lbCap.textContent = it.dataset.caption ?? '';
    if (it.dataset.project && it.dataset.projectUrl !== location.pathname) {
      lbProj.hidden = false; lbProj.href = it.dataset.projectUrl!; lbProj.textContent = fill(tx().from || 'From {x}', { x: it.dataset.project! });
    } else lbProj.hidden = true;
    for (const offset of [-1, 1]) {
      const adjacent = lbItems[(index + offset + lbItems.length) % lbItems.length];
      if (adjacent?.dataset.full) { const preload = new Image(); preload.src = adjacent.dataset.full; }
    }
  };
  if (!dir || reduced) { swap(); return; }
  lbAnimation = gsap.timeline()
    .to(lbImg, { opacity: 0, x: -dir * 24, duration: 0.14, ease: 'power1.out' })
    .add(swap)
    .fromTo(lbImg, { opacity: 0, x: dir * 32 }, { opacity: 1, x: 0, duration: 0.32, ease: EASE });
}
function lightbox() {
  lbItems = Array.from(document.querySelectorAll<HTMLElement>('[data-lb-item]'));
  lbItems.forEach((el) => {
    el.addEventListener('click', () => {
      lbItems = Array.from(document.querySelectorAll<HTMLElement>('[data-lb-item]')).filter((n) => !n.closest('[hidden]'));
      lbShow(lbItems.indexOf(el));
      lb.showModal();
      stopScroll();
      if (!reduced) gsap.fromTo(lb, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.45, ease: SHUTTER });
    });
  });
}
lb.querySelectorAll('[data-lb-prev]').forEach((b) => b.addEventListener('click', () => lbShow(lbIndex - 1, -1)));
lb.querySelectorAll('[data-lb-next]').forEach((b) => b.addEventListener('click', () => lbShow(lbIndex + 1, 1)));
lb.querySelector('[data-lb-close]')!.addEventListener('click', () => lb.close());
lb.addEventListener('close', () => { ++lbRequest; lbAnimation?.kill(); gsap.killTweensOf([lb, lbImg]); lbImg.removeAttribute('src'); gsap.set(lbImg, { opacity: 1, x: 0 }); resetPhotoZoom(); startScroll(); lbItems[lbIndex]?.focus(); });
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
  if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
});
// Swipe on touch screens
let touchX = 0;
lb.addEventListener('touchstart', (e) => { touchX = e.touches.length === 1 && photoZoom === 1 ? e.touches[0].clientX : NaN; }, { passive: true });
lb.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (photoZoom === 1 && Number.isFinite(touchX) && Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
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
  cleanups.push(() => { gsap.killTweensOf(pl); if (pl.open) pl.close(); });
  document.querySelectorAll<HTMLElement>('[data-film]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url || '';
      const file = btn.dataset.src || '';
      plTitle.textContent = btn.dataset.title ?? '';
      plStage.innerHTML = '';
      // 9:16 Reels get a 9:16 stage (no letterboxing in a 16:9 box)
      pl.dataset.aspect = btn.dataset.aspect === 'portrait' ? 'portrait' : 'landscape';
      const embed = url ? embedUrl(url) : null;
      if (embed) {
        const f = document.createElement('iframe');
        f.src = embed; f.allow = 'autoplay; fullscreen; picture-in-picture'; f.allowFullscreen = true; f.title = btn.dataset.title ?? 'Film';
        plStage.append(f);
      } else {
        const v = document.createElement('video');
        v.src = url || file; v.controls = true; v.autoplay = true; v.playsInline = true;
        if (btn.dataset.poster) v.poster = btn.dataset.poster;
        // The file knows its own shape: trust it over the CMS setting
        v.addEventListener('loadedmetadata', () => {
          if (v.videoWidth && v.videoHeight) pl.dataset.aspect = v.videoHeight > v.videoWidth ? 'portrait' : 'landscape';
        }, { once: true });
        plStage.append(v);
      }
      pl.showModal();
      stopScroll();
      if (!reduced) gsap.fromTo(pl, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.5, ease: SHUTTER });
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
    let animation: gsap.core.Timeline | undefined;
    cleanups.push(() => { animation?.kill(); gsap.killTweensOf(items); });
    const apply = (cat: string, animate = true) => {
      if (animation?.isActive()) animation.progress(1);
      animation?.kill();
      gsap.killTweensOf(items);
      gsap.set(items, { clearProps: 'opacity,clipPath' });
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
      const state = Flip.getState(items);
      items.forEach((it) => {
        it.hidden = !(cat === 'all' || it.dataset.cat === cat);
        if (animate && !it.hidden) it.querySelectorAll<HTMLElement>('[data-aperture]').forEach((frame) => {
          ScrollTrigger.getAll().filter((t) => t.trigger === frame).forEach((t) => t.kill());
          gsap.killTweensOf(frame); frame.classList.add('is-open'); gsap.set(frame, { clearProps: 'clipPath' });
        });
      });
      if (animate && !reduced) {
        animation = Flip.from(state, {
          duration: 0.6, ease: SHUTTER, absolute: true, scale: false,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, clipPath: 'inset(50% 0 50% 0)' }, { opacity: 1, clipPath: 'inset(0% 0 0% 0)', duration: 0.6, ease: EASE }),
          onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.2 }),
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
  const steps = Array.from(form.querySelectorAll<HTMLElement>('[data-booking-step]'));
  const nav = form.querySelector<HTMLElement>('[data-step-nav]');
  const controls = form.querySelector<HTMLElement>('[data-step-controls]');
  const back = form.querySelector<HTMLButtonElement>('[data-step-back]');
  const next = form.querySelector<HTMLButtonElement>('[data-step-next]');
  const foot = form.querySelector<HTMLElement>('[data-form-foot]');
  const stepStatus = form.querySelector<HTMLElement>('[data-step-status]');
  const stepButtons = Array.from(form.querySelectorAll<HTMLButtonElement>('[data-step-go]'));
  const date = form.querySelector<HTMLInputElement>('[data-date-input]');
  if (date) date.min = iso(new Date());
  let step = 0;
  let pending = false;
  const listeners: Array<() => void> = [];
  const listen = (el: EventTarget, type: string, handler: EventListener) => { el.addEventListener(type, handler); listeners.push(() => el.removeEventListener(type, handler)); };
  const show = (index: number, focus = true) => {
    step = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((el, i) => { el.hidden = i !== step; });
    stepButtons.forEach((el, i) => { if (i === step) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current'); });
    if (back) back.hidden = step === 0;
    if (next) next.hidden = step === steps.length - 1;
    if (foot) foot.hidden = step !== steps.length - 1;
    if (stepStatus) stepStatus.textContent = fill(tx().stepOf, { x: String(step + 1) });
    if (focus) steps[step]?.focus({ preventScroll: true });
  };
  const validate = (root: HTMLElement) => {
    let ok = true;
    root.querySelectorAll<HTMLElement>('.field').forEach((field) => {
      const input = field.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select');
      const error = field.querySelector<HTMLElement>('.err');
      if (!input || !error) return;
      let message = '';
      if (input.required && !input.value.trim()) message = tx().required;
      else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) message = tx().emailBad;
      else if (input.type === 'date' && (!input.validity.valid || (input.value && input.value < (input as HTMLInputElement).min))) message = tx().dateBad;
      error.textContent = message;
      input.setAttribute('aria-invalid', String(!!message));
      field.toggleAttribute('data-invalid', !!message);
      if (message) ok = false;
    });
    if (!ok) root.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return ok;
  };
  const go = (index: number) => {
    if (pending) return;
    if (index > step) for (let i = step; i < index; i++) {
      show(i, false);
      if (!validate(steps[i])) return;
    }
    show(index);
  };
  if (steps.length) {
    if (nav) nav.hidden = false;
    if (controls) controls.hidden = false;
    if (back) listen(back, 'click', () => go(step - 1));
    if (next) listen(next, 'click', () => go(step + 1));
    stepButtons.forEach((button, i) => listen(button, 'click', () => go(i)));
    show(0, false);
  }
  let request: AbortController | null = null;
  let timeout = 0;
  let successAnimation: gsap.core.Tween | undefined;
  const submit = async (event: Event) => {
    event.preventDefault();
    if (pending) return;
    if (steps.length && step < steps.length - 1) { go(step + 1); return; }
    for (let i = 0; i < steps.length; i++) {
      // Only change the visible step if it has invalid fields.
      const required = Array.from(steps[i].querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[required],textarea[required]'));
      if (required.some((el) => !el.value.trim()) || (i === 1 && date?.value && !date.validity.valid)) { show(i, false); validate(steps[i]); return; }
    }
    if (!validate(steps[step] || form)) return;
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    pending = true; button.disabled = true;
    status.dataset.state = ''; status.textContent = tx().sending;
    request = new AbortController();
    timeout = window.setTimeout(() => request?.abort(), 15000);
    try {
      if (form.dataset.preview === undefined) {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: request.signal });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) throw new Error(data.error || tx().formError);
      }
      if (!form.isConnected) return;
      const done = document.querySelector<HTMLElement>('[data-form-done]');
      if (done) {
        form.hidden = true; done.hidden = false; done.focus();
        if (!reduced) successAnimation = gsap.from(done, { opacity: 0, y: 12, duration: 0.3, ease: EASE });
      }
    } catch (error) {
      if (form.isConnected) {
        status.dataset.state = 'error';
        const message = error instanceof Error && error.name !== 'TypeError' && error.name !== 'AbortError' ? error.message : tx().formError;
        status.textContent = `${message} ${tx().errorTail}`;
      }
    } finally { window.clearTimeout(timeout); pending = false; button.disabled = false; }
  };
  listen(form, 'submit', submit);
  cleanups.push(() => { listeners.forEach((off) => off()); window.clearTimeout(timeout); request?.abort(); successAnimation?.kill(); });
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
  const tick = () => { tc.textContent = fmt(v.currentTime); };
  v.addEventListener('timeupdate', tick);
  tick();
  cleanups.push(() => v.removeEventListener('timeupdate', tick));
  if (reduced) v.pause();
}

function toTop() {
  document.querySelectorAll<HTMLElement>('[data-to-top]').forEach((a) =>
    a.addEventListener('click', (e) => { e.preventDefault(); lenis ? lenis.scrollTo(0, { duration: 1.2 }) : window.scrollTo({ top: 0 }); }),
  );
}

/* ───────────── Live element: event date → delivery dates ───────────── */
const fmtDay = { format: (d: Date) => new Intl.DateTimeFormat(tx().dateLocale || 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(d) };
function addWorkingDays(from: Date, n: number) {
  const d = new Date(from);
  let left = n;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) left--;
  }
  return d;
}
function parseDate(v: string) {
  const [y, m, d] = v.split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function deliveryCalc() {
  document.querySelectorAll<HTMLElement>('[data-calc]').forEach((root) => {
    const input = root.querySelector<HTMLInputElement>('[data-calc-input]')!;
    const out = {
      preview: root.querySelector<HTMLElement>('[data-calc-preview]')!,
      gallery: root.querySelector<HTMLElement>('[data-calc-gallery]')!,
      film: root.querySelector<HTMLElement>('[data-calc-film]')!,
    };
    const cta = root.querySelector<HTMLAnchorElement>('[data-calc-cta]');
    const ctaBase = cta?.getAttribute('href')?.split('?')[0] ?? '/contact/';
    const time = root.dataset.preview || '21:00';
    const g = Number(root.dataset.gallery || 5);
    const f = Number(root.dataset.filmDays || 10);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    input.min = iso(today);
    if (!input.value) input.value = iso(addWorkingDays(today, 15));
    const set = (el: HTMLElement, text: string) => {
      if (el.textContent === text) return;
      el.textContent = text;
      if (!reduced) { el.classList.remove('is-new'); void el.offsetWidth; el.classList.add('is-new'); }
    };
    const update = () => {
      const d = parseDate(input.value);
      if (!d) return;
      set(out.preview, `${fmtDay.format(d)}, ${time}`);
      set(out.gallery, fmtDay.format(addWorkingDays(d, g)));
      set(out.film, fmtDay.format(addWorkingDays(d, f)));
      if (cta) cta.setAttribute('href', `${ctaBase}?date=${input.value}`);
    };
    input.addEventListener('input', update);
    update();
  });

  // Booking form: prefill from ?date= and explain delivery under the date field
  const dateInput = document.querySelector<HTMLInputElement>('[data-date-input]');
  const hint = document.querySelector<HTMLElement>('[data-date-hint]');
  if (dateInput && hint) {
    const q = new URLSearchParams(location.search).get('date');
    if (q && parseDate(q)) dateInput.value = q;
    const time = hint.dataset.preview || '21:00';
    const g = Number(hint.dataset.gallery || 5);
    const upd = () => {
      const d = parseDate(dateInput.value);
      if (!d) return;
      hint.textContent = fill(tx().hint, { d: fmtDay.format(d), t: time, g: fmtDay.format(addWorkingDays(d, g)) });
    };
    dateInput.addEventListener('input', upd);
    upd();
  }
}

/* ───────────── Run of show: the picture holds while the day's moments pass ───────────── */
function runOfShow() {
  const root = document.querySelector<HTMLElement>('[data-ros]');
  if (!root || !('IntersectionObserver' in window)) return;
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-ros-item]'));
  const pics = Array.from(root.querySelectorAll<HTMLImageElement>('.ros__pictures img'));
  const clock = root.querySelector<HTMLElement>('[data-ros-clock]');
  primeRosPictures(root, pics);
  const show = (i: number) => {
    items.forEach((el, k) => el.classList.toggle('is-active', k === i));
    pics.forEach((el, k) => el.classList.toggle('is-on', k === i));
    if (clock) clock.textContent = items[i]?.dataset.time ?? '';
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) show(items.indexOf(e.target as HTMLElement));
  }, { rootMargin: '-45% 0px -45% 0px' });
  items.forEach((el) => io.observe(el));
  show(0);
  cleanups.push(() => io.disconnect());
}

/* ═════════════════════════ Wow pass ═════════════════════════ */

/* ───────────── Hero viewfinder: focus point follows the pointer and locks when it settles;
   exposure readout reacts to where you point (brighter top-left, darker bottom-right). ───────────── */
function viewfinder() {
  const vf = document.querySelector<HTMLElement>('[data-vf]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!vf || !hero) return;
  const focus = vf.querySelector<HTMLElement>('[data-vf-focus]')!;
  const iso = vf.querySelector<HTMLElement>('[data-vf-iso]')!;
  const ap = vf.querySelector<HTMLElement>('[data-vf-ap]')!;
  const sh = vf.querySelector<HTMLElement>('[data-vf-sh]')!;
  const ev = Array.from(vf.querySelectorAll<HTMLElement>('[data-vf-ev] b'));
  const ISO = ['800', '1600', '3200', '6400'];
  const AP = ['1.8', '2', '2.8', '4'];
  const SH = ['1/500', '1/250', '1/160', '1/125', '1/80'];
  const pick = <T,>(arr: T[], t: number) => arr[Math.min(arr.length - 1, Math.max(0, Math.floor(t * arr.length)))];

  vf.classList.add('is-live');
  if (!finePointer || reduced) {
    // Touch / reduced motion: a still focus point that locks once, like half-pressing the shutter
    const t = window.setTimeout(() => focus.classList.add('is-locked'), 1800);
    cleanups.push(() => clearTimeout(t));
    return;
  }
  const fx = gsap.quickTo(focus, 'x', { duration: 0.45, ease: 'power3' });
  const fy = gsap.quickTo(focus, 'y', { duration: 0.45, ease: 'power3' });
  const r = hero.getBoundingClientRect();
  gsap.set(focus, { x: r.width / 2, y: r.height * 0.42 });
  let settle = 0;
  const move = (e: PointerEvent) => {
    fx(e.clientX); fy(e.clientY);
    focus.classList.remove('is-locked');
    clearTimeout(settle);
    settle = window.setTimeout(() => focus.classList.add('is-locked'), 320);
    const tx = e.clientX / window.innerWidth;
    const ty = e.clientY / window.innerHeight;
    iso.textContent = `ISO ${pick(ISO, ty)}`;
    ap.textContent = `ƒ/${pick(AP, tx)}`;
    sh.textContent = pick(SH, (tx + ty) / 2);
    const on = Math.round((1 - (tx + ty) / 2) * (ev.length - 1));
    ev.forEach((b, i) => b.classList.toggle('is-on', i === on));
  };
  const enter = () => vf.classList.add('is-live');
  const leave = () => { vf.classList.remove('is-live'); focus.classList.remove('is-locked'); };
  hero.addEventListener('pointermove', move);
  hero.addEventListener('pointerenter', enter);
  hero.addEventListener('pointerleave', leave);
  // Hide the focus point once the hero scrolls away
  const st = ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', onLeave: leave, onEnterBack: enter });
  cleanups.push(() => {
    clearTimeout(settle); st.kill(); gsap.killTweensOf(focus);
    hero.removeEventListener('pointermove', move);
    hero.removeEventListener('pointerenter', enter);
    hero.removeEventListener('pointerleave', leave);
  });
}

/* ───────────── Contact sheet: one frame fills the screen, scroll pulls back to the full sheet,
   then the grease pencil circles the select. Desktop pins; phones just reveal. ───────────── */
function contactSheet() {
  const root = document.querySelector<HTMLElement>('[data-sheet]');
  if (!root) return;
  // A slow first download must not turn an already-visible static sheet into a zoomed pin.
  if (!clientArrival && root.getBoundingClientRect().top < innerHeight) return;
  const grid = root.querySelector<HTMLElement>('[data-sheet-grid]')!;
  const hero = root.querySelector<HTMLElement>('.sheet__cell.is-hero .sheet__img')!;
  const others = root.querySelectorAll<HTMLElement>('.sheet__cell:not(.is-hero)');
  const nums = root.querySelectorAll<HTMLElement>('.sheet__num');
  const mark = root.querySelector<SVGPathElement>('.sheet__mark path');
  const copy = root.querySelectorAll<HTMLElement>('[data-sheet-copy] > *');
  if (reduced) return;
  const dimmed = root.querySelectorAll<HTMLElement>('.sheet__cell:not(.is-hero):not(.is-select) .sheet__img');
  // Load every frame well before the sheet arrives, so none pop in mid-animation
  const imgs = root.querySelectorAll<HTMLImageElement>('img');
  ScrollTrigger.create({
    trigger: root, start: 'top bottom+=150%', once: true,
    onEnter: () => imgs.forEach((im) => { im.loading = 'eager'; }),
  });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', () => {
    // Scale the sheet so the centre frame covers the viewport
    const cover = () => {
      const w = hero.offsetWidth, h = hero.offsetHeight;
      return Math.max(window.innerWidth / w, window.innerHeight / h) * 1.02;
    };
    // Grid centre minus hero frame centre, from layout (unaffected by transforms)
    const cell = hero.parentElement as HTMLElement;
    const ox = () => grid.offsetWidth / 2 - (cell.offsetLeft + hero.offsetWidth / 2);
    const oy = () => grid.offsetHeight / 2 - (cell.offsetTop + hero.offsetHeight / 2);
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root, start: 'top top', end: '+=60%', scrub: 0.5, pin: true, refreshPriority: 1, anticipatePin: 1, invalidateOnRefresh: true },
    });
    tl.fromTo(grid, { scale: () => cover(), x: () => ox() * cover(), y: () => oy() * cover() }, { scale: 1, x: 0, y: 0, duration: 1, ease: 'power2.inOut' })
      .fromTo(others, { opacity: 0.35 }, { opacity: 1, duration: 0.6 }, 0.25)
      .fromTo(nums, { opacity: 0 }, { opacity: 0.85, duration: 0.3 }, 0.7)
      // Dim with opacity over the near-black sheet, not filter: filters repaint every frame and flicker while scaled
      .fromTo(dimmed, { opacity: 1 }, { opacity: 0.5, duration: 0.3 }, 1.05)
      .to(mark, { strokeDashoffset: 0, duration: 0.45, ease: 'power1.inOut' }, 1.0)
      .from(copy, { y: 30, opacity: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }, 1.1)
      .to({}, { duration: 0.25 }); // hold before release
  });
  mm.add('(max-width: 760px)', () => {
    gsap.from(root.querySelectorAll('.sheet__cell'), {
      opacity: 0, y: 14, duration: 0.6, ease: 'power2.out', stagger: { each: 0.03, from: 'center' },
      scrollTrigger: { trigger: grid, start: 'top 80%', once: true },
    });
    if (mark) gsap.to(mark, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', scrollTrigger: { trigger: grid, start: 'center 60%', once: true } });
  });
}

/* ───────────── Marquee: drifts on its own, speeds up and leans with scroll velocity,
   and reverses when you scroll back up. ───────────── */
function marquee() {
  const root = document.querySelector<HTMLElement>('[data-marquee]');
  if (!root || reduced) return;
  const track = root.querySelector<HTMLElement>('[data-marquee-track]')!;
  let width = (track.firstElementChild as HTMLElement).offsetWidth;
  const measure = () => { width = (track.firstElementChild as HTMLElement).offsetWidth; };
  const resize = new ResizeObserver(measure); resize.observe(track.firstElementChild!);
  cleanups.push(() => resize.disconnect());
  let x = 0, dir = -1, boost = 0;
  const skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' });
  ScrollTrigger.create({
    trigger: root, start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => {
      const v = self.getVelocity();
      dir = self.direction === 1 ? -1 : 1;
      boost = Math.min(Math.abs(v) / 120, 14);
      skew(gsap.utils.clamp(-8, 8, -v / 400));
    },
  });
  const tick = () => {
    const w = width;
    if (!w) return;
    x += dir * (0.6 + boost);
    boost *= 0.92;
    if (Math.abs(boost) < 0.05) skew(0);
    if (x <= -w) x += w;
    if (x > 0) x -= w;
    gsap.set(track, { x });
  };
  gsap.ticker.add(tick);
  cleanups.push(() => gsap.ticker.remove(tick));
}

/* ───────────── Magnetic buttons (precise pointers only) ───────────── */
function magnetic() {
  if (!finePointer || reduced) return;
  document.querySelectorAll<HTMLElement>('.btn, .nav__cta').forEach((el) => {
    if (el.dataset.magnetic) return;
    el.dataset.magnetic = '1';
    el.classList.add('is-magnetic');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); delete el.dataset.magnetic; el.classList.remove('is-magnetic'); gsap.killTweensOf(el); gsap.set(el, { clearProps: 'transform' }); });
  });
}


/* ═══════════════════ Workstream 2: the photo story ═══════════════════ */
function projectStory() {
  const root = document.querySelector<HTMLElement>('[data-story-gallery]');
  if (!root) return;
  const frames = Array.from(root.querySelectorAll<HTMLElement>('[data-story-frame]'));
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-frame-link]'));
  const bar = root.querySelector<HTMLElement>('[data-story-progress]');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      const index = frames.indexOf(e.target as HTMLElement);
      links.forEach((a, i) => { if (i === index) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      if (bar) bar.style.transform = `scaleX(${(index + 1) / frames.length})`;
    }
  }, { rootMargin: '-25% 0px -35% 0px' });
  frames.forEach((f) => io.observe(f));
  cleanups.push(() => io.disconnect());
  links.forEach((a) => {
    const jump = (e: MouseEvent) => {
      const frame = document.getElementById(a.hash.slice(1));
      if (!frame) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(frame.getBoundingClientRect().top + window.scrollY - 170, { immediate: true, force: true });
      else frame.scrollIntoView({ block: 'start', behavior: 'instant' });
      frame.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    };
    a.addEventListener('click', jump);
    cleanups.push(() => a.removeEventListener('click', jump));
  });
  if (!reduced) {
    const hero = document.querySelector('.p-hero');
    if (hero) {
      const frame = hero.querySelector<HTMLElement>('.frame');
      const dim = document.createElement('span');
      dim.className = 'p-hero__dim'; dim.setAttribute('aria-hidden', 'true');
      frame?.append(dim);
      cleanups.push(() => dim.remove());
      gsap.to(frame?.querySelector('img')!, { scale: 1.08, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 } });
      gsap.to(dim, { opacity: 0.35, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 } });
    }
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      frames.filter((f) => f.classList.contains('g-full')).forEach((f) => {
        if (!clientArrival && f.getBoundingClientRect().top < innerHeight) return;
        gsap.to(f.querySelector('img'), { scale: 1.06, ease: 'none', scrollTrigger: { trigger: f, start: 'center center', end: '+=28%', pin: true, scrub: 0.5, anticipatePin: 1 } });
      });
    });
    cleanups.push(() => mm.revert());
  }
  const next = document.querySelector<HTMLElement>('[data-next-story]');
  const arm = next?.querySelector<HTMLButtonElement>('[data-next-arm]');
  const link = next?.querySelector<HTMLAnchorElement>('[data-next-link]');
  const fill = next?.querySelector<HTMLElement>('[data-next-fill]');
  if (!next || !arm || !link || !fill) return;
  if (reduced) { arm.hidden = true; next.querySelector('p')?.setAttribute('hidden', ''); return; }
  let armed = false, start = 0, progress = 0, raf = 0;
  const reset = () => { armed = false; arm.setAttribute('aria-pressed', 'false'); fill.style.transform = 'scaleX(0)'; };
  const toggle = () => { armed = !armed; start = window.scrollY; arm.setAttribute('aria-pressed', String(armed)); if (!armed) reset(); };
  const scroll = () => {
    if (raf || !armed) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!armed) return;
      progress = Math.min(1, Math.max(0, (window.scrollY - start) / (innerHeight * 0.5)));
      fill.style.transform = `scaleX(${progress})`;
      if (progress >= 1) { reset(); link.click(); }
    });
  };
  const cancel = (e: KeyboardEvent) => { if (e.key === 'Escape') reset(); };
  arm.addEventListener('click', toggle); window.addEventListener('scroll', scroll, { passive: true }); window.addEventListener('keydown', cancel);
  cleanups.push(() => { cancelAnimationFrame(raf); arm.removeEventListener('click', toggle); window.removeEventListener('scroll', scroll); window.removeEventListener('keydown', cancel); });
}

// Persisted viewer: listeners are installed once; page teardown closes/reset the viewer.
let photoZoom = 1, photoX = 0, photoY = 0, pinchDistance = 0, pinchScale = 1;
let panStart: { x: number; y: number; ox: number; oy: number } | null = null;
const zoomButton = lb.querySelector<HTMLButtonElement>('[data-lb-zoom]')!;
const photoStage = lb.querySelector<HTMLElement>('.lightbox__stage')!;
function paintPhotoZoom() {
  const limitX = Math.max(0, (lbImg.clientWidth * photoZoom - photoStage.clientWidth) / 2 + 24);
  const limitY = Math.max(0, (lbImg.clientHeight * photoZoom - photoStage.clientHeight) / 2 + 24);
  photoX = gsap.utils.clamp(-limitX, limitX, photoX); photoY = gsap.utils.clamp(-limitY, limitY, photoY);
  gsap.set(lbImg, { x: photoX, y: photoY, scale: photoZoom });
  lb.classList.toggle('is-zoomed', photoZoom > 1);
  zoomButton.setAttribute('aria-pressed', String(photoZoom > 1));
  zoomButton.textContent = photoZoom > 1 ? tx().resetZoom : tx().zoom;
}
function resetPhotoZoom() { photoZoom = 1; photoX = photoY = pinchDistance = 0; panStart = null; paintPhotoZoom(); }
zoomButton.addEventListener('click', () => { photoZoom = photoZoom > 1 ? 1 : 2; photoX = photoY = 0; paintPhotoZoom(); });
photoStage.addEventListener('dblclick', () => zoomButton.click());
photoStage.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) { pinchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); pinchScale = photoZoom; }
  else if (photoZoom > 1) panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: photoX, oy: photoY };
}, { passive: true });
photoStage.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2 && pinchDistance) {
    e.preventDefault(); photoZoom = gsap.utils.clamp(1, 4, pinchScale * Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY) / pinchDistance); paintPhotoZoom();
  } else if (photoZoom > 1 && panStart) { e.preventDefault(); photoX = panStart.ox + e.touches[0].clientX - panStart.x; photoY = panStart.oy + e.touches[0].clientY - panStart.y; paintPhotoZoom(); }
}, { passive: false });
photoStage.addEventListener('touchend', () => { panStart = null; });
document.addEventListener('astro:before-swap', () => { if (lb.open) lb.close(); resetPhotoZoom(); });


/* ═══════════════════ Workstream 3: home exposure and studio proof ═══════════════════ */
function homeShutter() {
  const hero = document.querySelector<HTMLElement>('.hero');
  const shutter = hero?.querySelector<HTMLElement>('[data-home-shutter]');
  const video = hero?.querySelector<HTMLVideoElement>('[data-hero-video]');
  if (!hero || !shutter || !video || reduced) return;
  let fired = false;
  let animation: gsap.core.Timeline | undefined;
  const freeze = () => {
    if (fired || window.scrollY < 35) return;
    fired = true;
    hero.classList.add('is-frozen');
    video.pause();
    animation = gsap.timeline()
      .fromTo(shutter, { backgroundColor: '#000', opacity: 0 }, { opacity: 0.65, duration: 0.08, ease: 'power1.in' })
      .to(shutter, { opacity: 0, duration: 0.26, ease: 'uiOut' });
  };
  window.addEventListener('scroll', freeze, { passive: true });
  cleanups.push(() => { window.removeEventListener('scroll', freeze); animation?.kill(); });
}

function proofNumbers() {
  const root = document.querySelector<HTMLElement>('.studio-proof');
  if (!root) return;
  const pause = root.querySelector<HTMLButtonElement>('[data-proof-pause]');
  const logos = root.querySelector<HTMLElement>('[data-proof-logos]');
  if (pause && logos) {
    const toggle = () => { const paused = logos.classList.toggle('is-paused'); pause.setAttribute('aria-pressed', String(paused)); pause.textContent = paused ? tx().playLogos : tx().pauseLogos; };
    pause.addEventListener('click', toggle);
    cleanups.push(() => pause.removeEventListener('click', toggle));
  }
  if (reduced) return;
  const animations: gsap.core.Tween[] = [];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      const value = Number(el.dataset.proofCount);
      if (value > 0) {
        const count = { n: Math.floor(value * 0.75) };
        animations.push(gsap.to(count, { n: value, duration: 0.8, ease: 'uiOut', onUpdate: () => { el.textContent = new Intl.NumberFormat(tx().dateLocale).format(Math.round(count.n)); } }));
      }
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  root.querySelectorAll('[data-proof-count]').forEach((el) => io.observe(el));
  cleanups.push(() => { io.disconnect(); animations.forEach((a) => a.kill()); });
}


/* ═══════════════════ Workstream 4: mobile booking availability ═══════════════════ */
function mobileBooking() {
  const bar = document.querySelector<HTMLElement>('[data-mobile-booking]');
  if (!bar) return;
  const opening = document.querySelector<HTMLElement>('main [data-hero], main .page-head, main .about-hero');
  const footer = document.querySelector('footer');
  let pastOpening = false, nearFooter = false;
  const update = () => { bar.hidden = !pastOpening || nearFooter || menuOpen || !!document.querySelector('dialog[open]'); };
  const heroObserver = new IntersectionObserver(([entry]) => { pastOpening = !entry.isIntersecting && entry.boundingClientRect.top < 0; update(); });
  if (opening) heroObserver.observe(opening);
  const footerObserver = new IntersectionObserver(([entry]) => { nearFooter = entry.isIntersecting; update(); }, { rootMargin: '150px' });
  if (footer) footerObserver.observe(footer);
  const modalObserver = new MutationObserver(update);
  [menu, lb, pl].forEach((el) => modalObserver.observe(el, { attributes: true, attributeFilter: ['aria-hidden', 'open'] }));
  cleanups.push(() => { heroObserver.disconnect(); footerObserver.disconnect(); modalObserver.disconnect(); });
}

/* ═════════════════════════ Perf/A11y/SEO pass ═════════════════════════ */
onPageLoad(() => {
  deferHeroVideo();
  splitLabels();
  // Motion engine is running: CSS failsafes for JS-hidden content can stand down
  document.documentElement.classList.add('motion-ready');
});
menuA11y();

/* Nav scrim (global.css body::before) shows once the page has moved off the top */
{
  let ticking = false;
  const flag = () => { ticking = false; document.documentElement.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(flag); } }, { passive: true });
  document.addEventListener('astro:page-load', flag);
  flag();
}

/* ───────────── Hero reel loads after the poster has painted (LCP), and not at all
   on Save-Data, 2G/3G or reduced motion: the still frame stays instead. ───────────── */
function deferHeroVideo() {
  const v = document.querySelector<HTMLVideoElement>('[data-hero-video][data-src]');
  if (!v) return;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  // 3G and slower keep the still: the reel is ~4 MB
  if (reduced || conn?.saveData || /^(slow-2g|2g|3g)$/.test(conn?.effectiveType ?? '')) return;
  // Phones keep the still: the reel is a multi-MB file that competes with the first render on mobile data
  if (window.matchMedia('(max-width: 760px), (pointer: coarse)').matches) return;
  let cancelled = false;
  const start = () => {
    // The first-scroll shutter (WS3) may have frozen the hero on its still frame
    if (cancelled || !v.isConnected || v.closest('.is-frozen')) return;
    v.src = v.dataset.src!;
    v.removeAttribute('data-src');
    v.addEventListener('playing', () => v.classList.add('is-playing'), { once: true });
    v.play().catch(() => {});
  };
  const later = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 200));
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });
  cleanups.push(() => { cancelled = true; v.pause(); window.removeEventListener('load', later); });
}

/* Run-of-show stills: only the desktop stack shows them, so load them as the section nears */
function primeRosPictures(root: HTMLElement, pics: HTMLImageElement[]) {
  const stack = root.querySelector<HTMLElement>('.ros__pictures');
  if (!stack || !pics.length) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting) || !stack.offsetParent) return;
    pics.forEach((img) => { img.loading = 'eager'; });
    io.disconnect();
  }, { rootMargin: '100% 0px' });
  io.observe(root);
  cleanups.push(() => io.disconnect());
}

/* ───────────── Mobile menu as a modal: focus stays inside (menu + its toggle), the page behind
   is inert, and closing returns focus to the toggle. Watches the toggle so setMenu stays as is. ───────────── */
function menuA11y() {
  const behind = () => document.querySelectorAll<HTMLElement>('main, footer, .nav__mark, .nav__right, .skip-link');
  const focusables = () => [toggle, ...menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
  const sync = () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-hidden', String(!open));
    behind().forEach((el) => { el.inert = open; });
  };
  new MutationObserver(sync).observe(toggle, { attributes: true, attributeFilter: ['aria-expanded'] });
  // The page behind is swapped on navigation; re-apply to the new <main>/<footer>
  document.addEventListener('astro:page-load', sync);
  sync();
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || toggle.getAttribute('aria-expanded') !== 'true') return;
    const list = focusables();
    const i = list.indexOf(document.activeElement as HTMLElement);
    const next = e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : (i === -1 || i === list.length - 1 ? 0 : i + 1);
    e.preventDefault();
    list[next].focus();
  });
}

/* SplitText (aria: auto) names the split element and hides its lines. That's right for headings,
   but aria-label is not allowed on a plain span/p: keep the real text readable there instead. */
function splitLabels() {
  document.querySelectorAll<HTMLElement>('[data-split][aria-label]').forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName)) return;
    el.removeAttribute('aria-label');
    el.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.removeAttribute('aria-hidden'));
  });
}

/* ───────────── Loading placeholders (lib/lqip.ts): frames paint their dominant colour from the HTML,
   then a blurred preview. Images still loading below the fold crossfade in over it; anything in view
   at load is never hidden, so the LCP image paints as soon as it arrives. ───────────── */
const lqipDone = (img: HTMLImageElement) => {
  const frame = img.closest<HTMLElement>('[data-lqip]');
  if (!frame?.classList.contains('is-pending')) return;
  if (frame.hasAttribute('data-aperture')) { frame.classList.remove('is-pending', 'is-loaded'); return; }
  const show = () => requestAnimationFrame(() => {
    if (!frame.isConnected) return;
    frame.classList.add('is-loaded');
    // Hand the image back to its own rules (hover zoom transitions etc.) once it has faded in
    setTimeout(() => frame.classList.remove('is-pending', 'is-loaded'), 800);
  });
  if (img.naturalWidth) img.decode().then(show, show);
  else show();
};
document.addEventListener('load', (e) => { if (e.target instanceof HTMLImageElement) lqipDone(e.target); }, true);
document.addEventListener('error', (e) => { if (e.target instanceof HTMLImageElement) lqipDone(e.target); }, true);
// The blurred previews attach two screens ahead of the viewport
const lqipIo = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const el = e.target as HTMLElement;
    el.style.setProperty('--lqip', `url(${el.dataset.lqipImg})`);
    lqipIo.unobserve(el);
  }
}, { rootMargin: '200% 0px' });
document.addEventListener('astro:before-swap', () => lqipIo.disconnect());
// After window load (page-load): the inline colour covers the first paint, so LCP never waits on these
const lqipAttach = () => document.querySelectorAll<HTMLElement>('[data-lqip-img]').forEach((el) => lqipIo.observe(el));
onPageLoad(lqipAttach);
// …or sooner if one slow eager image is holding window load back
setTimeout(lqipAttach, 2500);
// Marks as soon as the DOM is in (page-load waits for window load, too late for placeholders)
const lqipMark = () => {
  const fold = window.innerHeight * 1.1;
  document.querySelectorAll<HTMLElement>('[data-lqip]:not([data-lqip="eager"])').forEach((frame) => {
    const img = frame.querySelector<HTMLImageElement>('img');
    if (frame.hasAttribute('data-aperture') || !img || (img.complete && img.naturalWidth) || frame.getBoundingClientRect().top < fold) return;
    frame.classList.add('is-pending');
  });
};
lqipMark();
document.addEventListener('astro:after-swap', lqipMark);

// Module scripts run after parsing; establish scroll states before waiting for media load.
setupPage();
