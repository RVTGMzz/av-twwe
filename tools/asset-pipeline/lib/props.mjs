// Aevin held item and Bond effects. All are independent sprites anchored at runtime,
// never baked into Trainer frames, so Aevin types and effects can be swapped freely.
import { hex } from './raster.mjs';

const C = (h, a = 255) => hex(h, a);
const put = (buf, w, h, x, y, c) => { if (x < 0 || y < 0 || x >= w || y >= h) return; buf.set(c, (y * w + x) * 4); };
const blend = (buf, w, h, x, y, c) => {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const i = (y * w + x) * 4; const a = c[3] / 255, b = buf[i + 3] / 255; const o = a + b * (1 - a);
  if (o <= 0) return;
  for (let k = 0; k < 3; k++) buf[i + k] = Math.round((c[k] * a + buf[i + k] * b * (1 - a)) / o);
  buf[i + 3] = Math.round(o * 255);
};

// ---------------------------------------------------------------- Aevin (standard type)
// Stylised "A": two gold legs, crossbar, crystal core. 16x16, grip pivot (8,13).
export const AEVIN = { w: 16, h: 16, pivot: { x: 8, y: 13 }, frames: 4, durations: [140, 140, 140, 140] };
export function renderAevin(frame, palette = AEVIN_TYPES.standard) {
  const { w, h } = AEVIN; const buf = new Uint8Array(w * h * 4);
  const seg = (ax, ay, bx, by, px, py) => { const dx = bx - ax, dy = by - ay; let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy); t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - dx * t, py - ay - dy * t); };
  const mask = new Int8Array(w * h).fill(-1);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const px = x + 0.5, py = y + 0.5;
    const dl = seg(8, 1.5, 2.5, 14.5, px, py), dr = seg(8, 1.5, 13.5, 14.5, px, py);
    const bar = py > 9.5 && py < 11.5 && dl > 0 && px > 4.6 && px < 11.4;
    const core = Math.abs(px - 8) + Math.abs(py - 6.6) <= 2.6;
    if (core) mask[y * w + x] = 3;
    else if (dl <= 1.05) mask[y * w + x] = 1;
    else if (dr <= 1.05) mask[y * w + x] = 2;
    else if (bar) mask[y * w + x] = 2;
  }
  const glow = [0, 1, 2, 1][frame];
  for (let i = 0; i < w * h; i++) {
    const m = mask[i]; if (m < 0) continue;
    const x = i % w, y = (i / w) | 0;
    let c;
    if (m === 1) c = palette.light; else if (m === 2) c = palette.metal;
    else { const centre = Math.abs(x + 0.5 - 8) + Math.abs(y + 0.5 - 6.6) < 1.2; c = centre ? (glow >= 1 ? palette.hot : palette.coreLight) : glow === 2 ? palette.coreLight : palette.core; }
    put(buf, w, h, x, y, c);
  }
  // outline
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (mask[y * w + x] >= 0) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X >= 0 && Y >= 0 && X < w && Y < h && mask[Y * w + X] >= 0; })) put(buf, w, h, x, y, palette.outline);
  }
  return buf;
}
export const AEVIN_TYPES = {
  standard: { outline: C('#4a300c'), metal: C('#c08a2c'), light: C('#f2c45a'), core: C('#2fb4d8'), coreLight: C('#8ae8ff'), hot: C('#ffffff') },
};

// ---------------------------------------------------------------- Bond FX
export const FX = {
  resonance: { w: 32, h: 32, pivot: { x: 16, y: 16 }, frames: 6, durations: Array(6).fill(80), anchor: 'trainer.hand_item_anchor', loop: true },
  rune_ring: { w: 96, h: 64, pivot: { x: 48, y: 40 }, frames: 8, durations: Array(8).fill(90), anchor: 'target.ground_pivot', loop: true },
  success: { w: 96, h: 64, pivot: { x: 48, y: 40 }, frames: 6, durations: [80, 80, 90, 100, 120, 160], anchor: 'target.ground_pivot', loop: false },
  fail: { w: 96, h: 64, pivot: { x: 48, y: 40 }, frames: 6, durations: [80, 90, 100, 110, 130, 160], anchor: 'target.ground_pivot', loop: false },
};
const CY = C('#3fd2f0'), CYL = C('#b8f6ff'), WH = C('#ffffff'), GD = C('#f2c45a'), GDD = C('#a8761e'), GR = C('#8a86a8'), GRD = C('#4e4a66');
const alpha = (c, a) => [c[0], c[1], c[2], Math.round(a)];

function glyph(buf, w, h, x, y, k, c) {
  const G = [[[0, -1], [0, 0], [0, 1], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[0, -1], [-1, 0], [1, 0], [0, 1]], [[-1, -1], [0, -1], [1, -1], [0, 0], [0, 1]]][k % 4];
  for (const [dx, dy] of G) blend(buf, w, h, x + dx, y + dy, c);
}

export function renderFx(kind, f) {
  const spec = FX[kind]; const { w, h } = spec; const buf = new Uint8Array(w * h * 4);
  const cx = spec.pivot.x, cy = spec.pivot.y;
  const ellipse = (rx, ry, th, col, start = 0, sweep = Math.PI * 2, step = 0.01) => {
    for (let a = start; a < start + sweep; a += step) {
      for (let t = -th / 2; t <= th / 2; t += 0.5) {
        const x = Math.round(cx + Math.cos(a) * (rx + t) - 0.5), y = Math.round(cy + Math.sin(a) * (ry + t * 0.5) - 0.5);
        put(buf, w, h, x, y, col);
      }
    }
  };
  if (kind === 'resonance') {
    const r = 3 + f * 2.2; const a = 255 * (1 - f / 7);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (Math.abs(d - r) < 0.75) blend(buf, w, h, x, y, alpha(f % 2 ? CYL : CY, a));
      else if (d < 3.2) blend(buf, w, h, x, y, alpha(WH, 110));
    }
    for (let k = 0; k < 4; k++) {
      const ang = k * Math.PI / 2 + f * 0.35; const sx = Math.round(cx + Math.cos(ang) * (r + 2)), sy = Math.round(cy + Math.sin(ang) * (r + 2));
      for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) blend(buf, w, h, sx + dx, sy + dy, alpha(dx || dy ? CYL : WH, a));
    }
  } else if (kind === 'rune_ring') {
    const grow = Math.min(1, (f + 1) / 3);
    const rx = 30 * grow, ry = 14 * grow;
    ellipse(rx, ry, 1.5, GDD); ellipse(rx - 1, ry - 0.5, 0.5, GD);
    ellipse(rx - 6, ry - 3, 0.5, alpha(CY, 200));
    for (let k = 0; k < 8; k++) {
      const ang = k * Math.PI / 4 + f * (Math.PI / 32);
      glyph(buf, w, h, Math.round(cx + Math.cos(ang) * (rx - 3)), Math.round(cy + Math.sin(ang) * (ry - 1.5)), k + f, k % 2 ? CYL : WH);
    }
    for (let k = 0; k < 5; k++) { // rising motes
      const ang = k * 1.3 + f * 0.2; const hgt = ((f * 3 + k * 7) % 22);
      blend(buf, w, h, Math.round(cx + Math.cos(ang) * rx * 0.7), Math.round(cy + Math.sin(ang) * ry * 0.7 - hgt), alpha(CYL, 230 - hgt * 8));
    }
  } else if (kind === 'success') {
    const t = f / 5; const rx = 30 * (1 - t * 0.85), ry = 14 * (1 - t * 0.85);
    if (f < 4) { ellipse(rx, ry, 1.5, GD); ellipse(rx - 2, ry - 1, 0.5, WH); }
    const n = 10; const burst = Math.max(0, f - 2) * 5;
    for (let k = 0; k < n && f >= 3; k++) {
      const ang = (k / n) * Math.PI * 2; const sx = Math.round(cx + Math.cos(ang) * burst), sy = Math.round(cy - 8 + Math.sin(ang) * burst * 0.7);
      for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) blend(buf, w, h, sx + dx, sy + dy, alpha(dx || dy ? GD : WH, 255 - (f - 3) * 60));
    }
    if (f >= 2 && f <= 4) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const d = Math.hypot((x + 0.5 - cx) / 1.6, y + 0.5 - (cy - 8)); if (d < 6 - Math.abs(f - 3) * 2) blend(buf, w, h, x, y, alpha(WH, 150));
    }
  } else if (kind === 'fail') {
    const spread = f * 4; const fade = 255 - f * 38;
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * Math.PI * 2 + 0.2;
      const rx = 30 + spread, ry = 14 + spread * 0.45;
      const x0 = cx + Math.cos(ang) * rx, y0 = cy + Math.sin(ang) * ry + f * 1.2;
      for (let s = 0; s < 4; s++) blend(buf, w, h, Math.round(x0 + Math.cos(ang + Math.PI / 2) * s * (k % 2 ? 1 : -1)), Math.round(y0 + Math.sin(ang + Math.PI / 2) * s * 0.5), alpha(s % 2 ? GR : GRD, fade));
    }
    if (f < 2) { const col = alpha(GR, 200); for (let i = -3; i <= 3; i++) { blend(buf, w, h, cx + i, cy - 10 + i, col); blend(buf, w, h, cx + i, cy - 10 - i, col); } }
  }
  return buf;
}
