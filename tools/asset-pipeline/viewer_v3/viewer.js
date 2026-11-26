// Aevoria Trainer V3 viewer: composites the committed lossless WebP layer atlases using only the metadata
// bundle (render order, frame layout, timing). Works offline from file:// (no fetch, no network).
(function () {
  'use strict';
  const D = window.AEVORIA_V3;
  const ROOT = '../../../';
  const $ = (id) => document.getElementById(id);
  const cv = $('cv'), ctx = cv.getContext('2d');
  const CW = D.canvas.w, CH = D.canvas.h;
  $('status').textContent = 'layers: ' + D.status.layers + ' · idle: ' + D.status.idle + ' · walk: ' + D.status.walk;

  const imgs = {};
  function img(path) {
    if (!imgs[path]) { const im = new Image(); im.src = ROOT + path; imgs[path] = im; }
    const im = imgs[path];
    return im.complete && im.naturalWidth ? im : null;
  }
  // preload everything once
  for (const a of Object.values(D.animations)) for (const g of Object.values(a.files)) for (const s of Object.values(g)) for (const f of Object.values(s)) img(f);

  const state = { gender: 'male', anim: 'walk', dir: 'S', playing: true, speed: 1, clock: 0, step: false };
  const buttons = (el, items, key, onChange) => {
    el.innerHTML = '';
    for (const [v, label] of items) {
      const b = document.createElement('button'); b.textContent = label; b.dataset.v = v;
      b.onclick = () => { state[key] = v; refresh(); if (onChange) onChange(); };
      el.appendChild(b);
    }
  };
  buttons($('gender'), [['male', 'Nam'], ['female', 'Nữ']], 'gender', buildLayers);
  buttons($('anim'), [['still', 'Đứng yên'], ['idle', 'Idle'], ['walk', 'Walk']], 'anim', () => { state.clock = 0; });
  const DIR_GRID = ['NW', 'N', 'NE', 'W', '', 'E', 'SW', 'S', 'SE'];
  for (const d of DIR_GRID) {
    const b = document.createElement('button'); b.textContent = d || '·'; b.dataset.v = d;
    if (!d) b.className = 'c'; else b.onclick = () => { state.dir = d; refresh(); };
    $('dirs').appendChild(b);
  }
  function refresh() {
    for (const [id, key] of [['gender', 'gender'], ['anim', 'anim'], ['dirs', 'dir']]) for (const b of $(id).children) b.classList.toggle('on', b.dataset.v === state[key]);
  }

  const layerOn = {};
  const GEAR = ['headwear', 'hair_ribbon', 'scarf', 'backpack', 'accessories', 'gloves'];
  function buildLayers() {
    $('layers').innerHTML = '';
    const have = new Set(Object.keys(D.animations.still.files[state.gender]));
    for (const s of D.slots) {
      if (!have.has(s)) continue;
      if (!(s in layerOn)) layerOn[s] = true;
      const l = document.createElement('label'); const c = document.createElement('input'); c.type = 'checkbox'; c.checked = layerOn[s];
      c.onchange = () => { layerOn[s] = c.checked; }; l.appendChild(c); l.appendChild(document.createTextNode(s)); $('layers').appendChild(l);
    }
  }
  buildLayers(); refresh();
  const setLayers = (fn) => { for (const s of Object.keys(layerOn)) layerOn[s] = fn(s); buildLayers(); };
  $('allOn').onclick = () => setLayers(() => true);
  $('gearOff').onclick = () => setLayers((s) => !GEAR.includes(s));
  $('play').onclick = () => { state.playing = !state.playing; $('play').textContent = state.playing ? 'Dừng' : 'Chạy'; };
  $('step').onclick = () => { state.playing = false; $('play').textContent = 'Chạy'; state.step = true; };
  $('speed').oninput = () => { state.speed = +$('speed').value; $('speedv').textContent = state.speed.toFixed(2) + '×'; };

  function frameAt(a, t) {
    const total = a.durations.reduce((x, y) => x + y, 0);
    let tt = t % total;
    for (let i = 0; i < a.durations.length; i++) { if (tt < a.durations[i]) return i; tt -= a.durations[i]; }
    return 0;
  }
  function drawChar(x0, y0, dir, frame) {
    const a = D.animations[state.anim];
    const files = a.files[state.gender];
    const di = D.directions.indexOf(dir);
    const sx = a.layout === 'columns=directions' ? di * CW : frame * CW;
    const sy = a.layout === 'columns=directions' ? 0 : di * CH;
    const useFull = $('full').checked;
    let missingFull = false;
    for (const s of D.render_order[dir]) {
      if (!files[s] || !layerOn[s]) continue;
      let f = files[s].visible;
      if (useFull) { if (files[s].full) f = files[s].full; else if (['base_body', 'hair', 'top', 'bottom'].includes(s)) missingFull = true; }
      const im = img(f); if (!im) continue;
      ctx.drawImage(im, sx, sy, CW, CH, x0, y0, CW, CH);
    }
    if ($('pivot').checked) {
      ctx.fillStyle = '#ff4d4d';
      ctx.fillRect(x0 + D.pivot.x - 2, y0 + D.pivot.y, 5, 1); ctx.fillRect(x0 + D.pivot.x, y0 + D.pivot.y - 2, 1, 5);
    }
    return missingFull;
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(100, now - last); last = now;
    const a = D.animations[state.anim];
    if (state.playing) state.clock += dt * state.speed;
    if (state.step) { state.clock += a.durations[frameAt(a, state.clock)] + 1; state.step = false; }
    const frame = a.frames > 1 ? frameAt(a, state.clock) : 0;
    const z = +$('zoom').value, all8 = $('all8').checked;
    const W = all8 ? CW * 8 + 8 * 7 : CW + 32, H = CH + 16;
    if (cv.width !== W * z || cv.height !== H * z) { cv.width = W * z; cv.height = H * z; }
    ctx.setTransform(z, 0, 0, z, 0, 0); ctx.imageSmoothingEnabled = false;
    const bg = $('bgsel').value;
    if (bg === 'checker') { for (let y = 0; y < H; y += 8) for (let x = 0; x < W; x += 8) { ctx.fillStyle = ((x + y) / 8) % 2 ? '#9aa0bb' : '#c9cce0'; ctx.fillRect(x, y, 8, 8); } }
    else { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); }
    let missing = false;
    if (all8) D.directions.forEach((d, i) => { missing = drawChar(i * (CW + 8), 8, d, frame) || missing; });
    else missing = drawChar(16, 8, state.dir, frame);
    const hidden = Object.keys(layerOn).filter((s) => !layerOn[s]);
    $('info').textContent = `${state.gender} · ${state.anim} · khung ${frame + 1}/${a.frames} · hướng ${all8 ? 'cả 8' : state.dir}` +
      (hidden.length ? `\nđang ẩn: ${hidden.join(', ')}` : '') + `\nthứ tự vẽ: ${D.render_order[state.dir].filter((s) => a.files[state.gender][s]).join(' › ')}`;
    $('note').textContent = (state.anim === 'walk' && hidden.length && $('full').checked)
      ? 'Walk chưa có lớp phần bị che: ẩn trang phục khi đang đi sẽ thấy khoảng trống.' : '';
    void missing;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
