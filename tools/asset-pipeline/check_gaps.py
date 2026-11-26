"""Gap-speck check (owner report 2026-11-26: a white line still visible between the male SE boots).

Light, desaturated pixels trapped in dark gaps of the leg/boot area (labels shoes, bottom, base_body,
y >= 55): saturation <= 0.30, value >= 0.50 and at least 6 of 8 neighbours transparent or much darker.
They are usually remnants of the concept-board background between the legs and read as white specks
in game. Real highlights can match, so every candidate must be reviewed.

Usage (repo root): python tools/asset-pipeline/check_gaps.py
Scans the approved direction sprites and all walk frames, writes marked sheets on a dark background to
build/asset-pipeline/qa/gaps/ and prints the candidates. Exit 1 if any exist.
"""
import colorsys
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
import separate_layers as SL  # noqa: E402

ROOT = SL.ROOT
LEG = {SL.SLOT_INDEX[k] for k in ('shoes', 'bottom', 'base_body')}


def sv(c):
    _, s, v = colorsys.rgb_to_hsv(*(k / 255 for k in c[:3]))
    return s, v


def find(im, lab):
    px = im.load()
    out = []
    for y in range(55, SL.CANVAS[1]):
        for x in range(SL.CANVAS[0]):
            c = px[x, y]
            if not c[3] or lab.getpixel((x, y)) not in LEG:
                continue
            s, v = sv(c)
            if s > 0.30 or v < 0.50:
                continue
            nb = [px[x + dx, y + dy] for dx in (-1, 0, 1) for dy in (-1, 0, 1)
                  if (dx or dy) and 0 <= x + dx < SL.CANVAS[0] and 0 <= y + dy < SL.CANVAS[1]]
            if sum(1 for q in nb if q[3] == 0 or sv(q)[1] < v - 0.22) >= 6:
                out.append((x, y))
    return out


def items():
    for g, gname in SL.GENDERS.items():
        for d in SL.DIRS:
            yield ('sprite', gname, d, None, os.path.join(SL.SRC, 'trainer_%s_%s_64x96.png' % (g, d)),
                   os.path.join(SL.LABEL_DIR, 'trainer_%s_%s_labels.png' % (g, d)))
            for f in range(6):
                yield ('walk', gname, d, f, os.path.join(ROOT, 'assets', 'characters', 'trainer', 'anim_src', 'walk', gname, '%s_f%d.png' % (d, f)),
                       os.path.join(SL.LABEL_DIR, 'walk', gname, '%s_f%d_labels.png' % (d, f)))


def main():
    out_dir = os.path.join(ROOT, 'build', 'asset-pipeline', 'qa', 'gaps')
    os.makedirs(out_dir, exist_ok=True)
    total = 0
    sheets = {}
    for kind, gname, d, f, sp, lp in items():
        if not (os.path.exists(sp) and os.path.exists(lp)):
            continue
        im = Image.open(sp).convert('RGBA')
        hits = find(im, Image.open(lp))
        total += len(hits)
        if hits:
            print(kind, gname, d, '' if f is None else 'f%d' % f, hits)
        key = (gname, d)
        sheet = sheets.setdefault(key, Image.new('RGBA', (64 * 7, 96 * 2), (20, 22, 28, 255)))
        col = 0 if f is None else f + 1
        sheet.alpha_composite(im, (col * 64, 0))
        sheet.alpha_composite(im, (col * 64, 96))
        for (x, y) in hits:
            sheet.putpixel((col * 64 + x, 96 + y), (255, 0, 255, 255))
    for (gname, d), sheet in sheets.items():
        sheet.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST).save(os.path.join(out_dir, '%s_%s.png' % (gname, d)))
    print('total candidates', total, '| sheets: build/asset-pipeline/qa/gaps/<gender>_<dir>.png (col 0 = approved sprite, cols 1-6 = walk f0-f5)')
    sys.exit(1 if total else 0)


if __name__ == '__main__':
    main()
