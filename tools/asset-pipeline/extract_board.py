"""Extract the 16 direction figures from the approved Trainer Master V3 board into draft 64x96 sprites.

Image PROCESSING only (background removal, uniform scale, palette reduction, hard alpha). It does not
redraw or redesign anything, so the board's own defects (e.g. the female ponytail side) remain and must
be fixed by the artist/ChatGPT in GATE 02 clean-up.

Usage (repo root): python tools/asset-pipeline/extract_board.py [--out DIR]
Default output: build/asset-pipeline/gate02-extract/ (not committed).
"""
import hashlib
import os
import sys
from collections import deque

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BOARD = os.path.join(ROOT, 'assets', 'concepts', 'trainer-master-v3.webp')
BOARD_SHA = 'b6fbbd9efa7d6217354b0f2f577a255be7e80c4d89bd831984c8c0d3fa58be50'
DIRS = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se']
CENTRES_X = [578, 702, 823, 944, 1066, 1188, 1312, 1435]   # column centres on the board
ROWS = {'m': (160, 335), 'f': (470, 645)}                   # figure bands (label text excluded)
HALF_W = 58
CANVAS = (64, 96)
MAX_COLOURS = 48


def is_bg(c):
    r, g, b = c
    return r > 200 and g > 180 and b > 150 and r - b < 60 and abs(r - g) < 40


def cut(board, cx, y0, y1):
    """Flood-fill the light panel background (and soft ground shadow) from the window border."""
    win = board.crop((cx - HALF_W, y0, cx + HALF_W, y1))
    w, h = win.size
    px = win.load()
    bg = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if not (0 <= x < w and 0 <= y < h) or bg[y][x] or not is_bg(px[x, y]):
            continue
        bg[y][x] = True
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    out = Image.new('RGBA', (w, h))
    op = out.load()
    for y in range(h):
        for x in range(w):
            if not bg[y][x]:
                op[x, y] = px[x, y] + (255,)
    return out


def main():
    out_dir = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(ROOT, 'build', 'asset-pipeline', 'gate02-extract')
    sha = hashlib.sha256(open(BOARD, 'rb').read()).hexdigest()
    if sha != BOARD_SHA:
        sys.exit('board hash mismatch: ' + sha)
    board = Image.open(BOARD).convert('RGB')
    figs = {}
    for g, (y0, y1) in ROWS.items():
        for d, cx in zip(DIRS, CENTRES_X):
            f = cut(board, cx, y0, y1)
            bb = f.getchannel('A').point(lambda a: 255 if a else 0).getbbox()
            figs[(g, d)] = f.crop(bb)
    # one scale for all 16 so proportions match across directions and genders
    tallest = max(f.height for f in figs.values())
    scale = (CANVAS[1] - 4) / tallest
    os.makedirs(out_dir, exist_ok=True)
    for (g, d), f in figs.items():
        w, h = max(1, round(f.width * scale)), max(1, round(f.height * scale))
        # premultiplied box downscale, then hard alpha and limited palette
        small = f.resize((w, h), Image.BOX)
        alpha = small.getchannel('A').point(lambda a: 255 if a >= 140 else 0)
        rgb = small.convert('RGB').quantize(colors=MAX_COLOURS, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
        spr = Image.new('RGBA', CANVAS)
        tile = rgb.convert('RGBA'); tile.putalpha(alpha)
        spr.alpha_composite(tile, ((CANVAS[0] - w) // 2, CANVAS[1] - 2 - h))
        sp = spr.load()  # drop single isolated pixels left by the alpha threshold
        for y in range(CANVAS[1]):
            for x in range(CANVAS[0]):
                if sp[x, y][3] and not any(0 <= x + dx < CANVAS[0] and 0 <= y + dy < CANVAS[1] and sp[x + dx, y + dy][3]
                                           for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    sp[x, y] = (0, 0, 0, 0)
        spr.save(os.path.join(out_dir, 'trainer_%s_%s_64x96.png' % (g, d)))
    sheet = Image.new('RGBA', (8 * CANVAS[0], 2 * CANVAS[1]), (74, 112, 70, 255))
    for gi, g in enumerate('mf'):
        for i, d in enumerate(DIRS):
            sheet.alpha_composite(Image.open(os.path.join(out_dir, 'trainer_%s_%s_64x96.png' % (g, d))), (i * CANVAS[0], gi * CANVAS[1]))
    sheet.save(os.path.join(out_dir, 'preview_1x.png'))
    sheet.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST).save(os.path.join(out_dir, 'preview_4x.png'))
    print('extracted 16 figures, scale %.3f (tallest %d px on board) -> %s' % (scale, tallest, os.path.relpath(out_dir, ROOT)))


if __name__ == '__main__':
    main()
