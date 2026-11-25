# ART-003 — Modular Trainer & Animation Asset Production (owner requirements)
Recorded 2026-11-25 from the owner's brief so any agent can continue without chat history. Task files: ART-003-G01 (active), ART-003-B01 (pipeline proof, art rejected).

## Project
Aevoria — A World Without End (AV-TWWE). Offline monster-taming action RPG + life RPG; mobile first, PC. Companions = Kin; capture item = Aevin. Claude Code = art director/technical lead (specs, integration); Codex = implementation, assets, tools, QA. Goal: a production asset system usable in-engine and extendable for years, not just pretty concepts.

## Art direction
Premium 2D pixel art; top-down, slightly tilted camera with depth. Animation/scale readability inspired by classic handheld dungeon-crawler monster games, but every character and asset original. Fantasy + ancient technology, grand nature, bright colours. Crisp pixels, no blur, no smoothing anti-aliasing, silhouettes readable on phones. Approved concept trainers are the main reference.

**Owner revisions (2026-11-25, supersede the original 2.5–3-head chibi target):** ~3–3.5 heads; arms and legs long enough to read, never stick-thin; torso with volume, natural shoulders/hips; cute but not childish. Principles from Eastward (pixel/light/colour), Stardew Valley (limb/torso proportion), Octopath Traveler II (costume detail), Witchbrook (natural posture/expression) — never copy assets. Selective outlining, pixel clusters, harmonious palette, depth lighting; no thick black outline around everything. Character masters must come from real image generation + pixel editing; scripts only process, split, align, pack and test. If image generation is unavailable, report it — do not produce placeholders as design.

Character identity: Male — messy natural brown hair, aviator goggles on head, red scarf, explorer outfit in cream/brown/blue, bright youthful face. Female — silver/white hair tied to the side with a blue ribbon, goggles on head, blue eyes, cream/blue/gold outfit, a distinct design (not the male with new hair).

## Production gates (owner approval between each)
1. **GATE 01 Character master** — 3 options per gender, 3/4 front, test 48x64 / 64x80 / 64x96, show 1x and 4x. Wait for approval.
2. **GATE 02 Direction master** — 8 consistent directions of the approved design.
3. **GATE 03 Modular separation** — split body, face, hair, clothes, shoes, scarf, goggles, accessories; recombined result must match the master with no quality loss.
4. **GATE 04 Animation** — idle, walk, run, faint, bond, ride, swim, fly, then the rest.

## Modular character system (mandatory)
Never draw hair, body, outfit, accessories and mount as one sprite. Layers: base body, skin tone, eyes/face, hair back, hair front, top, bottom, shoes, gloves, headwear (goggles), scarf/cape, backpack, accessories, Aevin/held item, mount rear, mount front, effects, shadow. Shared canvas, coordinates, pivot, direction ID, animation ID, frame ID and timing. Render order defined per direction and state (hair, cape, arms, mount may change order when facing away/sideways). Two body presets (male/female) sharing rig, slots and animation conventions; unisex outfits where the body fits. Adding a skin = drawing the outfit layers for the defined animation set only — no body/face/mount redraw, no gameplay code change. A static garment never fits every pose automatically: use pose templates, a deformation rig or matching frames per animation.

## 8 directions
Fixed order: 1 S, 2 SW, 3 W, 4 NW, 5 N, 6 NE, 7 E, 8 SE — same in every animation. Asymmetric details (hair parting, bag, Aevin hand, straps, logos) must not flip wrongly; mirroring allowed only where it stays correct.

## Animation library
P0: idle, walk, run, turn, interact, hurt, faint, recover, bond_prepare, bond_activate, bond_success, bond_fail.
P1: mount_enter, mount_exit, ride_idle, ride_walk, ride_run, ride_turn, swim_idle, swim_move, water_ride_idle, water_ride_move, fly_idle, fly_move, fly_takeoff, fly_landing.
P2: sit, sleep, fishing, wave, happy, laugh, angry, surprised, sad, dance, give_gift.
All 8 directions; declare legitimate frame reuse. Trial frame counts: idle 4, walk 6, run 6–8, hurt 3–4, faint 5–6, recover 5–6, bond 6–10, ride 6–8, swim 6–8, fly 6–8 (adjust after motion review).

## Mounts
Rider and mount sprites are always separate. Per mount, per direction and frame: saddle_anchor, rider_anchor, rider_offset, rider_scale, mount_direction, animation_sync, front_occlusion_layer, rear_occlusion_layer, shadow_anchor, collision_bounds — rider moves in sync (no sliding, floating or sinking). Types: ground, aquatic, flying. Neutral reusable ride pose + per-Kin overrides. The trainer keeps the equipped skin while riding, swimming and flying.

## Bond (capture) animation
Flow: wild Kin KO → player targets it → trainer raises Aevin from the hand → resonance energy → rune ring around the Kin → success or fail. No throwing. Aevin = stylised "A"/triangle with glowing crystal core. Trainer frames expose hand_item_anchor; Aevin, light, rune circle and particles are separate assets; never bake magic into trainer sprites; Aevin types swap without redrawing.

## Faint
Lose balance → collapse → lie unconscious → hold → recover and stand. Every layer (hair, clothes, accessories, gear) follows the pose. No gore.

## Technical asset standard
32x32 world tile; trainer frame 64x64 trial (now re-tested at 48x64/64x80/64x96 in GATE 01); mount frame 96–256 px; expanded canvas where needed; transparent; pixel-perfect; nearest-neighbour; no interpolation. Lossless WebP for sprites/atlases (never lossy for pixel art); WebP Q88 for concept/portrait; PNG as intermediate; SVG for logo/icon; JSON metadata. Atlases + metadata to reduce requests. Do not change character scale between animations.

## Folders
assets/characters/trainer/{base,hair,face,outfits,accessories,poses,atlases,metadata}, assets/kin, assets/mounts/{ground,aquatic,flying}, assets/items/aevin, assets/effects/{bond,movement}, assets/concepts, tools/asset-pipeline, tests/assets, docs. English lowercase file names; stable asset IDs independent of file names (save-game safe); gameplay never hardcodes image file names.

## Tools and viewer (Codex)
Checks: frame count, 8-direction coverage, canvas size, transparency, anchors/pivots, metadata. Automatic layer composition, atlas export, lossless WebP conversion; previews for animation, skin swap, riding, faint, Bond. Offline browser Asset Viewer: body male/female, hair, skin, outfit, direction, animation, speed, per-layer toggle, pivot/anchor display, mount selection, front/rear occlusion check. It must actually run.

## Batch plan (after gates)
Batch 01 proof: 1 male, 1 female, 2 hairstyles, 2 outfits, idle+walk 8 directions, 1 Aevin, 1 test mount, 1 Bond test, 1 Faint test, metadata + viewer. Batch 02: all P0 + more outfits, test every combination. Batch 03: ground riding, swimming, flying and transitions. Batch 04: life, dating and emotes.

## GitHub and reporting
Branch feature/modular-trainer; GitHub Free and local tools; no paid services; no cache/temp/duplicate data in Git; no merge to main without owner approval; no assets from Pokémon, Ragnarok, Xenoblade or any commercial game. Never pretend sprites exist or report PASS for placeholders. After each batch report: asset list, direct previews, frame/direction counts, size before/after compression, test results, open defects, commit SHA, next work.
