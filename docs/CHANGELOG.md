# AV-TWWE — Changelog
## Checkpoint 023 — Handoff to ChatGPT for sprite work (2026-11-26)
- Claude Code pauses sprite creation; HANDOFF now starts with a START HERE section for the next agent (female redraw brief, references, rules, delivery, QA).

## Checkpoint 022 — Female redraw brief (2026-11-26)
- D021: no more sprite drawing by Codex/Claude. Added an external brief for the female trainer redraw (direction master + walk, layer delivery, technical specs, acceptance checks) with a reference sheet.

## Checkpoint 021 — Trainer V3 viewer (2026-11-26)
- New offline viewer `tools/asset-pipeline/viewer_v3/` for the approved V3 layers, idle and walk: direction, speed, background, pivot, covered-area toggle, per-layer outfit test. Tested in a browser, no console errors.

## Checkpoint 020 — Transparent leg gaps (2026-11-26)
- carve_gaps.py: the enclosed board background between the legs is now transparent in the approved sprites and walk frames (693 px); labels, covered-area sources, layers, idle and walk rebuilt; all checks pass.

## Trainer direction and walk gap cleanup (2026-11-26)
- Recoloured 43 pixels in approved direction sprites and 120 in walk sources using existing palette colours. Covered-area sources were synced. Gap candidates dropped from 127 to 78 reviewed details. All 112 source images pass with halo 0, direction layers recombine 16/16, verify-full reports 0 problems, and idle and walk layers were rebuilt (walk 96/96 pixel-exact). Pending Claude Code review.

## Checkpoint 019 — Walk layers and flicker QA (2026-11-26)
- Walk label maps (96) corrected, walk split into 22 lossless layer atlases with metadata (96/96 pixel-exact). check_flicker.py added; 111 blinking specks removed; flicker QA made mandatory in art-pipeline.md and AGENTS.md.

## Checkpoint 018 — Walk 16 directions (2026-11-26)
- Male and female 6-frame walk cycles in 8 directions (96 frames), built on the approved sprites; 96/96 TECH-PASS, halo 0. Pending owner review; layer split comes next.

## Checkpoint 017 — Halo clean-up pass 2 (2026-11-26)
- 233 more light edge specks recoloured (broader detector), full_src synced, layers and idle rebuilt; all checks pass. Note: the male S walk pilot started from the pre-fix sprite.

## Checkpoint 016 — GATE 04 idle (2026-11-26)
- GATE 03 approved (D020). animate.py builds a 4-frame waist-squash idle for every layer, 8 directions, both genders; previews and GIFs are in metadata/. Walk pilot assigned to Codex.

## Checkpoint 015 — Male side-view backpack (2026-11-26)
- Added the missing bedroll backpack to the male W/E direction sprites and labels; layers re-split; 16/16 TECH-PASS, pixel-exact, verify-full 0 problems.

## Checkpoint 014 — GATE 03 phase 2 covered-area layers (2026-11-26)
- separate_layers.py export-full/verify-full; Codex painted the covered areas for base_body, hair, top and bottom (38,337 px), with 0 verification problems and the approved composite unchanged. Skin-swap test previews added. Pending owner review.

## Checkpoint 013 — Halo clean-up (2026-11-26)
- Removed light background-halo edge pixels (white specks), mainly on the male sprites: 163 px recoloured to existing outline colours. Sprites, previews and layers regenerated; 16/16 TECH-PASS and pixel-exact.

## Checkpoint 012 — GATE 03 phase 1 layers (2026-11-26)
- 16 corrected label maps (Codex gpt-6.2-sol); 22 visible-pixel layer atlases with metadata; 16/16 pixel-exact recombination, lossless. Pending owner review.

## Checkpoint 011 — GATE 02 approved, GATE 03 tooling (2026-11-25)
- Owner approved the GATE 02 direction sprites (D019). Added separate_layers.py (label maps, split, pixel-exact recombination, lossless layer atlases, metadata) and first-pass label maps; label correction is assigned to Codex (ART-003-G03).

## Checkpoint 010 — GATE 02 female whole-sprite set (2026-11-25)
- Female sprites regenerated as whole figures (rounds 4–5), with no patch overlap, the ponytail on her right in all 8 directions and NE restyled to match. 16/16 TECH-PASS, pending owner approval.

## Checkpoint 009 — GATE 02 clean-up candidate (2026-11-25)
- Codex clean-up of 16 direction sprites (ponytail side fixed, details sharpened), 16/16 TECH-PASS, pending owner review; known: female N/NE fragmented bow pixels, SW notch.

## Checkpoint 008 — GATE 02 draft extract (2026-11-25)
- 16 draft 64x96 direction sprites extracted from the approved V3 board (processing only), 16/16 technical PASS, 1x/4x previews. Pending owner review; female ponytail fix outstanding.

## Checkpoint 007 — Final V3 direction reference (2026-11-25)
- trainer-master-v3.webp replaced by the owner's final 8-direction board (SHA-256 b6fbbd9e…be50). Direction check: male OK, female ponytail side flips. GATE 02 task ART-003-G02 created.

## Checkpoint 006 — Trainer Master V3 reference in Git (2026-11-25)
- assets/concepts/trainer-master-v3.webp imported, SHA-256 verified against ART-003-V3-APPROVAL.md (fed477a). Option A = baseline. GATE 02 images assigned to ChatGPT (no image generation in Claude Code).

## Checkpoint 005 — Asset pipeline; trainer art reset to gates (2026-11-25)
- 8745215 asset pipeline: depth-masked modular layer compositor, per-direction render order, anchors (hand_item, seat, saddle, rider_offset, collision), mount front/rear split, atlas packing, lossless WebP converter (pixel-exact check), offline Asset Viewer, GATE 01 master checker.
- Procedural trainer sprites (two proportion passes) rejected by owner; removed from Git scope, kept regenerable in build/ only. Decisions D016/D017.
- New tasks: ART-003-G01 (character master gate), ART-003-spec (full owner requirements). ART-003-B01 on hold.

## Checkpoint 004 — Shared AI handoff (2026-11-25)
- Shared agent rules, Claude instructions, decision log, asset registry and task ART-003-B01 created.
- Concept reference binary uploads remain pending; no production trainer, viewer or playable build claimed.
- Task branch feature/modular-trainer planned for implementation.

## Checkpoint 003 — Starter duo and brand concepts
- 2207530 starter duo visual approval documented; 9d1831d brand brief; 4ce172d WebP pipeline.
- Three concept boards archived in owner Library, not Git. Brand assets 02 pending visual sign-off.

## Checkpoint 002 — Aspect baseline 0.2
- 12 aspects, 12 SVG glyphs, complete matchup data and test source. 1,014 matchups checked against retrieved JSON; Node/engine execution not verified.
- d588761 latest aspect integration/test correction.

## Checkpoint 001 — Design baseline 0.1
- 632fa05 README; 41d583c world; 3f524ab balance; 66fe0c0 roadmap.
