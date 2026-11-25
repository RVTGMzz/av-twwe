// Ground mount proof Kin (original placeholder design, working ID kin.mount.ground.proto01).
// Rendered as two independent layers (rear / front of the rider) plus shadow, with per-frame anchors.
import { v, lin, rad, UP, project, CAM, dot } from './math.mjs';
import { Layer, drawCapsule, drawSphere, stamp, finalize } from './raster.mjs';
import { MOUNT, SHADOW_RGBA } from './palettes.mjs';

export const M_CANVAS = { w: 96, h: 96 };
export const M_PIVOT = { x: 48, y: 82 };
export const FRONT_DEPTH_MARGIN = 7; // mount pixels nearer than saddle + margin go to the front layer
export const MOUNT_SCALE = 1.45;

export const MOUNT_ANIMS = [
  { id: 'idle', loop: true, durations: Array(4).fill(200), n: 4 },
  { id: 'walk', loop: true, durations: Array(6).fill(110), n: 6 },
];

function solve(anim, i, dir) {
  const f = dir.f, r = dir.r;
  let bob = 0, breath = 0, nod = 0;
  const legA = { FL: 0, FR: 0, RL: 0, RR: 0 }, lift = { FL: 0, FR: 0, RL: 0, RR: 0 };
  if (anim === 'idle') { breath = [0, 0.4, 0.8, 0.4][i]; nod = [0, 0.5, 1, 0.5][i]; }
  else {
    const p = (2 * Math.PI * i) / 6;
    for (const [k, ph] of [['FL', 0], ['RR', 0], ['FR', Math.PI], ['RL', Math.PI]]) {
      legA[k] = 24 * Math.sin(p + ph); lift[k] = 1.6 * Math.max(0, Math.cos(p + ph));
    }
    bob = Math.abs(Math.sin(p)) > 0.5 ? 0 : 1; nod = -bob;
  }
  const at = (fv, rv, z) => lin(v(0, 0, z), [f, fv], [r, rv]);
  const by = 13 + bob;
  const shapes = [];
  const C = (a, b, ra, rb, ramp, colorFn) => shapes.push({ t: 'c', a, b, ra, rb, ramp, colorFn });
  const Sph = (c, R, ramp, fn) => shapes.push({ t: 's', c, R, ramp, fn });
  const bellyFn = ({ ny }) => (ny > 0.42 ? MOUNT.belly : MOUNT.body);
  C(at(-6, 0, by), at(5, 0, by + 0.6), 7.1 + breath * 0.3, 7.5 + breath * 0.3, null, bellyFn);
  let head = at(11, 0, by + 8 + nod * 0.5);
  Sph(head, 5.8, MOUNT.body);
  Sph(lin(head, [f, 4.6], [UP, -2]), 3.0, MOUNT.belly);
  for (const side of [-1, 1]) {
    C(lin(head, [r, side * 3.4], [UP, 3.2]), lin(head, [r, side * 6.4], [UP, 4.8], [f, -1.6]), 1.5, 0.8, MOUNT.body);
  }
  C(lin(head, [UP, 4.8], [f, 1]), lin(head, [UP, 8.6], [f, 3.2]), 1.3, 0.5, MOUNT.crystal);
  Sph(at(7.4, 0, by + 7.6), 2.5, MOUNT.mane); Sph(at(4.6, 0, by + 7.4), 2.3, MOUNT.mane);
  Sph(at(-11.8, 0, by + 3), 2.7, MOUNT.mane);
  // runic saddle plate + side cloth
  C(at(-1.6, 0, by + 7.4), at(2, 0, by + 7.6), 2.1, 2.1, MOUNT.saddle);
  C(at(0.2, -6.6, by + 4.8), at(0.2, 6.6, by + 4.8), 1.7, 1.7, null, ({ t }) => (Math.abs(t - 0.5) < 0.08 ? MOUNT.trim : MOUNT.saddle));
  for (const [k, fv, side] of [['FL', 5, -1], ['FR', 5, 1], ['RL', -5, -1], ['RR', -5, 1]]) {
    const hip = at(fv, side * 4.4, 9 + bob);
    const a = rad(legA[k]);
    const foot = lin(hip, [UP, -Math.cos(a) * (8.2 + bob) + lift[k]], [f, Math.sin(a) * 7]);
    C(hip, foot, 2.5, 2.1, MOUNT.body);
    Sph(lin(foot, [UP, -0.6]), 2.2, MOUNT.hoof);
  }
  // uniform scale: rig authored at 1x, mount must read clearly larger than the 64 px rider
  const K = MOUNT_SCALE, sc = (P) => v(P.x * K, P.y * K, P.z * K);
  for (const s of shapes) { if (s.t === 'c') { s.a = sc(s.a); s.b = sc(s.b); s.ra *= K; s.rb *= K; } else { s.c = sc(s.c); s.R *= K; } }
  head = sc(head);
  // ground solve (hooves rest on the ground)
  let minZ = Infinity;
  for (const s of shapes) if (s.ramp === MOUNT.hoof) minZ = Math.min(minZ, s.c.z - s.R);
  const dz = -minZ;
  const shift = (P) => v(P.x, P.y, P.z + dz);
  for (const s of shapes) { if (s.t === 'c') { s.a = shift(s.a); s.b = shift(s.b); } else s.c = shift(s.c); }
  const saddleTop = shift(sc(at(0.2, 0, by + 9.6)));
  return { shapes, head: shift(head), saddleTop, f, r };
}

export function renderMountFrame(anim, i, dir) {
  const { shapes, head, saddleTop, f, r } = solve(anim, i, dir);
  const L = new Layer(M_CANVAS.w, M_CANVAS.h);
  for (const s of shapes) {
    if (s.t === 'c') drawCapsule(L, { a: project(s.a, M_PIVOT), b: project(s.b, M_PIVOT), ra: s.ra, rb: s.rb, ramp: s.ramp, colorFn: s.colorFn });
    else drawSphere(L, project(s.c, M_PIVOT), s.R, 'front', s.fn || (() => ({ ramp: s.ramp })));
  }
  // eyes on the head sphere
  const hc = project(head, M_PIVOT);
  for (const side of [-1, 1]) {
    const ed = lin(v(0, 0, 0), [f, 0.75], [r, side * 0.55], [UP, 0.25]);
    if (dot(ed, CAM.C) < 0.15) continue;
    const q = project(lin(head, [ed, 5.6 * MOUNT_SCALE]), M_PIVOT);
    stamp(L, Math.floor(q.x), Math.floor(q.y), hc.d + 9, [[0, 0, MOUNT.eyeHi], [0, 1, MOUNT.eye], [0, 2, MOUNT.eye]]);
  }
  const rgba = finalize(L);
  const saddle = project(saddleTop, M_PIVOT);
  const thr = saddle.d + FRONT_DEPTH_MARGIN;
  const rear = new Uint8Array(rgba.length), front = new Uint8Array(rgba.length);
  for (let p = 0; p < M_CANVAS.w * M_CANVAS.h; p++) {
    if (!rgba[p * 4 + 3]) continue;
    // outline pixels have no depth of their own; use the nearest drawn neighbour's depth
    let d = L.dep[p];
    if (d < -1e8) { for (const q of [p - 1, p + 1, p - M_CANVAS.w, p + M_CANVAS.w]) if (q >= 0 && q < L.dep.length) d = Math.max(d, L.dep[q]); }
    (d > thr ? front : rear).set(rgba.subarray(p * 4, p * 4 + 4), p * 4);
  }
  // shadow
  const shadow = new Uint8Array(rgba.length);
  const sc = project(v(saddleTop.x, saddleTop.y, 0), M_PIVOT);
  const ext = (fv, rv) => project(lin(v(0, 0, 0), [f, fv], [r, rv]), M_PIVOT);
  const corners = [ext(15 * MOUNT_SCALE, 0), ext(-13 * MOUNT_SCALE, 0), ext(0, 8 * MOUNT_SCALE), ext(0, -8 * MOUNT_SCALE)];
  const rx = Math.max(...corners.map((c) => Math.abs(c.x - sc.x))), ry = Math.max(...corners.map((c) => Math.abs(c.y - sc.y)));
  for (let y = 0; y < M_CANVAS.h; y++) for (let x = 0; x < M_CANVAS.w; x++) {
    const dx = (x + 0.5 - sc.x) / (rx * 0.85), dy = (y + 0.5 - sc.y) / Math.max(3, ry * 0.85);
    if (dx * dx + dy * dy <= 1) shadow.set(SHADOW_RGBA, (y * M_CANVAS.w + x) * 4);
  }
  const rd = (q) => ({ x: Math.round(q.x * 10) / 10, y: Math.round(q.y * 10) / 10 });
  return {
    layers: { rear, front, shadow },
    anchors: {
      saddle_anchor: rd(saddle),
      rider_offset: rd({ x: saddle.x - M_PIVOT.x, y: saddle.y - M_PIVOT.y }),
      shadow_anchor: rd(sc),
      collision_bounds: { shape: 'ellipse', cx: Math.round(sc.x - M_PIVOT.x), cy: Math.round(sc.y - M_PIVOT.y), rx: Math.round(rx * 0.8), ry: Math.max(3, Math.round(ry * 0.8)) },
    },
  };
}
