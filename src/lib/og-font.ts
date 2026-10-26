/**
 * Just enough TrueType to set a title as SVG outlines for the build-time share cards.
 * Outlines instead of <text> means the cards look the same on any build machine,
 * with no system fonts or fontconfig involved. Reads cmap (format 4/12), hmtx and glyf
 * (simple + composite glyphs); no kerning, so titles get a touch of negative tracking instead.
 */
import fs from 'node:fs';

type Glyph = { d: string; advance: number };

export class OutlineFont {
  private v: DataView;
  private tables: Record<string, number> = {};
  private loca: number[] = [];
  private advances: number[] = [];
  private cmap = new Map<number, number>();
  private cache = new Map<number, Glyph>();
  readonly unitsPerEm: number;
  readonly ascender: number;

  constructor(file: string) {
    const buf = fs.readFileSync(file);
    this.v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const n = this.v.getUint16(4);
    for (let i = 0; i < n; i++) {
      const o = 12 + i * 16;
      const tag = String.fromCharCode(...[0, 1, 2, 3].map((k) => this.v.getUint8(o + k)));
      this.tables[tag] = this.v.getUint32(o + 8);
    }
    const head = this.tables.head;
    this.unitsPerEm = this.v.getUint16(head + 18);
    const longLoca = this.v.getInt16(head + 50) === 1;
    const hhea = this.tables.hhea;
    this.ascender = this.v.getInt16(hhea + 4);
    const numH = this.v.getUint16(hhea + 34);
    const numGlyphs = this.v.getUint16(this.tables.maxp + 4);
    for (let i = 0, last = 0; i < numGlyphs; i++) {
      if (i < numH) last = this.v.getUint16(this.tables.hmtx + i * 4);
      this.advances.push(last);
    }
    for (let i = 0; i <= numGlyphs; i++) {
      this.loca.push(longLoca ? this.v.getUint32(this.tables.loca + i * 4) : this.v.getUint16(this.tables.loca + i * 2) * 2);
    }
    this.readCmap();
  }

  private readCmap() {
    const base = this.tables.cmap;
    const count = this.v.getUint16(base + 2);
    let best = -1;
    let bestFormat = 0;
    for (let i = 0; i < count; i++) {
      const off = base + this.v.getUint32(base + 4 + i * 8 + 4);
      const format = this.v.getUint16(off);
      if ((format === 12 || format === 4) && format > bestFormat) { best = off; bestFormat = format; }
    }
    if (best < 0) throw new Error('No usable cmap');
    if (bestFormat === 12) {
      const groups = this.v.getUint32(best + 12);
      for (let g = 0; g < groups; g++) {
        const o = best + 16 + g * 12;
        const start = this.v.getUint32(o), end = this.v.getUint32(o + 4), gid = this.v.getUint32(o + 8);
        for (let c = start; c <= end && c < 0x30000; c++) this.cmap.set(c, gid + c - start);
      }
      return;
    }
    const segX2 = this.v.getUint16(best + 6);
    const ends = best + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
    for (let s = 0; s < segX2 / 2; s++) {
      const end = this.v.getUint16(ends + s * 2), start = this.v.getUint16(starts + s * 2);
      const delta = this.v.getInt16(deltas + s * 2), ro = this.v.getUint16(ranges + s * 2);
      for (let c = start; c <= end && c !== 0xffff; c++) {
        let gid = 0;
        if (ro === 0) gid = (c + delta) & 0xffff;
        else {
          const g = this.v.getUint16(ranges + s * 2 + ro + (c - start) * 2);
          gid = g ? (g + delta) & 0xffff : 0;
        }
        if (gid) this.cmap.set(c, gid);
      }
    }
  }

  /** Contours of one glyph as [x, y, onCurve] points, composite glyphs resolved */
  private contours(gid: number, dx = 0, dy = 0): Array<Array<[number, number, boolean]>> {
    const start = this.loca[gid], end = this.loca[gid + 1];
    if (end <= start) return [];
    const o = this.tables.glyf + start;
    const n = this.v.getInt16(o);
    if (n < 0) {
      const out: Array<Array<[number, number, boolean]>> = [];
      let p = o + 10;
      for (;;) {
        const flags = this.v.getUint16(p), child = this.v.getUint16(p + 2);
        p += 4;
        let x = 0, y = 0;
        if (flags & 1) { x = this.v.getInt16(p); y = this.v.getInt16(p + 2); p += 4; }
        else { x = this.v.getInt8(p); y = this.v.getInt8(p + 1); p += 2; }
        if (flags & 8) p += 2; else if (flags & 0x40) p += 4; else if (flags & 0x80) p += 8;
        out.push(...this.contours(child, dx + x, dy + y));
        if (!(flags & 0x20)) break;
      }
      return out;
    }
    const endPts: number[] = [];
    for (let i = 0; i < n; i++) endPts.push(this.v.getUint16(o + 10 + i * 2));
    const total = n ? endPts[n - 1] + 1 : 0;
    let p = o + 10 + n * 2;
    p += 2 + this.v.getUint16(p); // instructions
    const flags: number[] = [];
    while (flags.length < total) {
      const f = this.v.getUint8(p++);
      flags.push(f);
      if (f & 8) { let r = this.v.getUint8(p++); while (r--) flags.push(f); }
    }
    const coords = (short: number, same: number) => {
      const out: number[] = [];
      let val = 0;
      for (const f of flags) {
        if (f & short) { const d = this.v.getUint8(p++); val += f & same ? d : -d; }
        else if (!(f & same)) { val += this.v.getInt16(p); p += 2; }
        out.push(val);
      }
      return out;
    };
    const xs = coords(2, 16), ys = coords(4, 32);
    const out: Array<Array<[number, number, boolean]>> = [];
    let s = 0;
    for (const e of endPts) {
      const c: Array<[number, number, boolean]> = [];
      for (let i = s; i <= e; i++) c.push([xs[i] + dx, ys[i] + dy, (flags[i] & 1) === 1]);
      out.push(c);
      s = e + 1;
    }
    return out;
  }

  glyph(code: number): Glyph {
    const gid = this.cmap.get(code) ?? 0;
    const hit = this.cache.get(gid);
    if (hit) return hit;
    let d = '';
    const f = (n: number) => Math.round(n * 10) / 10;
    for (const pts of this.contours(gid)) {
      if (!pts.length) continue;
      // Start on an on-curve point (or the midpoint of two off-curve ones)
      let startIdx = pts.findIndex((q) => q[2]);
      let first: [number, number];
      if (startIdx < 0) { startIdx = 0; first = [(pts[0][0] + pts[1 % pts.length][0]) / 2, (pts[0][1] + pts[1 % pts.length][1]) / 2]; }
      else first = [pts[startIdx][0], pts[startIdx][1]];
      d += `M${f(first[0])} ${f(-first[1])}`;
      let ctrl: [number, number] | null = null;
      for (let k = 1; k <= pts.length; k++) {
        const [x, y, on] = pts[(startIdx + k) % pts.length];
        if (on) {
          d += ctrl ? `Q${f(ctrl[0])} ${f(-ctrl[1])} ${f(x)} ${f(-y)}` : `L${f(x)} ${f(-y)}`;
          ctrl = null;
        } else if (ctrl) {
          const mx = (ctrl[0] + x) / 2, my = (ctrl[1] + y) / 2;
          d += `Q${f(ctrl[0])} ${f(-ctrl[1])} ${f(mx)} ${f(-my)}`;
          ctrl = [x, y];
        } else ctrl = [x, y];
      }
      if (ctrl) d += `Q${f(ctrl[0])} ${f(-ctrl[1])} ${f(first[0])} ${f(-first[1])}`;
      d += 'Z';
    }
    const g = { d, advance: this.advances[gid] ?? 0 };
    this.cache.set(gid, g);
    return g;
  }

  /** Width of a string in em at the given tracking (em) */
  measure(text: string, tracking = 0) {
    let w = 0;
    for (const ch of text) w += this.glyph(ch.codePointAt(0)!).advance / this.unitsPerEm + tracking;
    return w;
  }

  /** One line as an SVG <path>, baseline at (x, y), font size in px */
  path(text: string, x: number, y: number, size: number, tracking = 0, fill = '#ece7df') {
    const s = size / this.unitsPerEm;
    let pen = 0;
    let parts = '';
    for (const ch of text) {
      const g = this.glyph(ch.codePointAt(0)!);
      if (g.d) parts += `<path transform="translate(${(x + pen * s).toFixed(1)} ${y}) scale(${s.toFixed(5)})" d="${g.d}"/>`;
      pen += g.advance + tracking * this.unitsPerEm;
    }
    return `<g fill="${fill}">${parts}</g>`;
  }

  /** Greedy word wrap to a max width in px */
  wrap(text: string, size: number, maxWidth: number, tracking = 0) {
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && this.measure(next, tracking) * size > maxWidth) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }
}
