"""Animation speck / flicker check (owner report 2026-11-26: white dots that appear only in some walk frames).

For every animation frame N>0, list bright isolated pixels (value >= 0.72, saturation <= 0.45, at least 5 of
8 neighbours transparent or much darker) that do NOT exist within 2 px in frame 0. These pixels appear in only
some frames, so in motion they flicker as white dots. Real highlights that move with a part also show up here,
so a human (or Codex) must look at each candidate. Fix: recolour to the surrounding cluster colour.

Usage (repo root): python tools/asset-pipeline/check_flicker.py assets/characters/trainer/anim_src/walk
Writes build/asset-pipeline/qa/flicker/<gender>_<dir>.png (frames on a dark background, candidates in magenta)
and prints the counts. Exit code 1 if any candidate exists.
"""
import colorsys
import glob
import os
import re
import sys

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))


def sv(c):
    _, s, v = colorsys.rgb_to_hsv(*(k / 255 for k in c[:3]))
    return s, v


def specks(im):
    w, h = im.size
    px = im.load()
    out = set()
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            if not c[3]:
                continue
            s, v = sv(c)
            if v < 0.72 or s > 0.45:
                continue
            nb = [px[x + dx, y + dy] for dx in (-1, 0, 1) for dy in (-1, 0, 1)
                  if (dx or dy) and 0 <= x + dx < w and 0 <= y + dy < h]
            if sum(1 for q in nb if q[3] == 0 or sv(q)[1] < v - 0.28) >= 5:
                out.add((x, y))
    return out


def main(root):
    out_dir = os.path.join(ROOT, 'build', 'asset-pipeline', 'qa', 'flicker')
    os.makedirs(out_dir, exist_ok=True)
    groups = {}
    for f in glob.glob(os.path.join(root, '*', '*_f*.png')):
        m = re.match(r'(.+)_f(\d+)\.png$', os.path.basename(f))
        if m:
            groups.setdefault((os.path.basename(os.path.dirname(f)), m.group(1)), {})[int(m.group(2))] = f
    total = 0
    for (g, d), frames in sorted(groups.items()):
        base = specks(Image.open(frames[0]).convert('RGBA'))
        n = len(frames)
        ims = [Image.open(frames[i]).convert('RGBA') for i in range(n)]
        sheet = Image.new('RGBA', (64 * n, 96 * 2), (20, 22, 28, 255))
        count = 0
        for i, im in enumerate(ims):
            sheet.alpha_composite(im, (i * 64, 0))
            sheet.alpha_composite(im, (i * 64, 96))
            if i == 0:
                continue
            for p in specks(im):
                if not any((p[0] + dx, p[1] + dy) in base for dx in range(-2, 3) for dy in range(-2, 3)):
                    sheet.putpixel((i * 64 + p[0], 96 + p[1]), (255, 0, 255, 255))
                    count += 1
        total += count
        sheet.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST).save(os.path.join(out_dir, '%s_%s.png' % (g, d)))
        print('%-8s %-3s candidates %d' % (g, d, count))
    print('total candidates', total)
    sys.exit(1 if total else 0)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'assets', 'characters', 'trainer', 'anim_src', 'walk'))
