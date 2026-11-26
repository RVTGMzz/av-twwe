"""GATE 04 animation builder for the modular Trainer V3 layers.

idle: 4-frame breathing loop made WITHOUT redrawing: in every layer the pixels above the waist line move
      down 1 px on the inhale frames (classic pixel-art waist squash). The same transform is applied to all
      layers, so the modular layers stay aligned and any outfit combination animates identically.
      The waist line per direction comes from the label maps (top of the belt/accessories label).

Usage (repo root): python tools/asset-pipeline/animate.py idle
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


if __name__ == '__main__':
    if len(sys.argv) < 2 or sys.argv[1] != 'idle':
        sys.exit(__doc__)
    cmd_idle()
