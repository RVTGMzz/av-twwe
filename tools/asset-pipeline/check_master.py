"""GATE 01 character-master checker + review sheet (processing/QA only — it never draws characters).

Usage (repo root):
  python tools/asset-pipeline/check_master.py assets/concepts/trainer-gate01/*.png
Checks each master sprite: allowed canvas (48x64, 64x80, 64x96), transparent background, hard alpha
(0/255 only, no anti-aliased fringe), palette size, no stray single pixels on the silhouette edge.
Writes build/asset-pipeline/qa/gate01_review.png (1x and 4x, nearest-neighbour) and gate01_report.json.
"""
import json
import os
import sys

from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ALLOWED = {(48, 64), (64, 80), (64, 96)}  # 64x96 = V3 board recommendation
MAX_COLOURS = 48


def check(path):
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    px = im.load()
    alphas = set(im.getchannel('A').getdata())
    colours = {px[x, y][:3] for y in range(h) for x in range(w) if px[x, y][3]}
    corners = [px[0, 0][3], px[w - 1, 0][3], px[0, h - 1][3], px[w - 1, h - 1][3]]
    strays = 0
    for y in range(h):
        for x in range(w):
            if px[x, y][3] and not any(0 <= x + dx < w and 0 <= y + dy < h and px[x + dx, y + dy][3]
                                       for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                strays += 1
    bbox = im.getbbox()
    res = {
        'file': os.path.relpath(path, ROOT).replace('\\', '/'), 'size': [w, h],
        'canvas_allowed': (w, h) in ALLOWED,
        'transparent_background': max(corners) == 0,
        'hard_alpha_only': alphas <= {0, 255},
        'colour_count': len(colours), 'colour_count_ok': len(colours) <= MAX_COLOURS,
        'isolated_pixels': strays, 'bbox': list(bbox) if bbox else None,
        'touches_canvas_edge': bool(bbox and (bbox[0] == 0 or bbox[1] == 0 or bbox[2] == w or bbox[3] == h)),
    }
    res['pass_technical'] = all([res['canvas_allowed'], res['transparent_background'], res['hard_alpha_only'],
                                 res['colour_count_ok'], strays == 0, not res['touches_canvas_edge']])
    return im, res


def main(paths):
    if not paths:
        sys.exit(__doc__)
    results, ims = [], []
    for p in paths:
        im, r = check(p)
        results.append(r)
        ims.append(im)
        print('TECH-PASS' if r['pass_technical'] else 'TECH-FAIL', r['file'], r['size'], 'colours', r['colour_count'])
    # review sheet: each master at 1x, then 4x
    pad, sc = 8, 4
    cw = max(i.width for i in ims) * (1 + sc) + pad * 3
    ch = max(i.height for i in ims) * sc + pad * 2 + 14
    sheet = Image.new('RGBA', (cw, ch * len(ims)), (58, 74, 62, 255))
    dr = ImageDraw.Draw(sheet)
    for n, im in enumerate(ims):
        y = n * ch
        dr.text((pad, y + 2), os.path.basename(paths[n]), fill=(255, 255, 255, 255))
        sheet.alpha_composite(im, (pad, y + 14 + pad))
        sheet.alpha_composite(im.resize((im.width * sc, im.height * sc), Image.NEAREST), (pad * 2 + im.width, y + 14 + pad))
    out = os.path.join(ROOT, 'build', 'asset-pipeline', 'qa')
    os.makedirs(out, exist_ok=True)
    sheet.save(os.path.join(out, 'gate01_review.png'))
    json.dump({'note': 'Technical checks only. Visual/art approval is the owner\'s decision and is never implied by PASS.',
               'results': results}, open(os.path.join(out, 'gate01_report.json'), 'w'), indent=1)
    print('review sheet: build/asset-pipeline/qa/gate01_review.png')
    sys.exit(0 if all(r['pass_technical'] for r in results) else 1)


if __name__ == '__main__':
    main(sys.argv[1:])
