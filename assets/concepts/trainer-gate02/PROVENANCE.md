# ART-003-G02 final direction-master provenance

Date: 2026-11-25  
Approved design reference: `../trainer-master-v3.webp`  
Scale/reference geometry: `draft-extract/trainer_f_{s,sw,w,nw,n,ne,e,se}_64x96.png`

## Final source decision

The eight final female files are **whole regenerated sprites**, not patches. No pixels from the rejected composite female files were retained, and no hair, bow, body, limb, clothing, or accessory region was pasted onto an older sprite.

- S, SW, W, NW, N, E, and SE use the complete coherent figures from `build/codex-g02/generated-reference/trainer_f_*_generated_64x96.png`.
- NE was regenerated as one complete figure with OpenAI's built-in image-generation tool because the coherent-set NE put the ponytail on the wrong side. The accepted full-resolution source is preserved at `build/codex-g02/generated-reference/trainer_f_ne_whole_regenerated_source.png`.
- The eight male files were not modified in this whole-female replacement pass. SHA-256 comparison before and after the write reported `MALE-HASH-PASS 8/8 unchanged`.

## Image-generation prompt for accepted NE source

> Use case: precise-object-edit  
> Asset type: standalone Aevoria female trainer NE direction sprite source  
> Input images: the approved design board and coherent 8-direction set are style/identity references; the standalone NE images are failed targets. Regenerate the entire figure from scratch as one coherent sprite.  
> Primary request: Create the NE direction (3/4 BACK) female trainer, turned away from the viewer and facing screen-right. Show mostly the back of her head and back/right side of her torso, with only a narrow right cheek/profile. Match the NE pose in the coherent 8-direction reference.  
> Critical hair geometry: her one blue bow and one silver-white ponytail must attach on SCREEN-RIGHT. The long ponytail must form the outermost screen-right silhouette and trail down the right side behind her shoulder. The screen-left silhouette must contain only the rounded back-head hair--NO ponytail, NO bow, NO hanging hair tail on screen-left.  
> Design: exactly one continuous silver-white hair mass, exactly one blue bow, exactly one ponytail; brown goggles on head; blue scarf; cream jacket with blue accents; brown gloves, belt and pouches; dark socks; brown boots.  
> Style: crisp pixel art matching the coherent set, same chibi scale/proportions and selective outlines.  
> Composition: one complete full-body figure only, upright and centred, generous transparent margin, feet visible, no crop.  
> Constraints: truly transparent background with zero scenery, glow, shadow, gradient, black fill, or halo. No doubled/overlapping body pieces, no extra limbs/accessories/hair fragments. Do not mirror an existing whole sprite. No blur, antialiasing, text, or watermark.

An earlier NE generation attempt was rejected and is not used because it remained side/front-facing and placed the tail on screen-left.

## Whole-sprite processing

Python 3 and Pillow performed only whole-figure processing:

1. Hardened alpha to 0 or 255 and discarded the transparent generation glow/halo.
2. Cropped each complete generated figure as a single unit.
3. For NE only, reduced the complete full-resolution figure to 91 px tall with nearest-neighbour sampling; no part was processed separately.
4. Placed each complete figure, as one unit, on a transparent 64x96 canvas, horizontally centred with the last opaque foot row at y=93 (two transparent rows below).
5. Globally reduced each complete sprite to at most 48 opaque colours with dithering disabled.
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
| `trainer_f_ne_64x96.png` | `trainer_f_ne_whole_regenerated_source.png` | **Entire NE figure regenerated**, then whole-figure nearest-neighbour reduction and the same global processing. Ponytail: screen-right. |
| `trainer_f_e_64x96.png` | `trainer_f_e_generated_64x96.png` | Complete generated E figure; same whole-sprite processing. Ponytail: behind the head. |
| `trainer_f_se_64x96.png` | `trainer_f_se_generated_64x96.png` | Complete generated SE figure; same whole-sprite processing. Ponytail: screen-left. |

Final visual QA lineup: `build/codex-g02/female_final_8x.png`.
