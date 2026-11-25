# AV-TWWE — Changelog
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
