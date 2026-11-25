# ART-003-G02 final direction-master provenance

Date: 2026-11-25  
Approved design reference: `../trainer-master-v3.webp`  
Scale/reference geometry: `draft-extract/trainer_f_{s,sw,w,nw,n,ne,e,se}_64x96.png`

## Final source decision

The eight final female files are **whole regenerated sprites**, not patches. No pixels from the rejected composite female files were retained, and no hair, bow, body, limb, clothing, or accessory region was pasted onto an older sprite.

- S, SW, W, NW, N, E, and SE use the complete coherent figures from `build/codex-g02/generated-reference/trainer_f_*_generated_64x96.png`.
- NE was regenerated as one complete figure with OpenAI's built-in image-generation tool because the coherent-set NE put the ponytail on the wrong side. A later style-match review rejected the first corrected-side NE as too sharp, narrow, saturated, and thin compared with NW/N. The final accepted full-resolution source is `build/codex-g02/generated-reference/trainer_f_ne_round5_whole_source.png`.
- The eight male files were not modified in this whole-female replacement pass. SHA-256 comparison before and after the write reported `MALE-HASH-PASS 8/8 unchanged`.
- The final NE-only replacement also hash-checked every other sprite: `UNCHANGED-HASH-PASS 15/15 non-NE sprites unchanged`.

## Image-generation prompt for accepted NE source

> Use case: precise-object-edit  
> Asset type: one standalone 64x96-style Aevoria female trainer direction sprite  
> Input images: Image 1 is the approved female NW sprite and Image 2 is the approved female N sprite; they are the STRICT style, palette, scale, anatomy, outline, and pixel-density references. Image 3 is the rejected NE sprite and is only a pose-placement warning--do not copy its narrow head, thin body, sharp black outline, saturated blue, or small boots.  
> Primary request: Regenerate the ENTIRE NE sprite as one new coherent whole figure. It is a 3/4-back view facing up-right/screen-right: show the broad back of the head, the back/right side of the torso, and only a little cheek and ear at screen-right. A brown goggles strap and part of the goggles are visible.  
> Style match: make it look drawn by exactly the same artist as Images 1 and 2. Use their large rounded head and generous silver-white hair volume, their broad torso, chunky legs and boots, muted blue, cream and brown palette, soft gray-brown selective outlines, softened downsampled pixel clusters, and identical chibi proportions. Avoid crisp high-resolution rendering, hard black edging, thin limbs, tiny head, saturated blue, or extra detail.  
> Hair geometry: exactly one continuous hair mass, one blue bow, and one ponytail. The ponytail and bow are on HER RIGHT, therefore attached on SCREEN-RIGHT in this NE view. The ponytail hangs behind the screen-right side of the head/shoulder. No ponytail or bow on screen-left.  
> Composition: full body, upright, centred, transparent canvas, same apparent height and centre as Images 1 and 2, feet fully visible with margin.  
> Constraints: one whole sprite only; no mirroring; no regional patching; no doubled hair, limbs, clothing or accessories; no stray fragments; no shadow, glow, halo, scenery, text or watermark; genuinely transparent background.

Earlier NE generation attempts are not used. One remained side/front-facing with the tail on screen-left; the next corrected the direction but did not match the softer NW/N proportions and rendering.

## Whole-sprite processing

Python 3 and Pillow performed only whole-figure processing:

1. Hardened alpha to 0 or 255 and discarded the transparent generation glow/halo.
2. Cropped each complete generated figure as a single unit.
3. For final NE only, reduced the complete full-resolution figure to 41x90 px with nearest-neighbour sampling; no part was processed separately. This exactly matches N's occupied width and NW/N's 90 px height.
4. Placed each complete figure, as one unit, on a transparent 64x96 canvas, horizontally centred with the last opaque foot row at y=93 (two transparent rows below).
5. Globally mapped final NE to a shared 48-colour palette derived from the approved NW and N sprites, with dithering disabled. The resulting NE uses 44 colours.
6. Removed only disconnected 1-4 px generation fragments and four-neighbour-isolated pixels.

No manual repainting, mirroring, regional compositing, or old-sprite patching was performed.

## Per-file record

| File | Whole-figure source | Final processing |
|---|---|---|
| `trainer_f_s_64x96.png` | `trainer_f_s_generated_64x96.png` | Complete generated S figure; hard alpha, whole-sprite centring/foot alignment, global 48-colour reduction. Ponytail: screen-left. |
| `trainer_f_sw_64x96.png` | `trainer_f_sw_generated_64x96.png` | Complete generated SW figure; same whole-sprite processing. Ponytail: screen-left/back. |
| `trainer_f_w_64x96.png` | `trainer_f_w_generated_64x96.png` | Complete generated W figure; same whole-sprite processing. Ponytail: behind the head. |
| `trainer_f_nw_64x96.png` | `trainer_f_nw_generated_64x96.png` | Complete generated NW figure; same whole-sprite processing. Ponytail: screen-right. |
| `trainer_f_n_64x96.png` | `trainer_f_n_generated_64x96.png` | Complete generated N figure; same whole-sprite processing. Ponytail: off-centre screen-right. |
| `trainer_f_ne_64x96.png` | `trainer_f_ne_round5_whole_source.png` | **Entire NE figure regenerated** to match NW/N, then reduced as one 41x90 px figure, centred at x=31.5, and globally mapped to the shared NW/N palette. Ponytail: screen-right. |
| `trainer_f_e_64x96.png` | `trainer_f_e_generated_64x96.png` | Complete generated E figure; same whole-sprite processing. Ponytail: behind the head. |
| `trainer_f_se_64x96.png` | `trainer_f_se_generated_64x96.png` | Complete generated SE figure; same whole-sprite processing. Ponytail: screen-left. |

Final visual QA lineup: `build/codex-g02/female_final_8x.png`.
