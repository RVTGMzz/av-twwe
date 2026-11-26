You are Codex on Aevoria (repo = current directory, branch feature/modular-trainer). Claude Code is tech lead and will review and commit. NO git commands. Use "C:\Program Files\Python38\python.exe" for Python (it has Pillow; do not install packages).

Task: ART-003-G03 phase 2 — paint the COVERED areas of the trainer layers so outfits/gear can be swapped. Read docs/tasks/ART-003-G03.md first.

Edit ONLY these 64 files: assets/characters/trainer/full_src/{male,female}/{base_body,hair,top,bottom}_{s,sw,w,nw,n,ne,e,se}.png (64x96 RGBA). They currently equal the phase-1 visible-pixel layers. Scratch files go in build/codex-g03p2/.

Rules (checked by the validator, which fails on any violation):
- Never change an existing opaque pixel of these files. Only ADD pixels.
- Only add pixels where a layer drawn LATER in the render order already covers that spot (render order is in assets/characters/trainer/metadata/trainer_v3_layers.json; the other layers are the atlases in assets/characters/trainer/layers_v3/{male,female}/*.webp, each 512x96 with directions S,SW,W,NW,N,NE,E,SE in 64 px cells). So the approved composite never changes.
- Hard alpha only (0 or 255). Reuse the colours already used in that layer (same ramps, same selective outline style); add at most a few shades.

What to paint:
1. base_body: a complete body under all clothes and gear, following the sprite's own silhouette: skin on neck, arms, hands and legs; a plain fitted neutral undergarment (simple light grey top and shorts, use colours from the existing skin/outline ramps plus one grey ramp) on the torso and hips; simple bare feet or dark socks under the boots. No anatomy detail, keep it modest and clean.
2. hair: the hair continues under the goggles (headwear) and under the female ribbon, so removing goggles shows a natural hairline. Keep the same hair shapes and shading.
3. top: shirt/jacket continues under the scarf, belt/pouches (accessories), gloves cuffs, and (back views) under the backpack straps.
4. bottom: shorts/skirt continue under the jacket hem, belt/pouches and boot tops.
Keep male and female designs exactly as approved; this is completion of hidden areas, not a redesign.

Verify: run "C:\Program Files\Python38\python.exe" tools/asset-pipeline/separate_layers.py verify-full until it prints "problems 0". Then LOOK at build/asset-pipeline/qa/gate03/skin_swap_test_2x.png (per gender: four 8-direction groups = body only | body+bottom+top | +shoes+hair without goggles/ribbon/scarf/gear | full approved sprite) and fix anything that looks broken, holey or off-model. Final message: added pixel counts per slot and gender, the verify-full result, and honest notes on any area that still looks weak.
