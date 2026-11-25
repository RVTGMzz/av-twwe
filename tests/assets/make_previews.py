"""Build owner-review preview sheets from the committed atlases + metadata.

Usage (repo root): python tests/assets/make_previews.py
Writes PNG sheets and GIFs to build/asset-pipeline/qa/previews/ (prototype rig only).
"""
import os

from PIL import Image, ImageDraw

from compose import ROOT, compose, metas, crop

OUT = os.path.join(ROOT, 'build', 'asset-pipeline', 'qa', 'previews')
BG = (74, 112, 70, 255)
SCALE = 3
COMBOS = [
    {'preset': 'male', 'skin': 'light', 'hair': 'style01', 'hair_color': 'chestnut', 'outfit': 'wayfarer'},
    {'preset': 'female', 'skin': 'medium', 'hair': 'style02', 'hair_color': 'midnight', 'outfit': 'runeweave'},
    {'preset': 'female', 'skin': 'deep', 'hair': 'style01', 'hair_color': 'chestnut', 'outfit': 'wayfarer'},
    {'preset': 'male', 'skin': 'deep', 'hair': 'style02', 'hair_color': 'midnight', 'outfit': 'runeweave'},
]


def label(img, text, xy):
    ImageDraw.Draw(img).text(xy, text, fill=(255, 255, 255, 255))


def sheet(cells, cols, cw, ch, title_rows=None):
    rows = (len(cells) + cols - 1) // cols
    img = Image.new('RGBA', (cols * cw, rows * ch), BG)
    for i, c in enumerate(cells):
        if c is not None:
            img.alpha_composite(c, ((i % cols) * cw, (i // cols) * ch))
    return img.resize((img.width * SCALE, img.height * SCALE), Image.NEAREST)


def save(img, name):
    img.save(os.path.join(OUT, name))
    print('wrote', 'build/asset-pipeline/qa/previews/' + name, img.size)


def main():
    os.makedirs(OUT, exist_ok=True)
    M = metas()
    T = M['trainer']
    dirs = T['directions']
    # 1) idle + walk, all 8 directions, 4 skin/outfit/hair combos
    for anim in ('idle', 'walk'):
        cells = []
        for combo in COMBOS:
            for d in dirs:
                cells.append(compose(M, combo, anim, d, 1 if anim == 'walk' else 0, stage=(64, 72), world=(32, 62)))
        save(sheet(cells, 8, 64, 72), f'{anim}_8dir_combos.png')
    # 2) full walk cycle grid (rows = directions) for combo 0
    cells = [compose(M, COMBOS[1], 'walk', d, f, stage=(64, 72), world=(32, 62)) for d in dirs for f in range(6)]
    save(sheet(cells, 6, 64, 72), 'walk_cycle_female_runeweave.png')
    # 3) faint + recover for S, E, N
    cells = []
    for d in ('S', 'E', 'N', 'SW'):
        for f in range(6):
            cells.append(compose(M, COMBOS[0], 'faint', d, f, stage=(72, 72), world=(36, 62)))
        for f in range(6):
            cells.append(compose(M, COMBOS[1], 'recover', d, f, stage=(72, 72), world=(36, 62)))
    save(sheet(cells, 12, 72, 72), 'faint_recover.png')
    # 4) bond sequence with Aevin + FX + target
    fx = M['fx']
    seq = [('bond_prepare', i) for i in range(4)] + [('bond_activate', i) for i in range(8)] + [('bond_success', i) for i in range(4)] + [('bond_fail', i) for i in range(4)]
    cells = []
    MT = M['mount']
    for anim, f in seq:
        st = Image.new('RGBA', (150, 84), (0, 0, 0, 0))
        tx, ty = 108, 66
        mc = MT['atlas_layout']['frames']['idle']['W'][0]
        tgt = Image.new('RGBA', (96, 96))
        for k in ('shadow', 'rear', 'front'):
            tgt.alpha_composite(crop(MT['layers'][k]['file'], mc, 96, 96))
        g = tgt.convert('LA').convert('RGBA')
        g.putalpha(tgt.getchannel('A'))
        st.alpha_composite(g, (tx - MT['pivot']['x'], ty - MT['pivot']['y']))
        ek = {'bond_activate': 'rune_ring', 'bond_success': 'success', 'bond_fail': 'fail'}.get(anim)
        if ek:
            e = fx['effects']['fx.bond.' + ek]
            st.alpha_composite(crop(fx['file'], e['frames'][min(f, len(e['frames']) - 1)], e['cell']['w'], e['cell']['h']), (tx - e['pivot']['x'], ty - e['pivot']['y']))
        st.alpha_composite(compose(M, COMBOS[0], anim, 'E', f, stage=(64, 72), world=(32, 62)), (6, 4))
        cells.append(st)
    save(sheet(cells, 4, 150, 84), 'bond_sequence_E.png')
    # 5) riding: rider skin swap on the same mount, 8 directions
    cells = []
    for combo in (COMBOS[0], COMBOS[1]):
        for d in dirs:
            cells.append(compose(M, combo, 'ride_walk', d, 1, stage=(96, 100), world=(48, 90), mounted=True))
    save(sheet(cells, 8, 96, 100), 'ride_walk_8dir_skins.png')
    # 6) GIFs for motion review
    frames = []
    for f in range(6):
        row = Image.new('RGBA', (8 * 64, 72), BG)
        for i, d in enumerate(dirs):
            row.alpha_composite(compose(M, COMBOS[0], 'walk', d, f, stage=(64, 72), world=(32, 62)), (i * 64, 0))
        frames.append(row.resize((row.width * 2, row.height * 2), Image.NEAREST).convert('RGB'))
    frames[0].save(os.path.join(OUT, 'walk_8dir.gif'), save_all=True, append_images=frames[1:], duration=100, loop=0)
    frames = []
    for f in range(6):
        row = Image.new('RGBA', (4 * 96, 100), BG)
        for i, d in enumerate(('S', 'E', 'N', 'SW')):
            row.alpha_composite(compose(M, COMBOS[1], 'ride_walk', d, f, stage=(96, 100), world=(48, 90), mounted=True), (i * 96, 0))
        frames.append(row.resize((row.width * 2, row.height * 2), Image.NEAREST).convert('RGB'))
    frames[0].save(os.path.join(OUT, 'ride_walk.gif'), save_all=True, append_images=frames[1:], duration=110, loop=0)
    print('wrote GIFs')


if __name__ == '__main__':
    main()
