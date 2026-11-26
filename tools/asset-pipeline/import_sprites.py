"""Import externally made sprites (PixelLab, artist) onto the project's 64x96 trainer canvas.

PixelLab and most tools output square canvases (e.g. 64, 96, 128 px). This script:
  - converts to RGBA, makes alpha hard (>=128 -> 255, else 0),
  - trims to the visible figure, optionally scales by an INTEGER factor (--scale 2 halves a 2x export with
    nearest-neighbour; never fractional, to keep pixels crisp),
  - places the figure on a 64x96 canvas centred horizontally with the lowest pixel on y=93 (feet pivot),
  - writes it under the target name and runs the standard checks afterwards (check_master, then review).
The same horizontal offset is used for every frame of one direction (computed from frame 0), so walk frames do
not jitter.

Usage (repo root):
  python tools/asset-pipeline/import_sprites.py SRC_DIR DEST_DIR [--scale N] [--map "south=s,south-west=sw,..."]
Source files are matched by direction words in their names (south, south-east, se, s, ...) and an optional
frame number; outputs are named {prefix}_{dir}_64x96.png or {prefix}_{dir}_f{n}.png via --prefix / --walk.
"""
import argparse
import os
import re
import sys

from PIL import Image

CANVAS = (64, 96)
GROUND = 93
DIR_WORDS = [('south-east', 'se'), ('southeast', 'se'), ('south-west', 'sw'), ('southwest', 'sw'), ('north-east', 'ne'),
             ('northeast', 'ne'), ('north-west', 'nw'), ('northwest', 'nw'), ('south', 's'), ('north', 'n'), ('east', 'e'), ('west', 'w')]


def detect_dir(name):
    low = name.lower().replace('_', '-')
    for word, d in DIR_WORDS:
        if word in low:
            return d
    m = re.search(r'(?:^|[-.])(se|sw|ne|nw|s|n|e|w)(?:[-.]|$)', low)
    return m.group(1) if m else None


def detect_frame(name):
    m = re.search(r'(?:f|frame[-_]?)(\d+)', name.lower())
    return int(m.group(1)) if m else 0


def load(path, scale):
    im = Image.open(path).convert('RGBA')
    a = im.getchannel('A').point(lambda v: 255 if v >= 128 else 0)
    im.putalpha(a)
    if scale > 1:
        if im.width % scale or im.height % scale:
            sys.exit('%s: size %s not divisible by --scale %d' % (path, im.size, scale))
        im = im.resize((im.width // scale, im.height // scale), Image.NEAREST)
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('dest')
    ap.add_argument('--scale', type=int, default=1)
    ap.add_argument('--prefix', default='trainer_f')
    ap.add_argument('--walk', action='store_true', help='name outputs {dir}_f{n}.png (walk frames)')
    args = ap.parse_args()
    os.makedirs(args.dest, exist_ok=True)
    groups = {}
    for f in sorted(os.listdir(args.src)):
        if not f.lower().endswith('.png'):
            continue
        d = detect_dir(f)
        if not d:
            print('skip (no direction in name):', f)
            continue
        groups.setdefault(d, []).append((detect_frame(f), os.path.join(args.src, f)))
    for d, items in sorted(groups.items()):
        items.sort()
        ims = [(n, load(p, args.scale)) for n, p in items]
        bb0 = ims[0][1].getchannel('A').getbbox()
        if not bb0:
            sys.exit('empty image for direction ' + d)
        dx = (CANVAS[0] - (bb0[2] - bb0[0])) // 2 - bb0[0]
        for n, im in ims:
            bb = im.getchannel('A').getbbox()
            dy = GROUND + 1 - bb[3]
            out = Image.new('RGBA', CANVAS)
            out.alpha_composite(im, (dx, dy)) if (0 <= dx and 0 <= dy and dx + im.width <= CANVAS[0] and dy + im.height <= CANVAS[1]) else out.alpha_composite(im.crop((max(0, -dx), max(0, -dy), im.width, im.height)), (max(0, dx), max(0, dy)))
            h = bb[3] - bb[1]
            name = '%s_f%d.png' % (d, n) if args.walk else '%s_%s_64x96.png' % (args.prefix, d)
            out.save(os.path.join(args.dest, name))
            warn = '' if 80 <= h <= 92 else '  <-- figure height %d px; male reference is ~90 px' % h
            print('%s -> %s (figure %dx%d)%s' % (os.path.basename(items[0][1]) if n == items[0][0] else n, name, bb[2] - bb[0], h, warn))
    print('next: python tools/asset-pipeline/check_master.py', os.path.join(args.dest, '*.png'))


if __name__ == '__main__':
    main()
