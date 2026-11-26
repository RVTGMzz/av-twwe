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
    """Edge specks: opaque pixels touching transparency that are clearly lighter than the pixels inside them.
    Rule A (greyish halo): saturation < 0.35, value > 0.35 and > inner mean + 0.08.
    Rule B (bright speck): value > 0.62 and lighter than every inner neighbour by > 0.18."""
    w, h = im.size
    px = im.load()
    hits = []
    val = lambda q: colorsys.rgb_to_hsv(*(k / 255 for k in q[:3]))
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
            _, s, v = val(c)
            ivs = [val(q)[2] for q in inner]
            rule_a = s < 0.35 and v > 0.35 and v > sum(ivs) / len(ivs) + 0.08
            rule_b = v > 0.62 and all(v > iv + 0.18 for iv in ivs)
            if rule_a or rule_b:
                darkest = min(inner, key=lambda q: sum(q[:3]))
                hits.append(((x, y), tuple(int(k * 0.55) for k in darkest[:3])))
    return hits


def sync_layers(sprite_path, im, hits):
    """Recoloured pixels also live in the GATE 03 phase 2 sources (full_src): update the owning slot so
    verify-full keeps passing. Owner slot comes from the label map."""
    name = os.path.basename(sprite_path)  # trainer_{g}_{d}_64x96.png
    parts = name.split('_')
    if len(parts) < 4 or parts[0] != 'trainer':
        return
    g, d = parts[1], parts[2]
    gname = {'m': 'male', 'f': 'female'}.get(g)
    lab_path = os.path.join(ROOT, 'assets', 'characters', 'trainer', 'labels', 'trainer_%s_%s_labels.png' % (g, d))
    if not gname or not os.path.exists(lab_path):
        return
    sys.path.insert(0, os.path.dirname(__file__))
    import separate_layers as SL
    lab = Image.open(lab_path)
    for (p, _) in hits:
        slot = SL.LABELS[lab.getpixel(p)][0]
        src = os.path.join(SL.FULL_SRC, gname, '%s_%s.png' % (slot, d))
        if slot in SL.FULL_SLOTS and os.path.exists(src):
            layer = Image.open(src).convert('RGBA')
            layer.putpixel(p, im.getpixel(p))
            layer.save(src)


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
            sync_layers(f, im, hits)
        print('%-60s halo pixels: %d%s' % (os.path.relpath(f, ROOT), len(hits), ' (fixed)' if apply and hits else ''))
    print('total', total)


if __name__ == '__main__':
    main(sys.argv[1:])
