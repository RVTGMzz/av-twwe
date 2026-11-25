"""Convert pipeline PNG atlases to lossless WebP and prove the conversion is pixel-exact.

Usage (repo root):  python tools/asset-pipeline/convert_webp.py
Requires Pillow with WebP support. Writes build/asset-pipeline/qa/size_report.json.
"""
import json
import os
import sys

from PIL import Image, features

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))


def visible_equal(a, b):
    """RGBA equality, ignoring RGB under fully transparent pixels."""
    if a.size != b.size:
        return False
    da, db = a.tobytes(), b.tobytes()
    if da == db:
        return True
    for i in range(0, len(da), 4):
        if da[i + 3] != db[i + 3]:
            return False
        if da[i + 3] and da[i:i + 3] != db[i:i + 3]:
            return False
    return True


def main():
    if not features.check('webp'):
        sys.exit('Pillow lacks WebP support')
    manifest = json.load(open(os.path.join(ROOT, 'build', 'asset-pipeline', 'convert_manifest.json')))
    rows, ok = [], True
    for item in manifest:
        png = os.path.join(ROOT, item['png'])
        webp = os.path.join(ROOT, item['webp'])
        os.makedirs(os.path.dirname(webp), exist_ok=True)
        im = Image.open(png).convert('RGBA')
        im.save(webp, 'WEBP', lossless=True, quality=100, method=6, exact=True)
        back = Image.open(webp)
        with open(webp, 'rb') as fh:
            head = fh.read(16)
        is_vp8l = head[12:16] == b'VP8L'
        same = visible_equal(im, back.convert('RGBA'))
        ok &= same and is_vp8l
        rows.append({'file': item['webp'], 'size': [im.width, im.height], 'png_bytes': os.path.getsize(png),
                     'webp_bytes': os.path.getsize(webp), 'lossless_vp8l': is_vp8l, 'pixel_exact': same})
        print(('OK  ' if same and is_vp8l else 'FAIL'), item['webp'], os.path.getsize(png), '->', os.path.getsize(webp))
    tp, tw = sum(r['png_bytes'] for r in rows), sum(r['webp_bytes'] for r in rows)
    report = {'files': len(rows), 'png_total_bytes': tp, 'webp_total_bytes': tw,
              'ratio': round(tw / tp, 4) if tp else None, 'all_lossless_pixel_exact': ok, 'items': rows}
    out = os.path.join(ROOT, 'build', 'asset-pipeline', 'qa', 'size_report.json')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump(report, open(out, 'w'), indent=1)
    print('PNG total %d bytes -> WebP lossless %d bytes (%.1f%%); pixel exact: %s' % (tp, tw, 100.0 * tw / tp, ok))
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
