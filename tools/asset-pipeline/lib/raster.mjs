// Depth-aware pixel rasterizer. Every layer of a frame is drawn from the SAME pose, then masked
// against a shared body depth buffer, so independently swappable layers still occlude correctly.
import { CAM, add, mul } from './math.mjs';

export function hex(h, a = 255) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
}
/** Ramp = [outline, shadow, base, light] RGBA. */
export const ramp = (...hs) => hs.map((h) => hex(h));
export const flat = (h, a = 255) => { const c = hex(h, a); return [c, c, c, c]; };

const LIGHT = (() => { const l = [-0.42, -0.7, 0.58]; const m = Math.hypot(...l); return l.map((x) => x / m); })();
export function shadeTone(nx, ny, nz) {
  const l = LIGHT[0] * nx + LIGHT[1] * ny + LIGHT[2] * nz;
  return l > 0.66 ? 3 : l > 0.1 ? 2 : 1;
}

export class Layer {
  constructor(w, h) {
    this.w = w; this.h = h;
    const n = w * h;
    this.dep = new Float32Array(n).fill(-1e9);
    this.tone = new Int8Array(n).fill(-1);
    this.rid = new Int16Array(n).fill(-1);
    this.sid = new Int16Array(n).fill(-1);
    this.ramps = []; this.rmap = new Map(); this.nextSid = 0;
  }
  rampIndex(r) {
    let i = this.rmap.get(r);
    if (i === undefined) { i = this.ramps.length; this.ramps.push(r); this.rmap.set(r, i); }
    return i;
  }
  put(x, y, d, tone, r, sid) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = y * this.w + x;
    if (d > this.dep[i]) { this.dep[i] = d; this.tone[i] = tone; this.rid[i] = this.rampIndex(r); this.sid[i] = sid; }
  }
  newSid() { return this.nextSid++; }
}

/** Capsule between projected points a,b ({x,y,d}) with radii ra→rb. colorFn({t,nx,ny,nz}) may override ramp. */
export function drawCapsule(L, s) {
  const { a, b, ra, rb } = s;
  const bias = s.bias || 0;
  const sid = L.newSid();
  const rmax = Math.max(ra, rb);
  const x0 = Math.floor(Math.min(a.x, b.x) - rmax), x1 = Math.ceil(Math.max(a.x, b.x) + rmax);
  const y0 = Math.floor(Math.min(a.y, b.y) - rmax), y1 = Math.ceil(Math.max(a.y, b.y) + rmax);
  const abx = b.x - a.x, aby = b.y - a.y, ab2 = abx * abx + aby * aby;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const px = x + 0.5, py = y + 0.5;
    let t = ab2 > 1e-6 ? ((px - a.x) * abx + (py - a.y) * aby) / ab2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const r = ra + (rb - ra) * t;
    const dx = px - (a.x + abx * t), dy = py - (a.y + aby * t);
    const d2 = dx * dx + dy * dy;
    if (d2 > r * r) continue;
    const nx = dx / r, ny = dy / r, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    const depth = a.d + (b.d - a.d) * t + nz * r + bias;
    let tone = shadeTone(nx, ny, nz);
    let rr = s.ramp;
    if (s.colorFn) { const c = s.colorFn({ t, nx, ny, nz }); if (!c) continue; rr = c.ramp || c; if (c.tone !== undefined) tone = c.tone; }
    L.put(x, y, depth, tone, rr, sid);
  }
}

/** Sphere with per-pixel surface callback. surface 'front' | 'back'. fn(worldNormal, screenN) -> {ramp, tone} | null */
export function drawSphere(L, c, R, surface, fn, bias = 0) {
  const sid = L.newSid();
  const sgn = surface === 'back' ? -1 : 1;
  for (let y = Math.floor(c.y - R); y <= Math.ceil(c.y + R); y++) for (let x = Math.floor(c.x - R); x <= Math.ceil(c.x + R); x++) {
    const nx = (x + 0.5 - c.x) / R, ny = (y + 0.5 - c.y) / R;
    const q = 1 - nx * nx - ny * ny;
    if (q < 0) continue;
    const nz = Math.sqrt(q) * sgn;
    const nw = add(add(mul(CAM.X, nx), mul(CAM.D, ny)), mul(CAM.C, nz));
    const res = fn(nw, { nx, ny, nz });
    if (!res) continue;
    L.put(x, y, c.d + nz * R + bias, res.tone ?? shadeTone(nx, ny, Math.abs(nz)), res.ramp, sid);
  }
}

/** Quad (4 projected corners, uv per corner) as two triangles; colorFn({u,v}) -> {ramp,tone}. */
export function drawQuad(L, P, UV, colorFn, bias = 0) {
  const sid = L.newSid();
  for (const [i, j, k] of [[0, 1, 2], [0, 2, 3]]) {
    const A = P[i], B = P[j], C = P[k];
    const den = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);
    if (Math.abs(den) < 1e-6) continue;
    const x0 = Math.floor(Math.min(A.x, B.x, C.x)), x1 = Math.ceil(Math.max(A.x, B.x, C.x));
    const y0 = Math.floor(Math.min(A.y, B.y, C.y)), y1 = Math.ceil(Math.max(A.y, B.y, C.y));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const px = x + 0.5, py = y + 0.5;
      const w0 = ((B.y - C.y) * (px - C.x) + (C.x - B.x) * (py - C.y)) / den;
      const w1 = ((C.y - A.y) * (px - C.x) + (A.x - C.x) * (py - C.y)) / den;
      const w2 = 1 - w0 - w1;
      if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
      const u = w0 * UV[i][0] + w1 * UV[j][0] + w2 * UV[k][0];
      const vv = w0 * UV[i][1] + w1 * UV[j][1] + w2 * UV[k][1];
      const res = colorFn({ u, v: vv, front: den > 0 });
      if (!res) continue;
      L.put(x, y, w0 * A.d + w1 * B.d + w2 * C.d + bias, res.tone ?? 2, res.ramp, sid);
    }
  }
}

/** Direct pixel stamp. pixels: [[dx, dy, rampFlat], ...] */
export function stamp(L, x, y, depth, pixels) {
  const sid = L.newSid();
  for (const [dx, dy, r] of pixels) L.put(x + dx, y + dy, depth, 2, r, sid);
}

/**
 * Resolve a layer into RGBA. maskZ: depth buffer of things that may hide this layer (shared body).
 * Pixels behind maskZ are removed; edges against nearer parts get the ramp's outline colour.
 */
export function finalize(L, maskZ, opts = {}) {
  const { w, h } = L, n = w * h;
  const EPS = 0.35;
  const masked = new Uint8Array(n);
  if (maskZ) for (let i = 0; i < n; i++) {
    if (L.rid[i] >= 0 && maskZ[i] > L.dep[i] + EPS) { L.rid[i] = -1; masked[i] = 1; }
  }
  const tone = Int8Array.from(L.tone);
  const rid = Int16Array.from(L.rid);
  if (opts.outline !== false) {
    const nb = (i) => { const x = i % w, y = (i / w) | 0; const r = []; if (x > 0) r.push(i - 1); if (x < w - 1) r.push(i + 1); if (y > 0) r.push(i - w); if (y < h - 1) r.push(i + w); return r; };
    for (let i = 0; i < n; i++) {
      if (L.rid[i] < 0) continue;
      for (const j of nb(i)) {
        if (masked[j] || (L.rid[j] >= 0 && L.sid[j] !== L.sid[i] && L.dep[j] - L.dep[i] > 2.2)) { tone[i] = 0; break; }
      }
    }
    if (opts.outer !== false) for (let i = 0; i < n; i++) {
      if (L.rid[i] >= 0 || masked[i]) continue;
      let best = -1;
      for (const j of nb(i)) if (L.rid[j] >= 0 && (best < 0 || L.dep[j] > L.dep[best])) best = j;
      if (best < 0) continue;
      const d = L.dep[best] - 0.05;
      if (maskZ && maskZ[i] > d + EPS) continue;
      rid[i] = L.rid[best]; tone[i] = 0;
    }
  }
  const rgba = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    if (rid[i] < 0) continue;
    const c = L.ramps[rid[i]][tone[i]];
    rgba.set(c, i * 4);
  }
  return rgba;
}

export function blit(dst, dw, src, sw, sh, ox, oy) {
  for (let y = 0; y < sh; y++) {
    const s = y * sw * 4, d = ((oy + y) * dw + ox) * 4;
    dst.set(src.subarray(s, s + sw * 4), d);
  }
}

/** Shelf-pack strips of equal-size cells into a grid `cols` wide. Returns placements + rows. */
export function packStrips(strips, cols) {
  const rows = []; const out = [];
  for (const s of strips) {
    let r = rows.findIndex((used) => used + s.n <= cols);
    if (r < 0) { rows.push(0); r = rows.length - 1; }
    out.push({ ...s, row: r, col: rows[r] });
    rows[r] += s.n;
  }
  return { placements: out, rows: rows.length };
}
