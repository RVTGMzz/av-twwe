// Aevoria offline Asset Viewer. Composites the real WebP atlases using only the JSON metadata
// (render order, anchors, frame layout). Works from file:// — no server, no network.
(function () {
  'use strict';
  const A = window.AEVORIA_ASSETS;
  const ROOT = '../../../';
  const T = A.trainer, M = A.mount, AV = A.aevin, FX = A.fx;
  const $ = (id) => document.getElementById(id);
  const cv = $('cv'), ctx = cv.getContext('2d');
  $('status').textContent = 'status: ' + T.status + ' — proof sprites, not final art';

  // ---------- image cache
  const imgs = {};
  function img(path) {
    if (!imgs[path]) { const im = new Image(); im.src = ROOT + path; im.onerror = () => { im.failed = true; }; imgs[path] = im; }
    const im = imgs[path];
    return im.complete && !im.failed && im.naturalWidth ? im : null;
  }

  // ---------- controls
  const fill = (sel, items) => { sel.innerHTML = ''; for (const [v, t] of items) { const o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o); } };
  fill($('preset'), Object.keys(T.presets).map((k) => [k, k]));
  fill($('skin'), T.skin_tones.map((k) => [k, k]));
  fill($('hair'), Object.entries(T.hairstyles).map(([k, h]) => [k, h.name]));
  fill($('hairColor'), T.hairstyles[Object.keys(T.hairstyles)[0]].colors.map((c) => [c, c]));
  fill($('outfit'), Object.entries(T.outfits).map(([k, o]) => [k, o.name]));
  const mo = document.createElement('option'); mo.value = M.id; mo.textContent = M.working_name; $('mount').appendChild(mo);

  const SEQ = {
    'seq:bond_success': ['bond_prepare', 'bond_activate', 'bond_success'],
    'seq:bond_fail': ['bond_prepare', 'bond_activate', 'bond_fail'],
    'seq:faint': ['faint', 'faint_hold', 'faint_hold', 'faint_hold', 'recover'],
  };
  function animOptions() {
    const mounted = !!$('mount').value;
    const list = Object.keys(T.animations).filter((a) => (mounted ? T.animations[a].mount_sync : !T.animations[a].mount_sync));
    const items = list.map((a) => [a, a + ' (' + T.animations[a].frame_count + 'f)']);
    if (!mounted) items.push(['seq:bond_success', '▶ Sequence: Bond → success'], ['seq:bond_fail', '▶ Sequence: Bond → fail'], ['seq:faint', '▶ Sequence: Faint → hold → recover']);
    const prev = $('anim').value;
    fill($('anim'), items);
    if (items.some((i) => i[0] === prev)) $('anim').value = prev;
    else if (mounted) $('anim').value = prev === 'walk' ? 'ride_walk' : 'ride_idle';
  }
  animOptions();

  let dir = 'S';
  const DIR_GRID = ['NW', 'N', 'NE', 'W', '', 'E', 'SW', 'S', 'SE'];
  for (const d of DIR_GRID) {
    const b = document.createElement('button'); b.textContent = d || '·';
    if (!d) b.className = 'c'; else b.onclick = () => { dir = d; refreshDirs(); };
    b.dataset.d = d; $('dirs').appendChild(b);
  }
  function refreshDirs() { for (const b of $('dirs').children) b.classList.toggle('on', b.dataset.d === dir); }
  refreshDirs();

  const LAYER_IDS = T.slots.map((s) => s.id);
  const layerOn = {};
  for (const id of LAYER_IDS) {
    layerOn[id] = true;
    const l = document.createElement('label'); const c = document.createElement('input'); c.type = 'checkbox'; c.checked = true;
    c.onchange = () => { layerOn[id] = c.checked; }; l.appendChild(c); l.appendChild(document.createTextNode(id)); $('layers').appendChild(l);
  }

  let playing = true, speed = 1, clock = 0, last = performance.now();
  $('play').onclick = () => { playing = !playing; $('play').textContent = playing ? 'Pause' : 'Play'; };
  $('step').onclick = () => { playing = false; $('play').textContent = 'Play'; stepOnce = true; };
  $('restart').onclick = () => { clock = 0; };
  $('speed').oninput = () => { speed = +$('speed').value; $('speedv').textContent = speed.toFixed(2) + '×'; };
  $('mount').onchange = () => { animOptions(); clock = 0; };
  $('anim').onchange = () => { clock = 0; };
  let stepOnce = false;

  // ---------- timeline
  const animDef = (id) => T.animations[id];
  const animLen = (id) => animDef(id).durations_ms.reduce((a, b) => a + b, 0);
  /** Resolve the current animation id + frame index from the clock (supports sequences). */
  function timeline(sel, t) {
    const seq = SEQ[sel];
    if (!seq) {
      const d = animDef(sel); const total = animLen(sel);
      let tt = d.loop ? t % total : Math.min(t, total - 1);
      for (let i = 0; i < d.durations_ms.length; i++) { if (tt < d.durations_ms[i]) return { anim: sel, frame: i, local: t }; tt -= d.durations_ms[i]; }
      return { anim: sel, frame: d.durations_ms.length - 1, local: t };
    }
    const total = seq.reduce((s, a) => s + animLen(a), 0) + 600;
    let tt = t % total;
    for (const a of seq) {
      const L = animLen(a);
      if (tt < L) { const r = timeline(a, tt); r.seq = seq; r.seqT = t % total; return r; }
      tt -= L;
    }
    const a = seq[seq.length - 1]; return { anim: a, frame: animDef(a).frame_count - 1, seq, seqT: t % total, local: animLen(a) };
  }
  /** Map reuse animations to their source cells/frame_data. */
  function cellOf(anim, d, frame) {
    const def = animDef(anim);
    if (def.reuse) return cellOf(def.reuse.animation, d, def.reuse.frames[frame]);
    return { cell: T.atlas_layout.frames[anim][d][frame], data: T.frame_data[anim][d][frame], anim, frame };
  }

  // ---------- variant selection (gameplay would resolve outfit IDs the same way, never filenames)
  function sel() { return { preset: $('preset').value, skin: $('skin').value, hair: $('hair').value, hairColor: $('hairColor').value, outfit: $('outfit').value, satchel: $('satchel').checked }; }
  function variantFor(slot, s) {
    return T.variants.find((v) => {
      if (v.slot !== slot || !v.presets.includes(s.preset)) return false;
      if (slot === 'base_body') return v.skin_tone === s.skin;
      if (slot === 'hair_front' || slot === 'hair_back') return v.hairstyle === s.hair && v.hair_color === s.hairColor;
      if (['top', 'bottom', 'shoes', 'gloves', 'scarf', 'cape'].includes(slot)) return v.outfit === s.outfit;
      if (slot === 'backpack') return s.satchel;
      return true;
    });
  }

  // ---------- drawing helpers
  function drawCell(file, cell, w, h, x, y, tint) {
    const im = img(file); if (!im) return;
    if (!tint) { ctx.drawImage(im, cell.x, cell.y, w, h, Math.round(x), Math.round(y), w, h); return; }
    const t = tintCanvas(w, h); const tc = t.getContext('2d');
    tc.clearRect(0, 0, w, h); tc.globalCompositeOperation = 'source-over'; tc.drawImage(im, cell.x, cell.y, w, h, 0, 0, w, h);
    tc.globalCompositeOperation = 'source-atop'; tc.fillStyle = tint; tc.fillRect(0, 0, w, h);
    ctx.drawImage(t, Math.round(x), Math.round(y));
  }
  const tcs = {}; function tintCanvas(w, h) { const k = w + 'x' + h; if (!tcs[k]) { tcs[k] = document.createElement('canvas'); tcs[k].width = w; tcs[k].height = h; } return tcs[k]; }
  function cross(x, y, c, r = 2) { ctx.fillStyle = c; ctx.fillRect(Math.round(x) - r, Math.round(y), r * 2 + 1, 1); ctx.fillRect(Math.round(x), Math.round(y) - r, 1, r * 2 + 1); }

  // ---------- compose one character at world point (wx, wy)
  function drawCharacter(wx, wy, d, tl, s, showDebug) {
    const mounted = $('mount').value;
    const { cell, data } = cellOf(tl.anim, d, tl.frame);
    const cw = T.canvas.w, ch = T.canvas.h;
    let ox = wx - T.pivot.x, oy = wy - T.pivot.y;
    let mData = null, mCell = null;
    if (mounted) {
      const sync = M.animation_sync[tl.anim];
      const mf = sync.frame_map[tl.frame];
      mCell = M.atlas_layout.frames[sync.mount_animation][d][mf];
      mData = M.frame_data[sync.mount_animation][d][mf];
      const mx = wx - M.pivot.x, my = wy - M.pivot.y;
      if (layerOn.shadow) drawCell(M.layers.shadow.file, mCell, M.canvas.w, M.canvas.h, mx, my);
      if (layerOn.mount_rear) drawCell(M.layers.rear.file, mCell, M.canvas.w, M.canvas.h, mx, my, $('occl').checked ? 'rgba(60,110,255,0.45)' : null);
      ox = mx + mData.saddle_anchor.x - data.seat_anchor.x;
      oy = my + mData.saddle_anchor.y - data.seat_anchor.y;
    }
    let order = T.render_order[d].slice();
    if (data.held_item_order === 'back') { order = order.filter((x) => x !== 'held_item'); order.splice(order.indexOf('base_body'), 0, 'held_item'); }
    for (const slot of order) {
      if (!layerOn[slot]) continue;
      if (slot === 'shadow') { if (mounted) continue; const v = variantFor('shadow', s); if (v) drawCell(v.file, cell, cw, ch, ox, oy); continue; }
      if (slot === 'mount_rear') continue;
      if (slot === 'mount_front') { if (mounted) drawCell(M.layers.front.file, mCell, M.canvas.w, M.canvas.h, wx - M.pivot.x, wy - M.pivot.y, $('occl').checked ? 'rgba(255,60,60,0.5)' : null); continue; }
      if (slot === 'held_item') {
        if (!data.holds_item) continue;
        const it = AV.items['item.aevin.standard']; const af = Math.floor(clock / 140) % it.frames.length;
        drawCell(it.file, it.frames[af], it.cell.w, it.cell.h, ox + data.hand_item_anchor.x - it.pivot.x, oy + data.hand_item_anchor.y - it.pivot.y);
        continue;
      }
      if (slot === 'effects') {
        if (tl.anim === 'bond_activate' && layerOn.effects) {
          const e = FX.effects['fx.bond.resonance']; const f = Math.floor(clock / 80) % e.frames.length;
          drawCell(FX.file, e.frames[f], e.cell.w, e.cell.h, ox + data.hand_item_anchor.x - e.pivot.x, oy + data.hand_item_anchor.y - e.pivot.y);
        }
        continue;
      }
      const v = variantFor(slot, s); if (!v) continue;
      drawCell(v.file, cell, cw, ch, ox, oy);
    }
    if (showDebug) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.strokeRect(Math.round(ox) + 0.5, Math.round(oy) + 0.5, cw - 1, ch - 1);
      cross(ox + T.pivot.x, oy + T.pivot.y, '#ff4d4d');
      cross(ox + data.hand_item_anchor.x, oy + data.hand_item_anchor.y, '#ffe14d', 1);
      cross(ox + data.head_anchor.x, oy + data.head_anchor.y, '#ff6bd6', 1);
      cross(ox + data.seat_anchor.x, oy + data.seat_anchor.y, '#4de1ff', 1);
      if (mounted) {
        const mx = wx - M.pivot.x, my = wy - M.pivot.y;
        cross(mx + mData.saddle_anchor.x, my + mData.saddle_anchor.y, '#4dff7a', 2);
        const cb = mData.collision_bounds; ctx.strokeStyle = 'rgba(77,255,122,0.8)';
        ctx.beginPath(); ctx.ellipse(wx + cb.cx, wy + cb.cy, cb.rx, cb.ry, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
    return { data, mData, ox, oy };
  }

  // ---------- frame loop
  function frame(now) {
    const dt = Math.min(100, now - last); last = now;
    if (playing) clock += dt * speed;
    if (stepOnce) { const tl = timeline($('anim').value, clock); const d = animDef(tl.anim); clock += d.durations_ms[tl.frame] + 1; stepOnce = false; }
    const z = +$('zoom').value;
    const all8 = $('all8').checked;
    const W = all8 ? 8 * 72 : 224, H = all8 ? 120 : 150;
    if (cv.width !== W * z || cv.height !== H * z) { cv.width = W * z; cv.height = H * z; }
    ctx.setTransform(z, 0, 0, z, 0, 0); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#4a7046'; ctx.fillRect(0, 0, W, H);
    if ($('grid').checked) { ctx.fillStyle = 'rgba(0,0,0,0.14)'; for (let x = 0; x < W; x += 32) ctx.fillRect(x, 0, 1, H); for (let y = 0; y < H; y += 32) ctx.fillRect(0, y, W, 1); }
    const s = sel(); const selAnim = $('anim').value; const tl = timeline(selAnim, clock);
    const dbg = $('anchors').checked;
    let info = '';
    if (all8) {
      T.directions.forEach((d, i) => { drawCharacter(36 + i * 72, 92, d, tl, s, dbg); ctx.fillStyle = '#fff'; ctx.fillText(d, 30 + i * 72, 112); });
    } else {
      const wx = 80, wy = 112;
      const bondScene = /^bond_/.test(tl.anim) && !$('mount').value;
      let targetX = 0, targetY = 0;
      if (bondScene) {
        const dd = { S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1], N: [0, -1], NE: [1, -1], E: [1, 0], SE: [1, 1] }[dir];
        const n = Math.hypot(dd[0], dd[1]); targetX = wx + (dd[0] / n) * 60; targetY = wy + (dd[1] / n) * 60 * 0.6;
      }
      const drawTarget = () => {
        if (!bondScene) return;
        const mc = M.atlas_layout.frames.idle.E[0]; ctx.save(); ctx.filter = 'grayscale(0.7) brightness(0.85)';
        drawCell(M.layers.shadow.file, mc, M.canvas.w, M.canvas.h, targetX - M.pivot.x, targetY - M.pivot.y);
        drawCell(M.layers.rear.file, mc, M.canvas.w, M.canvas.h, targetX - M.pivot.x, targetY - M.pivot.y);
        drawCell(M.layers.front.file, mc, M.canvas.w, M.canvas.h, targetX - M.pivot.x, targetY - M.pivot.y); ctx.restore();
        if (!layerOn.effects) return;
        let e = null, f = 0;
        if (tl.anim === 'bond_activate') { e = FX.effects['fx.bond.rune_ring']; f = Math.floor(tl.local / 90) % e.frames.length; }
        if (tl.anim === 'bond_success') { e = FX.effects['fx.bond.success']; f = Math.min(e.frames.length - 1, Math.floor(tl.local / 90)); }
        if (tl.anim === 'bond_fail') { e = FX.effects['fx.bond.fail']; f = Math.min(e.frames.length - 1, Math.floor(tl.local / 100)); }
        if (e) drawCell(FX.file, e.frames[f], e.cell.w, e.cell.h, targetX - e.pivot.x, targetY - e.pivot.y);
      };
      if (bondScene && targetY < wy) drawTarget();
      const r = drawCharacter(wx, wy, dir, tl, s, dbg);
      if (bondScene && targetY >= wy) drawTarget();
      info = `animation ${tl.anim}  frame ${tl.frame + 1}/${animDef(tl.anim).frame_count}  dir ${dir}\n` +
        `hand_item_anchor ${JSON.stringify(r.data.hand_item_anchor)} (${r.data.held_item_order})  seat_anchor ${JSON.stringify(r.data.seat_anchor)}` +
        (r.data.hidden_parts.length ? `  hidden: ${r.data.hidden_parts.join(',')}` : '') +
        (r.mData ? `\nmount ${M.id}  saddle_anchor ${JSON.stringify(r.mData.saddle_anchor)}  rider_offset ${JSON.stringify(r.mData.rider_offset)}  sync ${JSON.stringify(M.animation_sync[tl.anim])}` : '') +
        `\nlayers: ` + T.render_order[dir].filter((x) => layerOn[x]).join(' › ');
    }
    $('info').textContent = info;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
