"""GATE 04 animation builder for the modular Trainer V3 layers.

idle: 4-frame breathing loop made WITHOUT redrawing: in every layer the pixels above the waist line move
      down 1 px on the inhale frames (classic pixel-art waist squash). The same transform is applied to all
      layers, so the modular layers stay aligned and any outfit combination animates identically.
      The waist line per direction comes from the label maps (top of the belt/accessories label).

Usage (repo root): python tools/asset-pipeline/animate.py idle | walk-label [--force] | walk-split
Outputs: assets/characters/trainer/anim_v3/idle/{gender}/{slot}.webp  (rows = directions S..SE, columns = frames)
         assets/characters/trainer/metadata/trainer_v3_anim_idle.json
         build/asset-pipeline/qa/gate04/idle_*.gif / idle_preview_4x.png
"""
import json
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
import separate_layers as SL  # noqa: E402

ROOT = SL.ROOT
CANVAS = SL.CANVAS
IDLE_SHIFT = [0, 1, 1, 0]
IDLE_MS = [260, 200, 260, 200]
OUT = 'assets/characters/trainer/anim_v3/idle'
META = 'assets/characters/trainer/metadata/trainer_v3_anim_idle.json'
QA = os.path.join(ROOT, 'build', 'asset-pipeline', 'qa', 'gate04')


def waist_y(g, d):
    lab = SL.read_labels(os.path.join(SL.LABEL_DIR, 'trainer_%s_%s_labels.png' % (g, d)))
    acc = SL.SLOT_INDEX['accessories']
    ys = [y for y in range(CANVAS[1]) for x in range(CANVAS[0]) if lab[y][x] == acc]
    if ys:
        return min(ys) + 1
    ys = [y for y in range(CANVAS[1]) for x in range(CANVAS[0]) if lab[y][x]]
    return int(min(ys) + 0.6 * (max(ys) - min(ys)))


def squash(layer, wy, shift):
    if not shift:
        return layer.copy()
    out = Image.new('RGBA', CANVAS)
    lower = layer.crop((0, wy, CANVAS[0], CANVAS[1]))
    upper = layer.crop((0, 0, CANVAS[0], wy))
    out.alpha_composite(lower, (0, wy))
    out.alpha_composite(upper, (0, shift))  # upper body drawn last: it overlaps the waist row
    return out


def layer_files(gname):
    d = os.path.join(ROOT, SL.OUT_LAYERS, gname)
    return sorted(f[:-5] for f in os.listdir(d) if f.endswith('.webp'))


def cmd_idle():
    os.makedirs(QA, exist_ok=True)
    meta = {'schema_version': 1, 'id': 'trainer.v3.anim.idle', 'task': 'ART-003-G04', 'status': 'pending_owner_review',
            'method': 'waist squash: pixels above the waist line move down 1 px on inhale frames, identical for all layers',
            'canvas': {'w': CANVAS[0], 'h': CANVAS[1]}, 'pivot': {'x': SL.PIVOT[0], 'y': SL.PIVOT[1]},
            'directions': SL.DIR_IDS, 'frame_count': 4, 'durations_ms': IDLE_MS, 'loop': True,
            'layout': 'row = direction (S,SW,W,NW,N,NE,E,SE), column = frame', 'waist_y': {}, 'variants': []}
    previews = []
    for g, gname in SL.GENDERS.items():
        slots = layer_files(gname)
        atl = {s: Image.new('RGBA', (CANVAS[0] * 4, CANVAS[1] * 8)) for s in slots}
        for i, d in enumerate(SL.DIRS):
            wy = waist_y(g, d)
            meta['waist_y']['%s_%s' % (gname, d)] = wy
            for s in slots:
                cell = SL.layer_cell(gname, s, i)
                for f, sh in enumerate(IDLE_SHIFT):
                    atl[s].alpha_composite(squash(cell, wy, sh), (f * CANVAS[0], i * CANVAS[1]))
        for s in slots:
            rel = '%s/%s/%s.webp' % (OUT, gname, s)
            os.makedirs(os.path.dirname(os.path.join(ROOT, rel)), exist_ok=True)
            atl[s].save(os.path.join(ROOT, rel), 'WEBP', lossless=True, quality=100, method=6, exact=True)
            meta['variants'].append({'id': 'trainer.v3.%s.%s.idle' % (gname, s), 'slot': s.replace('_full', ''), 'full': s.endswith('_full'),
                                     'presets': [gname], 'file': rel})
        # composite preview with the approved (non-full) layers in render order
        frames = []
        for f in range(4):
            row = Image.new('RGBA', (CANVAS[0] * 8, CANVAS[1]), (58, 74, 62, 255))
            for i, d in enumerate(SL.DIRS):
                for s in SL.RENDER_ORDER[SL.DIR_GROUP[d.upper()]]:
                    if s in atl:
                        row.alpha_composite(atl[s].crop((f * CANVAS[0], i * CANVAS[1], (f + 1) * CANVAS[0], (i + 1) * CANVAS[1])), (i * CANVAS[0], 0))
            frames.append(row)
        previews.append(frames)
        big = [fr.resize((fr.width * 3, fr.height * 3), Image.NEAREST).convert('RGB') for fr in frames]
        big[0].save(os.path.join(QA, 'idle_%s.gif' % gname), save_all=True, append_images=big[1:], duration=IDLE_MS, loop=0)
    sheet = Image.new('RGBA', (CANVAS[0] * 8, CANVAS[1] * 8), (58, 74, 62, 255))
    for gi, frames in enumerate(previews):
        for f, fr in enumerate(frames):
            sheet.alpha_composite(fr, (0, (gi * 4 + f) * CANVAS[1]))
    sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST).save(os.path.join(QA, 'idle_preview_2x.png'))
    json.dump(meta, open(os.path.join(ROOT, META), 'w'), indent=1)
    print('idle built: %d variants; previews in build/asset-pipeline/qa/gate04/' % len(meta['variants']))


# ------------------------------------------------------------------ walk: labels + split
WALK_SRC = os.path.join(ROOT, 'assets', 'characters', 'trainer', 'anim_src', 'walk')
WALK_LABELS = os.path.join(SL.LABEL_DIR, 'walk')
WALK_OUT = 'assets/characters/trainer/anim_v3/walk'
WALK_META = 'assets/characters/trainer/metadata/trainer_v3_anim_walk.json'
WALK_MS = [130, 100, 110, 130, 100, 110]


def propagate(frame, ref_sprite, ref_lab, radius=8):
    """First-pass labels for a walk frame: each pixel takes the label of the nearest same-colour pixel in f0
    (most parts only move); the rest take the dominant label of their labelled neighbours."""
    fp, rp = frame.load(), ref_sprite.load()
    by_colour = {}
    for y in range(CANVAS[1]):
        for x in range(CANVAS[0]):
            c = rp[x, y]
            if c[3]:
                by_colour.setdefault(c, []).append((x, y))
    lab = [[0] * CANVAS[0] for _ in range(CANVAS[1])]
    todo = []
    for y in range(CANVAS[1]):
        for x in range(CANVAS[0]):
            c = fp[x, y]
            if not c[3]:
                continue
            best, bd = None, radius * radius + 1
            for (u, v) in by_colour.get(c, ()):
                dd = (u - x) ** 2 + (v - y) ** 2
                if dd < bd:
                    best, bd = (u, v), dd
            if best:
                lab[y][x] = ref_lab[best[1]][best[0]]
            else:
                todo.append((x, y))
    for _ in range(12):
        left = []
        for (x, y) in todo:
            cnt = {}
            for yy in range(y - 1, y + 2):
                for xx in range(x - 1, x + 2):
                    if 0 <= xx < CANVAS[0] and 0 <= yy < CANVAS[1] and lab[yy][xx]:
                        cnt[lab[yy][xx]] = cnt.get(lab[yy][xx], 0) + 1
            if cnt:
                lab[y][x] = max(cnt, key=cnt.get)
            else:
                left.append((x, y))
        todo = left
        if not todo:
            break
    for (x, y) in todo:
        lab[y][x] = SL.SLOT_INDEX['base_body']
    return lab


def cmd_walk_label(force):
    n = 0
    for g, gname in SL.GENDERS.items():
        for d in SL.DIRS:
            ref = Image.open(os.path.join(SL.SRC, 'trainer_%s_%s_64x96.png' % (g, d))).convert('RGBA')
            ref_lab = SL.read_labels(os.path.join(SL.LABEL_DIR, 'trainer_%s_%s_labels.png' % (g, d)))
            for f in range(6):
                out = os.path.join(WALK_LABELS, gname, '%s_f%d_labels.png' % (d, f))
                if os.path.exists(out) and not force:
                    continue
                os.makedirs(os.path.dirname(out), exist_ok=True)
                frame = Image.open(os.path.join(WALK_SRC, gname, '%s_f%d.png' % (d, f))).convert('RGBA')
                lab = ref_lab if f == 0 else propagate(frame, ref, ref_lab)
                SL.palette_image(lab).save(out, transparency=0)
                n += 1
    print('walk label maps written:', n)


def cmd_walk_split():
    os.makedirs(QA, exist_ok=True)
    slots = [s for s, _ in SL.LABELS if s]
    meta = {'schema_version': 1, 'id': 'trainer.v3.anim.walk', 'task': 'ART-003-G04', 'status': 'visible_pixel_layers_pending_review',
            'canvas': {'w': CANVAS[0], 'h': CANVAS[1]}, 'pivot': {'x': SL.PIVOT[0], 'y': SL.PIVOT[1]}, 'directions': SL.DIR_IDS,
            'frame_count': 6, 'durations_ms': WALK_MS, 'loop': True,
            'render_order': {d: SL.RENDER_ORDER[SL.DIR_GROUP[d]] for d in SL.DIR_IDS},
            'layout': 'row = direction (S,SW,W,NW,N,NE,E,SE), column = frame', 'variants': []}
    exact = {}
    for g, gname in SL.GENDERS.items():
        atl = {s: Image.new('RGBA', (CANVAS[0] * 6, CANVAS[1] * 8)) for s in slots}
        over = Image.new('RGBA', (CANVAS[0] * 12, CANVAS[1] * 8), (40, 40, 48, 255))
        for i, d in enumerate(SL.DIRS):
            order = SL.RENDER_ORDER[SL.DIR_GROUP[d.upper()]]
            for f in range(6):
                spr = Image.open(os.path.join(WALK_SRC, gname, '%s_f%d.png' % (d, f))).convert('RGBA')
                lab = SL.read_labels(os.path.join(WALK_LABELS, gname, '%s_f%d_labels.png' % (d, f)))
                sp = spr.load()
                layers = {s: Image.new('RGBA', CANVAS) for s in slots}
                missing = 0
                for y in range(CANVAS[1]):
                    for x in range(CANVAS[0]):
                        c = sp[x, y]
                        if not c[3]:
                            continue
                        k = lab[y][x]
                        if not k:
                            missing += 1
                            k = SL.SLOT_INDEX['base_body']
                        layers[SL.LABELS[k][0]].putpixel((x, y), c)
                comp = Image.new('RGBA', CANVAS)
                for s in order:
                    if s in layers:
                        comp.alpha_composite(layers[s])
                exact['%s_%s_f%d' % (gname, d, f)] = comp.tobytes() == spr.tobytes() and missing == 0
                for s in slots:
                    atl[s].alpha_composite(layers[s], (f * CANVAS[0], i * CANVAS[1]))
                dbg = SL.palette_image(lab).convert('RGBA')
                dbg.putalpha(spr.getchannel('A'))
                over.alpha_composite(spr, (f * 2 * CANVAS[0], i * CANVAS[1]))
                over.alpha_composite(dbg, ((f * 2 + 1) * CANVAS[0], i * CANVAS[1]))
        for s in slots:
            if not any(atl[s].getchannel('A').getdata()):
                continue
            rel = '%s/%s/%s.webp' % (WALK_OUT, gname, s)
            os.makedirs(os.path.dirname(os.path.join(ROOT, rel)), exist_ok=True)
            atl[s].save(os.path.join(ROOT, rel), 'WEBP', lossless=True, quality=100, method=6, exact=True)
            ok = Image.open(os.path.join(ROOT, rel)).convert('RGBA').tobytes() == atl[s].tobytes()
            meta['variants'].append({'id': 'trainer.v3.%s.%s.walk' % (gname, s), 'slot': s, 'presets': [gname],
                                     'file': rel, 'lossless_roundtrip_exact': ok})
        over.save(os.path.join(QA, 'walk_labels_%s.png' % gname))
    json.dump(meta, open(os.path.join(ROOT, WALK_META), 'w'), indent=1)
    n = sum(exact.values())
    print('walk split: pixel-exact %d/%d; variants %d; overlays build/asset-pipeline/qa/gate04/walk_labels_*.png'
          % (n, len(exact), len(meta['variants'])))
    sys.exit(0 if n == len(exact) and all(v['lossless_roundtrip_exact'] for v in meta['variants']) else 1)


if __name__ == '__main__':
    cmds = {'idle': cmd_idle, 'walk-label': lambda: cmd_walk_label('--force' in sys.argv), 'walk-split': cmd_walk_split}
    if len(sys.argv) < 2 or sys.argv[1] not in cmds:
        sys.exit(__doc__)
    cmds[sys.argv[1]]()
