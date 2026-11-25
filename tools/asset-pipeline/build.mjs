// AV-TWWE ART-003-B01 build: renders Trainer layers, ground mount, Aevin and Bond FX into
// PNG atlases (build/asset-pipeline/png, not committed) + JSON metadata (committed).
// Usage: node tools/asset-pipeline/build.mjs   (then python tools/asset-pipeline/convert_webp.py)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIRECTIONS, project } from './lib/math.mjs';
import { encodePNG } from './lib/png.mjs';
import { blit, packStrips } from './lib/raster.mjs';
import { ANIMATIONS, CANVAS, PIVOT, PRESETS, HAIRSTYLES, OUTFITS, SKIN_TONES, HAIR_COLORS, renderFrame, solvePose } from './lib/trainer.mjs';
import { MOUNT_ANIMS, M_CANVAS, M_PIVOT, FRONT_DEPTH_MARGIN, renderMountFrame } from './lib/mount.mjs';
import { AEVIN, AEVIN_TYPES, renderAevin, FX, renderFx } from './lib/props.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PNG_DIR = join(ROOT, 'build', 'asset-pipeline', 'png');
const GENERATOR = 'tools/asset-pipeline/build.mjs (procedural rig, deterministic)';
const STATUS = 'procedural_prototype_rejected'; // owner rejected art quality 2026-11-25; outputs stay in build/ only
// All outputs go under build/ (gitignored). Production art comes from approved masters (docs/tasks/ART-003-G01.md).
const OUT = 'build/asset-pipeline/prototype/';
const DIR_IDS = DIRECTIONS.map((d) => d.id);
const t0 = Date.now();
const convert = []; // {png, webp}
const write = (rel, data) => { const p = join(ROOT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, data); };
function saveAtlas(relWebp, w, h, rgba) {
  const relPng = relWebp.slice(OUT.length).replace(/.webp$/, '.png');
  const p = join(PNG_DIR, relPng); mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, encodePNG(w, h, rgba));
  convert.push({ png: 'build/asset-pipeline/png/' + relPng, webp: relWebp, w, h });
}

// ============================================================ Trainer
const COLS = 20;
const rendered = ANIMATIONS.filter((a) => a.poses);
const strips = [];
for (const a of rendered) for (const d of DIR_IDS) strips.push({ anim: a.id, dir: d, n: a.poses.length });
const pack = packStrips(strips, COLS);
const AW = COLS * CANVAS.w, AH = pack.rows * CANVAS.h;
const frames = {}; // anim -> dir -> [{x,y}]
for (const pl of pack.placements) {
  (frames[pl.anim] ??= {})[pl.dir] = Array.from({ length: pl.n }, (_, i) => ({ x: (pl.col + i) * CANVAS.w, y: pl.row * CANVAS.h }));
}

const VARIANTS = [];
const vfile = (folder, id) => OUT + `assets/characters/trainer/${folder}/${id.replace(/^trainer\./, '').replace(/\./g, '_')}.webp`;
const addV = (key, o) => VARIANTS.push({ key, ...o, file: vfile(o.folder, o.id) });
for (const p of Object.keys(PRESETS)) for (const t of SKIN_TONES) addV(`body.${p}.${t}`, { id: `trainer.body.${p}.skin_${t}`, slot: 'base_body', presets: [p], skin_tone: t, folder: 'base' });
for (const p of Object.keys(PRESETS)) addV(`face.${p}`, { id: `trainer.face.${p}.default`, slot: 'face', presets: [p], folder: 'face' });
for (const s of Object.keys(HAIRSTYLES)) for (const c of HAIR_COLORS) {
  addV(`hair_front.${s}.${c}`, { id: `trainer.hair.${s}.${c}.front`, slot: 'hair_front', presets: Object.keys(PRESETS), hairstyle: s, hair_color: c, folder: 'hair' });
  for (const p of Object.keys(PRESETS)) addV(`hair_back.${s}.${p}.${c}`, { id: `trainer.hair.${s}.${c}.back.${p}`, slot: 'hair_back', presets: [p], hairstyle: s, hair_color: c, folder: 'hair' });
}
for (const [o, def] of Object.entries(OUTFITS)) for (const p of Object.keys(PRESETS)) {
  for (const piece of ['top', 'bottom', 'shoes', 'gloves', def.slots.neck]) addV(`${piece}.${o}.${p}`, { id: `trainer.outfit.${o}.${piece}.${p}`, slot: piece, presets: [p], outfit: o, folder: 'outfits' });
}
for (const p of Object.keys(PRESETS)) addV(`backpack.satchel.${p}`, { id: `trainer.accessory.satchel.${p}`, slot: 'backpack', presets: [p], folder: 'accessories' });
addV('shadow', { id: 'trainer.shadow.default', slot: 'shadow', presets: Object.keys(PRESETS), folder: 'base' });

const buffers = Object.fromEntries(VARIANTS.map((v) => [v.key, new Uint8Array(AW * AH * 4)]));
const frameData = {}; const poseData = {};
const r1 = (x) => Math.round(x * 10) / 10;
for (const a of rendered) {
  frameData[a.id] = {}; poseData[a.id] = {};
  for (const d of DIRECTIONS) {
    frameData[a.id][d.id] = []; poseData[a.id][d.id] = [];
    a.poses.forEach((pose, i) => {
      const { variants, anchors } = renderFrame(pose, d);
      const cell = frames[a.id][d.id][i];
      for (const v of VARIANTS) {
        const src = variants[v.key];
        if (!src) throw new Error('missing variant render ' + v.key);
        blit(buffers[v.key], AW, src, CANVAS.w, CANVAS.h, cell.x, cell.y);
      }
      frameData[a.id][d.id].push(anchors);
      const S = solvePose(pose, d);
      poseData[a.id][d.id].push(Object.fromEntries(Object.entries(S.J).map(([k, P]) => { const q = project(P, PIVOT); return [k, [r1(q.x), r1(q.y), r1(q.d)]]; })));
    });
  }
  process.stdout.write(`trainer ${a.id} done (${((Date.now() - t0) / 1000).toFixed(1)}s)\n`);
}
for (const v of VARIANTS) saveAtlas(v.file, AW, AH, buffers[v.key]);

const ORDER = {
  front: ['shadow', 'mount_rear', 'cape', 'hair_back', 'base_body', 'face', 'bottom', 'shoes', 'top', 'gloves', 'scarf', 'backpack', 'accessories', 'hair_front', 'headwear', 'held_item', 'mount_front', 'effects'],
  side: ['shadow', 'mount_rear', 'hair_back', 'base_body', 'face', 'bottom', 'shoes', 'top', 'gloves', 'cape', 'backpack', 'scarf', 'accessories', 'hair_front', 'headwear', 'held_item', 'mount_front', 'effects'],
  back: ['shadow', 'mount_rear', 'base_body', 'face', 'bottom', 'shoes', 'top', 'gloves', 'backpack', 'cape', 'hair_back', 'scarf', 'accessories', 'hair_front', 'headwear', 'held_item', 'mount_front', 'effects'],
};
const dirGroup = { S: 'front', SW: 'front', SE: 'front', W: 'side', E: 'side', NW: 'back', N: 'back', NE: 'back' };

const trainerMeta = {
  schema_version: 1,
  id: 'trainer.modular.batch01',
  task: 'ART-003-B01',
  status: STATUS,
  status_note: 'Procedurally rendered proof sprites from a shared 3D-ish rig. Pipeline/metadata proof only; production art requires owner visual approval and hand-authored or reviewed pixel masters.',
  generator: GENERATOR,
  canvas: { ...CANVAS }, pivot: { ...PIVOT, meaning: 'ground contact point under the pelvis (feet)' },
  tile_size: 32,
  sampling: 'nearest',
  directions: DIR_IDS,
  mirror_policy: { mode: 'native_all_8', note: 'All 8 directions rendered natively. Asymmetric details (left chest emblem, right-hand Aevin, left-hip satchel, side-tail hair, scarf tail) make mirroring unsafe; do not flip.', mirror_safe: false },
  slots: [
    { id: 'shadow', mask: 'none' },
    { id: 'base_body', mask: 'none', note: 'skin tone is a palette dimension of base_body (variant per tone); palettes listed for engine-side palette swap' },
    { id: 'face', mask: 'body' },
    { id: 'hair_back', mask: 'outfit_shell' },
    { id: 'hair_front', mask: 'body_invariant', note: 'shared by both presets' },
    { id: 'top', mask: 'body' }, { id: 'bottom', mask: 'body' }, { id: 'shoes', mask: 'body' }, { id: 'gloves', mask: 'body' },
    { id: 'headwear', mask: 'outfit_shell', batch01: 'slot defined, no asset yet' },
    { id: 'scarf', mask: 'outfit_shell', note: 'spec layer "Scarf / Cape" is split in two slots because they need different draw order' },
    { id: 'cape', mask: 'outfit_shell' },
    { id: 'backpack', mask: 'outfit_shell' },
    { id: 'accessories', mask: 'outfit_shell', batch01: 'slot defined, no asset yet' },
    { id: 'held_item', external: 'assets/items/aevin/aevin_items.json', anchor: 'hand_item_anchor' },
    { id: 'mount_rear', external: 'mount metadata' }, { id: 'mount_front', external: 'mount metadata' },
    { id: 'effects', external: 'assets/effects/bond/bond_fx.json' },
  ],
  render_order: Object.fromEntries(DIR_IDS.map((d) => [d, ORDER[dirGroup[d]]])),
  render_order_rules: [
    'Per-frame held_item_order === "back": draw held_item immediately after shadow/mount_rear (hand behind the body).',
    'When mounted: hide trainer shadow, draw mount shadow first; mount_rear before rider layers, mount_front after; align trainer seat_anchor to mount saddle_anchor.',
    'Layer pixels were already depth-masked against the shared base body, so order only resolves garment-vs-garment stacking.',
  ],
  presets: Object.fromEntries(Object.keys(PRESETS).map((p) => [p, { id: `trainer.preset.${p}`, shares_rig: true }])),
  skin_tones: SKIN_TONES,
  hairstyles: Object.fromEntries(Object.entries(HAIRSTYLES).map(([k, s]) => [k, { id: `trainer.hairstyle.${k}`, name: s.name, colors: HAIR_COLORS }])),
  outfits: Object.fromEntries(Object.entries(OUTFITS).map(([k, o]) => [k, { id: `trainer.outfit.${k}`, name: o.name, unisex: true, compatible_presets: Object.keys(PRESETS), pieces: { top: 'top', bottom: 'bottom', shoes: 'shoes', gloves: 'gloves', [o.slots.neck]: o.slots.neck } }])),
  variants: VARIANTS.map(({ key, folder, ...v }) => v),
  animations: Object.fromEntries(ANIMATIONS.map((a) => [a.id, { priority: a.priority, group: a.group, loop: a.loop, frame_count: a.poses ? a.poses.length : a.reuse.frames.length, durations_ms: a.durations, ...(a.reuse ? { reuse: a.reuse } : {}), ...(a.next ? { next: a.next } : {}), ...(a.mount_sync ? { mount_sync: a.mount_sync } : {}) }])),
  atlas_layout: { cell: CANVAS.w, width: AW, height: AH, frames, note: 'All trainer layer atlases share this layout: same cell = same direction/animation/frame.' },
  frame_data: frameData,
  planned_not_in_batch01: ['run', 'turn', 'interact', 'hurt', 'mount_enter', 'mount_exit', 'ride_run', 'ride_turn', 'swim_idle', 'swim_move', 'water_ride_idle', 'water_ride_move', 'fly_idle', 'fly_move', 'fly_takeoff', 'fly_landing', 'P2 life/emote set'],
};
write(OUT + 'assets/characters/trainer/metadata/trainer_batch01.json', JSON.stringify(trainerMeta, null, 1));
write(OUT + 'assets/characters/trainer/poses/pose_joints_batch01.json', JSON.stringify({ schema_version: 1, id: 'trainer.poses.batch01', note: 'Projected joint positions [x, y, depth] per animation/direction/frame in trainer canvas pixels. Use as drawing guides for hand-authored garment layers.', canvas: CANVAS, pivot: PIVOT, directions: DIR_IDS, joints: poseData }));

// ============================================================ Mount
const MC = 10;
const mStrips = []; for (const a of MOUNT_ANIMS) for (const d of DIR_IDS) mStrips.push({ anim: a.id, dir: d, n: a.n });
const mPack = packStrips(mStrips, MC);
const MW = MC * M_CANVAS.w, MH = mPack.rows * M_CANVAS.h;
const mFrames = {}; for (const pl of mPack.placements) (mFrames[pl.anim] ??= {})[pl.dir] = Array.from({ length: pl.n }, (_, i) => ({ x: (pl.col + i) * M_CANVAS.w, y: pl.row * M_CANVAS.h }));
const mBuf = { rear: new Uint8Array(MW * MH * 4), front: new Uint8Array(MW * MH * 4), shadow: new Uint8Array(MW * MH * 4) };
const mData = {};
for (const a of MOUNT_ANIMS) { mData[a.id] = {}; for (const d of DIRECTIONS) { mData[a.id][d.id] = []; for (let i = 0; i < a.n; i++) {
  const { layers, anchors } = renderMountFrame(a.id, i, d); const c = mFrames[a.id][d.id][i];
  for (const k of Object.keys(mBuf)) blit(mBuf[k], MW, layers[k], M_CANVAS.w, M_CANVAS.h, c.x, c.y);
  mData[a.id][d.id].push({ ...anchors, mount_direction: d.id, rider_scale: 1 });
} } }
const MID = 'kin.mount.ground.proto01';
const mFile = (k) => OUT + `assets/mounts/ground/kin_mount_ground_proto01_${k}.webp`;
for (const k of Object.keys(mBuf)) saveAtlas(mFile(k), MW, MH, mBuf[k]);
const mountMeta = {
  schema_version: 1, id: MID, working_name: 'Proto Strider (placeholder, original)', status: STATUS, generator: GENERATOR,
  mount_type: 'ground', canvas: { ...M_CANVAS }, pivot: { ...M_PIVOT }, directions: DIR_IDS, mirror_policy: { mode: 'native_all_8' },
  layers: { rear: { id: `${MID}.rear`, file: mFile('rear') }, front: { id: `${MID}.front`, file: mFile('front') }, shadow: { id: `${MID}.shadow`, file: mFile('shadow') } },
  occlusion: { front_occlusion_layer: 'front', rear_occlusion_layer: 'rear', rule: `pixels nearer than saddle depth + ${FRONT_DEPTH_MARGIN} px are in the front layer` },
  rider: { pose_set: 'neutral_ground', rider_anchor: 'trainer.frame_data.seat_anchor', overrides: {}, far_leg_rule: 'trainer ride frames omit the far leg in side/diagonal views (occluded by mount body)' },
  animations: Object.fromEntries(MOUNT_ANIMS.map((a) => [a.id, { frame_count: a.n, loop: a.loop, durations_ms: a.durations }])),
  animation_sync: { ride_idle: { mount_animation: 'idle', frame_map: [0, 1, 2, 3], timing: 'mount' }, ride_walk: { mount_animation: 'walk', frame_map: [0, 1, 2, 3, 4, 5], timing: 'mount' } },
  atlas_layout: { cell: M_CANVAS.w, width: MW, height: MH, frames: mFrames },
  frame_data: mData,
  anchor_fields: ['saddle_anchor', 'rider_offset', 'rider_scale', 'mount_direction', 'shadow_anchor', 'collision_bounds'],
};
write(OUT + 'assets/mounts/ground/kin_mount_ground_proto01.json', JSON.stringify(mountMeta, null, 1));

// ============================================================ Aevin
const aBuf = new Uint8Array(AEVIN.w * AEVIN.frames * AEVIN.h * 4);
for (let f = 0; f < AEVIN.frames; f++) blit(aBuf, AEVIN.w * AEVIN.frames, renderAevin(f), AEVIN.w, AEVIN.h, f * AEVIN.w, 0);
const aFile = OUT + 'assets/items/aevin/aevin_standard.webp';
saveAtlas(aFile, AEVIN.w * AEVIN.frames, AEVIN.h, aBuf);
const aevinMeta = { schema_version: 1, status: STATUS, generator: GENERATOR, items: { 'item.aevin.standard': { file: aFile, cell: { w: AEVIN.w, h: AEVIN.h }, pivot: AEVIN.pivot, pivot_meaning: 'grip point; place at trainer hand_item_anchor', frames: Array.from({ length: AEVIN.frames }, (_, i) => ({ x: i * AEVIN.w, y: 0 })), durations_ms: AEVIN.durations, loop: true, types_supported: Object.keys(AEVIN_TYPES) } } };
write(OUT + 'assets/items/aevin/aevin_items.json', JSON.stringify(aevinMeta, null, 1));

// ============================================================ Bond FX
const fxW = Math.max(...Object.values(FX).map((s) => s.w * s.frames));
let fy = 0; const fxLayout = {};
for (const [k, s] of Object.entries(FX)) { fxLayout[k] = { y: fy }; fy += s.h; }
const fxBuf = new Uint8Array(fxW * fy * 4);
const fxMeta = { schema_version: 1, status: STATUS, generator: GENERATOR, file: OUT + 'assets/effects/bond/bond_fx.webp', width: fxW, height: fy, effects: {} };
for (const [k, s] of Object.entries(FX)) {
  for (let f = 0; f < s.frames; f++) blit(fxBuf, fxW, renderFx(k, f), s.w, s.h, f * s.w, fxLayout[k].y);
  fxMeta.effects[`fx.bond.${k}`] = { cell: { w: s.w, h: s.h }, pivot: s.pivot, anchor: s.anchor, loop: s.loop, durations_ms: s.durations, frames: Array.from({ length: s.frames }, (_, f) => ({ x: f * s.w, y: fxLayout[k].y })) };
}
saveAtlas(fxMeta.file, fxW, fy, fxBuf);
fxMeta.bond_sequence = ['trainer:bond_prepare', 'trainer:bond_activate + fx.bond.resonance@hand_item_anchor + fx.bond.rune_ring@target', 'trainer:bond_success + fx.bond.success | trainer:bond_fail + fx.bond.fail'];
write(OUT + 'assets/effects/bond/bond_fx.json', JSON.stringify(fxMeta, null, 1));

// ============================================================ viewer bundle + converter manifest
write('tools/asset-pipeline/viewer/data.js', '// GENERATED by tools/asset-pipeline/build.mjs — do not edit. Lets the viewer run from file:// without a server.\nwindow.AEVORIA_ASSETS = ' + JSON.stringify({ trainer: trainerMeta, mount: mountMeta, aevin: aevinMeta, fx: fxMeta }) + ';\n');
write('build/asset-pipeline/convert_manifest.json', JSON.stringify(convert, null, 1));
console.log(`built ${convert.length} atlases in ${((Date.now() - t0) / 1000).toFixed(1)}s; trainer atlas ${AW}x${AH}, ${VARIANTS.length} trainer variants`);
