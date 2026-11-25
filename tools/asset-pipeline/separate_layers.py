"""GATE 03 modular separation for the approved Trainer V3 direction sprites.

Workflow (image processing only, the approved pixels are never redrawn):
  1. label  — write a first-pass LABEL MAP per sprite (indexed PNG, one palette colour per layer).
              Label maps are the editable source of truth: fix them in any pixel editor
              (Aseprite, LibreSprite, Photoshop indexed mode) by repainting label colours only.
  2. split  — cut each approved sprite into per-layer sprites using its label map, pack per-layer
              atlases (8 directions), write metadata, and prove that recombining the layers in render
              order reproduces the approved sprite pixel-for-pixel.

Usage (repo root):
  python tools/asset-pipeline/separate_layers.py label [--force]   # only creates missing label maps
  python tools/asset-pipeline/separate_layers.py split

Limitation: a flat sprite has no pixels hidden behind clothes, hair or gear. Layers produced here are
VISIBLE-PIXEL layers: they recombine exactly, but swapping one garment for another needs the covered
areas (body under clothes, back hair under the head, etc.) painted in by an artist (see ART-003-G03).
"""
import colorsys
import json
import os
import sys
from collections import Counter

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'assets', 'concepts', 'trainer-gate02')
LABEL_DIR = os.path.join(ROOT, 'assets', 'characters', 'trainer', 'labels')
OUT_LAYERS = 'assets/characters/trainer/layers_v3'
META = 'assets/characters/trainer/metadata/trainer_v3_layers.json'
QA_DIR = os.path.join(ROOT, 'build', 'asset-pipeline', 'qa', 'gate03')
DIRS = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se']
DIR_IDS = [d.upper() for d in DIRS]
GENDERS = {'m': 'male', 'f': 'female'}
CANVAS = (64, 96)
PIVOT = (32, 94)

# label index -> (slot id, debug colour). Index 0 = transparent. Order of this table is NOT render order.
LABELS = [
    (None, (0, 0, 0)),
    ('base_body', (255, 170, 120)),      # visible skin
    ('face', (255, 0, 120)),             # eyes, brows, mouth, blush
    ('hair', (150, 90, 255)),            # hair mass incl. ponytail
    ('hair_ribbon', (0, 210, 255)),      # female blue bow
    ('headwear', (255, 230, 0)),         # aviator goggles + strap
    ('scarf', (255, 40, 40)),
    ('top', (240, 240, 240)),            # shirt / jacket / tunic incl. sleeves
    ('bottom', (40, 90, 255)),           # shorts / skirt / socks
    ('gloves', (120, 60, 20)),
    ('accessories', (255, 140, 0)),      # belt, pouches, straps
    ('backpack', (0, 160, 80)),
    ('shoes', (90, 50, 30)),
]
SLOT_INDEX = {s: i for i, (s, _) in enumerate(LABELS) if s}
RENDER_ORDER = {
    'front': ['shadow', 'backpack', 'hair_back', 'base_body', 'face', 'bottom', 'shoes', 'top', 'gloves', 'accessories', 'scarf', 'hair', 'hair_ribbon', 'headwear', 'held_item', 'effects'],
    'back': ['shadow', 'base_body', 'face', 'bottom', 'shoes', 'top', 'gloves', 'accessories', 'scarf', 'backpack', 'hair', 'hair_ribbon', 'headwear', 'held_item', 'effects'],
}
DIR_GROUP = {'S': 'front', 'SW': 'front', 'SE': 'front', 'W': 'front', 'E': 'front', 'NW': 'back', 'N': 'back', 'NE': 'back'}


def palette_image(labels_2d):
    im = Image.new('P', CANVAS)
    pal = []
    for _, c in LABELS:
        pal += list(c)
    im.putpalette(pal + [0] * (768 - len(pal)))
    im.putdata([v for row in labels_2d for v in row])
    im.info['transparency'] = 0
    return im


# ------------------------------------------------------------------ first-pass auto labelling
def classify(c, t, g, xrel):
    """Heuristic material class for one opaque pixel. t = 0 top of figure .. 1 feet; xrel = -1..1 across body."""
    r, gg, b = c
    h, s, v = colorsys.rgb_to_hsv(r / 255, gg / 255, b / 255)
    if v < 0.28:
        return 'dark'
    blue = b > r + 10 and b >= gg - 5
    light = v > 0.78 and not blue                      # skin, cream cloth, light hair
    silver = s < 0.16 and v >= 0.45 and not blue        # female hair, goggle lens
    brown = r >= gg >= b and v < 0.78 and s > 0.25
    red = r > gg + 45 and r > b + 40 and h < 0.04 and s > 0.45
    if t < 0.34:  # head: hair, goggles, bow, face skin
        if g == 'f' and blue and t < 0.25:
            return 'hair_ribbon' if s > 0.3 else 'headwear'
        if light and s > 0.18 and t > 0.10 and abs(xrel) < 0.55:
            return 'base_body'
        if g == 'f' and (silver or (light and s <= 0.18)):
            return 'hair'
        if t < 0.18 and (silver or (s > 0.35 and h > 0.07 and v > 0.55)):
            return 'headwear'
        return 'hair'
    if t < 0.45:  # neck / shoulders
        if (g == 'm' and red) or (g == 'f' and blue):
            return 'scarf'
        if g == 'f' and silver and abs(xrel) > 0.3:
            return 'hair'
        if g == 'm' and abs(xrel) > 0.72:
            return 'backpack'
        if brown and v < 0.55:
            return 'accessories'
        return 'top'
    if t < 0.70:  # torso, belt, hands
        if g == 'f' and silver and t < 0.6:
            return 'hair'
        if brown and v < 0.62:
            return 'gloves' if abs(xrel) > 0.6 else 'accessories'
        if (blue or silver) and t > 0.6:
            return 'bottom'
        return 'top'
    if t < 0.82:  # legs
        if light and s > 0.18:
            return 'base_body'
        if brown and t > 0.77:
            return 'shoes'
        return 'bottom'
    return 'shoes'


def auto_label(sprite, g):
    px = sprite.load()
    bb = sprite.getchannel('A').getbbox()
    top, bot = bb[1], bb[3]
    cx = (bb[0] + bb[2]) / 2
    half = max(1, (bb[2] - bb[0]) / 2)
    lab = [[0] * CANVAS[0] for _ in range(CANVAS[1])]
    names = [[None] * CANVAS[0] for _ in range(CANVAS[1])]
    for y in range(CANVAS[1]):
        for x in range(CANVAS[0]):
            c = px[x, y]
            if c[3]:
                names[y][x] = classify(c[:3], (y - top) / (bot - top), g, (x - cx) / half)
    # face: dark or blue/pink pixels enclosed by skin in the head zone
    for y in range(CANVAS[1]):
        for x in range(CANVAS[0]):
            n = names[y][x]
            if n in ('dark', 'hair', 'headwear', 'hair_ribbon', 'scarf') and (y - top) / (bot - top) < 0.36:
                neigh = [names[yy][xx] for yy in range(y - 2, y + 3) for xx in range(x - 2, x + 3)
                         if 0 <= xx < CANVAS[0] and 0 <= yy < CANVAS[1]]
                if neigh.count('base_body') >= 9 and n != 'hair_ribbon':
                    names[y][x] = 'face'
    # resolve dark outline pixels to the dominant neighbouring material
    for _ in range(4):
        changed = False
        for y in range(CANVAS[1]):
            for x in range(CANVAS[0]):
                if names[y][x] != 'dark':
                    continue
                cnt = Counter(names[yy][xx] for yy in range(y - 1, y + 2) for xx in range(x - 1, x + 2)
                              if 0 <= xx < CANVAS[0] and 0 <= yy < CANVAS[1] and names[yy][xx] not in (None, 'dark'))
                if cnt:
                    names[y][x] = cnt.most_common(1)[0][0]
                    changed = True
        if not changed:
            break
    for y in range(CANVAS[1]):
        for x in range(CANVAS[0]):
            n = names[y][x]
            if n:
                lab[y][x] = SLOT_INDEX.get('base_body' if n == 'dark' else n)
    return lab


# ------------------------------------------------------------------ split + verify
def read_labels(path):
    im = Image.open(path)
    if im.mode != 'P':
        sys.exit('label map must be an indexed (P mode) PNG: ' + path)
    return [list(im.getdata())[y * CANVAS[0]:(y + 1) * CANVAS[0]] for y in range(CANVAS[1])]


def cmd_label(force):
    os.makedirs(LABEL_DIR, exist_ok=True)
    for g in GENDERS:
        for d in DIRS:
            out = os.path.join(LABEL_DIR, 'trainer_%s_%s_labels.png' % (g, d))
            if os.path.exists(out) and not force:
                print('keep (edited source):', os.path.relpath(out, ROOT))
                continue
            spr = Image.open(os.path.join(SRC, 'trainer_%s_%s_64x96.png' % (g, d))).convert('RGBA')
            palette_image(auto_label(spr, g)).save(out, transparency=0)
            print('auto-labelled:', os.path.relpath(out, ROOT))


def cmd_split():
    import subprocess
    os.makedirs(QA_DIR, exist_ok=True)
    slots = [s for s, _ in LABELS if s]
    meta = {'schema_version': 1, 'id': 'trainer.v3.layers', 'task': 'ART-003-G03', 'status': 'visible_pixel_layers_pending_review',
            'source_sprites': 'assets/concepts/trainer-gate02 (owner approved D019)', 'canvas': {'w': CANVAS[0], 'h': CANVAS[1]},
            'pivot': {'x': PIVOT[0], 'y': PIVOT[1], 'meaning': 'feet ground contact'}, 'directions': DIR_IDS,
            'mirror_policy': {'mode': 'native_all_8', 'mirror_safe': False},
            'animation': 'idle frame 0 only (GATE 04 adds animations)', 'slots': slots,
            'render_order': {d: RENDER_ORDER[DIR_GROUP[d]] for d in DIR_IDS},
            'label_maps': 'assets/characters/trainer/labels/trainer_{g}_{dir}_labels.png',
            'limitation': 'Visible-pixel layers: exact recombination, but covered areas are empty until painted (ART-003-G03).',
            'variants': [], 'frames': {d: {'x': i * CANVAS[0], 'y': 0} for i, d in enumerate(DIR_IDS)}}
    report = {'pixel_exact': {}, 'layer_pixels': {}}
    overlay_rows = []
    for g, gname in GENDERS.items():
        atl = {s: Image.new('RGBA', (CANVAS[0] * 8, CANVAS[1])) for s in slots}
        over = Image.new('RGBA', (CANVAS[0] * 16, CANVAS[1]), (40, 40, 48, 255))
        for i, d in enumerate(DIRS):
            spr = Image.open(os.path.join(SRC, 'trainer_%s_%s_64x96.png' % (g, d))).convert('RGBA')
            lab = read_labels(os.path.join(LABEL_DIR, 'trainer_%s_%s_labels.png' % (g, d)))
            sp = spr.load()
            layers = {s: Image.new('RGBA', CANVAS) for s in slots}
            unlabelled = 0
            for y in range(CANVAS[1]):
                for x in range(CANVAS[0]):
                    c = sp[x, y]
                    if not c[3]:
                        continue
                    k = lab[y][x]
                    if k == 0 or k >= len(LABELS):
                        unlabelled += 1
                        k = SLOT_INDEX['base_body']
                    layers[LABELS[k][0]].putpixel((x, y), c)
            # recombine in render order -> must equal the approved sprite exactly
            comp = Image.new('RGBA', CANVAS)
            for s in RENDER_ORDER[DIR_GROUP[d.upper()]]:
                if s in layers:
                    comp.alpha_composite(layers[s])
            exact = comp.tobytes() == spr.tobytes() and unlabelled == 0
            report['pixel_exact']['%s_%s' % (g, d)] = exact
            report['layer_pixels']['%s_%s' % (g, d)] = {s: sum(1 for a in layers[s].getchannel('A').getdata() if a) for s in slots}
            for s in slots:
                atl[s].alpha_composite(layers[s], (i * CANVAS[0], 0))
            dbg = palette_image(lab).convert('RGBA')
            dbg.putalpha(spr.getchannel('A'))
            over.alpha_composite(spr, (i * 128, 0))
            over.alpha_composite(dbg, (i * 128 + 64, 0))
        overlay_rows.append(over)
        for s in slots:
            if not any(atl[s].getchannel('A').getdata()):
                continue
            rel = '%s/%s/trainer_v3_%s_%s.png' % (OUT_LAYERS, gname, gname, s)
            png = os.path.join(ROOT, 'build', 'asset-pipeline', 'png', rel)
            os.makedirs(os.path.dirname(png), exist_ok=True)
            atl[s].save(png)
            webp = os.path.join(ROOT, rel.replace('.png', '.webp'))
            os.makedirs(os.path.dirname(webp), exist_ok=True)
            atl[s].save(webp, 'WEBP', lossless=True, quality=100, method=6, exact=True)
            back = Image.open(webp).convert('RGBA')
            ok = back.tobytes() == atl[s].tobytes()
            meta['variants'].append({'id': 'trainer.v3.%s.%s' % (gname, s), 'slot': s, 'presets': [gname], 'file': rel.replace('.png', '.webp'),
                                     'lossless_roundtrip_exact': ok, 'bytes': os.path.getsize(webp)})
    os.makedirs(os.path.dirname(os.path.join(ROOT, META)), exist_ok=True)
    json.dump(meta, open(os.path.join(ROOT, META), 'w'), indent=1)
    sheet = Image.new('RGBA', (CANVAS[0] * 16, CANVAS[1] * 2))
    for r, row in enumerate(overlay_rows):
        sheet.alpha_composite(row, (0, r * CANVAS[1]))
    sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save(os.path.join(QA_DIR, 'labels_overlay_3x.png'))
    json.dump(report, open(os.path.join(QA_DIR, 'split_report.json'), 'w'), indent=1)
    n_ok = sum(report['pixel_exact'].values())
    print('pixel-exact recombination: %d/16; variants: %d; overlay: build/asset-pipeline/qa/gate03/labels_overlay_3x.png' % (n_ok, len(meta['variants'])))
    sys.exit(0 if n_ok == 16 and all(v['lossless_roundtrip_exact'] for v in meta['variants']) else 1)


if __name__ == '__main__':
    if len(sys.argv) < 2 or sys.argv[1] not in ('label', 'split'):
        sys.exit(__doc__)
    cmd_label('--force' in sys.argv) if sys.argv[1] == 'label' else cmd_split()
