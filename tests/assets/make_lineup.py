"""Base pose lineup (idle frame 0, 8 directions, male + female) and measured body proportions.

Usage (repo root): python tests/assets/make_lineup.py
Writes build/asset-pipeline/qa/previews/base_lineup.png and qa/reports/proportions.json (prototype rig only).
"""
import json
import os

from PIL import Image, ImageDraw

from compose import ROOT, PROTO, compose, metas, load_json

OUT = os.path.join(ROOT, 'build', 'asset-pipeline', 'qa')
VIEW_NAMES = {'S': 'front', 'SW': '3/4 front', 'W': 'side', 'NW': '3/4 back', 'N': 'back', 'NE': '3/4 back', 'E': 'side', 'SE': '3/4 front'}
LOOKS = [
    ('male', {'preset': 'male', 'skin': 'light', 'hair': 'style01', 'hair_color': 'chestnut', 'outfit': 'wayfarer'}),
    ('female', {'preset': 'female', 'skin': 'light', 'hair': 'style02', 'hair_color': 'chestnut', 'outfit': 'wayfarer'}),
]
BASE_ONLY = ('top', 'bottom', 'shoes', 'gloves', 'scarf', 'cape', 'backpack', 'hair_front', 'hair_back', 'shadow')


def measure(M, sel):
    """Head share and arm reach from the composited S idle frame + pose joints."""
    poses = load_json(PROTO + 'assets/characters/trainer/poses/pose_joints_batch01.json')['joints']['idle']['S'][0]
    img = compose(M, sel, 'idle', 'S', 0, stage=(64, 64), world=(32, 58), layers_off=('shadow',))
    top = img.getbbox()[1]
    feet = img.getchannel('A').getbbox()[3]
    chin = poses['neck'][1] + 0.5
    height = feet - top
    mid_thigh = (poses['hipR'][1] + poses['kneeR'][1]) / 2
    return {'sprite_height_px': height, 'head_height_px': round(chin - top, 1), 'head_share': round((chin - top) / height, 3),
            'heads_tall': round(height / (chin - top), 2), 'hand_y': poses['handR'][1], 'mid_thigh_y': mid_thigh,
            'hand_minus_mid_thigh_px': round(poses['handR'][1] - mid_thigh, 1)}


def main():
    M = metas()
    dirs = M['trainer']['directions']
    cw, ch, sc = 64, 76, 4
    rows = []
    for name, sel in LOOKS:
        rows.append((name + ' · Wayfarer', sel, ()))
        rows.append((name + ' · base body', dict(sel, skin='medium'), BASE_ONLY))
    img = Image.new('RGBA', (len(dirs) * cw, len(rows) * ch + 10), (74, 112, 70, 255))
    for r, (title, sel, off) in enumerate(rows):
        for i, d in enumerate(dirs):
            img.alpha_composite(compose(M, sel, 'idle', d, 0, stage=(cw, ch - 10), world=(32, 62), layers_off=off), (i * cw, r * ch + 10))
    img = img.resize((img.width * sc, img.height * sc), Image.NEAREST)
    dr = ImageDraw.Draw(img)
    for i, d in enumerate(dirs):
        dr.text((i * cw * sc + 8, 6), '%s  %s' % (d, VIEW_NAMES[d]), fill=(255, 255, 255, 255))
    for r, (title, _, _) in enumerate(rows):
        dr.text((8, (r * ch + 10) * sc + 4), title, fill=(255, 240, 180, 255))
    os.makedirs(os.path.join(OUT, 'previews'), exist_ok=True)
    img.save(os.path.join(OUT, 'previews', 'base_lineup.png'))
    report = {n: measure(M, s) for n, s in LOOKS}
    report['targets'] = {'head_share': [0.28, 0.30], 'heads_tall': [3.75, 4.0], 'hand_minus_mid_thigh_px': 'about 0 (arms reach mid-thigh)'}
    os.makedirs(os.path.join(OUT, 'reports'), exist_ok=True)
    json.dump(report, open(os.path.join(OUT, 'reports', 'proportions.json'), 'w'), indent=1)
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    main()
