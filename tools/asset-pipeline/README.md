# tools/asset-pipeline

Processing, packing and QA for Aevoria sprites. **Scripts here must not be the method for designing characters** (owner rule, 2026-11-25). Character art comes from approved masters (docs/tasks/ART-003-G01.md).

Requirements: Node 18+ (no npm packages), Python 3.8+ with Pillow (WebP support).

| Tool | Purpose | Status |
|---|---|---|
| `check_master.py` | sprite checks (canvas 48x64/64x80/64x96, transparent bg, hard alpha, ≤48 colours, stray pixels, **no white specks/halo**) + 1x/4x review sheet on a dark background | active, mandatory before commit |
| `clean_halo.py` | detect/fix light edge specks (`--apply`), palette-safe, syncs full_src | active |
| `check_flicker.py` | animation check: bright specks appearing only in some frames (blinking white dots), marked sheets on a dark background | active, mandatory for animations |
| `separate_layers.py` | GATE 03 label maps, split, pixel-exact recombination, covered-area verify | active |
| `animate.py` | GATE 04: idle from layers; walk-label (propagate labels from f0) and walk-split (pixel-exact layer atlases) | active |
| `extract_board.py` | cut direction figures from an approved board | used for GATE 02 draft |
| `convert_webp.py` | PNG atlases → lossless WebP (`VP8L`), pixel-exact round-trip proof, size report | active, reused in GATE 03–04 |
| `lib/raster.mjs`, `lib/png.mjs` | depth-masked layer compositing, outline pass, shelf atlas packing, PNG codec | active |
| `build.mjs`, `lib/trainer.mjs`, `lib/mount.mjs`, `lib/props.mjs` | **prototype rig** that proved the modular contract: slots, per-direction render order, anchors (hand_item, seat, saddle, rider_offset, collision), mount front/rear split, reuse (faint_hold), atlas layout, metadata schema | art REJECTED; output goes only to `build/` (gitignored) |
| `viewer/` | offline Asset Viewer (body, skin, hair, outfit, direction, animation, speed, layer toggles, pivot/anchors, mount + occlusion tint, Bond and Faint sequences) | works with the prototype data; will be pointed at approved atlases in GATE 03 |

## Reproduce the prototype (pipeline test only, not art)
```
node tools/asset-pipeline/build.mjs
python tools/asset-pipeline/convert_webp.py
python -m http.server 8765        # then open http://localhost:8765/tools/asset-pipeline/viewer/
```
The viewer also opens directly from file:// after `build.mjs` generates `viewer/data.js`.
QA previews of the rejected prototype: `cd tests/assets && python make_previews.py && python make_lineup.py` → `build/asset-pipeline/qa/`.
