# AV-TWWE — Art storage
Concept boards are archived as WebP quality 88, full original dimensions, with stable short names. Production pixel sprites and UI atlases require lossless WebP or PNG, transparent alpha and nearest-neighbor sampling; do not use lossy compression for pixel sprites by default. Source masters should be preserved separately. 

## Concept archive manifest
These files have been converted and saved to the project owner's ChatGPT Library /Aevoria/Concepts. Binary upload to GitHub is pending; this manifest is not a claim that the files are in Git.
| Intended repository path | Dimensions | Bytes | SHA-256 |
|---|---|---:|---|
| assets/concepts/art-direction-01.webp | 1448x1086 | 358688 | 16b749d0f86ba20f4cb513e218911e54dae16f5a8945f726eef460901258c62d |
| assets/concepts/starter-duo-01.webp | 1536x1024 | 380558 | 40dde14e2887b3d561f8a99f78ef5a9fdb91411efef96fefc0312e9423e7eac0 |
| assets/concepts/brand-assets-02.webp | 1536x1024 | 453252 | 282cf15264e67c4b185dc92b8299964e9e6cb6e3f86c5a2b603ccef55aa03a60 |
Original PNG total: 7990455 bytes. WebP total: 1192498 bytes. Latest art-direction board replaces egg creatures with Pebblit and Kettli. Its currency label is obsolete: Aevin is a capture item, not currency. Brand assets 02 corrects this. Starter Duo visual concept approved; Brand Assets 02 pending visual sign-off. These are reference boards, not production assets.

## White speck / background-halo QA (mandatory, owner rule 2026-11-26)
Sprites cut from a concept board or generated on a light background keep light pixels on the silhouette edge. In-game, on dark backgrounds, they show up as white specks. This defect had to be fixed twice on the Trainer V3 set, so the check is now part of the standard QA:
1. **Detect:** `python tools/asset-pipeline/check_master.py <sprites>` reports `halo N` per file and FAILS if N > 0. The rule lives in `tools/asset-pipeline/clean_halo.py` (`find_halo`). An edge pixel touching transparency is a speck if (A) saturation < 0.35 and it is lighter than its inner neighbours' mean by > 0.08, or (B) value > 0.62 and it is lighter than every inner neighbour by > 0.18.
2. **Fix:** `python tools/asset-pipeline/clean_halo.py --apply <sprites>` recolours specks to the nearest EXISTING dark outline colour of that sprite, so the palette never grows and the silhouette keeps its shape. It repeats until none are left and syncs the matching pixels in `assets/characters/trainer/full_src/`.
3. **Re-verify:** run check_master again (`halo 0`). For modular sprites, then run `separate_layers.py split` (16/16 pixel-exact), `separate_layers.py verify-full` (0 problems) and `animate.py idle`.
4. **Look:** review every sprite on a DARK background at 4x (the check_master review sheet is dark for this reason), not only on mid-grey or green.
5. Every new sprite, animation frame or import (Codex, ChatGPT or artist) must pass steps 1–4 before commit or before being shown to the owner as done.
