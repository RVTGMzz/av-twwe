"""Carve the space between the legs back to transparency (owner report 2026-11-26: "there is still a block of
colour between the two legs").

When the sprites were cut from the concept board, the background enclosed between the legs could not be reached
by the flood fill and stayed as filled pixels; later clean-ups only darkened it. This tool grows transparency
from the outside background into DARK pixels of the leg zone (value < DARK) that do not touch a lighter leg pixel
(value >= LIGHT) and have leg pixels on BOTH sides of the row (so outer outlines are never touched); the 1 px
outline of each leg/boot is kept.

Usage (repo root):
  python tools/asset-pipeline/carve_gaps.py                 # dry run: report + before/after sheets
  python tools/asset-pipeline/carve_gaps.py --apply         # carve sprites + walk frames, update labels and full_src
Scope: male approved sprites and male walk frames by default; add --female to include her (check her socks!).
After --apply run: separate_layers.py split, verify-full, animate.py idle, walk-split, and the QA checks.
"""
import colorsys
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
import separate_layers as SL  # noqa: E402

ROOT = SL.ROOT
DARK, LIGHT, Y0, SPAN = 0.24, 0.30, 70, 7


def val(c):
    return colorsys.rgb_to_hsv(*(k / 255 for k in c[:3]))[2]


def carve_mask(im):
    w, h = im.size
    px = im.load()
    cand = set()
    for y in range(Y0, h):
        for x in range(w):
            c = px[x, y]
            if not c[3] or val(c) >= DARK:
                continue
            touches_light = any(0 <= x + dx < w and 0 <= y + dy < h and px[x + dx, y + dy][3] and val(px[x + dx, y + dy]) >= LIGHT
                                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            # only the space BETWEEN legs: lighter leg pixels must exist on both sides of the row within SPAN
            left = any(px[xx, y][3] and val(px[xx, y]) >= LIGHT for xx in range(max(0, x - SPAN), x))
            right = any(px[xx, y][3] and val(px[xx, y]) >= LIGHT for xx in range(x + 1, min(w, x + SPAN + 1)))
            if not touches_light and left and right:
                cand.add((x, y))
    carved = set()
    frontier = [p for p in cand if any(not (0 <= p[0] + dx < w and 0 <= p[1] + dy < h) or px[p[0] + dx, p[1] + dy][3] == 0
                                       for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    while frontier:
        p = frontier.pop()
        if p in carved:
            continue
        carved.add(p)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            q = (p[0] + dx, p[1] + dy)
            if q in cand and q not in carved:
                frontier.append(q)
    # pixels left floating by the carve (no 4-neighbour) are removed too
    for y in range(Y0, h):
        for x in range(w):
            if px[x, y][3] and (x, y) not in carved and not any(
                    0 <= x + dx < w and 0 <= y + dy < h and px[x + dx, y + dy][3] and (x + dx, y + dy) not in carved
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                carved.add((x, y))
    return carved


def apply_mask(path, mask):
    im = Image.open(path).convert('RGBA')
    for p in mask:
        im.putpixel(p, (0, 0, 0, 0))
    im.save(path)


def clear_labels(path, mask):
    lab = Image.open(path)
    for p in mask:
        lab.putpixel(p, 0)
    lab.save(path, transparency=0)


def main(args):
    apply, female = '--apply' in args, '--female' in args
    genders = [('m', 'male')] + ([('f', 'female')] if female else [])
    qa = os.path.join(ROOT, 'build', 'asset-pipeline', 'qa', 'carve')
    os.makedirs(qa, exist_ok=True)
    walk = os.path.join(ROOT, 'assets', 'characters', 'trainer', 'anim_src', 'walk')
    total = 0
    for g, gname in genders:
        for d in SL.DIRS:
            sprite = os.path.join(SL.SRC, 'trainer_%s_%s_64x96.png' % (g, d))
            frames = [os.path.join(walk, gname, '%s_f%d.png' % (d, f)) for f in range(6)]
            sheet = Image.new('RGBA', (64 * 7, 96 * 2), (20, 22, 28, 255))
            masks = []
            for col, path in enumerate([sprite] + frames):
                im = Image.open(path).convert('RGBA')
                m = carve_mask(im)
                masks.append(m)
                after = im.copy()
                for p in m:
                    after.putpixel(p, (0, 0, 0, 0))
                sheet.alpha_composite(im, (col * 64, 0))
                sheet.alpha_composite(after, (col * 64, 96))
            sheet.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST).save(os.path.join(qa, '%s_%s.png' % (gname, d)))
            # sprite and walk f0 must stay identical: use one mask for both
            if masks[0] != masks[1]:
                masks[1] = masks[0]
            n = sum(len(m) for m in masks)
            total += n
            print('%-6s %-2s carve px: sprite %d, walk %s' % (gname, d, len(masks[0]), [len(m) for m in masks[1:]]))
            if not apply or not n:
                continue
            apply_mask(sprite, masks[0])
            clear_labels(os.path.join(SL.LABEL_DIR, 'trainer_%s_%s_labels.png' % (g, d)), masks[0])
            for slot in SL.FULL_SLOTS:  # nothing may remain behind a carved hole
                src = os.path.join(SL.FULL_SRC, gname, '%s_%s.png' % (slot, d))
                if os.path.exists(src):
                    apply_mask(src, masks[0])
            for f, path in enumerate(frames):
                apply_mask(path, masks[f + 1])
                clear_labels(os.path.join(SL.LABEL_DIR, 'walk', gname, '%s_f%d_labels.png' % (d, f)), masks[f + 1])
    print('total carved px', total, '(applied)' if apply else '(dry run) sheets: build/asset-pipeline/qa/carve/')


if __name__ == '__main__':
    main(sys.argv[1:])
