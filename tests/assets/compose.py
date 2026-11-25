"""Metadata-driven compositor shared by previews and QA. Uses ONLY the committed WebP atlases + JSON
(no generator code), so it proves the assets work as an engine would consume them."""
import json
import os

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
_cache = {}


def load_json(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as fh:
        return json.load(fh)


def atlas(rel):
    if rel not in _cache:
        _cache[rel] = Image.open(os.path.join(ROOT, rel)).convert('RGBA')
    return _cache[rel]


PROTO = os.environ.get('AEVORIA_ASSET_ROOT', 'build/asset-pipeline/prototype/')


def metas():
    return {
        'trainer': load_json(PROTO + 'assets/characters/trainer/metadata/trainer_batch01.json'),
        'mount': load_json(PROTO + 'assets/mounts/ground/kin_mount_ground_proto01.json'),
        'aevin': load_json(PROTO + 'assets/items/aevin/aevin_items.json'),
        'fx': load_json(PROTO + 'assets/effects/bond/bond_fx.json'),
    }


def cell_of(T, anim, d, f):
    a = T['animations'][anim]
    if 'reuse' in a:
        return cell_of(T, a['reuse']['animation'], d, a['reuse']['frames'][f])
    return T['atlas_layout']['frames'][anim][d][f], T['frame_data'][anim][d][f]


def variant_for(T, slot, sel):
    for v in T['variants']:
        if v['slot'] != slot or sel['preset'] not in v['presets']:
            continue
        if slot == 'base_body' and v.get('skin_tone') != sel['skin']:
            continue
        if slot in ('hair_front', 'hair_back') and (v.get('hairstyle') != sel['hair'] or v.get('hair_color') != sel['hair_color']):
            continue
        if slot in ('top', 'bottom', 'shoes', 'gloves', 'scarf', 'cape') and v.get('outfit') != sel['outfit']:
            continue
        if slot == 'backpack' and not sel.get('satchel', True):
            continue
        return v
    return None


def crop(rel, cell, w, h):
    return atlas(rel).crop((cell['x'], cell['y'], cell['x'] + w, cell['y'] + h))


def paste(dst, src, x, y):
    dst.alpha_composite(src, (int(round(x)), int(round(y))))


def compose(M, sel, anim, d, f, stage=(96, 96), world=(48, 84), mounted=False, layers_off=(), with_fx=True):
    """Return an RGBA stage image with the full character (and mount) composited."""
    T, MT = M['trainer'], M['mount']
    img = Image.new('RGBA', stage, (0, 0, 0, 0))
    cell, data = cell_of(T, anim, d, f)
    cw, ch = T['canvas']['w'], T['canvas']['h']
    wx, wy = world
    ox, oy = wx - T['pivot']['x'], wy - T['pivot']['y']
    mcell = None
    if mounted:
        sync = MT['animation_sync'][anim]
        mf = sync['frame_map'][f]
        mcell = MT['atlas_layout']['frames'][sync['mount_animation']][d][mf]
        md = MT['frame_data'][sync['mount_animation']][d][mf]
        mx, my = wx - MT['pivot']['x'], wy - MT['pivot']['y']
        for k in ('shadow', 'rear'):
            paste(img, crop(MT['layers'][k]['file'], mcell, MT['canvas']['w'], MT['canvas']['h']), mx, my)
        ox = mx + md['saddle_anchor']['x'] - data['seat_anchor']['x']
        oy = my + md['saddle_anchor']['y'] - data['seat_anchor']['y']
    order = list(T['render_order'][d])
    if data['held_item_order'] == 'back':
        order.remove('held_item')
        order.insert(order.index('base_body'), 'held_item')
    for slot in order:
        if slot in layers_off or slot == 'mount_rear':
            continue
        if slot == 'shadow' and mounted:
            continue
        if slot == 'mount_front':
            if mounted:
                paste(img, crop(MT['layers']['front']['file'], mcell, MT['canvas']['w'], MT['canvas']['h']), wx - MT['pivot']['x'], wy - MT['pivot']['y'])
            continue
        if slot == 'held_item':
            if data['holds_item']:
                it = M['aevin']['items']['item.aevin.standard']
                paste(img, crop(it['file'], it['frames'][f % len(it['frames'])], it['cell']['w'], it['cell']['h']),
                      ox + data['hand_item_anchor']['x'] - it['pivot']['x'], oy + data['hand_item_anchor']['y'] - it['pivot']['y'])
            continue
        if slot == 'effects':
            if with_fx and anim == 'bond_activate':
                e = M['fx']['effects']['fx.bond.resonance']
                paste(img, crop(M['fx']['file'], e['frames'][f % len(e['frames'])], e['cell']['w'], e['cell']['h']),
                      ox + data['hand_item_anchor']['x'] - e['pivot']['x'], oy + data['hand_item_anchor']['y'] - e['pivot']['y'])
            continue
        v = variant_for(T, slot, sel)
        if v:
            paste(img, crop(v['file'], cell, cw, ch), ox, oy)
    return img
