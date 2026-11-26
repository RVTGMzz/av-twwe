"""Remove light background halo left on sprite silhouettes (owner report 2026-11-26: white specks on the male trainer).

A halo pixel is an opaque pixel on the outer edge (touches transparency) that is greyish (saturation < 0.25)
and clearly lighter than the pixels inside it. It is recoloured to a dark outline tone taken from its darkest
inner neighbour, so the silhouette keeps its shape. Nothing else is touched.

Usage (repo root): python tools/asset-pipeline/clean_halo.py [--apply] FILES...
Without --apply it only reports and writes a magenta-marked preview to build/asset-pipeline/qa/halo/.
"""
import colorsys
import os
import sys

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))


def find_halo(im):
    w, h = im.size
    px = im.load()
    hits = []
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            if not c[3]:
                continue
            nb = [(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))]
            outside = [p for p in nb if not (0 <= p[0] < w and 0 <= p[1] < h) or px[p][3] == 0]
            inner = [px[p] for p in nb if p not in outside]
            if not outside or not inner:
                continue
            _, s, v = colorsys.rgb_to_hsv(*(k / 255 for k in c[:3]))
            iv = sum(max(q[:3]) for q in inner) / len(inner) / 255
            if s < 0.25 and v > 0.40 and v > iv + 0.12:
                darkest = min(inner, key=lambda q: sum(q[:3]))
                hits.append(((x, y), tuple(int(k * 0.55) for k in darkest[:3])))
    return hits


def main(args):
    apply = '--apply' in args
    files = [a for a in args if a != '--apply']
    if not files:
        sys.exit(__doc__)
    out_dir = os.path.join(ROOT, 'build', 'asset-pipeline', 'qa', 'halo')
    os.makedirs(out_dir, exist_ok=True)
    total = 0
    for f in files:
        im = Image.open(f).convert('RGBA')
        mark = im.copy()
        # existing dark colours only, so the palette does not grow
        dark = sorted({c[:3] for c in im.getdata() if c[3] and max(c[:3]) < 115})
        hits = []
        for _ in range(4):  # fixing one edge pixel can expose the next one
            new = find_halo(im)
            if not new:
                break
            for (p, want) in new:
                col = min(dark, key=lambda d: sum((d[i] - want[i]) ** 2 for i in range(3)))
                mark.putpixel(p, (255, 0, 255, 255))
                im.putpixel(p, col + (255,))
            hits += new
        total += len(hits)
        mark.save(os.path.join(out_dir, os.path.basename(f)))
        if apply and hits:
            im.save(f)
        print('%-60s halo pixels: %d%s' % (os.path.relpath(f, ROOT), len(hits), ' (fixed)' if apply and hits else ''))
    print('total', total)


if __name__ == '__main__':
    main(sys.argv[1:])
