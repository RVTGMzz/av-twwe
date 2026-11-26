You are Codex on Aevoria (repo = current directory, branch feature/modular-trainer). Claude Code is tech lead and will review and commit. NO git commands. Edit ONLY assets/characters/trainer/labels/*.png and scratch files under build/codex-g03/.

Task: docs/tasks/ART-003-G03.md, section "Codex task" step 1-3 (Phase 2 is NOT part of this run). Read that file first.

Correct the 16 label maps assets/characters/trainer/labels/trainer_{m,f}_{s,sw,w,nw,n,ne,e,se}_labels.png. They are 64x96 indexed PNGs (palette index = layer, see the table in ART-003-G03.md); the current content is a poor automatic first pass. The approved sprites they describe are assets/concepts/trainer-gate02/trainer_{m,f}_{dir}_64x96.png. NEVER modify the sprites. Keep the label maps indexed with the same palette (Pillow 'P' mode, index 0 transparent).

Rules: every opaque sprite pixel gets exactly one label and transparent pixels get 0; outline pixels belong to the part they outline; goggles (lenses, frame, strap) = headwear (5); female bow = hair_ribbon (4); eyes, brows, mouth, blush = face (2); visible skin (cheeks, neck, ears, knees) = base_body (1); hair incl. ponytail = hair (3); scarf = 6; shirt/jacket/sleeves = top (7); shorts/skirt/socks = bottom (8); gloved hands = gloves (9); belt, pouches, chest straps = accessories (10); male bedroll pack + its shoulder straps = backpack (11); boots = shoes (12).

Work method: look at each sprite enlarged (8x or more, you may render grids/crops in build/codex-g03/), decide part boundaries visually, and write the labels with Python + Pillow (region painting, flood fills bounded by the sprite's own outlines, per-pixel fixes). Be efficient: one script that defines regions per sprite is fine.

Verify: run python tools/asset-pipeline/separate_layers.py split (must print 16/16 pixel-exact), then LOOK at build/asset-pipeline/qa/gate03/labels_overlay_3x.png and fix any label that crosses a part boundary. Final message: per sprite, one line on remaining doubtful areas (or "clean"), plus the split result. Do not claim clean if you did not check the overlay.
