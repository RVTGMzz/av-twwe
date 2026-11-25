// AV-TWWE asset pipeline — vector math and the shared camera projection.
// World axes: X = screen right (east), Y = south (toward camera), Z = up.
// Pixel-art 3/4 projection: screen_y = 0.6 * Y - Z (full character height, squashed ground).
export const v = (x, y, z) => ({ x, y, z });
export const add = (a, b) => v(a.x + b.x, a.y + b.y, a.z + b.z);
export const sub = (a, b) => v(a.x - b.x, a.y - b.y, a.z - b.z);
export const mul = (a, s) => v(a.x * s, a.y * s, a.z * s);
export const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
export const len = (a) => Math.hypot(a.x, a.y, a.z);
export const norm = (a) => { const l = len(a) || 1; return mul(a, 1 / l); };
/** lin(base, [vec, s], [vec, s], ...) = base + sum(vec * s) */
export function lin(base, ...terms) {
  let r = base;
  for (const [vec, s] of terms) r = add(r, mul(vec, s));
  return r;
}
export const rad = (d) => (d * Math.PI) / 180;
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const UP = v(0, 0, 1);

export const GROUND_SQUASH = 0.6;
// Camera basis used for depth and for reconstructing surface normals from screen pixels.
export const CAM = {
  X: v(1, 0, 0),
  D: v(0, 0.5145, -0.8575), // world direction of "screen down"
  C: v(0, 0.8575, 0.5145), // world direction toward the camera (depth axis)
};

/** Project a world point to canvas pixels. d = nearness to camera (bigger = in front). */
export function project(P, pivot) {
  return { x: pivot.x + P.x, y: pivot.y + GROUND_SQUASH * P.y - P.z, d: dot(P, CAM.C) };
}

/** Canonical direction order. Never reorder: IDs are stable save/metadata keys. */
export const DIRECTIONS = [
  { id: 'S', dx: 0, dy: 1 },
  { id: 'SW', dx: -1, dy: 1 },
  { id: 'W', dx: -1, dy: 0 },
  { id: 'NW', dx: -1, dy: -1 },
  { id: 'N', dx: 0, dy: -1 },
  { id: 'NE', dx: 1, dy: -1 },
  { id: 'E', dx: 1, dy: 0 },
  { id: 'SE', dx: 1, dy: 1 },
].map((d) => {
  const f = norm(v(d.dx, d.dy, 0));
  return { ...d, f, r: v(-f.y, f.x, 0) }; // r = character's right hand side
});
