# AV-TWWE — Current handoff
Checkpoint 005 | 2026-11-25 | Pre-production
Active branch: **feature/modular-trainer** (read this file on that branch, not main). Last implementation commit: 8745215 (asset pipeline). Handoff/docs commit follows it; use `git log -1` + `git ls-remote origin` for the real head.
Active task: **ART-003-G04 — Trainer Animation (GATE 04)**, docs/tasks/ART-003-G04.md. Full owner requirements: docs/tasks/ART-003-spec.md. ART-003-B01 is ON HOLD.

## Trainer gap cleanup for Claude Code review (2026-11-26)
- Codex recoloured light gap pixels in approved male S/N/SE and female S sprites under `assets/concepts/trainer-gate02/` (43 px). Walk sources under `assets/characters/trainer/anim_src/walk/` changed in those directions and female NW (120 px in 23 PNGs, including 43 px in the matching f0 files). The male N patch covers the full visible streak, including clustered pixels the detector missed.
- The existing `clean_halo.sync_layers` helper synced 9 matching pixels in `assets/characters/trainer/full_src/`. All 16 approved/f0 pairs match byte for byte. The source alpha and label-map bytes were verified. Every replacement uses a colour from the corresponding source palette.
- `check_gaps.py` flagged 127 candidates before and 78 after. The remaining marks follow cuffs, knees, socks or garment hems. The script exits 1 whenever it lists candidates. `check_master.py` returned 112/112 TECH-PASS with halo 0. Split and verify-full returned 16/16 pixel-exact and 0 problems. Idle rebuilt 30 variants and walk-split returned 96/96 pixel-exact across 22 variants. The supplementary flicker scan dropped from 152 to 151 candidates with zero new coordinates.
- Rebuilt layer outputs are in `layers_v3/`, `anim_v3/{idle,walk}/` and `metadata/`. Before/after images, frame sheets, logs and changed asset paths are local to `build/codex-gaps/`.
- Claude Code reviewed the result (before/after `assets/concepts/trainer-gate02/gap_fix_m_n_se_before_after.png`), re-ran every check (all pass) and committed. Owner review of the cleanup is pending.
- 2026-11-26: the owner saw colour still filling the space between the legs. `carve_gaps.py` made those enclosed gaps transparent (693 px over sprites and walk, both genders); labels and full_src updated; all checks pass (112/112 TECH-PASS, split 16/16, verify-full 0, walk 96/96, f0 equal). Before/after: `assets/concepts/trainer-gate02/carve_fix_m_n_s_se_4x.png`.
- Tooling decision pending (owner asked 2026-11-26 whether to keep using Codex for sprite drawing; it is expensive and error-prone). Claude recommends a pixel-art–specific tool (e.g. PixelLab) or a hired pixel artist for frames, with Claude Code/Codex limited to import, QA, layers and packing. Walk covered-area layers are tracked separately.

## Update 2026-11-25 — Trainer Master V3 final reference (GATE 02 active)
- Authoritative reference: `assets/concepts/trainer-master-v3.webp` = final "Character Concept & 8 Directions" board, 1536x1024, 288,542 B, SHA-256 b6fbbd9efa7d6217354b0f2f577a255be7e80c4d89bd831984c8c0d3fa58be50 (verified). Replaces all older trainer references (3-option board c4deb594… only in history at ae0636f). Option A design.
- Direction check (docs/tasks/ART-003-G02.md): male consistent in all 8 directions; **female side ponytail/bow flips** (S unclear, SW and NE mirrored, N centred). Owner decision: fix it in the GATE 02 sprites, not on the board. The tie stays on her right side in every direction; never mirror her hair, bow or straps.
- Board is concept art, not 64x96 sprites. GATE 02 sprite set (16 PNG, 64x96) is still to be made by ChatGPT or an artist; Claude Code has no image generation. Animation is blocked until the GATE 02 sprites are owner-approved and GATE 03 separation is done.
- Draft Direction Master exists: `assets/concepts/trainer-gate02/draft-extract/` — 16 sprites (64x96) extracted from the approved board by image processing (`extract_board.py`), 16/16 TECH-PASS, previews `preview_1x.png`/`preview_4x.png`. **Look and proportions approved by owner (D018).** Hand clean-up pending: female ponytail side wrong in S/SW/N/NE; some details softened.
- Clean-up candidate: Codex (codex-cli run by Claude Code) wrote `assets/concepts/trainer-gate02/trainer_{m,f}_{dir}_64x96.png` + PROVENANCE.md; previews `preview_1x.png` / `preview_4x.png`. Male = cleaned draft. Female = round 4 whole-sprite regeneration, because the owner rejected the patched version for overlapping sprite pieces. 16/16 TECH-PASS. Claude review: ponytail on her right side in all 8, one hair mass each; female NE restyled in round 5 to match NW/N; no known defects. Codex hit its usage limit at the end of round 5 (resets 18:52 local time). Codex has falsely reported "no defects" before, so always verify its claims visually.
- **GATE 02 approved by owner (D019, d638f5e).** Active gate: **GATE 03 modular separation**, see docs/tasks/ART-003-G03.md. `tools/asset-pipeline/separate_layers.py` is verified: 16/16 pixel-exact recombination and lossless WebP round trip. The auto-generated label maps in `assets/characters/trainer/labels/` are a rough first pass (faces, goggles and leather mislabelled); no layer atlases are committed yet.
- GATE 03 phase 1 done (pending owner review): label maps corrected by Codex gpt-6.2-sol; `assets/characters/trainer/layers_v3/{male,female}/*.webp` + `metadata/trainer_v3_layers.json`; 16/16 pixel-exact; previews `metadata/labels_overlay_3x.png`, `metadata/layers_exploded_se_3x.png`.
- 2026-11-26: the owner accepted the female layers and reported white specks on the male. These were background-halo edge pixels; fixed with `clean_halo.py` (163 px, palette-snapped), the GATE 02 sprites updated and the layers re-split (still 16/16 pixel-exact).
- GATE 03 phase 2 done (pending owner review): `*_full` layers for base_body/hair/top/bottom; verify-full 0 problems; skin-swap test images are in `assets/characters/trainer/metadata/`.
- 2026-11-26: the owner reported the missing backpack in male W/E; Codex added it (+159/+164 px), all checks pass.
- Owner approved GATE 03 and started GATE 04 (2026-11-26). Idle is built by `tools/asset-pipeline/animate.py idle` (4 frames, all layers; pending review). Walk pilot (male S, 6 frames) assigned to Codex; see docs/tasks/ART-003-G04.md.
- Walk v2 (male S + E) delivered after owner motion feedback: `assets/characters/trainer/anim_src/walk/male/`, all checks pass, pending owner review. The owner's motion reference is a commercial sprite sheet: it is kept only in `build/motion-ref/` (not in Git) and is never traced.
- Walk for all 16 directions delivered (96 frames, 96/96 TECH-PASS, halo 0), pending owner review; previews are in `assets/characters/trainer/anim_src/walk/`.
- Walk layers done: labels corrected, 96/96 pixel-exact, atlases in `anim_v3/walk/`; flicker specks cleaned (check_flicker.py is now mandatory for animations). Remaining for walk: per-frame covered-area layers.
- Next action: owner reviews the idle GIFs and the walk set; then walk for all 16 directions, labelled and split like GATE 03. Codex runs via `%LOCALAPPDATA%/OpenAI/Codex/bin/<hash>/codex.exe exec -m gpt-6.2-sol -s workspace-write`; tell it to use `C:\Program Files\Python38\python.exe`, which has Pillow.

## White-speck QA (mandatory)
The owner reported white specks twice. Every sprite/frame must pass `check_master.py` (halo 0) and a dark-background review before commit; procedure in docs/art-pipeline.md.

## Owner verdict this session (binding — D016, D017)
- The procedural trainer sprites Claude Code generated with scripts are **NOT approved artistically** (v1 too chibi/bobblehead; v2 too thin, long and stiff). Do not reuse them as a design base. They are not in Git.
- Stop bulk animation. Work in gates with owner approval each time: GATE 01 character master → GATE 02 eight directions → GATE 03 modular separation → GATE 04 animation.
- Character masters must come from real image generation + pixel editing. Scripts may only process, split, align, pack and test.
- Target: ~3–3.5 heads, readable limbs (not stick-thin), real torso, cute not childish; premium pixel art with selective outlines and depth lighting. Identity: male messy brown hair + goggles + red scarf + cream/brown/blue explorer outfit; female silver/white side tie with blue ribbon + goggles + blue eyes + cream/blue/gold outfit, distinct design.

## Done (with evidence)
- 8745215 `tools/asset-pipeline/`: modular layer compositor with shared body depth masks (layers stay correct when swapped), per-direction render order + held-item/mount rules, anchors (hand_item_anchor, seat_anchor, saddle_anchor, rider_offset, rider_scale, shadow_anchor, collision_bounds, animation_sync), mount front/rear occlusion split, frame reuse (faint_hold), shelf atlas packing, metadata schema, offline Asset Viewer, `convert_webp.py`, `check_master.py`. See tools/asset-pipeline/README.md.
- Actually run on this machine (Windows, Node 24.22.1, Python 3.8.10, Pillow 10.4.0):
  - `node tools/asset-pipeline/build.mjs` → 48 prototype atlases (43 trainer layer variants, 10 animations × 8 directions, mount, Aevin, Bond FX) in ~4–5 s, written to build/ only.
  - `python tools/asset-pipeline/convert_webp.py` → all 48 VP8L lossless, pixel-exact round-trip TRUE; 1,593,953 B PNG → 779,820 B WebP (48.9 %).
  - Asset Viewer opened at http://localhost:8765/tools/asset-pipeline/viewer/ in a browser: character/skin/hair/outfit switching, directions, animation, mount (ride_walk) composited with anchors. Pipeline works; art rejected.
  - `check_master.py` smoke test: synthetic 48x64 transparent image TECH-PASS, 50x50 opaque image TECH-FAIL (exit 1). No real masters exist yet.
- Docs: ART-003-spec.md (owner brief saved), ART-003-G01.md (task + image prompt), DECISIONS D016/D017, registry, changelog.

## Blocked / limits
- **No image-generation tool in this Claude Code environment.** GATE 01 cannot be produced here. Claude did not create placeholder masters.
- Approved trainer concept `assets/concepts/art-direction-01.webp` is still not in Git (owner Library only). Owner must provide the exact file; verify SHA-256 from ASSET_REGISTRY before use. Images A/B mentioned in the owner's message were not visible to Claude in this session.
- Not done: no approved sprite, no GATE 02–04, no P1 swim/fly, no engine. No CI.

## Next concrete action
1. Owner: upload `art-direction-01.webp` (and any trainer concept close-ups) to `assets/concepts/` on this branch, or attach them to the agent doing GATE 01.
2. ChatGPT (image tool) or Codex with image generation: execute docs/tasks/ART-003-G01.md — 3 male + 3 female options, 3/4 front, 64x80 first (also try 48x64/64x96), nearest-neighbour downscale + hand pixel clean-up, PROVENANCE.md, then `python tools/asset-pipeline/check_master.py assets/concepts/trainer-gate01/*.png` and show `build/asset-pipeline/qa/gate01_review.png` (1x + 4x) to the owner.
3. Owner picks one option per gender → record in DECISIONS → GATE 02.
4. Claude Code (tech lead) after GATE 02/03 approval: point the pipeline/viewer at the split layers of the approved master; adjust canvas (64x80 or chosen size) in metadata.

## Resume / reproduce on another machine
```
git fetch origin
git switch feature/modular-trainer
git pull --ff-only
node tools/asset-pipeline/build.mjs          # prototype contract test, output in build/
python tools/asset-pipeline/convert_webp.py
python -m http.server 8765                   # open http://localhost:8765/tools/asset-pipeline/viewer/
node tests/aspects.test.mjs                  # existing aspect test
```
Preserve local changes; never force push; never merge main without owner approval.
