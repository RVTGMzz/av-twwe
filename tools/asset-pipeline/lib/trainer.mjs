// Modular Trainer rig: one pose per (animation, direction, frame) drives every layer.
import { v, add, sub, mul, dot, norm, lin, rad, UP, project, DIRECTIONS, CAM } from './math.mjs';
import { Layer, drawCapsule, drawSphere, drawQuad, stamp, finalize } from './raster.mjs';
import { SKIN, UNDER, HAIR, EYES, GOLD, OUTFIT, LEATHER, SHADOW_RGBA } from './palettes.mjs';

export const CANVAS = { w: 64, h: 64 };
export const PIVOT = { x: 32, y: 58 };

// Joint dimensions are shared by both presets => anchors, timing and hair_front are preset-invariant.
// Proportion v2 (owner request 2026-11-25): ~3.75–4 heads, head ≈ 29% of height, arms reach mid-thigh.
const B = { pelvisH: 19, torso: 13.4, headR: 5.4, shoulder: 4.5, hip: 2.4, upperArm: 7.8, foreArm: 7.4, thigh: 9.5, shin: 8.9 };
// Presets differ in volumes (silhouette), face stamps and garment fit, not in joints.
export const PRESETS = {
  male: { id: 'male', torso: [3.3, 4.4], shoulderBar: 2.1, hips: 2.7, thigh: [2.5, 2.0], shin: [2.0, 1.6] },
  female: { id: 'female', torso: [3.5, 3.7], shoulderBar: 1.8, hips: 3.0, thigh: [2.45, 1.9], shin: [1.9, 1.5] },
};

// ---------------------------------------------------------------- animations
const legs = (aL, kL, aR, kR, sp = 0.12) => ({ L: { a: aL, k: kL, spread: sp }, R: { a: aR, k: kR, spread: sp } });
const arms = (sL, eL, sR, eR, spL = 0.16, spR = 0.16) => ({ L: { s: sL, e: eL, spread: spL }, R: { s: sR, e: eR, spread: spR } });
const base = () => ({ torsoPitch: 0, headPitch: 0, breath: 0, rootF: 0, lift: 0, ground: 'feet', legs: legs(0, 4, 0, 4), arms: arms(4, 10, 4, 10), expr: 'neutral', sway: 0, flutter: 0.4, hidden: [], holds: false });
const P = (o) => { const b = base(); return { ...b, ...o, legs: o.legs || b.legs, arms: o.arms || b.arms }; };

function walkFrame(i, n) {
  const p = (2 * Math.PI * i) / n;
  const lp = (ph) => ({ a: 26 * Math.sin(ph), k: 38 * Math.max(0, Math.cos(ph)) + 4, spread: 0.12 });
  return P({ torsoPitch: 5, legs: { R: lp(p), L: lp(p + Math.PI) }, arms: arms(22 * Math.sin(p), 18, -22 * Math.sin(p), 18), sway: 1.2 * Math.sin(p), flutter: 1 + 0.8 * Math.abs(Math.cos(p)) });
}
const IDLE = [0, 0.5, 1, 0.5].map((b, i) => P({ breath: b, arms: arms(4 + b * 2, 10, 4 + b * 2, 10), sway: 0.3 * Math.sin(i * Math.PI / 2), flutter: 0.4 + b * 0.2 }));

const FAINT = [
  P({ torsoPitch: -12, headPitch: 6, legs: legs(-6, 14, 4, 18), arms: arms(30, 20, 26, 22, 0.55, 0.55), expr: 'hurt', sway: -1 }),
  P({ torsoPitch: 12, headPitch: 22, legs: legs(26, 56, 22, 52), arms: arms(8, 6, 6, 8, 0.3, 0.3), expr: 'closed', sway: 1 }),
  P({ torsoPitch: -8, headPitch: 20, ground: 'all', legs: legs(72, 120, 66, 116, 0.25), arms: arms(10, 6, 14, 6, 0.4, 0.4), expr: 'closed' }),
  P({ torsoPitch: -52, headPitch: 34, ground: 'all', legs: legs(80, 70, 76, 64, 0.25), arms: arms(20, 10, 24, 10, 0.55, 0.55), expr: 'closed', flutter: 1.5 }),
  P({ torsoPitch: -86, headPitch: 48, ground: 'all', legs: legs(86, 16, 84, 22, 0.22), arms: arms(18, 10, 22, 8, 0.75, 0.75), expr: 'closed', flutter: 0.8 }),
  P({ torsoPitch: -90, headPitch: 52, ground: 'all', legs: legs(90, 6, 88, 10, 0.22), arms: arms(16, 6, 18, 6, 0.8, 0.8), expr: 'closed', flutter: 0.4 }),
];
const RECOVER = [
  P({ torsoPitch: -66, headPitch: 42, ground: 'all', legs: legs(88, 10, 86, 14, 0.22), arms: arms(-40, 50, -40, 50, 0.45, 0.45), expr: 'closed' }),
  P({ torsoPitch: -18, headPitch: 10, ground: 'all', legs: legs(86, 26, 84, 30, 0.25), arms: arms(-18, 20, -18, 20, 0.45, 0.45), expr: 'hurt' }),
  P({ torsoPitch: 8, headPitch: 6, ground: 'all', legs: legs(64, 118, 70, 120, 0.2), arms: arms(20, 30, 20, 30, 0.3, 0.3), expr: 'hurt' }),
  P({ torsoPitch: 14, headPitch: 4, legs: legs(30, 60, 24, 52), arms: arms(24, 30, 22, 28, 0.3, 0.3), expr: 'neutral' }),
  P({ torsoPitch: 4, headPitch: 0, legs: legs(8, 18, 4, 14), arms: arms(8, 14, 8, 14), expr: 'neutral' }),
  P({}),
];
// Character's right hand (R) holds the Aevin.
const BOND_PREPARE = [
  P({ arms: arms(6, 10, 20, 40), expr: 'focus', holds: true }),
  P({ arms: arms(6, 10, 34, 70), expr: 'focus', holds: true }),
  P({ torsoPitch: 3, arms: arms(-4, 10, 40, 90, 0.2, 0.05), expr: 'focus', holds: true }),
  P({ torsoPitch: 3, breath: 0.5, arms: arms(-6, 10, 42, 92, 0.2, 0.05), expr: 'focus', holds: true }),
];
const BOND_ACTIVATE = Array.from({ length: 8 }, (_, i) => {
  const t = Math.min(1, i / 3);
  return P({ torsoPitch: 4 + 4 * t, legs: legs(-6 * t, 8, 10 * t, 6), arms: arms(-10 - 8 * t, 12, 50 + 36 * t, 60 * (1 - t) + 4, 0.25, 0.04), breath: i >= 4 ? (i % 2) * 0.5 : 0, expr: 'focus', holds: true, flutter: 0.6 + 0.5 * t, sway: i >= 4 ? (i % 2 ? 0.5 : -0.5) : 0 });
});
const BOND_SUCCESS = [
  P({ arms: arms(-6, 10, 120, 20, 0.2, 0.1), expr: 'happy', holds: true }),
  P({ lift: 2, arms: arms(-20, 30, 160, 0, 0.3, 0.1), expr: 'happy', holds: true, flutter: 1.4 }),
  P({ lift: 1, arms: arms(-20, 30, 165, 0, 0.3, 0.1), expr: 'happy', holds: true, flutter: 1 }),
  P({ arms: arms(4, 10, 150, 10, 0.2, 0.1), expr: 'happy', holds: true }),
];
const BOND_FAIL = [
  P({ torsoPitch: 2, arms: arms(-6, 10, 70, 30, 0.2, 0.05), expr: 'surprised', holds: true }),
  P({ torsoPitch: 8, headPitch: 8, arms: arms(4, 10, 40, 30, 0.2, 0.1), expr: 'sad', holds: true }),
  P({ torsoPitch: 12, headPitch: 14, arms: arms(6, 8, 18, 20, 0.2, 0.15), expr: 'sad', holds: true }),
  P({ torsoPitch: 12, headPitch: 16, legs: legs(2, 8, 2, 8), arms: arms(6, 8, 14, 18, 0.2, 0.15), expr: 'sad', holds: true }),
];
// Neutral ground-mount ride pose (straddle). Seat anchor = pelvis base; mount supplies the bob.
const rideLegs = (sw = 0) => ({ L: { a: 74 + sw, k: 96, spread: 0.55 }, R: { a: 74 - sw, k: 96, spread: 0.55 } });
const RIDE_IDLE = [0, 0.5, 1, 0.5].map((b) => P({ ground: 'none', breath: b, torsoPitch: 4, legs: rideLegs(), arms: arms(34, 34, 34, 34, 0.12, 0.12), riding: true, flutter: 0.6 }));
const RIDE_WALK = Array.from({ length: 6 }, (_, i) => {
  const p = (2 * Math.PI * i) / 6;
  return P({ ground: 'none', torsoPitch: 5 + 2.5 * Math.sin(p), headPitch: -1.5 * Math.sin(p), legs: rideLegs(5 * Math.sin(p)), arms: arms(36, 34, 36, 34, 0.12, 0.12), riding: true, sway: 1.2 * Math.sin(p), flutter: 1.2 + 0.6 * Math.abs(Math.cos(p)) });
});

/** Batch 01 animation library. `group` drives frame-count QA ranges. */
export const ANIMATIONS = [
  { id: 'idle', priority: 'P0', group: 'idle', loop: true, durations: [220, 180, 220, 180], poses: IDLE },
  { id: 'walk', priority: 'P0', group: 'walk', loop: true, durations: Array(6).fill(100), poses: Array.from({ length: 6 }, (_, i) => walkFrame(i, 6)) },
  { id: 'faint', priority: 'P0', group: 'faint', loop: false, durations: [90, 100, 120, 140, 160, 240], poses: FAINT, next: 'faint_hold' },
  { id: 'faint_hold', priority: 'P0', group: 'reuse', loop: true, durations: [400], reuse: { animation: 'faint', frames: [5] } },
  { id: 'recover', priority: 'P0', group: 'recover', loop: false, durations: [160, 140, 120, 120, 140, 200], poses: RECOVER, next: 'idle' },
  { id: 'bond_prepare', priority: 'P0', group: 'bond_step', loop: false, durations: Array(4).fill(110), poses: BOND_PREPARE, next: 'bond_activate' },
  { id: 'bond_activate', priority: 'P0', group: 'bond', loop: false, durations: Array(8).fill(90), poses: BOND_ACTIVATE },
  { id: 'bond_success', priority: 'P0', group: 'bond_step', loop: false, durations: [100, 110, 120, 260], poses: BOND_SUCCESS, next: 'idle' },
  { id: 'bond_fail', priority: 'P0', group: 'bond_step', loop: false, durations: [120, 130, 150, 300], poses: BOND_FAIL, next: 'idle' },
  { id: 'ride_idle', priority: 'P1', group: 'ride', loop: true, durations: Array(4).fill(200), poses: RIDE_IDLE, mount_sync: 'idle' },
  { id: 'ride_walk', priority: 'P1', group: 'ride', loop: true, durations: Array(6).fill(110), poses: RIDE_WALK, mount_sync: 'walk' },
];

// ---------------------------------------------------------------- forward kinematics
export function solvePose(p, dir) {
  const f = dir.f, r = dir.r, u = UP;
  const tp = rad(p.torsoPitch), hp = rad(p.torsoPitch + p.headPitch);
  const tUp = add(mul(u, Math.cos(tp)), mul(f, Math.sin(tp)));
  const tFwd = sub(mul(f, Math.cos(tp)), mul(u, Math.sin(tp)));
  const hUp = add(mul(u, Math.cos(hp)), mul(f, Math.sin(hp)));
  const hFwd = sub(mul(f, Math.cos(hp)), mul(u, Math.sin(hp)));
  const J = {};
  J.pelvis = lin(v(0, 0, B.pelvisH + (p.riding ? 3 : 0)), [f, p.rootF]);
  J.neck = lin(J.pelvis, [tUp, B.torso + p.breath * 0.6]);
  J.chest = lin(J.pelvis, [tUp, B.torso * 0.58 + p.breath * 0.3]);
  J.head = lin(J.neck, [hUp, B.headR * 0.92]);
  for (const [s, side] of [['L', -1], ['R', 1]]) {
    const sh = lin(J.neck, [tUp, -1.8], [r, side * B.shoulder]);
    const a = p.arms[s];
    const sa = rad(a.s), se = rad(a.s + a.e);
    const ua = norm(lin(v(0, 0, 0), [tUp, -Math.cos(sa)], [tFwd, Math.sin(sa)], [r, side * a.spread]));
    const el = lin(sh, [ua, B.upperArm]);
    const fa = norm(lin(v(0, 0, 0), [tUp, -Math.cos(se)], [tFwd, Math.sin(se)], [r, side * a.spread * 0.7]));
    J['shoulder' + s] = sh; J['elbow' + s] = el; J['hand' + s] = lin(el, [fa, B.foreArm]);
    const hip = lin(J.pelvis, [tUp, -0.6], [r, side * B.hip]);
    const l = p.legs[s];
    const la = rad(l.a), lk = rad(l.a - l.k);
    const th = norm(lin(v(0, 0, 0), [u, -Math.cos(la)], [f, Math.sin(la)], [r, side * l.spread]));
    const kn = lin(hip, [th, B.thigh]);
    const sn = norm(lin(v(0, 0, 0), [u, -Math.cos(lk)], [f, Math.sin(lk)], [r, side * l.spread * 0.5]));
    const an = lin(kn, [sn, B.shin]);
    const toeDir = norm(lin(v(0, 0, 0), [f, Math.cos(lk)], [u, Math.sin(lk)]));
    J['hip' + s] = hip; J['knee' + s] = kn; J['ankle' + s] = an; J['toe' + s] = lin(an, [toeDir, 2.8]);
  }
  // ground contact solve
  let dz = 0;
  if (p.ground === 'feet') {
    const m = Math.min(J.ankleL.z - 1.5, J.ankleR.z - 1.5, J.toeL.z - 1.4, J.toeR.z - 1.4);
    dz = -m;
  } else if (p.ground === 'all') {
    const rads = { head: B.headR, chest: 4, pelvis: 3.6, neck: 1.5, handL: 1.6, handR: 1.6, elbowL: 1.5, elbowR: 1.5, kneeL: 2, kneeR: 2, ankleL: 1.5, ankleR: 1.5, toeL: 1.4, toeR: 1.4 };
    dz = -Math.min(...Object.entries(rads).map(([k, rr]) => J[k].z - rr));
  }
  dz += p.lift;
  for (const k of Object.keys(J)) J[k] = add(J[k], v(0, 0, dz));
  // Ride convention: the far leg is hidden by the mount body in side/diagonal views.
  const hidden = new Set(p.hidden);
  if (p.riding) { const rc = dot(r, CAM.C); if (rc > 0.3) hidden.add('legL'); if (rc < -0.3) hidden.add('legR'); }
  return { J, f, r, u, tUp, tFwd, hUp, hFwd, pose: p, hidden };
}

// ---------------------------------------------------------------- body shapes
const cap = (a, b, ra, rb, ramp, part, extra = {}) => ({ type: 'cap', a, b, ra, rb, ramp, part, ...extra });
const INVARIANT = new Set(['head', 'ear', 'neck', 'upperArm', 'foreArm', 'hand']);

export function bodyShapes(S, preset, skin, grow = 0) {
  const { J, r, hFwd } = S; const pr = PRESETS[preset]; const g = grow;
  const out = [];
  out.push({ type: 'sph', c: J.head, R: B.headR + g, ramp: skin, part: 'head' });
  for (const side of [-1, 1]) out.push({ type: 'sph', c: lin(J.head, [r, side * (B.headR - 0.9)], [hFwd, -0.6], [S.hUp, -0.8]), R: 1.6 + g, ramp: skin, part: 'ear' });
  out.push(cap(lin(J.neck, [S.tUp, -0.8]), lin(J.neck, [S.hUp, 2]), 1.5 + g, 1.5 + g, skin, 'neck'));
  out.push(cap(J.pelvis, J.chest, pr.torso[0] + g, pr.torso[1] + g, UNDER, 'torso'));
  out.push(cap(J.shoulderL, J.shoulderR, pr.shoulderBar + g, pr.shoulderBar + g, UNDER, 'torso'));
  out.push(cap(J.hipL, J.hipR, pr.hips + g, pr.hips + g, UNDER, 'hips'));
  for (const s of ['L', 'R']) {
    out.push(cap(J['shoulder' + s], J['elbow' + s], 1.6 + g, 1.4 + g, skin, 'upperArm', { side: s }));
    out.push(cap(J['elbow' + s], J['hand' + s], 1.4 + g, 1.2 + g, skin, 'foreArm', { side: s }));
    out.push({ type: 'sph', c: J['hand' + s], R: 1.5 + g, ramp: skin, part: 'hand', side: s });
    if (S.hidden.has('leg' + s)) continue;
    out.push(cap(J['hip' + s], J['knee' + s], pr.thigh[0] + g, pr.thigh[1] + g, skin, 'thigh', { side: s }));
    out.push(cap(J['knee' + s], J['ankle' + s], pr.shin[0] + g, pr.shin[1] + g, skin, 'shin', { side: s }));
    out.push(cap(J['ankle' + s], J['toe' + s], 1.7 + g, 1.5 + g, skin, 'foot', { side: s }));
  }
  return out;
}

function drawShapes(L, shapes) {
  for (const s of shapes) {
    if (s.type === 'cap') drawCapsule(L, { a: project(s.a, PIVOT), b: project(s.b, PIVOT), ra: s.ra, rb: s.rb, ramp: s.ramp, colorFn: s.colorFn, bias: s.bias });
    else if (s.type === 'sph') drawSphere(L, project(s.c, PIVOT), s.R, 'front', s.fn || (() => ({ ramp: s.ramp })), s.bias || 0);
    else if (s.type === 'quad') drawQuad(L, s.p.map((q) => project(q, PIVOT)), s.uv, s.colorFn, s.bias || 0);
  }
}
const depthOf = (shapes) => { const L = new Layer(CANVAS.w, CANVAS.h); drawShapes(L, shapes); return L.dep; };

/** Garment shell over a body capsule, optionally over a sub-range [t0,t1] of it. */
function shell(bs, part, side, dr, rampOrFn, t0 = 0, t1 = 1, bias = 0) {
  const s = bs.find((x) => x.part === part && (side === undefined || x.side === side));
  if (!s) return null;
  if (s.type === 'sph') return { type: 'sph', c: s.c, R: s.R + dr, ramp: typeof rampOrFn === 'function' ? null : rampOrFn, fn: typeof rampOrFn === 'function' ? rampOrFn : undefined, bias };
  const a = lin(s.a, [sub(s.b, s.a), t0]), b = lin(s.a, [sub(s.b, s.a), t1]);
  const ra = s.ra + (s.rb - s.ra) * t0, rb = s.ra + (s.rb - s.ra) * t1;
  return typeof rampOrFn === 'function' ? cap(a, b, ra + dr, rb + dr, null, part, { colorFn: rampOrFn, bias }) : cap(a, b, ra + dr, rb + dr, rampOrFn, part, { bias });
}
const each = (fn) => ['L', 'R'].map(fn);
const clampGround = (P) => (P.z < 0.8 ? v(P.x, P.y, 0.8) : P);

// ---------------------------------------------------------------- garments & accessories
export const OUTFITS = {
  wayfarer: {
    name: 'Wayfarer (explorer jacket)',
    top(S, bs) {
      const o = OUTFIT.wayfarer;
      const torso = bs.filter((x) => x.part === 'torso');
      const out = [];
      out.push(cap(torso[0].a, lin(torso[0].a, [S.tUp, -1.6]), torso[0].ra + 0.9, torso[0].ra + 1.0, null, 'torso', { colorFn: ({ t }) => (t > 0.55 ? o.trim : o.jacket) }));
      out.push(cap(torso[0].a, torso[0].b, torso[0].ra + 0.8, torso[0].rb + 0.8, o.jacket, 'torso'));
      out.push(cap(torso[1].a, torso[1].b, torso[1].ra + 0.8, torso[1].rb + 0.8, o.jacket, 'torso'));
      out.push(cap(lin(S.J.neck, [S.tUp, -1.2]), lin(S.J.neck, [S.tUp, 0.4]), 2.2, 2.0, o.trim, 'torso', { bias: 0.4 }));
      out.push({ type: 'sph', c: lin(S.J.chest, [S.r, -1.9], [S.tUp, 1.0], [S.tFwd, torso[0].rb + 0.6]), R: 0.9, ramp: GOLD, bias: 0.8 }); // asymmetric chest emblem (left)
      each((s) => out.push(shell(bs, 'upperArm', s, 0.75, o.jacket)));
      each((s) => out.push(shell(bs, 'foreArm', s, 0.8, o.trim, 0, 0.18)));
      return out.filter(Boolean);
    },
    bottom(S, bs) {
      const o = OUTFIT.wayfarer; const out = [];
      const h = bs.find((x) => x.part === 'hips');
      out.push(cap(h.a, h.b, h.ra + 0.7, h.rb + 0.7, o.shorts, 'hips'));
      each((s) => out.push(shell(bs, 'thigh', s, 0.7, o.shorts, 0, 0.72)));
      return out.filter(Boolean);
    },
    shoes(S, bs) {
      const o = OUTFIT.wayfarer; const out = [];
      each((s) => out.push(shell(bs, 'shin', s, 0.6, ({ t }) => (t < 0.12 ? o.trim : o.boots), 0.45, 1)));
      each((s) => out.push(shell(bs, 'foot', s, 0.6, o.boots)));
      return out.filter(Boolean);
    },
    gloves(S, bs) {
      const o = OUTFIT.wayfarer; const out = [];
      each((s) => out.push(shell(bs, 'hand', s, 0.3, o.gloves)));
      each((s) => out.push(shell(bs, 'foreArm', s, 0.5, o.gloves, 0.75, 1)));
      return out.filter(Boolean);
    },
    neck(S) { // scarf: ring + asymmetric tail on the character's left
      const o = OUTFIT.wayfarer; const out = []; const { J, tUp, tFwd, r } = S;
      const c = lin(J.neck, [tUp, -0.9]);
      const pts = Array.from({ length: 7 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return lin(c, [tFwd, Math.cos(a) * 2.6], [r, Math.sin(a) * 2.6]); });
      for (let i = 0; i < 6; i++) out.push(cap(pts[i], pts[i + 1], 1.45, 1.45, o.scarf, 'neck', { bias: 1.0 }));
      const root = lin(c, [tFwd, -2.2], [r, -1.3]);
      const d = norm(lin(v(0, 0, 0), [UP, -1], [S.f, -0.55 * S.pose.flutter], [r, -0.25 + 0.2 * S.pose.sway]));
      const mid = clampGround(lin(root, [d, 3.4]));
      const tip = clampGround(lin(mid, [norm(lin(d, [S.f, -0.3 * S.pose.flutter])), 3.4]));
      out.push(cap(root, mid, 1.35, 1.2, o.scarf, 'neck', { bias: 0.5 }));
      out.push(cap(mid, tip, 1.2, 1.0, o.scarf, 'neck', { bias: 0.5 }));
      return out;
    },
    slots: { top: 'top', bottom: 'bottom', shoes: 'shoes', gloves: 'gloves', neck: 'scarf' },
  },
  runeweave: {
    name: 'Runeweave (tunic and cape)',
    top(S, bs) {
      const o = OUTFIT.runeweave; const out = [];
      const torso = bs.filter((x) => x.part === 'torso');
      const hem = lin(torso[0].a, [S.tUp, -2.4]);
      out.push(cap(torso[0].a, hem, torso[0].ra + 1.0, torso[0].ra + 1.3, null, 'torso', { colorFn: ({ t }) => (t > 0.8 ? o.rune : o.tunic) }));
      out.push(cap(torso[0].a, torso[0].b, torso[0].ra + 0.8, torso[0].rb + 0.8, null, 'torso', { colorFn: ({ t, nx }) => (Math.abs(nx + 0.0) < 0.18 && t > 0.35 ? o.rune : o.tunic) }));
      out.push(cap(torso[1].a, torso[1].b, torso[1].ra + 0.8, torso[1].rb + 0.8, o.tunic, 'torso'));
      each((s) => out.push(shell(bs, 'upperArm', s, 0.7, o.tunic)));
      each((s) => out.push(shell(bs, 'foreArm', s, 0.7, ({ t }) => (t > 0.7 ? o.rune : o.tunic), 0, 0.85)));
      return out.filter(Boolean);
    },
    bottom(S, bs) {
      const o = OUTFIT.runeweave; const out = [];
      const h = bs.find((x) => x.part === 'hips');
      out.push(cap(h.a, h.b, h.ra + 0.6, h.rb + 0.6, o.leggings, 'hips'));
      each((s) => out.push(shell(bs, 'thigh', s, 0.5, o.leggings)));
      each((s) => out.push(shell(bs, 'shin', s, 0.5, o.leggings, 0, 0.8)));
      return out.filter(Boolean);
    },
    shoes(S, bs) {
      const o = OUTFIT.runeweave; const out = [];
      each((s) => out.push(shell(bs, 'shin', s, 0.55, o.shoes, 0.72, 1)));
      each((s) => out.push(shell(bs, 'foot', s, 0.55, ({ t }) => (t > 0.7 ? o.rune : o.shoes))));
      return out.filter(Boolean);
    },
    gloves(S, bs) {
      const o = OUTFIT.runeweave; const out = [];
      each((s) => out.push(shell(bs, 'hand', s, 0.2, o.wraps)));
      return out.filter(Boolean);
    },
    neck(S) { // short cape hanging from the shoulders, gold lining
      const o = OUTFIT.runeweave; const { J, tUp, tFwd, r } = S;
      const TL = lin(J.shoulderL, [tFwd, -2.6], [tUp, 0.8], [r, -0.6]);
      const TR = lin(J.shoulderR, [tFwd, -2.6], [tUp, 0.8], [r, 0.6]);
      const hang = norm(lin(v(0, 0, 0), [UP, -1], [tFwd, -0.35 * S.pose.flutter], [r, 0.12 * S.pose.sway]));
      const BL = clampGround(lin(TL, [hang, 9], [r, -1.4], [tFwd, -0.6]));
      const BR = clampGround(lin(TR, [hang, 9], [r, 1.4], [tFwd, -0.6]));
      const out = [{ type: 'quad', p: [TL, TR, BR, BL], uv: [[0, 0], [1, 0], [1, 1], [0, 1]], bias: -0.2, colorFn: ({ u, v: vv, front }) => ({ ramp: front ? o.cape : o.lining, tone: vv > 0.86 ? 0 : vv > 0.62 ? 1 : vv < 0.12 ? 3 : 2 }) }];
      out.push(cap(lin(TL, [tFwd, 1.2]), lin(TR, [tFwd, 1.2]), 1.2, 1.2, o.cape, 'neck', { bias: 0.6 }));
      out.push({ type: 'sph', c: lin(J.neck, [tUp, -1.4], [tFwd, 2.3]), R: 0.95, ramp: GOLD, bias: 1.2 });
      return out;
    },
    slots: { top: 'top', bottom: 'bottom', shoes: 'shoes', gloves: 'gloves', neck: 'cape' },
  },
};

/** Satchel (backpack slot): bag on the character's LEFT hip, strap from RIGHT shoulder — deliberately asymmetric. */
export function satchelShapes(S, bs) {
  const { J, tUp, tFwd, r } = S; const torso = bs.find((x) => x.part === 'torso'); const out = [];
  const bag = lin(J.pelvis, [r, -(B.hip + 3.4)], [tUp, 1.2], [tFwd, -0.6]);
  out.push(cap(lin(bag, [tFwd, -1.4]), lin(bag, [tFwd, 1.4]), 2.4, 2.4, null, 'bag', { colorFn: ({ ny }) => (ny < -0.35 ? { ramp: LEATHER, tone: 3 } : LEATHER) }));
  out.push({ type: 'sph', c: lin(bag, [r, -2.1], [tUp, 0.6]), R: 0.8, ramp: GOLD, bias: 0.6 });
  const shR = lin(J.shoulderR, [tUp, 0.4]);
  const rad0 = torso.rb + 1.4;
  const frontA = lin(shR, [tFwd, rad0 * 0.75]);
  const frontB = lin(J.pelvis, [r, -(B.hip + 1.6)], [tUp, 2.6], [tFwd, torso.ra + 1.2]);
  out.push(cap(lin(shR, [tUp, 0.6]), frontA, 0.65, 0.65, LEATHER, 'strap', { bias: 1.3 }));
  out.push(cap(frontA, frontB, 0.65, 0.65, LEATHER, 'strap', { bias: 1.3 }));
  const backA = lin(shR, [tFwd, -rad0 * 0.75]);
  const backB = lin(J.pelvis, [r, -(B.hip + 1.6)], [tUp, 2.6], [tFwd, -(torso.ra + 1.2)]);
  out.push(cap(lin(shR, [tUp, 0.6]), backA, 0.65, 0.65, LEATHER, 'strap', { bias: 1.3 }));
  out.push(cap(backA, backB, 0.65, 0.65, LEATHER, 'strap', { bias: 1.3 }));
  return out;
}

// ---------------------------------------------------------------- hair
const zig = (c, k) => Math.abs((((c * k) % 1) + 1) % 1 - 0.5) * 2;
const smooth = (x) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
export const HAIRSTYLES = {
  style01: {
    name: 'Windswept short',
    shellR: 1.1,
    cover(a, b, c) {
      const back = Math.abs(c) > 0.55 ? -0.15 : -0.42;
      const face = 0.5 + 0.14 * zig(c, 2.6);
      return b > back + (face - back) * smooth((a - 0.05) / 0.45);
    },
    extras(S, col) {
      const { J, hUp, hFwd, r } = S; const R = B.headR; const out = [];
      out.push(cap(lin(J.head, [hUp, R * 0.8], [r, 1.6], [hFwd, -0.6]), lin(J.head, [hUp, R + 1.3], [r, 2.6], [hFwd, -1.4]), 1.3, 0.5, col, 'hair'));
      for (const i of [-1, 0, 1]) out.push(cap(lin(J.head, [hFwd, -R * 0.65], [hUp, R * 0.05], [r, i * 3.1]), lin(J.head, [hFwd, -R - 1.8], [hUp, -1.4], [r, i * 2.8]), 1.5, 0.5, col, 'hair'));
      out.push(cap(lin(J.head, [hFwd, R * 0.55], [hUp, R * 0.55], [r, -2.5]), lin(J.head, [hFwd, R * 0.95], [hUp, R * 0.2], [r, -4.4]), 1.5, 0.6, col, 'hair'));
      return out;
    },
  },
  style02: {
    name: 'Side-tail long',
    shellR: 1.35,
    cover(a, b, c) {
      const back = Math.abs(c) > 0.5 ? -0.55 : -0.78;
      const face = 0.44 + 0.2 * smooth(0.55 - c * 0.9);
      return b > back + (face - back) * smooth((a - 0.0) / 0.5);
    },
    extras(S, col) {
      const { J, hUp, hFwd, r } = S; const R = B.headR; const out = [];
      const root = lin(J.head, [r, -R * 0.86], [hUp, R * 0.15], [hFwd, -R * 0.35]);
      out.push({ type: 'sph', c: lin(root, [r, -0.6]), R: 1.35, ramp: GOLD, part: 'tie', bias: 0.4 });
      const g = norm(lin(v(0, 0, 0), [UP, -1], [r, -0.32 + 0.12 * S.pose.sway], [S.f, -0.2 * S.pose.flutter]));
      const mid = clampGround(lin(root, [g, 5], [r, -1.6]));
      const tip = clampGround(lin(mid, [norm(lin(g, [S.f, -0.25 * S.pose.flutter])), 5.6]));
      out.push(cap(lin(root, [r, -0.8]), mid, 2.3, 1.9, col, 'hair'));
      out.push(cap(mid, tip, 1.9, 0.7, col, 'hair'));
      out.push(cap(lin(J.head, [r, R * 0.72], [hFwd, R * 0.45], [hUp, R * 0.25]), lin(J.head, [r, R * 0.86], [hFwd, R * 0.35], [hUp, -R * 0.75]), 1.6, 0.8, col, 'hair'));
      return out;
    },
  },
};

function hairShell(S, style, col, surface) {
  const st = HAIRSTYLES[style];
  const c = lin(S.J.head, [S.hUp, 0.6]);
  return { type: 'shell', c, R: B.headR + st.shellR, surface, fn: (n, sn) => {
    const a = dot(n, S.hFwd), b = dot(n, S.hUp), cc = dot(n, S.r);
    if (!st.cover(a, b, cc)) return null;
    if (surface === 'front' && b > 0.48 && b < 0.62 && a > -0.4) return { ramp: col, tone: 3 };
    return { ramp: col };
  } };
}

// ---------------------------------------------------------------- face stamps
function faceStamps(S, preset, L) {
  const { J, hFwd, hUp, r } = S; const R = B.headR; const pal = EYES[preset];
  const hc = project(J.head, PIVOT);
  const surf = (P) => { const q = project(P, PIVOT); const dx = q.x - hc.x, dy = q.y - hc.y; return { x: Math.floor(q.x), y: Math.floor(q.y), d: hc.d + Math.sqrt(Math.max(0, R * R - dx * dx - dy * dy)) + 0.4 }; };
  const expr = S.pose.expr;
  for (const side of [-1, 1]) {
    const ed = norm(lin(v(0, 0, 0), [hFwd, 0.8], [r, side * 0.5], [hUp, 0.22]));
    const vis = dot(ed, CAM.C);
    if (vis < 0.2) continue;
    const q = surf(lin(J.head, [ed, R]));
    const outer = Math.sign(q.x + 0.5 - hc.x) || side;
    const px = [];
    const full = vis > 0.5;
    if (expr === 'closed') { px.push([0, 1, pal.dark]); if (full) px.push([outer > 0 ? 1 : -1, 1, pal.dark]); }
    else if (expr === 'happy') { px.push([0, 0, pal.dark]); if (full) { px.push([outer > 0 ? 1 : -1, 1, pal.dark]); px.push([outer > 0 ? -1 : 1, 1, pal.dark]); } }
    else {
      const ox = outer > 0 ? 1 : -1;
      const cols = full ? [0, ox] : [0];
      for (const cx of cols) px.push([cx, 0, pal.dark]);
      px.push([0, 1, expr === 'hurt' ? pal.dark : pal.white]);
      if (full) px.push([ox, 1, pal.iris]);
      for (const cx of cols) px.push([cx, 2, expr === 'surprised' ? pal.white : pal.iris]);
      if (preset === 'female') px.push([full ? ox * 2 : ox, 0, pal.dark]);
      if (expr === 'focus' || expr === 'sad') px.push([expr === 'focus' ? 0 : ox, -2, pal.dark]);
    }
    if (pal.blush && expr !== 'closed' && full) px.push([outer > 0 ? 2 : -2, 3, pal.blush]);
    stamp(L, q.x, q.y, q.d, px);
  }
  const md = norm(lin(v(0, 0, 0), [hFwd, 0.9], [hUp, -0.08]));
  const mv = dot(md, CAM.C);
  if (mv > 0.3) {
    const q = surf(lin(J.head, [md, R]));
    const m = pal.mouth, k = pal.dark;
    const wide = mv > 0.6;
    let px;
    if (expr === 'happy' || expr === 'surprised') px = wide ? [[0, 0, k], [1, 0, k], [0, 1, m], [1, 1, m]] : [[0, 0, k], [0, 1, m]];
    else if (expr === 'sad' || expr === 'hurt') px = wide ? [[0, 0, m], [-1, 1, m], [1, 1, m]] : [[0, 0, m]];
    else if (expr === 'closed') px = [[0, 0, m]];
    else px = wide ? [[0, 0, m], [1, 0, m]] : [[0, 0, m]];
    stamp(L, q.x, q.y, q.d, px);
  }
}

// ---------------------------------------------------------------- per-frame rendering
export const SKIN_TONES = Object.keys(SKIN);
export const HAIR_COLORS = Object.keys(HAIR);

/**
 * Render every layer variant for one frame. Returns { variants: {variantKey: rgba}, anchors }.
 * Variant keys match buildTrainerVariants() in build.mjs.
 */
export function renderFrame(pose, dir) {
  const S = solvePose(pose, dir);
  const out = {};
  // preset-invariant mask (head, ears, neck, arms, hands) — lets hair_front be shared by both presets
  const invShapes = bodyShapes(S, 'male', SKIN.light).filter((s) => INVARIANT.has(s.part));
  const invZ = depthOf(invShapes);
  // shadow (ground ellipses below the body mass)
  {
    const L = new Layer(CANVAS.w, CANVAS.h);
    const pts = [[S.J.pelvis, 7], [S.J.chest, 5.5], [S.J.head, 6.5], [S.J.ankleL, 3], [S.J.ankleR, 3]];
    const rgba = new Uint8Array(CANVAS.w * CANVAS.h * 4);
    for (const [P, rr] of pts) {
      const q = project(v(P.x, P.y, 0), PIVOT); const k = 1 - Math.min(0.6, P.z / 60);
      for (let y = 0; y < CANVAS.h; y++) for (let x = 0; x < CANVAS.w; x++) {
        const dx = (x + 0.5 - q.x) / (rr * k), dy = (y + 0.5 - q.y) / (rr * k * 0.45);
        if (dx * dx + dy * dy <= 1) rgba.set(SHADOW_RGBA, (y * CANVAS.w + x) * 4);
      }
    }
    void L; out['shadow'] = rgba;
  }
  // hair_front (shared by presets)
  for (const style of Object.keys(HAIRSTYLES)) for (const hc of HAIR_COLORS) {
    const col = HAIR[hc];
    const Lf = new Layer(CANVAS.w, CANVAS.h);
    const sh = hairShell(S, style, col, 'front');
    drawSphere(Lf, project(sh.c, PIVOT), sh.R, 'front', sh.fn);
    const headD = project(S.J.head, PIVOT).d;
    const extras = HAIRSTYLES[style].extras(S, col);
    const centerD = (s) => (s.type === 'cap' ? (project(s.a, PIVOT).d + project(s.b, PIVOT).d) / 2 : project(s.c, PIVOT).d);
    const fr = extras.filter((s) => centerD(s) >= headD), bk = extras.filter((s) => centerD(s) < headD);
    drawShapes(Lf, fr);
    out[`hair_front.${style}.${hc}`] = finalize(Lf, invZ);
    out[`_hair_back_shapes.${style}.${hc}`] = { sh: hairShell(S, style, col, 'back'), bk };
  }
  for (const preset of Object.keys(PRESETS)) {
    const bsLight = bodyShapes(S, preset, SKIN.light);
    const bodyZ = depthOf(bsLight);
    const outfitZ = depthOf(bodyShapes(S, preset, SKIN.light, 1.0));
    for (const tone of SKIN_TONES) {
      const L = new Layer(CANVAS.w, CANVAS.h);
      drawShapes(L, bodyShapes(S, preset, SKIN[tone]));
      out[`body.${preset}.${tone}`] = finalize(L);
    }
    { const L = new Layer(CANVAS.w, CANVAS.h); faceStamps(S, preset, L); out[`face.${preset}`] = finalize(L, bodyZ, { outline: false }); }
    for (const style of Object.keys(HAIRSTYLES)) for (const hc of HAIR_COLORS) {
      const { sh, bk } = out[`_hair_back_shapes.${style}.${hc}`];
      const L = new Layer(CANVAS.w, CANVAS.h);
      drawSphere(L, project(sh.c, PIVOT), sh.R, 'back', sh.fn);
      drawShapes(L, bk);
      out[`hair_back.${style}.${preset}.${hc}`] = finalize(L, outfitZ);
    }
    for (const [oid, o] of Object.entries(OUTFITS)) {
      for (const piece of ['bottom', 'shoes', 'top', 'gloves']) {
        const L = new Layer(CANVAS.w, CANVAS.h); drawShapes(L, o[piece](S, bsLight)); out[`${piece}.${oid}.${preset}`] = finalize(L, bodyZ);
      }
      const L = new Layer(CANVAS.w, CANVAS.h); drawShapes(L, o.neck(S, bsLight)); out[`${o.slots.neck}.${oid}.${preset}`] = finalize(L, outfitZ);
    }
    { const L = new Layer(CANVAS.w, CANVAS.h); drawShapes(L, satchelShapes(S, bsLight)); out[`backpack.satchel.${preset}`] = finalize(L, outfitZ); }
  }
  for (const k of Object.keys(out)) if (k.startsWith('_')) delete out[k];
  // anchors (preset-invariant because joints are shared)
  const pj = (P) => { const q = project(P, PIVOT); return { x: Math.round(q.x * 10) / 10, y: Math.round(q.y * 10) / 10 }; };
  const handD = project(S.J.handR, PIVOT).d, chestD = project(S.J.chest, PIVOT).d;
  const anchors = {
    hand_item_anchor: pj(lin(S.J.handR, [UP, 0.5])),
    held_item_order: handD >= chestD - 0.5 ? 'front' : 'back',
    holds_item: !!pose.holds,
    head_anchor: pj(lin(S.J.head, [S.hUp, B.headR + 1])),
    chest_anchor: pj(S.J.chest),
    seat_anchor: pj(lin(S.J.pelvis, [UP, -3])),
    hidden_parts: [...S.hidden],
  };
  return { variants: out, anchors };
}
